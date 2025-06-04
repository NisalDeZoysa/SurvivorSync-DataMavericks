import React, { useEffect, useState } from "react";
import { Plus, Users, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import {
  FirstResponderStatus,
  FirstResponder,
  FirstResponderTypes,
} from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateUserForm from "./CreateFirstResponderForm";
import { useToast } from "@/hooks/use-toast";
import io from "socket.io-client";


const UserManagement = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const [users, setUsers] = useState<FirstResponder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
    const [socket, setSocket] = useState<any>(null);
  

  // Fetch first responders from backend
  const fetchAllFr = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:7000/api/first-responders/admins",
        {

          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch first responders");
      }

      const data = await response.json();
      console.log("First responders:", data);
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch first responders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch first responders.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update verification status
  const updateVerification = async (
    id: number,
    status: FirstResponderStatus
  ) => {
    try {
      console.log("Status:", status);
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:7000/api/first-responders/verify",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id,
            is_verified: status,
          }),
        }
      );
      console.log("Response:", response);
      if (!response.ok) {
        throw new Error("Failed to update verification status");
      }

      // Optimistically update local state
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, status } : user))
      );

      return true;
    } catch (error) {
      console.error("Error updating verification:", error);
      toast({
        title: "Error",
        description: "Failed to update verification status.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleApprove = async (userId: number) => {
    const success = await updateVerification(
      userId,
      FirstResponderStatus.VERIFIED
    );
    if (success) {
      toast({
        title: "User Approved",
        description: "The user has been approved and can now log in.",
      });
    }
  };

  const handleReject = async (userId: number) => {
    const success = await updateVerification(
      userId,
      FirstResponderStatus.REJECTED
    );
    if (success) {
      toast({
        title: "User Rejected",
        description: "The user registration has been rejected.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAllFr();

    // inmplement socket
    // Setup socket connection
        const newSocket = io("http://localhost:7000", {
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });
    
        setSocket(newSocket);
    
        // Listen for disaster updates
        newSocket.on("FRUpdated", () => {
          console.log("Received update notification - refreshing data...");
          fetchAllFr();
        });
    
        // Error handling
        newSocket.on("connect_error", (err) => {
          console.error("Socket connection error:", err.message);
        });
    
        // Cleanup on unmount
        return () => {
          newSocket.disconnect();
        };
  }, []);

  // Filter functions
  const getAllUsers = () => users;
  const getPendingUsers = () =>
    users.filter((user) => user.is_verified === FirstResponderStatus.PENDING);
  const getApprovedUsers = () =>
    users.filter((user) => user.is_verified === FirstResponderStatus.VERIFIED);

  const getStatusBadge = (is_verified: FirstResponderStatus) => {
    switch (is_verified) {
      case FirstResponderStatus.VERIFIED:
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case FirstResponderStatus.PENDING:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case FirstResponderStatus.REJECTED:
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getRoleBadge = (type: FirstResponderTypes) => {
  switch (type) {
    case FirstResponderTypes.POLICE:
      return (
        <Badge className="bg-blue-100 text-blue-800 border border-blue-300">
          Police
        </Badge>
      );
    case FirstResponderTypes.ARMY:
      return (
        <Badge className="bg-green-100 text-green-800 border border-green-300">
          Army
        </Badge>
      );
    case FirstResponderTypes.HOSPITAL:
      return (
        <Badge className="bg-red-100 text-red-800 border border-red-300">
          Hospital
        </Badge>
      );
    case FirstResponderTypes.REDCROSS:
      return (
        <Badge className="bg-red-500 text-white border border-red-600">
          Red Cross
        </Badge>
      );
    case FirstResponderTypes.NGO:
      return (
        <Badge className="bg-purple-100 text-purple-800 border border-purple-300">
          NGO
        </Badge>
      );
    case FirstResponderTypes.GOVERNMENT:
      return (
        <Badge className="bg-gray-100 text-gray-800 border border-gray-300">
          Government
        </Badge>
      );
    case FirstResponderTypes.OTHER:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300">
          Other
        </Badge>
      );
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

  // Loading state
  if (isLoading) {
    return <div>Loading first responders...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Admin Management</h2>
          <p className="text-gray-600">
            Manage first responders registrations and create new responders
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Admin</DialogTitle>
              <DialogDescription>
                Create a new admin account with role as ADMIN.
              </DialogDescription>
            </DialogHeader>
            <CreateUserForm onClose={() => setShowCreateDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total FirstResponders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAllUsers().length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending FirstResponders
            </CardTitle>
            <UserCheck className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getPendingUsers().length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved FirstResponders
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getApprovedUsers().length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      {getPendingUsers().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-yellow-500" />
              Pending Approvals
            </CardTitle>
            <CardDescription>
              FirstResponders waiting for approval to access the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>NIC</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getPendingUsers().map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.type)}</TableCell>
                    <TableCell>{user.contactNumber}</TableCell>
                    <TableCell>
                      {user.nic}
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(user.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(user.id)}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All FirstResponders
          </CardTitle>
          <CardDescription>
            Complete list of FirstResponders users in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>NIC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getAllUsers().map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.type)}</TableCell>
                  <TableCell>
                    {getStatusBadge(user.is_verified as FirstResponderStatus)}
                  </TableCell>
                  <TableCell>{user.contactNumber}</TableCell>
                  <TableCell>{user.nic || "N/A"} </TableCell>               
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
