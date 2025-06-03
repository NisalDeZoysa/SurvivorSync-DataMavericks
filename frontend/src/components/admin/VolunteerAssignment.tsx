import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Eye, Users, MapPin, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import io from 'socket.io-client';

const Assignment = PropTypes.shape({
  id: PropTypes.number.isRequired,
  VolunteerName: PropTypes.string.isRequired,
  District: PropTypes.string.isRequired,
  Province: PropTypes.string.isRequired,
  Longitude: PropTypes.number.isRequired,
  Latitude: PropTypes.number.isRequired,
  Task: PropTypes.string.isRequired,
  AssignedDate: PropTypes.string.isRequired,
  Priority: PropTypes.string.isRequired,
  Status: PropTypes.string.isRequired,
});

const VolunteerAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [disasterRequests, setDisasterRequests] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [formData, setFormData] = useState({
    Volunteerid: '',
    DisasterRequestId: '',
    Task: '',
    Priority: 'HIGH'
  });

  useEffect(() => {
    // Initialize socket connection
    const socket = io('http://localhost:7000');

    // Fetch initial data
    fetchAssignments();
    fetchVolunteers();
    fetchDisasterRequests();

    // Socket listeners
    socket.on('assignmentUpdate', ({ action, assignment, assignmentId }) => {
      switch (action) {
        case 'create':
          setAssignments(prev => [assignment, ...prev]);
          toast.success('New assignment created');
          break;
        case 'update':
          setAssignments(prev => prev.map(a => a.id === assignment.id ? assignment : a));
          toast.success('Assignment updated');
          break;
        case 'delete':
          setAssignments(prev => prev.filter(a => a.id !== assignmentId));
          toast.success('Assignment deleted');
          break;
        default:
          console.warn('Unknown assignment update action:', action);
      }
    });

    // Clean up socket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchVolunteers = async () => {
    try {
      const response = await fetch('http://localhost:7000/api/users/volunteers');
      const data = await response.json();
      setVolunteers(data);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      //toast.error('Failed to fetch volunteers');
    }
  };

  const fetchDisasterRequests = async () => {
    try {
      const response = await fetch('http://localhost:7000/api/requests/verified');
      const data = await response.json();
      setDisasterRequests(data);
    } catch (error) {
      console.error('Error fetching disaster requests:', error);
      //toast.error('Failed to fetch disaster requests');
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch('http://localhost:7000/api/assignments/summary');
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to fetch assignments');
    }
  };

  const handleAddAssignment = async () => {
    try {
      const response = await fetch('http://localhost:7000/api/assignments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create assignment');
      }

      // No need to update state here as socket will handle it
      setFormData({
        Volunteerid: '',
        DisasterRequestId: '',
        Task: '',
        Priority: 'HIGH'
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error creating assignment:', error);
      //toast.error('Failed to create assignment');
    }
  };

  const handleEditAssignment = async () => {
    try {
      const response = await fetch(`http://localhost:7000/api/assignments/${selectedAssignment.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: formData.status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update assignment');
      }

      // No need to update state here as socket will handle it
      setIsEditDialogOpen(false);
      setSelectedAssignment(null);
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to update assignment');
    }
  };

  const openEditDialog = (assignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      Volunteerid: assignment.Volunteerid,
      DisasterRequestId: assignment.DisasterRequestId,
      Task: assignment.Task,
      Priority: assignment.Priority
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (assignment) => {
    setSelectedAssignment(assignment);
    setIsViewDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGoogleMapsUrl = (latitude, longitude) => {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Volunteer Assignment Management</h2>
          <p className="text-gray-600">Assign and manage volunteer tasks across districts</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-safety-500 hover:bg-safety-600">
              <Plus className="h-4 w-4 mr-2" />
              New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
              <DialogDescription>
                Assign a volunteer to a specific task in their district
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="Volunteerid">Volunteer</Label>
                <select
                  id="Volunteerid"
                  value={formData.Volunteerid}
                  onChange={(e) => setFormData({ ...formData, Volunteerid: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Volunteer</option>
                  {volunteers.map(volunteer => (
                    <option key={volunteer.id} value={volunteer.id}>
                      {volunteer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="DisasterRequestId">Disaster Request</Label>
                <select
                  id="DisasterRequestId"
                  value={formData.DisasterRequestId}
                  onChange={(e) => setFormData({ ...formData, DisasterRequestId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Disaster Request</option>
                  {disasterRequests.map(request => (
                    <option key={request.id} value={request.id}>
                      {request.district.split(' ')[0]} {request.id} - {request.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="task">Task Description</Label>
                <Input
                  id="task"
                  value={formData.Task}
                  onChange={(e) => setFormData({ ...formData, Task: e.target.value })}
                  placeholder="Describe the assigned task"
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={formData.Priority}
                  onChange={(e) => setFormData({ ...formData, Priority: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <Button 
                onClick={handleAddAssignment} 
                className="w-full"
                disabled={!formData.Volunteerid || !formData.DisasterRequestId || !formData.Task}
              >
                Create Assignment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Assignments</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Volunteer Assignments
              </CardTitle>
              <CardDescription>
                Complete list of all volunteer assignments across districts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Volunteer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.VolunteerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{assignment.District.split(' ')[0]}, {assignment.Province.split(' ')[0]}</span>
                          <a
                            href={getGoogleMapsUrl(assignment.Latitude, assignment.Longitude)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>{assignment.Task}</TableCell>
                      <TableCell>{new Date(assignment.AssignedDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(assignment.Priority)}`}>
                          {assignment.Priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.Status)}`}>
                          {assignment.Status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openViewDialog(assignment)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(assignment)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Other tab contents would filter the assignments based on status */}
        {['active', 'pending', 'completed'].map((status) => (
          <TabsContent key={status} value={status}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{status} Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Volunteer</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments
                      .filter((assignment) => assignment.Status === status)
                      .map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">{assignment.VolunteerName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gray-500" />
                              {assignment.District}
                            </div>
                          </TableCell>
                          <TableCell>{assignment.Task}</TableCell>
                          <TableCell>{new Date(assignment.AssignedDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(assignment.Priority)}`}>
                              {assignment.Priority}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openViewDialog(assignment)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(assignment)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>
              Update the assignment details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-Volunteerid">Volunteer</Label>
              <select
                id="edit-Volunteerid"
                value={formData.Volunteerid}
                onChange={(e) => setFormData({ ...formData, Volunteerid: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Volunteer</option>
                {volunteers.map(volunteer => (
                  <option key={volunteer.id} value={volunteer.id}>
                    {volunteer.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="edit-DisasterRequestId">Disaster Request</Label>
              <select
                id="edit-DisasterRequestId"
                value={formData.DisasterRequestId}
                onChange={(e) => setFormData({ ...formData, DisasterRequestId: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Disaster Request</option>
                {disasterRequests.map(request => (
                  <option key={request.id} value={request.id}>
                    {request.district.split(' ')[0]} {request.id} - {request.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="edit-task">Task Description</Label>
              <Input
                id="edit-task"
                value={formData.Task}
                onChange={(e) => setFormData({ ...formData, Task: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-priority">Priority</Label>
              <select
                id="edit-priority"
                value={formData.Priority}
                onChange={(e) => setFormData({ ...formData, Priority: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <Button onClick={handleEditAssignment} className="w-full">
              Update Assignment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
            <DialogDescription>
              Complete information about this assignment
            </DialogDescription>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Volunteer Name</Label>
                <p className="text-gray-700">{selectedAssignment.VolunteerName}</p>
              </div>
              <div>
                <Label className="font-semibold">District</Label>
                <p className="text-gray-700">{selectedAssignment.District}</p>
              </div>
              <div>
                <Label className="font-semibold">Task Description</Label>
                <p className="text-gray-700">{selectedAssignment.Task}</p>
              </div>
              <div>
                <Label className="font-semibold">Assigned Date</Label>
                <p className="text-gray-700">{new Date(selectedAssignment.AssignedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="font-semibold">Priority</Label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedAssignment.Priority)}`}>
                  {selectedAssignment.Priority}
                </span>
              </div>
              <div>
                <Label className="font-semibold">Status</Label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAssignment.Status)}`}>
                  {selectedAssignment.Status}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VolunteerAssignment;