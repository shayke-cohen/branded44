/**
 * QuizForm - Questions with Multiple Choice Block Component
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../~/components/ui/card';
import { Text } from '../../../../~/components/ui/text';
import { Progress } from '../../../../~/components/ui/progress';
import { Badge } from '../../../../~/components/ui/badge';
import { cn } from '../../../lib/utils';
import { LoadingState } from '../../../lib/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { HelpCircle, CheckCircle, XCircle } from 'lucide-react-native';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizFormProps {
  questions: QuizQuestion[];
  onComplete: (score: number, answers: Array<{ questionId: string; answer: number; correct: boolean }>) => void;
  showResults?: boolean;
  loading?: LoadingState;
  style?: any;
  className?: string;
  testID?: string;
}

export const QuizForm: React.FC<QuizFormProps> = ({
  questions,
  onComplete,
  showResults = true,
  loading = 'idle',
  style,
  className,
  testID = 'quiz-form',
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Array<{ questionId: string; answer: number; correct: boolean }>>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const isLoading = loading === 'loading';
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    const newAnswer = {
      questionId: currentQ.id,
      answer: selectedAnswer,
      correct: isCorrect,
    };

    setAnswers(prev => [...prev, newAnswer]);
    setShowExplanation(true);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowExplanation(false);
      } else {
        setQuizCompleted(true);
        const score = [...answers, newAnswer].filter(a => a.correct).length;
        onComplete(score, [...answers, newAnswer]);
      }
    }, 2000);
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return COLORS.success[600];
    if (percentage >= 60) return COLORS.warning[600];
    return COLORS.error[600];
  };

  if (quizCompleted && showResults) {
    const score = answers.filter(a => a.correct).length;
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <View style={style} className={cn('quiz-form', className)} testID={testID}>
        <Card>
          <CardHeader>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
              <CheckCircle size={24} color={COLORS.success[600]} />
              <CardTitle>Quiz Complete!</CardTitle>
            </View>
          </CardHeader>
          
          <CardContent style={{ alignItems: 'center', gap: SPACING.lg }}>
            <View style={{ alignItems: 'center', gap: SPACING.md }}>
              <Text style={{ 
                fontSize: TYPOGRAPHY.fontSize['3xl'], 
                fontWeight: TYPOGRAPHY.fontWeight.bold,
                color: getScoreColor(score, questions.length)
              }}>
                {score}/{questions.length}
              </Text>
              <Text style={{ 
                fontSize: TYPOGRAPHY.fontSize.lg,
                color: COLORS.neutral[600]
              }}>
                {percentage}% Correct
              </Text>
            </View>

            <Badge 
              variant="secondary" 
              style={{ backgroundColor: getScoreColor(score, questions.length) }}
            >
              <Text style={{ color: COLORS.white }}>
                {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
              </Text>
            </Badge>
          </CardContent>
        </Card>
      </View>
    );
  }

  return (
    <View style={style} className={cn('quiz-form', className)} testID={testID}>
      <Card>
        <CardHeader>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
            <HelpCircle size={20} color={COLORS.primary[600]} />
            <CardTitle>Quiz</CardTitle>
          </View>
          <View style={{ marginTop: SPACING.sm }}>
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
              Question {currentQuestion + 1} of {questions.length}
            </Text>
            <Progress value={progress} style={{ marginTop: SPACING.xs }} />
          </View>
        </CardHeader>
        
        <CardContent style={{ gap: SPACING.formField }}>
          <Text style={{ 
            fontSize: TYPOGRAPHY.fontSize.lg, 
            fontWeight: TYPOGRAPHY.fontWeight.medium,
            marginBottom: SPACING.md
          }}>
            {currentQ.question}
          </Text>

          <View style={{ gap: SPACING.sm }}>
            {currentQ.options.map((option, index) => {
              let buttonVariant: 'default' | 'outline' | 'secondary' = 'outline';
              let buttonColor = undefined;

              if (showExplanation) {
                if (index === currentQ.correctAnswer) {
                  buttonVariant = 'default';
                  buttonColor = COLORS.success[600];
                } else if (index === selectedAnswer && index !== currentQ.correctAnswer) {
                  buttonColor = COLORS.error[600];
                }
              } else if (selectedAnswer === index) {
                buttonVariant = 'default';
              }

              return (
                <Button
                  key={index}
                  variant={buttonVariant}
                  onPress={() => !showExplanation && handleAnswerSelect(index)}
                  disabled={showExplanation || isLoading}
                  style={{ 
                    justifyContent: 'flex-start',
                    backgroundColor: buttonColor,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                    {showExplanation && index === currentQ.correctAnswer && (
                      <CheckCircle size={20} color={COLORS.white} />
                    )}
                    {showExplanation && index === selectedAnswer && index !== currentQ.correctAnswer && (
                      <XCircle size={20} color={COLORS.white} />
                    )}
                    <Text style={{ 
                      color: buttonColor ? COLORS.white : undefined,
                      flex: 1,
                      textAlign: 'left'
                    }}>
                      {option}
                    </Text>
                  </View>
                </Button>
              );
            })}
          </View>

          {showExplanation && currentQ.explanation && (
            <Card style={{ backgroundColor: COLORS.info[50], borderColor: COLORS.info[200] }}>
              <CardContent style={{ padding: SPACING.md }}>
                <Text style={{ 
                  fontSize: TYPOGRAPHY.fontSize.sm,
                  color: COLORS.info[800]
                }}>
                  {currentQ.explanation}
                </Text>
              </CardContent>
            </Card>
          )}

          {!showExplanation && (
            <Button
              onPress={handleSubmitAnswer}
              disabled={selectedAnswer === null || isLoading}
              style={{ marginTop: SPACING.md }}
            >
              <Text>Submit Answer</Text>
            </Button>
          )}
        </CardContent>
      </Card>
    </View>
  );
};

export default QuizForm;
