import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Resource_Center } from "@/types";

interface AdminAuthDialogProps {
  onClose: () => void;
}

const AdminAuthDialog = ({ onClose }: AdminAuthDialogProps) => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    nic: "",
    resourceCenterId: 0,
    address: "",
    contactNumber: "",
    email: "",
    type: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resourceCenters, setResourceCenters] = useState<Resource_Center[]>([]);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Admin and First Responder Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login data:", loginData);
    try {
      await login(loginData.email, loginData.password);
      toast({
        title: "Login Successful",
        description: "Welcome back to the emergency response system.",
      });
      onClose();
      navigate("/");
      
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
      console.error("Login error:", error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Registering user with data:', registerData);

      console.log("Register data:", registerData);
          await register(
              registerData.name,
              registerData.email,
              registerData.password,
              registerData.type,
              registerData.nic,
              registerData.resourceCenterId,
              registerData.address,
              registerData.contactNumber
          );

        toast({
          title: 'You can Login After we verify your account',
          description: `Welcome ${registerData.name|| ''}! You can now log in.`,
        });

          setRegisterData({
            name: "",
            nic: "",
            resourceCenterId: 0,
            address: "",
            contactNumber: "",
            email: "",
            type: "",
            password: "",
            confirmPassword: "",
          });


          onClose();
      } 

   
    catch (error) {
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

  const fetchResourceCenters = async () => {
    setLoadingCenters(true);
    try {
      const response = await fetch(
        "http://localhost:7000/api/resource-centers"
      );
      if (!response.ok) throw new Error("Failed to fetch resource centers");
      const data: Resource_Center[] = await response.json();
      // console.log("Resource centers response:", data);

      const transformedData: Resource_Center[] = data.map((center) => ({
        id: center.id,
        name: center.name,
        resourceId: center.resourceId,
        lat: center.lat,
        long: center.long,
        district: center.district,
        province: center.province,
        count: center.count,
        used: center.used,
        contactNumber: center.contactNumber,
      }));

      setResourceCenters(transformedData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load resource centers",
        variant: "destructive",
      });
    } finally {
      setLoadingCenters(false);
    }
  };

  // Fetch resource centers on component mount
  useEffect(() => {
    fetchResourceCenters();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto ">
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600">
          Administrative access for emergency responders and system
          administrators
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
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
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
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="register">
          <form onSubmit={handleRegister} className="space-y-4 ">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={registerData.name}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, name: e.target.value })
                  }
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="nic">NIC</Label>
                <Input
                  id="nic"
                  value={registerData.nic}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, nic: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  value={registerData.contactNumber}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      contactNumber: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, email: e.target.value })
                  }
                  placeholder="admin@emergency.gov"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="register-confirm-password">
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                {/* Selection of Type */}
                <select
                  id="type"
                  value={registerData.type}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, type: e.target.value })
                  }
                  className="w-full p-2 border rounded-md bg-white text-sm"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Police">Police</option>
                  <option value="Army">Army</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Redcross">Redcross</option>
                  <option value="NGO">NGO</option>
                  <option value="Government">Government</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="resourceCenterId">Select Recource Center</Label>
                {/* selection of resource center */}
                <select
                  id="resourceCenterId"
                  value={registerData.resourceCenterId || ""}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      resourceCenterId: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded-md bg-white"
                  required
                  disabled={loadingCenters}
                >
                  <option value="">Resource Center</option>
                  {resourceCenters.map((center) => (
                    <option key={center.id} value={center.id}>
                      {center.name}
                    </option>
                  ))}
                  {loadingCenters && (
                    <option value="" disabled>
                      Loading centers...
                    </option>
                  )}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={registerData.address}
                onChange={(e) =>
                  setRegisterData({ ...registerData, address: e.target.value })
                }
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Admin Account"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAuthDialog;
