import React, {createContext, useContext, useReducer, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CalculatorState, CalculatorOperation, CalculationHistory} from '../types';

const STORAGE_KEY = '@CalculatorApp:history';

interface CalculatorContextValue extends CalculatorState {
  inputNumber: (num: string) => void;
  inputOperation: (operation: CalculatorOperation) => void;
  calculate: () => void;
  clear: () => void;
  clearEntry: () => void;
  backspace: () => void;
  toggleSign: () => void;
  percent: () => void;
  squareRoot: () => void;
  memoryClear: () => void;
  memoryRecall: () => void;
  memoryAdd: () => void;
  memorySubtract: () => void;
  clearHistory: () => void;
}

type CalculatorAction =
  | {type: 'INPUT_NUMBER'; payload: string}
  | {type: 'INPUT_OPERATION'; payload: CalculatorOperation}
  | {type: 'CALCULATE'}
  | {type: 'CLEAR'}
  | {type: 'CLEAR_ENTRY'}
  | {type: 'BACKSPACE'}
  | {type: 'TOGGLE_SIGN'}
  | {type: 'PERCENT'}
  | {type: 'SQUARE_ROOT'}
  | {type: 'MEMORY_CLEAR'}
  | {type: 'MEMORY_RECALL'}
  | {type: 'MEMORY_ADD'}
  | {type: 'MEMORY_SUBTRACT'}
  | {type: 'SET_HISTORY'; payload: CalculationHistory[]}
  | {type: 'ADD_HISTORY'; payload: CalculationHistory}
  | {type: 'CLEAR_HISTORY'}
  | {type: 'SET_ERROR'; payload: string}
  | {type: 'CLEAR_ERROR'};

const initialState: CalculatorState = {
  display: '0',
  previousValue: null,
  operation: null,
  waitingForOperand: false,
  memory: 0,
  history: [],
  hasError: false,
};

const performCalculation = (prev: number, current: number, operation: CalculatorOperation): number => {
  switch (operation) {
    case '+':
      return prev + current;
    case '-':
      return prev - current;
    case '*':
      return prev * current;
    case '/':
      if (current === 0) {
        throw new Error('Cannot divide by zero');
      }
      return prev / current;
    case '%':
      return prev % current;
    default:
      return current;
  }
};

const formatNumber = (num: number): string => {
  if (num === Math.floor(num)) {
    return num.toString();
  }
  
  // Round to 10 decimal places to avoid floating point issues
  const rounded = Math.round(num * 10000000000) / 10000000000;
  return rounded.toString();
};

const calculatorReducer = (state: CalculatorState, action: CalculatorAction): CalculatorState => {
  switch (action.type) {
    case 'INPUT_NUMBER': {
      if (state.hasError) {
        return {
          ...initialState,
          display: action.payload,
          waitingForOperand: false,
        };
      }

      if (state.waitingForOperand) {
        return {
          ...state,
          display: action.payload,
          waitingForOperand: false,
        };
      }

      if (state.display === '0') {
        return {
          ...state,
          display: action.payload,
        };
      }

      return {
        ...state,
        display: state.display + action.payload,
      };
    }

    case 'INPUT_OPERATION': {
      const currentValue = parseFloat(state.display);

      if (state.hasError) {
        return {
          ...initialState,
          display: formatNumber(currentValue),
          previousValue: currentValue,
          operation: action.payload,
          waitingForOperand: true,
        };
      }

      if (state.previousValue === null) {
        return {
          ...state,
          previousValue: currentValue,
          operation: action.payload,
          waitingForOperand: true,
        };
      }

      if (state.operation && !state.waitingForOperand) {
        try {
          const result = performCalculation(state.previousValue, currentValue, state.operation);
          return {
            ...state,
            display: formatNumber(result),
            previousValue: result,
            operation: action.payload,
            waitingForOperand: true,
          };
        } catch (error) {
          return {
            ...state,
            hasError: true,
            errorMessage: error instanceof Error ? error.message : 'Error',
            display: 'Error',
          };
        }
      }

      return {
        ...state,
        operation: action.payload,
        waitingForOperand: true,
      };
    }

    case 'CALCULATE': {
      const currentValue = parseFloat(state.display);

      if (state.previousValue === null || !state.operation || state.waitingForOperand) {
        return state;
      }

      try {
        const result = performCalculation(state.previousValue, currentValue, state.operation);
        const expression = `${formatNumber(state.previousValue)} ${state.operation} ${formatNumber(currentValue)}`;
        
        const historyEntry: CalculationHistory = {
          id: Date.now().toString(),
          expression,
          result,
          timestamp: new Date(),
        };

        return {
          ...state,
          display: formatNumber(result),
          previousValue: null,
          operation: null,
          waitingForOperand: true,
          history: [historyEntry, ...state.history.slice(0, 49)], // Keep last 50 calculations
        };
      } catch (error) {
        return {
          ...state,
          hasError: true,
          errorMessage: error instanceof Error ? error.message : 'Error',
          display: 'Error',
        };
      }
    }

    case 'CLEAR':
      return {
        ...initialState,
        memory: state.memory,
        history: state.history,
      };

    case 'CLEAR_ENTRY':
      return {
        ...state,
        display: '0',
        hasError: false,
        errorMessage: undefined,
      };

    case 'BACKSPACE': {
      if (state.hasError || state.waitingForOperand) {
        return state;
      }

      if (state.display.length === 1) {
        return {
          ...state,
          display: '0',
        };
      }

      return {
        ...state,
        display: state.display.slice(0, -1),
      };
    }

    case 'TOGGLE_SIGN': {
      if (state.hasError) {
        return state;
      }

      const currentValue = parseFloat(state.display);
      const newValue = -currentValue;

      return {
        ...state,
        display: formatNumber(newValue),
      };
    }

    case 'PERCENT': {
      if (state.hasError) {
        return state;
      }

      const currentValue = parseFloat(state.display);
      const newValue = currentValue / 100;

      return {
        ...state,
        display: formatNumber(newValue),
      };
    }

    case 'SQUARE_ROOT': {
      if (state.hasError) {
        return state;
      }

      const currentValue = parseFloat(state.display);
      
      if (currentValue < 0) {
        return {
          ...state,
          hasError: true,
          errorMessage: 'Cannot calculate square root of negative number',
          display: 'Error',
        };
      }

      const result = Math.sqrt(currentValue);
      return {
        ...state,
        display: formatNumber(result),
        waitingForOperand: true,
      };
    }

    case 'MEMORY_CLEAR':
      return {
        ...state,
        memory: 0,
      };

    case 'MEMORY_RECALL':
      return {
        ...state,
        display: formatNumber(state.memory),
        waitingForOperand: true,
      };

    case 'MEMORY_ADD': {
      const currentValue = parseFloat(state.display);
      return {
        ...state,
        memory: state.memory + currentValue,
      };
    }

    case 'MEMORY_SUBTRACT': {
      const currentValue = parseFloat(state.display);
      return {
        ...state,
        memory: state.memory - currentValue,
      };
    }

    case 'SET_HISTORY':
      return {
        ...state,
        history: action.payload,
      };

    case 'ADD_HISTORY':
      return {
        ...state,
        history: [action.payload, ...state.history.slice(0, 49)],
      };

    case 'CLEAR_HISTORY':
      return {
        ...state,
        history: [],
      };

    case 'SET_ERROR':
      return {
        ...state,
        hasError: true,
        errorMessage: action.payload,
        display: 'Error',
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        hasError: false,
        errorMessage: undefined,
      };

    default:
      return state;
  }
};

