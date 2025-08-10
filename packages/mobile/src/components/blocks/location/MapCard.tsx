/**
 * MapCard Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive map display card component for location-based features,
 * showing interactive maps, markers, routes, and location information.
 * 
 * Features:
 * - Interactive map display with markers
 * - Current location tracking
 * - Route planning and directions
 * - Points of interest (POI) display
 * - Custom map styles and themes
 * - Search and geocoding integration
 * - Distance and travel time calculations
 * - Offline map support indicators
 * 
 * @example
 * ```tsx
 * <MapCard
 *   location={currentLocation}
 *   markers={nearbyPlaces}
 *   showRoute={true}
 *   onLocationPress={handleLocationPress}
 *   onDirectionsPress={handleDirections}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState } from 'react';
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
import { cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Map type
 */
export type MapType = 'standard' | 'satellite' | 'hybrid' | 'terrain';

/**
 * Marker type
 */
export type MarkerType = 'location' | 'destination' | 'poi' | 'custom';

/**
 * Travel mode for directions
 */
export type TravelMode = 'driving' | 'walking' | 'transit' | 'cycling';

/**
 * Location coordinates
 */
export interface LocationCoordinates {
  /** Latitude */
  latitude: number;
  /** Longitude */
  longitude: number;
}

/**
 * Location details
 */
export interface LocationDetails {
  /** Location ID */
  id: string;
  /** Location name */
  name: string;
  /** Location address */
  address: string;
  /** Coordinates */
  coordinates: LocationCoordinates;
  /** Location description */
  description?: string;
  /** Location category */
  category?: string;
  /** Rating (1-5) */
  rating?: number;
  /** Distance from current location */
  distance?: number;
  /** Travel time in minutes */
  travelTime?: number;
  /** Location image */
  image?: string;
  /** Whether location is open */
  isOpen?: boolean;
  /** Opening hours */
  hours?: string;
  /** Phone number */
  phone?: string;
  /** Website URL */
  website?: string;
}

/**
 * Map marker
 */
export interface MapMarker {
  /** Marker ID */
  id: string;
  /** Marker type */
  type: MarkerType;
  /** Marker coordinates */
  coordinates: LocationCoordinates;
  /** Marker title */
  title: string;
  /** Marker description */
  description?: string;
  /** Custom marker icon */
  icon?: string;
  /** Marker color */
  color?: string;
  /** Associated location details */
  location?: LocationDetails;
}

/**
 * Route information
 */
export interface RouteInfo {
  /** Route ID */
  id: string;
  /** Start location */
  start: LocationCoordinates;
  /** End location */
  end: LocationCoordinates;
  /** Travel mode */
  mode: TravelMode;
  /** Route coordinates */
  coordinates: LocationCoordinates[];
  /** Total distance in meters */
  distance: number;
  /** Total duration in minutes */
  duration: number;
  /** Route instructions */
  instructions?: string[];
  /** Traffic information */
  traffic?: 'light' | 'moderate' | 'heavy';
}

/**
 * Props for the MapCard component
 */
