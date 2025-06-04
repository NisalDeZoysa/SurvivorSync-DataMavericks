export enum UserRole {
  USER = "user",
  FIRST_RESPONDER = "first_responder",
  VOLUNTEERS = "Volunteers",
  ADMIN = "admin"
}

export enum FirstResponderStatus {
  PENDING = "PEDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED"
}

// 'Police', 'Army', 'Hospital', 'Redcross', 'NGO', 'Government', 'Other'
export enum FirstResponderTypes{
  POLICE = "Police",
  ARMY = "Army",
  HOSPITAL = "Hospital",
  REDCROSS = "Redcross",
  NGO = "NGO",
  GOVERNMENT = "Government",
  OTHER = "Other"
}


export interface FirstResponder {
  id: number;
  resourceCenterId: number;
  name: string;
  nic: string;
  contactNumber: string;
  email: string;
  type: FirstResponderTypes;
  password: string;
  is_verified: FirstResponderStatus;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  nic?: string;
  address?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  contactNo?: string;
}


export interface Resource_Center{
  id: number;
  name: string;
  resourceId: number;
  lat: number;
  long: number;
  district: string;
  province: string;
  count: number;
  used: number;
  contactNumber: string;
}


export enum DisasterType {
  FLOOD = 1,
  EARTHQUAKE = 2,
  HOUSEHOLDFIRE = 3,
  WILDFIRE = 4,
  TSUNAMI = 5,
  OTHER = 6,
  // LANDSLIDE,
  // FIRE,
  // LANDSLIDE,
  // FIRE
}

export enum DisasterSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

interface Location {
    latitude: number;
    longitude: number;
    address: string;
}

export interface ResourceCenter {
  id: string;
  name: string;
  location: Location;
  capacity: number;
  currentOccupancy: number;
  contactNo?: string;
  images?: string[];
  description?: string;
  status: "open" | "closed" | "under_maintenance";
  reportedBy?: string; // User ID if logged in, otherwise null for anonymous
}


export interface APIResourceCenter {
  id: string;
  resourceId: number;
  lat: number;
  long: number;
  count: number;
  contactNumber: string;
  createdAt: string;
  updatedAt: string;
  resourceCenterId: number | null;
  Resource: Resource;
}

// New interfaces added below
export interface Resource {
  id: number;
  type: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}


export interface ResourceAvailability {
  id: string;
  resourceId: number;
  lat: number;
  long: number;
  count: number;
  contactNumber: string;
  name: Resource["name"];
  type: Resource["type"];
}


export interface Disaster {
  id: string;
  location: Location;
  timestamp: string;
  type: DisasterType;
  name: string;
  severity: DisasterSeverity;
  details: string;
  affectedCount: number;
  contactNo?: string;
  images?: string[];
  audioRecording?: string;
  reportedBy?: string; // User ID if logged in, otherwise null for anonymous
  status: string;
}

// Disaster API response interface
export interface ApiDisaster {
  id: number;
  name: string;
  userId: number;
  disasterId: number;
  severity: string;
  status: string;
  details: string;
  affectedCount: number;
  contactNo: string;
  latitude: string;
  longitude: string;
  district: string;
  province: string;
  image: string | null;
  voice: string | null;
  isVerified: boolean;
  created_at: string;
  updated_at: string;
}

export enum AssignmentStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

export interface Assignment {
  id: string;
  disasterId: string;
  volunteerId: string;
  assignedBy: string; // User ID of first responder or admin
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: AssignmentStatus;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  assignedAt: string;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
}

export interface FieldObservation {
  id: string;
  assignmentId: string;
  volunteerId: string;
  timestamp: string;
  description: string;
  images?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  severity?: DisasterSeverity;
  additionalNotes?: string;
}