const CalculatorContext = createContext<CalculatorContextValue | undefined>(undefined);

export const CalculatorProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);

  // Load history from storage on mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Save history to storage whenever it changes
  useEffect(() => {
    if (state.history.length > 0) {
      saveHistory(state.history);
    }
  }, [state.history]);

  const loadHistory = async () => {
    try {
      const historyJson = await AsyncStorage.getItem(STORAGE_KEY);
      if (historyJson) {
        const history = JSON.parse(historyJson).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        dispatch({type: 'SET_HISTORY', payload: history});
      }
    } catch (error) {
      console.error('Failed to load calculator history:', error);
    }
  };

  const saveHistory = async (history: CalculationHistory[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save calculator history:', error);
    }
  };

  const inputNumber = (num: string) => {
    dispatch({type: 'INPUT_NUMBER', payload: num});
  };

  const inputOperation = (operation: CalculatorOperation) => {
    dispatch({type: 'INPUT_OPERATION', payload: operation});
  };

  const calculate = () => {
    dispatch({type: 'CALCULATE'});
  };

  const clear = () => {
    dispatch({type: 'CLEAR'});
  };

  const clearEntry = () => {
    dispatch({type: 'CLEAR_ENTRY'});
  };

  const backspace = () => {
    dispatch({type: 'BACKSPACE'});
  };

  const toggleSign = () => {
    dispatch({type: 'TOGGLE_SIGN'});
  };

  const percent = () => {
    dispatch({type: 'PERCENT'});
  };

  const squareRoot = () => {
    dispatch({type: 'SQUARE_ROOT'});
  };

  const memoryClear = () => {
    dispatch({type: 'MEMORY_CLEAR'});
  };

  const memoryRecall = () => {
    dispatch({type: 'MEMORY_RECALL'});
  };

  const memoryAdd = () => {
    dispatch({type: 'MEMORY_ADD'});
  };

  const memorySubtract = () => {
    dispatch({type: 'MEMORY_SUBTRACT'});
  };

  const clearHistory = () => {
    dispatch({type: 'CLEAR_HISTORY'});
  };

  const value: CalculatorContextValue = {
    ...state,
    inputNumber,
    inputOperation,
    calculate,
    clear,
    clearEntry,
    backspace,
    toggleSign,
    percent,
    squareRoot,
    memoryClear,
    memoryRecall,
    memoryAdd,
    memorySubtract,
    clearHistory,
  };

  return <CalculatorContext.Provider value={value}>{children}</CalculatorContext.Provider>;
};

export const useCalculator = (): CalculatorContextValue => {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
}; 