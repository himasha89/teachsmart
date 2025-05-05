import { 
  User, 
  multiFactor, 
  getAuth, 
  MultiFactorInfo,
  PhoneAuthProvider,
  RecaptchaVerifier,
  PhoneMultiFactorGenerator,
  MultiFactorResolver
} from 'firebase/auth';
import { getReCaptchaToken } from './recaptcha';

/**
 * Check if MFA is enabled for a user
 * @param user Firebase user object
 * @returns boolean indicating if MFA is enabled
 */
export const isMFAEnabled = async (user: User): Promise<boolean> => {
  try {
    const multiFactorUser = multiFactor(user);
    const enrolledFactors = multiFactorUser.enrolledFactors;
    return enrolledFactors.length > 0;
  } catch (error) {
    console.error('Error checking MFA status:', error);
    return false;
  }
};

/**
 * Unenroll from MFA
 * @param user Firebase user object
 * @param factor MFA factor to unenroll
 */
export const unenrollMFA = async (user: User, factor: MultiFactorInfo): Promise<void> => {
  try {
    // In a real-world scenario, you may want to add additional verification here
    // such as requesting the user's password or a token
    
    // Get reCAPTCHA token for extra security
    await getReCaptchaToken('UNENROLL_MFA');
    
    const multiFactorUser = multiFactor(user);
    await multiFactorUser.unenroll(factor);
    
    console.log('Successfully unenrolled from MFA');
  } catch (error) {
    console.error('Error unenrolling from MFA:', error);
    throw error;
  }
};

/**
 * Setup reCAPTCHA in a container for phone MFA
 * @param containerId DOM element ID to render reCAPTCHA in
 * @returns Promise that resolves when setup is complete
 */
export const prepareForPhoneMFA = async (containerId: string): Promise<void> => {
  try {
    // Make sure reCAPTCHA is loaded
    await getReCaptchaToken('PREPARE_PHONE_MFA');
    
    // Ensure container is available
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`reCAPTCHA container element with ID '${containerId}' not found`);
    }
    
    console.log('MFA preparation complete');
  } catch (error) {
    console.error('Error preparing for MFA:', error);
    throw error;
  }
};

/**
 * Create a fresh reCAPTCHA container and verifier
 * @returns RecaptchaVerifier instance
 */
export const createRecaptchaVerifier = (containerId: string = 'recaptcha-container'): RecaptchaVerifier => {
  try {
    // Ensure container exists or create one
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.style.position = 'absolute';
      container.style.bottom = '0';
      container.style.left = '0';
      container.style.width = '0';
      container.style.height = '0';
      container.style.overflow = 'hidden';
      container.style.visibility = 'hidden';
      document.body.appendChild(container);
    }
    
    // Create new reCAPTCHA verifier
    const auth = getAuth();
    const recaptchaVerifier = new RecaptchaVerifier(
      auth,
      containerId,
      {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA verified successfully');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA challenge expired');
        }
      }
    );
    
    return recaptchaVerifier;
  } catch (error) {
    console.error('Error creating reCAPTCHA verifier:', error);
    throw error;
  }
};

/**
 * Clean up a reCAPTCHA verifier and remove related DOM elements
 * @param recaptchaVerifier RecaptchaVerifier instance to clean up
 */
export const cleanupRecaptchaVerifier = (recaptchaVerifier: RecaptchaVerifier | null): void => {
  if (!recaptchaVerifier) return;
  
  try {
    recaptchaVerifier.clear();
    console.log('reCAPTCHA verifier cleared');
  } catch (e) {
    console.error('Error clearing reCAPTCHA:', e);
  }
  
  // Remove any reCAPTCHA elements from the DOM
  const recaptchaElements = document.querySelectorAll('.grecaptcha-badge, .grecaptcha-logo, iframe[src*="recaptcha"]');
  recaptchaElements.forEach(element => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });
};

/**
 * Start the MFA sign-in process for a user
 * @param resolver MultiFactorResolver from Firebase auth error
 * @param recaptchaVerifier RecaptchaVerifier instance
 * @returns Promise resolving to verification ID
 */
export const startMFASignIn = async (
  resolver: MultiFactorResolver,
  recaptchaVerifier: RecaptchaVerifier
): Promise<string> => {
  try {
    // Get the first hint (usually the phone number)
    const hint = resolver.hints[0];
    
    // Create the phone auth provider
    const auth = getAuth();
    const phoneAuthProvider = new PhoneAuthProvider(auth);
    
    // Start verification process
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(
      {
        multiFactorHint: hint,
        session: resolver.session
      },
      recaptchaVerifier
    );
    
    return verificationId;
  } catch (error) {
    console.error('Error starting MFA sign-in:', error);
    throw error;
  }
};

/**
 * Complete the MFA sign-in process with a verification code
 * @param resolver MultiFactorResolver from Firebase auth error
 * @param verificationId Verification ID from startMFASignIn
 * @param verificationCode Verification code entered by user
 * @returns Promise resolving to user credential
 */
export const completeMFASignIn = async (
  resolver: MultiFactorResolver,
  verificationId: string,
  verificationCode: string
) => {
  try {
    // Create the credential
    const phoneAuthCredential = PhoneAuthProvider.credential(
      verificationId,
      verificationCode
    );
    
    // Create the assertion
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
    
    // Complete sign-in
    return await resolver.resolveSignIn(multiFactorAssertion);
  } catch (error) {
    console.error('Error completing MFA sign-in:', error);
    throw error;
  }
};

/**
 * Start the MFA enrollment process for a user
 * @param user Firebase user object
 * @param phoneNumber Phone number to enroll
 * @param recaptchaVerifier RecaptchaVerifier instance
 * @returns Promise resolving to verification ID
 */
export const startMFAEnrollment = async (
  user: User,
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<string> => {
  try {
    // Format the phone number if needed
    const formattedPhoneNumber = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+1${phoneNumber.replace(/\D/g, '')}`;
    
    // Get the multi-factor session
    const multiFactorUser = multiFactor(user);
    const session = await multiFactorUser.getSession();
    
    // Create the phone auth provider
    const auth = getAuth();
    const phoneAuthProvider = new PhoneAuthProvider(auth);
    
    // Start verification process
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(
      {
        phoneNumber: formattedPhoneNumber,
        session
      },
      recaptchaVerifier
    );
    
    return verificationId;
  } catch (error) {
    console.error('Error starting MFA enrollment:', error);
    throw error;
  }
};

/**
 * Complete the MFA enrollment process with a verification code
 * @param user Firebase user object
 * @param verificationId Verification ID from startMFAEnrollment
 * @param verificationCode Verification code entered by user
 * @param displayName Optional display name for the MFA factor
 * @returns Promise that resolves when enrollment is complete
 */
export const completeMFAEnrollment = async (
  user: User,
  verificationId: string,
  verificationCode: string,
  displayName: string = "Phone"
): Promise<void> => {
  try {
    // Create the credential
    const phoneAuthCredential = PhoneAuthProvider.credential(
      verificationId,
      verificationCode
    );
    
    // Create the assertion
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
    
    // Complete enrollment
    const multiFactorUser = multiFactor(user);
    await multiFactorUser.enroll(multiFactorAssertion, displayName);
  } catch (error) {
    console.error('Error completing MFA enrollment:', error);
    throw error;
  }
};