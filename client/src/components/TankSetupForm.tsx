import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Typography,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  OutlinedInput,
  Button,
  type SelectChangeEvent
} from '@mui/material';
import { Add, Remove, Save } from '@mui/icons-material';
import { fishSpecies, coralSpecies, tankVolumesLiters, lightingOptions, filtrationOptions } from '../data/aquariumData';
import { useUnits } from '../contexts/UnitsContext';

export interface TankSetup {
  volume: number;
  lighting: string;
  filtration: string[];
  fish: Array<{ species: string; quantity: number }>;
  corals: Array<{ species: string; quantity: number }>;
  hasProteinSkimmer: boolean;
  hasHeater: boolean;
  hasWavemaker: boolean;
  waterParams: {
    ph?: number;
    salinity?: number;
    temperature?: number;
  };
}

interface TankSetupFormProps {
  onSetupChange: (setup: TankSetup) => void;
  initialSetup?: TankSetup | null;
  onSaveSetup?: (setup: TankSetup) => void;
}

export const TankSetupForm = ({ onSetupChange, initialSetup, onSaveSetup }: TankSetupFormProps) => {
  const { formatVolume, parseVolume, getVolumeUnit, formatTemperature, parseTemperature, getTemperatureUnit } = useUnits();
  
  const [setup, setSetup] = useState<TankSetup>({
    volume: tankVolumesLiters[5].value, // 75 gallons (283.9L)
    lighting: 'led-medium',
    filtration: [],
    fish: [],
    corals: [],
    hasProteinSkimmer: false,
    hasHeater: true,
    hasWavemaker: false,
    waterParams: {}
  });

  // Update form when initialSetup changes (for loading saved setups)
  useEffect(() => {
    if (initialSetup) {
      setSetup(initialSetup);
    }
  }, [initialSetup]);

  const updateSetup = (newSetup: Partial<TankSetup>) => {
    const updatedSetup = { ...setup, ...newSetup };
    setSetup(updatedSetup);
    onSetupChange(updatedSetup);
  };

  const addFish = () => {
    // Find the first fish species that hasn't been added yet
    const usedFishIds = setup.fish.map(f => f.species);
    const availableFish = fishSpecies.find(species => !usedFishIds.includes(species.id));
    
    // If all fish species are used, fall back to the first one (user can change it)
    const selectedFishId = availableFish ? availableFish.id : fishSpecies[0].id;
    
    const newFish = { species: selectedFishId, quantity: 1 };
    updateSetup({ fish: [...setup.fish, newFish] });
  };

  const removeFish = (index: number) => {
    const newFish = setup.fish.filter((_, i) => i !== index);
    updateSetup({ fish: newFish });
  };

  const updateFish = (index: number, field: 'species' | 'quantity', value: string | number) => {
    const newFish = setup.fish.map((fish, i) => 
      i === index ? { ...fish, [field]: value } : fish
    );
    updateSetup({ fish: newFish });
  };

  const addCoral = () => {
    // Find the first coral species that hasn't been added yet
    const usedCoralIds = setup.corals.map(c => c.species);
    const availableCoral = coralSpecies.find(species => !usedCoralIds.includes(species.id));
    
    // If all coral species are used, fall back to the first one (user can change it)
    const selectedCoralId = availableCoral ? availableCoral.id : coralSpecies[0].id;
    
    const newCoral = { species: selectedCoralId, quantity: 1 };
    updateSetup({ corals: [...setup.corals, newCoral] });
  };

  const removeCoral = (index: number) => {
    const newCorals = setup.corals.filter((_, i) => i !== index);
    updateSetup({ corals: newCorals });
  };

  const updateCoral = (index: number, field: 'species' | 'quantity', value: string | number) => {
    const newCorals = setup.corals.map((coral, i) => 
      i === index ? { ...coral, [field]: value } : coral
    );
    updateSetup({ corals: newCorals });
  };

  const handleFiltrationChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    updateSetup({ filtration: typeof value === 'string' ? value.split(',') : value });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Tank Parameters */}
      <Card elevation={1}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Tank Parameters</Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 200, flex: 1 }}>
                <InputLabel>Tank Volume</InputLabel>
                <Select
                  value={setup.volume}
                  label="Tank Volume"
                  onChange={(e) => updateSetup({ volume: Number(e.target.value) })}
                >
                  {tankVolumesLiters.map((volume) => (
                    <MenuItem key={volume.value} value={volume.value}>
                      {formatVolume(volume.value)} {getVolumeUnit()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 200, flex: 1 }}>
                <InputLabel>Lighting</InputLabel>
                <Select
                  value={setup.lighting}
                  label="Lighting"
                  onChange={(e) => updateSetup({ lighting: e.target.value })}
                >
                  {lightingOptions.map((lighting) => (
                    <MenuItem key={lighting.value} value={lighting.value}>
                      {lighting.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Filtration Systems</InputLabel>
              <Select
                multiple
                value={setup.filtration}
                onChange={handleFiltrationChange}
                input={<OutlinedInput label="Filtration Systems" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={filtrationOptions.find(f => f.value === value)?.label || value}
                        size="small" 
                      />
                    ))}
                  </Box>
                )}
              >
                {filtrationOptions.map((filtration) => (
                  <MenuItem key={filtration.value} value={filtration.value}>
                    {filtration.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Equipment Checkboxes */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Additional Equipment</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={setup.hasProteinSkimmer}
                    onChange={(e) => updateSetup({ hasProteinSkimmer: e.target.checked })}
                  />
                }
                label="Protein Skimmer"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={setup.hasHeater}
                    onChange={(e) => updateSetup({ hasHeater: e.target.checked })}
                  />
                }
                label="Heater"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={setup.hasWavemaker}
                    onChange={(e) => updateSetup({ hasWavemaker: e.target.checked })}
                  />
                }
                label="Wavemaker/Powerheads"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Fish Section */}
      <Card elevation={1}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Fish</Typography>
            <IconButton onClick={addFish} color="primary">
              <Add />
            </IconButton>
          </Box>
          
          {setup.fish.map((fish, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Fish Species</InputLabel>
                <Select
                  value={fish.species}
                  label="Fish Species"
                  onChange={(e) => updateFish(index, 'species', e.target.value)}
                >
                  {fishSpecies.map((species) => {
                    const isAlreadyAdded = setup.fish.some((f, i) => f.species === species.id && i !== index);
                    return (
                      <MenuItem 
                        key={species.id} 
                        value={species.id}
                        disabled={isAlreadyAdded}
                        sx={isAlreadyAdded ? { opacity: 0.5, fontStyle: 'italic' } : {}}
                      >
                        {species.name} ({species.category})
                        {isAlreadyAdded && ' - Already Added'}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              
              <TextField
                type="number"
                label="Quantity"
                value={fish.quantity}
                onChange={(e) => updateFish(index, 'quantity', Number(e.target.value))}
                inputProps={{ min: 1, max: 20 }}
                sx={{ width: 100 }}
              />
              
              <IconButton onClick={() => removeFish(index)} color="error">
                <Remove />
              </IconButton>
            </Box>
          ))}
          
          {setup.fish.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Click + to add fish to your tank
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Corals Section */}
      <Card elevation={1}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Corals</Typography>
            <IconButton onClick={addCoral} color="primary">
              <Add />
            </IconButton>
          </Box>
          
          {setup.corals.map((coral, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Coral Species</InputLabel>
                <Select
                  value={coral.species}
                  label="Coral Species"
                  onChange={(e) => updateCoral(index, 'species', e.target.value)}
                >
                  {coralSpecies.map((species) => {
                    const isAlreadyAdded = setup.corals.some((c, i) => c.species === species.id && i !== index);
                    return (
                      <MenuItem 
                        key={species.id} 
                        value={species.id}
                        disabled={isAlreadyAdded}
                        sx={isAlreadyAdded ? { opacity: 0.5, fontStyle: 'italic' } : {}}
                      >
                        {species.name} ({species.category})
                        {isAlreadyAdded && ' - Already Added'}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              
              <TextField
                type="number"
                label="Quantity"
                value={coral.quantity}
                onChange={(e) => updateCoral(index, 'quantity', Number(e.target.value))}
                inputProps={{ min: 1, max: 50 }}
                sx={{ width: 100 }}
              />
              
              <IconButton onClick={() => removeCoral(index)} color="error">
                <Remove />
              </IconButton>
            </Box>
          ))}
          
          {setup.corals.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Click + to add corals to your tank
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Water Parameters */}
      <Card elevation={1}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Water Parameters (Optional)</Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              sx={{ minWidth: 150, flex: 1 }}
              type="number"
              label="pH"
              value={setup.waterParams.ph || ''}
              onChange={(e) => updateSetup({ 
                waterParams: { ...setup.waterParams, ph: Number(e.target.value) }
              })}
              inputProps={{ min: 6, max: 9, step: 0.1 }}
              placeholder="7.8-8.3"
            />
            
            <TextField
              sx={{ minWidth: 150, flex: 1 }}
              type="number"
              label="Salinity (sg)"
              value={setup.waterParams.salinity || ''}
              onChange={(e) => updateSetup({ 
                waterParams: { ...setup.waterParams, salinity: Number(e.target.value) }
              })}
              inputProps={{ min: 1.020, max: 1.030, step: 0.001 }}
              placeholder="1.025"
            />
            
            <TextField
              sx={{ minWidth: 150, flex: 1 }}
              type="number"
              label={`Temperature (${getTemperatureUnit()})`}
              value={setup.waterParams.temperature ? formatTemperature(setup.waterParams.temperature) : ''}
              onChange={(e) => {
                const celsiusValue = parseTemperature(e.target.value);
                updateSetup({ 
                  waterParams: { ...setup.waterParams, temperature: celsiusValue }
                });
              }}
              inputProps={{ 
                min: getTemperatureUnit() === '°F' ? 70 : 21, 
                max: getTemperatureUnit() === '°F' ? 85 : 29 
              }}
              placeholder={getTemperatureUnit() === '°F' ? '78' : '26'}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Save Button */}
      {onSaveSetup && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Save />}
            onClick={() => onSaveSetup(setup)}
            sx={{ 
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'medium'
            }}
          >
            Save Tank Setup
          </Button>
        </Box>
      )}
    </Box>
  );
};