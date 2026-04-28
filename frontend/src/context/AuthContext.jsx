import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, signIn, signUp, signOut, getSession } from '@/lib/supabase';
import securityUtils from '@/lib/security';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Rate limiter for login attempts
  const rateLimiter = securityUtils.createRateLimiter(5, 60000);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const sessionData = await getSession();
        if (mounted) {
          setSession(sessionData);
          setUser(sessionData?.user ?? null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Sanitize email
    const sanitizedEmail = securityUtils.sanitizeInput(email);
    if (!securityUtils.validateEmail(sanitizedEmail)) {
      throw new Error('Invalid email format');
    }

    // Check rate limit
    const rateCheck = rateLimiter.tryAttempt(`login_${sanitizedEmail}`);
    if (!rateCheck.allowed) {
      throw new Error('Too many login attempts. Please try again later.');
    }

    // Validate password strength
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    try {
      const data = await signIn(sanitizedEmail, password);
      setSession(data.session);
      setUser(data.user);
      rateLimiter.reset(`login_${sanitizedEmail}`);
      return data;
    } catch (error) {
      console.error('Login error:', error.message);
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (email, password) => {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Sanitize and validate email
    const sanitizedEmail = securityUtils.sanitizeInput(email);
    if (!securityUtils.validateEmail(sanitizedEmail)) {
      throw new Error('Invalid email format');
    }

    // Check rate limit
    const rateCheck = rateLimiter.tryAttempt(`register_${sanitizedEmail}`);
    if (!rateCheck.allowed) {
      throw new Error('Too many registration attempts. Please try again later.');
    }

    // Validate password strength
    const passwordCheck = securityUtils.validatePassword(password);
    if (!passwordCheck.valid) {
      throw new Error('Password must be at least 8 characters');
    }

    try {
      const data = await signUp(sanitizedEmail, password);
      return data;
    } catch (error) {
      console.error('Registration error:', error.message);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setSession(null);
      setUser(null);
      securityUtils.clearSensitiveData();
    } catch (error) {
      console.error('Logout error:', error);
      setSession(null);
      setUser(null);
      securityUtils.clearSensitiveData();
    }
  };

  const updateProfile = async (metadata) => {
    try {
      const { data, error } = await supabase.auth.updateUser(metadata);
      if (error) throw error;
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update password error:', error);
      throw new Error(error.message || 'Failed to update password');
    }
  };

  const value = {
    user,
    session,
    loading,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};