import { 
    getAuth, 
    PhoneAuthProvider, 
    PhoneMultiFactorGenerator, 
    RecaptchaVerifier, 
    MultiFactorResolver, 
    multiFactor,
    User
  } from 'firebase/auth';
  
  // Check if user has MFA enabled
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
  
  // Unenroll from MFA
  export const unenrollMFA = async (user: User, factorToRemove: any): Promise<void> => {
    try {
      const multiFactorUser = multiFactor(user);
      await multiFactorUser.unenroll(factorToRemove);
    } catch (error) {
      console.error('Error unenrolling from MFA:', error);
      throw error;
    }
  };