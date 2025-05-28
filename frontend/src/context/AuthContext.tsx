
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';


interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  userLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  // Remove the error throwing to prevent the crash
  return context;
};

const API_BASE_URL = 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface AuthProviderProps {
  children: ReactNode;
}

// This is a mock implementation. In a real app, you would connect to your backend
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Check if user is logged in on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

 
    // Login function using backend API
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', { email });
      
      const response = await api.post('/admin/login', {
        email,
        password
      });
      
      console.log('Login response:', response.data);
      
      // Assuming your backend returns user data and token
      const token = response.data.accessToken ;
      console.log('Token:', token);
      
      // Create user object matching our User interface
      if (!token) {
        throw new Error('Invalid login response');
      }
      const userData: User = {
        id: response.data.admin.id,
        name: response.data.admin.name,
        email: response.data.admin.email,
        role: UserRole.ADMIN
      };
      
      // Store user data and token
      setCurrentUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      
      // Set axios default authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log("User logged in successfully:", userData);
      
    } catch (error) {
      console.error("Login failed:", error);   
      // Clear any stored data on login failure
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Login failed';
        throw new Error(errorMessage);
      }
      throw new Error('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  //  login function for users and volunteers
  const userLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', { email });
      
      const response = await api.post('/users/login', {
        email,
        password
      });
      
      console.log('Login response:', response.data);
      
      // Assuming your backend returns user data and token
      const token = response.data.accessToken ;
      console.log('Token:', token);

      const userType = Cookies.get('userType');
      
      // Create user object matching our User interface
      if (!token) {
        throw new Error('Invalid login response');
      }
      const userData: User = {
        id: response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: userType, // by changing the role can navigate to different pages
      };
      
      // Store user data and token
      setCurrentUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      
      // Set axios default authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log("User logged in successfully:", userData);
      
    } catch (error) {
      console.error("Login failed:", error);   
      // Clear any stored data on login failure
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Login failed';
        throw new Error(errorMessage);
      }
      throw new Error('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Mock register function
  const register = async (userData: Partial<User>, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || UserRole.USER,
        nic: userData.nic,
        address: userData.address,
        location: userData.location,
        contactNo: userData.contactNo
      };
      
      setCurrentUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      console.log("User registered:", newUser);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  const contextValue: AuthContextType = {
    currentUser,
    isLoading,
    login,
    userLogin,
    register,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};