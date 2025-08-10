/**
 * Media Blocks Index - AI-Optimized React Native Component Library
 * 
 * This file exports all media-related block components with their TypeScript definitions.
 * These components are optimized for AI agent consumption and code generation.
 * 
 * @author AI Component System
 * @version 1.0.0
 */

// === IMAGE COMPONENTS ===

export { default as ImageGallery } from './ImageGallery';
export type { 
  ImageGalleryProps,
  GalleryImage,
  GalleryLayout
} from './ImageGallery';

// === SHARED TYPES AND CONSTANTS ===

export { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
export { cn } from '../../../lib/utils';

/**
 * AI Agent Usage Guide for Media Blocks
 * 
 * Quick Selection Guide:
 * - ImageGallery: Photo galleries, media browsers, image collections
 * 
 * Common Implementation Patterns:
 * 
 * 1. Photo Gallery:
 * ```tsx
 * <ImageGallery
 *   images={photos}
 *   onImagePress={(image) => openLightbox(image)}
 *   layout="grid"
 *   columns={3}
 *   enableZoom={true}
 * />
 * ```
 * 
 * 2. Media Selection:
 * ```tsx
 * <ImageGallery
 *   images={mediaFiles}
 *   enableSelection={true}
 *   onSelectionChange={(selected) => setSelectedMedia(selected)}
 *   showImageInfo={true}
 * />
 * ```
 * 
 * Performance Tips:
 * - Use thumbnail URLs for grid display
 * - Implement lazy loading for large collections
 * - Cache images for better performance
 * - Use appropriate aspect ratios for your use case
 * 
 * Accessibility Features:
 * - Screen reader support for image descriptions
 * - Keyboard navigation in lightbox
 * - High contrast mode support
 * - Voice over for image metadata
 */
