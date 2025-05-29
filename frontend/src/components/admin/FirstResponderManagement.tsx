
import React, { useState } from 'react';
import { Plus, Users, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { UserRole, FirstResponderStatus } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CreateUserForm from './CreateFirstResponderForm';
import { useToast } from '@/hooks/use-toast';

type UserStatus = "pending" | "approved" | "rejected";

interface User {
  id: string;
  name: string;
  contactNumber: string;
  email: string;
  description: string;
  status: UserStatus;
}

const initialUsers: User[] = [
  {
    id: "1",
    name: "Selani12",
    contactNumber: "0711498377",
    email: "pkselani12@gmail.com",
    description: "",
    status: "pending",
  },
  {
    id: "2",
    name: "Nimasha23",
    contactNumber: "0711234567",
    email: "nimasha23@example.com",
    description: "",
    status: "approved",
  },
  {
    id: "3",
    name: "Kavindu99",
    contactNumber: "0777654321",
    email: "kavindu99@example.com",
    description: "",
    status: "rejected",
  },
  {
    id: "4",
    name: "Tharushi88",
    contactNumber: "0781237890",
    email: "tharushi88@example.com",
    description: "",
    status: "pending",
  },
  {
    id: "5",
    name: "Isuru44",
    contactNumber: "0751112233",
    email: "isuru44@example.com",
    description: "",
    status: "approved",
  },
  {
    id: "6",
    name: "Chamodi77",
    contactNumber: "0765566778",
    email: "chamodi77@example.com",
    description: "",
    status: "rejected",
  },
  {
    id: "7",
    name: "Dineth34",
    contactNumber: "0729988776",
    email: "dineth34@example.com",
    description: "",
    status: "pending",
  },
  {
    id: "8",
    name: "Hansika56",
    contactNumber: "0701122334",
    email: "hansika56@example.com",
    description: "",
    status: "approved",
  },
  {
    id: "9",
    name: "Sewmini01",
    contactNumber: "0714455667",
    email: "sewmini01@example.com",
    description: "",
    status: "rejected",
  },
  {
    id: "10",
    name: "Ravindu22",
    contactNumber: "0746677889",
    email: "ravindu22@example.com",
    description: "",
    status: "pending",
  },
];

const UserManagement = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(initialUsers);

 const getAllUsers = () => users;
 const getPendingUsers = () => users.filter((user) => user.status === 'pending');
  const getApprovedUsers = () => users.filter((user) => user.status === 'approved');

  const approveUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: 'approved' } : user
      )
    );
  };

  const rejectUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: 'rejected' } : user
      )
    );
  };

  const handleApprove = (userId: string) => {
    approveUser(userId);
    toast({
      title: 'User Approved',
      description: 'The user has been approved and can now log in.',
    });
  };

  const handleReject = (userId: string) => {
    rejectUser(userId);
    toast({
      title: 'User Rejected',
      description: 'The user registration has been rejected.',
      variant: 'destructive',
    });
  };


  const getStatusBadge = (status: FirstResponderStatus) => {
    switch (status) {
      case FirstResponderStatus.APPROVED:
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case FirstResponderStatus.PENDING:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case FirstResponderStatus.REJECTED:
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Badge variant="destructive">Admin</Badge>;
      case UserRole.FIRST_RESPONDER:
        return <Badge className="bg-blue-100 text-blue-800">First Responder</Badge>;
      case UserRole.USER:
        return <Badge variant="secondary">User</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">First Responders Management</h2>
          <p className="text-gray-600">Manage first responders registrations and create new responders</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new user account with specified role and details.
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
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAllUsers().length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <UserCheck className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getPendingUsers().length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Users</CardTitle>
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
              Users waiting for approval to access the system.
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
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getPendingUsers().map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{user.contactNumber}</TableCell>
                    <TableCell>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApprove(user.id)} className="bg-green-600 hover:bg-green-700">
                          <UserCheck className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(user.id)}>
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
            All Users
          </CardTitle>
          <CardDescription>
            Complete list of all users in the system.
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
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            {/* <TableBody>
              {getAllUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{user.contactNo || 'N/A'}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody> */}
            <TableBody>
               {getAllUsers().map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status as FirstResponderStatus)}</TableCell>
                  <TableCell>{user.contactNumber}</TableCell>
                  <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
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