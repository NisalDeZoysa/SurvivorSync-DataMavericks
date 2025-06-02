import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Package, MapPin, Building, Search } from 'lucide-react';
import { toast } from 'sonner';

interface ResourceAllocation {
  id: number;
  disasterId: number;
  disasterType: string;
  district: string;
  province: string;
  type: string;
  quantity: number;
  status: 'available' | 'allocated' | 'maintenance';
  lastUpdated: string;
}

interface ResourceCenter {
  id: string;
  name: string;
  location: string;
  count: number;
  used: number;
  currentStock: number;
  contact: string;
}

const ResourceAllocation = () => {
  const [resources, setResources] = useState<ResourceAllocation[]>([]);
  const [resourceCenters, setResourceCenters] = useState<ResourceCenter[]>([]);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceAllocation | null>(null);
  const [editingCenter, setEditingCenter] = useState<ResourceCenter | null>(null);
  const [centerForm, setCenterForm] = useState<Omit<ResourceCenter, 'id'>>({
    currentStock: 0,
    name: '',
    location: '',
    count: 0,
    used: 0,
    contact: ''
  });

  const [resourceForm, setResourceForm] = useState({
    disasterId: 0,
    disasterType: '',
    district: '',
    province: '',
    type: '',
    quantity: 0,
    status: 'available' as 'available' | 'allocated' | 'maintenance'
  });
  const [isCenterDialogOpen, setIsCenterDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [provinceFilter, setProvinceFilter] = useState('all');

  // Fetch resources from backend API
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('http://localhost:7000/api/allocations/summary');
        const data = await response.json();
        console.log('Fetched resources:', data);
        setResources(data);
      } catch (error) {
        console.error('Failed to fetch resources:', error);
        toast.error('Failed to load resources');
      }
    };

    fetchResources();
  }, []);

  // Fetch resource centers from backend API
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await fetch('http://localhost:7000/api/resource-centers/summary');
        const data = await response.json();
        console.log('Fetched resource centers:', data);
        const formatted = data.map((item: any) => ({
          ...item,
          id: String(item.id)
        }));
        setResourceCenters(formatted);
      } catch (error) {
        console.error('Failed to fetch resource centers:', error);
        toast.error('Failed to load resource centers');
      }
    };

    fetchCenters();
  }, []);

  const handleAddResource = async () => {
    try {
      const response = await fetch('http://localhost:7000/api/allocations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceForm),
      });

      if (response.ok) {
        // Refresh the data
        const refreshResponse = await fetch('http://localhost:7000/api/allocations/summary');
        const data = await refreshResponse.json();
        setResources(data);
        
        setResourceForm({ 
          disasterId: 0,
          disasterType: '',
          district: '',
          province: '',
          type: '', 
          quantity: 0, 
          status: 'available' 
        });
        setIsResourceDialogOpen(false);
        toast.success('Resource allocation added successfully');
      } else {
        toast.error('Failed to add resource allocation');
      }
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error('Failed to add resource allocation');
    }
  };

  const handleEditResource = async () => {
    if (!editingResource) return;

    try {
      const response = await fetch(`http://localhost:7000/api/allocations/${editingResource.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceForm),
      });

      if (response.ok) {
        // Refresh the data
        const refreshResponse = await fetch('http://localhost:7000/api/allocations/summary');
        const data = await refreshResponse.json();
        setResources(data);
        
        setEditingResource(null);
        setIsResourceDialogOpen(false);
        toast.success('Resource allocation updated successfully');
      } else {
        toast.error('Failed to update resource allocation');
      }
    } catch (error) {
      console.error('Error updating resource:', error);
      toast.error('Failed to update resource allocation');
    }
  };

  const handleDeleteResource = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:7000/api/allocations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the data
        const refreshResponse = await fetch('http://localhost:7000/api/allocations/summary');
        const data = await refreshResponse.json();
        setResources(data);
        toast.success('Resource allocation deleted successfully');
      } else {
        toast.error('Failed to delete resource allocation');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource allocation');
    }
  };

  const handleAddCenter = () => {
    const newCenter: ResourceCenter = {
      id: Date.now().toString(),
      ...centerForm
    };
    setResourceCenters([...resourceCenters, newCenter]);
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

  const openResourceDialog = (resource?: ResourceAllocation) => {
    if (resource) {
      setEditingResource(resource);
      setResourceForm({
        disasterId: resource.disasterId,
        disasterType: resource.disasterType,
        district: resource.district,
        province: resource.province,
        type: resource.type,
        quantity: resource.quantity,
        status: resource.status
      });
    } else {
      setEditingResource(null);
      setResourceForm({ 
        disasterId: 0,
        disasterType: '',
        district: '',
        province: '',
        type: '', 
        quantity: 0, 
        status: 'available' 
      });
    }
    setIsResourceDialogOpen(true);
  };

  const openCenterDialog = (center?: ResourceCenter) => {
    if (center) {
      setEditingCenter(center);
      setCenterForm({
        currentStock: center.currentStock,
        name: center.name,
        location: center.location,
        count: center.count,
        used: center.used,
        contact: center.contact
      });
    } else {
      setEditingCenter(null);
      setCenterForm({
        currentStock: 0,
        name: '',
        location: '',
        count: 0,
        used: 0,
        contact: ''
      });
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

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = 
      resource.disasterType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || resource.status === statusFilter;
    const matchesType = typeFilter === 'all' || resource.type === typeFilter;
    const matchesProvince = provinceFilter === 'all' || resource.province === provinceFilter;

    return matchesSearch && matchesStatus && matchesType && matchesProvince;
  });

  const uniqueTypes = Array.from(new Set(resources.map(r => r.type)));
  const uniqueProvinces = Array.from(new Set(resources.map(r => r.province)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Resource Allocation Management</h2>
        <p className="text-gray-600">Manage emergency resources and resource centers</p>
      </div>

      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resources">Resource Allocations</TabsTrigger>
          <TabsTrigger value="centers">Resource Centers</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Resource Allocations</h3>
              <p className="text-sm text-gray-600">Manage resource allocations for disaster response</p>
            </div>
            <Button onClick={() => openResourceDialog()} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Resource Allocation
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Resource Inventory
              </CardTitle>
              <CardDescription>
                Current status of all resource allocations
              </CardDescription>
              <div className="mt-4 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="p-2 border border-gray-300 rounded-md"
                    >
                      <option value="all">All Status</option>
                      <option value="available">Available</option>
                      <option value="allocated">Allocated</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="p-2 border border-gray-300 rounded-md"
                    >
                      <option value="all">All Types</option>
                      {uniqueTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <select
                      value={provinceFilter}
                      onChange={(e) => setProvinceFilter(e.target.value)}
                      className="p-2 border border-gray-300 rounded-md"
                    >
                      <option value="all">All Provinces</option>
                      {uniqueProvinces.map((province) => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Disaster</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Province</TableHead>
                    <TableHead>Resource Name</TableHead>
                    <TableHead>Allocated Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Allocated Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">{resource.disasterType}</TableCell>
                      <TableCell>{resource.district}</TableCell>
                      <TableCell>{resource.province}</TableCell>
                      <TableCell>{resource.type}</TableCell>
                      <TableCell>{resource.quantity}</TableCell>
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
            <Button onClick={() => openCenterDialog()} className="bg-blue-500 hover:bg-blue-600">
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
                    <TableHead>Capacity Usage</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resourceCenters.map((center) => {
                    const capacityPercentage = (center.used / center.count) * 100;
                    return (
                      <TableRow key={center.id}>
                        <TableCell className="font-medium">{center.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            {center.location}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{center.used}/{center.count}</span>
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

      {/* Resource Allocation Dialog */}
      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingResource ? 'Edit Resource Allocation' : 'Add New Resource Allocation'}
            </DialogTitle>
            <DialogDescription>
              {editingResource ? 'Update resource allocation information' : 'Add a new resource allocation for disaster response'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="disaster-id">Disaster ID</Label>
              <Input
                id="disaster-id"
                type="number"
                value={resourceForm.disasterId}
                onChange={(e) => setResourceForm({ ...resourceForm, disasterId: parseInt(e.target.value) || 0 })}
                placeholder="Enter disaster ID"
              />
            </div>
            <div>
              <Label htmlFor="disaster-type">Disaster Type</Label>
              <select
                id="disaster-type"
                value={resourceForm.disasterType}
                onChange={(e) => setResourceForm({ ...resourceForm, disasterType: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Disaster Type</option>
                <option value="HouseholdFire">Household Fire</option>
                <option value="Flood">Flood</option>
                <option value="Landslide">Landslide</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Tsunami">Tsunami</option>
                <option value="Cyclone">Cyclone</option>
                <option value="Drought">Drought</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={resourceForm.district}
                  onChange={(e) => setResourceForm({ ...resourceForm, district: e.target.value })}
                  placeholder="Enter district"
                />
              </div>
              <div>
                <Label htmlFor="province">Province</Label>
                <select
                  id="province"
                  value={resourceForm.province}
                  onChange={(e) => setResourceForm({ ...resourceForm, province: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Province</option>
                  <option value="Western Province">Western Province</option>
                  <option value="Central Province">Central Province</option>
                  <option value="Southern Province">Southern Province</option>
                  <option value="Northern Province">Northern Province</option>
                  <option value="Eastern Province">Eastern Province</option>
                  <option value="North Western Province">North Western Province</option>
                  <option value="North Central Province">North Central Province</option>
                  <option value="Uva Province">Uva Province</option>
                  <option value="Sabaragamuwa Province">Sabaragamuwa Province</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="resource-type">Resource Type</Label>
              <select
                id="resource-type"
                value={resourceForm.type}
                onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Type</option>
                <option value="Human">Human</option>
                <option value="Material">Material</option>
                <option value="Food">Food</option>
                <option value="Water">Water</option>
                <option value="Medical">Medical</option>
                <option value="Shelter">Shelter</option>
                <option value="Equipment">Equipment</option>
                <option value="Clothing">Clothing</option>
              </select>
            </div>
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
              {editingResource ? 'Update Resource Allocation' : 'Add Resource Allocation'}
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
              {editingCenter
                ? 'Update the resource center information.'
                : 'Fill in the details to create a new resource center.'}
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

            <div>
              <Label htmlFor="center-location">Location</Label>
              <Input
                id="center-location"
                value={centerForm.location}
                onChange={(e) => setCenterForm({ ...centerForm, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="center-count">Total Resources</Label>
                <Input
                  id="center-count"
                  type="number"
                  value={centerForm.count}
                  onChange={(e) =>
                    setCenterForm({ ...centerForm, count: parseInt(e.target.value) || 0 })
                  }
                  placeholder="Total available resources"
                />
              </div>

              <div>
                <Label htmlFor="center-used">Used Resources</Label>
                <Input
                  id="center-used"
                  type="number"
                  value={centerForm.used}
                  onChange={(e) =>
                    setCenterForm({ ...centerForm, used: parseInt(e.target.value) || 0 })
                  }
                  placeholder="Resources currently used"
                />
              </div>
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

            <div className="text-sm text-gray-500">
              Capacity Usage:{' '}
              {centerForm.count > 0
                ? `${Math.min((centerForm.used / centerForm.count) * 100, 100).toFixed(1)}%`
                : '0%'}
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