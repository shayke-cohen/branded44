/**
 * ServiceHeader - Reusable service header component
 * 
 * Displays service basic information, pricing, and metrics
 */

import React from 'react';
import { View, Text, Image } from 'react-native';
import type { Service } from '../blocks/booking/ServiceCard';
import { useTheme } from '../../context/ThemeContext';
import { createServiceDetailStyles } from '../../shared/styles/ServiceDetailStyles';

interface ServiceHeaderProps {
  service: Service;
  style?: any;
}

export const ServiceHeader: React.FC<ServiceHeaderProps> = ({
  service,
  style,
}) => {
  const { theme } = useTheme();
  const styles = createServiceDetailStyles(theme);

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatPrice = (pricing: Service['pricing']): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: pricing.currency,
    }).format(pricing.basePrice);
  };

  return (
    <View style={[styles.serviceSection, style]}>
      {/* Service Image */}
      {service.images && service.images.length > 0 && (
        <Image 
          source={{ uri: service.images[0] }}
          style={styles.serviceImage}
          resizeMode="cover"
        />
      )}

      {/* Service Name */}
      <Text style={styles.serviceName}>{service.name}</Text>

      {/* Service Description */}
      {service.description ? (
        <Text style={styles.serviceDescription}>{service.description}</Text>
      ) : null}

      {/* Service Metrics */}
      <View style={styles.serviceMetrics}>
        {/* Duration */}
        <View style={styles.serviceMetric}>
          <Text style={styles.serviceMetricIcon}>⏱️</Text>
          <Text style={styles.serviceMetricText}>
            {formatDuration(service.duration || 60)}
          </Text>
        </View>

        {/* Rating */}
        {service.rating > 0 && (
          <View style={styles.serviceMetric}>
            <Text style={styles.serviceMetricIcon}>⭐</Text>
            <Text style={styles.serviceMetricText}>
              {service.rating.toFixed(1)} ({service.reviewCount || 0})
            </Text>
          </View>
        )}

        {/* Category */}
        {service.category && (
          <View style={styles.serviceMetric}>
            <Text style={styles.serviceMetricIcon}>🏷️</Text>
            <Text style={styles.serviceMetricText}>
              {service.category.name}
            </Text>
          </View>
        )}
      </View>

      {/* Price */}
      <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>Price</Text>
        <Text style={styles.priceValue}>
          {formatPrice(service.pricing)}
        </Text>
      </View>
    </View>
  );
};

export default ServiceHeader;