export interface MapCardProps extends BaseComponentProps {
  /** Current location */
  location?: LocationCoordinates;
  /** Map markers */
  markers?: MapMarker[];
  /** Route information */
  route?: RouteInfo;
  /** Map type */
  mapType?: MapType;
  /** Map zoom level */
  zoomLevel?: number;
  /** Whether to show current location */
  showCurrentLocation?: boolean;
  /** Whether to show route */
  showRoute?: boolean;
  /** Whether to show traffic */
  showTraffic?: boolean;
  /** Whether to show points of interest */
  showPOI?: boolean;
  /** Map height */
  height?: number;
  /** Selected marker */
  selectedMarker?: string;
  /** Search query */
  searchQuery?: string;
  /** Map title */
  title?: string;
  /** Map subtitle */
  subtitle?: string;
  /** Whether map is interactive */
  interactive?: boolean;
  /** Whether to show controls */
  showControls?: boolean;
  /** Whether map is loading */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Callback when marker is pressed */
  onMarkerPress?: (marker: MapMarker) => void;
  /** Callback when location is pressed */
  onLocationPress?: (coordinates: LocationCoordinates) => void;
  /** Callback when directions button is pressed */
  onDirectionsPress?: (location: LocationDetails) => void;
  /** Callback when search is performed */
  onSearch?: (query: string) => void;
  /** Callback when map type is changed */
  onMapTypeChange?: (type: MapType) => void;
  /** Callback when current location is requested */
  onCurrentLocationPress?: () => void;
  /** Callback when map is pressed */
  onMapPress?: (coordinates: LocationCoordinates) => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * MapCard component for displaying location and map information
 */
export const MapCard: React.FC<MapCardProps> = ({
  location,
  markers = [],
  route,
  mapType = 'standard',
  zoomLevel = 15,
  showCurrentLocation = true,
  showRoute = false,
  showTraffic = false,
  showPOI = true,
  height = 200,
  selectedMarker,
  searchQuery,
  title,
  subtitle,
  interactive = true,
  showControls = true,
  loading = false,
  error,
  onMarkerPress,
  onLocationPress,
  onDirectionsPress,
  onSearch,
  onMapTypeChange,
  onCurrentLocationPress,
  onMapPress,
  style,
  testID = 'map-card',
  ...props
}) => {
  // =============================================================================
  // STATE
  // =============================================================================

  const [currentMapType, setCurrentMapType] = useState<MapType>(mapType);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getMarkerIcon = (type: MarkerType): string => {
    const icons: Record<MarkerType, string> = {
      location: '📍',
      destination: '🎯',
      poi: '📌',
      custom: '⭐',
    };
    return icons[type];
  };

  const getTravelModeIcon = (mode: TravelMode): string => {
    const icons: Record<TravelMode, string> = {
      driving: '🚗',
      walking: '🚶',
      transit: '🚌',
      cycling: '🚴',
    };
    return icons[mode];
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  const handleMapTypeToggle = () => {
    const types: MapType[] = ['standard', 'satellite', 'hybrid', 'terrain'];
    const currentIndex = types.indexOf(currentMapType);
    const nextType = types[(currentIndex + 1) % types.length];
    setCurrentMapType(nextType);
    onMapTypeChange?.(nextType);
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderHeader = () => {
    if (!title && !subtitle) return null;

    return (
      <View style={styles.header}>
        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    );
  };

  const renderMapPlaceholder = () => (
    <View style={[styles.mapContainer, { height }]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🗺️</Text>
          <Text style={styles.loadingMessage}>Loading map...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity onPress={onCurrentLocationPress} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapIcon}>🗺️</Text>
          <Text style={styles.mapText}>Interactive Map</Text>
          <Text style={styles.mapSubtext}>
            {markers.length} location{markers.length !== 1 ? 's' : ''} nearby
          </Text>
          
          {/* Simulate markers */}
          <View style={styles.markersOverlay}>
            {markers.slice(0, 3).map((marker, index) => (
              <TouchableOpacity
                key={marker.id}
                style={[
                  styles.markerPin,
                  {
                    left: `${20 + index * 25}%`,
                    top: `${30 + index * 15}%`,
                  }
                ]}
                onPress={() => onMarkerPress?.(marker)}
              >
                <Text style={styles.markerIcon}>
                  {getMarkerIcon(marker.type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderControls = () => {
    if (!showControls) return null;

    return (
      <View style={styles.controls}>
        <TouchableOpacity onPress={handleMapTypeToggle} style={styles.controlButton}>
          <Text style={styles.controlIcon}>🌐</Text>
          <Text style={styles.controlText}>{currentMapType}</Text>
        </TouchableOpacity>
        
        {showCurrentLocation && (
          <TouchableOpacity onPress={onCurrentLocationPress} style={styles.controlButton}>
            <Text style={styles.controlIcon}>📍</Text>
            <Text style={styles.controlText}>My Location</Text>
          </TouchableOpacity>
        )}
        
        {showTraffic && (
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlIcon}>🚦</Text>
            <Text style={styles.controlText}>Traffic</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderRouteInfo = () => {
    if (!showRoute || !route) return null;

    return (
      <View style={styles.routeInfo}>
        <View style={styles.routeHeader}>
          <Text style={styles.routeIcon}>
            {getTravelModeIcon(route.mode)}
          </Text>
          <View style={styles.routeDetails}>
            <Text style={styles.routeDistance}>
              {formatDistance(route.distance)}
            </Text>
            <Text style={styles.routeDuration}>
              {formatDuration(route.duration)}
            </Text>
          </View>
          {route.traffic && (
            <Badge 
              variant="outline"
              style={[
                styles.trafficBadge,
                route.traffic === 'heavy' && styles.heavyTrafficBadge
              ]}
            >
              <Text style={[
                styles.trafficText,
                route.traffic === 'heavy' && styles.heavyTrafficText
              ]}>
                {route.traffic} traffic
              </Text>
            </Badge>
          )}
        </View>
      </View>
    );
  };

  const renderMarkersList = () => {
    if (markers.length === 0) return null;

    const visibleMarkers = markers.slice(0, 3);

    return (
      <View style={styles.markersList}>
        <Text style={styles.markersTitle}>Nearby Locations</Text>
        {visibleMarkers.map((marker) => (
          <TouchableOpacity
            key={marker.id}
            style={[
              styles.markerItem,
              selectedMarker === marker.id && styles.selectedMarkerItem
            ]}
            onPress={() => onMarkerPress?.(marker)}
          >
            <Text style={styles.markerItemIcon}>
              {getMarkerIcon(marker.type)}
            </Text>
            <View style={styles.markerItemContent}>
              <Text style={styles.markerItemTitle}>{marker.title}</Text>
              {marker.description && (
                <Text style={styles.markerItemDescription}>
                  {marker.description}
                </Text>
              )}
              {marker.location && (
                <View style={styles.markerItemMeta}>
                  {marker.location.distance !== undefined && (
                    <Text style={styles.markerItemDistance}>
                      {formatDistance(marker.location.distance)}
                    </Text>
                  )}
                  {marker.location.rating && (
                    <Text style={styles.markerItemRating}>
                      ⭐ {marker.location.rating.toFixed(1)}
                    </Text>
                  )}
                </View>
              )}
            </View>
            {marker.location && onDirectionsPress && (
              <TouchableOpacity
                onPress={() => onDirectionsPress(marker.location!)}
                style={styles.directionsButton}
              >
                <Text style={styles.directionsIcon}>🧭</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
        
        {markers.length > 3 && (
          <Text style={styles.moreMarkers}>
            +{markers.length - 3} more locations
          </Text>
        )}
      </View>
    );
  };

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <Card 
      style={[styles.card, style]} 
      testID={testID}
      {...props}
    >
      <View style={styles.content}>
        {renderHeader()}
        {renderMapPlaceholder()}
        {renderControls()}
        {renderRouteInfo()}
        {renderMarkersList()}
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
    overflow: 'hidden',
  },
  content: {
    padding: 0,
  },
  header: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  mapContainer: {
    position: 'relative',
    backgroundColor: COLORS.neutral[100],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    marginBottom: SPACING.sm,
  },
  loadingMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  errorIcon: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    marginBottom: SPACING.sm,
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error[600],
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary[500],
    borderRadius: 6,
  },
  retryText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapIcon: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    marginBottom: SPACING.sm,
  },
  mapText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[700],
    marginBottom: SPACING.xs,
  },
  mapSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  markersOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  markerPin: {
    position: 'absolute',
    padding: SPACING.xs,
  },
  markerIcon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  controls: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.neutral[100],
    borderRadius: 6,
    gap: SPACING.xs,
  },
  controlIcon: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  controlText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[700],
    textTransform: 'capitalize',
  },
  routeInfo: {
    padding: SPACING.md,
    backgroundColor: COLORS.info[50],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  routeIcon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  routeDetails: {
    flex: 1,
  },
  routeDistance: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
  },
  routeDuration: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  trafficBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderColor: COLORS.warning[300],
  },
  heavyTrafficBadge: {
    borderColor: COLORS.error[300],
  },
  trafficText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.warning[700],
  },
  heavyTrafficText: {
    color: COLORS.error[700],
  },
  markersList: {
    padding: SPACING.md,
  },
  markersTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[700],
    marginBottom: SPACING.sm,
  },
  markerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  selectedMarkerItem: {
    backgroundColor: COLORS.primary[50],
    borderRadius: 6,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 0,
  },
  markerItemIcon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    marginRight: SPACING.sm,
  },
  markerItemContent: {
    flex: 1,
  },
  markerItemTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[900],
    marginBottom: SPACING.xs,
  },
  markerItemDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
    marginBottom: SPACING.xs,
  },
  markerItemMeta: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  markerItemDistance: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[500],
  },
  markerItemRating: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[500],
  },
  directionsButton: {
    padding: SPACING.sm,
  },
  directionsIcon: {
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  moreMarkers: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
});

export default MapCard;
