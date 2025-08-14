import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  useColorScheme,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Plus, CreditCard as Edit, Trash2, Save, X } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { RouteService } from '@/services/RouteService';
import { Destination, NavigationStep } from '@/types/navigation';

export default function AdminScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const colorScheme = useColorScheme();
  
  const styles = getStyles(colorScheme);

  useEffect(() => {
    if (isAuthenticated) {
      loadDestinations();
    }
  }, [isAuthenticated]);

  const loadDestinations = async () => {
    try {
      const data = await RouteService.getDestinations();
      setDestinations(data);
    } catch (error) {
      console.error('Erro ao carregar destinos:', error);
    }
  };

  const handleAuthentication = () => {
    // Simple password check - in production, use proper authentication
    if (password === 'admin123') {
      setIsAuthenticated(true);
      Speech.speak('Acesso autorizado ao modo administrador', {
        language: 'pt-BR',
        rate: 0.8,
      });
    } else {
      Alert.alert('Erro', 'Senha incorreta');
      Speech.speak('Senha incorreta', {
        language: 'pt-BR',
        rate: 0.8,
      });
    }
  };

  const handleDeleteDestination = (id: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este destino?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await RouteService.deleteDestination(id);
              await loadDestinations();
              Speech.speak('Destino excluído', { language: 'pt-BR' });
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o destino');
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const data = await RouteService.exportData();
      Alert.alert('Exportar Dados', `Dados exportados:\n${JSON.stringify(data, null, 2).substring(0, 200)}...`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível exportar os dados');
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authTitle}>Modo Administrador</Text>
        <Text style={styles.authSubtitle}>Insira a senha para continuar</Text>
        
        <TextInput
          style={styles.passwordInput}
          value={password}
          onChangeText={setPassword}
          placeholder="Senha"
          placeholderTextColor={colorScheme === 'dark' ? '#888888' : '#AAAAAA'}
          secureTextEntry
          accessibilityLabel="Campo de senha"
          accessibilityHint="Digite a senha do administrador"
        />
        
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleAuthentication}
          accessibilityRole="button"
          accessibilityLabel="Entrar no modo administrador"
        >
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderDestination = ({ item }: { item: Destination }) => (
    <View style={styles.destinationCard}>
      <Text style={styles.destinationName}>{item.name}</Text>
      <Text style={styles.stepCount}>{item.steps.length} passos</Text>
      
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditingDestination(item)}
          accessibilityRole="button"
          accessibilityLabel={`Editar ${item.name}`}
        >
          <Edit size={20} color={colorScheme === 'dark' ? '#000000' : '#FFFFFF'} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteDestination(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`Excluir ${item.name}`}
        >
          <Trash2 size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Administração</Text>
        <Text style={styles.subtitle}>Gerenciar Rotas e Destinos</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Adicionar novo destino"
        >
          <Plus size={24} color={colorScheme === 'dark' ? '#000000' : '#FFFFFF'} />
          <Text style={styles.addButtonText}>Novo Destino</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExportData}
          accessibilityRole="button"
          accessibilityLabel="Exportar dados"
        >
          <Text style={styles.exportButtonText}>Exportar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={destinations}
        renderItem={renderDestination}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <DestinationModal
        visible={showAddModal || !!editingDestination}
        destination={editingDestination}
        onClose={() => {
          setShowAddModal(false);
          setEditingDestination(null);
        }}
        onSave={async () => {
          await loadDestinations();
          setShowAddModal(false);
          setEditingDestination(null);
        }}
        colorScheme={colorScheme}
      />
    </View>
  );
}

interface DestinationModalProps {
  visible: boolean;
  destination: Destination | null;
  onClose: () => void;
  onSave: () => void;
  colorScheme: 'light' | 'dark' | null;
}

