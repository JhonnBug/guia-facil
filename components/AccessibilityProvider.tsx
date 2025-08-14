import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as Speech from 'expo-speech';

interface AccessibilityContextType {
  highContrastMode: boolean;
  textSize: 'normal' | 'large' | 'extra-large';
  speechRate: number;
  toggleHighContrast: () => void;
  setTextSize: (size: 'normal' | 'large' | 'extra-large') => void;
  setSpeechRate: (rate: number) => void;
  speak: (text: string, options?: any) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'extra-large'>('normal');
  const [speechRate, setSpeechRate] = useState(0.8);

  const toggleHighContrast = () => {
    setHighContrastMode(!highContrastMode);
  };

  const speak = (text: string, options: any = {}) => {
    Speech.speak(text, {
      language: 'pt-BR',
      rate: speechRate,
      pitch: 1.0,
      ...options,
    });
  };

  const contextValue: AccessibilityContextType = {
    highContrastMode,
    textSize,
    speechRate,
    toggleHighContrast,
    setTextSize,
    setSpeechRate,
    speak,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}