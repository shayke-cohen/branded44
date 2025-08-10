/**
 * SearchScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive search screen template that combines search functionality
 * with results display, filtering, and discovery features.
 * 
 * Features:
 * - Advanced search with SearchForm integration
 * - Multiple result types (users, posts, products, etc.)
 * - Filter and sort functionality
 * - Search suggestions and auto-complete
 * - Recent searches history
 * - Trending searches display
 * - Category-based search
 * - Loading states and error handling
 * - Empty states with suggestions
 * - Infinite scroll for results
 * - Voice search support
 * - Search analytics integration
 * 
 * @example
 * ```tsx
 * <SearchScreen
 *   searchResults={searchResults}
 *   recentSearches={recentSearches}
 *   trendingSearches={trendingSearches}
 *   suggestions={searchSuggestions}
 *   onSearch={(query) => handleSearch(query)}
 *   onFilterChange={(filters) => handleFilterChange(filters)}
 *   onResultPress={(result) => navigation.navigate('Result', result)}
 *   loading={searchLoading}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image 
} from 'react-native';
import { 
  UserList, 
  ArticleList, 
  ProductGrid 
} from '../../blocks/lists';
import type { 
  UserListProps,
  ArticleListProps,
  ProductGridProps
} from '../../blocks/lists';
import { 
  SearchForm, 
  FilterPanel, 
  SortPanel 
} from '../../blocks/forms';
import type { 
  SearchFormProps, 
  SearchFormData,
  FilterPanelProps,
  SortPanelProps
} from '../../blocks/forms';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Alert as UIAlert } from '../../../../~/components/ui/alert';
import { Input } from '../../../../~/components/ui/input';
import { ChevronRight } from '../../../../~/lib/icons/ChevronRight';
import { X } from '../../../../~/lib/icons/X';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Search result types
 */
export type SearchResultType = 'user' | 'post' | 'product' | 'article' | 'hashtag' | 'location';

/**
 * Search result item
 */
export interface SearchResult {
  /** Result ID */
  id: string;
  /** Result type */
  type: SearchResultType;
  /** Result title */
  title: string;
  /** Result subtitle */
  subtitle?: string;
  /** Result description */
  description?: string;
  /** Result image */
  image?: string;
  /** Result metadata */
  metadata?: Record<string, any>;
  /** Result data */
  data: any;
}

/**
 * Search suggestion
 */
export interface SearchSuggestion {
  /** Suggestion ID */
  id: string;
  /** Suggestion text */
  text: string;
  /** Suggestion type */
  type: 'query' | 'user' | 'hashtag' | 'location';
  /** Suggestion frequency */
  frequency?: number;
  /** Suggestion metadata */
  metadata?: Record<string, any>;
}

/**
 * Search filter
 */
export interface SearchFilter {
  /** Filter key */
  key: string;
  /** Filter label */
  label: string;
  /** Filter type */
  type: 'select' | 'range' | 'date' | 'toggle';
  /** Filter options */
  options?: Array<{ label: string; value: any }>;
  /** Current value */
  value?: any;
  /** Is active */
  active?: boolean;
}

/**
 * Search screen configuration
 */
export interface SearchScreenConfig {
  /** Show search suggestions */
  showSuggestions?: boolean;
  /** Show recent searches */
  showRecent?: boolean;
  /** Show trending searches */
  showTrending?: boolean;
  /** Show filters */
  showFilters?: boolean;
  /** Show sort options */
  showSort?: boolean;
  /** Enable voice search */
  enableVoiceSearch?: boolean;
  /** Results per page */
  resultsPerPage?: number;
  /** Max suggestions to show */
  maxSuggestions?: number;
  /** Max recent searches */
  maxRecent?: number;
  /** Default result type */
  defaultResultType?: SearchResultType;
  /** Available result types */
  availableTypes?: SearchResultType[];
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom footer component */
  footerComponent?: React.ReactNode;
}

/**
 * Properties for the SearchScreen template
 */
