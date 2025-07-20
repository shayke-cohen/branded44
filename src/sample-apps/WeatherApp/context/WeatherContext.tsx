import React, {createContext, useContext, useReducer, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  WeatherState,
  WeatherContextValue,
  WeatherForecast,
  Location,
  CurrentWeather,
  WeatherCondition,
  Temperature,
  WeatherMetrics,
  HourlyForecast,
  DailyForecast,
  WeatherAlert,
  WEATHER_ICONS,
} from '../types';

const STORAGE_KEYS = {
  SAVED_LOCATIONS: '@WeatherApp:savedLocations',
  PREFERENCES: '@WeatherApp:preferences',
  WEATHER_CACHE: '@WeatherApp:weatherCache',
};

type WeatherAction =
  | {type: 'SET_LOADING'; payload: boolean}
  | {type: 'SET_ERROR'; payload: string | null}
  | {type: 'SET_CURRENT_FORECAST'; payload: WeatherForecast}
  | {type: 'SET_SELECTED_LOCATION'; payload: Location}
  | {type: 'SET_SAVED_LOCATIONS'; payload: Location[]}
  | {type: 'ADD_SAVED_LOCATION'; payload: Location}
  | {type: 'REMOVE_SAVED_LOCATION'; payload: string}
  | {type: 'SET_SEARCH_RESULTS'; payload: Location[]}
  | {type: 'SET_TEMPERATURE_UNIT'; payload: 'celsius' | 'fahrenheit'}
  | {type: 'SET_SPEED_UNIT'; payload: 'kmh' | 'mph'}
  | {type: 'SET_LAST_FETCH'; payload: Date};

const initialState: WeatherState = {
  currentForecast: null,
  savedLocations: [],
  selectedLocation: null,
  loading: false,
  error: null,
  lastFetch: null,
  searchResults: [],
  temperatureUnit: 'celsius',
  speedUnit: 'kmh',
};

// Mock weather data generator
const generateMockWeatherData = (location: Location): WeatherForecast => {
  const now = new Date();
  const isDay = now.getHours() >= 6 && now.getHours() < 18;
  
  // Weather conditions pool
  const conditions: Omit<WeatherCondition, 'id'>[] = [
    {main: 'Clear', description: 'clear sky', icon: isDay ? 'clear-day' : 'clear-night', emoji: isDay ? '☀️' : '🌙'},
    {main: 'Clouds', description: 'partly cloudy', icon: isDay ? 'partly-cloudy-day' : 'partly-cloudy-night', emoji: '⛅'},
    {main: 'Clouds', description: 'overcast clouds', icon: 'cloudy', emoji: '☁️'},
    {main: 'Rain', description: 'light rain', icon: 'light-rain', emoji: '🌦️'},
    {main: 'Rain', description: 'moderate rain', icon: 'rain', emoji: '🌧️'},
    {main: 'Thunderstorm', description: 'thunderstorm', icon: 'thunderstorm', emoji: '⛈️'},
    {main: 'Snow', description: 'light snow', icon: 'snow', emoji: '❄️'},
    {main: 'Mist', description: 'mist', icon: 'mist', emoji: '🌫️'},
  ];

  // Select random condition based on location and season
  const conditionIndex = Math.abs(location.latitude + location.longitude + now.getDate()) % conditions.length;
  const baseCondition = conditions[conditionIndex];
  
  const condition: WeatherCondition = {
    id: `${baseCondition.main.toLowerCase()}-${now.getTime()}`,
    ...baseCondition,
  };

  // Generate realistic temperature based on location
  const latitudeEffect = Math.abs(location.latitude) / 90; // 0-1, higher means colder
  const seasonEffect = Math.sin((now.getMonth() / 12) * 2 * Math.PI); // -1 to 1
  const baseTemp = 20 - (latitudeEffect * 30) + (seasonEffect * 15);
  const tempVariation = (Math.random() - 0.5) * 10;
  const currentTemp = Math.round(baseTemp + tempVariation);

  const temperature: Temperature = {
    current: currentTemp,
    feelsLike: currentTemp + Math.round((Math.random() - 0.5) * 5),
    min: currentTemp - Math.round(Math.random() * 8 + 2),
    max: currentTemp + Math.round(Math.random() * 8 + 2),
  };

  const metrics: WeatherMetrics = {
    humidity: Math.round(Math.random() * 40 + 30), // 30-70%
    pressure: Math.round(Math.random() * 50 + 1000), // 1000-1050 hPa
    visibility: Math.round(Math.random() * 15 + 5), // 5-20 km
    uvIndex: Math.round(Math.random() * 11), // 0-11
    windSpeed: Math.round(Math.random() * 30 + 5), // 5-35 km/h
    windDirection: Math.round(Math.random() * 360), // 0-360 degrees
    windGust: Math.random() > 0.5 ? Math.round(Math.random() * 20 + 10) : undefined,
  };

  // Generate alerts for severe weather
  const alerts: WeatherAlert[] = [];
  if (condition.main === 'Thunderstorm' || condition.main === 'Snow' || metrics.windSpeed > 25) {
    alerts.push({
      id: `alert-${now.getTime()}`,
      title: condition.main === 'Thunderstorm' ? 'Thunderstorm Warning' : 
             condition.main === 'Snow' ? 'Winter Weather Advisory' : 'Wind Advisory',
      description: `${condition.description} expected in your area. Please take necessary precautions.`,
      severity: condition.main === 'Thunderstorm' ? 'severe' : 'moderate',
      startTime: now,
      endTime: new Date(now.getTime() + 6 * 60 * 60 * 1000), // 6 hours
      areas: [location.region, location.name],
    });
  }

  const currentWeather: CurrentWeather = {
    location,
    condition,
    temperature,
    metrics,
    lastUpdated: now,
    alerts: alerts.length > 0 ? alerts : undefined,
  };

  // Generate hourly forecast (next 24 hours)
  const hourly: HourlyForecast[] = [];
  for (let i = 1; i <= 24; i++) {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hourTemp = currentTemp + Math.round((Math.random() - 0.5) * 6);
    const hourCondition = i < 6 ? condition : conditions[Math.abs((conditionIndex + i) % conditions.length)];
    
    hourly.push({
      time,
      temperature: hourTemp,
      condition: {
        id: `${hourCondition.main.toLowerCase()}-${time.getTime()}`,
        ...hourCondition,
      },
      precipitation: Math.round(Math.random() * 100),
      windSpeed: Math.round(Math.random() * 25 + 5),
    });
  }

  // Generate daily forecast (next 7 days)
  const daily: DailyForecast[] = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const dayTemp = currentTemp + Math.round((Math.random() - 0.5) * 10);
    const dayCondition = conditions[Math.abs((conditionIndex + i) % conditions.length)];
    
    const sunrise = new Date(date);
    sunrise.setHours(6, Math.round(Math.random() * 60), 0, 0);
    
    const sunset = new Date(date);
    sunset.setHours(18, Math.round(Math.random() * 60), 0, 0);
    
    daily.push({
      date,
      temperature: {
        current: dayTemp,
        feelsLike: dayTemp + Math.round((Math.random() - 0.5) * 3),
        min: dayTemp - Math.round(Math.random() * 8 + 3),
        max: dayTemp + Math.round(Math.random() * 8 + 3),
      },
      condition: {
        id: `${dayCondition.main.toLowerCase()}-${date.getTime()}`,
        ...dayCondition,
      },
      precipitation: Math.round(Math.random() * 100),
      windSpeed: Math.round(Math.random() * 25 + 5),
      sunrise,
      sunset,
    });
  }

  return {
    current: currentWeather,
    hourly,
    daily,
  };
};

