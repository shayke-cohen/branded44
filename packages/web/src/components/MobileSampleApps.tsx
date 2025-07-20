import React from 'react';
import {View, StyleSheet} from 'react-native';
import {usePreview} from '../context/PreviewContext';

// Import sample apps
import {TodoApp, NotesApp, WeatherApp, CalculatorApp} from '@mobile/sample-apps';

const MobileSampleApps: React.FC = () => {
  const {selectedSampleApp} = usePreview();

  const renderSampleApp = () => {
    switch (selectedSampleApp) {
      case 'todo':
        return <TodoApp />;
      case 'notes':
        return <NotesApp />;
      case 'weather':
        return <WeatherApp />;
      case 'calculator':
        return <CalculatorApp />;
      default:
        return <TodoApp />;
    }
  };

  return (
    <View style={styles.container}>
      {renderSampleApp()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MobileSampleApps; 