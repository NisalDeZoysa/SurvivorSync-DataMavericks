import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Eye, Users, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface Assignment {
  id: string;
  volunteerName: string;
  district: string;
  assignedDate: string;
  status: 'active' | 'completed' | 'pending';
  task: string;
  priority: 'low' | 'medium' | 'high';
}

const mockAssignments: Assignment[] = [
  {
    id: '1',
    volunteerName: 'John Silva',
    district: 'Colombo',
    assignedDate: '2024-01-15',
    status: 'active',
    task: 'Flood response coordination',
    priority: 'high'
  },
  {
    id: '2',
    volunteerName: 'Mary Fernando',
    district: 'Kandy',
    assignedDate: '2024-01-10',
    status: 'completed',
    task: 'Emergency shelter setup',
    priority: 'medium'
  },
  {
    id: '3',
    volunteerName: 'David Perera',
    district: 'Galle',
    assignedDate: '2024-01-20',
    status: 'pending',
    task: 'Medical aid distribution',
    priority: 'high'
  }
];

const VolunteerAssignment = () => {
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    volunteerName: '',
    district: '',
    task: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const handleAddAssignment = () => {
    const newAssignment: Assignment = {
      id: Date.now().toString(),
      volunteerName: formData.volunteerName,
      district: formData.district,
      assignedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      task: formData.task,
      priority: formData.priority
    };
    
    setAssignments([...assignments, newAssignment]);
    setFormData({ volunteerName: '', district: '', task: '', priority: 'medium' });
    setIsAddDialogOpen(false);
    toast.success('Assignment created successfully');
  };

  const handleEditAssignment = () => {
    if (!selectedAssignment) return;
    
    const updatedAssignments = assignments.map(assignment =>
      assignment.id === selectedAssignment.id
        ? { ...assignment, ...formData }
        : assignment
    );
    
    setAssignments(updatedAssignments);
    setIsEditDialogOpen(false);
    setSelectedAssignment(null);
    toast.success('Assignment updated successfully');
  };

  const openEditDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      volunteerName: assignment.volunteerName,
      district: assignment.district,
      task: assignment.task,
      priority: assignment.priority
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                <Label htmlFor="volunteerName">Volunteer Name</Label>
                <Input
                  id="volunteerName"
                  value={formData.volunteerName}
                  onChange={(e) => setFormData({ ...formData, volunteerName: e.target.value })}
                  placeholder="Enter volunteer name"
                />
              </div>
              <div>
                <Label htmlFor="district">District</Label>
                <select
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select District</option>
                  <option value="Colombo">Colombo</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Galle">Galle</option>
                  <option value="Jaffna">Jaffna</option>
                  <option value="Matara">Matara</option>
                </select>
              </div>
              <div>
                <Label htmlFor="task">Task Description</Label>
                <Input
                  id="task"
                  value={formData.task}
                  onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                  placeholder="Describe the assigned task"
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <Button onClick={handleAddAssignment} className="w-full">
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
                    <TableHead>District</TableHead>
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
                      <TableCell className="font-medium">{assignment.volunteerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-500" />
                          {assignment.district}
                        </div>
                      </TableCell>
                      <TableCell>{assignment.task}</TableCell>
                      <TableCell>{assignment.assignedDate}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                          {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
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
                      .filter((assignment) => assignment.status === status)
                      .map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">{assignment.volunteerName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gray-500" />
                              {assignment.district}
                            </div>
                          </TableCell>
                          <TableCell>{assignment.task}</TableCell>
                          <TableCell>{assignment.assignedDate}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                              {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)}
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
              <Label htmlFor="edit-volunteerName">Volunteer Name</Label>
              <Input
                id="edit-volunteerName"
                value={formData.volunteerName}
                onChange={(e) => setFormData({ ...formData, volunteerName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-district">District</Label>
              <select
                id="edit-district"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Colombo">Colombo</option>
                <option value="Kandy">Kandy</option>
                <option value="Galle">Galle</option>
                <option value="Jaffna">Jaffna</option>
                <option value="Matara">Matara</option>
              </select>
            </div>
            <div>
              <Label htmlFor="edit-task">Task Description</Label>
              <Input
                id="edit-task"
                value={formData.task}
                onChange={(e) => setFormData({ ...formData, task: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-priority">Priority</Label>
              <select
                id="edit-priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
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
                <p className="text-gray-700">{selectedAssignment.volunteerName}</p>
              </div>
              <div>
                <Label className="font-semibold">District</Label>
                <p className="text-gray-700">{selectedAssignment.district}</p>
              </div>
              <div>
                <Label className="font-semibold">Task Description</Label>
                <p className="text-gray-700">{selectedAssignment.task}</p>
              </div>
              <div>
                <Label className="font-semibold">Assigned Date</Label>
                <p className="text-gray-700">{selectedAssignment.assignedDate}</p>
              </div>
              <div>
                <Label className="font-semibold">Priority</Label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedAssignment.priority)}`}>
                  {selectedAssignment.priority.charAt(0).toUpperCase() + selectedAssignment.priority.slice(1)}
                </span>
              </div>
              <div>
                <Label className="font-semibold">Status</Label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAssignment.status)}`}>
                  {selectedAssignment.status.charAt(0).toUpperCase() + selectedAssignment.status.slice(1)}
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