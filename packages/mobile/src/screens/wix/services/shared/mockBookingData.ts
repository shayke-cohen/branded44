/**
 * Mock data for Wix Booking API
 * Used when API is not available or for demo purposes
 */

import type { WixService, WixServiceProvider, WixBooking } from './wixBookingApiClient';

export const getMockServices = (): WixService[] => {
  return [
    {
      id: 'service_1',
      name: 'Personal Training Session',
      description: 'One-on-one fitness training with a certified professional trainer',
      category: {
        id: 'fitness',
        name: 'Fitness'
      },
      duration: {
        value: 60,
        unit: 'minutes'
      },
      pricing: {
        basePrice: 85,
        currency: 'USD',
        priceText: '$85'
      },
      media: {
        mainMedia: {
          image: {
            url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop',
            width: 500,
            height: 300
          }
        },
        items: [
          {
            image: {
              url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop'
            }
          }
        ]
      },
      locations: [
        {
          id: 'loc_1',
          name: 'Fitness Studio',
          address: {
            formatted: '123 Main St, City, State 12345'
          },
          locationType: 'OWNER_BUSINESS'
        }
      ],
      staffMembers: [
        {
          id: 'provider_1',
          name: 'Sarah Johnson',
          email: 'sarah@fitnessstudio.com',
          image: 'https://images.unsplash.com/photo-1594824720151-4c4e79b53306?w=150&h=150&fit=crop&crop=face',
          role: 'Personal Trainer'
        }
      ],
      policy: {
        cancellationPolicy: {
          cancellationWindow: 24,
          cancellationWindowUnit: 'hours'
        }
      },
      bookingOptions: {
        enableOnlineBooking: true,
        maxParticipants: 1
      },
      tags: ['fitness', 'personal training', 'health'],
      status: 'ACTIVE',
      created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'service_2',
      name: 'Hair Cut & Style',
      description: 'Professional haircut and styling service',
      category: {
        id: 'beauty',
        name: 'Beauty & Wellness'
      },
      duration: {
        value: 45,
        unit: 'minutes'
      },
      pricing: {
        basePrice: 65,
        currency: 'USD',
        priceText: '$65'
      },
      media: {
        mainMedia: {
          image: {
            url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&h=300&fit=crop',
            width: 500,
            height: 300
          }
        }
      },
      locations: [
        {
          id: 'loc_2',
          name: 'Beauty Salon',
          address: {
            formatted: '456 Oak Ave, City, State 12345'
          },
          locationType: 'OWNER_BUSINESS'
        }
      ],
      staffMembers: [
        {
          id: 'provider_2',
          name: 'Emily Davis',
          email: 'emily@beautysalon.com',
          image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
          role: 'Hair Stylist'
        }
      ],
      policy: {
        cancellationPolicy: {
          cancellationWindow: 2,
          cancellationWindowUnit: 'hours'
        }
      },
      bookingOptions: {
        enableOnlineBooking: true,
        maxParticipants: 1
      },
      tags: ['beauty', 'hair', 'styling'],
      status: 'ACTIVE',
      created: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'service_3',
      name: 'Yoga Class',
      description: 'Relaxing yoga session for all skill levels',
      category: {
        id: 'fitness',
        name: 'Fitness'
      },
      duration: {
        value: 75,
        unit: 'minutes'
      },
      pricing: {
        basePrice: 35,
        currency: 'USD',
        priceText: '$35'
      },
      media: {
        mainMedia: {
          image: {
            url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=300&fit=crop',
            width: 500,
            height: 300
          }
        }
      },
      locations: [
        {
          id: 'loc_3',
          name: 'Yoga Studio',
          address: {
            formatted: '789 Zen Way, City, State 12345'
          },
          locationType: 'OWNER_BUSINESS'
        }
      ],
      staffMembers: [
        {
          id: 'provider_3',
          name: 'Maya Patel',
          email: 'maya@yogastudio.com',
          image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
          role: 'Yoga Instructor'
        }
      ],
      policy: {
        cancellationPolicy: {
          cancellationWindow: 1,
          cancellationWindowUnit: 'hours'
        }
      },
      bookingOptions: {
        enableOnlineBooking: true,
        maxParticipants: 15
      },
      tags: ['yoga', 'fitness', 'wellness', 'meditation'],
      status: 'ACTIVE',
      created: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

export const getMockProviders = (): WixServiceProvider[] => {
  return [
    {
      id: 'provider_1',
      name: 'Sarah Johnson',
      email: 'sarah@fitnessstudio.com',
      phone: '+1-555-0123',
      description: 'Certified personal trainer with 5+ years of experience helping clients achieve their fitness goals.',
      title: 'Certified Personal Trainer',
      location: 'New York, NY',
      profileImage: {
        url: 'https://images.unsplash.com/photo-1594824720151-4c4e79b53306?w=150&h=150&fit=crop&crop=face',
        width: 150,
        height: 150
      },
      specialties: ['Weight Training', 'Cardio', 'Nutrition Coaching'],
      certifications: ['NASM-CPT', 'Nutrition Specialist'],
      experience: '5 years',
      rating: { average: 4.9, count: 127 },
      totalReviews: 127,
      languages: ['English', 'Spanish'],
      availability: {
        workingHours: [
          {
            dayOfWeek: 1,
            timeSlots: [
              { startTime: '09:00', endTime: '17:00' }
            ]
          }
        ],
        timeZone: 'America/New_York'
      },
      status: 'ACTIVE',
      created: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      updated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'provider_2',
      name: 'Emily Davis',
      email: 'emily@beautysalon.com',
      phone: '+1-555-0456',
      description: 'Professional hair stylist specializing in modern cuts and color techniques.',
      title: 'Professional Hair Stylist',
      location: 'Los Angeles, CA',
      profileImage: {
        url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
        width: 150,
        height: 150
      },
      specialties: ['Hair Cutting', 'Hair Coloring', 'Styling'],
      certifications: ['Cosmetology License', 'Advanced Color Certification'],
      experience: '8 years',
      rating: { average: 4.8, count: 94 },
      totalReviews: 203,
      languages: ['English'],
      availability: {
        workingHours: [
          {
            dayOfWeek: 1,
            timeSlots: [
              { startTime: '09:00', endTime: '17:00' }
            ]
          }
        ],
        timeZone: 'America/New_York'
      },
      status: 'ACTIVE',
      created: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
      updated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'provider_3',
      name: 'Maya Patel',
      email: 'maya@yogastudio.com',
      phone: '+1-555-0789',
      description: 'Experienced yoga instructor with expertise in Hatha, Vinyasa, and meditation practices.',
      profileImage: {
        url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
        width: 150,
        height: 150
      },
      specialties: ['Hatha Yoga', 'Vinyasa Flow', 'Meditation', 'Breathing Techniques'],
      certifications: ['RYT-500', 'Meditation Teacher Certification'],
      experience: '12 years',
      rating: { average: 4.9, count: 156 },
      totalReviews: 89,
      languages: ['English', 'Hindi'],
      availability: {
        workingHours: [
          {
            dayOfWeek: 1,
            timeSlots: [
              { startTime: '09:00', endTime: '17:00' }
            ]
          }
        ],
        timeZone: 'America/New_York'
      },
      status: 'ACTIVE',
      created: new Date(Date.now() - 800 * 24 * 60 * 60 * 1000).toISOString(),
      updated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

export const getMockBookings = (): WixBooking[] => {
  return [
    {
      id: 'booking_1',
      serviceId: 'service_1',
      staffMemberIds: ['provider_1'],
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // +1 hour
      status: 'CONFIRMED',
      customerInfo: {
        contactDetails: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1-555-0123'
        }
      },
      service: {
        id: 'service_1',
        name: 'Personal Training Session',
        duration: { value: 60, unit: 'minutes' },
        pricing: { basePrice: 85, currency: 'USD' }
      },
      provider: {
        id: 'provider_1',
        name: 'Sarah Johnson',
        profileImage: { url: 'https://images.unsplash.com/photo-1594824720151-4c4e79b53306?w=150&h=150&fit=crop&crop=face' }
      },
      location: {
        name: 'Fitness Studio',
        address: '123 Main St, City, State 12345'
      },
      pricing: {
        basePrice: 85,
        total: 91.80,
        currency: 'USD'
      },
      created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};
