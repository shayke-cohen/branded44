/**
 * NutritionCard Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive nutrition tracking card component for health and fitness apps,
 * displaying meal information, nutritional values, calorie tracking, and dietary goals.
 * 
 * Features:
 * - Meal and food item display
 * - Macro and micronutrient tracking
 * - Calorie counting with goal progress
 * - Dietary restrictions and allergies
 * - Nutritional analysis and scores
 * - Meal planning and scheduling
 * - Ingredient lists and recipes
 * - Portion size recommendations
 * 
 * @example
 * ```tsx
 * <NutritionCard
 *   meal={mealData}
 *   nutritionGoals={dailyGoals}
 *   onLogMeal={handleLogMeal}
 *   onViewRecipe={handleViewRecipe}
 *   showProgress={true}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Badge } from '../../../../~/components/ui/badge';
import { Button } from '../../../../~/components/ui/button';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { formatDate, cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Meal type
 */
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';

/**
 * Dietary restriction
 */
export type DietaryRestriction = 'vegetarian' | 'vegan' | 'gluten_free' | 'dairy_free' | 'keto' | 'paleo' | 'low_carb' | 'halal' | 'kosher';

/**
 * Nutrition score
 */
export type NutritionScore = 'excellent' | 'good' | 'fair' | 'poor';

/**
 * Food item
 */
export interface FoodItem {
  /** Food item ID */
  id: string;
  /** Food name */
  name: string;
  /** Quantity/serving size */
  quantity: number;
  /** Unit of measurement */
  unit: string;
  /** Calories per serving */
  calories: number;
  /** Protein in grams */
  protein: number;
  /** Carbohydrates in grams */
  carbs: number;
  /** Fat in grams */
  fat: number;
  /** Fiber in grams */
  fiber?: number;
  /** Sugar in grams */
  sugar?: number;
  /** Sodium in mg */
  sodium?: number;
  /** Food image URL */
  image?: string;
  /** Brand name */
  brand?: string;
}

/**
 * Nutritional information
 */
export interface NutritionInfo {
  /** Total calories */
  calories: number;
  /** Total protein in grams */
  protein: number;
  /** Total carbohydrates in grams */
  carbs: number;
  /** Total fat in grams */
  fat: number;
  /** Total fiber in grams */
  fiber?: number;
  /** Total sugar in grams */
  sugar?: number;
  /** Total sodium in mg */
  sodium?: number;
  /** Vitamin C in mg */
  vitaminC?: number;
  /** Iron in mg */
  iron?: number;
  /** Calcium in mg */
  calcium?: number;
}

/**
 * Daily nutrition goals
 */
export interface NutritionGoals {
  /** Daily calorie goal */
  calories: number;
  /** Daily protein goal in grams */
  protein: number;
  /** Daily carb goal in grams */
  carbs: number;
  /** Daily fat goal in grams */
  fat: number;
  /** Daily fiber goal in grams */
  fiber?: number;
  /** Daily sodium limit in mg */
  sodiumLimit?: number;
}

/**
 * Meal data
 */
export interface MealData {
  /** Meal ID */
  id: string;
  /** Meal name */
  name: string;
  /** Meal type */
  type: MealType;
  /** Food items in the meal */
  foods: FoodItem[];
  /** Total nutrition info */
  nutrition: NutritionInfo;
  /** Meal time */
  time?: Date;
  /** Recipe URL or instructions */
  recipe?: string;
  /** Meal image */
  image?: string;
  /** Preparation time in minutes */
  prepTime?: number;
  /** Cooking time in minutes */
  cookTime?: number;
  /** Difficulty level */
  difficulty?: 'easy' | 'medium' | 'hard';
  /** Dietary restrictions met */
  dietaryRestrictions?: DietaryRestriction[];
  /** Nutrition score */
  nutritionScore?: NutritionScore;
  /** Whether meal is logged */
  isLogged?: boolean;
}

/**
 * Props for the NutritionCard component
 */
