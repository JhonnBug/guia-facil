import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Dimensions,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { ChevronUp, Chrome as Home } from 'lucide-react-native';
import { RouteService } from '@/services/RouteService';
import { Destination, NavigationStep } from '@/types/navigation';

const { width, height } = Dimensions.get('window');

export default function NavigationScreen() {
  const { destinationId } = useLocalSearchParams<{ destinationId: string }>();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const colorScheme = useColorScheme();
  const router = useRouter();
  
  const arrowRotation = useSharedValue(0);
  const styles = getStyles(colorScheme);

  useEffect(() => {
    if (destinationId) {
      loadDestination();
    }
  }, [destinationId]);

  useEffect(() => {
    if (destination && destination.steps.length > 0) {
      startNavigation();
    }
  }, [destination]);

  const loadDestination = async () => {
    try {
      const dest = await RouteService.getDestinationById(destinationId);
      if (dest) {
        setDestination(dest);
      } else {
        Alert.alert('Erro', 'Destino não encontrado');
        router.back();
      }
    } catch (error) {
      console.error('Erro ao carregar destino:', error);
      Alert.alert('Erro', 'Não foi possível carregar o destino');
      router.back();
    }
  };

  const startNavigation = () => {
    if (!destination) return;
    
    setIsNavigating(true);
    setCurrentStepIndex(0);
    speakCurrentStep(0);
    updateArrowDirection(0);
  };

  const speakCurrentStep = (stepIndex: number) => {
    if (!destination || stepIndex >= destination.steps.length) {
      speakArrivalMessage();
      return;
    }

    const step = destination.steps[stepIndex];
    const message = `${step.instruction}. ${step.detail}`;
    
    Speech.speak(message, {
      language: 'pt-BR',
      rate: 0.7,
      pitch: 1.0,
    });
  };

  const speakArrivalMessage = () => {
    Speech.speak(
      `Você chegou ao destino: ${destination?.name}. Navegação concluída.`,
      {
        language: 'pt-BR',
        rate: 0.8,
      }
    );
  };

  const updateArrowDirection = (stepIndex: number) => {
    if (!destination || stepIndex >= destination.steps.length) return;
    
    const step = destination.steps[stepIndex];
    arrowRotation.value = withSpring(step.rotation, {
      damping: 15,
      stiffness: 150,
    });
  };

  const handleNextStep = () => {
    if (!destination) return;
    
    const nextIndex = currentStepIndex + 1;
    
    if (nextIndex >= destination.steps.length) {
      // Navigation completed
      setIsNavigating(false);
      speakArrivalMessage();
      setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/');
        }
      }, 3000);
      return;
    }

    setCurrentStepIndex(nextIndex);
    speakCurrentStep(nextIndex);
    updateArrowDirection(nextIndex);
  };

  const handleStopNavigation = () => {
    Speech.stop();
    setIsNavigating(false);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const animatedArrowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${arrowRotation.value}deg` }],
    };
  });

  const currentStep = destination?.steps[currentStepIndex];
  const isLastStep = destination ? currentStepIndex >= destination.steps.length - 1 : false;

  if (!destination) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando navegação...</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handleNextStep}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={
        isNavigating 
          ? `Próximo passo: ${currentStep?.instruction}` 
          : 'Iniciar navegação'
      }
      accessibilityHint="Toque em qualquer lugar da tela para avançar"
    >
      <View 
        style={styles.header}
        accessibilityRole="text"
      >
        <Text style={styles.destinationTitle}>{destination.name}</Text>
        <Text style={styles.stepCounter}>
          Passo {currentStepIndex + 1} de {destination.steps.length}
        </Text>
      </View>

      <View style={styles.arrowContainer}>
        <Animated.View style={[styles.arrow, animatedArrowStyle]}>
          <ChevronUp 
            size={120} 
            color={colorScheme === 'dark' ? '#FFFF00' : '#000000'} 
            strokeWidth={4}
          />
        </Animated.View>
      </View>

      {currentStep && (
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            {currentStep.instruction}
          </Text>
          <Text style={styles.detailText}>
            {currentStep.detail}
          </Text>
        </View>
      )}

      <View style={styles.bottomContainer}>
        <Text style={styles.tapHint}>
          {isLastStep ? 'Toque para finalizar' : 'Toque para próximo passo'}
        </Text>
        
        <TouchableOpacity 
          style={styles.stopButton}
          onPress={handleStopNavigation}
          accessibilityRole="button"
          accessibilityLabel="Parar navegação"
        >
          <Home size={24} color={colorScheme === 'dark' ? '#000000' : '#FFFFFF'} />
          <Text style={styles.stopButtonText}>Parar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
      alignItems: 'center',
      marginBottom: 40,
    },
    destinationTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#FFFF00' : '#000000',
      textAlign: 'center',
      marginBottom: 8,
    },
    stepCounter: {
      fontSize: 18,
      color: isDark ? '#00FFFF' : '#333333',
      fontWeight: '600',
    },
    arrowContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 40,
    },
    arrow: {
      width: 160,
      height: 160,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 80,
      borderWidth: 4,
      borderColor: isDark ? '#FFFF00' : '#000000',
      backgroundColor: isDark ? '#333333' : '#F5F5F5',
    },
    instructionContainer: {
      backgroundColor: isDark ? '#333333' : '#F0F0F0',
      padding: 24,
      borderRadius: 16,
      borderWidth: 3,
      borderColor: isDark ? '#00FFFF' : '#000000',
      marginBottom: 30,
    },
    instructionText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#FFFFFF' : '#000000',
      textAlign: 'center',
      marginBottom: 12,
      lineHeight: 32,
    },
    detailText: {
      fontSize: 18,
      color: isDark ? '#00FFFF' : '#333333',
      textAlign: 'center',
      lineHeight: 24,
    },
    bottomContainer: {
      alignItems: 'center',
    },
    tapHint: {
      fontSize: 16,
      color: isDark ? '#FFFFFF' : '#666666',
      textAlign: 'center',
      marginBottom: 20,
      fontStyle: 'italic',
    },
    stopButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#FFFF00' : '#000000',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 25,
      borderWidth: 2,
      borderColor: isDark ? '#FFFFFF' : '#333333',
    },
    stopButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? '#000000' : '#FFFFFF',
      marginLeft: 8,
    },
    loadingText: {
      fontSize: 20,
      color: isDark ? '#FFFFFF' : '#000000',
      textAlign: 'center',
    },
  });
};