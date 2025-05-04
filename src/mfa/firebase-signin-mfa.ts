import { 
    MultiFactorResolver,
    PhoneAuthProvider,
    PhoneMultiFactorGenerator,
    RecaptchaVerifier,
    getAuth
  } from 'firebase/auth';
  
  /**
   * Counter for creating unique container IDs
   */
  let recaptchaContainerCounter = 0;
  
  /**
   * Creates a unique container ID for reCAPTCHA
   */
  export const createUniqueContainerId = (): string => {
    return `recaptcha-container-${Date.now()}-${recaptchaContainerCounter++}`;
  };
  
  /**
   * Creates a fresh container for reCAPTCHA to avoid the "already rendered" issue
   */
  export const createFreshRecaptchaContainer = (containerId?: string): string => {
    // Generate a unique ID if none is provided
    const uniqueId = containerId || createUniqueContainerId();
    
    // Remove existing container if it exists
    const existingContainer = document.getElementById(uniqueId);
    if (existingContainer && existingContainer.parentNode) {
      existingContainer.parentNode.removeChild(existingContainer);
    }
    
    // Clean up any existing reCAPTCHA elements
    cleanupRecaptchaElements();
    
    // Create new container
    const container = document.createElement('div');
    container.id = uniqueId;
    
    // Style to hide but keep accessible
    container.style.position = 'absolute';
    container.style.top = '-10000px';
    container.style.left = '-10000px';
    container.style.width = '1px';
    container.style.height = '1px';
    container.style.overflow = 'hidden';
    
    // Add to DOM
    document.body.appendChild(container);
    
    console.log(`Created fresh reCAPTCHA container with ID: ${uniqueId}`);
    return uniqueId;
  };
  
  /**
   * Cleans up reCAPTCHA elements in the DOM
   */
  export const cleanupRecaptchaElements = (): void => {
    // Find and remove any reCAPTCHA related elements
    const recaptchaElements = document.querySelectorAll(
      '.grecaptcha-badge, .grecaptcha-logo, iframe[src*="recaptcha"], div[style*="z-index: 2000000000"]'
    );
    
    recaptchaElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    
    console.log('Cleaned up reCAPTCHA elements from DOM');
  };
  
  /**
   * Cleans up a reCAPTCHA verifier instance
   */
  export const cleanupRecaptchaVerifier = (verifier: RecaptchaVerifier | null): void => {
    if (!verifier) return;
    
    try {
      verifier.clear();
      console.log('Cleared reCAPTCHA verifier');
    } catch (err) {
      console.error('Error clearing reCAPTCHA verifier:', err);
    }
    
    // Also clean up DOM elements
    cleanupRecaptchaElements();
  };
  
  /**
   * Starts the MFA sign-in process by sending a verification code
   */
  export const startMFASignIn = async (
    resolver: MultiFactorResolver,
    recaptchaVerifier: RecaptchaVerifier
  ): Promise<string> => {
    try {
      // Get the first hint (usually a phone number)
      const hint = resolver.hints[0];
      
      // Create a phone auth provider
      const auth = getAuth();
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      
      // Send the verification code
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        {
          multiFactorHint: hint,
          session: resolver.session
        },
        recaptchaVerifier
      );
      
      return verificationId;
    } catch (err) {
      console.error('Error starting MFA sign-in:', err);
      throw err;
    }
  };
  
  /**
   * Completes the MFA sign-in process by verifying the code
   */
  export const completeMFASignIn = async (
    resolver: MultiFactorResolver,
    verificationId: string,
    verificationCode: string
  ): Promise<void> => {
    try {
      // Create the phone auth credential
      const phoneAuthCredential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      
      // Create the multi-factor assertion
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
      
      // Complete the sign-in
      await resolver.resolveSignIn(multiFactorAssertion);
      
      console.log('MFA sign-in successful');
    } catch (err) {
      console.error('Error completing MFA sign-in:', err);
      throw err;
    }
  };