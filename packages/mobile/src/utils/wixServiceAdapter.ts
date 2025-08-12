/**
 * Wix Service Adapter - Converts Wix Bookings API data to generic Service interfaces
 * 
 * This adapter maintains the generic nature of booking blocks while enabling
 * seamless integration with Wix Bookings API data structures.
 */

import { 
  WixService, 
  WixServiceProvider, 
  WixServiceCategory,
  WixBooking,
  WixBookingSlot,
  formatServicePrice,
  formatServiceDuration 
} from './wixBookingApiClient';

import { 
  Service, 
  ServiceProvider, 
  ServiceCategory,
  ServicePricing,
  ServiceAvailability,
  ServiceLevel 
} from '../components/blocks/booking/ServiceCard';

// === TYPE MAPPINGS ===

/**
 * Map Wix service categories to generic categories
 */
const mapWixCategoryToGeneric = (wixCategory?: { name: string }): ServiceCategory => {
  if (!wixCategory) return 'other';
  
  const categoryName = wixCategory.name.toLowerCase();
  
  if (categoryName.includes('health') || categoryName.includes('medical') || categoryName.includes('wellness')) {
    return 'health';
  }
  if (categoryName.includes('beauty') || categoryName.includes('spa') || categoryName.includes('salon')) {
    return 'beauty';
  }
  if (categoryName.includes('fitness') || categoryName.includes('gym') || categoryName.includes('workout')) {
    return 'fitness';
  }
  if (categoryName.includes('education') || categoryName.includes('tutoring') || categoryName.includes('training')) {
    return 'education';
  }
  if (categoryName.includes('business') || categoryName.includes('consulting') || categoryName.includes('professional')) {
    return 'professional';
  }
  if (categoryName.includes('home') || categoryName.includes('cleaning') || categoryName.includes('maintenance')) {
    return 'home';
  }
  if (categoryName.includes('automotive') || categoryName.includes('car') || categoryName.includes('vehicle')) {
    return 'automotive';
  }
  if (categoryName.includes('entertainment') || categoryName.includes('music') || categoryName.includes('event')) {
    return 'entertainment';
  }
  if (categoryName.includes('technology') || categoryName.includes('tech') || categoryName.includes('computer')) {
    return 'technology';
  }
  
  return 'other';
};

/**
 * Map Wix location type to generic location type
 */
const mapWixLocationToGeneric = (wixLocations?: WixService['locations']): 'onsite' | 'remote' | 'hybrid' => {
  if (!wixLocations || wixLocations.length === 0) return 'remote';
  
  const hasPhysical = wixLocations.some(loc => 
    loc.locationType === 'OWNER_BUSINESS' || loc.locationType === 'OWNER_CUSTOM'
  );
  const hasCustomer = wixLocations.some(loc => loc.locationType === 'CUSTOMER');
  
  if (hasPhysical && hasCustomer) return 'hybrid';
  if (hasPhysical) return 'onsite';
  return 'remote';
};

// === ADAPTER FUNCTIONS ===

/**
 * Convert Wix Service to generic Service interface
 */
