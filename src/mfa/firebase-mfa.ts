import { User, multiFactor, getAuth, MultiFactorInfo } from 'firebase/auth';
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
  // This function could be expanded to include additional preparation steps
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