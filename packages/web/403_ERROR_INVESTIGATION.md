# 403 Forbidden Error Investigation & Fix

## Problem
The services screen is showing "No services found" and the browser console shows 403 Forbidden errors when trying to access the Wix Booking API.

## Root Cause Analysis

### What is a 403 Forbidden Error?
A 403 error means the server understood the request but refuses to authorize it. In the context of Wix APIs, this typically indicates:

1. **Missing App Installation**: The required Wix app (Bookings) is not installed on the site
2. **Insufficient Permissions**: The API client doesn't have permission to access the requested resources
3. **Configuration Issues**: The app is installed but not properly configured for public/visitor access
4. **No Content**: The app is installed but no services have been created

### Specific to Wix Bookings API
The 403 error when accessing `/bookings/v2/services/query` most commonly means:

1. **Wix Bookings App Not Installed**: The site doesn't have the Wix Bookings app installed
2. **No Services Created**: The app is installed but no booking services have been configured
3. **Services Not Published**: Services exist but are not published or publicly accessible
4. **Visitor Access Disabled**: Services are published but visitor/public access is disabled

## Solution Implemented

### 1. Enhanced Error Handling
**File: `packages/mobile/src/utils/wixApiClient.ts`**
- Added specific 403 error detection and guidance
- Provides contextual help based on the API endpoint being accessed
- Distinguishes between booking, store, and other API errors

### 2. Booking API Diagnostics
**File: `packages/mobile/src/utils/wixBookingApiClient.ts`**
- Added `diagnoseBookingAccess()` method to test API connectivity
- Automatic diagnostic execution when 403 errors occur
- Comprehensive troubleshooting guidance in console logs

### 3. Web Interface Diagnostic Button
**File: `packages/web/src/App.tsx`**
- Added "🔍 Diagnose 403 Error" button to the web interface
- Provides easy access to diagnostic information
- Helps users understand what's happening when services don't load

## How to Use the Diagnostics

### Automatic Diagnostics
When a 403 error occurs, the system automatically:
1. Detects the 403 error
2. Runs diagnostic tests
3. Provides detailed troubleshooting information in the console

### Manual Diagnostics
1. Open the web preview interface
2. Click the "🔍 Diagnose 403 Error" button
3. Check the browser console for detailed diagnostic information

## Troubleshooting Guide

### If You See 403 Errors:

#### Step 1: Check Console Logs
Look for these diagnostic messages:
```
🚨 [BOOKING DIAGNOSTICS] 403 Forbidden Error Detected
📋 [BOOKING DIAGNOSTICS] Possible causes:
   1. Wix Bookings app is not installed on this site
   2. Booking services are not published or publicly accessible
   3. Site owner has not enabled visitor/public access to booking services
   4. No booking services have been created on the site
   5. Site permissions do not allow API access to booking data
```

#### Step 2: Verify Wix Bookings App Installation
1. Log into your Wix dashboard
2. Go to the App Market
3. Search for "Wix Bookings"
4. Install the app if it's not already installed

#### Step 3: Create and Configure Services
1. Open Wix Bookings in your dashboard
2. Create at least one booking service
3. Configure the service details (name, duration, price, etc.)
4. Publish the service

#### Step 4: Enable Public Access
1. In Wix Bookings settings, ensure services are publicly accessible
2. Check that visitor/guest booking is enabled
3. Verify that services are published and visible

#### Step 5: Test API Access
1. Use the diagnostic button in the web interface
2. Check console logs for detailed results
3. If still failing, contact Wix support for site-specific issues

## Expected Console Output

### When Working Correctly:
```
✅ [BOOKING DIAGNOSTICS] API is accessible - booking services should work
✅ [BOOKING] Loaded 2 services
```

### When 403 Error Occurs:
```
❌ [API ERROR] 403: {"message":"Forbidden","details":"..."}
💡 [BOOKING] 403 Forbidden: This could mean:
   - Wix Bookings app is not installed on the site
   - Visitor tokens do not have permission to access booking services
   - The site owner needs to enable public access to booking services
🚨 [BOOKING DIAGNOSTICS] 403 Forbidden Error Detected
🛠️ [BOOKING DIAGNOSTICS] Recommended actions:
   1. Install Wix Bookings app from the Wix App Market
   2. Create at least one booking service in the Wix dashboard
   3. Publish the booking services and make them publicly accessible
   4. Check site permissions and API access settings
```

## Technical Details

### Authentication Flow
1. **Visitor Tokens**: Generated automatically for public API access
2. **Member Context**: Added when user is logged in
3. **API Headers**: Include proper authorization and site identification

### Error Detection
- Automatic 403 error detection in API responses
- Context-aware error messages based on endpoint
- Fallback to empty results instead of app crashes

### Diagnostic Testing
- Tests basic API connectivity
- Attempts minimal service query
- Provides specific guidance based on error type

This comprehensive error handling ensures that users get clear guidance when booking services are not accessible, making it easier to identify and resolve configuration issues.
