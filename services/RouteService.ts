import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'react-native-uuid';
import { Destination, RouteData, NavigationStep } from '@/types/navigation';
import destinationsData from '@/data/destinations.json';

const STORAGE_KEY = 'guia_facil_routes';

export class RouteService {
  static async initializeDefaultData(): Promise<void> {
    try {
      const existingData = await AsyncStorage.getItem(STORAGE_KEY);
      if (!existingData) {
        const initialData: RouteData = {
          destinations: destinationsData.destinations as Destination[],
          version: destinationsData.version,
          lastUpdated: destinationsData.lastUpdated,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      }
    } catch (error) {
      console.error('Erro ao inicializar dados padrão:', error);
    }
  }

  static async getDestinations(): Promise<Destination[]> {
    try {
      await this.initializeDefaultData();
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const routeData: RouteData = JSON.parse(data);
        return routeData.destinations;
      }
      return [];
    } catch (error) {
      console.error('Erro ao carregar destinos:', error);
      return [];
    }
  }

  static async getDestinationById(id: string): Promise<Destination | null> {
    try {
      const destinations = await this.getDestinations();
      return destinations.find(dest => dest.id === id) || null;
    } catch (error) {
      console.error('Erro ao buscar destino:', error);
      return null;
    }
  }

  static async addDestination(destination: Omit<Destination, 'id'>): Promise<void> {
    try {
      const destinations = await this.getDestinations();
      const newDestination: Destination = {
        ...destination,
        id: uuidv4() as string,
      };
      
      destinations.push(newDestination);
      await this.saveDestinations(destinations);
    } catch (error) {
      console.error('Erro ao adicionar destino:', error);
      throw error;
    }
  }

  static async updateDestination(id: string, updates: Partial<Destination>): Promise<void> {
    try {
      const destinations = await this.getDestinations();
      const index = destinations.findIndex(dest => dest.id === id);
      
      if (index !== -1) {
        destinations[index] = { ...destinations[index], ...updates };
        await this.saveDestinations(destinations);
      }
    } catch (error) {
      console.error('Erro ao atualizar destino:', error);
      throw error;
    }
  }

  static async deleteDestination(id: string): Promise<void> {
    try {
      const destinations = await this.getDestinations();
      const filteredDestinations = destinations.filter(dest => dest.id !== id);
      await this.saveDestinations(filteredDestinations);
    } catch (error) {
      console.error('Erro ao excluir destino:', error);
      throw error;
    }
  }

  private static async saveDestinations(destinations: Destination[]): Promise<void> {
    try {
      const routeData: RouteData = {
        destinations,
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(routeData));
    } catch (error) {
      console.error('Erro ao salvar destinos:', error);
      throw error;
    }
  }

  static async exportData(): Promise<RouteData> {
    try {
      const destinations = await this.getDestinations();
      return {
        destinations,
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw error;
    }
  }

  static async importData(data: RouteData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      throw error;
    }
  }

  // Método para calcular proximidade baseado em Wi-Fi fingerprinting
  static calculateWiFiProximity(currentSignals: Record<string, number>, targetFingerprint: Record<string, number>): number {
    let totalDifference = 0;
    let matchingSignals = 0;

    for (const [bssid, targetDbm] of Object.entries(targetFingerprint)) {
      if (currentSignals[bssid]) {
        const difference = Math.abs(currentSignals[bssid] - targetDbm);
        totalDifference += difference;
        matchingSignals++;
      }
    }

    if (matchingSignals === 0) return Infinity;
    
    // Retorna a diferença média - quanto menor, mais próximo
    return totalDifference / matchingSignals;
  }

  // Método para encontrar a localização mais próxima baseada em sensores
  static async findNearestLocation(
    gpsCoords?: { lat: number; lng: number },
    wifiSignals?: Record<string, number>
  ): Promise<Destination | null> {
    try {
      const destinations = await this.getDestinations();
      let bestMatch: Destination | null = null;
      let bestScore = Infinity;

      for (const destination of destinations) {
        let score = 0;

        // Calcular score baseado em Wi-Fi (mais preciso para indoor)
        if (wifiSignals && destination.wifi) {
          const wifiFingerprint: Record<string, number> = {};
          destination.wifi.forEach(wifi => {
            wifiFingerprint[wifi.mac] = wifi.dbm;
          });
          
          const wifiScore = this.calculateWiFiProximity(wifiSignals, wifiFingerprint);
          score += wifiScore * 0.7; // Wi-Fi tem peso maior para indoor
        }

        // Calcular score baseado em GPS (para outdoor e backup)
        if (gpsCoords && destination.gps) {
          const distance = this.calculateGPSDistance(
            gpsCoords.lat, gpsCoords.lng,
            destination.gps.lat, destination.gps.lng
          );
          score += distance * 0.3; // GPS tem peso menor para indoor
        }

        if (score < bestScore) {
          bestScore = score;
          bestMatch = destination;
        }
      }

      return bestMatch;
    } catch (error) {
      console.error('Erro ao encontrar localização mais próxima:', error);
      return null;
    }
  }

  // Calcular distância GPS usando fórmula de Haversine
  private static calculateGPSDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distância em metros
  }
}