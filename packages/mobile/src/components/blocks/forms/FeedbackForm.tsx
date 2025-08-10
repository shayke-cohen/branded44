/**
 * FeedbackForm - Bug Reports and Feature Requests Block Component
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Input } from '../../../../~/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../~/components/ui/card';
import { Label } from '../../../../~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../~/components/ui/select';
import { Text } from '../../../../~/components/ui/text';
import { cn } from '../../../lib/utils';
import { LoadingState, FormErrors } from '../../../lib/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { MessageSquare } from 'lucide-react-native';

export interface FeedbackFormProps {
  onSubmit: (data: { type: string; title: string; description: string; email?: string }) => Promise<void>;
  loading?: LoadingState;
  style?: any;
  className?: string;
  testID?: string;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onSubmit,
  loading = 'idle',
  style,
  className,
  testID = 'feedback-form',
}) => {
  const [formData, setFormData] = useState({
    type: 'bug',
    title: '',
    description: '',
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const isLoading = loading === 'loading';

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  return (
    <View style={style} className={cn('feedback-form', className)} testID={testID}>
      <Card>
        <CardHeader>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
            <MessageSquare size={20} color={COLORS.primary[600]} />
            <CardTitle>Send Feedback</CardTitle>
          </View>
        </CardHeader>
        
        <CardContent style={{ gap: SPACING.formField }}>
          <View>
            <Label nativeID="feedbackType">Feedback Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => updateField('type', value)}
              disabled={isLoading}
            >
              <SelectTrigger aria-labelledby="feedbackType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem label="Bug Report" value="bug" />
                <SelectItem label="Feature Request" value="feature" />
                <SelectItem label="General Feedback" value="general" />
                <SelectItem label="Question" value="question" />
              </SelectContent>
            </Select>
          </View>

          <View>
            <Label nativeID="title">Title *</Label>
            <Input
              aria-labelledby="title"
              value={formData.title}
              onChangeText={(value) => updateField('title', value)}
              placeholder="Brief description of the issue or request"
              editable={!isLoading}
              style={errors.title ? { borderColor: COLORS.error[500] } : {}}
            />
            {errors.title && (
              <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                {errors.title}
              </Text>
            )}
          </View>

          <View>
            <Label nativeID="description">Description *</Label>
            <Text
              style={{
                borderWidth: 1,
                borderColor: errors.description ? COLORS.error[500] : COLORS.neutral[300],
                borderRadius: 8,
                padding: SPACING.md,
                fontSize: TYPOGRAPHY.fontSize.base,
                minHeight: 120,
                textAlignVertical: 'top'
              }}
              onChangeText={(value) => updateField('description', value)}
              placeholder="Please provide detailed information..."
              multiline
              numberOfLines={5}
              editable={!isLoading}
            />
            {errors.description && (
              <Text style={{ color: COLORS.error[500], fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 4 }}>
                {errors.description}
              </Text>
            )}
          </View>

          <View>
            <Label nativeID="email">Email (Optional)</Label>
            <Input
              aria-labelledby="email"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="your.email@example.com"
              editable={!isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Button onPress={handleSubmit} disabled={isLoading}>
            <Text>{isLoading ? 'Sending...' : 'Send Feedback'}</Text>
          </Button>
        </CardContent>
      </Card>
    </View>
  );
};

export default FeedbackForm;
