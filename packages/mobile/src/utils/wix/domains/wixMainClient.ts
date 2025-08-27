/**
 * Wix Main Client
 * 
 * Orchestrates all domain-specific clients and provides a unified API
 * while maintaining backward compatibility with the existing interface.
 */

import { wixAuthenticationClient } from './wixAuthenticationClient';
import { wixCMSClient } from './wixCMSClient';
import { WixCoreClient } from './wixCoreClient';
import { featureManager } from '../../../config/features';

// Re-export types from domain clients
export type {
  MemberTokens,
  VisitorTokens,
  MemberIdentity,
  LoginCredentials,
  RegisterData,
} from './wixAuthenticationClient';

export type {
  WixDataItem,
  WixCollection,
  WixDataQuery,
  WixDataResponse,
} from './wixCMSClient';

// Import existing types from other files
export type {
  WixProduct,
  WixCategory,
} from '../wixEcommerceClient';

export type {
  WixCart,
  WixCartItem,
} from '../wixEcommerceClient';

export type {
  WixService,
  WixServiceProvider,
  WixBooking,
  WixAvailabilitySlot,
} from '../../wixBookingApiClient';

// === MAIN ORCHESTRATING CLIENT ===

export class WixMainClient extends WixCoreClient {
  // Domain clients
  public readonly auth = wixAuthenticationClient;
  public readonly cms = wixCMSClient;
  
  // Lazy loading for heavy clients
  private _ecommerce: any = null;
  private _booking: any = null;
  private _restaurant: any = null;

  constructor() {
    super('MAIN');
    console.log('🏢 [WIX MAIN] Main orchestrating client initialized');
    
    if (featureManager.getFeature('ENABLE_AUTH_DIAGNOSTICS')) {
      // Run diagnostics after a short delay
      setTimeout(() => {
        this.diagnoseAuthenticationIssues().catch(error => {
          console.warn('⚠️ [DIAGNOSTICS] Authentication diagnostics failed:', error);
        });
      }, 1000);
    }
  }

  // === LAZY LOADING GETTERS ===

  get ecommerce() {
    if (!this._ecommerce) {
      const { wixEcommerceClient } = require('./wixEcommerceClient');
      this._ecommerce = wixEcommerceClient;
    }
    return this._ecommerce;
  }

  get booking() {
    if (!this._booking) {
      const { wixBookingClient } = require('./wixBookingClient');
      this._booking = wixBookingClient;
    }
    return this._booking;
  }

  get restaurant() {
    if (!this._restaurant) {
      const { wixRestaurantClient } = require('./wixRestaurantClient');
      this._restaurant = wixRestaurantClient;
    }
    return this._restaurant;
  }

  // === AUTHENTICATION METHODS (DELEGATION) ===

  async loginMember(email: string, password: string) {
    return await this.auth.loginMember(email, password);
  }

  async logoutMember() {
    return await this.auth.logoutMember();
  }

  async registerMember(data: RegisterData) {
    return await this.auth.registerMember(data);
  }

  getCurrentMember() {
    return this.auth.getCurrentMember();
  }

  isMemberLoggedIn(): boolean {
    return this.auth.isMemberLoggedIn();
  }

  hasMemberTokens(): boolean {
    return this.auth.hasMemberTokens();
  }

  addMemberStateChangeListener(listener: () => void) {
    return this.auth.addMemberStateChangeListener(listener);
  }

  removeMemberStateChangeListener(listener: () => void) {
    return this.auth.removeMemberStateChangeListener(listener);
  }

  async refreshVisitorAuthentication() {
    return await this.auth.generateVisitorTokens();
  }

  // === E-COMMERCE METHODS (DELEGATION) ===

  async queryProducts(filters?: any) {
    return await this.ecommerce.queryProducts(filters);
  }

  async getProduct(productId: string) {
    return await this.ecommerce.getProduct(productId);
  }

  async getCollections() {
    return await this.ecommerce.queryCategories();
  }

  async queryCategories(filters?: any) {
    return await this.ecommerce.queryCategories(filters);
  }

  async getCurrentCart() {
    return await this.ecommerce.getCurrentCart();
  }

  async addToCart(items: any[]) {
    return await this.ecommerce.addToCart(items);
  }

  async updateCartItemQuantity(lineItemId: string, quantity: number) {
    return await this.ecommerce.updateCartItemQuantity(lineItemId, quantity);
  }

  async removeFromCart(lineItemIds: string[]) {
    return await this.ecommerce.removeFromCart(lineItemIds);
  }

  async createCheckout() {
    return await this.ecommerce.createCheckout();
  }

  getOptimizedImageUrl(imageUrl: string, width?: number, height?: number) {
    return this.ecommerce.getOptimizedImageUrl(imageUrl, width, height);
  }

  // === BOOKING METHODS (DELEGATION) ===

  async queryServices(filters?: any) {
    return await this.booking.queryServices(filters);
  }

  async getService(serviceId: string) {
    return await this.booking.getService(serviceId);
  }

  async queryServiceCategories(filters?: any) {
    return await this.booking.queryServiceCategories(filters);
  }

  async queryServiceProviders(filters?: any) {
    return await this.booking.queryServiceProviders(filters);
  }

  async getAvailableSlots(query: any) {
    return await this.booking.getAvailableSlots(query);
  }

  async createBooking(request: any) {
    return await this.booking.createBooking(request);
  }

  async getCustomerBookings() {
    return await this.booking.getCustomerBookings();
  }

  async cancelBooking(bookingId: string) {
    return await this.booking.cancelBooking(bookingId);
  }

