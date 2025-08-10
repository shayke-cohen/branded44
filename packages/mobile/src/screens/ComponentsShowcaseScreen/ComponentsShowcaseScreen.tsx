import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useTheme } from '../../context';
import { SPACING } from '../../lib/constants';
import { 
  LoginForm, SignupForm, ForgotPasswordForm, OTPVerificationForm, ProfileCard, SocialLoginButtons,
  ProfileEditForm, SettingsPanel, SecuritySettings, NotificationSettings, SubscriptionCard, UserRoleSelector,
  ContactForm, SearchForm, AddressForm, PaymentForm, FilterPanel, SortPanel, DateRangePicker, TimeSlotPicker,
  RatingForm, FeedbackForm, SurveyForm, QuizForm,
  UserList, ProductGrid, ProductList, ArticleList, EventList, MessageList, NotificationList, OrderList, TransactionList, ActivityFeed,
  ProductCard, CartItem, CartSummary,
  UserCard, ChatBubble, CommentList,
  ImageGallery,
  StatsCard, ProgressCard,
  LoadingCard, ErrorCard,
  WorkoutCard, NutritionCard,

  type UserListItem, type Product, type ProductCardData, type CartItemData, type CartSummaryData,
  type ContactFormData, type SearchFormData, type UserCardData, type ChatMessage, type Comment, type GalleryImage,
  type Activity, type Event, type Notification, type Order, type Transaction,
  type StatTrend, type ProgressData, type Milestone, type TeamMember,
  type Exercise, type MealData, type FoodItem, type NutritionInfo, type NutritionGoals
} from '../../components/blocks';
import { 
  ServiceCard, ServiceProviderCard, BookingCalendar, TimeSlotGrid, BookingForm, BookingSummary, 
  AppointmentCard, ReviewCard, ClassScheduleCard, RecurringBookingForm, CancellationPolicy,
  WaitlistCard, PackageCard, ResourceBookingCard
} from '../../components/blocks/booking';
import { type User } from '../../lib/types';
import { ShopScreen, CartScreen } from '../../components/templates/ecommerce';
import { 
  LoginScreen, 
  SignupScreen, 
  ForgotPasswordScreen,
  CreateProfileScreen,
  OnboardingScreen 
} from '../../components/templates/auth';
import {
  HomeScreen,
  DashboardScreen,
  FeedScreen
} from '../../components/templates/home';
import {
  ProfileScreen,
  AccountScreen,
  SettingsScreen
} from '../../components/templates/profile';
import {
  CalendarScreen,
  CreateEventScreen,
  EventDetailsScreen
} from '../../components/templates/business';
import {
  ChatListScreen,
  ChatScreen,
  ContactsScreen
} from '../../components/templates/communication';

export interface ComponentsShowcaseScreenProps {
  onBack?: () => void;
}

type ShowcaseMode = 'blocks' | 'templates' | 'flows' | 'auth' | 'auth-advanced' | 'forms' | 'forms-advanced' | 'lists' | 'lists-advanced' | 'ecommerce' | 'ecommerce-advanced' | 'social' | 'media' | 'business' | 'utility' | 'health' | 'booking' | 'booking-advanced' | 'auth-templates' | 'home-templates' | 'profile-templates' | 'ecommerce-templates' | 'business-templates' | 'communication-templates' | 'booking-templates' | 'booking-flows' | 'shop' | 'cart';

/**
 * ComponentsShowcaseScreen - Comprehensive component library showcase
 */
