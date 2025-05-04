import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import SocialAuth from './SocialAuth'; // Import the SocialAuth component
import { GoogleIcon, FacebookIcon } from './CustomIcons'; // Import the custom icons from your existing file

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles?.('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100dvh',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles?.('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

interface SignUpProps {
  onSignup: (e: React.FormEvent<HTMLFormElement>) => void;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  setFullName: React.Dispatch<React.SetStateAction<string>>;
  email: string;
  password: string;
  fullName: string;
  error?: { message: string; code?: string } | null;
  isLoading?: boolean;
  onSocialSignup?: (user: any) => void; // Add prop for social sign-up success handler
  setError?: React.Dispatch<React.SetStateAction<{ message: string; code?: string } | null>>;
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}

const SignUp: React.FC<SignUpProps> = ({
  onSignup,
  setEmail,
  setPassword,
  setFullName,
  email,
  password,
  fullName,
  error,
  isLoading = false,
  onSocialSignup,
  setError: propSetError,
  setIsLoading: propSetIsLoading
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false,
    fullName: false
  });

  // Local state handlers if props not provided
  const handleSetError = (err: { code?: string; message: string } | null) => {
    if (propSetError) {
      propSetError(err);
    }
  };

  const handleSetIsLoading = (loading: boolean) => {
    if (propSetIsLoading) {
      propSetIsLoading(loading);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleBlur = (field: 'email' | 'password' | 'fullName') => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const getFieldError = (field: 'email' | 'password' | 'fullName'): string => {
    if (!touchedFields[field]) return '';
    
    if (field === 'email') {
      if (!email) return 'Email is required';
      if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email';
    }
    
    if (field === 'password') {
      if (!password) return 'Password is required';
      if (password.length < 6) return 'Password must be at least 6 characters';
    }
    
    if (field === 'fullName') {
      if (!fullName) return 'Full name is required';
    }
    
    return '';
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Box component="main">
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" justifyContent="center">
        <Card variant="outlined">
          <Box 
            sx={{ 
              textAlign: 'center', 
              mb: 2,
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <img 
              src="/icon.png" 
              alt="Logo" 
              style={{
                height: '100px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </Box>
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Create Account
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ width: '100%' }}
              onClose={() => setTouchedFields({ email: false, password: false, fullName: false })}
            >
              {error.message}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={onSignup}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="fullName">Full name</FormLabel>
              <TextField
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => handleBlur('fullName')}
                placeholder="John Doe"
                autoComplete="name"
                required
                fullWidth
                variant="outlined"
                disabled={isLoading}
                error={Boolean(getFieldError('fullName'))}
                helperText={getFieldError('fullName')}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="your@email.com"
                autoComplete="email"
                required
                fullWidth
                variant="outlined"
                disabled={isLoading}
                error={Boolean(getFieldError('email'))}
                helperText={getFieldError('email')}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="••••••"
                autoComplete="new-password"
                required
                fullWidth
                variant="outlined"
                disabled={isLoading}
                error={Boolean(getFieldError('password'))}
                helperText={getFieldError('password')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>
            <FormControlLabel
              control={<Checkbox value="allowExtraEmails" color="primary" disabled={isLoading} />}
              label="I want to receive updates via email."
            />
            <Button 
              type="submit" 
              fullWidth 
              variant="contained"
              disabled={
                isLoading || 
                Boolean(getFieldError('email')) || 
                Boolean(getFieldError('password')) ||
                Boolean(getFieldError('fullName'))
              }
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign up'
              )}
            </Button>
            <Typography sx={{ textAlign: 'center' }}>
              Already have an account?{' '}
              <Link
                href="/signin"
                variant="body2"
                sx={{ 
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
          <Divider>
            <Typography sx={{ color: 'text.secondary' }}>or</Typography>
          </Divider>
          
          {/* Replace the button section with the SocialAuth component */}
          {onSocialSignup && (
            <SocialAuth
              onSuccess={onSocialSignup}
              setError={handleSetError}
              isLoading={isLoading}
              setIsLoading={handleSetIsLoading}
            />
          )}
          
          {/* Fallback if onSocialSignup is not provided - using your existing icons */}
          {!onSocialSignup && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => alert('Sign up with Google')}
                startIcon={<GoogleIcon />}
                disabled={isLoading}
              >
                Sign up with Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => alert('Sign up with Facebook')}
                startIcon={<FacebookIcon />}
                disabled={isLoading}
              >
                Sign up with Facebook
              </Button>
            </Box>
          )}
        </Card>
      </SignUpContainer>
    </Box>
  );
};

export default SignUp;