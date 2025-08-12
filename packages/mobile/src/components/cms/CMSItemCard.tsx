/**
 * CMSItemCard - Reusable CMS item display component
 * 
 * Displays individual CMS items with actions
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { createCMSStyles } from '../../shared/styles/CMSStyles';
import type { CMSItem } from '../../screens/wix/content/shared/WixCMSService';

interface CMSItemCardProps {
  item: CMSItem;
  onPress?: (item: CMSItem) => void;
  onEdit?: (item: CMSItem) => void;
  onDelete?: (item: CMSItem) => void;
  showActions?: boolean;
  style?: any;
}

export const CMSItemCard: React.FC<CMSItemCardProps> = ({
  item,
  onPress,
  onEdit,
  onDelete,
  showActions = true,
  style,
}) => {
  const { theme } = useTheme();
  const styles = createCMSStyles(theme);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString();
  };

  const truncateContent = (content?: string, maxLength = 150) => {
    if (!content) return 'No content available';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handlePress = () => {
    if (onPress) {
      onPress(item);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(item);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(item);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.itemCard, style]}
      onPress={handlePress}
      disabled={!onPress}
    >
      {/* Header */}
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title || item._id || 'Untitled Item'}
        </Text>
      </View>

      {/* Meta information */}
      <View style={styles.itemMeta}>
        {item.author && (
          <Text style={styles.itemMetaText}>
            👤 {item.author}
          </Text>
        )}
        {item.category && (
          <Text style={styles.itemMetaText}>
            🏷️ {item.category}
          </Text>
        )}
        <Text style={styles.itemMetaText}>
          📅 {formatDate(item.publishDate || item._createdDate)}
        </Text>
      </View>

      {/* Content preview */}
      <Text style={styles.itemContent}>
        {truncateContent(item.content)}
      </Text>

      {/* Footer with actions */}
      <View style={styles.itemFooter}>
        <Text style={styles.itemMetaText}>
          ID: {item._id?.substring(0, 8)}...
        </Text>

        {showActions && (
          <View style={styles.itemActions}>
            {onEdit && (
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={handleEdit}
              >
                <Text style={[styles.actionButtonText, styles.editButtonText]}>
                  Edit
                </Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                  Delete
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default CMSItemCard;
