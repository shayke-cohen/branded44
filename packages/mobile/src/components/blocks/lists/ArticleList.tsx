/**
 * ArticleList - News/Blog Articles Display Block Component
 */

import React from 'react';
import { View, FlatList } from 'react-native';
import { Card, CardContent } from '../../../../~/components/ui/card';
import { Text } from '../../../../~/components/ui/text';
import { Badge } from '../../../../~/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../../../~/components/ui/avatar';
import { cn, formatDate } from '../../../lib/utils';
import { LoadingState } from '../../../lib/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { Clock, User } from 'lucide-react-native';

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: { name: string; avatar?: string };
  publishedAt: string;
  readTime: number;
  category: string;
  image?: string;
  tags?: string[];
}

export interface ArticleListProps {
  articles: Article[];
  onArticlePress: (article: Article) => void;
  loading?: LoadingState;
  style?: any;
  className?: string;
  testID?: string;
}

export const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  onArticlePress,
  loading = 'idle',
  style,
  className,
  testID = 'article-list',
}) => {
  const renderArticle = ({ item: article }: { item: Article }) => (
    <Card style={{ marginBottom: SPACING.md }} onPress={() => onArticlePress(article)}>
      <CardContent style={{ padding: SPACING.lg }}>
        <View style={{ flexDirection: 'row', gap: SPACING.md }}>
          {article.image && (
            <Avatar style={{ width: 80, height: 80, borderRadius: 8 }}>
              <AvatarImage source={{ uri: article.image }} />
              <AvatarFallback>
                <Text>{article.title.charAt(0)}</Text>
              </AvatarFallback>
            </Avatar>
          )}
          
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs }}>
              <Badge variant="secondary">
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs }}>{article.category}</Text>
              </Badge>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }}>
                <Clock size={12} color={COLORS.neutral[500]} />
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.neutral[500] }}>
                  {article.readTime} min read
                </Text>
              </View>
            </View>
            
            <Text style={{ 
              fontSize: TYPOGRAPHY.fontSize.lg,
              fontWeight: TYPOGRAPHY.fontWeight.semibold,
              marginBottom: SPACING.sm
            }} numberOfLines={2}>
              {article.title}
            </Text>
            
            <Text style={{ 
              fontSize: TYPOGRAPHY.fontSize.sm,
              color: COLORS.neutral[600],
              marginBottom: SPACING.sm
            }} numberOfLines={3}>
              {article.excerpt}
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                <Avatar style={{ width: 24, height: 24 }}>
                  <AvatarImage source={{ uri: article.author.avatar }} />
                  <AvatarFallback>
                    <User size={12} color={COLORS.neutral[500]} />
                  </AvatarFallback>
                </Avatar>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] }}>
                  {article.author.name}
                </Text>
              </View>
              
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[500] }}>
                {formatDate(article.publishedAt, 'relative')}
              </Text>
            </View>
          </View>
        </View>
      </CardContent>
    </Card>
  );

  return (
    <View style={style} className={cn('article-list', className)} testID={testID}>
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={renderArticle}
        contentContainerStyle={{ padding: SPACING.md }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
            <Text style={{ color: COLORS.neutral[500] }}>No articles found</Text>
          </View>
        }
      />
    </View>
  );
};

export default ArticleList;
