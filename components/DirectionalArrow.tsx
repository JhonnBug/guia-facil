import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { ChevronUp } from 'lucide-react-native';

interface DirectionalArrowProps {
  rotation: number; // degrees
  size?: number;
  animated?: boolean;
}

export function DirectionalArrow({ rotation, size = 120, animated = true }: DirectionalArrowProps) {
  const colorScheme = useColorScheme();
  const rotationValue = useSharedValue(0);
  
  React.useEffect(() => {
    if (animated) {
      rotationValue.value = withSpring(rotation, {
        damping: 15,
        stiffness: 150,
        mass: 1,
      });
    } else {
      rotationValue.value = rotation;
    }
  }, [rotation, animated]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotationValue.value}deg` }],
    };
  });

  const styles = getStyles(colorScheme, size);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.arrowContainer, animatedStyle]}>
        <ChevronUp 
          size={size} 
          color={colorScheme === 'dark' ? '#FFFF00' : '#000000'} 
          strokeWidth={4}
        />
      </Animated.View>
    </View>
  );
}

const getStyles = (colorScheme: 'light' | 'dark' | null, size: number) => {
  const isDark = colorScheme === 'dark';
  const containerSize = size + 40;
  
  return StyleSheet.create({
    container: {
      width: containerSize,
      height: containerSize,
      justifyContent: 'center',
      alignItems: 'center',
    },
    arrowContainer: {
      width: containerSize,
      height: containerSize,
      borderRadius: containerSize / 2,
      borderWidth: 4,
      borderColor: isDark ? '#FFFF00' : '#000000',
      backgroundColor: isDark ? '#333333' : '#F5F5F5',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
  });
};