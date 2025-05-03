// services/recaptcha.ts

/**
 * Service for handling reCAPTCHA Enterprise operations
 */

// Ensure the site key is available
const RECAPTCHA_SITE_KEY = "6LeJqSwrAAAAADSJarJGqn2sJ67uqmTCrcvG5WMk";

if (!RECAPTCHA_SITE_KEY) {
  console.error('Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY environment variable');
}

/**
 * Ensures the reCAPTCHA script is loaded
 * @returns Promise that resolves when grecaptcha is available
 */
export const ensureReCaptchaLoaded = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      // Server-side rendering - resolve immediately
      resolve();
      return;
    }
    
    // Check if already loaded
    if (window.grecaptcha && window.grecaptcha.enterprise) {
      resolve();
      return;
    }
    
    // Set a timeout to reject if it takes too long
    const timeoutId = setTimeout(() => {
      reject(new Error('reCAPTCHA failed to load within timeout period'));
    }, 10000); // 10 seconds timeout
    
    // Check periodically if grecaptcha is available
    const checkInterval = setInterval(() => {
      if (window.grecaptcha && window.grecaptcha.enterprise) {
        clearTimeout(timeoutId);
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
    
    // Add script if not present
    if (!document.querySelector(`script[src*="recaptcha/enterprise.js"]`)) {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.defer = true;
      
      script.onerror = () => {
        clearTimeout(timeoutId);
        clearInterval(checkInterval);
        reject(new Error('Failed to load reCAPTCHA script'));
      };
      
      document.head.appendChild(script);
    }
  });
};

/**
 * Get a reCAPTCHA Enterprise token for a specific action
 * @param action The action to associate with this token
 * @returns Promise that resolves with the token
 */
export const getReCaptchaToken = async (action: string): Promise<string> => {
  try {
    await ensureReCaptchaLoaded();
    
    return new Promise((resolve, reject) => {
      window.grecaptcha.enterprise.ready(async () => {
        try {
          const token = await window.grecaptcha.enterprise.execute(
            RECAPTCHA_SITE_KEY as string,
            { action }
          );
          resolve(token);
        } catch (error) {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error getting reCAPTCHA token:', error);
    throw error;
  }
};

// Add TypeScript definitions
declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => Promise<void>) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}