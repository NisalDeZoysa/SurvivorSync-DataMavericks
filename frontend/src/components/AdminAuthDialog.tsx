import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminAuthDialogProps {
  onClose: () => void;
}

const AdminAuthDialog = ({ onClose }: AdminAuthDialogProps) => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    NIC: '',
    address: '',
    contactNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    type: 'admin'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // to get/set cookies
        body: JSON.stringify(loginData)
      });

      if (!res.ok) throw new Error('Login failed');

      toast({
        title: 'Login Successful',
        description: 'Welcome back to the emergency response system.',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: registerData.name,
        NIC: registerData.NIC,
        address: registerData.address,
        contactNumber: registerData.contactNumber,
        email: registerData.email,
        type: registerData.type,
        password: registerData.password
      };

      const res = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Registration failed');

      toast({
        title: 'Registration Successful',
        description: 'Your admin account has been created successfully.',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: 'An error occurred during registration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emergency-100 mb-3">
          <AlertTriangle className="h-6 w-6 text-emergency-600" />
        </div>
        <p className="text-sm text-gray-600">
          Administrative access for emergency responders and system administrators
        </p>
      </div>

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                placeholder="admin@emergency.gov"
                required
              />
            </div>
            <div>
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="register">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="register-name">Full Name</Label>
              <Input
                id="register-name"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <Label htmlFor="register-nic">NIC</Label>
              <Input
                id="register-nic"
                value={registerData.NIC}
                onChange={(e) => setRegisterData({ ...registerData, NIC: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="register-address">Address</Label>
              <Input
                id="register-address"
                value={registerData.address}
                onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="register-contact">Contact Number</Label>
              <Input
                id="register-contact"
                value={registerData.contactNumber}
                onChange={(e) => setRegisterData({ ...registerData, contactNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                placeholder="admin@emergency.gov"
                required
              />
            </div>
            <div>
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="register-confirm-password">Confirm Password</Label>
              <Input
                id="register-confirm-password"
                type="password"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Admin Account'}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAuthDialog;
