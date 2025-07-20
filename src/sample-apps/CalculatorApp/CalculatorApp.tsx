import React from 'react';
import {CalculatorProvider} from './context/CalculatorContext';
import CalculatorNavigation from './navigation/CalculatorNavigation';

const CalculatorApp: React.FC = () => {
  return (
    <CalculatorProvider>
      <CalculatorNavigation />
    </CalculatorProvider>
  );
};

export default CalculatorApp; 