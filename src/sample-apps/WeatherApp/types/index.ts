export interface WeatherCondition {
  id: string;
  main: string; // Clear, Clouds, Rain, Snow, Thunderstorm, etc.
  description: string; // "light rain", "broken clouds", etc.
  icon: string; // Weather icon identifier
  emoji: string; // Weather emoji for display
}

export interface Temperature {
  current: number;
  feelsLike: number;
  min: number;
  max: number;
}

export interface WeatherMetrics {
  humidity: number; // percentage
  pressure: number; // hPa
  visibility: number; // km
  uvIndex: number; // 0-11+ scale
  windSpeed: number; // km/h
  windDirection: number; // degrees
  windGust?: number; // km/h
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  startTime: Date;
  endTime: Date;
  areas: string[];
}

export interface HourlyForecast {
  time: Date;
  temperature: number;
  condition: WeatherCondition;
  precipitation: number; // percentage chance
  windSpeed: number;
}

export interface DailyForecast {
  date: Date;
  temperature: Temperature;
  condition: WeatherCondition;
  precipitation: number; // percentage chance
  windSpeed: number;
  sunrise: Date;
  sunset: Date;
}

export interface Location {
  id: string;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isCurrentLocation?: boolean;
}

export interface CurrentWeather {
  location: Location;
  condition: WeatherCondition;
  temperature: Temperature;
  metrics: WeatherMetrics;
  lastUpdated: Date;
  alerts?: WeatherAlert[];
}

export interface WeatherForecast {
  current: CurrentWeather;
  hourly: HourlyForecast[]; // Next 24 hours
  daily: DailyForecast[]; // Next 7 days
}

export interface WeatherState {
  currentForecast: WeatherForecast | null;
  savedLocations: Location[];
  selectedLocation: Location | null;
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
  searchResults: Location[];
  temperatureUnit: 'celsius' | 'fahrenheit';
  speedUnit: 'kmh' | 'mph';
}

export interface WeatherContextValue extends WeatherState {
  fetchWeather: (location: Location) => Promise<void>;
  searchLocations: (query: string) => Promise<void>;
  addSavedLocation: (location: Location) => void;
  removeSavedLocation: (locationId: string) => void;
  setTemperatureUnit: (unit: 'celsius' | 'fahrenheit') => void;
  setSpeedUnit: (unit: 'kmh' | 'mph') => void;
  getCurrentLocation: () => Promise<void>;
  refreshWeather: () => Promise<void>;
  clearError: () => void;
}

// Weather icon mappings
export const WEATHER_ICONS: Record<string, string> = {
  // Clear
  'clear-day': '☀️',
  'clear-night': '🌙',
  
  // Clouds
  'partly-cloudy-day': '⛅',
  'partly-cloudy-night': '☁️',
  'cloudy': '☁️',
  'overcast': '🌫️',
  
  // Rain
  'light-rain': '🌦️',
  'rain': '🌧️',
  'heavy-rain': '⛈️',
  'drizzle': '🌦️',
  
  // Snow
  'snow': '❄️',
  'sleet': '🌨️',
  'hail': '🧊',
  
  // Thunderstorm
  'thunderstorm': '⛈️',
  'thunderstorm-rain': '⛈️',
  
  // Atmosphere
  'mist': '🌫️',
  'fog': '🌫️',
  'smoke': '💨',
  'dust': '💨',
  'sand': '💨',
  'tornado': '🌪️',
  
  // Wind
  'windy': '💨',
};

// Severity color mappings
export const ALERT_COLORS: Record<WeatherAlert['severity'], string> = {
  minor: '#4ECDC4',
  moderate: '#45B7D1', 
  severe: '#F39C12',
  extreme: '#E74C3C',
}; 