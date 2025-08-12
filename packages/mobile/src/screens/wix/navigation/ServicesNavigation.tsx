/**
 * Services Navigation Component
 * 
 * Provides navigation between different booking/services screens
 * similar to the ProductsNavigation structure for Wix Store
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import ServicesListScreen from '../services/ServicesListScreen/ServicesListScreen';
import type { WixService } from '../services/shared/wixBookingApiClient';
import ServiceDetailScreen from '../services/ServiceDetailScreen/ServiceDetailScreen';
import BookingScreen from '../services/BookingScreen/BookingScreen';
import MyBookingsScreen from '../services/MyBookingsScreen/MyBookingsScreen';

export type ServiceScreen = 'list' | 'detail' | 'booking' | 'myBookings';

const ServicesNavigation: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ServiceScreen>('list');
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>();
  const [selectedProviderId, setSelectedProviderId] = useState<string | undefined>();

  const navigateToServiceDetail = (serviceOrId: string | WixService, providerId?: string) => {
    const serviceId = typeof serviceOrId === 'string' ? serviceOrId : serviceOrId.id;
    console.log('📅 [NAV] Navigating to service detail:', { serviceId, type: typeof serviceOrId });
    setSelectedServiceId(serviceId);
    setSelectedProviderId(providerId);
    setCurrentScreen('detail');
  };

  const navigateToBooking = (serviceId: string, providerId?: string) => {
    console.log('📅 [NAV] Navigating to booking:', serviceId);
    setSelectedServiceId(serviceId);
    setSelectedProviderId(providerId);
    setCurrentScreen('booking');
  };

  const navigateToMyBookings = () => {
    console.log('📅 [NAV] Navigating to my bookings');
    setCurrentScreen('myBookings');
  };

  const navigateBackToList = () => {
    console.log('📅 [NAV] Navigating back to services list');
    setCurrentScreen('list');
    setSelectedServiceId(undefined);
    setSelectedProviderId(undefined);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'list':
        return (
          <ServicesListScreen
            onServicePress={navigateToServiceDetail}
            onBookNow={navigateToBooking}
            onMyBookingsPress={navigateToMyBookings}
          />
        );
      case 'detail':
        return (
          <ServiceDetailScreen
            serviceId={selectedServiceId!}
            providerId={selectedProviderId}
            onBack={navigateBackToList}
            onBookNow={navigateToBooking}
            onMyBookingsPress={navigateToMyBookings}
          />
        );
      case 'booking':
        return (
          <BookingScreen
            serviceId={selectedServiceId!}
            providerId={selectedProviderId}
            onBack={() => setCurrentScreen('detail')}
            onBookingComplete={() => {
              // After successful booking, go to my bookings
              navigateToMyBookings();
            }}
          />
        );
      case 'myBookings':
        return (
          <MyBookingsScreen
            onBack={navigateBackToList}
            onBookingPress={(bookingId) => {
              // Could navigate to booking details
              console.log('📅 View booking details:', bookingId);
            }}
            onRescheduleBooking={(bookingId) => {
              // Navigate to booking screen for rescheduling
              console.log('📅 Reschedule booking:', bookingId);
            }}
          />
        );
      default:
        return (
          <ServicesListScreen
            onServicePress={navigateToServiceDetail}
            onBookNow={navigateToBooking}
            onMyBookingsPress={navigateToMyBookings}
          />
        );
    }
  };

  return <View style={{ flex: 1 }}>{renderScreen()}</View>;
};

export default ServicesNavigation;
