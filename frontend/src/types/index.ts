
export enum UserRole {
  USER = "user",
  FIRST_RESPONDER = "first_responder",
  VOLUNTEERS = "Volunteers"
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

export enum DisasterType {
  FLOOD = "flood",
  FIRE = "fire",
  EARTHQUAKE = "earthquake",
  LANDSLIDE = "landslide",
  TSUNAMI = "tsunami",
  HURRICANE = "hurricane",
  OTHER = "other"
}

export enum DisasterSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

export interface Disaster {
  id: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
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
  status: "pending" | "in-progress" | "resolved";
}
