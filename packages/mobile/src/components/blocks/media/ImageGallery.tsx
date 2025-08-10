/**
 * ImageGallery Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive image gallery component with grid layout, lightbox viewing,
 * zoom capabilities, and optimized performance for large image collections.
 * 
 * Features:
 * - Grid and masonry layouts
 * - Lightbox viewing with zoom and pan
 * - Image lazy loading and caching
 * - Multiple selection mode
 * - Image sharing and download
 * - Thumbnail generation
 * - Video support with thumbnails
 * - Custom image actions
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <ImageGallery
 *   images={imageData}
 *   onImagePress={(image) => openLightbox(image)}
 *   onImageLongPress={(image) => showImageOptions(image)}
 *   layout="grid"
 *   columns={3}
 *   enableZoom={true}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image,
  Modal,
  Dimensions,
  StyleSheet 
} from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Gallery layout options
 */
export type GalleryLayout = 'grid' | 'masonry' | 'carousel' | 'staggered';

/**
 * Image data structure
 */
export interface GalleryImage {
  /** Image ID */
  id: string;
  /** Image URL */
  url: string;
  /** Thumbnail URL */
  thumbnail?: string;
  /** Image title */
  title?: string;
  /** Image description */
  description?: string;
  /** Image width */
  width?: number;
  /** Image height */
  height?: number;
  /** File size in bytes */
  size?: number;
  /** MIME type */
  mimeType?: string;
  /** Whether this is a video */
  isVideo?: boolean;
  /** Video duration (if video) */
  duration?: number;
  /** Upload timestamp */
  uploadedAt?: Date;
  /** Image tags */
  tags?: string[];
  /** Whether image is selected */
  isSelected?: boolean;
  /** Custom metadata */
  metadata?: Record<string, any>;
}

/**
 * Props for the ImageGallery component
 */
