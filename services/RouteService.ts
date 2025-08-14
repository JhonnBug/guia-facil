import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'react-native-uuid';
import { Destination, RouteData, NavigationStep } from '@/types/navigation';

const STORAGE_KEY = 'guia_facil_routes';

const DEFAULT_DESTINATIONS: Destination[] = [
  {
    id: 'room01',
    name: 'Sala 01',
    gps: { lat: -2.52945, lng: -44.30450 },
    wifi: [
      { mac: 'AA:BB:CC:DD:EE:01', dbm: -50 },
      { mac: 'AA:BB:CC:DD:EE:02', dbm: -60 }
    ],
    steps: [
      {
        instruction: 'Siga em frente acompanhando o piso tátil',
        rotation: 0,
        detail: 'Caminhe cerca de 10 passos'
      },
      {
        instruction: 'Vire à direita no próximo corredor',
        rotation: 90,
        detail: 'Você ouvirá um bebedouro à esquerda'
      },
      {
        instruction: 'Continue até a porta com a placa tátil Sala 01',
        rotation: 0,
        detail: 'Mais 8 a 12 passos'
      }
    ]
  },
  {
    id: 'room02',
    name: 'Sala 02',
    steps: [
      {
        instruction: 'Siga pelo corredor principal',
        rotation: 0,
        detail: 'Acompanhe o piso tátil por 15 passos'
      },
      {
        instruction: 'Vire à esquerda após o bebedouro',
        rotation: -90,
        detail: 'Som de água indica a proximidade'
      },
      {
        instruction: 'Porta da Sala 02 estará à sua direita',
        rotation: 90,
        detail: 'Placa em Braille na porta'
      }
    ]
  },
  {
    id: 'room2a',
    name: 'Sala 2-A',
    steps: [
      {
        instruction: 'Dirija-se ao corredor das salas numeradas',
        rotation: 0,
        detail: 'Siga o piso tátil por 12 passos'
      },
      {
        instruction: 'Localize a primeira porta à direita após a Sala 02',
        rotation: 90,
        detail: 'Placa tátil identificará a Sala 2-A'
      }
    ]
  },
  {
    id: 'room03',
    name: 'Sala 03',
    steps: [
      {
        instruction: 'Continue pelo corredor principal',
        rotation: 0,
        detail: 'Mantenha-se no piso tátil'
      },
      {
        instruction: 'Após 20 passos, localize a terceira porta à direita',
        rotation: 90,
        detail: 'Placa em Braille na altura do peito'
      }
    ]
  },
  {
    id: 'room04',
    name: 'Sala 04',
    steps: [
      {
        instruction: 'Siga pelo corredor até o meio do prédio',
        rotation: 0,
        detail: 'Aproximadamente 25 passos no piso tátil'
      },
      {
        instruction: 'Sala 04 estará à sua direita',
        rotation: 90,
        detail: 'Porta com identificação tátil'
      }
    ]
  },
  {
    id: 'room4a',
    name: 'Sala 4-A',
    steps: [
      {
        instruction: 'Localize a Sala 04 primeiro',
        rotation: 0,
        detail: 'Use as instruções da Sala 04'
      },
      {
        instruction: 'Sala 4-A fica adjacente à Sala 04',
        rotation: 0,
        detail: 'Próxima porta no mesmo corredor'
      }
    ]
  },
  {
    id: 'room06',
    name: 'Sala 6',
    steps: [
      {
        instruction: 'Dirija-se ao final do corredor principal',
        rotation: 0,
        detail: 'Continue por mais 15 passos após a Sala 04'
      },
      {
        instruction: 'Sala 6 estará à sua direita',
        rotation: 90,
        detail: 'Última sala antes da escada'
      }
    ]
  },
  {
    id: 'room07',
    name: 'Sala 7',
    steps: [
      {
        instruction: 'Suba as escadas para o andar superior',
        rotation: 0,
        detail: 'Corrimão à direita, 12 degraus'
      },
      {
        instruction: 'No topo, vire à esquerda',
        rotation: -90,
        detail: 'Primeira porta à esquerda é a Sala 7'
      }
    ]
  },
  {
    id: 'room08',
    name: 'Sala 8',
    steps: [
      {
        instruction: 'Suba para o andar superior',
        rotation: 0,
        detail: 'Use o corrimão da escada'
      },
      {
        instruction: 'Continue em frente após a escada',
        rotation: 0,
        detail: 'Sala 8 estará à sua frente'
      }
    ]
  },
  {
    id: 'room09',
    name: 'Sala 09',
    steps: [
      {
        instruction: 'Vá para o andar superior',
        rotation: 0,
        detail: 'Escada principal, 12 degraus'
      },
      {
        instruction: 'Vire à direita no topo da escada',
        rotation: 90,
        detail: 'Primeira porta à direita'
      }
    ]
  },
  {
    id: 'room10',
    name: 'Sala 10',
    steps: [
      {
        instruction: 'Suba para o segundo andar',
        rotation: 0,
        detail: 'Use sempre o corrimão'
      },
      {
        instruction: 'Sala 10 fica no final do corredor superior',
        rotation: 0,
        detail: 'Continue em frente por 20 passos'
      }
    ]
  },
  {
    id: 'front_bathrooms',
    name: 'Banheiros da frente',
    steps: [
      {
        instruction: 'A partir da entrada principal, vire à direita',
        rotation: 90,
        detail: 'Logo após a porta de entrada'
      },
      {
        instruction: 'Continue por 8 passos',
        rotation: 0,
        detail: 'Banheiros estarão à sua esquerda'
      }
    ]
  },
  {
    id: 'back_bathrooms',
    name: 'Banheiros dos fundos',
    steps: [
      {
        instruction: 'Siga pelo corredor principal até o final',
        rotation: 0,
        detail: 'Continue além de todas as salas'
      },
      {
        instruction: 'Vire à esquerda no final do corredor',
        rotation: -90,
        detail: 'Banheiros estarão à sua frente'
      }
    ]
  },
  {
    id: 'upstairs_bathrooms',
    name: 'Banheiros do andar superior',
    steps: [
      {
        instruction: 'Suba a escada principal',
        rotation: 0,
        detail: 'Corrimão à direita, 12 degraus'
      },
      {
        instruction: 'No topo, vire à esquerda',
        rotation: -90,
        detail: 'Banheiros estarão no final do corredor'
      }
    ]
  },
  {
    id: 'computer_room',
    name: 'Sala de informática',
    steps: [
      {
        instruction: 'Dirija-se ao corredor lateral esquerdo',
        rotation: -90,
        detail: 'A partir da entrada principal'
      },
      {
        instruction: 'Continue por 15 passos',
        rotation: 0,
        detail: 'Som de computadores indicará proximidade'
      },
      {
        instruction: 'Sala de informática à sua direita',
        rotation: 90,
        detail: 'Porta dupla com identificação tátil'
      }
    ]
  },
  {
    id: 'playroom',
    name: 'Sala de recreação',
    steps: [
      {
        instruction: 'Entre pelo corredor lateral direito',
        rotation: 90,
        detail: 'A partir da recepção'
      },
      {
        instruction: 'Continue até ouvir sons de atividades',
        rotation: 0,
        detail: 'Aproximadamente 20 passos'
      },
      {
        instruction: 'Porta da recreação à sua esquerda',
        rotation: -90,
        detail: 'Identificação em Braille disponível'
      }
    ]
  },
  {
    id: 'journalism_room',
    name: 'Sala de jornalismo',
    steps: [
      {
        instruction: 'Vá para o andar superior',
        rotation: 0,
        detail: 'Escada principal, use o corrimão'
      },
      {
        instruction: 'Vire à direita no topo',
        rotation: 90,
        detail: 'Corredor das salas especializadas'
      },
      {
        instruction: 'Segunda porta à esquerda',
        rotation: -90,
        detail: 'Placa com "Jornalismo" em Braille'
      }
    ]
  },
  {
    id: 'auditorium',
    name: 'Auditório',
    steps: [
      {
        instruction: 'A partir da entrada, dirija-se ao centro do prédio',
        rotation: 0,
        detail: 'Siga o piso tátil principal'
      },
      {
        instruction: 'Vire à esquerda na bifurcação',
        rotation: -90,
        detail: 'Você ouvirá ecos indicando espaço amplo'
      },
      {
        instruction: 'Portas duplas do auditório à sua frente',
        rotation: 0,
        detail: 'Maçanetas grandes e identificação tátil'
      }
    ]
  },
  {
    id: 'coordination_office',
    name: 'Coordenação pedagógica',
    steps: [
      {
        instruction: 'Dirija-se à área administrativa',
        rotation: 0,
        detail: 'Próximo à entrada principal'
      },
      {
        instruction: 'Vire à esquerda após a recepção',
        rotation: -90,
        detail: 'Corredor administrativo'
      },
      {
        instruction: 'Primeira porta à direita',
        rotation: 90,
        detail: 'Placa "Coordenação Pedagógica" em Braille'
      }
    ]
  },
  {
    id: 'library',
    name: 'Biblioteca',
    steps: [
      {
        instruction: 'Vá para o andar superior',
        rotation: 0,
        detail: 'Escada principal com corrimão'
      },
      {
        instruction: 'Continue em frente após a escada',
        rotation: 0,
        detail: 'Ambiente silencioso indicará proximidade'
      },
      {
        instruction: 'Porta dupla da biblioteca à sua frente',
        rotation: 0,
        detail: 'Som abafado e cheiro de livros'
      }
    ]
  }
];

export class RouteService {
  static async initializeDefaultData(): Promise<void> {
    try {
      const existingData = await AsyncStorage.getItem(STORAGE_KEY);
      if (!existingData) {
        const initialData: RouteData = {
          destinations: DEFAULT_DESTINATIONS,
          version: '1.0.0',
          lastUpdated: new Date().toISOString(),
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
}