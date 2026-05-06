import { db, OfflineCredentials, ensureOfflineDbReady } from './database';
import { offlineLogger } from './offlineLogger';
import CryptoJS from 'crypto-js';

/**
 * Offline Authentication Service
 * Allows users to login offline using cached credentials
 */

class OfflineAuthService {
  private static instance: OfflineAuthService;

  private constructor() {}

  static getInstance(): OfflineAuthService {
    if (!OfflineAuthService.instance) {
      OfflineAuthService.instance = new OfflineAuthService();
    }
    return OfflineAuthService.instance;
  }

  /**
   * Generate per-user encryption key
   * Uses email + hostname to create a unique key for each user
   * This ensures that each user's credentials are encrypted with a unique key
   */
  private getEncryptionKey(email: string): string {
    if (typeof window === 'undefined') {
      // SSR fallback - should not happen in practice
      return 'default-key-ssr';
    }
    // Generate per-user key based on email and hostname
    // This ensures each user has a unique encryption key
    const baseKey = `${email}-${window.location.hostname}`;
    const hashedKey = CryptoJS.SHA256(baseKey).toString();
    // Use first 32 characters as AES key (AES-256 requires 32 bytes)
    return hashedKey.substring(0, 32);
  }

  /**
   * Hash password for storage (one-way hash)
   */
  private hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
  }

  /**
   * Encrypt sensitive data with per-user key
   */
  private encrypt(data: string, email: string): string {
    const key = this.getEncryptionKey(email);
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  /**
   * Decrypt sensitive data with per-user key
   */
  private decrypt(encryptedData: string, email: string): string {
    const key = this.getEncryptionKey(email);
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Store credentials for offline login (called after successful online login)
   */
  async storeCredentials(
    email: string,
    password: string,
    token: string,
    userData: any
  ): Promise<void> {
    try {
      // Check if IndexedDB is available (might not be in private browsing mode)
      if (typeof window === 'undefined' || !window.indexedDB) {
        offlineLogger.warn('IndexedDB not available, skipping offline credentials storage');
        console.warn('[OFFLINE CREDENTIALS] IndexedDB not available');
        return;
      }

      // Validate inputs
      if (!email || !password || !token) {
        const missing: string[] = [];
        if (!email) missing.push('email');
        if (!password) missing.push('password');
        if (!token) missing.push('token');
        throw new Error(`Missing required credentials: ${missing.join(', ')}`);
      }

      // Ensure DB is open (uses pre-init from login page or opens now)
      await ensureOfflineDbReady();
      
      if (!db.isOpen()) {
        throw new Error('Database could not be opened');
      }
      
      // Verify table exists
      if (!db.offlineCredentials) {
        throw new Error('offlineCredentials table not found in database');
      }

      const passwordHash = this.hashPassword(password);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

      // Check if credentials already exist for this email
      const existing = await db.offlineCredentials
        .where('email')
        .equals(email)
        .first();

      // Encrypt token and userData
      let encryptedToken: string;
      let encryptedUserData: string;
      
      try {
        encryptedToken = this.encrypt(token, email);
      } catch (encryptError: any) {
        throw new Error(`Failed to encrypt token: ${encryptError?.message || 'Unknown error'}`);
      }
      
      try {
        encryptedUserData = this.encrypt(JSON.stringify(userData || {}), email);
      } catch (encryptError: any) {
        throw new Error(`Failed to encrypt user data: ${encryptError?.message || 'Unknown error'}`);
      }

      const credentialData: OfflineCredentials = {
        email,
        passwordHash,
        token: encryptedToken,
        userData: encryptedUserData,
        lastLogin: new Date(),
        expiresAt,
      };

      try {
        if (existing) {
          console.log('[OFFLINE CREDENTIALS] Updating existing credentials for:', email);
          await db.offlineCredentials.update(existing.id!, credentialData as any);
          offlineLogger.info('✅ Updated offline credentials for', { email });
          
          await new Promise(resolve => setTimeout(resolve, 50));
          const verified = await db.offlineCredentials.where('email').equals(email).first();
          if (!verified || verified.passwordHash !== passwordHash) {
            throw new Error('Failed to verify credentials were updated');
          }
          console.log('[OFFLINE CREDENTIALS] ✅ Credentials updated and verified for:', email);
        } else {
          console.log('[OFFLINE CREDENTIALS] Adding new credentials for:', email);
          const addedId = await db.offlineCredentials.add(credentialData as any);
          offlineLogger.info('✅ Stored offline credentials for', { email });
          
          await new Promise(resolve => setTimeout(resolve, 50));
          const verified = await db.offlineCredentials.where('email').equals(email).first();
          if (!verified) {
            throw new Error('Failed to verify credentials were stored');
          }
          console.log('[OFFLINE CREDENTIALS] ✅ Credentials added and verified for:', email);
        }
        
        // Final verification - check if credentials can be retrieved
        const finalCheck = await db.offlineCredentials.where('email').equals(email).first();
        if (!finalCheck) {
          throw new Error('Final verification failed - credentials not found after storage');
        }
        
        // Log success to console for debugging
        console.log('✅ Offline credentials successfully stored and verified for:', email);
        console.log('[OFFLINE CREDENTIALS] Expires at:', finalCheck.expiresAt);
      } catch (dbError: any) {
        // If we get a ConstraintError, the database schema might be corrupted
        // Try to recover by deleting and recreating the database
        if (dbError?.name === 'ConstraintError' || dbError?.message?.includes('already exists')) {
          console.warn('ConstraintError during credential storage, attempting database recovery...');
          try {
            // Close database
            if (db.isOpen()) {
              await db.close();
            }
            // Delete and recreate
            await db.delete();
            await db.safeOpen();
            // Retry the operation
      if (existing) {
        await db.offlineCredentials.update(existing.id!, credentialData as any);
      } else {
        await db.offlineCredentials.add(credentialData as any);
            }
            console.log('✅ Credentials stored after database recovery');
          } catch (recoveryError: any) {
            throw new Error(`Database operation failed and recovery failed: ${recoveryError?.message || 'Unknown error'}`);
          }
        } else {
          throw new Error(`Database operation failed: ${dbError?.message || 'Unknown database error'}. Original error: ${dbError}`);
        }
      }
    } catch (error: any) {
      // Extract comprehensive error information
      let errorMessage = 'Unknown error';
      let errorName: string | undefined;
      let errorStack: string | undefined;

      if (error instanceof Error) {
        errorMessage = error.message || 'Unknown error';
        errorName = error.name;
        errorStack = error.stack;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.toString) {
        errorMessage = error.toString();
      }

      // Build error details object with guaranteed values
      const errorDetails: any = {
        message: errorMessage || 'Unknown error',
        errorType: error?.constructor?.name || typeof error,
        rawError: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 3).join('\n'), // First 3 lines of stack
        } : String(error),
      };

      // Add optional details only if they have values
      if (errorName) errorDetails.name = errorName;
      if (errorStack) errorDetails.stack = errorStack;
      if (email) errorDetails.email = email;
      errorDetails.hasToken = !!token;
      errorDetails.hasUserData = !!userData;
      errorDetails.dbOpen = db.isOpen();

      // Log with both logger and console for visibility
      offlineLogger.error(`Failed to store offline credentials: ${errorMessage}`, errorDetails);
      
      // Also log directly to console for immediate visibility (always, even in production)
      console.error('[OFFLINE CREDENTIALS] Storage failed:', {
        message: errorMessage,
        email: email || 'N/A',
        hasToken: !!token,
        hasUserData: !!userData,
        dbOpen: db.isOpen(),
        errorType: error?.constructor?.name || typeof error,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : String(error),
      });
      
      // Don't throw - offline credentials are optional, login should still succeed
      console.warn('Offline credentials storage failed, but login will continue:', errorMessage);
    }
  }

  /**
   * Verify credentials offline
   */
  async verifyCredentialsOffline(
    email: string,
    password: string
  ): Promise<{ success: boolean; token?: string; userData?: any; error?: string }> {
    try {
      // Ensure database is open
      if (!db.isOpen()) {
        console.log('[OFFLINE CREDENTIALS] Database not open, attempting to open...');
        try {
          await db.safeOpen();
        } catch (openError: any) {
          console.error('[OFFLINE CREDENTIALS] Failed to open database:', openError);
          return { 
            success: false, 
            error: 'Database not available. Please try again or login while online.' 
          };
        }
      }

      console.log('[OFFLINE CREDENTIALS] Looking up credentials for:', email);
      
      // Get all credentials first for debugging
      const allCredentials = await db.offlineCredentials.toArray();
      console.log('[OFFLINE CREDENTIALS] Total credentials in database:', allCredentials.length);
      console.log('[OFFLINE CREDENTIALS] All emails:', allCredentials.map(c => c.email));

      const credential = await db.offlineCredentials
        .where('email')
        .equals(email)
        .first();

      if (!credential) {
        console.warn('[OFFLINE CREDENTIALS] ❌ No credentials found for:', email);
        offlineLogger.warn('No offline credentials found for', { email });
        return { 
          success: false, 
          error: 'No offline credentials found. Please login while online first to enable offline login.' 
        };
      }

      console.log('[OFFLINE CREDENTIALS] ✅ Credentials found for:', email);
      console.log('[OFFLINE CREDENTIALS] Expires at:', credential.expiresAt);
      console.log('[OFFLINE CREDENTIALS] Is expired:', new Date() > credential.expiresAt);

      // Check if credentials expired
      if (new Date() > credential.expiresAt) {
        console.warn('[OFFLINE CREDENTIALS] ❌ Credentials expired for:', email);
        offlineLogger.warn('Offline credentials expired for', { email });
        await db.offlineCredentials.delete(credential.id!);
        return { 
          success: false, 
          error: 'Offline credentials have expired. Please login while online to refresh them.' 
        };
      }

      // Verify password hash
      const passwordHash = this.hashPassword(password);
      console.log('[OFFLINE CREDENTIALS] Password hash match:', passwordHash === credential.passwordHash);
      
      if (passwordHash !== credential.passwordHash) {
        console.warn('[OFFLINE CREDENTIALS] ❌ Invalid password for:', email);
        offlineLogger.warn('Invalid password for offline login', { email });
        return { 
          success: false, 
          error: 'Invalid password. Please check your credentials and try again.' 
        };
      }

      // Decrypt token and user data using user's email for key generation
      let token: string;
      let userData: any;
      
      try {
        console.log('[OFFLINE CREDENTIALS] Decrypting token and user data...');
        token = this.decrypt(credential.token!, email);
        if (!token || token.trim().length === 0) {
          throw new Error('Decrypted token is empty');
        }
        console.log('[OFFLINE CREDENTIALS] ✅ Token decrypted successfully');
      } catch (decryptError: any) {
        console.error('[OFFLINE CREDENTIALS] ❌ Failed to decrypt token:', decryptError);
        return { 
          success: false, 
          error: 'Failed to decrypt credentials. This may be due to encryption key mismatch. Please login while online.' 
        };
      }
      
      try {
        const decryptedUserData = this.decrypt(credential.userData!, email);
        userData = JSON.parse(decryptedUserData);
        console.log('[OFFLINE CREDENTIALS] ✅ User data decrypted successfully');
      } catch (decryptError: any) {
        console.error('[OFFLINE CREDENTIALS] ❌ Failed to decrypt user data:', decryptError);
        return { 
          success: false, 
          error: 'Failed to decrypt user data. Please login while online to refresh credentials.' 
        };
      }

      // Update last login
      await db.offlineCredentials.update(credential.id!, {
        lastLogin: new Date(),
      });

      console.log('[OFFLINE CREDENTIALS] ✅ Offline login successful for:', email);
      offlineLogger.info('Offline login successful for', { email });
      return { success: true, token, userData };
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      console.error('[OFFLINE CREDENTIALS] ❌ Verification error:', error);
      offlineLogger.error('Failed to verify offline credentials', {
        error: errorMessage,
        email,
      });
      return { 
        success: false, 
        error: `Offline login failed: ${errorMessage}. Please login while online first.` 
      };
    }
  }

  /**
   * Clear stored credentials (called on logout)
   * @param email - Email to clear credentials for (optional, clears all if not provided)
   * @param keepForOffline - If true, keeps credentials for offline login even after logout (default: true)
   */
  async clearCredentials(email?: string, keepForOffline: boolean = true): Promise<void> {
    try {
      if (keepForOffline) {
        offlineLogger.debug('Keeping offline credentials for future offline login', { email });
        return; // Don't clear if user wants to keep for offline login
      }

      if (email) {
        const credential = await db.offlineCredentials
          .where('email')
          .equals(email)
          .first();
        if (credential) {
          await db.offlineCredentials.delete(credential.id!);
        }
      } else {
        // Clear all credentials
        await db.offlineCredentials.clear();
      }
      offlineLogger.debug('Cleared offline credentials', { email });
    } catch (error: any) {
      offlineLogger.error('Failed to clear offline credentials', {
        error: error?.message,
      });
    }
  }

  /**
   * Check if offline credentials exist for an email
   */
  async hasOfflineCredentials(email: string): Promise<boolean> {
    try {
      // Ensure database is open
      if (!db.isOpen()) {
        try {
          if (typeof (db as any).safeOpen === 'function') {
            await (db as any).safeOpen();
          } else {
            await db.safeOpen();
          }
        } catch (openError: any) {
          console.warn('Database not available for credential check:', openError?.message);
          return false;
        }
      }

      const credential = await db.offlineCredentials
        .where('email')
        .equals(email)
        .first();
      
      if (!credential) {
        console.log(`No offline credentials found for: ${email}`);
        return false;
      }
      
      // Check if expired
      if (new Date() > credential.expiresAt) {
        console.log(`Offline credentials expired for: ${email}`);
        await db.offlineCredentials.delete(credential.id!);
        return false;
      }
      
      console.log(`✅ Offline credentials found and valid for: ${email}`);
      return true;
    } catch (error: any) {
      console.error('Error checking offline credentials:', error);
      return false;
    }
  }
}

