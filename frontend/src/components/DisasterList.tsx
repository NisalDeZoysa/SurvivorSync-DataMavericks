import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Search,
  MapPin,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Disaster, DisasterSeverity, DisasterType, ApiDisaster } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import io from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { PDFDownloadLink } from "@react-pdf/renderer";
import EmergencyReportPDF from "./EmergencyReportPDF";

const DisasterList: React.FC = () => {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const { currentUser } = useAuth();

  const fetchDisasters = async () => {
    try {
      const token = localStorage.getItem("token"); // Get auth token

      // Determine endpoint based on user role
      let apiUrl;
      if (
        currentUser.role === "admin" ||
        currentUser.role === "first_responder"
      ) {
        apiUrl = "http://localhost:7000/api/requests";
      } else {
        // Use current user's ID for non-admin/non-responder
        apiUrl = `http://localhost:7000/api/requests/userId?id=${currentUser.id}`;
      }

      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch disasters");
      }

      const apiData: ApiDisaster[] = await response.json();

      console.log("Fetched disasters:", apiData);

      // Transform API data to match frontend Disaster type
      const transformedData: Disaster[] = apiData.map((item) => ({
        id: item.id.toString(),
        location: {
          latitude: parseFloat(item.latitude),
          longitude: parseFloat(item.longitude),
          address: `${item.district}, ${item.province}`,
        },
        timestamp: item.created_at,
        type: mapDisasterType(item.disasterId),
        name: item.name,
        severity: item.severity as DisasterSeverity,
        details: item.details,
        affectedCount: item.affectedCount,
        contactNo: item.contactNo,
        status: item.status.toLowerCase(),
      }));

      setDisasters(transformedData);
    } catch (err) {
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch disasters from API
  useEffect(() => {
    fetchDisasters();

    // Setup socket connection
    const newSocket = io("http://localhost:7000", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    // Listen for disaster updates
    newSocket.on("disasterStatsUpdated", () => {
      console.log("Received update notification - refreshing data...");
      fetchDisasters();
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

  // Map backend disasterId to DisasterType
  const mapDisasterType = (disasterId: number): DisasterType => {
    const map: Record<number, DisasterType> = {
      1: DisasterType.FLOOD,
      2: DisasterType.EARTHQUAKE,
      3: DisasterType.HOUSEHOLDFIRE,
      4: DisasterType.WILDFIRE,
      5: DisasterType.TSUNAMI,
      6: DisasterType.OTHER,
    };

    return map[disasterId] || DisasterType.OTHER;
  };

  const filteredDisasters = disasters
    .filter((disaster) => {
      // Search filter
      const searchFilter = searchTerm
        ? disaster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          disaster.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
          disaster.location.address
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true;

      // Type filter
      const typeFilter =
        filterType !== "all" ? String(disaster.type) === filterType : true;

      // Status filter
      const statusFilter =
        filterStatus !== "all" ? disaster.status === filterStatus : true;

      // Severity filter
      const severityFilter =
        filterSeverity !== "all" ? disaster.severity === filterSeverity : true;

      return searchFilter && typeFilter && statusFilter && severityFilter;
    })
    .sort((a, b) => {
      // Sort by timestamp, newest first
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "VERIFIED":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "IN_PROGRESS":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: DisasterSeverity) => {
    switch (severity) {
      case DisasterSeverity.LOW:
        return "bg-blue-100 text-blue-800";
      case DisasterSeverity.MEDIUM:
        return "bg-yellow-100 text-yellow-800";
      case DisasterSeverity.HIGH:
        return "bg-orange-100 text-orange-800";
      case DisasterSeverity.CRITICAL:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper to get disaster type name
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

  const getTypeIcon = (type: DisasterType) => {
    switch (type) {
      case DisasterType.HOUSEHOLDFIRE:
        return "🔥🏚️";
      case DisasterType.FLOOD:
        return "🌊";
      case DisasterType.WILDFIRE:
        return "🔥";
      case DisasterType.TSUNAMI:
        return "🌊";
      case DisasterType.EARTHQUAKE:
        return "⛰️";
      default:
        return "⚠️";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emergency-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search emergencies..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-1 gap-2">
          <div className="w-1/3">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={DisasterType.FLOOD.toString()}>
                  Flood
                </SelectItem>
                <SelectItem value={DisasterType.EARTHQUAKE.toString()}>
                  Earthquake
                </SelectItem>
                <SelectItem value={DisasterType.HOUSEHOLDFIRE.toString()}>
                  Household Fire
                </SelectItem>
                <SelectItem value={DisasterType.WILDFIRE.toString()}>
                  Wild Fire
                </SelectItem>
                <SelectItem value={DisasterType.TSUNAMI.toString()}>
                  Tsunami
                </SelectItem>
                {/* <SelectItem value={DisasterType.TORNADO.toString()}>Hurricane</SelectItem> */}
                <SelectItem value={DisasterType.OTHER.toString()}>
                  Other
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-1/3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-1/3">
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value={DisasterSeverity.LOW}>Low</SelectItem>
                <SelectItem value={DisasterSeverity.MEDIUM}>Medium</SelectItem>
                <SelectItem value={DisasterSeverity.HIGH}>High</SelectItem>
                <SelectItem value={DisasterSeverity.CRITICAL}>
                  Critical
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Emergency Reports</h2>

        {filteredDisasters.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <AlertTriangle className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No emergencies found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No emergency reports match your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDisasters.map((disaster) => (
              <Card key={disaster.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        <span>{getTypeIcon(disaster.type)} </span>
                        <span> {getDisasterTypeName(disaster.type)}</span>
                      </CardTitle>
                      <CardDescription>
                        {disaster.location.address || "No address provided"}
                      </CardDescription>
                    </div>
                    <Badge className={getSeverityColor(disaster.severity)}>
                      {disaster.severity.charAt(0).toUpperCase() +
                        disaster.severity.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">Requester Name:</span>
                        <span className="ml-1">
                          {String(disaster.name)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">
                          Affected:
                        </span>
                        <span className="ml-1">
                          {disaster.affectedCount} people
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">
                          Reported:
                        </span>
                        <span className="ml-1">
                          {formatTime(disaster.timestamp)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">
                          Contact:
                        </span>
                        <span className="ml-1">
                          {disaster.contactNo || "N/A"}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm line-clamp-2">{disaster.details}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <div className="flex items-center gap-1 text-sm">
                    {getStatusIcon(disaster.status)}
                    <span className="capitalize">{disaster.status}</span>
                  </div>
                  <div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedDisaster(disaster)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

{/* PDF Download button, should remove from here */}
      {/* <PDFDownloadLink
        document={<EmergencyReportPDF disasters={filteredDisasters} />}
        fileName="emergency-reports.pdf"
      >
        {({ loading }) => (
          <Button variant="outline">
            {loading ? "Preparing PDF..." : "Download All as PDF"}
          </Button>
        )}
      </PDFDownloadLink> */}

      {/* Detailed View Dialog */}
      <Dialog
        open={!!selectedDisaster}
        onOpenChange={() => setSelectedDisaster(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedDisaster && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <span className="text-2xl">
                    {getTypeIcon(selectedDisaster.type)}
                  </span>
                  {selectedDisaster.name}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedDisaster.location.address}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatTime(selectedDisaster.timestamp)}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <Badge
                    className={getSeverityColor(selectedDisaster.severity)}
                  >
                    {selectedDisaster.severity} severity
                  </Badge>
                  <Badge
                    className={getSeverityColor(selectedDisaster.severity)}
                  >
                    {selectedDisaster.status}
                  </Badge>
                </div>

                <div className="prose prose-sm">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedDisaster.details}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Affected People:
                    </span>
                    <p className="text-lg font-semibold">
                      {selectedDisaster.affectedCount}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Emergency Contact:
                    </span>
                    <p className="text-lg font-semibold">
                      {selectedDisaster.contactNo}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Disaster Type:
                    </span>
                    <p className="text-lg font-semibold capitalize">
                      {selectedDisaster.type}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Reported:
                    </span>
                    <p className="text-lg font-semibold">
                      {new Date(selectedDisaster.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDisaster(null)}
                  >
                    Close
                  </Button>
                  <Button className="bg-emergency-500 hover:bg-emergency-600">
                    Contact Emergency Services
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DisasterList;
