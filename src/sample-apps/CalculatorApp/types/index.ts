export type CalculatorOperation = '+' | '-' | '*' | '/' | '=' | '%' | '√' | '±' | 'clear' | 'backspace';

export interface CalculationHistory {
  id: string;
  expression: string;
  result: number;
  timestamp: Date;
}

export interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: CalculatorOperation | null;
  waitingForOperand: boolean;
  memory: number;
  history: CalculationHistory[];
  hasError: boolean;
  errorMessage?: string;
}

export interface CalculatorButton {
  label: string;
  value: string | CalculatorOperation;
  type: 'number' | 'operation' | 'equals' | 'clear' | 'memory' | 'function';
  style?: 'primary' | 'secondary' | 'danger' | 'accent';
  span?: number; // For buttons that span multiple columns
} 