const ComponentsShowcaseScreen: React.FC<ComponentsShowcaseScreenProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const [activeMode, setActiveMode] = useState<ShowcaseMode>('blocks');
  const [loading, setLoading] = useState(false);

  // Mock data for demonstrations
  const mockUsers: UserListItem[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      status: 'online',
      lastSeen: '2 min ago',
      mutual: 5,
      stats: { postsCount: 42, followersCount: 1205, followingCount: 892 }
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      status: 'away',
      lastSeen: '1 hour ago',
      mutual: 12,
      stats: { postsCount: 87, followersCount: 3401, followingCount: 445 }
    },
    {
      id: '3',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      status: 'offline',
      lastSeen: '1 day ago',
      mutual: 3,
      stats: { postsCount: 23, followersCount: 567, followingCount: 234 }
    }
  ];

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 199.99,
      originalPrice: 249.99,
      currency: '$',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'],
      category: 'Electronics',
      brand: 'TechPro',
      rating: 4.5,
      reviewCount: 1247,
      inStock: true,
      stockCount: 15,
      tags: ['wireless', 'headphones', 'noise-cancellation'],
      isWishlisted: false,
      discount: 20
    },
    {
      id: '2',
      name: 'Smart Fitness Watch',
      description: 'Track your fitness goals with this advanced smartwatch',
      price: 299.99,
      currency: '$',
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop'],
      category: 'Electronics',
      brand: 'FitTech',
      rating: 4.2,
      reviewCount: 892,
      inStock: true,
      stockCount: 8,
      tags: ['smartwatch', 'fitness', 'health'],
      isWishlisted: true
    },
    {
      id: '3',
      name: 'Organic Cotton T-Shirt',
      description: 'Comfortable and sustainable organic cotton t-shirt',
      price: 29.99,
      currency: '$',
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'],
      category: 'Clothing',
      brand: 'EcoWear',
      rating: 4.8,
      reviewCount: 356,
      inStock: true,
      stockCount: 23,
      tags: ['organic', 'cotton', 'sustainable'],
      isWishlisted: false
    }
  ];

  const mockCartItems: CartItemData[] = [
    {
      id: '1',
      productId: '1',
      name: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones',
      price: 199.99,
      originalPrice: 249.99,
      quantity: 1,
      currency: '$',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      brand: 'TechPro',
      variant: { color: 'Black', size: 'Standard' },
      inStock: true,
      stockCount: 15
    },
    {
      id: '2',
      productId: '2',
      name: 'Smart Fitness Watch',
      price: 299.99,
      quantity: 1,
      currency: '$',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
      brand: 'FitTech',
      variant: { color: 'Silver', size: '42mm' },
      inStock: true,
      stockCount: 8
    }
  ];

  // Mock data for new components
  const mockUserCardData: UserCardData = {
    id: '1',
    name: 'Sarah Wilson',
    username: 'sarahwilson',
    bio: 'UX Designer • Coffee lover • Dog mom 🐕',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b6e1e4c1?w=150&h=150&fit=crop&crop=face',
    status: 'online',
    verification: 'verified',
    stats: {
      followers: 1205,
      following: 892,
      posts: 42,
      likes: 3201
    },
    isFollowing: false,
    location: 'San Francisco, CA',
    badges: ['Top Creator', 'Early Adopter']
  };

  const mockChatMessage: ChatMessage = {
    id: '1',
    text: 'Hey! How are you doing today? 😊',
    type: 'text',
    sender: {
      id: '2',
      name: 'Alex Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isOnline: true
    },
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    status: 'read',
    reactions: [
      { emoji: '❤️', userIds: ['1'], count: 1 }
    ]
  };

  const mockComments: Comment[] = [
    {
      id: '1',
      text: 'This is an amazing post! Really love the design and attention to detail. Keep up the great work! 🎉',
      author: {
        id: '1',
        name: 'Emily Rodriguez',
        username: 'emily_designs',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b6e1e4c1?w=150&h=150&fit=crop&crop=face',
        verified: true,
        badge: 'Pro'
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      likes: 12,
      isLiked: false,
      canReply: true,
      canEdit: false,
      canDelete: false,
      replyCount: 2,
      depth: 0,
      replies: []
    }
  ];

  const mockGalleryImages: GalleryImage[] = [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
      title: 'Mountain Landscape',
      tags: ['nature', 'mountains']
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
      title: 'Forest Path',
      tags: ['nature', 'forest']
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop',
      title: 'Ocean View',
      tags: ['nature', 'ocean']
    }
  ];

  const mockCartSummaryData: CartSummaryData = {
    subtotal: 299.97,
    tax: 24.00,
    taxRate: 0.08,
    shipping: 9.99,
    discount: 30.00,
    total: 303.96,
    currency: 'USD',
    itemCount: 3,
    appliedCoupons: [
      {
        code: 'SAVE10',
        description: '10% off your order',
        discountAmount: 30.00,
        discountType: 'percentage',
        discountPercentage: 10
      }
    ],
    freeShippingThreshold: 50,
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
  };

  const mockStatsData = [
    {
      title: 'Total Revenue',
      value: 125000,
      format: 'currency' as const,
      trend: { direction: 'up' as const, percentage: 12.5 },
      comparison: 'vs last month',
      icon: '💰',
      color: 'success' as const,
    },
    {
      title: 'Active Users',
      value: 8945,
      format: 'number' as const,
      trend: { direction: 'up' as const, percentage: 8.3 },
      icon: '👥',
      color: 'info' as const,
    },
    {
      title: 'Conversion Rate',
      value: 3.2,
      format: 'percentage' as const,
      trend: { direction: 'down' as const, percentage: -2.1 },
      icon: '📈',
      color: 'warning' as const,
    },
  ];

  const mockProgressData: ProgressData = {
    current: 75,
    target: 100,
    unit: '%',
    label: 'Project Completion'
  };

  const mockMilestones: Milestone[] = [
    {
      id: '1',
      title: 'UI Design Complete',
      target: 25,
      completed: true,
      dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      title: 'Backend Development',
      target: 60,
      completed: true,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      title: 'Testing & QA',
      target: 85,
      completed: false,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    }
  ];

  const mockTeamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Sarah Wilson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b6e1e4c1?w=150&h=150&fit=crop&crop=face',
      role: 'Designer',
      progress: 90
    },
    {
      id: '2',
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      role: 'Developer',
      progress: 75
    },
    {
      id: '3',
      name: 'Emma Davis',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      role: 'QA Engineer',
      progress: 60
    }
  ];

  const mockExercises: Exercise[] = [
    {
      id: '1',
      name: 'Push-ups',
      sets: 3,
      reps: 15,
      restTime: 60,
      muscleGroups: ['chest', 'triceps', 'shoulders'],
      equipment: [],
      completed: true
    },
    {
      id: '2',
      name: 'Squats',
      sets: 3,
      reps: 20,
      restTime: 90,
      weight: 20,
      muscleGroups: ['quadriceps', 'glutes'],
      equipment: ['dumbbells'],
      completed: true
    },
    {
      id: '3',
      name: 'Plank',
      duration: 60,
      muscleGroups: ['core'],
      equipment: [],
      completed: false
    }
  ];

  const mockWorkoutData = {
    title: 'Morning Strength Training',
    description: 'A comprehensive upper body and core workout to start your day strong',
    category: 'strength' as const,
    difficulty: 'intermediate' as const,
    status: 'in_progress' as const,
    exercises: mockExercises,
    estimatedDuration: 45,
    estimatedCalories: 350,
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    equipment: ['dumbbells', 'yoga mat'],
    trainer: 'Sarah Johnson',
    tags: ['morning', 'strength', 'upper body']
  };

  const mockFoodItems: FoodItem[] = [
    {
      id: '1',
      name: 'Greek Yogurt',
      quantity: 1,
      unit: 'cup',
      calories: 130,
      protein: 20,
      carbs: 9,
      fat: 0,
      brand: 'Organic Valley'
    },
    {
      id: '2',
      name: 'Blueberries',
      quantity: 0.5,
      unit: 'cup',
      calories: 42,
      protein: 0.5,
      carbs: 11,
      fat: 0.2,
      fiber: 2
    },
    {
      id: '3',
      name: 'Honey',
      quantity: 1,
      unit: 'tbsp',
      calories: 64,
      protein: 0,
      carbs: 17,
      fat: 0,
      sugar: 17
    }
  ];

  const mockNutritionData: MealData = {
    id: '1',
    name: 'Greek Yogurt Parfait',
    type: 'breakfast',
    foods: mockFoodItems,
    nutrition: {
      calories: 236,
      protein: 20.5,
      carbs: 37,
      fat: 0.2,
      fiber: 2,
      sugar: 28
    },
    time: new Date(),
    prepTime: 5,
    difficulty: 'easy',
    dietaryRestrictions: ['vegetarian'],
    nutritionScore: 'excellent',
    isLogged: false,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop'
  };

  const mockNutritionGoals: NutritionGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 67
  };

  const mockDailyProgress: NutritionInfo = {
    calories: 680,
    protein: 45,
    carbs: 85,
    fat: 22
  };

  // Demo handlers
  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    Alert.alert('Login Success', `Welcome back, ${email}!`);
  };

  const handleSignup = async (data: any) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    Alert.alert('Signup Success', `Account created for ${data.email}!`);
  };

  const handlePasswordReset = async (email: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    Alert.alert('Reset Link Sent', `Password reset link sent to ${email}`);
  };

  const handleOTPVerification = async (otp: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    Alert.alert('Success', `OTP ${otp} verified successfully!`);
  };

  const handleResendOTP = async () => {
    Alert.alert('Info', 'New OTP sent to +1 (555) 123-4567');
  };

  const handleContactSubmit = async (data: ContactFormData) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    Alert.alert('Message Sent', `Thank you ${data.firstName}, we'll get back to you soon!`);
  };

  const handleSearch = (data: SearchFormData) => {
    Alert.alert('Search Performed', `Query: ${data.query || 'All items'}\nFilters: ${Object.keys(data.filters || {}).length}`);
  };

  const handleUserSelect = (user: UserListItem) => {
    Alert.alert('User Selected', `Selected: ${user.firstName} ${user.lastName}`);
  };

  const handleAddToCart = async (product: Product) => {
    Alert.alert('Added to Cart', `${product.name} added to cart!`);
  };

  const handleToggleWishlist = async (product: Product) => {
    Alert.alert('Wishlist Updated', `${product.name} ${product.isWishlisted ? 'removed from' : 'added to'} wishlist!`);
  };

  const userActions = [
    { id: 'message', label: 'Message', icon: '💬', onPress: (user: UserListItem) => Alert.alert('Message', `Send message to ${user.firstName}`) },
    { id: 'follow', label: 'Follow', icon: '👥', onPress: (user: UserListItem) => Alert.alert('Follow', `Following ${user.firstName}`) }
  ];

  // Mock booking data
  const mockService = {
    id: 'service_1',
    name: 'Personal Training Session',
    description: 'One-on-one fitness training with certified trainer',
    category: 'fitness' as const,
    duration: 60,
    durationUnit: 'minutes',
    pricing: {
      basePrice: 85,
      originalPrice: 100,
      currency: 'USD',
      unit: 'session',
      onSale: true,
      discountPercentage: 15
    },
    provider: {
      id: 'provider_1',
      name: 'Sarah Johnson',
      image: 'https://images.unsplash.com/photo-1594824720151-4c4e79b53306?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      reviewCount: 89,
      verified: true,
      specialties: ['Strength Training', 'Weight Loss', 'Functional Fitness'],
      experience: 5
    },
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop'],
    availability: {
      available: true,
      nextAvailable: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      leadTime: '2 hours',
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    },
    level: 'intermediate' as const,
    locationType: 'onsite' as const,
    location: 'Downtown Gym',
    tags: ['fitness', 'personal', 'training'],
    rating: 4.8,
    reviewCount: 124,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockProvider = {
    id: 'provider_1',
    name: 'Sarah Johnson',
    title: 'Certified Personal Trainer',
    bio: 'Experienced fitness trainer specializing in strength training and weight loss',
    image: 'https://images.unsplash.com/photo-1594824720151-4c4e79b53306?w=150&h=150&fit=crop&crop=face',
    location: 'Downtown Gym',
    experience: 5,
    rating: 4.9,
    reviewCount: 89,
    verification: 'verified' as const,
    status: 'available' as const,
    specialties: [
      {
        id: '1',
        name: 'Strength Training',
        level: 'expert' as const,
        yearsExperience: 5,
        verified: true
      },
      {
        id: '2',
        name: 'Weight Loss',
        level: 'expert' as const,
        yearsExperience: 4,
        verified: true
      }
    ],
    certifications: [
      {
        id: '1',
        name: 'NASM-CPT',
        organization: 'National Academy of Sports Medicine',
        issueDate: new Date('2019-01-01'),
        verified: true
      },
      {
        id: '2',
        name: 'Nutrition Specialist',
        organization: 'Precision Nutrition',
        issueDate: new Date('2020-06-01'),
        verified: true
      }
    ],
    workingHours: [
      { day: 1, startTime: '06:00', endTime: '20:00', available: true },
      { day: 2, startTime: '06:00', endTime: '20:00', available: true },
      { day: 3, startTime: '06:00', endTime: '20:00', available: true },
      { day: 4, startTime: '06:00', endTime: '20:00', available: true },
      { day: 5, startTime: '06:00', endTime: '18:00', available: true },
      { day: 6, startTime: '08:00', endTime: '16:00', available: true },
      { day: 0, startTime: '10:00', endTime: '14:00', available: false }
    ],
    pricing: {
      hourlyRate: 85,
      currency: 'USD',
      minimumDuration: 60,
      durationUnit: 'minutes',
      packages: [
        {
          id: 'pack_1',
          name: '5 Session Package',
          sessions: 5,
          price: 400,
          savings: 25
        }
      ]
    },
    stats: {
      totalSessions: 450,
      totalClients: 89,
      responseRate: 98,
      completionRate: 96,
      averageRating: 4.9,
      onTimeRate: 99
    },
    languages: ['English', 'Spanish'],
    services: ['Personal Training', 'Nutrition Coaching', 'Fitness Assessment'],
    badges: ['Verified', 'Top Rated', '5+ Years']
  };

  const mockAppointment = {
    id: 'apt_1',
    title: 'Personal Training Session',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // Tomorrow + 1 hour
    status: 'confirmed' as const,
    priority: 'medium' as const,
    service: {
      id: 'service_1',
      name: 'Personal Training Session',
      description: 'One-on-one fitness training with certified trainer',
      duration: 60,
      price: 85,
      currency: 'USD',
      locationType: 'onsite' as const,
      category: 'fitness'
    },
    provider: {
      id: 'provider_1',
      name: 'Sarah Johnson',
      image: 'https://images.unsplash.com/photo-1594824720151-4c4e79b53306?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      verified: true,
      phone: '+1-555-0123',
      location: 'Downtown Gym'
    },
    customer: {
      id: 'customer_1',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1234567890',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    paymentStatus: 'paid' as const,
    notes: 'First session, focus on assessment and goal setting',
    location: 'Downtown Gym, Studio A',
    confirmationNumber: 'APT123456',
    reminders: {
      enabled: true,
      email: true,
      sms: true,
      push: true,
      intervals: [60, 15] // 1 hour and 15 minutes before
    }
  };

  const mockTimeSlots = [
    { id: '1', time: '09:00', available: true, price: 85 },
    { id: '2', time: '10:00', available: false, price: 85 },
    { id: '3', time: '11:00', available: true, price: 85 },
    { id: '4', time: '14:00', available: true, price: 85 },
    { id: '5', time: '15:00', available: true, price: 85 },
    { id: '6', time: '16:00', available: false, price: 85 }
  ];

  const demoModes = [
    // Main Category Tabs (3 main tabs)
    { id: 'blocks', label: 'Blocks', icon: '🧱', description: 'Individual component blocks' },
    { id: 'templates', label: 'Templates', icon: '📱', description: 'Complete screen templates' },
    { id: 'flows', label: 'Flows/Demos', icon: '🎯', description: 'User flows and interactive demos' },
    
    // Block Categories (shown when blocks tab is active)
    { id: 'auth', label: 'Auth Basic', icon: '🔐', description: 'Login, signup, basic auth' },
    { id: 'auth-advanced', label: 'Auth Advanced', icon: '⚙️', description: 'Profile editing, settings, security' },
    { id: 'forms', label: 'Forms Basic', icon: '📝', description: 'Contact, search, basic forms' },
    { id: 'forms-advanced', label: 'Forms Advanced', icon: '📝', description: 'Address, payment, complex forms' },
    { id: 'lists', label: 'List Basic', icon: '📋', description: 'Basic data display components' },
    { id: 'lists-advanced', label: 'List Advanced', icon: '📊', description: 'Advanced lists (events, messages, notifications)' },
    { id: 'ecommerce', label: 'E-commerce Basic', icon: '🛒', description: 'Basic shopping components' },
    { id: 'ecommerce-advanced', label: 'E-commerce Advanced', icon: '💳', description: 'Cart summary and advanced features' },
    { id: 'social', label: 'Social & Chat', icon: '👥', description: 'Social media and communication' },
    { id: 'media', label: 'Media', icon: '🖼️', description: 'Image galleries and media components' },
    { id: 'business', label: 'Business', icon: '📊', description: 'Analytics, stats, and progress tracking' },
    { id: 'booking', label: 'Booking Basic', icon: '📅', description: 'Services, providers, calendars' },
    { id: 'booking-advanced', label: 'Booking Advanced', icon: '🎯', description: 'Classes, packages, waitlists' },
    { id: 'utility', label: 'Utility', icon: '⚙️', description: 'Loading states and utility components' },
    { id: 'health', label: 'Health & Fitness', icon: '💪', description: 'Workout and nutrition tracking' },
    
    // Template Categories (shown when templates tab is active)
    { id: 'auth-templates', label: 'Authentication', icon: '🔐', description: 'Login, signup, and onboarding screens' },
    { id: 'home-templates', label: 'Home & Dashboard', icon: '🏠', description: 'Dashboard, feed, and home screens' },
    { id: 'profile-templates', label: 'Profile & Settings', icon: '👤', description: 'User profiles and settings screens' },
    { id: 'ecommerce-templates', label: 'E-commerce', icon: '🛒', description: 'Shopping and checkout screens' },
    { id: 'business-templates', label: 'Business', icon: '💼', description: 'Calendar, events, and business screens' },
    { id: 'communication-templates', label: 'Communication', icon: '💬', description: 'Chat, messaging, and contact screens' },
    { id: 'booking-templates', label: 'Booking & Services', icon: '📅', description: 'Service booking and appointment screens' },
    { id: 'booking-flows', label: 'Booking Flows', icon: '🔄', description: 'End-to-end booking workflows' },
    
    // Flow/Demo Categories (shown when flows tab is active)
    { id: 'shop', label: 'Shop Experience', icon: '🏪', description: 'Complete shopping demo' },
    { id: 'cart', label: 'Cart & Checkout', icon: '🛍️', description: 'Shopping cart demo' }
  ];

  const renderDemoComponent = () => {
    switch (activeMode) {
      case 'blocks':
        return (
          <View style={styles.blocksGrid}>
            <Text style={styles.sectionTitle}>🚀 Our Component Library</Text>
            <Text style={styles.sectionDescription}>
              71+ production-ready components across 13 major categories
            </Text>
            
            <View style={styles.categoryGrid}>
              {demoModes.slice(3, 18).map((mode) => (
                <TouchableOpacity
                  key={mode.id}
                  style={styles.categoryCard}
                  onPress={() => setActiveMode(mode.id as ShowcaseMode)}
                >
                  <Text style={styles.categoryIcon}>{mode.icon}</Text>
                  <Text style={styles.categoryLabel}>{mode.label}</Text>
                  <Text style={styles.categoryDescription}>{mode.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>71+</Text>
                <Text style={styles.statLabel}>Components</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>13</Text>
                <Text style={styles.statLabel}>Categories</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>100%</Text>
                <Text style={styles.statLabel}>TypeScript</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>∞</Text>
                <Text style={styles.statLabel}>Possibilities</Text>
              </View>
            </View>
          </View>
        );

      case 'auth':
        return (
          <View style={styles.componentContainer}>
            <LoginForm
              onLogin={handleLogin}
              socialLogin={true}
              loading={loading}
              title="Welcome Back"
              subtitle="Sign in to continue your journey"
            />
            
            <SignupForm
              onSignup={handleSignup}
              socialSignup={true}
              loading={loading}
              title="Create Your Account"
              subtitle="Join us and start your journey today"
              style={{ marginTop: 20 }}
            />
            
            <ForgotPasswordForm
              onResetRequest={handlePasswordReset}
              loading={loading}
              title="Reset Password"
              description="Enter your email and we'll send you a recovery link"
              style={{ marginTop: 20 }}
            />
            
            <OTPVerificationForm
              onVerify={handleOTPVerification}
              onResendOTP={handleResendOTP}
              contactInfo="+1 (555) 123-4567"
              verificationType="phone"
              title="Verify Your Phone Number"
              loading={loading}
              length={6}
              autoSubmit={true}
              style={{ marginTop: 20 }}
            />
            
            <ProfileCard
              user={{
                id: "demo-user-1",
                email: "john.doe@example.com",
                firstName: "John",
                lastName: "Doe",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                createdAt: "2023-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
                isVerified: true,
                isActive: true,
                role: "user",
                preferences: {
                  theme: "light",
                  notifications: true,
                  language: "en"
                }
              }}
              style={{ marginTop: 20 }}
            />
            
            <SocialLoginButtons
              onGoogleLogin={() => Alert.alert('Google Login')}
              onAppleLogin={() => Alert.alert('Apple Login')}
              onFacebookLogin={() => Alert.alert('Facebook Login')}
              loading={loading}
              style={{ marginTop: 20 }}
            />
          </View>
        );

      case 'auth-advanced':
        return (
          <View style={styles.componentContainer}>
            <ProfileEditForm
              user={mockUsers[0]}
              onSave={(data) => Alert.alert('Profile Updated', 'Profile has been successfully updated!')}
              onCancel={() => Alert.alert('Edit Cancelled', 'Profile editing was cancelled')}
              loading={loading}
              readOnly={false}
              showAvatar={true}
              showPreferences={true}
              style={{ marginBottom: 20 }}
            />
            
            <SettingsPanel
              user={{
                id: mockUsers[0].id,
                email: mockUsers[0].email,
                firstName: mockUsers[0].firstName,
                lastName: mockUsers[0].lastName,
                avatar: mockUsers[0].avatar,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
                isVerified: true,
                isActive: true,
                role: 'user' as any,
                preferences: {
                  theme: 'light',
                  language: 'en',
                  timezone: 'UTC',
                  notifications: {
                    email: true,
                    push: false,
                    sms: true,
                    marketing: false
                  },
                  privacy: {
                    profileVisible: true,
                    activityVisible: false,
                    emailVisible: false,
                    phoneVisible: false
                  }
                }
              }}
              preferences={{
                theme: 'light',
                language: 'en',
                notifications: {
                  email: true,
                  push: false,
                  sms: true
                },
                privacy: {
                  profileVisible: true,
                  activityVisible: false
                }
              }}
              onPreferencesUpdate={async (preferences) => 
                Alert.alert('Preferences Updated', JSON.stringify(preferences, null, 2))
              }
              onNavigate={{
                profile: () => Alert.alert('Navigate', 'Going to profile'),
                security: () => Alert.alert('Navigate', 'Going to security'),
                notifications: () => Alert.alert('Navigate', 'Going to notifications')
              }}
              style={{ marginBottom: 20 }}
            />
            
            <SecuritySettings
              user={mockUsers[0]}
              onPasswordChange={() => Alert.alert('Password Change', 'Password change initiated')}
              onTwoFactorToggle={(enabled) => Alert.alert('2FA', `Two-factor authentication ${enabled ? 'enabled' : 'disabled'}`)}
              onSessionTerminate={() => Alert.alert('Sessions', 'All sessions terminated')}
              loading={loading}
              style={{ marginBottom: 20 }}
            />
          </View>
        );

      case 'forms':
        return (
          <View style={styles.componentContainer}>
            <ContactForm
              onSubmit={handleContactSubmit}
              loading={loading}
              showPhone={true}
              showCompany={true}
            />
          </View>
        );

      case 'forms-advanced':
        return (
          <View style={styles.componentContainer}>
            <AddressForm
              onSubmit={(data) => Alert.alert('Address Saved', 'Address has been successfully saved!')}
              initialData={{
                firstName: 'John',
                lastName: 'Doe',
                street: '123 Main St',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94102',
                country: 'US',
                isDefault: false
              }}
              loading={loading}
              showBillingAddress={true}
              style={{ marginBottom: 20 }}
            />
            
            <PaymentForm
              onSubmit={(data) => Alert.alert('Payment Method Added', 'Payment method has been successfully added!')}
              loading={loading}
              showSaveCard={true}
              acceptedCards={['visa', 'mastercard', 'amex']}
              style={{ marginBottom: 20 }}
            />
            
            <FeedbackForm
              onSubmit={(data) => Alert.alert('Feedback Submitted', 'Thank you for your feedback!')}
              categories={['Bug Report', 'Feature Request', 'General Feedback', 'Support']}
              loading={loading}
              style={{ marginBottom: 20 }}
            />
            
            <DateRangePicker
              onDateRangeChange={(range) => Alert.alert('Date Range Selected', `From: ${range.startDate}, To: ${range.endDate}`)}
              placeholder="Select date range"
              loading={loading}
              style={{ marginBottom: 20 }}
            />
            
            <TimeSlotPicker
              slots={[
                { id: '1', startTime: '09:00', endTime: '10:00', available: true },
                { id: '2', startTime: '10:00', endTime: '11:00', available: true },
                { id: '3', startTime: '11:00', endTime: '12:00', available: false },
                { id: '4', startTime: '14:00', endTime: '15:00', available: true },
                { id: '5', startTime: '15:00', endTime: '16:00', available: true }
              ]}
              onSlotSelect={(slot) => Alert.alert('Time Slot Selected', `${slot.startTime} - ${slot.endTime}`)}
              selectedDate={new Date()}
              loading={loading}
              style={{ marginBottom: 20 }}
            />
            
            <RatingForm
              onSubmit={(data) => Alert.alert('Rating Submitted', `Rating: ${data.rating}/5 stars`)}
              maxRating={5}
              showReviewText={true}
              loading={loading}
              style={{ marginBottom: 20 }}
            />
            
            <SurveyForm
              questions={[
                {
                  id: '1',
                  text: 'How satisfied are you with our service?',
                  type: 'multiple_choice',
                  options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'],
                  required: true
                },
                {
                  id: '2',
                  text: 'What features would you like to see improved?',
                  type: 'text',
                  required: false
                }
              ]}
              onSubmit={(data) => Alert.alert('Survey Submitted', 'Thank you for your feedback!')}
              loading={loading}
              style={{ marginBottom: 20 }}
            />
            
            <QuizForm
              questions={[
                {
                  id: '1',
                  question: 'What is the capital of France?',
                  options: ['London', 'Berlin', 'Paris', 'Madrid'],
                  correctAnswer: 2,
                  type: 'multiple_choice'
                },
                {
                  id: '2',
                  question: 'React Native uses which language?',
                  options: ['Java', 'Swift', 'JavaScript', 'Kotlin'],
                  correctAnswer: 2,
                  type: 'multiple_choice'
                }
              ]}
              onSubmit={(data) => Alert.alert('Quiz Completed', `Score: ${data.score}/${data.total}`)}
              showResults={true}
              loading={loading}
              style={{ marginBottom: 20 }}
            />
          </View>
        );

      case 'lists':
        return (
          <View style={styles.componentContainer}>
            <UserList
              users={mockUsers}
              onUserSelect={handleUserSelect}
              actions={userActions}
              showSearch={true}
              layout="list"
              allowLayoutSwitch={true}
              showStats={true}
              style={{ marginBottom: 20 }}
            />
            
            <ProductList
              products={mockProducts}
              onProductSelect={(product) => Alert.alert('Product Selected', product.name)}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              showWishlist={true}
              showAddToCart={true}
              showRating={true}
              showFilters={true}
              showSort={true}
              loading={loading}
              style={{ marginBottom: 20 }}
            />
            
            <ArticleList
              articles={[
                {
                  id: '1',
                  title: 'Getting Started with React Native',
                  excerpt: 'Learn the basics of React Native development with this comprehensive guide.',
                  author: 'John Developer',
                  publishDate: '2024-01-15',
                  readTime: 5,
                  imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop',
                  category: 'Tutorial',
                  tags: ['react-native', 'mobile', 'tutorial']
                },
                {
                  id: '2',
                  title: 'Advanced TypeScript Patterns',
                  excerpt: 'Explore advanced TypeScript patterns for better code organization.',
                  author: 'Jane Coder',
                  publishDate: '2024-01-10',
                  readTime: 8,
                  imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop',
                  category: 'Programming',
                  tags: ['typescript', 'patterns', 'advanced']
                }
              ]}
              onArticleSelect={(article) => Alert.alert('Article Selected', article.title)}
              onAuthorSelect={(author) => Alert.alert('Author Selected', author)}
              onCategorySelect={(category) => Alert.alert('Category Selected', category)}
              showImages={true}
              showExcerpt={true}
              showAuthor={true}
              showReadTime={true}
              showTags={true}
              loading={loading}
              style={{ marginBottom: 20 }}
            />
          </View>
        );

      case 'ecommerce':
        return (
          <View style={styles.componentContainer}>
            <ProductGrid
              products={mockProducts}
              onProductSelect={(product) => Alert.alert('Product', product.name)}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              numColumns={1}
              showWishlist={true}
              showAddToCart={true}
              showRating={true}
              cardStyle="detailed"
            />
          </View>
        );

      case 'lists-advanced':
        return (
          <ScrollView style={styles.componentContainer}>
            <Text style={styles.sectionTitle}>🗓️ Event List</Text>
            <EventList
              events={[{
                id: '1',
                title: 'Team Standup Meeting',
                description: 'Daily standup with the development team',
                startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
                location: 'Conference Room A',
                category: 'meeting',
                priority: 'high',
                status: 'published',
                attendees: [
                  { id: '1', name: 'John Doe', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }
                ],
                organizer: { id: '1', name: 'Sarah Wilson' },
                isAllDay: false,
                rsvpRequired: true,
                maxAttendees: 10
              }]}
              onEventPress={(event) => Alert.alert('Event', event.title)}
              showAttendees={true}
              style={{ marginBottom: 20 }}
            />

            <Text style={styles.sectionTitle}>💬 Message List</Text>
            <MessageList
              messages={[{
                id: '1',
                text: 'Hey team! Just wanted to share some exciting news about our latest project updates. 🎉',
                sender: {
                  id: '1',
                  name: 'Alex Chen',
                  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
                },
                timestamp: new Date(Date.now() - 10 * 60 * 1000),
                isOwnMessage: false,
                readBy: []
              }]}
              currentUserId="current-user"
              onMessagePress={(message) => Alert.alert('Message', message.text)}
              style={{ marginBottom: 20 }}
            />

            <Text style={styles.sectionTitle}>🔔 Notification List</Text>
            <NotificationList
              notifications={[{
                id: '1',
                type: 'like',
                title: 'New Like',
                message: 'Sarah Wilson liked your post',
                timestamp: new Date(Date.now() - 30 * 60 * 1000),
                priority: 'normal',
                isRead: false,
                user: {
                  id: '1',
                  name: 'Sarah Wilson',
                  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b6e1e4c1?w=150&h=150&fit=crop&crop=face'
                }
              }]}
              onNotificationPress={(notification) => Alert.alert('Notification', notification.message)}
              style={{ marginBottom: 20 }}
            />
          </ScrollView>
        );

      case 'ecommerce-advanced':
        return (
          <View style={styles.componentContainer}>
            <Text style={styles.sectionTitle}>💳 Cart Summary</Text>
            <CartSummary
              cartData={mockCartSummaryData}
              onCheckout={() => Alert.alert('Checkout', 'Proceeding to checkout...')}
              onApplyCoupon={(code) => Alert.alert('Coupon Applied', `Applied: ${code}`)}
              onSelectShipping={(optionId) => Alert.alert('Shipping Selected', optionId)}
              showShippingOptions={true}
              allowCoupons={true}
              showBreakdown={true}
              showFreeShippingProgress={true}
            />
          </View>
        );

      case 'social':
        return (
          <ScrollView style={styles.componentContainer}>
            <Text style={styles.sectionTitle}>👤 User Card</Text>
            <UserCard
              user={mockUserCardData}
              onPress={(user) => Alert.alert('User Profile', user.name)}
              onFollow={(userId) => Alert.alert('Follow', `Following user ${userId}`)}
              onMessage={(userId) => Alert.alert('Message', `Messaging user ${userId}`)}
              showStats={true}
              showFollowButton={true}
              showMessageButton={true}
              variant="default"
              style={{ marginBottom: 20 }}
            />

            <Text style={styles.sectionTitle}>💬 Chat Bubble</Text>
            <ChatBubble
              message={mockChatMessage}
              isOwn={false}
              onPress={(message) => Alert.alert('Message', message.text)}
              showTimestamp={true}
              showStatus={true}
              showReactions={true}
              style={{ marginBottom: 20 }}
            />

            <Text style={styles.sectionTitle}>📝 Comment List</Text>
            <CommentList
              comments={mockComments}
              onLike={(commentId) => Alert.alert('Like', `Liked comment ${commentId}`)}
              onReply={(commentId) => Alert.alert('Reply', `Replying to comment ${commentId}`)}
              onUserPress={(user) => Alert.alert('User', user.name)}
              showReplies={true}
              showLikes={true}
              showReplyButton={true}
              style={{ marginBottom: 20 }}
            />
          </ScrollView>
        );

      case 'media':
        return (
          <View style={styles.componentContainer}>
            <Text style={styles.sectionTitle}>🖼️ Image Gallery</Text>
            <ImageGallery
              images={mockGalleryImages}
              onImagePress={(image) => Alert.alert('Image', image.title || 'Image selected')}
              onImageLongPress={(image) => Alert.alert('Image Menu', 'Long pressed on image')}
              layout="grid"
              columns={2}
              enableSelection={true}
              showImageInfo={true}
              aspectRatio={0.75}
            />
          </View>
        );

      case 'business':
        return (
          <ScrollView style={styles.componentContainer}>
            <Text style={styles.sectionTitle}>📊 Business Analytics</Text>
            <View style={styles.statsGrid}>
              {mockStatsData.map((stat, index) => (
                <StatsCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  format={stat.format}
                  trend={stat.trend}
                  icon={stat.icon}
                  color={stat.color}
                  style={{ marginBottom: 16, flex: index === 2 ? 1 : 0.48 }}
                />
              ))}
            </View>

            <Text style={styles.sectionTitle}>📈 Progress Tracking</Text>
            <ProgressCard
              title="Website Redesign Project"
              progress={mockProgressData}
              status="on_track"
              type="bar"
              description="Complete redesign of the company website with new branding and improved UX"
              category="Design"
              milestones={mockMilestones}
              team={mockTeamMembers}
              deadline={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)}
              priority="high"
              showTeam={true}
              showMilestones={true}
              showTimeTracking={true}
              timeTracking={{
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
              }}
              onTeamMemberPress={(member) => Alert.alert('Team Member', member.name)}
              style={{ marginBottom: 20 }}
            />
          </ScrollView>
        );

      case 'health':
        return (
          <ScrollView style={styles.componentContainer}>
            <Text style={styles.sectionTitle}>💪 Workout Tracking</Text>
            <WorkoutCard
              title={mockWorkoutData.title}
              description={mockWorkoutData.description}
              category={mockWorkoutData.category}
              difficulty={mockWorkoutData.difficulty}
              status={mockWorkoutData.status}
              exercises={mockWorkoutData.exercises}
              estimatedDuration={mockWorkoutData.estimatedDuration}
              estimatedCalories={mockWorkoutData.estimatedCalories}
              thumbnail={mockWorkoutData.thumbnail}
              equipment={mockWorkoutData.equipment}
              trainer={mockWorkoutData.trainer}
              showProgress={true}
              enableTimer={true}
              onStart={() => Alert.alert('Workout', 'Starting workout...')}
              onPause={() => Alert.alert('Workout', 'Workout paused')}
              onComplete={() => Alert.alert('Workout', 'Workout completed! 🎉')}
              onExercisePress={(exercise) => Alert.alert('Exercise', exercise.name)}
              style={{ marginBottom: 20 }}
            />

            <Text style={styles.sectionTitle}>🥗 Nutrition Tracking</Text>
            <NutritionCard
              meal={mockNutritionData}
              nutritionGoals={mockNutritionGoals}
              dailyProgress={mockDailyProgress}
              showProgress={true}
              showDetails={false}
              showIngredients={true}
              showTiming={true}
              onLogMeal={(meal) => Alert.alert('Meal Logged', `${meal.name} logged successfully!`)}
              onViewRecipe={(meal) => Alert.alert('Recipe', `Viewing recipe for ${meal.name}`)}
              onFoodPress={(food) => Alert.alert('Food Item', food.name)}
              onNutritionPress={() => Alert.alert('Nutrition', 'Showing detailed nutrition info')}
              style={{ marginBottom: 20 }}
            />

            <ErrorCard
              type="network"
              title="Sync Failed"
              message="Unable to sync your workout data with the cloud"
              severity="medium"
              onRetry={() => Alert.alert('Retry', 'Retrying sync...')}
              onContactSupport={() => Alert.alert('Support', 'Opening support chat...')}
              debugInfo={{
                errorCode: 'SYNC_001',
                timestamp: new Date(),
                requestId: 'req_12345'
              }}
              style={{ marginBottom: 20 }}
            />
          </ScrollView>
        );

      case 'booking':
        return (
          <ScrollView style={styles.componentContainer}>
            <Text style={styles.sectionTitle}>📅 Basic Booking Components</Text>
            
            <ServiceCard
              service={mockService}
              onPress={() => Alert.alert('Service', `Selected: ${mockService.name}`)}
              onBook={() => Alert.alert('Book', `Booking ${mockService.name}`)}
              onFavorite={() => Alert.alert('Favorite', 'Added to favorites')}
              showPricing={true}
              showAvailability={true}
            />

            <ServiceProviderCard
              provider={mockProvider}
              onPress={() => Alert.alert('Provider', `Selected: ${mockProvider.name}`)}
              onContact={() => Alert.alert('Message', `Send message to ${mockProvider.name}`)}
              onViewDetails={() => Alert.alert('Profile', `View ${mockProvider.name}'s profile`)}
              showRating={true}
              showSpecialties={true}
              showPricing={true}
            />

            <BookingCalendar
              selectedDate={new Date()}
              onDateSelect={(date) => Alert.alert('Date Selected', date.toDateString())}
              availableDates={[
                new Date(),
                new Date(Date.now() + 24 * 60 * 60 * 1000),
                new Date(Date.now() + 48 * 60 * 60 * 1000)
              ]}
              bookedDates={[new Date(Date.now() + 72 * 60 * 60 * 1000)]}
              minDate={new Date()}
              maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
              style={{ marginBottom: 20 }}
            />

            <TimeSlotGrid
              timeSlots={mockTimeSlots}
              selectedSlot="3"
              onSlotSelect={(slot) => Alert.alert('Time Selected', `Selected ${slot.time}`)}
              layout="grid"
              showPricing={true}
              style={{ marginBottom: 20 }}
            />

            <BookingForm
              service={mockService}
              provider={mockProvider}
              selectedDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
              selectedTime="10:00"
              onSubmit={(data) => Alert.alert('Booking Submitted', `Booking for ${data.customerInfo.firstName}`)}
              loading={false}
              style={{ marginBottom: 20 }}
            />

            <BookingSummary
              appointment={mockAppointment}
              onConfirm={() => Alert.alert('Confirmed', 'Booking confirmed!')}
              onEdit={() => Alert.alert('Edit', 'Edit booking details')}
              onCancel={() => Alert.alert('Cancel', 'Cancel booking')}
              showPaymentInfo={true}
              style={{ marginBottom: 20 }}
            />

            <AppointmentCard
              appointment={mockAppointment}
              onPress={() => Alert.alert('Appointment', 'View appointment details')}
              onReschedule={() => Alert.alert('Reschedule', 'Reschedule appointment')}
              onCancel={() => Alert.alert('Cancel', 'Cancel appointment')}
              onMessage={() => Alert.alert('Message', 'Message provider')}
              showActions={true}
              layout="standard"
              style={{ marginBottom: 20 }}
            />

            <ReviewCard
              review={{
                id: 'review_1',
                rating: 5,
                title: 'Excellent Service!',
                content: 'Sarah was amazing! Really helped me achieve my fitness goals.',
                author: {
                  id: 'user_1',
                  name: 'Mike Johnson',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                  verified: true
                },
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                serviceInfo: {
                  serviceName: 'Personal Training',
                  providerName: 'Sarah Johnson',
                  sessionDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
                },
                helpful: { yes: 12, no: 1 },
                verified: true
              }}
              onHelpful={(helpful) => Alert.alert('Helpful', helpful ? 'Marked as helpful' : 'Marked as not helpful')}
              onReport={() => Alert.alert('Report', 'Review reported')}
              style={{ marginBottom: 20 }}
            />
          </ScrollView>
        );

      case 'booking-advanced':
        return (
          <ScrollView style={styles.componentContainer}>
            <Text style={styles.sectionTitle}>🎯 Advanced Booking Features</Text>
            
            <ClassScheduleCard
              classSchedule={{
                id: 'class_1',
                name: 'Morning Yoga Flow',
                description: 'Start your day with energizing yoga sequences designed to awaken your body and mind',
                category: 'Yoga',
                difficulty: 'all_levels',
                duration: 60,
                image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop',
                pricing: {
                  dropIn: 25,
                  package: { sessions: 10, price: 200, savings: 50 },
                  currency: 'USD'
                },
                instructor: {
                  id: 'inst_1',
                  name: 'Lisa Chen',
                  title: 'Certified Yoga Instructor',
                  image: 'https://images.unsplash.com/photo-1494790108755-2616c7e0d024?w=150&h=150&fit=crop&crop=face',
                  rating: 4.9,
                  experience: 8,
                  certifications: ['RYT-500', 'Meditation Teacher'],
                  specialties: ['Vinyasa', 'Meditation', 'Prenatal Yoga'],
                  verified: true
                },
                occurrences: [
                  {
                    id: 'occ_1',
                    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
                    enrolled: 12,
                    maxCapacity: 15,
                    waitlistCount: 3,
                    status: 'open'
                  }
                ],
                equipment: [
                  { name: 'Yoga Mat', required: true, available: 'provided' },
                  { name: 'Blocks', required: false, available: 'provided' }
                ],
                location: 'Studio A',
                recurrence: {
                  pattern: 'weekly',
                  daysOfWeek: [1, 3, 5] // Mon, Wed, Fri
                },
                benefits: ['Increased flexibility', 'Stress relief', 'Better sleep'],
                policies: {
                  cancellation: '24-hour cancellation policy',
                  lateArrival: '5-minute grace period',
                  makeupClass: 'Makeup classes available within 30 days'
                },
                rating: 4.8,
                reviewCount: 156,
                tags: ['yoga', 'morning', 'flow']
              }}
              onPress={() => Alert.alert('Class Details', 'View full class details')}
              onEnroll={(occurrence) => Alert.alert('Enroll', `Enroll in class at ${occurrence.startTime}`)}
              onViewInstructor={(instructor) => Alert.alert('Instructor', `View ${instructor.name}'s profile`)}
              showInstructor={true}
              showPricing={true}
              style={{ marginBottom: 20 }}
            />

            <WaitlistCard
              waitlistEntry={{
                id: 'wait_1',
                userId: 'user_1',
                service: {
                  id: 'srv_1',
                  name: 'Massage Therapy',
                  description: 'Relaxing full-body massage',
                  duration: 90,
                  price: 120,
                  currency: 'USD',
                  provider: {
                    id: 'prov_1',
                    name: 'Emily Rodriguez',
                    rating: 4.9
                  }
                },
                timeSlot: {
                  id: 'slot_1',
                  startTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
                  endTime: new Date(Date.now() + 49.5 * 60 * 60 * 1000),
                  capacity: 1,
                  enrolled: 1,
                  waitlistCount: 5,
                  userEnrolled: false
                },
                position: 3,
                totalWaitlist: 5,
                status: 'active',
                priority: 'normal',
                joinedDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
                conversionProbability: 75,
                notifications: {
                  methods: ['email', 'push'],
                  advanceNotice: 30,
                  autoBook: true
                }
              }}
              onPress={() => Alert.alert('Waitlist', 'View waitlist details')}
              onLeaveWaitlist={() => Alert.alert('Leave', 'Leave waitlist')}
              onUpdateNotifications={(notifications) => Alert.alert('Updated', 'Notification settings updated')}
              showNotifications={true}
              style={{ marginBottom: 20 }}
            />

            <PackageCard
              package={{
                id: 'pkg_1',
                name: '10-Session Fitness Package',
                description: 'Flexible fitness sessions with any instructor at our facility',
                type: 'session_bundle',
                status: 'active',
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
                pricing: {
                  price: 750,
                  originalPrice: 850,
                  currency: 'USD',
                  billingCycle: 'one_time',
                  autoRenewal: false,
                  pricePerSession: 75
                },
                usage: {
                  totalSessions: 10,
                  usedSessions: 3,
                  remainingSessions: 7,
                  allowRollover: true,
                  expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                  recentUsage: []
                },
                benefits: [
                  { id: 'b1', title: 'Flexible Scheduling', description: 'Book any available time slot', included: true },
                  { id: 'b2', title: 'Trainer Choice', description: 'Work with any certified trainer', included: true },
                  { id: 'b3', title: 'Equipment Access', description: 'Full gym access during sessions', included: true }
                ],
                restrictions: {
                  cancellationPolicy: '24-hour cancellation required',
                  transferable: false,
                  shareable: false
                },
                provider: {
                  id: 'gym_1',
                  name: 'FitLife Gym',
                  rating: 4.7,
                  locationCount: 3,
                  serviceCount: 15
                },
                tags: ['fitness', 'flexible', 'value'],
                createdAt: new Date(),
                updatedAt: new Date()
              }}
              onPress={() => Alert.alert('Package', 'View package details')}
              onManage={() => Alert.alert('Manage', 'Manage package')}
              showUsage={true}
              showBenefits={true}
              style={{ marginBottom: 20 }}
            />
          </ScrollView>
        );

      case 'utility':
        return (
          <ScrollView style={styles.componentContainer}>
            <Text style={styles.sectionTitle}>⏳ Loading States</Text>
            
            <LoadingCard
              type="skeleton"
              layout="card"
              message="Loading content..."
              subtitle="Please wait while we fetch your data"
              animated={true}
              style={{ marginBottom: 20 }}
            />

            <LoadingCard
              type="spinner"
              message="Processing request..."
              showProgress={true}
              progress={65}
              tips={["This may take a few moments", "Large files take longer to process"]}
              icon="⚡"
              style={{ marginBottom: 20 }}
            />

            <LoadingCard
              type="skeleton"
              layout="list"
              itemCount={4}
              message="Loading list items..."
              size="medium"
              style={{ marginBottom: 20 }}
            />

            <LoadingCard
              type="dots"
              message="Connecting..."
              size="small"
              color="#6366f1"
              style={{ marginBottom: 20 }}
            />

            <Text style={styles.sectionTitle}>🚨 Error States</Text>
            
            <ErrorCard
              type="server"
              title="Server Error"
              message="We're experiencing technical difficulties. Please try again later."
              severity="high"
              onRetry={() => Alert.alert('Retry', 'Retrying request...')}
              onContactSupport={() => Alert.alert('Support', 'Contacting support...')}
              debugInfo={{
                errorCode: 'ERR_500',
                timestamp: new Date(),
                requestId: 'req_67890'
              }}
              showDebugInfo={false}
              style={{ marginBottom: 20 }}
            />
          </ScrollView>
        );

      case 'shop':
        return (
          <ShopScreen
            products={mockProducts}
            onProductSelect={(product) => Alert.alert('Product Selected', product.name)}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            onSearch={handleSearch}
            config={{
              title: "Demo Store",
              showSearch: true,
              showCategories: true,
              gridColumns: 2
            }}
            loading={loading}
          />
        );

      case 'cart':
        return (
          <CartScreen
            cartItems={mockCartItems}
            onQuantityChange={async (id, qty) => Alert.alert('Quantity Updated', `Item ${id}: ${qty}`)}
            onRemoveItem={async (id) => Alert.alert('Item Removed', `Removed item ${id}`)}
            onCheckout={(items, summary) => Alert.alert('Checkout', `Total: ${summary.currency}${summary.total.toFixed(2)}`)}
            onContinueShopping={() => setActiveMode('shop')}
            onItemPress={(item) => Alert.alert('Item Details', item.name)}
            taxRate={0.08}
            shippingCost={5.99}
            freeShippingThreshold={50}
          />
        );

      case 'templates':
        return (
          <View style={styles.blocksGrid}>
            <Text style={styles.sectionTitle}>📱 Screen Templates</Text>
            <Text style={styles.sectionDescription}>
              Complete screen templates for common app patterns
            </Text>
            
            <View style={styles.categoryGrid}>
              {demoModes.slice(18, 26).map((mode) => (
                <TouchableOpacity
                  key={mode.id}
                  style={styles.categoryCard}
                  onPress={() => setActiveMode(mode.id as ShowcaseMode)}
                >
                  <Text style={styles.categoryIcon}>{mode.icon}</Text>
                  <Text style={styles.categoryLabel}>{mode.label}</Text>
                  <Text style={styles.categoryDescription}>{mode.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.templateNote}>
              💡 Click on any category above to see complete screen templates that can be used directly in your app.
            </Text>
          </View>
        );

      case 'flows':
        return (
          <ScrollView style={styles.componentContainer}>
            <Text style={styles.sectionTitle}>🎯 User Flows & Interactive Demos</Text>
            <Text style={styles.sectionDescription}>
              Step-by-step user flows and complete interactive experiences
            </Text>
            
            {/* User Flow Patterns */}
            <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 10 }]}>📋 User Flow Patterns</Text>
            <View style={styles.categoryGrid}>
              <View style={styles.categoryCard}>
                <Text style={styles.categoryIcon}>🔐</Text>
                <Text style={styles.categoryLabel}>Authentication Flow</Text>
                <Text style={styles.categoryDescription}>Login → Verification → Dashboard</Text>
              </View>
              
              <View style={styles.categoryCard}>
                <Text style={styles.categoryIcon}>🛒</Text>
                <Text style={styles.categoryLabel}>Shopping Flow</Text>
                <Text style={styles.categoryDescription}>Browse → Add to Cart → Checkout</Text>
              </View>
              
              <View style={styles.categoryCard}>
                <Text style={styles.categoryIcon}>👤</Text>
                <Text style={styles.categoryLabel}>Profile Setup Flow</Text>
                <Text style={styles.categoryDescription}>Create → Customize → Complete</Text>
              </View>
              
              <View style={styles.categoryCard}>
                <Text style={styles.categoryIcon}>💬</Text>
                <Text style={styles.categoryLabel}>Messaging Flow</Text>
                <Text style={styles.categoryDescription}>Select Contact → Chat → Send</Text>
              </View>
            </View>
            
            {/* Interactive Demos */}
            <Text style={[styles.sectionTitle, { marginTop: 30, marginBottom: 10 }]}>🎮 Interactive Demos</Text>
            <View style={styles.categoryGrid}>
              {demoModes.slice(-2).map((mode) => (
                <TouchableOpacity
                  key={mode.id}
                  style={styles.categoryCard}
                  onPress={() => setActiveMode(mode.id as ShowcaseMode)}
                >
                  <Text style={styles.categoryIcon}>{mode.icon}</Text>
                  <Text style={styles.categoryLabel}>{mode.label}</Text>
                  <Text style={styles.categoryDescription}>{mode.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.templateNote}>
              🎯 Flows show how components work together, while demos provide fully interactive experiences.
            </Text>
          </ScrollView>
        );

      case 'auth-templates':
        return (
          <ScrollView style={styles.componentContainer}>
            <Text style={styles.sectionTitle}>🔐 Authentication Templates</Text>
            
            <LoginScreen
              onLogin={(email, password) => Alert.alert('Login', `Email: ${email}`)}
              onForgotPassword={() => setActiveMode('auth-templates')}
              onSignup={() => setActiveMode('auth-templates')}
              style={{ marginBottom: 20 }}
            />
            
            <SignupScreen
              onSignup={(data) => Alert.alert('Signup', `Welcome ${data.firstName}!`)}
              onLogin={() => setActiveMode('auth-templates')}
              style={{ marginBottom: 20 }}
            />
          </ScrollView>
        );

      case 'home-templates':
        return (
          <ScrollView style={styles.componentContainer}>
            <Text style={styles.sectionTitle}>🏠 Home & Dashboard Templates</Text>
            
            <HomeScreen
              user={mockUsers[0] as any}
              onNavigate={(screen) => Alert.alert('Navigate', `Going to ${screen}`)}
              style={{ marginBottom: 20 }}
            />
          </ScrollView>
        );

      case 'profile-templates':
        return (
          <ScrollView style={styles.componentContainer}>
            <Text style={styles.sectionTitle}>👤 Profile & Settings Templates</Text>
            
            <ProfileScreen
              user={mockUsers[0] as any}
              onEdit={() => Alert.alert('Edit', 'Edit profile')}
              onSettings={() => Alert.alert('Settings', 'Open settings')}
              onLogout={() => Alert.alert('Logout', 'Logging out...')}
              style={{ marginBottom: 20 }}
            />
          </ScrollView>
        );

      case 'ecommerce-templates':
        return (
          <ScrollView style={styles.componentContainer}>
            <Text style={styles.sectionTitle}>🛒 E-commerce Templates</Text>
            
            <ShopScreen
              products={mockProducts}
              onProductSelect={(product) => Alert.alert('Product', product.name)}
              onAddToCart={(product) => Alert.alert('Cart', `Added ${product.name} to cart`)}
              onSearch={(query) => Alert.alert('Search', query)}
              config={{ title: 'Shop Template Demo', gridColumns: 2 }}
              style={{ marginBottom: 20 }}
            />
          </ScrollView>
        );

      case 'business-templates':
        return (
          <ScrollView style={styles.componentContainer}>
            <Text style={styles.sectionTitle}>💼 Business Templates</Text>
            
            <CalendarScreen
              events={[]}
              onEventPress={(event) => Alert.alert('Event', event.title)}
              onCreateEvent={() => Alert.alert('Create', 'Creating new event...')}
              onDateSelect={(date) => Alert.alert('Date', `Selected: ${date.toDateString()}`)}
              style={{ marginBottom: 20 }}
            />
          </ScrollView>
        );

      case 'communication-templates':
        return (
          <ScrollView style={styles.componentContainer}>
            <Text style={styles.sectionTitle}>💬 Communication Templates</Text>
            
            <ChatListScreen
              conversations={[]}
              onConversationPress={(conversation) => Alert.alert('Chat', `Opening chat with ${conversation.name}`)}
              onNewChat={() => Alert.alert('New Chat', 'Starting new conversation...')}
              style={{ marginBottom: 20 }}
            />
          </ScrollView>
        );

      case 'booking-templates':
        return (
          <ScrollView style={styles.componentContainer}>
            <Text style={styles.sectionTitle}>📅 Booking & Service Templates</Text>
            <Text style={styles.sectionDescription}>
              Complete screens for service booking and appointment management
            </Text>
            
            <View style={styles.templateGrid}>
              <View style={styles.templateCard}>
                <Text style={styles.templateIcon}>🔍</Text>
                <Text style={styles.templateTitle}>Services Discovery</Text>
                <Text style={styles.templateDescription}>Browse and search available services</Text>
              </View>
              
              <View style={styles.templateCard}>
                <Text style={styles.templateIcon}>📋</Text>
                <Text style={styles.templateTitle}>Service Details</Text>
                <Text style={styles.templateDescription}>Detailed service information and booking</Text>
              </View>
              
              <View style={styles.templateCard}>
                <Text style={styles.templateIcon}>👩‍⚕️</Text>
                <Text style={styles.templateTitle}>Provider Profiles</Text>
                <Text style={styles.templateDescription}>Service provider information and reviews</Text>
              </View>
              
              <View style={styles.templateCard}>
                <Text style={styles.templateIcon}>📅</Text>
                <Text style={styles.templateTitle}>Booking Calendar</Text>
                <Text style={styles.templateDescription}>Date and time selection interface</Text>
              </View>
              
              <View style={styles.templateCard}>
                <Text style={styles.templateIcon}>📝</Text>
                <Text style={styles.templateTitle}>Booking Form</Text>
                <Text style={styles.templateDescription}>Customer information and preferences</Text>
              </View>
              
              <View style={styles.templateCard}>
                <Text style={styles.templateIcon}>✅</Text>
                <Text style={styles.templateTitle}>Booking Confirmation</Text>
                <Text style={styles.templateDescription}>Appointment summary and confirmation</Text>
              </View>
              
              <View style={styles.templateCard}>
                <Text style={styles.templateIcon}>📋</Text>
                <Text style={styles.templateTitle}>My Bookings</Text>
                <Text style={styles.templateDescription}>User's appointment history and management</Text>
              </View>
              
              <View style={styles.templateCard}>
                <Text style={styles.templateIcon}>🎯</Text>
                <Text style={styles.templateTitle}>Class Schedules</Text>
                <Text style={styles.templateDescription}>Group classes and workshop scheduling</Text>
              </View>
              
              <View style={styles.templateCard}>
                <Text style={styles.templateIcon}>📦</Text>
                <Text style={styles.templateTitle}>Packages & Memberships</Text>
                <Text style={styles.templateDescription}>Service bundles and subscription management</Text>
              </View>
              
              <View style={styles.templateCard}>
                <Text style={styles.templateIcon}>⏰</Text>
                <Text style={styles.templateTitle}>Waitlist Management</Text>
                <Text style={styles.templateDescription}>Join waitlists and get notifications</Text>
              </View>
            </View>
            
            <Text style={styles.templateNote}>
              💡 These templates provide complete booking workflows from discovery to confirmation, 
              perfect for service-based businesses like spas, gyms, healthcare, and professional services.
            </Text>
          </ScrollView>
        );

      case 'booking-flows':
        return (
          <ScrollView style={styles.componentContainer}>
            <Text style={styles.sectionTitle}>🔄 Booking Workflow Demos</Text>
            <Text style={styles.sectionDescription}>
              End-to-end user journeys for booking services
            </Text>
            
            <View style={styles.flowGrid}>
              <View style={styles.flowCard}>
                <Text style={styles.flowIcon}>🎯</Text>
                <Text style={styles.flowTitle}>Service Discovery Flow</Text>
                <Text style={styles.flowDescription}>Search → Filter → Compare → Select</Text>
                <View style={styles.flowSteps}>
                  <Text style={styles.flowStep}>1. Browse categories</Text>
                  <Text style={styles.flowStep}>2. Apply filters</Text>
                  <Text style={styles.flowStep}>3. Compare options</Text>
                  <Text style={styles.flowStep}>4. Select service</Text>
                </View>
              </View>
              
              <View style={styles.flowCard}>
                <Text style={styles.flowIcon}>📅</Text>
                <Text style={styles.flowTitle}>Appointment Booking Flow</Text>
                <Text style={styles.flowDescription}>Calendar → Time → Form → Confirm</Text>
                <View style={styles.flowSteps}>
                  <Text style={styles.flowStep}>1. Select date</Text>
                  <Text style={styles.flowStep}>2. Choose time slot</Text>
                  <Text style={styles.flowStep}>3. Fill details</Text>
                  <Text style={styles.flowStep}>4. Confirm booking</Text>
                </View>
              </View>
              
              <View style={styles.flowCard}>
                <Text style={styles.flowIcon}>👨‍⚕️</Text>
                <Text style={styles.flowTitle}>Provider Selection Flow</Text>
                <Text style={styles.flowDescription}>Browse → Profile → Reviews → Book</Text>
                <View style={styles.flowSteps}>
                  <Text style={styles.flowStep}>1. Browse providers</Text>
                  <Text style={styles.flowStep}>2. View profiles</Text>
                  <Text style={styles.flowStep}>3. Read reviews</Text>
                  <Text style={styles.flowStep}>4. Make booking</Text>
                </View>
              </View>
              
              <View style={styles.flowCard}>
                <Text style={styles.flowIcon}>🎪</Text>
                <Text style={styles.flowTitle}>Class Enrollment Flow</Text>
                <Text style={styles.flowDescription}>Schedule → Enroll → Pay → Confirm</Text>
                <View style={styles.flowSteps}>
                  <Text style={styles.flowStep}>1. View schedule</Text>
                  <Text style={styles.flowStep}>2. Check availability</Text>
                  <Text style={styles.flowStep}>3. Enroll & pay</Text>
                  <Text style={styles.flowStep}>4. Get confirmation</Text>
                </View>
              </View>
              
              <View style={styles.flowCard}>
                <Text style={styles.flowIcon}>📦</Text>
                <Text style={styles.flowTitle}>Package Purchase Flow</Text>
                <Text style={styles.flowDescription}>Compare → Select → Customize → Buy</Text>
                <View style={styles.flowSteps}>
                  <Text style={styles.flowStep}>1. Compare packages</Text>
                  <Text style={styles.flowStep}>2. Select plan</Text>
                  <Text style={styles.flowStep}>3. Customize options</Text>
                  <Text style={styles.flowStep}>4. Complete purchase</Text>
                </View>
              </View>
              
              <View style={styles.flowCard}>
                <Text style={styles.flowIcon}>⏰</Text>
                <Text style={styles.flowTitle}>Waitlist Management Flow</Text>
                <Text style={styles.flowDescription}>Join → Wait → Notify → Book</Text>
                <View style={styles.flowSteps}>
                  <Text style={styles.flowStep}>1. Join waitlist</Text>
                  <Text style={styles.flowStep}>2. Set preferences</Text>
                  <Text style={styles.flowStep}>3. Get notified</Text>
                  <Text style={styles.flowStep}>4. Quick booking</Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.templateNote}>
              🚀 These flows demonstrate complete user journeys optimized for conversion and user experience. 
              Each flow can be customized for different business models and service types.
            </Text>
          </ScrollView>
        );

      default:
        return (
          <View style={styles.componentContainer}>
            <Text style={styles.componentTitle}>Select a component category above</Text>
          </View>
        );
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    tabContainer: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tabScroll: {
      paddingHorizontal: 16,
    },
    tabsRow: {
      flexDirection: 'row',
      paddingVertical: 12,
    },
    tab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    activeTab: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    activeTabText: {
      color: '#ffffff',
    },
    content: {
      flex: 1,
    },
    blocksGrid: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    sectionDescription: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 32,
    },
    categoryCard: {
      width: '48%',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    categoryIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    categoryLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    categoryDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 16,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    componentContainer: {
      flex: 1,
      padding: 16,
    },
    componentTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    templateGrid: {
      marginVertical: 20,
    },
    templateCategory: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    templateCategoryTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    templateCategoryDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    templateNote: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
      marginTop: 20,
      lineHeight: 20,
    },
    templateGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    templateCard: {
      width: '48%',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    templateIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    templateTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    templateDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 16,
    },
    flowGrid: {
      marginBottom: 24,
    },
    flowCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    flowIcon: {
      fontSize: 24,
      marginBottom: 8,
    },
    flowTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    flowDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 12,
    },
    flowSteps: {
      marginTop: 8,
    },
    flowStep: {
      fontSize: 12,
      color: theme.colors.text,
      marginBottom: 4,
      paddingLeft: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎨 Component Showcase</Text>
        <Text style={styles.headerSubtitle}>
          Explore our comprehensive AI-optimized React Native component library
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          <View style={styles.tabsRow}>
            {['blocks', 'templates', 'flows'].map((tabId) => {
              const mode = demoModes.find(m => m.id === tabId);
              if (!mode) return null;
              
              // Determine if this tab should be active based on current mode
              const isActive = (() => {
                if (tabId === 'blocks') {
                  return ['blocks', 'auth', 'auth-advanced', 'forms', 'forms-advanced', 'lists', 'lists-advanced', 'ecommerce', 'ecommerce-advanced', 'social', 'media', 'business', 'booking', 'booking-advanced', 'utility', 'health'].includes(activeMode);
                } else if (tabId === 'templates') {
                  return ['templates', 'auth-templates', 'home-templates', 'profile-templates', 'ecommerce-templates', 'business-templates', 'communication-templates', 'booking-templates'].includes(activeMode);
                } else if (tabId === 'flows') {
                  return ['flows', 'shop', 'cart', 'booking-flows'].includes(activeMode);
                }
                return activeMode === tabId;
              })();
              
              return (
                <TouchableOpacity
                  key={mode.id}
                  style={[styles.tab, isActive && styles.activeTab]}
                  onPress={() => setActiveMode(mode.id as ShowcaseMode)}
                >
                  <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                    {mode.icon} {mode.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderDemoComponent()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ComponentsShowcaseScreen; 