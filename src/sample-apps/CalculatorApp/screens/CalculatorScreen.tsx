import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import {useTheme} from '../../../context';
import {useCalculator} from '../context/CalculatorContext';
import {CalculatorButton} from '../types';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

// Calculate better button sizing for proper fit
const CONTAINER_PADDING = 16;
const BUTTON_GAP = 10;
const HEADER_HEIGHT = 80;
const DISPLAY_HEIGHT = 140;
const SAFE_AREA_BOTTOM = 50;

// Calculate available space
const availableHeight = screenHeight - HEADER_HEIGHT - DISPLAY_HEIGHT - SAFE_AREA_BOTTOM;
const availableWidth = screenWidth - (CONTAINER_PADDING * 2);

// Button size should fit both width and height constraints
const maxButtonSize = Math.min(
  (availableWidth - (BUTTON_GAP * 3)) / 4, // 4 columns
  (availableHeight - (BUTTON_GAP * 6)) / 7  // 7 rows
);

const BUTTON_SIZE = Math.floor(maxButtonSize);

const CalculatorScreen: React.FC = () => {
  const {theme} = useTheme();
  const {
    display,
    memory,
    history,
    hasError,
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
  } = useCalculator();

  const [showHistory, setShowHistory] = useState(false);

  // Define styles first
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    memoryIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    memoryText: {
      fontSize: 14,
      color: theme.colors.text,
      opacity: 0.7,
      marginRight: 8,
    },
    historyButton: {
      padding: 8,
      borderRadius: 6,
      backgroundColor: theme.colors.primary + '20',
    },
    historyButtonText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    displayContainer: {
      backgroundColor: theme.colors.surface,
      padding: 24,
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      height: DISPLAY_HEIGHT,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    display: {
      fontSize: 52,
      fontWeight: '200',
      color: hasError ? '#ff6b6b' : theme.colors.text,
      textAlign: 'right',
      letterSpacing: -1,
    },
    buttonsContainer: {
      flex: 1,
      padding: CONTAINER_PADDING,
      gap: BUTTON_GAP,
      justifyContent: 'space-between',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: BUTTON_GAP,
      justifyContent: 'center',
    },
    button: {
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 3,
    },
    buttonWide: {
      width: BUTTON_SIZE * 2 + BUTTON_GAP, // Double width plus one gap
    },
    buttonText: {
      fontSize: Math.min(26, BUTTON_SIZE * 0.35),
      fontWeight: '400',
    },
    numberButtonText: {
      fontSize: Math.min(28, BUTTON_SIZE * 0.4),
    },
    functionButtonText: {
      fontSize: Math.min(24, BUTTON_SIZE * 0.32),
    },
    operationButton: {
      // Add specific styles for operation buttons if needed
    },
    // History Modal Styles
    historyModal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    historyContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      marginTop: 50,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    historyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    historyCloseButton: {
      padding: 8,
      backgroundColor: theme.colors.primary,
      borderRadius: 6,
    },
    historyCloseText: {
      color: '#fff',
      fontWeight: '600',
    },
    historyList: {
      flex: 1,
      padding: 20,
    },
    historyItem: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    historyExpression: {
      fontSize: 16,
      color: theme.colors.text,
      opacity: 0.8,
    },
    historyResult: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginTop: 4,
    },
    historyTime: {
      fontSize: 12,
      color: theme.colors.text,
      opacity: 0.6,
      marginTop: 4,
    },
    emptyHistory: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyHistoryText: {
      fontSize: 16,
      color: theme.colors.text,
      opacity: 0.6,
    },
    clearHistoryButton: {
      margin: 16,
      padding: 12,
      backgroundColor: '#ff6b6b20',
      borderRadius: 8,
      alignItems: 'center',
    },
    clearHistoryText: {
      color: '#ff6b6b',
      fontWeight: '600',
    },
  });

  const buttons: CalculatorButton[][] = [
    // Row 1: Memory and Clear functions
    [
      {label: 'MC', value: 'MC', type: 'memory', style: 'secondary'},
      {label: 'MR', value: 'MR', type: 'memory', style: 'secondary'},
      {label: 'M+', value: 'M+', type: 'memory', style: 'secondary'},
      {label: 'M-', value: 'M-', type: 'memory', style: 'secondary'},
    ],
    // Row 2: Advanced functions
    [
      {label: '⌫', value: 'backspace', type: 'function', style: 'secondary'},
      {label: 'CE', value: 'CE', type: 'clear', style: 'secondary'},
      {label: 'C', value: 'clear', type: 'clear', style: 'danger'},
      {label: '±', value: '±', type: 'function', style: 'secondary'},
    ],
    // Row 3: Functions and division
    [
      {label: '√', value: '√', type: 'function', style: 'secondary'},
      {label: '%', value: '%', type: 'operation', style: 'secondary'},
      {label: '1/x', value: '1/x', type: 'function', style: 'secondary'},
      {label: '÷', value: '/', type: 'operation', style: 'accent'},
    ],
    // Row 4: Numbers 7-9 and multiply
    [
      {label: '7', value: '7', type: 'number'},
      {label: '8', value: '8', type: 'number'},
      {label: '9', value: '9', type: 'number'},
      {label: '×', value: '*', type: 'operation', style: 'accent'},
    ],
    // Row 5: Numbers 4-6 and subtract
    [
      {label: '4', value: '4', type: 'number'},
      {label: '5', value: '5', type: 'number'},
      {label: '6', value: '6', type: 'number'},
      {label: '-', value: '-', type: 'operation', style: 'accent'},
    ],
    // Row 6: Numbers 1-3 and add
    [
      {label: '1', value: '1', type: 'number'},
      {label: '2', value: '2', type: 'number'},
      {label: '3', value: '3', type: 'number'},
      {label: '+', value: '+', type: 'operation', style: 'accent'},
    ],
    // Row 7: Zero, decimal, and equals
    [
      {label: '0', value: '0', type: 'number', span: 2},
      {label: '.', value: '.', type: 'number'},
      {label: '=', value: '=', type: 'equals', style: 'primary'},
    ],
  ];

  const handleButtonPress = (button: CalculatorButton) => {
    switch (button.type) {
      case 'number':
        inputNumber(button.value as string);
        break;
      case 'operation':
        inputOperation(button.value as any);
        break;
      case 'equals':
        calculate();
        break;
      case 'clear':
        if (button.value === 'clear') {
          clear();
        } else if (button.value === 'CE') {
          clearEntry();
        }
        break;
      case 'function':
        switch (button.value) {
          case 'backspace':
            backspace();
            break;
          case '±':
            toggleSign();
            break;
          case '√':
            squareRoot();
            break;
          case '1/x':
            // Calculate reciprocal
            const currentValue = parseFloat(display);
            if (currentValue !== 0) {
              const reciprocal = 1 / currentValue;
              // This should be handled through the context for proper state management
              const formatted = reciprocal === Math.floor(reciprocal) ? reciprocal.toString() : reciprocal.toFixed(10).replace(/\.?0+$/, '');
              // Clear display and input new value
              clear();
              inputNumber(formatted);
            }
            break;
        }
        break;
      case 'memory':
        switch (button.value) {
          case 'MC':
            memoryClear();
            break;
          case 'MR':
            memoryRecall();
            break;
          case 'M+':
            memoryAdd();
            break;
          case 'M-':
            memorySubtract();
            break;
        }
        break;
    }
  };

  const getButtonStyle = (button: CalculatorButton) => {
    let backgroundColor = theme.colors.surface;
    
    switch (button.style) {
      case 'primary':
        backgroundColor = theme.colors.primary;
        break;
      case 'secondary':
        backgroundColor = theme.colors.border;
        break;
      case 'danger':
        backgroundColor = '#ff6b6b';
        break;
      case 'accent':
        backgroundColor = '#ff9500';
        break;
    }

    return [
      styles.button,
      {backgroundColor},
      button.span === 2 && styles.buttonWide,
      // Add visual distinction for operation buttons
      (button.style === 'accent' || button.style === 'primary') && styles.operationButton,
    ].filter(Boolean);
  };

  const getButtonTextStyle = (button: CalculatorButton) => {
    const isLightText = ['primary', 'danger', 'accent'].includes(button.style || '');
    
    return [
      styles.buttonText,
      {color: isLightText ? '#ffffff' : theme.colors.text},
      // Slightly larger text for numbers
      button.type === 'number' && styles.numberButtonText,
      // Slightly smaller text for function buttons
      (button.type === 'function' || button.type === 'memory') && styles.functionButtonText,
    ];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Calculator</Text>
          <View style={styles.memoryIndicator}>
            {memory !== 0 && (
              <Text style={styles.memoryText}>M: {memory}</Text>
            )}
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => setShowHistory(true)}
              testID="history-button">
              <Text style={styles.historyButtonText}>History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Display */}
      <View style={styles.displayContainer}>
        <Text style={styles.display} numberOfLines={1} adjustsFontSizeToFit>
          {display}
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        {buttons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.buttonRow}>
            {row.map((button, buttonIndex) => (
              <TouchableOpacity
                key={`${rowIndex}-${buttonIndex}`}
                style={getButtonStyle(button)}
                onPress={() => handleButtonPress(button)}
                testID={`calc-button-${button.value}`}>
                <Text style={getButtonTextStyle(button)}>
                  {button.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* History Modal */}
      <Modal
        visible={showHistory}
        animationType="slide"
        presentationStyle="overFullScreen"
        onRequestClose={() => setShowHistory(false)}>
        <View style={styles.historyModal}>
          <View style={styles.historyContainer}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Calculation History</Text>
              <TouchableOpacity
                style={styles.historyCloseButton}
                onPress={() => setShowHistory(false)}
                testID="close-history">
                <Text style={styles.historyCloseText}>Done</Text>
              </TouchableOpacity>
            </View>

            {history.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Text style={styles.emptyHistoryText}>No calculations yet</Text>
              </View>
            ) : (
              <>
                <ScrollView style={styles.historyList}>
                  {history.map((item) => (
                    <View key={item.id} style={styles.historyItem}>
                      <Text style={styles.historyExpression}>{item.expression}</Text>
                      <Text style={styles.historyResult}>= {item.result}</Text>
                      <Text style={styles.historyTime}>
                        {item.timestamp.toLocaleString()}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.clearHistoryButton}
                  onPress={() => {
                    clearHistory();
                    setShowHistory(false);
                  }}
                  testID="clear-history">
                  <Text style={styles.clearHistoryText}>Clear History</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CalculatorScreen; 