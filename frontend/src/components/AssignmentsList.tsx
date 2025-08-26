import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';
import io from 'socket.io-client';

const AssignmentsList = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket,setSocket] = useState(null);
  console.log("Current User:", currentUser);
  
  useEffect(() => {
    // Initialize socket connection
    // const socket = io('http://localhost:7000');
    const newSocket = io("http://localhost:7000", {
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

    // Fetch initial assignments
    fetchAssignments();

    // Socket event listeners
    // socket.on('assignmentUpdate', ({ action, assignment, assignmentId }) => {
    //   switch (action) {
    //     case 'create':
    //       if (assignment.Volunteerid === currentUser?.id) {
    //         setAssignments(prev => [assignment, ...prev]);
    //         toast({
    //           title: "New Assignment",
    //           description: "You have been assigned a new task",
    //         });
    //       }
    //       break;
    //     case 'update':
    //       setAssignments(prev => 
    //         prev.map(a => a.id === assignment.id ? assignment : a)
    //       );
    //       break;
    //     case 'delete':
    //       setAssignments(prev => 
    //         prev.filter(a => a.id !== assignmentId)
    //       );
    //       break;
    //     default:
    //       console.warn('Unknown assignment update action:', action);
    //   }
    // });

    setSocket(newSocket);

    newSocket.on('assignmentUpdate', () => {
      console.log("Assignment updated");
      fetchAssignments();
    });

    // Error handling
    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    // Cleanup socket connection on unmount
    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:7000/api/assignments/volunteer-assignments/${currentUser?.id}`,
      );
      setAssignments(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (assignmentId, newStatus) => {
    try {
      await axios.put(`http://localhost:7000/api/assignments/${assignmentId}`, {
        status: newStatus.toUpperCase()
      });
      
      setAssignments(prev => 
        prev.map(assignment => 
          assignment.id === assignmentId 
            ? { ...assignment, Status: newStatus.toUpperCase() }
            : assignment
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Assignment status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      'ACCEPTED': { label: 'Accepted', className: 'bg-blue-100 text-blue-800' },
      'IN_PROGRESS': { label: 'In Progress', className: 'bg-green-100 text-green-800' },
      'COMPLETED': { label: 'Completed', className: 'bg-gray-100 text-gray-800' },
      'CANCELLED': { label: 'Cancelled', className: 'bg-red-100 text-red-800' }
    };
    
    return statusConfig[status] || statusConfig['PENDING'];
  };

  const getPriorityIcon = (priority) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'MEDIUM':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Loading assignments...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No assignments available at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        assignments.map((assignment) => {
          const statusConfig = getStatusBadge(assignment.Status);
          
          return (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getPriorityIcon(assignment.Priority)}
                      <CardTitle className="text-lg">{assignment.Task}</CardTitle>
                    </div>
                    <CardDescription>
                      {assignment.District}, {assignment.Province}
                    </CardDescription>
                  </div>
                  <Badge className={statusConfig.className}>
                    {statusConfig.label}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>
                      Lat: {assignment.Latitude}, Long: {assignment.Longitude}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      Assigned: {new Date(assignment.AssignedDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    {assignment.Status === 'PENDING' && (
                      <Button 
                        onClick={() => handleUpdateStatus(assignment.id, 'IN_PROGRESS')}
                        className="bg-safety-500 hover:bg-safety-600"
                      >
                        Accept & Start
                      </Button>
                    )}
                    
                    {assignment.Status === 'IN_PROGRESS' && (
                      <Button 
                        onClick={() => handleUpdateStatus(assignment.id, 'COMPLETED')}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        Mark as Completed
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default AssignmentsList;