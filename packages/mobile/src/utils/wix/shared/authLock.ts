/**
 * Shared authentication lock to prevent multiple token generation processes
 * from running concurrently across different authentication clients.
 * 
 * This solves the race condition where WixAuthenticationClient, WixApiClient,
 * and other auth clients try to generate visitor tokens simultaneously.
 */

// Global shared lock for token generation across all auth clients
let globalTokenGenerationPromise: Promise<void> | null = null;

// Circuit breaker for token generation failures
let globalTokenRetryCount = 0;
const MAX_TOKEN_RETRIES = 3;
let globalCircuitBreakerResetTime = 0;
const CIRCUIT_BREAKER_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export interface AuthLockOptions {
  clientName: string;
  timeout?: number; // Optional timeout for waiting
}

/**
 * Acquire the global token generation lock
 */
export async function acquireTokenGenerationLock(
  tokenGenerationFn: () => Promise<void>,
  options: AuthLockOptions
): Promise<void> {
  const { clientName, timeout = 30000 } = options;
  const now = Date.now();

  // Check circuit breaker
  if (globalTokenRetryCount >= MAX_TOKEN_RETRIES) {
    if (now < globalCircuitBreakerResetTime) {
      const waitMinutes = Math.ceil((globalCircuitBreakerResetTime - now) / 1000 / 60);
      console.warn(`🚫 [AUTH LOCK] Circuit breaker active - too many failures. Wait ${waitMinutes} minutes.`);
      throw new Error(`Authentication circuit breaker active. Wait ${waitMinutes} minutes.`);
    } else {
      // Reset circuit breaker
      console.log('🔄 [AUTH LOCK] Circuit breaker reset - retrying token generation');
      globalTokenRetryCount = 0;
      globalCircuitBreakerResetTime = 0;
    }
  }

  // If there's already a generation in progress, wait for it
  if (globalTokenGenerationPromise) {
    console.log(`⏳ [AUTH LOCK] ${clientName}: Token generation already in progress, waiting...`);
    try {
      // Use a timeout to prevent infinite waiting
      await Promise.race([
        globalTokenGenerationPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Token generation timeout')), timeout)
        )
      ]);
      console.log(`✅ [AUTH LOCK] ${clientName}: Token generation completed by another client`);
      return;
    } catch (error) {
      console.warn(`⚠️ [AUTH LOCK] ${clientName}: Previous token generation failed or timed out:`, error);
      // Don't immediately retry - let the current client try
    }
  }

  // Start new token generation
  console.log(`🚀 [AUTH LOCK] ${clientName}: Starting token generation`);
  globalTokenGenerationPromise = executeTokenGeneration(tokenGenerationFn, clientName);
  
  try {
    await globalTokenGenerationPromise;
    // Success - reset retry counter
    globalTokenRetryCount = 0;
    globalCircuitBreakerResetTime = 0;
    console.log(`✅ [AUTH LOCK] ${clientName}: Token generation completed successfully`);
  } catch (error) {
    // Failure - increment retry counter
    globalTokenRetryCount++;
    if (globalTokenRetryCount >= MAX_TOKEN_RETRIES) {
      globalCircuitBreakerResetTime = now + CIRCUIT_BREAKER_TIMEOUT;
      console.error(`🚫 [AUTH LOCK] ${clientName}: Too many failures - activating circuit breaker`);
    }
    console.error(`❌ [AUTH LOCK] ${clientName}: Token generation failed:`, error);
    throw error;
  } finally {
    // Always clear the promise when done
    globalTokenGenerationPromise = null;
  }
}

/**
 * Execute token generation with timeout protection
 */
async function executeTokenGeneration(
  tokenGenerationFn: () => Promise<void>, 
  clientName: string
): Promise<void> {
  const GENERATION_TIMEOUT = 30000; // 30 seconds max for token generation
  
  return Promise.race([
    tokenGenerationFn(),
    new Promise<void>((_, reject) => 
      setTimeout(() => {
        reject(new Error(`${clientName} token generation timeout after ${GENERATION_TIMEOUT}ms`));
      }, GENERATION_TIMEOUT)
    )
  ]);
}

/**
 * Check if token generation is currently in progress
 */
export function isTokenGenerationInProgress(): boolean {
  return globalTokenGenerationPromise !== null;
}

/**
 * Get current retry count (for debugging)
 */
export function getTokenRetryCount(): number {
  return globalTokenRetryCount;
}

/**
 * Reset the circuit breaker (for emergency use)
 */
export function resetCircuitBreaker(): void {
  console.log('🔧 [AUTH LOCK] Manually resetting circuit breaker');
  globalTokenRetryCount = 0;
  globalCircuitBreakerResetTime = 0;
  globalTokenGenerationPromise = null;
}
