import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert,
  FlatList,
} from 'react-native';
import {useTheme} from '../../../context';
import {useWeather} from '../context/WeatherContext';
import {Location, WeatherAlert, HourlyForecast, DailyForecast, ALERT_COLORS} from '../types';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const WeatherScreen: React.FC = () => {
  const {theme} = useTheme();
  const {
    currentForecast,
    selectedLocation,
    loading,
    error,
    searchResults,
    savedLocations,
    temperatureUnit,
    speedUnit,
    fetchWeather,
    searchLocations,
    addSavedLocation,
    removeSavedLocation,
    getCurrentLocation,
    refreshWeather,
    clearError,
    setTemperatureUnit,
    setSpeedUnit,
  } = useWeather();

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchLocations(searchQuery);
    }
  }, [searchQuery]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshWeather();
    setRefreshing(false);
  };

  const handleLocationSelect = async (location: Location) => {
    setShowSearch(false);
    setSearchQuery('');
    await fetchWeather(location);
  };

  const handleSaveLocation = (location: Location) => {
    const isAlreadySaved = savedLocations.some(loc => loc.id === location.id);
    if (isAlreadySaved) {
      removeSavedLocation(location.id);
    } else {
      addSavedLocation(location);
    }
  };

  const convertTemperature = (temp: number): number => {
    return temperatureUnit === 'fahrenheit' ? Math.round(temp * 9/5 + 32) : temp;
  };

  const convertSpeed = (speed: number): number => {
    return speedUnit === 'mph' ? Math.round(speed * 0.621371) : speed;
  };

  const getTemperatureUnit = (): string => {
    return temperatureUnit === 'fahrenheit' ? '°F' : '°C';
  };

  const getSpeedUnit = (): string => {
    return speedUnit === 'mph' ? 'mph' : 'km/h';
  };

  const getWeatherGradient = (condition: string): string[] => {
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 18;

    switch (condition.toLowerCase()) {
      case 'clear':
        return isDay ? ['#87CEEB', '#87CEFA', '#B0E0E6'] : ['#2C3E50', '#34495E', '#2C3E50'];
      case 'clouds':
        return isDay ? ['#BDC3C7', '#D5DBDB', '#ECF0F1'] : ['#34495E', '#2C3E50', '#212F3D'];
      case 'rain':
        return ['#5DADE2', '#85C1E9', '#AED6F1'];
      case 'thunderstorm':
        return ['#5B2C6F', '#8E44AD', '#A569BD'];
      case 'snow':
        return ['#D5DBDB', '#EAEDED', '#F8F9FA'];
      case 'mist':
      case 'fog':
        return ['#BDC3C7', '#D5DBDB', '#E8DAEF'];
      default:
        return isDay ? ['#87CEEB', '#87CEFA', '#B0E0E6'] : ['#2C3E50', '#34495E', '#2C3E50'];
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'});
    }
  };

  const renderWeatherAlert = (alert: WeatherAlert) => (
    <View key={alert.id} style={[styles.alertContainer, {borderLeftColor: ALERT_COLORS[alert.severity]}]}>
      <Text style={[styles.alertTitle, {color: theme.colors.text}]}>{alert.title}</Text>
      <Text style={[styles.alertDescription, {color: theme.colors.textSecondary}]}>
        {alert.description}
      </Text>
      <Text style={[styles.alertTime, {color: theme.colors.textSecondary}]}>
        Until {formatTime(alert.endTime)}
      </Text>
    </View>
  );

  const renderHourlyItem = ({item}: {item: HourlyForecast}) => (
    <View style={styles.hourlyItem}>
      <Text style={[styles.hourlyTime, {color: theme.colors.textSecondary}]}>
        {formatTime(item.time)}
      </Text>
      <Text style={styles.hourlyEmoji}>{item.condition.emoji}</Text>
      <Text style={[styles.hourlyTemp, {color: theme.colors.text}]}>
        {convertTemperature(item.temperature)}{getTemperatureUnit()}
      </Text>
      <Text style={[styles.hourlyPrecip, {color: theme.colors.primary}]}>
        {item.precipitation}%
      </Text>
    </View>
  );

  const renderDailyItem = ({item}: {item: DailyForecast}) => (
    <TouchableOpacity style={[styles.dailyItem, {backgroundColor: theme.colors.surface}]}>
      <Text style={[styles.dailyDate, {color: theme.colors.text}]}>
        {formatDate(item.date)}
      </Text>
      <View style={styles.dailyCondition}>
        <Text style={styles.dailyEmoji}>{item.condition.emoji}</Text>
        <Text style={[styles.dailyDescription, {color: theme.colors.textSecondary}]}>
          {item.condition.description}
        </Text>
      </View>
      <View style={styles.dailyTemp}>
        <Text style={[styles.dailyTempHigh, {color: theme.colors.text}]}>
          {convertTemperature(item.temperature.max)}°
        </Text>
        <Text style={[styles.dailyTempLow, {color: theme.colors.textSecondary}]}>
          {convertTemperature(item.temperature.min)}°
        </Text>
      </View>
      <Text style={[styles.dailyPrecip, {color: theme.colors.primary}]}>
        {item.precipitation}%
      </Text>
    </TouchableOpacity>
  );

  const renderLocationItem = ({item}: {item: Location}) => {
    const isCurrentLocation = item.isCurrentLocation;
    const isSaved = savedLocations.some(loc => loc.id === item.id);

    return (
      <TouchableOpacity
        style={[styles.locationItem, {backgroundColor: theme.colors.surface}]}
        onPress={() => handleLocationSelect(item)}>
        <View style={styles.locationInfo}>
          <Text style={[styles.locationName, {color: theme.colors.text}]}>
            {item.name} {isCurrentLocation ? '📍' : ''}
          </Text>
          <Text style={[styles.locationRegion, {color: theme.colors.textSecondary}]}>
            {item.region}, {item.country}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => handleSaveLocation(item)}>
          <Text style={styles.saveButtonText}>{isSaved ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const gradientColors = currentForecast ? getWeatherGradient(currentForecast.current.condition.main) : ['#87CEEB', '#87CEFA', '#B0E0E6'];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 20,
    },
    retryButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      paddingTop: 60,
      backgroundColor: gradientColors[0],
    },
    locationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    locationText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#fff',
      marginLeft: 8,
    },
    headerButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      marginLeft: 8,
    },
    headerButtonText: {
      fontSize: 20,
    },
    currentWeather: {
      padding: 20,
      alignItems: 'center',
      backgroundColor: gradientColors[1],
    },
    currentTemp: {
      fontSize: 72,
      fontWeight: '200',
      color: '#fff',
      textAlign: 'center',
    },
    currentCondition: {
      fontSize: 24,
      color: '#fff',
      textAlign: 'center',
      marginBottom: 4,
    },
    currentDescription: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
      textTransform: 'capitalize',
    },
    tempRange: {
      flexDirection: 'row',
      marginTop: 8,
    },
    tempRangeText: {
      fontSize: 18,
      color: 'rgba(255, 255, 255, 0.8)',
      marginHorizontal: 8,
    },
    metricsContainer: {
      backgroundColor: gradientColors[2],
      padding: 16,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    metricItem: {
      width: '48%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    metricLabel: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.7)',
      textTransform: 'uppercase',
    },
    metricValue: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
      marginTop: 2,
    },
    alertsContainer: {
      backgroundColor: theme.colors.background,
      padding: 16,
    },
    alertContainer: {
      backgroundColor: theme.colors.surface,
      padding: 12,
      borderRadius: 8,
      borderLeftWidth: 4,
      marginBottom: 8,
    },
    alertTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    alertDescription: {
      fontSize: 14,
      marginBottom: 4,
    },
    alertTime: {
      fontSize: 12,
    },
    sectionContainer: {
      backgroundColor: theme.colors.background,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    hourlyContainer: {
      height: 120,
    },
    hourlyItem: {
      alignItems: 'center',
      marginRight: 16,
      padding: 8,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      width: 60,
    },
    hourlyTime: {
      fontSize: 12,
      marginBottom: 4,
    },
    hourlyEmoji: {
      fontSize: 24,
      marginBottom: 4,
    },
    hourlyTemp: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 2,
    },
    hourlyPrecip: {
      fontSize: 10,
    },
    dailyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    dailyDate: {
      fontSize: 16,
      fontWeight: '500',
      width: 80,
    },
    dailyCondition: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    dailyEmoji: {
      fontSize: 24,
      marginRight: 8,
    },
    dailyDescription: {
      fontSize: 14,
      textTransform: 'capitalize',
    },
    dailyTemp: {
      flexDirection: 'row',
      alignItems: 'center',
      width: 80,
      justifyContent: 'flex-end',
    },
    dailyTempHigh: {
      fontSize: 16,
      fontWeight: '600',
      marginRight: 8,
    },
    dailyTempLow: {
      fontSize: 14,
    },
    dailyPrecip: {
      fontSize: 12,
      width: 40,
      textAlign: 'right',
    },
    // Modal styles
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      flex: 1,
      backgroundColor: theme.colors.background,
      marginTop: 50,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    closeButton: {
      padding: 8,
    },
    closeButtonText: {
      fontSize: 18,
      color: theme.colors.primary,
    },
    searchContainer: {
      padding: 16,
    },
    searchInput: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 16,
    },
    locationItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    locationInfo: {
      flex: 1,
    },
    locationName: {
      fontSize: 16,
      fontWeight: '600',
    },
    locationRegion: {
      fontSize: 14,
      marginTop: 2,
    },
    saveButton: {
      padding: 8,
    },
    saveButtonText: {
      fontSize: 20,
    },
    settingsContainer: {
      padding: 16,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      marginBottom: 8,
    },
    settingLabel: {
      fontSize: 16,
      color: theme.colors.text,
    },
    settingButtons: {
      flexDirection: 'row',
    },
    settingButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      marginLeft: 8,
    },
    settingButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    settingButtonInactive: {
      backgroundColor: theme.colors.border,
    },
    settingButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    settingButtonTextActive: {
      color: '#fff',
    },
    settingButtonTextInactive: {
      color: theme.colors.textSecondary,
    },
    savedLocationsList: {
      maxHeight: 200,
    },
    savedLocationsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
  });

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={[styles.errorText, {color: theme.colors.error}]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, {backgroundColor: theme.colors.primary}]}
          onPress={clearError}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentForecast || loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, {color: theme.colors.textSecondary}]}>
          Loading weather data...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => setShowSearch(true)}
          testID="location-button">
          <Text style={styles.headerButtonText}>📍</Text>
          <Text style={styles.locationText}>
            {selectedLocation?.name || 'Select Location'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={getCurrentLocation}
          testID="current-location-button">
          <Text style={styles.headerButtonText}>🎯</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowSettings(true)}
          testID="settings-button">
          <Text style={styles.headerButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#fff"
          />
        }>
        {/* Current Weather */}
        <View style={styles.currentWeather}>
          <Text style={styles.currentCondition}>
            {currentForecast.current.condition.emoji}
          </Text>
          <Text style={styles.currentTemp}>
            {convertTemperature(currentForecast.current.temperature.current)}{getTemperatureUnit()}
          </Text>
          <Text style={styles.currentDescription}>
            {currentForecast.current.condition.description}
          </Text>
          <View style={styles.tempRange}>
            <Text style={styles.tempRangeText}>
              H: {convertTemperature(currentForecast.current.temperature.max)}{getTemperatureUnit()}
            </Text>
            <Text style={styles.tempRangeText}>
              L: {convertTemperature(currentForecast.current.temperature.min)}{getTemperatureUnit()}
            </Text>
          </View>
        </View>

        {/* Weather Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Feels Like</Text>
              <Text style={styles.metricValue}>
                {convertTemperature(currentForecast.current.temperature.feelsLike)}{getTemperatureUnit()}
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Humidity</Text>
              <Text style={styles.metricValue}>
                {currentForecast.current.metrics.humidity}%
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Wind</Text>
              <Text style={styles.metricValue}>
                {convertSpeed(currentForecast.current.metrics.windSpeed)} {getSpeedUnit()}
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>UV Index</Text>
              <Text style={styles.metricValue}>
                {currentForecast.current.metrics.uvIndex}
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Pressure</Text>
              <Text style={styles.metricValue}>
                {currentForecast.current.metrics.pressure} hPa
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Visibility</Text>
              <Text style={styles.metricValue}>
                {currentForecast.current.metrics.visibility} km
              </Text>
            </View>
          </View>
        </View>

        {/* Weather Alerts */}
        {currentForecast.current.alerts && currentForecast.current.alerts.length > 0 && (
          <View style={styles.alertsContainer}>
            {currentForecast.current.alerts.map(renderWeatherAlert)}
          </View>
        )}

        {/* Hourly Forecast */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Hourly Forecast</Text>
          <FlatList
            data={currentForecast.hourly.slice(0, 12)}
            renderItem={renderHourlyItem}
            keyExtractor={(item) => item.time.getTime().toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.hourlyContainer}
          />
        </View>

        {/* 7-Day Forecast */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>7-Day Forecast</Text>
          <FlatList
            data={currentForecast.daily}
            renderItem={renderDailyItem}
            keyExtractor={(item) => item.date.getTime().toString()}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* Location Search Modal */}
      <Modal visible={showSearch} animationType="slide" presentationStyle="overFullScreen">
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Locations</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSearch(false)}
                testID="close-search">
                <Text style={styles.closeButtonText}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a city..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                testID="search-input"
              />

              {savedLocations.length > 0 && (
                <>
                  <Text style={styles.savedLocationsTitle}>Saved Locations</Text>
                  <FlatList
                    data={savedLocations}
                    renderItem={renderLocationItem}
                    keyExtractor={(item) => item.id}
                    style={styles.savedLocationsList}
                  />
                </>
              )}

              <FlatList
                data={searchResults}
                renderItem={renderLocationItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="slide" presentationStyle="overFullScreen">
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSettings(false)}
                testID="close-settings">
                <Text style={styles.closeButtonText}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingsContainer}>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Temperature Unit</Text>
                <View style={styles.settingButtons}>
                  <TouchableOpacity
                    style={[
                      styles.settingButton,
                      temperatureUnit === 'celsius' ? styles.settingButtonActive : styles.settingButtonInactive,
                    ]}
                    onPress={() => setTemperatureUnit('celsius')}
                    testID="celsius-button">
                    <Text
                      style={[
                        styles.settingButtonText,
                        temperatureUnit === 'celsius' ? styles.settingButtonTextActive : styles.settingButtonTextInactive,
                      ]}>
                      °C
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.settingButton,
                      temperatureUnit === 'fahrenheit' ? styles.settingButtonActive : styles.settingButtonInactive,
                    ]}
                    onPress={() => setTemperatureUnit('fahrenheit')}
                    testID="fahrenheit-button">
                    <Text
                      style={[
                        styles.settingButtonText,
                        temperatureUnit === 'fahrenheit' ? styles.settingButtonTextActive : styles.settingButtonTextInactive,
                      ]}>
                      °F
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Wind Speed Unit</Text>
                <View style={styles.settingButtons}>
                  <TouchableOpacity
                    style={[
                      styles.settingButton,
                      speedUnit === 'kmh' ? styles.settingButtonActive : styles.settingButtonInactive,
                    ]}
                    onPress={() => setSpeedUnit('kmh')}
                    testID="kmh-button">
                    <Text
                      style={[
                        styles.settingButtonText,
                        speedUnit === 'kmh' ? styles.settingButtonTextActive : styles.settingButtonTextInactive,
                      ]}>
                      km/h
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.settingButton,
                      speedUnit === 'mph' ? styles.settingButtonActive : styles.settingButtonInactive,
                    ]}
                    onPress={() => setSpeedUnit('mph')}
                    testID="mph-button">
                    <Text
                      style={[
                        styles.settingButtonText,
                        speedUnit === 'mph' ? styles.settingButtonTextActive : styles.settingButtonTextInactive,
                      ]}>
                      mph
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WeatherScreen; 