export const adaptWixService = (wixService: WixService, providers?: WixServiceProvider[]): Service => {
  console.log('🔄 [WIX ADAPTER] Converting service:', wixService.name);
  
  // Only warn if neither format has the data
  const hasPaymentData = wixService.payment || (wixService as any).price !== undefined;
  const hasMediaData = wixService.media || (wixService as any).imageUrl;
  
  if (!hasPaymentData) {
    console.warn('⚠️ [WIX ADAPTER] No payment data for service:', wixService.name);
  }
  if (!hasMediaData) {
    console.warn('⚠️ [WIX ADAPTER] No media data for service:', wixService.name);
  }

  // Find primary provider for this service
  const primaryProvider = providers?.find(provider => 
    provider.services.includes(wixService.id)
  ) || providers?.[0];

  // Convert pricing - handle both simplified and full API response formats
  let basePrice = 0;
  let currency = 'USD';
  let onSale = false;
  let originalPrice: number | undefined;

  // Check if this is the full API response format (individual service)
  if (wixService.payment?.rateType === 'FIXED' && wixService.payment.fixed?.price) {
    basePrice = parseFloat(wixService.payment.fixed.price.value);
    currency = wixService.payment.fixed.price.currency;
    onSale = !!wixService.payment.fixed.deposit;
    if (wixService.payment.fixed.deposit) {
      originalPrice = basePrice + parseFloat(wixService.payment.fixed.deposit.value);
    }
  } else if (wixService.payment?.rateType === 'VARIED' && wixService.payment.varied?.defaultPrice) {
    basePrice = parseFloat(wixService.payment.varied.defaultPrice.value);
    currency = wixService.payment.varied.defaultPrice.currency;
    onSale = !!wixService.payment.varied.deposit;
    if (wixService.payment.varied.deposit) {
      originalPrice = basePrice + parseFloat(wixService.payment.varied.deposit.value);
    }
  } else if (wixService.payment?.rateType === 'NO_FEE') {
    basePrice = 0;
    currency = 'USD';
  } else if (wixService.payment?.rateType === 'CUSTOM') {
    basePrice = 0;
    currency = 'USD';
  } 
  // Handle simplified API response format (services list)
  else if ((wixService as any).price !== undefined) {
    basePrice = parseFloat((wixService as any).price) || 0;
    currency = (wixService as any).currency || 'USD';
  }
  // Default fallback
  else {
    basePrice = 0;
    currency = 'USD';
  }

  const pricing: ServicePricing = {
    basePrice,
    currency,
    unit: 'service',
    onSale,
    ...(originalPrice && { originalPrice })
  };

  // Get main image - handle both API response formats
  let mainImage = '';
  
  // Try full API response format first (individual service)
  if (wixService.media?.mainMedia?.image?.url) {
    mainImage = wixService.media.mainMedia.image.url;
  } 
  // Try other media sources in full format
  else if (wixService.media?.coverMedia?.image?.url) {
    mainImage = wixService.media.coverMedia.image.url;
  }
  else if (wixService.media?.items?.[0]?.image?.url) {
    mainImage = wixService.media.items[0].image.url;
  }
  // Try simplified API response format (services list)
  else if ((wixService as any).imageUrl) {
    mainImage = (wixService as any).imageUrl;
  }

  // Convert Wix image URL to full URL if needed
  if (mainImage && !mainImage.startsWith('http')) {
    mainImage = `https://static.wixstatic.com/media/${mainImage}`;
  }

  console.log('🔄 [WIX ADAPTER] Final pricing:', `${pricing.basePrice} ${pricing.currency}`);
  console.log('🔄 [WIX ADAPTER] Final image:', mainImage ? `Found: ${mainImage}` : 'None');


  // Convert provider info
  const provider: ServiceProvider = primaryProvider ? {
    id: primaryProvider.id,
    name: primaryProvider.name,
    image: primaryProvider.profileImage?.url,
    rating: primaryProvider.rating?.average || 4.5,
    reviewCount: primaryProvider.rating?.count || 0,
    verified: true, // Assume Wix providers are verified
    specialties: primaryProvider.specialties || [],
    experience: primaryProvider.experience ? parseInt(primaryProvider.experience) : undefined
  } : {
    id: 'default',
    name: 'Service Provider',
    rating: 4.5,
    reviewCount: 0,
    verified: true,
    specialties: []
  };

  // Convert availability
  const availability: ServiceAvailability = {
    available: wixService.status === 'ACTIVE' && (wixService.bookingOptions?.enableOnlineBooking ?? true),
    leadTime: '24 hours', // Default lead time
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] // Default business days
  };



  const service = {
    id: wixService.id,
    name: wixService.name,
    description: wixService.description || 'Professional service',
    category: mapWixCategoryToGeneric(wixService.category),
    duration: wixService.schedule?.availabilityConstraints?.durations?.[0]?.minutes || 60,
    durationUnit: 'min',
    pricing,
    provider,
    images: mainImage ? [mainImage] : [],
    availability,
    level: 'all' as ServiceLevel, // Default to all levels
    locationType: mapWixLocationToGeneric(wixService.locations),
    location: wixService.locations?.[0]?.address?.formatted,
    tags: wixService.tags || [],
    rating: provider.rating,
    reviewCount: provider.reviewCount,
    featured: false, // Could be determined by business logic
    badges: [],
    maxGroupSize: wixService.bookingOptions?.maxParticipants,
    minNotice: '24 hours', // Could be extracted from booking policies
    cancellationPolicy: wixService.policy?.cancellationPolicy ? 
      `Cancel up to ${wixService.policy.cancellationPolicy.cancellationWindow} ${wixService.policy.cancellationPolicy.cancellationWindowUnit} before service` : 
      undefined
  };

  console.log('🔄 [WIX ADAPTER] Final pricing:', `${pricing.basePrice} ${pricing.currency}`);
  console.log('🔄 [WIX ADAPTER] Final image:', mainImage ? `Found: ${mainImage}` : 'None');
  
  return service;
};

