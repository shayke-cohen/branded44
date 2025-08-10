/**
 * Location Blocks Index - AI-Optimized React Native Component Library
 * 
 * This file exports all location-related block components with their TypeScript definitions.
 * These components are optimized for AI agent consumption and code generation.
 * 
 * @author AI Component System
 * @version 1.0.0
 */

// === MAP COMPONENTS ===

export { default as MapCard } from './MapCard';
export type { 
  MapCardProps,
  LocationCoordinates,
  LocationDetails,
  MapMarker,
  RouteInfo,
  MapType,
  MarkerType,
  TravelMode
} from './MapCard';

// === SHARED TYPES AND CONSTANTS ===

export { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
export { cn } from '../../../lib/utils';

/**
 * AI Agent Usage Guide for Location Blocks
 * 
 * Quick Selection Guide:
 * - MapCard: Interactive maps, location display, route planning
 * 
 * Common Implementation Patterns:
 * 
 * 1. Location Display:
 * ```tsx
 * <MapCard
 *   location={currentLocation}
 *   markers={nearbyPlaces}
 *   showCurrentLocation={true}
 *   onLocationPress={handleLocationPress}
 * />
 * ```
 * 
 * 2. Route Planning:
 * ```tsx
 * <MapCard
 *   location={startLocation}
 *   route={routeData}
 *   showRoute={true}
 *   showTraffic={true}
 *   onDirectionsPress={handleDirections}
 * />
 * ```
 * 
 * 3. Points of Interest:
 * ```tsx
 * <MapCard
 *   markers={poiMarkers}
 *   showPOI={true}
 *   onMarkerPress={handleMarkerPress}
 *   onSearch={handleLocationSearch}
 * />
 * ```
 * 
 * Performance Tips:
 * - Cache location data for offline access
 * - Optimize marker rendering for large datasets
 * - Use appropriate zoom levels for context
 * - Implement efficient search and filtering
 * 
 * Accessibility Features:
 * - Screen reader support for location descriptions
 * - Voice navigation for directions
 * - High contrast mode for map visibility
 * - Alternative text descriptions for map content
 */
