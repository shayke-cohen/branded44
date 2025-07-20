import React from 'react';
import {View, StyleSheet} from 'react-native';
import {NotesProvider} from './context/NotesContext';
import {NotesNavigation} from './navigation/NotesNavigation';

export const NotesApp: React.FC = () => {
  return (
    <NotesProvider>
      <View style={styles.container}>
        <NotesNavigation />
      </View>
    </NotesProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 