export const offlineAuthService = OfflineAuthService.getInstance();

/**
 * Diagnostic function to check database and credentials status
 * Call this from browser console: window.checkOfflineCredentials('your-email@example.com')
 */
if (typeof window !== 'undefined') {
  (window as any).checkOfflineCredentials = async (email: string) => {
    console.log('=== OFFLINE CREDENTIALS DIAGNOSTIC ===');
    console.log('Email:', email);
    console.log('IndexedDB available:', !!window.indexedDB);
    console.log('Database open:', db.isOpen());
    
    try {
      if (!db.isOpen()) {
        console.log('Attempting to open database...');
        await db.safeOpen();
        console.log('Database opened:', db.isOpen());
      }
      
      const allCredentials = await db.offlineCredentials.toArray();
      console.log('Total credentials in database:', allCredentials.length);
      console.log('All credentials:', allCredentials.map(c => ({
        email: c.email,
        expiresAt: c.expiresAt,
        isExpired: new Date() > c.expiresAt,
        lastLogin: c.lastLogin,
      })));
      
      const userCredential = await db.offlineCredentials
        .where('email')
        .equals(email)
        .first();
      
      if (userCredential) {
        console.log('✅ Credentials found for:', email);
        console.log('Expires at:', userCredential.expiresAt);
        console.log('Is expired:', new Date() > userCredential.expiresAt);
        console.log('Last login:', userCredential.lastLogin);
        console.log('Has token:', !!userCredential.token);
        console.log('Has userData:', !!userCredential.userData);
        console.log('Has passwordHash:', !!userCredential.passwordHash);
      } else {
        console.log('❌ No credentials found for:', email);
        console.log('Available emails:', allCredentials.map(c => c.email));
      }
      
      const hasCredentials = await offlineAuthService.hasOfflineCredentials(email);
      console.log('hasOfflineCredentials result:', hasCredentials);
    } catch (error: any) {
      console.error('❌ Diagnostic error:', error);
      console.error('Error details:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
      });
    }
    console.log('=== END DIAGNOSTIC ===');
  };
  
  // Helper to manually store credentials (for testing)
  (window as any).storeOfflineCredentials = async (email: string, password: string, token: string, userData: any) => {
    console.log('=== MANUALLY STORING OFFLINE CREDENTIALS ===');
    try {
      await offlineAuthService.storeCredentials(email, password, token, userData);
      const verified = await offlineAuthService.hasOfflineCredentials(email);
      console.log('✅ Credentials stored. Verification:', verified);
    } catch (error: any) {
      console.error('❌ Failed to store:', error);
    }
    console.log('=== END ===');
  };
}

