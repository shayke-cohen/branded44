/**
 * SurveyForm - Multi-Question Survey Block Component  
 */

import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Input } from '../../../../~/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../~/components/ui/card';
import { Label } from '../../../../~/components/ui/label';
import { Checkbox } from '../../../../~/components/ui/checkbox';
import { Text } from '../../../../~/components/ui/text';
import { Progress } from '../../../../~/components/ui/progress';
import { cn } from '../../../lib/utils';
import { LoadingState } from '../../../lib/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react-native';

export interface SurveyQuestion {
  id: string;
  type: 'text' | 'multiple_choice' | 'checkbox' | 'rating';
  question: string;
  options?: string[];
  required?: boolean;
}

export interface SurveyFormProps {
  questions: SurveyQuestion[];
  onSubmit: (answers: Record<string, any>) => Promise<void>;
  onCancel?: () => void;
  loading?: LoadingState;
  style?: any;
  className?: string;
  testID?: string;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({
  questions,
  onSubmit,
  onCancel,
  loading = 'idle',
  style,
  className,
  testID = 'survey-form',
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const isLoading = loading === 'loading';
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const updateAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    await onSubmit(answers);
  };

  const renderQuestion = (question: SurveyQuestion) => {
    const answer = answers[question.id];

    switch (question.type) {
      case 'text':
        return (
          <Input
            value={answer || ''}
            onChangeText={(text) => updateAnswer(question.id, text)}
            placeholder="Enter your answer..."
            editable={!isLoading}
            multiline={true}
            style={{ minHeight: 60 }}
          />
        );

      case 'multiple_choice':
        return (
          <View style={{ gap: SPACING.sm }}>
            {question.options?.map((option, index) => (
              <Button
                key={index}
                variant={answer === option ? "default" : "outline"}
                onPress={() => updateAnswer(question.id, option)}
                disabled={isLoading}
                style={{ justifyContent: 'flex-start' }}
              >
                <Text>{option}</Text>
              </Button>
            ))}
          </View>
        );

      case 'checkbox':
        return (
          <View style={{ gap: SPACING.sm }}>
            {question.options?.map((option, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                <Checkbox
                  checked={Array.isArray(answer) && answer.includes(option)}
                  onCheckedChange={(checked) => {
                    const currentAnswers = Array.isArray(answer) ? answer : [];
                    const newAnswers = checked
                      ? [...currentAnswers, option]
                      : currentAnswers.filter(a => a !== option);
                    updateAnswer(question.id, newAnswers);
                  }}
                  disabled={isLoading}
                />
                <Text>{option}</Text>
              </View>
            ))}
          </View>
        );

      case 'rating':
        return (
          <View style={{ flexDirection: 'row', gap: SPACING.sm, justifyContent: 'center' }}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant={answer === rating ? "default" : "outline"}
                onPress={() => updateAnswer(question.id, rating)}
                disabled={isLoading}
                style={{ minWidth: 50 }}
              >
                <Text>{rating}</Text>
              </Button>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  const currentQ = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <View style={style} className={cn('survey-form', className)} testID={testID}>
      <Card>
        <CardHeader>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
            <FileText size={20} color={COLORS.primary[600]} />
            <CardTitle>Survey</CardTitle>
          </View>
          <View style={{ marginTop: SPACING.sm }}>
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
              Question {currentQuestion + 1} of {questions.length}
            </Text>
            <Progress value={progress} style={{ marginTop: SPACING.xs }} />
          </View>
        </CardHeader>
        
        <CardContent style={{ gap: SPACING.formField }}>
          <View>
            <Text style={{ 
              fontSize: TYPOGRAPHY.fontSize.lg, 
              fontWeight: TYPOGRAPHY.fontWeight.medium,
              marginBottom: SPACING.md
            }}>
              {currentQ.question}
              {currentQ.required && <Text style={{ color: COLORS.error[500] }}> *</Text>}
            </Text>
            
            {renderQuestion(currentQ)}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.lg }}>
            <Button
              variant="outline"
              onPress={currentQuestion === 0 ? onCancel : handlePrevious}
              disabled={isLoading}
              style={{ flex: 1, marginRight: SPACING.md }}
            >
              <ChevronLeft size={16} color={COLORS.neutral[600]} />
              <Text>{currentQuestion === 0 ? 'Cancel' : 'Previous'}</Text>
            </Button>
            
            <Button
              onPress={isLastQuestion ? handleSubmit : handleNext}
              disabled={isLoading}
              style={{ flex: 1 }}
            >
              <Text>
                {isLoading ? 'Submitting...' : isLastQuestion ? 'Submit' : 'Next'}
              </Text>
              {!isLastQuestion && <ChevronRight size={16} color={COLORS.white} />}
            </Button>
          </View>
        </CardContent>
      </Card>
    </View>
  );
};

export default SurveyForm;
