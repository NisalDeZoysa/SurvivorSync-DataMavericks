import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Package, MapPin, Building } from 'lucide-react';
import { toast } from 'sonner';

interface Resource {
  id: string;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  status: 'available' | 'allocated' | 'maintenance';
  lastUpdated: string;
}

interface ResourceCenter {
  id: string;
  name: string;
  location: string;
  district: string;
  capacity: number;
  currentStock: number;
  manager: string;
  contact: string;
}

const mockResources: Resource[] = [
  {
    id: '1',
    name: 'Emergency Food Packs',
    type: 'Food',
    quantity: 500,
    unit: 'packs',
    status: 'available',
    lastUpdated: '2024-01-15'
  },
  {
    id: '2',
    name: 'Medical Kits',
    type: 'Medical',
    quantity: 150,
    unit: 'kits',
    status: 'allocated',
    lastUpdated: '2024-01-14'
  },
  {
    id: '3',
    name: 'Water Bottles',
    type: 'Water',
    quantity: 1000,
    unit: 'bottles',
    status: 'available',
    lastUpdated: '2024-01-16'
  }
];

const mockResourceCenters: ResourceCenter[] = [
  {
    id: '1',
    name: 'Colombo Central Resource Hub',
    location: 'Colombo 07',
    district: 'Colombo',
    capacity: 10000,
    currentStock: 7500,
    manager: 'Priya Wickramasinghe',
    contact: '011-2345678'
  },
  {
    id: '2',
    name: 'Kandy Emergency Center',
    location: 'Kandy City',
    district: 'Kandy',
    capacity: 5000,
    currentStock: 3200,
    manager: 'Sunil Rajapaksa',
    contact: '081-2234567'
  }
];