export interface NutritionCardProps extends BaseComponentProps {
  /** Meal data to display */
  meal: MealData;
  /** Daily nutrition goals */
  nutritionGoals?: NutritionGoals;
  /** Whether to show progress toward goals */
  showProgress?: boolean;
  /** Whether to show detailed nutrition breakdown */
  showDetails?: boolean;
  /** Whether to show ingredients */
  showIngredients?: boolean;
  /** Whether meal is editable */
  editable?: boolean;
  /** Whether to show meal timing */
  showTiming?: boolean;
  /** Current progress toward daily goals */
  dailyProgress?: NutritionInfo;
  /** Card size variant */
  size?: 'small' | 'medium' | 'large';
  /** Callback when meal is logged */
  onLogMeal?: (meal: MealData) => void;
  /** Callback when meal is edited */
  onEditMeal?: (meal: MealData) => void;
  /** Callback when recipe is viewed */
  onViewRecipe?: (meal: MealData) => void;
  /** Callback when food item is pressed */
  onFoodPress?: (food: FoodItem) => void;
  /** Callback when nutrition info is pressed */
  onNutritionPress?: () => void;
  /** Callback when meal is shared */
  onShare?: () => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * NutritionCard component for displaying meal and nutrition information
 */
export const NutritionCard: React.FC<NutritionCardProps> = ({
  meal,
  nutritionGoals,
  showProgress = true,
  showDetails = false,
  showIngredients = true,
  editable = false,
  showTiming = true,
  dailyProgress,
  size = 'medium',
  onLogMeal,
  onEditMeal,
  onViewRecipe,
  onFoodPress,
  onNutritionPress,
  onShare,
  style,
  testID = 'nutrition-card',
  ...props
}) => {
  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getMealTypeIcon = (type: MealType): string => {
    const icons: Record<MealType, string> = {
      breakfast: '🌅',
      lunch: '🌞',
      dinner: '🌙',
      snack: '🍎',
      pre_workout: '🏋️',
      post_workout: '💪',
    };
    return icons[type];
  };

  const getMealTypeColor = (type: MealType): string => {
    const colors: Record<MealType, string> = {
      breakfast: COLORS.warning[500],
      lunch: COLORS.info[500],
      dinner: COLORS.primary[500],
      snack: COLORS.success[500],
      pre_workout: COLORS.error[500],
      post_workout: COLORS.success[600],
    };
    return colors[type];
  };

  const getNutritionScoreColor = (score?: NutritionScore): string => {
    if (!score) return COLORS.neutral[400];
    const colors: Record<NutritionScore, string> = {
      excellent: COLORS.success[500],
      good: COLORS.success[400],
      fair: COLORS.warning[500],
      poor: COLORS.error[500],
    };
    return colors[score];
  };

  const getDietaryRestrictionColor = (restriction: DietaryRestriction): string => {
    const colors: Record<DietaryRestriction, string> = {
      vegetarian: COLORS.success[500],
      vegan: COLORS.success[600],
      gluten_free: COLORS.warning[500],
      dairy_free: COLORS.info[500],
      keto: COLORS.primary[500],
      paleo: COLORS.error[500],
      low_carb: COLORS.warning[600],
      halal: COLORS.primary[600],
      kosher: COLORS.info[600],
    };
    return colors[restriction];
  };

  const calculateCalorieProgress = (): number => {
    if (!nutritionGoals || !dailyProgress) return 0;
    return Math.min((dailyProgress.calories / nutritionGoals.calories) * 100, 100);
  };

  const calculateMacroProgress = (macro: 'protein' | 'carbs' | 'fat'): number => {
    if (!nutritionGoals || !dailyProgress) return 0;
    return Math.min((dailyProgress[macro] / nutritionGoals[macro]) * 100, 100);
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {meal.image && (
          <Image source={{ uri: meal.image }} style={styles.mealImage} />
        )}
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.mealName}>{meal.name}</Text>
            {meal.nutritionScore && (
              <View style={[
                styles.scoreIndicator,
                { backgroundColor: getNutritionScoreColor(meal.nutritionScore) }
              ]}>
                <Text style={styles.scoreText}>
                  {meal.nutritionScore.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.mealMeta}>
            <Badge 
              variant="secondary"
              style={[styles.typeBadge, { backgroundColor: `${getMealTypeColor(meal.type)}20` }]}
            >
              <Text style={[styles.badgeText, { color: getMealTypeColor(meal.type) }]}>
                {getMealTypeIcon(meal.type)} {meal.type.replace('_', ' ').toUpperCase()}
              </Text>
            </Badge>
            
            {showTiming && meal.time && (
              <Text style={styles.mealTime}>
                {formatDate(meal.time, 'HH:mm')}
              </Text>
            )}
          </View>
        </View>
      </View>
      
      {meal.dietaryRestrictions && meal.dietaryRestrictions.length > 0 && (
        <View style={styles.restrictionsContainer}>
          {meal.dietaryRestrictions.map((restriction, index) => (
            <Badge 
              key={index}
              variant="outline"
              style={[styles.restrictionBadge, { borderColor: getDietaryRestrictionColor(restriction) }]}
            >
              <Text style={[styles.badgeText, { color: getDietaryRestrictionColor(restriction) }]}>
                {restriction.replace('_', '-')}
              </Text>
            </Badge>
          ))}
        </View>
      )}
    </View>
  );

  const renderNutritionSummary = () => (
    <TouchableOpacity style={styles.nutritionSummary} onPress={onNutritionPress}>
      <View style={styles.calorieContainer}>
        <Text style={styles.calorieValue}>{meal.nutrition.calories}</Text>
        <Text style={styles.calorieLabel}>calories</Text>
      </View>
      
      <View style={styles.macrosContainer}>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{meal.nutrition.protein}g</Text>
          <Text style={styles.macroLabel}>Protein</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{meal.nutrition.carbs}g</Text>
          <Text style={styles.macroLabel}>Carbs</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{meal.nutrition.fat}g</Text>
          <Text style={styles.macroLabel}>Fat</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderProgress = () => {
    if (!showProgress || !nutritionGoals || !dailyProgress) return null;

    const calorieProgress = calculateCalorieProgress();

    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Daily Progress</Text>
        
        <View style={styles.progressItem}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Calories</Text>
            <Text style={styles.progressText}>
              {dailyProgress.calories + meal.nutrition.calories}/{nutritionGoals.calories}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${Math.min(calorieProgress + (meal.nutrition.calories / nutritionGoals.calories * 100), 100)}%`,
                  backgroundColor: COLORS.primary[500]
                }
              ]} 
            />
          </View>
        </View>

        <View style={styles.macroProgressContainer}>
          {(['protein', 'carbs', 'fat'] as const).map((macro) => {
            const currentProgress = calculateMacroProgress(macro);
            const newValue = dailyProgress[macro] + meal.nutrition[macro];
            const goalValue = nutritionGoals[macro];
            
            return (
              <View key={macro} style={styles.macroProgress}>
                <Text style={styles.macroProgressLabel}>
                  {macro.charAt(0).toUpperCase() + macro.slice(1)}
                </Text>
                <Text style={styles.macroProgressValue}>
                  {newValue}g/{goalValue}g
                </Text>
                <View style={styles.miniProgressBar}>
                  <View 
                    style={[
                      styles.miniProgressFill,
                      { 
                        width: `${Math.min((newValue / goalValue) * 100, 100)}%`,
                        backgroundColor: getMealTypeColor(meal.type)
                      }
                    ]} 
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderIngredients = () => {
    if (!showIngredients || meal.foods.length === 0) return null;

    return (
      <View style={styles.ingredientsContainer}>
        <Text style={styles.ingredientsTitle}>Ingredients</Text>
        {meal.foods.slice(0, showDetails ? meal.foods.length : 3).map((food, index) => (
          <TouchableOpacity
            key={food.id}
            style={styles.ingredientItem}
            onPress={() => onFoodPress?.(food)}
          >
            {food.image && (
              <Image source={{ uri: food.image }} style={styles.ingredientImage} />
            )}
            <View style={styles.ingredientContent}>
              <Text style={styles.ingredientName}>{food.name}</Text>
              <Text style={styles.ingredientDetails}>
                {food.quantity} {food.unit} • {food.calories} cal
              </Text>
              {food.brand && (
                <Text style={styles.ingredientBrand}>{food.brand}</Text>
              )}
            </View>
            <Text style={styles.ingredientCalories}>
              {food.calories}
            </Text>
          </TouchableOpacity>
        ))}
        
        {!showDetails && meal.foods.length > 3 && (
          <Text style={styles.moreIngredients}>
            +{meal.foods.length - 3} more ingredients
          </Text>
        )}
      </View>
    );
  };

  const renderMealTiming = () => {
    if (!meal.prepTime && !meal.cookTime) return null;

    return (
      <View style={styles.timingContainer}>
        {meal.prepTime && (
          <View style={styles.timingItem}>
            <Text style={styles.timingIcon}>⏱️</Text>
            <Text style={styles.timingText}>Prep: {meal.prepTime}m</Text>
          </View>
        )}
        {meal.cookTime && (
          <View style={styles.timingItem}>
            <Text style={styles.timingIcon}>🔥</Text>
            <Text style={styles.timingText}>Cook: {meal.cookTime}m</Text>
          </View>
        )}
        {meal.difficulty && (
          <View style={styles.timingItem}>
            <Text style={styles.timingIcon}>📊</Text>
            <Text style={styles.timingText}>{meal.difficulty}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderActions = () => (
    <View style={styles.actions}>
      {!meal.isLogged && onLogMeal && (
        <Button
          onPress={() => onLogMeal(meal)}
          style={[styles.actionButton, styles.primaryButton]}
        >
          <Text style={styles.primaryButtonText}>Log Meal</Text>
        </Button>
      )}
      
      {meal.isLogged && (
        <View style={styles.actionRow}>
          {editable && onEditMeal && (
            <Button
              onPress={() => onEditMeal(meal)}
              variant="outline"
              style={[styles.actionButton, styles.secondaryButton]}
            >
              <Text style={styles.secondaryButtonText}>Edit</Text>
            </Button>
          )}
          
          {meal.recipe && onViewRecipe && (
            <Button
              onPress={() => onViewRecipe(meal)}
              variant="outline"
              style={[styles.actionButton, styles.secondaryButton]}
            >
              <Text style={styles.secondaryButtonText}>Recipe</Text>
            </Button>
          )}
        </View>
      )}
    </View>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <Card 
      style={[
        styles.card,
        size === 'small' && styles.smallCard,
        size === 'large' && styles.largeCard,
        style
      ]} 
      testID={testID}
      {...props}
    >
      <View style={styles.content}>
        {renderHeader()}
        {renderNutritionSummary()}
        {renderProgress()}
        {renderIngredients()}
        {renderMealTiming()}
        {renderActions()}
        
        {/* Accent border based on meal type */}
        <View style={[styles.accentBorder, { backgroundColor: getMealTypeColor(meal.type) }]} />
      </View>
    </Card>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  card: {
    margin: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  smallCard: {
    minHeight: 150,
  },
  largeCard: {
    minHeight: 400,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: SPACING.md,
    backgroundColor: COLORS.neutral[200],
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  mealName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
    flex: 1,
  },
  scoreIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  scoreText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  mealMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  typeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  mealTime: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  restrictionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  restrictionBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  nutritionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  calorieContainer: {
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  calorieValue: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral[900],
  },
  calorieLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  macrosContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
  },
  macroLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
    marginTop: SPACING.xs,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[700],
    marginBottom: SPACING.sm,
  },
  progressItem: {
    marginBottom: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[900],
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  macroProgressContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  macroProgress: {
    flex: 1,
  },
  macroProgressLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
    marginBottom: SPACING.xs,
  },
  macroProgressValue: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[900],
    marginBottom: SPACING.xs,
  },
  miniProgressBar: {
    height: 4,
    backgroundColor: COLORS.neutral[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  ingredientsContainer: {
    marginBottom: SPACING.md,
  },
  ingredientsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[700],
    marginBottom: SPACING.sm,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  ingredientImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.neutral[200],
  },
  ingredientContent: {
    flex: 1,
  },
  ingredientName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[900],
    marginBottom: SPACING.xs,
  },
  ingredientDetails: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
  },
  ingredientBrand: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[500],
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  ingredientCalories: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[700],
  },
  moreIngredients: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  timingContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  timingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timingIcon: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginRight: SPACING.xs,
  },
  timingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  actions: {
    marginTop: SPACING.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: SPACING.md,
  },
  primaryButton: {
    backgroundColor: COLORS.primary[500],
  },
  secondaryButton: {
    borderColor: COLORS.neutral[300],
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: COLORS.neutral[700],
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textAlign: 'center',
  },
  accentBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});

export default NutritionCard;
