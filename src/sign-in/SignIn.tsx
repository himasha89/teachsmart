'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100vh',
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
  },
}));

const SignUpButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.success.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.success.dark,
  },
}));

interface SignInProps {
  onSignin: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  email: string;
  password: string;
  error?: { message: string; code?: string } | null;
  isLoading?: boolean;
  onForgotPassword?: (email: string) => void;
}

const SignIn: React.FC<SignInProps> = ({
  onSignin,
  setEmail,
  setPassword,
  email,
  password,
  error,
  isLoading = false,
  onForgotPassword
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleBlur = (field: 'email' | 'password') => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const getFieldError = (field: 'email' | 'password'): string => {
    if (!touchedFields[field]) return '';
    if (!email && field === 'email') return 'Email is required';
    if (!password && field === 'password') return 'Password is required';
    if (field === 'email' && !/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email';
    return '';
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event propagation
    if (onForgotPassword) {
      onForgotPassword(email);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoading && !getFieldError('email') && !getFieldError('password')) {
      onSignin(e);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Box component="main">
      <CssBaseline />
      <SignInContainer direction="column" justifyContent="center">
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
            Sign in
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ width: '100%' }}
              onClose={() => setTouchedFields({ email: false, password: false })}
            >
              {error.message}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleFormSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
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
                error={Boolean(error) || Boolean(getFieldError('email'))}
                helperText={getFieldError('email')}
              />
            </FormControl>
            <FormControl>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormLabel htmlFor="password">Password</FormLabel>
                {/* Changed to a div to prevent form submission */}
                <Link
                  component="span"
                  variant="body2"
                  onClick={handleForgotPassword}
                  sx={{ 
                    textDecoration: 'none',
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Forgot password?
                </Link>
              </Box>
              <TextField
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="••••••"
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
                disabled={isLoading}
                error={Boolean(error) || Boolean(getFieldError('password'))}
                helperText={getFieldError('password')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                        type="button" // Explicitly set to button type
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" disabled={isLoading} />}
              label="Remember me"
            />
            <Button 
              type="submit" 
              fullWidth 
              variant="contained"
              disabled={isLoading || Boolean(getFieldError('email')) || Boolean(getFieldError('password'))}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign in'
              )}
            </Button>
          </Box>
          
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              New here?
            </Typography>
          </Divider>
          
          {/* New Sign Up Button Section */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Don't have an account yet?
            </Typography>
            <SignUpButton
              fullWidth
              variant="contained"
              href="/signup"
              startIcon={<PersonAddIcon />}
              disabled={isLoading}
            >
              Create an Account
            </SignUpButton>
          </Box>
        </Card>
      </SignInContainer>
    </Box>
  );
};

export default SignIn;