function DestinationModal({ visible, destination, onClose, onSave, colorScheme }: DestinationModalProps) {
  const [name, setName] = useState('');
  const [steps, setSteps] = useState<NavigationStep[]>([]);
  const styles = getModalStyles(colorScheme);

  useEffect(() => {
    if (destination) {
      setName(destination.name);
      setSteps([...destination.steps]);
    } else {
      setName('');
      setSteps([]);
    }
  }, [destination]);

  const handleSave = async () => {
    try {
      if (destination) {
        await RouteService.updateDestination(destination.id, { name, steps });
      } else {
        await RouteService.addDestination({ name, steps });
      }
      onSave();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o destino');
    }
  };

  const addStep = () => {
    setSteps([...steps, { instruction: '', rotation: 0, detail: '' }]);
  };

  const updateStep = (index: number, field: keyof NavigationStep, value: string | number) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setSteps(updatedSteps);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {destination ? 'Editar Destino' : 'Novo Destino'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.label}>Nome do Destino:</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Sala 01"
            placeholderTextColor={colorScheme === 'dark' ? '#888888' : '#AAAAAA'}
            accessibilityLabel="Nome do destino"
          />

          <View style={styles.stepsSection}>
            <View style={styles.stepsHeader}>
              <Text style={styles.stepsTitle}>Passos da Navegação:</Text>
              <TouchableOpacity style={styles.addStepButton} onPress={addStep}>
                <Plus size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {steps.map((step, index) => (
              <View key={index} style={styles.stepCard}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepNumber}>Passo {index + 1}</Text>
                  <TouchableOpacity onPress={() => removeStep(index)}>
                    <Trash2 size={18} color="#FF4444" />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.input}
                  value={step.instruction}
                  onChangeText={(value) => updateStep(index, 'instruction', value)}
                  placeholder="Instrução"
                  placeholderTextColor={colorScheme === 'dark' ? '#888888' : '#AAAAAA'}
                />

                <TextInput
                  style={styles.input}
                  value={step.detail}
                  onChangeText={(value) => updateStep(index, 'detail', value)}
                  placeholder="Detalhes"
                  placeholderTextColor={colorScheme === 'dark' ? '#888888' : '#AAAAAA'}
                />

                <TextInput
                  style={styles.input}
                  value={step.rotation.toString()}
                  onChangeText={(value) => updateStep(index, 'rotation', parseInt(value) || 0)}
                  placeholder="Rotação (graus)"
                  keyboardType="numeric"
                  placeholderTextColor={colorScheme === 'dark' ? '#888888' : '#AAAAAA'}
                />
              </View>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
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
    authContainer: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    authTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#FFFF00' : '#000000',
      marginBottom: 10,
    },
    authSubtitle: {
      fontSize: 18,
      color: isDark ? '#FFFFFF' : '#333333',
      marginBottom: 40,
      textAlign: 'center',
    },
    passwordInput: {
      width: '100%',
      maxWidth: 300,
      height: 50,
      borderWidth: 3,
      borderColor: isDark ? '#FFFF00' : '#000000',
      borderRadius: 8,
      paddingHorizontal: 16,
      fontSize: 18,
      color: isDark ? '#FFFFFF' : '#000000',
      backgroundColor: isDark ? '#333333' : '#FFFFFF',
      marginBottom: 20,
    },
    loginButton: {
      backgroundColor: isDark ? '#FFFF00' : '#000000',
      paddingHorizontal: 40,
      paddingVertical: 15,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: isDark ? '#FFFFFF' : '#333333',
    },
    loginButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? '#000000' : '#FFFFFF',
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#FFFF00' : '#000000',
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? '#00FFFF' : '#333333',
      marginTop: 5,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#FFFF00' : '#000000',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      flex: 1,
      marginRight: 10,
      justifyContent: 'center',
    },
    addButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDark ? '#000000' : '#FFFFFF',
      marginLeft: 8,
    },
    exportButton: {
      backgroundColor: isDark ? '#00FFFF' : '#333333',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      justifyContent: 'center',
    },
    exportButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDark ? '#000000' : '#FFFFFF',
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingBottom: 20,
    },
    destinationCard: {
      backgroundColor: isDark ? '#333333' : '#F5F5F5',
      padding: 16,
      marginVertical: 8,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: isDark ? '#FFFFFF' : '#000000',
    },
    destinationName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 4,
    },
    stepCount: {
      fontSize: 14,
      color: isDark ? '#00FFFF' : '#666666',
      marginBottom: 12,
    },
    cardActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    editButton: {
      backgroundColor: isDark ? '#FFFF00' : '#000000',
      padding: 8,
      borderRadius: 6,
      marginRight: 8,
    },
    deleteButton: {
      backgroundColor: '#FF4444',
      padding: 8,
      borderRadius: 6,
    },
  });
};

const getModalStyles = (colorScheme: 'light' | 'dark' | null) => {
  const isDark = colorScheme === 'dark';
  
  return StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      paddingTop: 60,
      borderBottomWidth: 2,
      borderBottomColor: isDark ? '#333333' : '#EEEEEE',
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#FFFF00' : '#000000',
    },
    closeButton: {
      padding: 8,
    },
    modalContent: {
      flex: 1,
      padding: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 8,
    },
    input: {
      borderWidth: 2,
      borderColor: isDark ? '#FFFFFF' : '#000000',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: isDark ? '#FFFFFF' : '#000000',
      backgroundColor: isDark ? '#333333' : '#FFFFFF',
      marginBottom: 16,
    },
    stepsSection: {
      marginTop: 20,
    },
    stepsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    stepsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    addStepButton: {
      backgroundColor: isDark ? '#00FFFF' : '#333333',
      padding: 8,
      borderRadius: 6,
    },
    stepCard: {
      backgroundColor: isDark ? '#222222' : '#F9F9F9',
      padding: 16,
      marginBottom: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? '#444444' : '#DDDDDD',
    },
    stepHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    stepNumber: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDark ? '#00FFFF' : '#333333',
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#FFFF00' : '#000000',
      paddingVertical: 16,
      margin: 20,
      borderRadius: 8,
    },
    saveButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? '#000000' : '#FFFFFF',
      marginLeft: 8,
    },
  });
};