/**
 * Convert array of Wix Services to generic Services
 */
export const adaptWixServices = (
  wixServices: WixService[], 
  providers?: WixServiceProvider[]
): Service[] => {
  return wixServices.map(wixService => adaptWixService(wixService, providers));
};

/**
 * Convert Wix Service Provider to generic ServiceProvider interface
 */
export const adaptWixServiceProvider = (wixProvider: WixServiceProvider): ServiceProvider => {
  return {
    id: wixProvider.id,
    name: wixProvider.name,
    image: wixProvider.profileImage?.url,
    rating: wixProvider.rating?.average || 4.5,
    reviewCount: wixProvider.rating?.count || 0,
    verified: wixProvider.status === 'ACTIVE',
    specialties: wixProvider.specialties || [],
    experience: wixProvider.experience ? parseInt(wixProvider.experience) : undefined
  };
};

/**
 * Convert Wix Booking Slot to time slot format expected by TimeSlotPicker
 */
export const adaptWixSlotToTimeSlot = (wixSlot: WixBookingSlot) => {
  const startTime = new Date(wixSlot.startTime);
  const endTime = new Date(wixSlot.endTime);
  
  return {
    id: wixSlot.sessionId,
    time: startTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }),
    duration: Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)), // Duration in minutes
    available: wixSlot.available,
    price: wixSlot.price?.formattedPrice || formatServicePrice({
      fixed: {
        price: {
          value: (wixSlot.price?.amount || 0).toString(),
          currency: wixSlot.price?.currency || 'USD'
        }
      }
    }),
    provider: wixSlot.providerId,
    location: wixSlot.location?.name
  };
};

/**
 * Convert generic booking data to Wix booking request format
 */
export const adaptGenericBookingToWix = (
  serviceId: string,
  sessionId: string,
  customerData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  },
  additionalData?: {
    notes?: string;
    participants?: number;
    paymentOption?: 'ONLINE' | 'OFFLINE';
  }
) => {
  return {
    serviceId,
    sessionId,
    contactDetails: {
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone
    },
    ...(additionalData?.notes && { notes: additionalData.notes }),
    ...(additionalData?.participants && {
      paymentSelection: {
        numberOfParticipants: additionalData.participants,
        paymentOption: additionalData.paymentOption || 'ONLINE'
      }
    })
  };
};

/**
 * Extract availability query from generic filters
 */
export const adaptAvailabilityQuery = (
  serviceId: string,
  dateRange: { startDate: string; endDate: string },
  providerId?: string,
  timezone?: string
) => {
  return {
    serviceId,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    staffMemberId: providerId,
    slotsPerDay: 20
  };
};

/**
 * Format Wix booking status for display
 */
export const formatBookingStatus = (status: WixBooking['status']): string => {
  switch (status) {
    case 'PENDING':
      return 'Pending Confirmation';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'CANCELED':
      return 'Canceled';
    case 'NO_SHOW':
      return 'No Show';
    case 'COMPLETED':
      return 'Completed';
    default:
      return 'Unknown';
  }
};

/**
 * Get booking status color
 */
export const getBookingStatusColor = (status: WixBooking['status']): string => {
  switch (status) {
    case 'PENDING':
      return '#FFA500'; // Orange
    case 'CONFIRMED':
      return '#4CAF50'; // Green
    case 'CANCELED':
      return '#F44336'; // Red
    case 'NO_SHOW':
      return '#9E9E9E'; // Gray
    case 'COMPLETED':
      return '#2196F3'; // Blue
    default:
      return '#757575'; // Default gray
  }
};

/**
 * Helper to determine if a booking can be modified
 */
export const canModifyBooking = (booking: WixBooking): boolean => {
  const now = new Date();
  const startTime = new Date(booking.startTime);
  const hoursBefore = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return booking.status === 'CONFIRMED' && hoursBefore > 24; // Allow modification up to 24 hours before
};

/**
 * Helper to determine if a booking can be canceled
 */
export const canCancelBooking = (booking: WixBooking): boolean => {
  const now = new Date();
  const startTime = new Date(booking.startTime);
  const hoursBefore = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return ['PENDING', 'CONFIRMED'].includes(booking.status) && hoursBefore > 2; // Allow cancellation up to 2 hours before
};

console.log('🔄 [WIX ADAPTER] Wix Service Adapter module loaded');
