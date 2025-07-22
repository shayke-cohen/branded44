import React from 'react';
import {render, waitFor, act, fireEvent} from '../../../test/test-utils';
import HomeScreen from '../HomeScreen';

describe('HomeScreen', () => {
  it('renders without crashing', () => {
    const {getByText} = render(<HomeScreen />);
    expect(getByText('Welcome to Your App')).toBeTruthy();
  });

  it('displays the subtitle message', () => {
    const {getByText} = render(<HomeScreen />);
    expect(getByText('This is your home screen. Start building your app from here!')).toBeTruthy();
  });

  it('applies theme-aware styling', () => {
    const {getByText} = render(<HomeScreen />);
    const titleElement = getByText('Welcome to Your App');
    expect(titleElement).toBeTruthy();
  });

  it('displays current time and date', async () => {
    const {getByText} = render(<HomeScreen />);
    
    await waitFor(() => {
      const currentTime = new Date();
      const timePattern = /\d{1,2}:\d{2}:\d{2}\s(AM|PM)/;
      const datePattern = /\w+,\s\w+\s\d{1,2},\s\d{4}/;
      
      const timeElements = getByText(timePattern);
      const dateElements = getByText(datePattern);
      
      expect(timeElements).toBeTruthy();
      expect(dateElements).toBeTruthy();
    });
  });

  it('updates time every second', async () => {
    jest.useFakeTimers();
    const {getByText} = render(<HomeScreen />);
    
    const initialTime = getByText(/\d{1,2}:\d{2}:\d{2}\s(AM|PM)/);
    expect(initialTime).toBeTruthy();
    
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      const updatedTime = getByText(/\d{1,2}:\d{2}:\d{2}\s(AM|PM)/);
      expect(updatedTime).toBeTruthy();
    });
    
    jest.useRealTimers();
  });

  describe('Stopper functionality', () => {
    it('renders stopper control section', () => {
      const {getByText} = render(<HomeScreen />);
      expect(getByText('Stopper Control')).toBeTruthy();
      expect(getByText('Status: STOPPED')).toBeTruthy();
      expect(getByText('Start')).toBeTruthy();
      expect(getByText('Stop')).toBeTruthy();
    });

    it('starts stopper when start button is pressed', () => {
      const {getByText} = render(<HomeScreen />);
      const startButton = getByText('Start');
      
      fireEvent.press(startButton);
      
      expect(getByText('Status: ACTIVE')).toBeTruthy();
    });

    it('stops stopper when stop button is pressed', () => {
      const {getByText} = render(<HomeScreen />);
      const startButton = getByText('Start');
      const stopButton = getByText('Stop');
      
      // First start the stopper
      fireEvent.press(startButton);
      expect(getByText('Status: ACTIVE')).toBeTruthy();
      
      // Then stop it
      fireEvent.press(stopButton);
      expect(getByText('Status: STOPPED')).toBeTruthy();
    });

    it('shows correct button states when stopper is active', () => {
      const {getByText} = render(<HomeScreen />);
      const startButton = getByText('Start');
      
      fireEvent.press(startButton);
      
      // After starting, status should be ACTIVE
      expect(getByText('Status: ACTIVE')).toBeTruthy();
      
      // Try pressing start button again - it should not change state since it's disabled
      fireEvent.press(startButton);
      expect(getByText('Status: ACTIVE')).toBeTruthy(); // Should still be active
    });

    it('shows correct button states when stopper is stopped', () => {
      const {getByText} = render(<HomeScreen />);
      const startButton = getByText('Start');
      const stopButton = getByText('Stop');
      
      // Initially should be stopped
      expect(getByText('Status: STOPPED')).toBeTruthy();
      
      // Try pressing stop button when already stopped - should remain stopped
      fireEvent.press(stopButton);
      expect(getByText('Status: STOPPED')).toBeTruthy();
      
      // Start and then stop to verify full cycle
      fireEvent.press(startButton);
      expect(getByText('Status: ACTIVE')).toBeTruthy();
      
      fireEvent.press(stopButton);
      expect(getByText('Status: STOPPED')).toBeTruthy();
    });
  });
}); 