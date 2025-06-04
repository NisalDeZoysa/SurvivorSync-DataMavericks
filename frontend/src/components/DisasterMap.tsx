import React, { useEffect, useState ,useRef } from 'react';
import { MapPin, AlertTriangle, Flame, Waves, Mountain } from 'lucide-react';
import { Disaster, DisasterType, DisasterSeverity, ApiDisaster, APIResourceCenter, ResourceAvailability } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import flood from '../assets/flood.png';
import fire from '../assets/fire.png';
import other from '../assets/other.png';
import landslide from '..//assets/landslide.png';
import shelterIconUrl from '../assets/shelter.svg';

const apikey = import.meta.env.VITE_MAP_API_KEY;
 

const DisasterMap: React.FC = () => {
  const [hoveredDisaster, setHoveredDisaster] = useState<Disaster | null>(null);
  const [hoveredShelter, setHoveredShelter] = useState<ResourceAvailability | null>(null);
  const [selectedShelter, setSelectedShelter] = useState<ResourceAvailability | null>(null);
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null);
  const [currentLocation, setCurrentLocation] = useState({
    lat: 7.1,
    lng: 80.636696,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [shelter, setShelter] = useState<ResourceAvailability[]>([]);

  

  const mapDisasterType = (disasterId: number): DisasterType => {
      const map: Record<number, DisasterType> = {
        1: DisasterType.FLOOD,
        2: DisasterType.EARTHQUAKE,
        3: DisasterType.HOUSEHOLDFIRE,
        4: DisasterType.WILDFIRE,
        5: DisasterType.TSUNAMI,
        6: DisasterType.OTHER
      };     
      return map[disasterId] || DisasterType.OTHER;
  };
  


 const getDisasterIcon = (type: DisasterType) => {
    switch (type) {
      case DisasterType.HOUSEHOLDFIRE || DisasterType.WILDFIRE: 
        return <Flame className="h-6 w-6 text-red-500" />;
      case DisasterType.FLOOD:
        return <Waves className="h-6 w-6 text-blue-500" />;
      case DisasterType.EARTHQUAKE:
        return <Mountain className="h-6 w-6 text-orange-500" />;
      case DisasterType.TSUNAMI:
        return <MapPin className="h-6 w-6 text-indigo-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getSeverityColor = (severity: DisasterSeverity) => {
    switch (severity) {
      case DisasterSeverity.LOW:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case DisasterSeverity.MEDIUM:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case DisasterSeverity.HIGH:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case DisasterSeverity.CRITICAL:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'in-progress':
        return "bg-blue-100 text-blue-800";
      case 'resolved':
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

    const getResourceTypeColor = (status: string) => {
    switch (status) {
      case 'Human':
        return "bg-yellow-100 text-yellow-800";
      case 'Material':
        return "bg-blue-100 text-blue-800";
      case 'Financial':
        return "bg-green-100 text-green-800";
      case 'Equipment':
        return "bg-purple-100 text-purple-800";
      case 'Facility':
        return "bg-orange-100 text-orange-800";
      case 'Infrastructure':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

    const getDisasterTypeName = (type: DisasterType): string => {
      switch (type) {
        case DisasterType.FLOOD:
          return "Flood";
        case DisasterType.EARTHQUAKE:
          return "Earthquake";
        case DisasterType.HOUSEHOLDFIRE:
          return "Household Fire";
        case DisasterType.WILDFIRE:
          return "Wildfire";
        case DisasterType.TSUNAMI:
          return "Tsunami";
        case DisasterType.OTHER:
          return "Other";
        default:
          return "Unknown";
      }
    };


    const fetchVerifidDisasters = async () => {
        try {
                const token = localStorage.getItem('token'); // Get auth token
                const response = await fetch('http://localhost:7000/api/requests/verified', {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                
                if (!response.ok) {
                  throw new Error('Failed to fetch disasters');
                }
                
                const apiData: ApiDisaster[] = await response.json();
                
                // Transform API data to match frontend Disaster type
                const transformedData: Disaster[] = apiData.map(item => ({
                  id: item.id.toString(),
                  location: {
                    latitude: parseFloat(item.latitude),
                    longitude: parseFloat(item.longitude),
                    address: `${item.district}, ${item.province}`
                  },
                  timestamp: item.created_at,
                  type: mapDisasterType(item.disasterId),
                  name: item.name,
                  severity: item.severity as DisasterSeverity,
                  details: item.details,
                  affectedCount: item.affectedCount,
                  contactNo: item.contactNo,
                  status: item.status.toLowerCase()
                }));
                
                setDisasters(transformedData);
                console.log("Fetched disasters:", transformedData);
              } catch (err) {
                setError(err.message || 'An error occurred while fetching data');
              } finally {
                setIsLoading(false);
              }
      }

  const fetchAllShelters = async () => {
    try {
          const token = localStorage.getItem('token'); // Get auth token
            const response = await fetch('http://localhost:7000/api/resource-centers', {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
            });
                
            if (!response.ok) {
              throw new Error('Failed to fetch disasters');
            }
                
            const apiData: APIResourceCenter[] = await response.json();              
            // Transform API data to match frontend Disaster type
            const transformedData: ResourceAvailability[] = apiData.map(item => ({
                  id: item.id.toString(),
                  resourceId: item.resourceId,
                  lat: item.lat,
                  long: item.long,
                  count: item.count,
                  contactNumber: item.contactNumber,
                  name: item.Resource.name,
                  type: item.Resource.type,
            }));
                
            setShelter(transformedData);
            console.log("Fetched all resource center:", transformedData);
              
          } catch (err) {
            setError(err.message || 'An error occurred while fetching data');
              
          } finally {
            setIsLoading(false);
          }

  }

    // Create icon objects safely

  useEffect(() => {
    if (!disasters){
      setIsLoading(true);
    }
    fetchVerifidDisasters();
    fetchAllShelters();
  }, []);

  return (
    <div className="space-y-6">
      {/* Simple Map Representation */}
      <div className="relative w-full h-100 bg-gradient-to-b from-blue-100 to-green-100 rounded-lg border-2 border-gray-200 overflow-hidden">

        <APIProvider apiKey={apikey}>
              <div className="w-full h-[80vh]">
                <Map defaultZoom={8} defaultCenter={currentLocation}>
                  {/* Disaster Markers */}
                  {disasters.map((disaster) => (
                    <Marker
                      key={disaster.id}
                      position={{
                          lat: disaster.location.latitude,
                          lng: disaster.location.longitude,
                        }}
                      onMouseOver={() => setHoveredDisaster(disaster)}
                      onMouseOut={() => setHoveredDisaster(null)}
                      onClick={() => setSelectedDisaster(disaster)}
                      // icon={getDisasterMarker(disaster.type)}             
                    >
                     
                    </Marker>
                  ))}

                  {/* Disaster Markers */}
                  {shelter.map((shelter) => (
                    <Marker                 
                      key={shelter.id}
                      position={{
                          lat: shelter.lat,
                          lng: shelter.long
                        }}
                      onMouseOver={() => setHoveredShelter(shelter)}
                      onMouseOut={() => setHoveredShelter(null)}
                      onClick={() => setSelectedShelter(shelter)}
                                 
                    >
                    </Marker>
                  ))}
                </Map>
              </div>
            </APIProvider>
        
  

        {/* Hover Tooltip */}
        {hoveredDisaster && (
          <div 
            className="absolute z-20 bg-white p-3 rounded-lg shadow-lg border max-w-xs pointer-events-none top-10 left-1/2 transform -translate-x-1/2"
          >
            <h4 className="font-semibold text-sm mb-1">{getDisasterTypeName(hoveredDisaster.type)}</h4>
            <p className="text-xs text-gray-600 mb-2">{hoveredDisaster.location.address}</p>
            <div className="flex gap-2">
              <Badge className={getSeverityColor(hoveredDisaster.severity)}>
                {hoveredDisaster.severity}
              </Badge>
              <Badge className={getStatusColor(hoveredDisaster.status)}>
                {hoveredDisaster.status}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Affected: {hoveredDisaster.affectedCount} people
            </p>
          </div>
        )}
      </div>

      {/* Selected Shelter Details */}
        {hoveredShelter && (
            <div 
              className="absolute z-20 bg-white p-3 rounded-lg shadow-lg border max-w-xs pointer-events-none top-10 left-1/2 transform -translate-x-1/2"
            >
              <h4 className="font-semibold text-sm mb-1">{hoveredShelter.name}</h4>
            <div className="mx-auto">
              <Badge className={getResourceTypeColor(hoveredShelter.type)}>
                {hoveredShelter.type}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Resources count: {hoveredShelter.count} 
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Contact: {hoveredShelter.contactNumber}
            </p>
          </div>
        )}

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-red-500" />
          <span className="text-sm">Fire</span>
        </div>
        <div className="flex items-center gap-2">
          <Waves className="h-5 w-5 text-blue-500" />
          <span className="text-sm">Flood</span>
        </div>
        <div className="flex items-center gap-2">
          <Mountain className="h-5 w-5 text-orange-500" />
          <span className="text-sm">Landslide</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-indigo-500" />
          <span className="text-sm">Other</span>
        </div>
      </div>

      {/* Selected Disaster Details */}
      {selectedDisaster && (
        <Card className="border-l-4 border-l-emergency-500">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getDisasterIcon(selectedDisaster.type)}
                  {getDisasterTypeName(selectedDisaster.type)}
                </CardTitle>
                <CardDescription>{selectedDisaster.location.address}</CardDescription>
              </div>
              <button 
                onClick={() => setSelectedDisaster(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Badge className={getSeverityColor(selectedDisaster.severity)}>
                  {selectedDisaster.severity} severity
                </Badge>
                <Badge className={getStatusColor(selectedDisaster.status)}>
                  {selectedDisaster.status}
                </Badge>
              </div>
              <p className="text-sm">{selectedDisaster.details}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Affected:</span> {selectedDisaster.affectedCount} people
                </div>
                <div>
                  <span className="font-medium">Emergency Contact:</span> {selectedDisaster.contactNo}
                </div>
                <div>
                  <span className="font-medium">Reported:</span> {new Date(selectedDisaster.timestamp).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {selectedDisaster.type}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Shelter */}
      {selectedShelter && (
        <Card className="border-l-4 border-l-emergency-500">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <img src={shelterIconUrl} alt="Shelter Icon" className="h-6 w-6" />
                  {selectedShelter.name}
                </CardTitle>
                <CardDescription>{selectedShelter.type}</CardDescription>
              </div>
              <button 
                onClick={() => setSelectedShelter(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm">Available Resources: {selectedShelter.count}</p>
              <p className="text-sm">Contact: {selectedShelter.contactNumber}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DisasterMap;