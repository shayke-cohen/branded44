import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useNotes} from '../context/NotesContext';
import {NotesScreen} from '../screens/NotesScreen';
import {NoteEditorScreen} from '../screens/NoteEditorScreen';

export const NotesNavigation: React.FC = () => {
  const {isCreating, isEditing} = useNotes();

  // Show editor if creating or editing a note
  if (isCreating || isEditing) {
    return <NoteEditorScreen />;
  }

  // Default to notes list
  return <NotesScreen />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 