  async rescheduleBooking(bookingId: string, newSlot: any) {
    return await this.booking.rescheduleBooking(bookingId, newSlot);
  }

  // === CMS METHODS (DELEGATION) ===

  async queryDataCollection<T = WixDataItem>(
    collectionId: string,
    query: WixDataQuery = {}
  ): Promise<WixDataResponse<T>> {
    return await this.cms.queryCollection<T>(collectionId, query);
  }

  async getDataItem<T = WixDataItem>(collectionId: string, itemId: string): Promise<T | null> {
    return await this.cms.getDataItem<T>(collectionId, itemId);
  }

  async createDataItem<T = WixDataItem>(collectionId: string, data: Record<string, any>): Promise<T | null> {
    return await this.cms.createDataItem<T>(collectionId, data);
  }

  async updateDataItem<T = WixDataItem>(
    collectionId: string,
    itemId: string,
    data: Record<string, any>
  ): Promise<T | null> {
    return await this.cms.updateDataItem<T>(collectionId, itemId, data);
  }

  async deleteDataItem(collectionId: string, itemId: string): Promise<boolean> {
    return await this.cms.deleteDataItem(collectionId, itemId);
  }

  async getAvailableCollections() {
    return await this.cms.getAvailableCollections();
  }

  async getCollectionInfo(collectionId: string) {
    return await this.cms.getCollectionInfo(collectionId);
  }

  // === RESTAURANT METHODS (DELEGATION) ===

  async getRestaurantMenus() {
    return await this.restaurant.getMenus();
  }

  async getRestaurantMenu(menuId: string) {
    return await this.restaurant.getMenu(menuId);
  }

  async getRestaurantItems(itemIds: string[]) {
    return await this.restaurant.getItems(itemIds);
  }

  async getCompleteMenuStructure() {
    return await this.restaurant.getCompleteMenuStructure();
  }

  // === UTILITY AND MANAGEMENT METHODS ===

  async clearCache(): Promise<void> {
    console.log('🗑️ [WIX MAIN] Clearing all domain caches...');
    
    await Promise.all([
      this.auth.clearCache?.() || Promise.resolve(),
      this.cms.clearCache(),
      this.ecommerce.clearCache(),
      this.booking.clearCache?.() || Promise.resolve(),
    ]);
    
    console.log('✅ [WIX MAIN] All domain caches cleared');
  }

  async getCacheInfo(): Promise<Record<string, any>> {
    const [
      ecommerceCache,
      cmsCache,
    ] = await Promise.all([
      this.ecommerce.getCacheInfo(),
      this.cms.getCacheInfo(),
    ]);

    return {
      ecommerce: ecommerceCache,
      cms: cmsCache,
      booking: { services: false, categories: false, providers: false }, // Placeholder
      restaurant: { menus: false, sections: false, items: false }, // Placeholder
    };
  }

  // === DIAGNOSTICS ===

  async diagnoseAuthenticationIssues(): Promise<void> {
    console.log('🔍 [DIAGNOSTICS] Running authentication diagnostics...');
    
    const visitorTokens = this.auth.getVisitorTokens();
    const memberTokens = this.auth.getMemberTokens();
    const currentMember = this.auth.getCurrentMember();
    
    console.log('🔍 [DIAGNOSTICS] Authentication State Summary:');
    console.log({
      hasVisitorTokens: !!visitorTokens,
      visitorTokenExpiry: visitorTokens ? new Date(visitorTokens.expiresAt).toISOString() : 'N/A',
      hasMemberTokens: !!memberTokens,
      memberTokenExpiry: memberTokens ? new Date(memberTokens.accessToken.expiresAt).toISOString() : 'N/A',
      isLoggedIn: this.auth.isMemberLoggedIn(),
      currentMember: currentMember ? { id: currentMember.id, email: currentMember.email } : null,
      siteId: this.getSiteId(),
      clientId: this.getClientId(),
      storesAppId: this.getStoresAppId(),
      sdkEnabled: featureManager.isSDKEnabled(),
      cartSDKEnabled: featureManager.isCartSDKEnabled(),
      authSDKEnabled: featureManager.isAuthSDKEnabled(),
    });
  }

  // === LEGACY COMPATIBILITY METHODS ===

  // These methods maintain backward compatibility with the old API

  async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Delegate to the appropriate domain client based on endpoint
    if (endpoint.includes('/stores-reader/') || endpoint.includes('/ecom/')) {
      console.warn('⚠️ [WIX MAIN] Direct makeRequest is deprecated, use domain clients instead');
      return await super.makeRequest<T>(endpoint, options);
    } else if (endpoint.includes('/wix-data/')) {
      console.warn('⚠️ [WIX MAIN] Direct makeRequest is deprecated, use cms domain client instead');
      return await super.makeRequest<T>(endpoint, options);
    } else {
      return await super.makeRequest<T>(endpoint, options);
    }
  }

  // === FEATURE FLAG MANAGEMENT ===

  setFeatureFlag(key: keyof typeof featureManager, value: boolean): void {
    featureManager.setFeature(key, value);
    console.log(`🎛️ [WIX MAIN] Feature flag updated: ${key} = ${value}`);
  }

  getFeatureFlags(): Record<string, any> {
    return featureManager.getConfigSummary();
  }
}

// Export singleton instance
export const wixMainClient = new WixMainClient();

// Export types for external use
export type {
  WixDataItem,
  WixCollection,
  WixDataQuery,
  WixDataResponse,
} from './wixCMSClient';

// Legacy export for backward compatibility
export const wixApiClient = wixMainClient;
