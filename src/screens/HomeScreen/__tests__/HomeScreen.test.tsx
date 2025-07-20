import React from 'react';
import {render} from '../../../test/test-utils';
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
}); 