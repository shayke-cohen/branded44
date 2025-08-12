/**
 * ServicesScreen Usage Examples
 * 
 * Demonstrates how to use ServicesScreen with both generic data and Wix integration
 */

import React from 'react';
import { View } from 'react-native';
import ServicesScreen from '../ServicesScreen';
import type { Service } from '../../../blocks/booking/ServiceCard';

// === EXAMPLE 1: GENERIC DATA USAGE ===

/**
 * Using ServicesScreen with generic service data
 */
export const GenericServicesScreenExample = () => {
  const mockServices: Service[] = [
    {
      id: 'svc_1',
      name: 'Personal Training',
      description: 'One-on-one fitness training session',
      category: 'fitness',
      duration: 60,
      durationUnit: 'min',
      pricing: {
        basePrice: 85,
        currency: 'USD',
        unit: 'session'
      },
      provider: {
        id: 'provider_1',
        name: 'Sarah Johnson',
        rating: 4.9,
        reviewCount: 124,
        verified: true,
        specialties: ['Weight Training', 'Cardio']
      },
      images: ['https://example.com/personal-training.jpg'],
      availability: {
        available: true,
        nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        leadTime: '24 hours'
      },
      locationType: 'onsite',
      tags: ['fitness', 'personal', 'health'],
      rating: 4.8,
      reviewCount: 89,
      featured: true
    },
    {
      id: 'svc_2',
      name: 'Hair Cut & Styling',
      description: 'Professional hair cutting and styling',
      category: 'beauty',
      duration: 45,
      durationUnit: 'min',
      pricing: {
        basePrice: 65,
        originalPrice: 75,
        currency: 'USD',
        unit: 'service',
        onSale: true,
        discountPercentage: 13
      },
      provider: {
        id: 'provider_2',
        name: 'Maria Rodriguez',
        rating: 4.7,
        reviewCount: 156,
        verified: true,
        specialties: ['Hair Cutting', 'Styling', 'Color']
      },
      images: ['https://example.com/hair-styling.jpg'],
      availability: {
        available: true,
        leadTime: '2 hours'
      },
      locationType: 'onsite',
      tags: ['beauty', 'hair', 'styling'],
      rating: 4.7,
      reviewCount: 156
    }
  ];

  const mockCategories = [
    { id: 'fitness', name: 'Fitness', description: 'Physical training and wellness', count: 12 },
    { id: 'beauty', name: 'Beauty', description: 'Beauty and personal care services', count: 8 },
    { id: 'health', name: 'Health', description: 'Health and medical services', count: 6 }
  ];

  return (
    <ServicesScreen
      services={mockServices}
      categories={mockCategories}
      onServicePress={(service) => {
        console.log('Navigate to service:', service.name);
        // navigation.navigate('ServiceDetails', { serviceId: service.id });
      }}
      onCategorySelect={(category) => {
        console.log('Filter by category:', category.name);
      }}
      onSearch={(query) => {
        console.log('Search services:', query);
      }}
    />
  );
};

// === EXAMPLE 2: WIX INTEGRATION USAGE ===

/**
 * Using ServicesScreen with Wix Bookings integration
 */
export const WixServicesScreenExample = () => {
  return (
    <ServicesScreen
      enableWixIntegration={true}
      wixFilters={{
        // Optional: filter by specific Wix category
        // categoryId: 'wix-category-id',
        forceRefresh: false
      }}
      onServicePress={(service) => {
        console.log('Navigate to Wix service:', service.name);
        // navigation.navigate('ServiceDetails', { serviceId: service.id });
      }}
      onWixServiceLoad={(services) => {
        console.log(`Loaded ${services.length} services from Wix`);
      }}
      onWixError={(error) => {
        console.error('Wix integration error:', error);
        // Show error message to user
      }}
    />
  );
};

// === EXAMPLE 3: HYBRID USAGE (FALLBACK TO GENERIC) ===

/**
 * Using ServicesScreen with Wix integration and fallback to generic data
 */
