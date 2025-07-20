import React from 'react';
import {WeatherProvider} from './context/WeatherContext';
import WeatherNavigation from './navigation/WeatherNavigation';

const WeatherApp: React.FC = () => {
  return (
    <WeatherProvider>
      <WeatherNavigation />
    </WeatherProvider>
  );
};

export default WeatherApp; 