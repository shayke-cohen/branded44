/**
 * RatingForm - Star Rating with Review Text Block Component
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from '../../../../~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../~/components/ui/card';
import { Text } from '../../../../~/components/ui/text';
import { Label } from '../../../../~/components/ui/label';
import { cn } from '../../../lib/utils';
import { LoadingState } from '../../../lib/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { Star } from 'lucide-react-native';

export interface RatingFormProps {
  onSubmit: (rating: number, review: string) => Promise<void>;
  loading?: LoadingState;
  style?: any;
  className?: string;
  testID?: string;
}

export const RatingForm: React.FC<RatingFormProps> = ({
  onSubmit,
  loading = 'idle',
  style,
  className,
  testID = 'rating-form',
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const isLoading = loading === 'loading';

  const handleSubmit = async () => {
    if (rating > 0) {
      await onSubmit(rating, review);
    }
  };

  return (
    <View style={style} className={cn('rating-form', className)} testID={testID}>
      <Card>
        <CardHeader>
          <CardTitle>Leave a Review</CardTitle>
        </CardHeader>
        
        <CardContent style={{ gap: SPACING.formField }}>
          <View>
            <Label nativeID="rating">Rating *</Label>
            <View style={{ flexDirection: 'row', gap: SPACING.xs, marginTop: SPACING.sm }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  onPress={() => setRating(star)}
                  disabled={isLoading}
                  style={{ padding: SPACING.xs }}
                >
                  <Star 
                    size={32} 
                    color={star <= rating ? COLORS.warning[500] : COLORS.neutral[300]}
                    fill={star <= rating ? COLORS.warning[500] : 'transparent'}
                  />
                </Button>
              ))}
            </View>
          </View>
          
          <View>
            <Label nativeID="review">Review (Optional)</Label>
            <Text
              style={{
                borderWidth: 1,
                borderColor: COLORS.neutral[300],
                borderRadius: 8,
                padding: SPACING.md,
                fontSize: TYPOGRAPHY.fontSize.base,
                minHeight: 100,
                textAlignVertical: 'top'
              }}
              onChangeText={setReview}
              placeholder="Share your experience..."
              multiline
              numberOfLines={4}
              editable={!isLoading}
            />
          </View>
          
          <Button 
            onPress={handleSubmit} 
            disabled={rating === 0 || isLoading}
          >
            <Text>{isLoading ? 'Submitting...' : 'Submit Review'}</Text>
          </Button>
        </CardContent>
      </Card>
    </View>
  );
};

export default RatingForm;
