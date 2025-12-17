import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

type UnitSystem = 'imperial' | 'metric';

interface UnitsContextType {
  unitSystem: UnitSystem;
  setUnitSystem: (system: UnitSystem) => void;
  // Volume conversions
  formatVolume: (liters: number) => string;
  parseVolume: (input: string) => number;
  getVolumeUnit: () => string;
  // Temperature conversions
  formatTemperature: (celsius: number) => string;
  parseTemperature: (input: string) => number;
  getTemperatureUnit: () => string;
  // Measurement conversions
  formatLength: (cm: number) => string;
  parseLength: (input: string) => number;
  getLengthUnit: () => string;
}

const UnitsContext = createContext<UnitsContextType | undefined>(undefined);

export function useUnits() {
  const context = useContext(UnitsContext);
  if (context === undefined) {
    throw new Error('useUnits must be used within a UnitsProvider');
  }
  return context;
}

interface UnitsProviderProps {
  children: React.ReactNode;
}

export function UnitsProvider({ children }: UnitsProviderProps) {
  const { user } = useAuth();
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>('imperial');

  // Load user's preferred units from metadata
  useEffect(() => {
    if (user?.user_metadata?.display_units) {
      setUnitSystemState(user.user_metadata.display_units);
    }
  }, [user]);

  // Volume conversion utilities (base unit: liters)
  const formatVolume = (liters: number): string => {
    if (unitSystem === 'imperial') {
      const gallons = liters * 0.264172; // 1 liter = 0.264172 gallons
      return gallons.toFixed(1);
    }
    return liters.toFixed(0);
  };

  const parseVolume = (input: string): number => {
    const value = parseFloat(input) || 0;
    if (unitSystem === 'imperial') {
      return value / 0.264172; // Convert gallons to liters
    }
    return value;
  };

  const getVolumeUnit = (): string => {
    return unitSystem === 'imperial' ? 'gal' : 'L';
  };

  // Temperature conversion utilities (base unit: celsius)
  const formatTemperature = (celsius: number): string => {
    if (unitSystem === 'imperial') {
      const fahrenheit = (celsius * 9/5) + 32;
      return fahrenheit.toFixed(0);
    }
    return celsius.toFixed(0);
  };

  const parseTemperature = (input: string): number => {
    const value = parseFloat(input) || 0;
    if (unitSystem === 'imperial') {
      return (value - 32) * 5/9; // Convert Fahrenheit to Celsius
    }
    return value;
  };

  const getTemperatureUnit = (): string => {
    return unitSystem === 'imperial' ? '°F' : '°C';
  };

  // Length conversion utilities (base unit: cm)
  const formatLength = (cm: number): string => {
    if (unitSystem === 'imperial') {
      const inches = cm * 0.393701; // 1 cm = 0.393701 inches
      return inches.toFixed(1);
    }
    return cm.toFixed(0);
  };

  const parseLength = (input: string): number => {
    const value = parseFloat(input) || 0;
    if (unitSystem === 'imperial') {
      return value / 0.393701; // Convert inches to cm
    }
    return value;
  };

  const getLengthUnit = (): string => {
    return unitSystem === 'imperial' ? 'in' : 'cm';
  };

  const setUnitSystem = (system: UnitSystem) => {
    setUnitSystemState(system);
  };

  const value = {
    unitSystem,
    setUnitSystem,
    formatVolume,
    parseVolume,
    getVolumeUnit,
    formatTemperature,
    parseTemperature,
    getTemperatureUnit,
    formatLength,
    parseLength,
    getLengthUnit,
  };

  return (
    <UnitsContext.Provider value={value}>
      {children}
    </UnitsContext.Provider>
  );
}