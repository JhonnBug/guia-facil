export interface NavigationStep {
  instruction: string;
  rotation: number; // degrees: 0=North, 90=East, -90=West, 180=South
  detail: string;
}

export interface WiFiReference {
  mac: string;
  dbm: number;
}

export interface GPSCoordinates {
  lat: number;
  lng: number;
}

export interface Destination {
  id: string;
  name: string;
  gps?: GPSCoordinates;
  wifi?: WiFiReference[];
  steps: NavigationStep[];
}

export interface RouteData {
  destinations: Destination[];
  version: string;
  lastUpdated: string;
}