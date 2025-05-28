import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LogIn, UserPlus, User, Heart, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

enum UserRole {
  USER = 'victim',
  VOLUNTEERS = 'volunteer',
}

interface LoginFormValues {
  email: string;
  password: string;
}

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  nic?: string;
  address?: string;
  contactNo?: string;
}

const AuthForms: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { userLogin, register } = useAuth();
  

  const loginForm = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRole.USER,
      nic: '',
      address: '',
      contactNo: '',
    },
  });

 
  const handleLoginSubmit = async (data: LoginFormValues) => {
  setIsLoading(true);
  try {
    await userLogin(data.email, data.password);

    toast({
      title: "Login Successful",
      description: "Welcome back to the emergency response system.",
    });

    navigate("/");
  } catch (error) {
    toast({
      title: "Login Failed",
      description: "Please check your credentials and try again.",
      variant: "destructive",
    });
    console.error("Login error:", error);
  } finally {
    setIsLoading(false);
  }
};

  const handleRegisterSubmit = async (data: RegisterFormValues) => {
  setIsLoading(true);

  // ✅ 1. Check if passwords match
  if (data.password !== data.confirmPassword) {
    registerForm.setError('confirmPassword', {
      type: 'validate',
      message: 'Passwords do not match',
    });
    setIsLoading(false);
    return;
  }

  try {
    // ✅ 2. Submit registration request
    const res = await axios.post('http://localhost:5000/api/users/register', {
      name: data.name,
      NIC: data.nic,
      address: data.address,
      contactNumber: data.contactNo,
      email: data.email,
      type: data.role,
      password: data.password,
    });

    // ✅ 3. Check if registration was successful
    if (res.status === 200 || res.status === 201) {
      const { accessToken, user } = res.data;

      // Optional: store token or user data if needed
      if (accessToken) {
        Cookies.set('accessToken', accessToken, { expires: 1 }); // expires in 1 day
      }

      toast({
        title: 'Registration Successful',
        description: `Welcome ${user?.name || ''}! You can now log in.`,
      });

      // ✅ 4. Switch to login tab after registration
      setActiveTab('');
    } else {
      throw new Error(res.data.message || 'Unexpected error during registration');
    }
  } catch (error: any) {
    console.error('Registration error:', error);

    toast({
      variant: 'destructive',
      title: 'Registration Failed',
      description:
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong. Please try again.',
    });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-600 mx-auto">
            Welcome!
          </CardTitle>
          <CardDescription className="italic">
            Connecting communities, saving lives together in every crisis.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      rules={{
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Invalid email address',
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      rules={{ required: 'Password is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full bg-safety-500 hover:bg-safety-600" disabled={isLoading}>
                      {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-6">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    rules={{ required: 'Full name is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    rules={{
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Invalid email address',
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="password"
                      rules={{
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      rules={{ required: 'Please confirm your password' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={registerForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Register as</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={UserRole.USER}>
                              <User className="h-4 w-4 text-black" />
                              Regular User
                            </SelectItem>
                            <SelectItem value={UserRole.VOLUNTEERS}>
                              <Heart className="h-4 w-4 text-red-500" />
                              Volunteer
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="nic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NIC</FormLabel>
                          <FormControl>
                            <Input placeholder="Optional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="contactNo"
                      rules={{ required: 'Contact Number is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={registerForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full bg-safety-500 hover:bg-safety-600" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Register'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter>
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 border-emergency-300 text-emergency-600 hover:text-emergency-50 hover:bg-emergency-600"
            onClick={() => setActiveTab('register')}
          >
            <AlertTriangle className="h-4 w-4" />
            Report Emergency Anonymously
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthForms;
