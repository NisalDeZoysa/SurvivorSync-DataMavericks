import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, UserRole } from "../types";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    type: string,
    nic: string,
    resourceCenterId: number,
    address: string,
    contactNumber: string
  ) => Promise<void>;
  userLogin: (email: string, password: string) => Promise<void>;
  userRegister: (
    name: string,
    email: string,
    password: string,
    role: string,
    nic: string,
    address: string,
    contactNo: string
  ) => Promise<void>;
  logout: () => void;
  createUser: (userData: Partial<User>, password: string) => Promise<void>;
  isAuthenticated: boolean;
}

// Create context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  // Remove the error throwing to prevent the crash
  return context;
};

const API_BASE_URL = "http://localhost:7000/api";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
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
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // Login function using backend API
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Attempting login with:", { email });

      const response = await api.post("/admin/login", {
        email,
        password,
      });

      console.log("Login response:", response.data);

      // Assuming your backend returns user data and token
      const token = response.data.accessToken;
      console.log("Token:", token);

      // Create user object matching our User interface
      if (!token) {
        throw new Error("Invalid login response");
      }

      console.log("response.data.admin:", response.data.admin);

      let userType = UserRole.FIRST_RESPONDER;

      if (response.data.admin.type === "ADMIN") {
        userType = UserRole.ADMIN;
      }

      const userData: User = {
        id: response.data.admin.id,
        name: response.data.admin.name,
        email: response.data.admin.email,
        role: userType,
      };

      // Store user data and token
      setCurrentUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);

      // Set axios default authorization header for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      console.log("User logged in successfully:", userData);
    } catch (error) {
      console.error("Login failed:", error);
      // Clear any stored data on login failure
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];

      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Login failed";
        throw new Error(errorMessage);
      }
      throw new Error("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  //  login function for users and volunteers
  const userLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Attempting login with:", { email });

      const response = await api.post("/users/login", {
        email,
        password,
      });

      console.log("Login response:", response.data);

      // Assuming your backend returns user data and token
      const token = response.data.accessToken;
      console.log("Token:", token);

      // const userType = Cookies.get('userType');

      let userType = UserRole.USER;

      if (response.data.user.type === "volunteer") {
        userType = UserRole.VOLUNTEERS;
      }

      // Create user object matching our User interface
      if (!token) {
        throw new Error("Invalid login response");
      }
      const userData: User = {
        id: response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: userType, // by changing the role can navigate to different pages
        contactNo: response.data.user.contactNo,
        nic: response.data.user.nic,
      };

      // Store user data and token
      setCurrentUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);

      // Set axios default authorization header for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      console.log("User logged in successfully:", userData);
    } catch (error) {
      console.error("Login failed:", error);
      // Clear any stored data on login failure
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];

      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Login failed";
        throw new Error(errorMessage);
      }
      throw new Error("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const userRegister = async (
    name: string,
    email: string,
    password: string,
    role: string,
    nic: string,
    address: string,
    contactNo: string
  ) => {
    setIsLoading(true);
    try {
      const response = await api.post("/users/register", {
        name,
        nic,
        address,
        contactNo,
        email,
        type: role,
        password,
      });

      console.log("Registration response:", response.data);

      if (!response) {
        throw new Error("Registration failed");
      }

      const newUser: User = {
        id: response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: role === "volunteer" ? UserRole.VOLUNTEERS : UserRole.USER,
      };

      setCurrentUser(newUser);
      if (role === "volunteer") {
        Cookies.set("userType", "volunteer", { expires: 7 });
        localStorage.setItem("volunteer", JSON.stringify(newUser));
      } else {
        Cookies.set("userType", "user", { expires: 7 });
        localStorage.setItem("user", JSON.stringify(newUser));
      }
      console.log("User registered:", newUser);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function for first responders
  const register = async (
    name: string,
    email: string,
    password: string,
    type: string,
    nic: string,
    resourceCenterId: number,
    address: string,
    contactNumber: string
  ) => {
    setIsLoading(true);
    try {
      const response = await api.post("/first-responders/register", {
        name,
        nic,
        resourceCenterId,
        address,
        contactNumber,
        email,
        type,
        password,
      });

      console.log("Registration response:", response.data);

      if (!response) {
        throw new Error("Registration failed");
      }


      // const newUser: User = {
      //   id: response.data.admin.id,
      //   name: response.data.admin.name,
      //   email: response.data.admin.email,
      //   role: UserRole.FIRST_RESPONDER, // Assuming first responder role
      // };

      // setCurrentUser(newUser);

      // console.log("User registered:", newUser);
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
    localStorage.removeItem("user");
  };

  const contextValue: AuthContextType = {
    currentUser,
    isLoading,
    login,
    userLogin,
    userRegister,
    register,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