export const HybridServicesScreenExample = () => {
  const [wixError, setWixError] = React.useState<string | null>(null);
  
  // Fallback services if Wix fails
  const fallbackServices: Service[] = [
    {
      id: 'fallback_1',
      name: 'Consultation Call',
      description: 'Free 30-minute consultation call',
      category: 'professional',
      duration: 30,
      durationUnit: 'min',
      pricing: {
        basePrice: 0,
        currency: 'USD',
        unit: 'call'
      },
      provider: {
        id: 'fallback_provider',
        name: 'Our Team',
        rating: 5.0,
        reviewCount: 50,
        verified: true,
        specialties: ['Consultation']
      },
      images: [],
      availability: {
        available: true,
        leadTime: '1 hour'
      },
      locationType: 'remote',
      tags: ['consultation', 'free'],
      rating: 5.0,
      reviewCount: 50
    }
  ];

  const fallbackCategories = [
    { id: 'professional', name: 'Professional Services', description: 'Business and professional services', count: 1 }
  ];

  return (
    <ServicesScreen
      // Try Wix integration first
      enableWixIntegration={!wixError}
      
      // Fallback to generic data if Wix fails
      services={wixError ? fallbackServices : undefined}
      categories={wixError ? fallbackCategories : undefined}
      
      onServicePress={(service) => {
        console.log('Navigate to service:', service.name);
      }}
      
      onWixError={(error) => {
        console.warn('Wix integration failed, falling back to generic data:', error);
        setWixError(error);
      }}
      
      onWixServiceLoad={(services) => {
        console.log(`Successfully loaded ${services.length} services from Wix`);
        setWixError(null); // Clear any previous errors
      }}
    />
  );
};

// === EXAMPLE 4: CUSTOM STYLING AND LAYOUT ===

/**
 * ServicesScreen with custom styling and layout options
 */
export const CustomServicesScreenExample = () => {
  const [layout, setLayout] = React.useState<'grid' | 'list'>('grid');
  
  return (
    <ServicesScreen
      enableWixIntegration={true}
      layout={layout}
      showCategories={true}
      showFilters={true}
      showSort={true}
      showLayoutToggle={true}
      
      onLayoutChange={(newLayout) => {
        setLayout(newLayout);
        console.log('Layout changed to:', newLayout);
      }}
      
      onServicePress={(service) => {
        console.log('Service selected:', service.name);
      }}
      
      onRefresh={() => {
        console.log('Manual refresh triggered');
      }}
    />
  );
};

// === EXAMPLE 5: PROVIDER-SPECIFIC SERVICES ===

/**
 * Show services for a specific provider
 */
export const ProviderServicesScreenExample = ({ providerId }: { providerId: string }) => {
  return (
    <ServicesScreen
      enableWixIntegration={true}
      wixFilters={{
        providerId: providerId,
        forceRefresh: false
      }}
      
      // Hide categories since we're showing one provider
      showCategories={false}
      
      onServicePress={(service) => {
        console.log('Book service with provider:', service.provider.name, service.name);
      }}
      
      onWixServiceLoad={(services) => {
        console.log(`Loaded ${services.length} services for provider ${providerId}`);
      }}
    />
  );
};

// === USAGE NOTES ===

/**
 * INTEGRATION GUIDELINES:
 * 
 * 1. **Generic Usage**: Perfect for custom service data or when Wix integration isn't needed
 *    - Pass services and categories as props
 *    - Handle all callbacks manually
 * 
 * 2. **Wix Integration**: Automatic data loading from Wix Bookings
 *    - Set enableWixIntegration={true}
 *    - Optionally provide wixFilters for customization
 *    - Handle onWixServiceLoad and onWixError callbacks
 * 
 * 3. **Hybrid Approach**: Best of both worlds with fallback
 *    - Start with Wix integration
 *    - Provide fallback data in case of errors
 *    - Gracefully handle integration failures
 * 
 * 4. **Provider Context**: Make sure to wrap with WixBookingProvider if using Wix integration
 *    ```tsx
 *    <WixBookingProvider>
 *      <ServicesScreen enableWixIntegration={true} />
 *    </WixBookingProvider>
 *    ```
 * 
 * 5. **Performance**: Wix integration includes automatic caching and refresh capabilities
 *    - Services cached for 5 minutes
 *    - Pull-to-refresh automatically clears cache
 *    - Background loading with proper loading states
 */

export default {
  GenericServicesScreenExample,
  WixServicesScreenExample,
  HybridServicesScreenExample,
  CustomServicesScreenExample,
  ProviderServicesScreenExample
};
