import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  useColorScheme,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { RouteService } from '@/services/RouteService';
import { Destination } from '@/types/navigation';

export default function DestinationsScreen() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const router = useRouter();

  const styles = getStyles(colorScheme);

  useEffect(() => {
    loadDestinations();
    speakWelcomeMessage();
  }, []);

  const loadDestinations = async () => {
    try {
      const data = await RouteService.getDestinations();
      setDestinations(data);
    } catch (error) {
      console.error('Erro ao carregar destinos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os destinos');
    } finally {
      setLoading(false);
    }
  };

  const speakWelcomeMessage = () => {
    Speech.speak(
      'Bem-vindo ao Guia Fácil. Selecione um destino na lista para iniciar a navegação.',
      {
        language: 'pt-BR',
        rate: 0.8,
      }
    );
  };

  const handleDestinationSelect = (destination: Destination) => {
    Speech.speak(`Navegando para ${destination.name}`, {
      language: 'pt-BR',
      rate: 0.8,
    });
    
    // Navigate to the navigation screen with the selected destination
    router.push({
      pathname: '/navigation',
      params: { destinationId: destination.id }
    });
  };

  const renderDestination = ({ item }: { item: Destination }) => (
    <TouchableOpacity
      style={styles.destinationItem}
      onPress={() => handleDestinationSelect(item)}
      accessibilityRole="button"
      accessibilityLabel={`Navegar para ${item.name}`}
      accessibilityHint="Toque duas vezes para iniciar a navegação"
    >
      <Text style={styles.destinationText}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando destinos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Guia Fácil</Text>
      <Text style={styles.subtitle}>Projeto SE LIGA JOVEM</Text>
      <Text style={styles.instruction}>
        Selecione um destino para navegar:
      </Text>
      
      <FlatList
        data={destinations}
        renderItem={renderDestination}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="Lista de destinos disponíveis"
      />
    </View>
  );
}

const getStyles = (colorScheme: 'light' | 'dark' | null) => {
  const isDark = colorScheme === 'dark';
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
      padding: 20,
      paddingTop: 60,
    },
    header: {
      fontSize: 32,
      fontWeight: 'bold',
      color: isDark ? '#FFFF00' : '#000000',
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 18,
      color: isDark ? '#00FFFF' : '#333333',
      textAlign: 'center',
      marginBottom: 30,
    },
    instruction: {
      fontSize: 20,
      color: isDark ? '#FFFFFF' : '#000000',
      textAlign: 'center',
      marginBottom: 30,
      fontWeight: '600',
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingBottom: 20,
    },
    destinationItem: {
      backgroundColor: isDark ? '#333333' : '#F5F5F5',
      padding: 20,
      marginVertical: 8,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: isDark ? '#FFFF00' : '#000000',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    destinationText: {
      fontSize: 22,
      fontWeight: 'bold',
      color: isDark ? '#FFFFFF' : '#000000',
      textAlign: 'center',
    },
    loadingText: {
      fontSize: 20,
      color: isDark ? '#FFFFFF' : '#000000',
      textAlign: 'center',
    },
  });
};