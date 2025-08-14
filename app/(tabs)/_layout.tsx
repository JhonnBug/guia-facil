import { Tabs } from 'expo-router';
import { Chrome as Home, MapPin, Settings } from 'lucide-react-native';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  const backgroundColor = colorScheme === 'dark' ? '#000000' : '#FFFFFF';
  const activeColor = colorScheme === 'dark' ? '#FFFF00' : '#000000';
  const inactiveColor = colorScheme === 'dark' ? '#FFFFFF' : '#666666';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor,
          borderTopColor: activeColor,
          borderTopWidth: 2,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Destinos',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} strokeWidth={3} />
          ),
        }}
      />
      <Tabs.Screen
        name="navigation"
        options={{
          title: 'Navegação',
          tabBarIcon: ({ size, color }) => (
            <MapPin size={size} color={color} strokeWidth={3} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} strokeWidth={3} />
          ),
        }}
      />
    </Tabs>
  );
}