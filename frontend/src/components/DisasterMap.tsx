import React, { useState } from 'react';
import { MapPin, AlertTriangle, Flame, Waves, Mountain } from 'lucide-react';
import { Disaster, DisasterType, DisasterSeverity } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

const apikey = import.meta.env.VITE_MAP_API_KEY;

// Mock disaster data for the map
const mockMapDisasters: Disaster[] = [
  {
    id: '1',
    location: {
      latitude: 7.8731,
      longitude: 80.7718,
      address: 'Colombo 03, Sri Lanka'
    },
    timestamp: new Date().toISOString(),
    type: DisasterType.FLOOD,
    name: 'Severe Flooding in Colombo',
    severity: DisasterSeverity.HIGH,
    details: 'Heavy rainfall has caused severe flooding in downtown Colombo. Multiple streets are underwater and evacuation is in progress.',
    affectedCount: 150,
    contactNo: '119',
    status: 'in-progress'
  },
  {
    id: '2',
    location: {
      latitude: 6.9271,
      longitude: 79.8612,
      address: 'Kandy, Sri Lanka'
    },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: DisasterType.FIRE,
    name: 'Commercial Building Fire',
    severity: DisasterSeverity.CRITICAL,
    details: 'Large fire engulfing a commercial complex in Kandy city center. Fire department on scene with multiple units.',
    affectedCount: 85,
    contactNo: '110',
    status: 'in-progress'
  },
  {
    id: '3',
    location: {
      latitude: 6.0535,
      longitude: 80.2210,
      address: 'Galle, Sri Lanka'
    },
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    type: DisasterType.LANDSLIDE,
    name: 'Landslide Risk Alert',
    severity: DisasterSeverity.MEDIUM,
    details: 'Unstable soil conditions detected on hillside. Residents in the area have been advised to remain alert.',
    affectedCount: 200,
    contactNo: '117',
    status: 'pending'
  },
  {
    id: '4',
    location: {
      latitude: 9.6615,
      longitude: 80.0255,
      address: 'Jaffna, Sri Lanka'
    },
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    type: DisasterType.TSUNAMI,
    name: 'Tsunami Warning Lifted',
    severity: DisasterSeverity.LOW,
    details: 'Tsunami warning has been lifted. Coastal areas are now safe for return.',
    affectedCount: 500,
    contactNo: '118',
    status: 'resolved'
  }
];

const DisasterMap: React.FC = () => {
  const [hoveredDisaster, setHoveredDisaster] = useState<Disaster | null>(null);
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null);
  const [currentLocation, setCurrentLocation] = useState({
    lat: 7.1,
    lng: 80.636696,
  });

  const getDisasterIcon = (type: DisasterType) => {
    switch (type) {
      case DisasterType.FIRE:
        return <Flame className="h-6 w-6 text-red-500" />;
      case DisasterType.FLOOD:
        return <Waves className="h-6 w-6 text-blue-500" />;
      case DisasterType.LANDSLIDE:
        return <Mountain className="h-6 w-6 text-orange-500" />;
      case DisasterType.TSUNAMI:
        return <Waves className="h-6 w-6 text-indigo-500" />;
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

  return (
    <div className="space-y-6">
      {/* Simple Map Representation */}
      <div className="relative w-full h-100 bg-gradient-to-b from-blue-100 to-green-100 rounded-lg border-2 border-gray-200 overflow-hidden">
        {/* <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div> */}

        <APIProvider apiKey={apikey}>
              <div className="w-full h-[80vh]">
                <Map defaultZoom={7} defaultCenter={currentLocation}>
                  {/* {showShelters &&
                    shelters.map((shelter, index) => (
                      <Marker
                        key={index}
                        position={{
                          lat: shelter.locationLatLang[0].latitude,
                          lng: shelter.locationLatLang[0].longitude,
                        }}
                        onClick={() => handleMarkerClick(shelter)}
                        icon={shelterIcon}
                      />
                    ))}

                  {showTraffic &&
                    traffics.map((traffic, index) => (
                      <Marker
                        key={index}
                        position={{
                          lat: traffic.closeLatLang[0].latitude,
                          lng: traffic.closeLatLang[0].longitude,
                        }}
                        icon={trafficIcon}
                      />
                    ))} */}
                </Map>
              </div>
            </APIProvider>
        
        {/* Map Title */}
        {/* <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md">
          <h3 className="font-semibold text-sm">Sri Lanka - Live Disaster Map</h3>
        </div> */}

        {/* Disaster Markers */}
        {mockMapDisasters.map((disaster) => (
          <div
            key={disaster.id}
            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
              left: `${((disaster.location.longitude - 79.5) / 2) * 100 + 50}%`,
              top: `${((8.5 - disaster.location.latitude) / 4) * 100 + 20}%`
            }}
            onMouseEnter={() => setHoveredDisaster(disaster)}
            onMouseLeave={() => setHoveredDisaster(null)}
            onClick={() => setSelectedDisaster(disaster)}
          >
            <div className={`relative p-2 bg-white rounded-full shadow-lg border-2 hover:scale-110 transition-transform ${
              disaster.status === 'resolved' ? 'opacity-60' : ''
            }`}>
              {getDisasterIcon(disaster.type)}
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                disaster.severity === DisasterSeverity.CRITICAL ? 'bg-red-500' :
                disaster.severity === DisasterSeverity.HIGH ? 'bg-orange-500' :
                disaster.severity === DisasterSeverity.MEDIUM ? 'bg-yellow-500' : 'bg-blue-500'
              }`}></div>
            </div>
          </div>
        ))}

        {/* Hover Tooltip */}
        {hoveredDisaster && (
          <div 
            className="absolute z-20 bg-white p-3 rounded-lg shadow-lg border max-w-xs pointer-events-none"
            style={{
              left: `${((hoveredDisaster.location.longitude - 79.5) / 2) * 100 + 55}%`,
              top: `${((8.5 - hoveredDisaster.location.latitude) / 4) * 100 + 15}%`
            }}
          >
            <h4 className="font-semibold text-sm mb-1">{hoveredDisaster.name}</h4>
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
          <Waves className="h-5 w-5 text-indigo-500" />
          <span className="text-sm">Tsunami</span>
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
                  {selectedDisaster.name}
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
    </div>
  );
};

export default DisasterMap;