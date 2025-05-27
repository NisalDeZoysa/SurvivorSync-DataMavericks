import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Assignment, AssignmentStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Mock assignments data
const mockAssignments: Assignment[] = [
  {
    id: '1',
    disasterId: 'disaster-1',
    volunteerId: 'volunteer-1',
    assignedBy: 'responder-1',
    title: 'Assess flood damage in residential area',
    description: 'Survey the flood-affected residential area and report on damage to homes and infrastructure.',
    priority: 'high',
    status: AssignmentStatus.PENDING,
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: '123 Main St, Flood Zone A'
    },
    assignedAt: '2024-01-15T10:00:00Z',
    dueDate: '2024-01-16T18:00:00Z'
  },
  {
    id: '2',
    disasterId: 'disaster-2',
    volunteerId: 'volunteer-1',
    assignedBy: 'responder-2',
    title: 'Distribute emergency supplies',
    description: 'Help distribute food, water, and medical supplies to affected families in the evacuation center.',
    priority: 'medium',
    status: AssignmentStatus.IN_PROGRESS,
    location: {
      latitude: 40.7589,
      longitude: -73.9851,
      address: 'Community Center, 456 Relief Ave'
    },
    assignedAt: '2024-01-14T08:00:00Z'
  }
];

const AssignmentsList: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);

  const handleAcceptAssignment = (assignmentId: string) => {
    setAssignments(prev => 
      prev.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, status: AssignmentStatus.ACCEPTED }
          : assignment
      )
    );
    
    toast({
      title: "Assignment Accepted",
      description: "You have successfully accepted this assignment.",
    });
  };

  const handleStartAssignment = (assignmentId: string) => {
    setAssignments(prev => 
      prev.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, status: AssignmentStatus.IN_PROGRESS }
          : assignment
      )
    );
    
    toast({
      title: "Assignment Started",
      description: "You have started working on this assignment.",
    });
  };

  const getStatusBadge = (status: AssignmentStatus) => {
    const statusConfig = {
      [AssignmentStatus.PENDING]: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      [AssignmentStatus.ACCEPTED]: { label: 'Accepted', className: 'bg-blue-100 text-blue-800' },
      [AssignmentStatus.IN_PROGRESS]: { label: 'In Progress', className: 'bg-green-100 text-green-800' },
      [AssignmentStatus.COMPLETED]: { label: 'Completed', className: 'bg-gray-100 text-gray-800' },
      [AssignmentStatus.CANCELLED]: { label: 'Cancelled', className: 'bg-red-100 text-red-800' }
    };
    
    return statusConfig[status];
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

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
          const statusConfig = getStatusBadge(assignment.status);
          
          return (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getPriorityIcon(assignment.priority)}
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    </div>
                    <CardDescription>{assignment.description}</CardDescription>
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
                    <span>{assignment.location.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                      {assignment.dueDate && (
                        <span className="ml-2">
                          | Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    {assignment.status === AssignmentStatus.PENDING && (
                      <Button 
                        onClick={() => handleAcceptAssignment(assignment.id)}
                        className="bg-safety-500 hover:bg-safety-600"
                      >
                        Accept Assignment
                      </Button>
                    )}
                    
                    {assignment.status === AssignmentStatus.ACCEPTED && (
                      <Button 
                        onClick={() => handleStartAssignment(assignment.id)}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        Start Working
                      </Button>
                    )}
                    
                    {assignment.status === AssignmentStatus.IN_PROGRESS && (
                      <Button 
                        variant="outline"
                        className="border-emergency-300 text-emergency-600 hover:bg-emergency-50"
                      >
                        Submit Report
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