export interface NavigationStep {
  instruction: string;
  rotation: number; // degrees: 0=North, 90=East, -90=West, 180=South
  detail: string;
  distance_meters?: number;
}

export interface WiFiReference {
  mac: string;
  dbm: number;
}

export interface GPSCoordinates {
  lat: number;
  lng: number;
}

export interface DestinationDetails {
  capacity?: number;
  equipment?: string;
  responsible?: string;
  hours?: string;
  accessibility?: string;
  features?: string;
  floor?: number;
}

export interface Destination {
  id: string;
  name: string;
  type: 'room' | 'restroom' | 'lab' | 'recreation' | 'auditorium' | 'office' | 'library' | 'entrance' | 'hallway';
  coordinates?: GPSCoordinates;
  wifi_fingerprint?: Record<string, number>;
  connections?: string[];
  details?: DestinationDetails;
  gps?: GPSCoordinates;
  wifi?: WiFiReference[];
  steps: NavigationStep[];
}

export interface RouteData {
  destinations: Destination[];
  version: string;
  lastUpdated: string;
}