const ResourceAllocation = () => {
  const [resources, setResources] = useState<Resource[]>(mockResources);
  const [resourceCenters, setResourceCenters] = useState<ResourceCenter[]>(mockResourceCenters);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isCenterDialogOpen, setIsCenterDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingCenter, setEditingCenter] = useState<ResourceCenter | null>(null);
  
  const [resourceForm, setResourceForm] = useState({
    name: '',
    type: '',
    quantity: 0,
    unit: '',
    status: 'available' as 'available' | 'allocated' | 'maintenance'
  });

  const [centerForm, setCenterForm] = useState({
    name: '',
    location: '',
    district: '',
    capacity: 0,
    currentStock: 0,
    manager: '',
    contact: ''
  });

  const handleAddResource = () => {
    const newResource: Resource = {
      id: Date.now().toString(),
      ...resourceForm,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    setResources([...resources, newResource]);
    setResourceForm({ name: '', type: '', quantity: 0, unit: '', status: 'available' });
    setIsResourceDialogOpen(false);
    toast.success('Resource added successfully');
  };

  const handleEditResource = () => {
    if (!editingResource) return;
    
    const updatedResources = resources.map(resource =>
      resource.id === editingResource.id
        ? { ...resource, ...resourceForm, lastUpdated: new Date().toISOString().split('T')[0] }
        : resource
    );
    
    setResources(updatedResources);
    setEditingResource(null);
    setIsResourceDialogOpen(false);
    toast.success('Resource updated successfully');
  };

  const handleDeleteResource = (id: string) => {
    setResources(resources.filter(resource => resource.id !== id));
    toast.success('Resource deleted successfully');
  };

  const handleAddCenter = () => {
    const newCenter: ResourceCenter = {
      id: Date.now().toString(),
      ...centerForm
    };
    
    setResourceCenters([...resourceCenters, newCenter]);
    setCenterForm({ name: '', location: '', district: '', capacity: 0, currentStock: 0, manager: '', contact: '' });
    setIsCenterDialogOpen(false);
    toast.success('Resource center added successfully');
  };

  const handleEditCenter = () => {
    if (!editingCenter) return;
    
    const updatedCenters = resourceCenters.map(center =>
      center.id === editingCenter.id ? { ...center, ...centerForm } : center
    );
    
    setResourceCenters(updatedCenters);
    setEditingCenter(null);
    setIsCenterDialogOpen(false);
    toast.success('Resource center updated successfully');
  };

  const handleDeleteCenter = (id: string) => {
    setResourceCenters(resourceCenters.filter(center => center.id !== id));
    toast.success('Resource center deleted successfully');
  };

  const openResourceDialog = (resource?: Resource) => {
    if (resource) {
      setEditingResource(resource);
      setResourceForm({
        name: resource.name,
        type: resource.type,
        quantity: resource.quantity,
        unit: resource.unit,
        status: resource.status
      });
    } else {
      setEditingResource(null);
      setResourceForm({ name: '', type: '', quantity: 0, unit: '', status: 'available' });
    }
    setIsResourceDialogOpen(true);
  };

  const openCenterDialog = (center?: ResourceCenter) => {
    if (center) {
      setEditingCenter(center);
      setCenterForm({
        name: center.name,
        location: center.location,
        district: center.district,
        capacity: center.capacity,
        currentStock: center.currentStock,
        manager: center.manager,
        contact: center.contact
      });
    } else {
      setEditingCenter(null);
      setCenterForm({ name: '', location: '', district: '', capacity: 0, currentStock: 0, manager: '', contact: '' });
    }
    setIsCenterDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'allocated': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-100 text-red-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Resource Allocation Management</h2>
        <p className="text-gray-600">Manage emergency resources and resource centers</p>
      </div>

      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="centers">Resource Centers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resources" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Emergency Resources</h3>
              <p className="text-sm text-gray-600">Manage inventory of emergency supplies and equipment</p>
            </div>
            <Button onClick={() => openResourceDialog()} className="bg-safety-500 hover:bg-safety-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Resource Inventory
              </CardTitle>
              <CardDescription>
                Current status of all emergency resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">{resource.name}</TableCell>
                      <TableCell>{resource.type}</TableCell>
                      <TableCell>{resource.quantity}</TableCell>
                      <TableCell>{resource.unit}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(resource.status)}`}>
                          {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>{resource.lastUpdated}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openResourceDialog(resource)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteResource(resource.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
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
        
        <TabsContent value="centers" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Resource Centers</h3>
              <p className="text-sm text-gray-600">Manage distribution centers and storage facilities</p>
            </div>
            <Button onClick={() => openCenterDialog()} className="bg-safety-500 hover:bg-safety-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Resource Center
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Resource Centers
              </CardTitle>
              <CardDescription>
                Emergency resource storage and distribution centers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Center Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Capacity Usage</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resourceCenters.map((center) => {
                    const capacityPercentage = (center.currentStock / center.capacity) * 100;
                    return (
                      <TableRow key={center.id}>
                        <TableCell className="font-medium">{center.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            {center.location}
                          </div>
                        </TableCell>
                        <TableCell>{center.district}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{center.currentStock}/{center.capacity}</span>
                              <span className={`px-1 py-0.5 rounded text-xs ${getCapacityColor(capacityPercentage)}`}>
                                {capacityPercentage.toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${capacityPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{center.manager}</TableCell>
                        <TableCell>{center.contact}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openCenterDialog(center)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCenter(center.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resource Dialog */}
      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingResource ? 'Edit Resource' : 'Add New Resource'}
            </DialogTitle>
            <DialogDescription>
              {editingResource ? 'Update resource information' : 'Add a new emergency resource to the inventory'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="resource-name">Resource Name</Label>
              <Input
                id="resource-name"
                value={resourceForm.name}
                onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
                placeholder="Enter resource name"
              />
            </div>
            <div>
              <Label htmlFor="resource-type">Type</Label>
              <select
                id="resource-type"
                value={resourceForm.type}
                onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Type</option>
                <option value="Food">Food</option>
                <option value="Water">Water</option>
                <option value="Medical">Medical</option>
                <option value="Shelter">Shelter</option>
                <option value="Equipment">Equipment</option>
                <option value="Clothing">Clothing</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resource-quantity">Quantity</Label>
                <Input
                  id="resource-quantity"
                  type="number"
                  value={resourceForm.quantity}
                  onChange={(e) => setResourceForm({ ...resourceForm, quantity: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="resource-unit">Unit</Label>
                <Input
                  id="resource-unit"
                  value={resourceForm.unit}
                  onChange={(e) => setResourceForm({ ...resourceForm, unit: e.target.value })}
                  placeholder="e.g., packs, kits, bottles"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="resource-status">Status</Label>
              <select
                id="resource-status"
                value={resourceForm.status}
                onChange={(e) => setResourceForm({ ...resourceForm, status: e.target.value as 'available' | 'allocated' | 'maintenance' })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="available">Available</option>
                <option value="allocated">Allocated</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <Button 
              onClick={editingResource ? handleEditResource : handleAddResource} 
              className="w-full"
            >
              {editingResource ? 'Update Resource' : 'Add Resource'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resource Center Dialog */}
      <Dialog open={isCenterDialogOpen} onOpenChange={setIsCenterDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCenter ? 'Edit Resource Center' : 'Add New Resource Center'}
            </DialogTitle>
            <DialogDescription>
              {editingCenter ? 'Update resource center information' : 'Add a new resource storage and distribution center'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="center-name">Center Name</Label>
              <Input
                id="center-name"
                value={centerForm.name}
                onChange={(e) => setCenterForm({ ...centerForm, name: e.target.value })}
                placeholder="Enter center name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="center-location">Location</Label>
                <Input
                  id="center-location"
                  value={centerForm.location}
                  onChange={(e) => setCenterForm({ ...centerForm, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>
              <div>
                <Label htmlFor="center-district">District</Label>
                <select
                  id="center-district"
                  value={centerForm.district}
                  onChange={(e) => setCenterForm({ ...centerForm, district: e.target.value })}
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="center-capacity">Capacity</Label>
                <Input
                  id="center-capacity"
                  type="number"
                  value={centerForm.capacity}
                  onChange={(e) => setCenterForm({ ...centerForm, capacity: parseInt(e.target.value) || 0 })}
                  placeholder="Total capacity"
                />
              </div>
              <div>
                <Label htmlFor="center-stock">Current Stock</Label>
                <Input
                  id="center-stock"
                  type="number"
                  value={centerForm.currentStock}
                  onChange={(e) => setCenterForm({ ...centerForm, currentStock: parseInt(e.target.value) || 0 })}
                  placeholder="Current stock level"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="center-manager">Manager</Label>
                <Input
                  id="center-manager"
                  value={centerForm.manager}
                  onChange={(e) => setCenterForm({ ...centerForm, manager: e.target.value })}
                  placeholder="Manager name"
                />
              </div>
              <div>
                <Label htmlFor="center-contact">Contact</Label>
                <Input
                  id="center-contact"
                  value={centerForm.contact}
                  onChange={(e) => setCenterForm({ ...centerForm, contact: e.target.value })}
                  placeholder="Contact number"
                />
              </div>
            </div>
            <Button 
              onClick={editingCenter ? handleEditCenter : handleAddCenter} 
              className="w-full"
            >
              {editingCenter ? 'Update Center' : 'Add Center'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResourceAllocation;