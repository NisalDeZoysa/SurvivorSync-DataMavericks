
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}




// Create context with a default value
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAuthenticated: false
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  // Remove the error throwing to prevent the crash
  return context;
};

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

  // Mock login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // For demo, we're simulating a successful login with mock data
      const mockUser: User = {
        id: '123',
        name: email.split('@')[0],
        email: email,
         role: email.includes('admin') ? UserRole.ADMIN : 
              email.includes('responder') ? UserRole.FIRST_RESPONDER : 
              email.includes('volunteer') ? UserRole.VOLUNTEERS : UserRole.USER,
        contactNo: '123-456-7890'
      };
      
      setCurrentUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      console.log("User logged in:", mockUser);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
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