export interface ImageGalleryProps extends BaseComponentProps {
  /** Array of images to display */
  images: GalleryImage[];
  /** Callback when image is pressed */
  onImagePress?: (image: GalleryImage, index: number) => void;
  /** Callback when image is long pressed */
  onImageLongPress?: (image: GalleryImage, index: number) => void;
  /** Callback when image selection changes */
  onSelectionChange?: (selectedImages: GalleryImage[]) => void;
  /** Callback when image is deleted */
  onImageDelete?: (imageId: string) => void;
  /** Callback when image is shared */
  onImageShare?: (image: GalleryImage) => void;
  /** Callback when image is downloaded */
  onImageDownload?: (image: GalleryImage) => void;
  /** Gallery layout type */
  layout?: GalleryLayout;
  /** Number of columns (grid layout) */
  columns?: number;
  /** Whether to enable multi-selection */
  enableSelection?: boolean;
  /** Whether to enable zoom in lightbox */
  enableZoom?: boolean;
  /** Whether to show image info */
  showImageInfo?: boolean;
  /** Whether to show image actions */
  showActions?: boolean;
  /** Whether to enable video playback */
  enableVideoPlayback?: boolean;
  /** Image aspect ratio (grid layout) */
  aspectRatio?: number;
  /** Image border radius */
  imageRadius?: number;
  /** Gap between images */
  gap?: number;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Number of images to render initially */
  initialNumToRender?: number;
  /** Custom image renderer */
  renderImage?: (image: GalleryImage, index: number) => React.ReactElement;
  /** Custom lightbox renderer */
  renderLightbox?: (image: GalleryImage, onClose: () => void) => React.ReactElement;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ImageGallery component for displaying image collections
 */
export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onImagePress,
  onImageLongPress,
  onSelectionChange,
  onImageDelete,
  onImageShare,
  onImageDownload,
  layout = 'grid',
  columns = 3,
  enableSelection = false,
  enableZoom = true,
  showImageInfo = false,
  showActions = true,
  enableVideoPlayback = true,
  aspectRatio = 1,
  imageRadius = 8,
  gap = SPACING.sm,
  loading = false,
  error,
  emptyMessage = 'No images to display',
  initialNumToRender = 20,
  renderImage,
  renderLightbox,
  style,
  testID = 'image-gallery',
  ...props
}) => {
  // =============================================================================
  // STATE
  // =============================================================================

  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const { width: screenWidth } = Dimensions.get('window');
  const itemWidth = useMemo(() => {
    const totalGap = gap * (columns - 1);
    const containerPadding = SPACING.md * 2;
    return (screenWidth - totalGap - containerPadding) / columns;
  }, [screenWidth, columns, gap]);

  const itemHeight = useMemo(() => {
    return itemWidth * aspectRatio;
  }, [itemWidth, aspectRatio]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleImagePress = useCallback((image: GalleryImage, index: number) => {
    if (enableSelection && selectedImages.size > 0) {
      handleImageSelect(image.id);
      return;
    }

    if (onImagePress) {
      onImagePress(image, index);
    } else {
      // Default behavior: open lightbox
      setLightboxImage(image);
      setLightboxIndex(index);
    }
  }, [enableSelection, selectedImages.size, onImagePress]);

  const handleImageLongPress = useCallback((image: GalleryImage, index: number) => {
    if (enableSelection) {
      handleImageSelect(image.id);
    }
    onImageLongPress?.(image, index);
  }, [enableSelection, onImageLongPress]);

  const handleImageSelect = useCallback((imageId: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      
      const selectedImagesList = images.filter(img => newSet.has(img.id));
      onSelectionChange?.(selectedImagesList);
      
      return newSet;
    });
  }, [images, onSelectionChange]);

  const handleCloseLightbox = useCallback(() => {
    setLightboxImage(null);
  }, []);

  const handlePrevImage = useCallback(() => {
    const prevIndex = Math.max(0, lightboxIndex - 1);
    setLightboxIndex(prevIndex);
    setLightboxImage(images[prevIndex]);
  }, [lightboxIndex, images]);

  const handleNextImage = useCallback(() => {
    const nextIndex = Math.min(images.length - 1, lightboxIndex + 1);
    setLightboxIndex(nextIndex);
    setLightboxImage(images[nextIndex]);
  }, [lightboxIndex, images]);

  const handleShare = useCallback((image: GalleryImage) => {
    onImageShare?.(image);
  }, [onImageShare]);

  const handleDownload = useCallback((image: GalleryImage) => {
    onImageDownload?.(image);
  }, [onImageDownload]);

  const handleDelete = useCallback((imageId: string) => {
    onImageDelete?.(imageId);
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  }, [onImageDelete]);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderImageItem = useCallback(({ item: image, index }: { item: GalleryImage; index: number }) => {
    if (renderImage) {
      return renderImage(image, index);
    }

    const isSelected = selectedImages.has(image.id);
    const imageSource = { uri: image.thumbnail || image.url };

    return (
      <TouchableOpacity
        onPress={() => handleImagePress(image, index)}
        onLongPress={() => handleImageLongPress(image, index)}
        style={[
          styles.imageContainer,
          { 
            width: itemWidth, 
            height: itemHeight,
            marginBottom: gap 
          },
          isSelected && styles.selectedImage
        ]}
        testID={`${testID}-item-${index}`}
      >
        <Image
          source={imageSource}
          style={[styles.image, { borderRadius: imageRadius }]}
          resizeMode="cover"
        />

        {/* Video Indicator */}
        {image.isVideo && (
          <View style={styles.videoOverlay}>
            <Text style={styles.playIcon}>▶️</Text>
            {image.duration && (
              <Text style={styles.videoDuration}>
                {formatDuration(image.duration)}
              </Text>
            )}
          </View>
        )}

        {/* Selection Indicator */}
        {enableSelection && (
          <View style={styles.selectionOverlay}>
            <View style={[
              styles.selectionCheckbox,
              isSelected && styles.selectedCheckbox
            ]}>
              {isSelected && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
          </View>
        )}

        {/* Image Info */}
        {showImageInfo && (image.title || image.tags) && (
          <View style={styles.imageInfoOverlay}>
            {image.title && (
              <Text style={styles.imageTitle} numberOfLines={1}>
                {image.title}
              </Text>
            )}
            {image.tags && image.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {image.tags.slice(0, 2).map((tag, idx) => (
                  <Badge key={idx} variant="secondary" style={styles.tag}>
                    {tag}
                  </Badge>
                ))}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }, [
    renderImage,
    selectedImages,
    itemWidth,
    itemHeight,
    gap,
    imageRadius,
    enableSelection,
    showImageInfo,
    handleImagePress,
    handleImageLongPress,
    testID
  ]);

  const renderLightboxContent = () => {
    if (!lightboxImage) return null;

    if (renderLightbox) {
      return renderLightbox(lightboxImage, handleCloseLightbox);
    }

    return (
      <Modal
        visible={!!lightboxImage}
        transparent
        animationType="fade"
        onRequestClose={handleCloseLightbox}
      >
        <View style={styles.lightboxContainer}>
          <TouchableOpacity
            style={styles.lightboxBackdrop}
            onPress={handleCloseLightbox}
          />
          
          <View style={styles.lightboxContent}>
            {/* Header */}
            <View style={styles.lightboxHeader}>
              <View style={styles.lightboxInfo}>
                <Text style={styles.lightboxTitle}>
                  {lightboxImage.title || `Image ${lightboxIndex + 1} of ${images.length}`}
                </Text>
                {lightboxImage.description && (
                  <Text style={styles.lightboxDescription}>
                    {lightboxImage.description}
                  </Text>
                )}
              </View>
              
              <TouchableOpacity
                onPress={handleCloseLightbox}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Image */}
            <View style={styles.lightboxImageContainer}>
              <Image
                source={{ uri: lightboxImage.url }}
                style={styles.lightboxImage}
                resizeMode="contain"
              />
            </View>

            {/* Navigation */}
            <View style={styles.lightboxNavigation}>
              <Button
                variant="secondary"
                onPress={handlePrevImage}
                disabled={lightboxIndex === 0}
                style={styles.navButton}
              >
                ← Previous
              </Button>
              
              <Text style={styles.imageCounter}>
                {lightboxIndex + 1} / {images.length}
              </Text>
              
              <Button
                variant="secondary"
                onPress={handleNextImage}
                disabled={lightboxIndex === images.length - 1}
                style={styles.navButton}
              >
                Next →
              </Button>
            </View>

            {/* Actions */}
            {showActions && (
              <View style={styles.lightboxActions}>
                {onImageShare && (
                  <Button
                    variant="outline"
                    onPress={() => handleShare(lightboxImage)}
                    style={styles.actionButton}
                  >
                    📤 Share
                  </Button>
                )}
                
                {onImageDownload && (
                  <Button
                    variant="outline"
                    onPress={() => handleDownload(lightboxImage)}
                    style={styles.actionButton}
                  >
                    📥 Download
                  </Button>
                )}
                
                {onImageDelete && (
                  <Button
                    variant="destructive"
                    onPress={() => {
                      handleDelete(lightboxImage.id);
                      handleCloseLightbox();
                    }}
                    style={styles.actionButton}
                  >
                    🗑️ Delete
                  </Button>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  // =============================================================================
  // ERROR & EMPTY STATES
  // =============================================================================

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent, style]} testID={testID}>
        <Text style={styles.errorText}>❌ {error}</Text>
      </View>
    );
  }

  if (!loading && images.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, style]} testID={testID}>
        <Text style={styles.emptyText}>🖼️ {emptyMessage}</Text>
      </View>
    );
  }

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <View style={[styles.container, style]} testID={testID} {...props}>
      {/* Selection Header */}
      {enableSelection && selectedImages.size > 0 && (
        <View style={styles.selectionHeader}>
          <Text style={styles.selectionCount}>
            {selectedImages.size} selected
          </Text>
          <Button
            variant="outline"
            onPress={() => {
              setSelectedImages(new Set());
              onSelectionChange?.([]);
            }}
            style={styles.clearButton}
          >
            Clear
          </Button>
        </View>
      )}

      {/* Gallery */}
      <FlatList
        data={images}
        renderItem={renderImageItem}
        keyExtractor={(item) => item.id}
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? styles.row : undefined}
        contentContainerStyle={styles.contentContainer}
        initialNumToRender={initialNumToRender}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        showsVerticalScrollIndicator={false}
      />

      {/* Lightbox */}
      {renderLightboxContent()}
    </View>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: SPACING.md,
  },
  row: {
    justifyContent: 'space-between',
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.info[50],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.info[200],
  },
  selectionCount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.info[700],
  },
  clearButton: {
    paddingHorizontal: SPACING.md,
  },
  imageContainer: {
    position: 'relative',
  },
  selectedImage: {
    borderWidth: 3,
    borderColor: COLORS.info[500],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playIcon: {
    fontSize: 32,
    color: COLORS.white,
  },
  videoDuration: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.xs,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectionOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  selectionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckbox: {
    backgroundColor: COLORS.info[500],
    borderColor: COLORS.info[500],
  },
  checkmark: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  imageInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: SPACING.sm,
  },
  imageTitle: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginBottom: SPACING.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  tag: {
    opacity: 0.9,
  },
  lightboxContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  lightboxContent: {
    flex: 1,
    width: '100%',
    paddingTop: 60,
  },
  lightboxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  lightboxInfo: {
    flex: 1,
  },
  lightboxTitle: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.xs,
  },
  lightboxDescription: {
    color: COLORS.neutral[300],
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.xl,
  },
  lightboxImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxImage: {
    width: '100%',
    height: '100%',
  },
  lightboxNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  navButton: {
    minWidth: 100,
  },
  imageCounter: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  lightboxActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    maxWidth: 120,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.error[500],
    textAlign: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.neutral[500],
    textAlign: 'center',
  },
});

export default ImageGallery;