// Mock locations database
const MOCK_LOCATIONS: Location[] = [
  {id: 'nyc', name: 'New York', region: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York'},
  {id: 'london', name: 'London', region: 'England', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London'},
  {id: 'tokyo', name: 'Tokyo', region: 'Tokyo Prefecture', country: 'Japan', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo'},
  {id: 'paris', name: 'Paris', region: 'Île-de-France', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris'},
  {id: 'sydney', name: 'Sydney', region: 'New South Wales', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney'},
  {id: 'toronto', name: 'Toronto', region: 'Ontario', country: 'Canada', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto'},
  {id: 'mumbai', name: 'Mumbai', region: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777, timezone: 'Asia/Kolkata'},
  {id: 'dubai', name: 'Dubai', region: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai'},
  {id: 'berlin', name: 'Berlin', region: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050, timezone: 'Europe/Berlin'},
  {id: 'singapore', name: 'Singapore', region: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore'},
  {id: 'losangeles', name: 'Los Angeles', region: 'California', country: 'United States', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles'},
  {id: 'chicago', name: 'Chicago', region: 'Illinois', country: 'United States', latitude: 41.8781, longitude: -87.6298, timezone: 'America/Chicago'},
];

const weatherReducer = (state: WeatherState, action: WeatherAction): WeatherState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {...state, loading: action.payload};
    case 'SET_ERROR':
      return {...state, error: action.payload, loading: false};
    case 'SET_CURRENT_FORECAST':
      return {...state, currentForecast: action.payload, loading: false, error: null};
    case 'SET_SELECTED_LOCATION':
      return {...state, selectedLocation: action.payload};
    case 'SET_SAVED_LOCATIONS':
      return {...state, savedLocations: action.payload};
    case 'ADD_SAVED_LOCATION':
      if (state.savedLocations.find(loc => loc.id === action.payload.id)) {
        return state; // Location already saved
      }
      return {...state, savedLocations: [...state.savedLocations, action.payload]};
    case 'REMOVE_SAVED_LOCATION':
      return {...state, savedLocations: state.savedLocations.filter(loc => loc.id !== action.payload)};
    case 'SET_SEARCH_RESULTS':
      return {...state, searchResults: action.payload};
    case 'SET_TEMPERATURE_UNIT':
      return {...state, temperatureUnit: action.payload};
    case 'SET_SPEED_UNIT':
      return {...state, speedUnit: action.payload};
    case 'SET_LAST_FETCH':
      return {...state, lastFetch: action.payload};
    default:
      return state;
  }
};

const WeatherContext = createContext<WeatherContextValue | undefined>(undefined);

export const WeatherProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [state, dispatch] = useReducer(weatherReducer, initialState);

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  // Save preferences whenever they change
  useEffect(() => {
    savePreferences();
  }, [state.temperatureUnit, state.speedUnit]);

  // Save locations whenever they change
  useEffect(() => {
    if (state.savedLocations.length > 0) {
      saveSavedLocations();
    }
  }, [state.savedLocations]);

  const loadSavedData = async () => {
    try {
      // Load saved locations
      const locationsJson = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_LOCATIONS);
      if (locationsJson) {
        const locations = JSON.parse(locationsJson);
        dispatch({type: 'SET_SAVED_LOCATIONS', payload: locations});
      }

      // Load preferences
      const preferencesJson = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (preferencesJson) {
        const preferences = JSON.parse(preferencesJson);
        dispatch({type: 'SET_TEMPERATURE_UNIT', payload: preferences.temperatureUnit || 'celsius'});
        dispatch({type: 'SET_SPEED_UNIT', payload: preferences.speedUnit || 'kmh'});
      }

      // Set default location (New York) if no location selected
      if (!state.selectedLocation) {
        const defaultLocation = MOCK_LOCATIONS[0]; // New York
        dispatch({type: 'SET_SELECTED_LOCATION', payload: defaultLocation});
        fetchWeather(defaultLocation);
      }
    } catch (error) {
      console.error('Failed to load saved data:', error);
    }
  };

  const saveSavedLocations = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_LOCATIONS, JSON.stringify(state.savedLocations));
    } catch (error) {
      console.error('Failed to save locations:', error);
    }
  };

  const savePreferences = async () => {
    try {
      const preferences = {
        temperatureUnit: state.temperatureUnit,
        speedUnit: state.speedUnit,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const fetchWeather = async (location: Location) => {
    try {
      dispatch({type: 'SET_LOADING', payload: true});
      dispatch({type: 'SET_ERROR', payload: null});
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate mock weather data
      const forecast = generateMockWeatherData(location);
      
      dispatch({type: 'SET_CURRENT_FORECAST', payload: forecast});
      dispatch({type: 'SET_SELECTED_LOCATION', payload: location});
      dispatch({type: 'SET_LAST_FETCH', payload: new Date()});
      
    } catch (error) {
      dispatch({type: 'SET_ERROR', payload: 'Failed to fetch weather data'});
    }
  };

  const searchLocations = async (query: string) => {
    try {
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const results = MOCK_LOCATIONS.filter(location =>
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.region.toLowerCase().includes(query.toLowerCase()) ||
        location.country.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8); // Limit to 8 results
      
      dispatch({type: 'SET_SEARCH_RESULTS', payload: results});
    } catch (error) {
      console.error('Failed to search locations:', error);
    }
  };

  const addSavedLocation = (location: Location) => {
    dispatch({type: 'ADD_SAVED_LOCATION', payload: location});
  };

  const removeSavedLocation = (locationId: string) => {
    dispatch({type: 'REMOVE_SAVED_LOCATION', payload: locationId});
  };

  const setTemperatureUnit = (unit: 'celsius' | 'fahrenheit') => {
    dispatch({type: 'SET_TEMPERATURE_UNIT', payload: unit});
  };

  const setSpeedUnit = (unit: 'kmh' | 'mph') => {
    dispatch({type: 'SET_SPEED_UNIT', payload: unit});
  };

  const getCurrentLocation = async () => {
    try {
      dispatch({type: 'SET_LOADING', payload: true});
      
      // Simulate getting current location (would use real geolocation in actual app)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use Toronto as mock current location
      const currentLocation: Location = {
        ...MOCK_LOCATIONS[5], // Toronto
        isCurrentLocation: true,
      };
      
      await fetchWeather(currentLocation);
    } catch (error) {
      dispatch({type: 'SET_ERROR', payload: 'Failed to get current location'});
    }
  };

  const refreshWeather = async () => {
    if (state.selectedLocation) {
      await fetchWeather(state.selectedLocation);
    }
  };

  const clearError = () => {
    dispatch({type: 'SET_ERROR', payload: null});
  };

  const value: WeatherContextValue = {
    ...state,
    fetchWeather,
    searchLocations,
    addSavedLocation,
    removeSavedLocation,
    setTemperatureUnit,
    setSpeedUnit,
    getCurrentLocation,
    refreshWeather,
    clearError,
  };

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
};

export const useWeather = (): WeatherContextValue => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}; 