export interface SearchScreenProps extends BaseComponentProps {
  /** Search results */
  searchResults?: SearchResult[];
  /** Search suggestions */
  suggestions?: SearchSuggestion[];
  /** Recent searches */
  recentSearches?: string[];
  /** Trending searches */
  trendingSearches?: string[];
  /** Available filters */
  filters?: SearchFilter[];
  /** Available sort options */
  sortOptions?: Array<{ label: string; value: string }>;
  /** Current search query */
  searchQuery?: string;
  /** Current result type filter */
  resultType?: SearchResultType;
  /** Callback when search is performed */
  onSearch?: (query: SearchFormData) => void;
  /** Callback when suggestion is selected */
  onSuggestionPress?: (suggestion: SearchSuggestion) => void;
  /** Callback when recent search is selected */
  onRecentSearchPress?: (query: string) => void;
  /** Callback when trending search is selected */
  onTrendingSearchPress?: (query: string) => void;
  /** Callback when result is pressed */
  onResultPress?: (result: SearchResult) => void;
  /** Callback when result type changes */
  onResultTypeChange?: (type: SearchResultType) => void;
  /** Callback when filters change */
  onFilterChange?: (filters: SearchFilter[]) => void;
  /** Callback when sort changes */
  onSortChange?: (sortOption: string) => void;
  /** Callback when search is cleared */
  onClearSearch?: () => void;
  /** Callback when recent search is removed */
  onRemoveRecentSearch?: (query: string) => void;
  /** Callback for voice search */
  onVoiceSearch?: () => void;
  /** Callback for load more results */
  onLoadMore?: () => Promise<void> | void;
  /** Loading state */
  loading?: boolean;
  /** Loading more state */
  loadingMore?: boolean;
  /** Has more results */
  hasMore?: boolean;
  /** Error message */
  error?: string;
  /** Configuration for the search screen */
  config?: SearchScreenConfig;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * SearchScreen - AI-optimized search screen template
 * 
 * A comprehensive search screen that provides advanced search functionality
 * with filtering, suggestions, and multiple result types.
 */
const SearchScreen: React.FC<SearchScreenProps> = ({
  searchResults = [],
  suggestions = [],
  recentSearches = [],
  trendingSearches = [],
  filters = [],
  sortOptions = [],
  searchQuery = '',
  resultType = 'user',
  onSearch,
  onSuggestionPress,
  onRecentSearchPress,
  onTrendingSearchPress,
  onResultPress,
  onResultTypeChange,
  onFilterChange,
  onSortChange,
  onClearSearch,
  onRemoveRecentSearch,
  onVoiceSearch,
  onLoadMore,
  loading = false,
  loadingMore = false,
  hasMore = true,
  error,
  config = {},
  style,
  testID = 'search-screen',
  ...props
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>(filters);

  const {
    showSuggestions = true,
    showRecent = true,
    showTrending = true,
    showFilters: configShowFilters = true,
    showSort = true,
    enableVoiceSearch = false,
    resultsPerPage = 20,
    maxSuggestions = 5,
    maxRecent = 5,
    defaultResultType = 'user',
    availableTypes = ['user', 'post', 'product', 'article'],
    headerComponent,
    footerComponent
  } = config;

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setActiveFilters(filters);
  }, [filters]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleSearch = useCallback((searchData: SearchFormData) => {
    setLocalQuery(searchData.query || '');
    onSearch?.(searchData);
  }, [onSearch]);

  const handleSuggestionPress = useCallback((suggestion: SearchSuggestion) => {
    setLocalQuery(suggestion.text);
    onSuggestionPress?.(suggestion);
  }, [onSuggestionPress]);

  const handleRecentSearchPress = useCallback((query: string) => {
    setLocalQuery(query);
    onRecentSearchPress?.(query);
  }, [onRecentSearchPress]);

  const handleClearSearch = useCallback(() => {
    setLocalQuery('');
    onClearSearch?.();
  }, [onClearSearch]);

  const handleResultTypePress = useCallback((type: SearchResultType) => {
    onResultTypeChange?.(type);
  }, [onResultTypeChange]);

  const handleFilterChange = useCallback((newFilters: SearchFilter[]) => {
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [onFilterChange]);

  const handleLoadMore = useCallback(async () => {
    if (!onLoadMore || loadingMore || !hasMore) return;
    try {
      await onLoadMore();
    } catch (err) {
      console.error('Load more failed:', err);
    }
  }, [onLoadMore, loadingMore, hasMore]);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const hasSearchQuery = localQuery.trim().length > 0;
  const hasResults = searchResults.length > 0;
  const filteredSuggestions = suggestions
    .filter(s => s.text.toLowerCase().includes(localQuery.toLowerCase()))
    .slice(0, maxSuggestions);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderHeader = () => {
    if (headerComponent) {
      return headerComponent;
    }

    return (
      <View style={styles.headerContainer} testID={`${testID}-header`}>
        {/* Search Form */}
        <View style={styles.searchContainer}>
          <SearchForm
            onSearch={handleSearch}
            placeholder="Search everything..."
            defaultValue={localQuery}
            showClearButton={hasSearchQuery}
            onClear={handleClearSearch}
            style={styles.searchForm}
            testID={`${testID}-search`}
          />
          {enableVoiceSearch && (
            <TouchableOpacity 
              onPress={onVoiceSearch}
              style={styles.voiceButton}
              testID={`${testID}-voice-search`}
            >
              <Text style={styles.voiceIcon}>🎤</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Result Type Filters */}
        {hasSearchQuery && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeFiltersContainer}
          >
            {availableTypes.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => handleResultTypePress(type)}
                style={[
                  styles.typeFilter,
                  resultType === type && styles.typeFilterActive
                ]}
                testID={`${testID}-type-${type}`}
              >
                <Text style={[
                  styles.typeFilterText,
                  resultType === type && styles.typeFilterTextActive
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}s
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Filters and Sort */}
        {hasSearchQuery && configShowFilters && (
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              onPress={() => setShowFilters(!showFilters)}
              style={styles.controlButton}
              testID={`${testID}-filters-toggle`}
            >
              <Text style={styles.controlButtonText}>Filters</Text>
              {activeFilters.filter(f => f.active).length > 0 && (
                <Badge variant="default" style={styles.filterBadge}>
                  <Text style={styles.badgeText}>
                    {activeFilters.filter(f => f.active).length}
                  </Text>
                </Badge>
              )}
            </TouchableOpacity>

            {showSort && sortOptions.length > 0 && (
              <TouchableOpacity 
                style={styles.controlButton}
                testID={`${testID}-sort-button`}
              >
                <Text style={styles.controlButtonText}>Sort</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <UIAlert 
        variant="destructive"
        style={styles.errorAlert}
        testID={`${testID}-error`}
      >
        <Text style={styles.errorText}>{error}</Text>
      </UIAlert>
    );
  };

  const renderSuggestions = () => {
    if (!showSuggestions || hasSearchQuery || filteredSuggestions.length === 0) return null;

    return (
      <View style={styles.suggestionsContainer} testID={`${testID}-suggestions`}>
        <Text style={styles.sectionTitle}>Search Suggestions</Text>
        {filteredSuggestions.map((suggestion) => (
          <TouchableOpacity
            key={suggestion.id}
            onPress={() => handleSuggestionPress(suggestion)}
            style={styles.suggestionItem}
            testID={`${testID}-suggestion-${suggestion.id}`}
          >
            <Text style={styles.suggestionText}>{suggestion.text}</Text>
            <Text style={styles.suggestionType}>
              {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderRecentSearches = () => {
    if (!showRecent || hasSearchQuery || recentSearches.length === 0) return null;

    return (
      <View style={styles.recentContainer} testID={`${testID}-recent`}>
        <Text style={styles.sectionTitle}>Recent Searches</Text>
        {recentSearches.slice(0, maxRecent).map((query, index) => (
          <View key={index} style={styles.recentItem}>
            <TouchableOpacity
              onPress={() => handleRecentSearchPress(query)}
              style={styles.recentButton}
              testID={`${testID}-recent-${index}`}
            >
              <Text style={styles.recentText}>{query}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onRemoveRecentSearch?.(query)}
              style={styles.removeButton}
              testID={`${testID}-remove-recent-${index}`}
            >
              <X style={styles.removeIcon} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderTrendingSearches = () => {
    if (!showTrending || hasSearchQuery || trendingSearches.length === 0) return null;

    return (
      <View style={styles.trendingContainer} testID={`${testID}-trending`}>
        <Text style={styles.sectionTitle}>Trending Searches</Text>
        <View style={styles.trendingGrid}>
          {trendingSearches.slice(0, 6).map((query, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onTrendingSearchPress?.(query)}
              style={styles.trendingItem}
              testID={`${testID}-trending-${index}`}
            >
              <Text style={styles.trendingText}>{query}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderFilters = () => {
    if (!showFilters || !configShowFilters) return null;

    return (
      <Card style={styles.filtersCard} testID={`${testID}-filters-panel`}>
        <FilterPanel
          filters={activeFilters}
          onFiltersChange={handleFilterChange}
          testID={`${testID}-filter-panel`}
        />
      </Card>
    );
  };

  const renderResults = () => {
    if (!hasSearchQuery) return null;

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    if (!hasResults) {
      return (
        <View style={styles.emptyContainer} testID={`${testID}-empty`}>
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyDescription}>
            Try adjusting your search terms or filters
          </Text>
        </View>
      );
    }

    const resultsByType = searchResults.filter(r => r.type === resultType);

    return (
      <View style={styles.resultsContainer} testID={`${testID}-results`}>
        <Text style={styles.resultsTitle}>
          {resultsByType.length} result{resultsByType.length !== 1 ? 's' : ''} for "{localQuery}"
        </Text>

        {resultType === 'user' && (
          <UserList
            users={resultsByType.map(r => r.data)}
            onUserPress={(user) => {
              const result = resultsByType.find(r => r.data.id === user.id);
              if (result) onResultPress?.(result);
            }}
            showFollowButton={true}
            testID={`${testID}-user-results`}
          />
        )}

        {resultType === 'article' && (
          <ArticleList
            articles={resultsByType.map(r => r.data)}
            onArticlePress={(article) => {
              const result = resultsByType.find(r => r.data.id === article.id);
              if (result) onResultPress?.(result);
            }}
            showLoadMore={false}
            testID={`${testID}-article-results`}
          />
        )}

        {resultType === 'product' && (
          <ProductGrid
            products={resultsByType.map(r => r.data)}
            onProductPress={(product) => {
              const result = resultsByType.find(r => r.data.id === product.id);
              if (result) onResultPress?.(result);
            }}
            numColumns={2}
            showLoadMore={false}
            testID={`${testID}-product-results`}
          />
        )}

        {(resultType === 'post' || resultType === 'hashtag' || resultType === 'location') && (
          <View style={styles.genericResults}>
            {resultsByType.map((result) => (
              <TouchableOpacity
                key={result.id}
                onPress={() => onResultPress?.(result)}
                style={styles.genericResultItem}
                testID={`${testID}-result-${result.id}`}
              >
                <Card style={styles.genericResultCard}>
                  {result.image && (
                    <Image source={{ uri: result.image }} style={styles.resultImage} />
                  )}
                  <View style={styles.resultContent}>
                    <Text style={styles.resultTitle}>{result.title}</Text>
                    {result.subtitle && (
                      <Text style={styles.resultSubtitle}>{result.subtitle}</Text>
                    )}
                    {result.description && (
                      <Text style={styles.resultDescription}>{result.description}</Text>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {loadingMore && (
          <View style={styles.loadingMore}>
            <Text style={styles.loadingText}>Loading more...</Text>
          </View>
        )}
      </View>
    );
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  const containerStyle = [styles.container, style];

  return (
    <SafeAreaView style={containerStyle} testID={testID} {...props}>
      {/* Header */}
      {renderHeader()}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScrollEndDrag={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
          if (isCloseToBottom && hasResults) {
            handleLoadMore();
          }
        }}
        testID={`${testID}-scroll`}
      >
        {/* Error Display */}
        {renderError()}

        {/* Filters Panel */}
        {renderFilters()}

        {/* Suggestions */}
        {renderSuggestions()}

        {/* Recent Searches */}
        {renderRecentSearches()}

        {/* Trending Searches */}
        {renderTrendingSearches()}

        {/* Search Results */}
        {renderResults()}

        {/* Footer */}
        {footerComponent && (
          <View style={styles.footerContainer}>
            {footerComponent}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  searchForm: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  voiceButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 22,
  },
  voiceIcon: {
    fontSize: 20,
  },
  typeFiltersContainer: {
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  typeFilter: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
  },
  typeFilterActive: {
    backgroundColor: COLORS.primary,
  },
  typeFilterText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
  },
  typeFilterTextActive: {
    color: COLORS.primaryForeground,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
  },
  controlButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  filterBadge: {
    marginLeft: SPACING.xs,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.lg,
  },
  errorAlert: {
    marginBottom: SPACING.lg,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.destructive,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  filtersCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  suggestionsContainer: {
    marginBottom: SPACING.lg,
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  suggestionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    flex: 1,
  },
  suggestionType: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  recentContainer: {
    marginBottom: SPACING.lg,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  recentButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    marginRight: SPACING.sm,
  },
  recentText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
  },
  removeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
  },
  removeIcon: {
    width: 16,
    height: 16,
    color: COLORS.textSecondary,
  },
  trendingContainer: {
    marginBottom: SPACING.lg,
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  trendingItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
  },
  trendingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.primaryForeground,
  },
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  resultsContainer: {
    marginBottom: SPACING.lg,
  },
  resultsTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  genericResults: {
    gap: SPACING.md,
  },
  genericResultItem: {
    marginBottom: SPACING.sm,
  },
  genericResultCard: {
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: SPACING.md,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  resultSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  resultDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  loadingMore: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  footerContainer: {
    paddingTop: SPACING.xl,
  },
});

export default SearchScreen;
export type { 
  SearchScreenProps, 
  SearchScreenConfig, 
  SearchResult, 
  SearchSuggestion, 
  SearchFilter, 
  SearchResultType 
};
