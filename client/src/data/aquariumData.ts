// Fish species data for dropdown options
export const fishSpecies = [
  // Clownfish
  { id: 'ocellaris-clown', name: 'Ocellaris Clownfish', category: 'Clownfish', difficulty: 'Beginner', minTankSize: 20, reefSafe: true },
  { id: 'percula-clown', name: 'Percula Clownfish', category: 'Clownfish', difficulty: 'Beginner', minTankSize: 20, reefSafe: true },
  { id: 'maroon-clown', name: 'Maroon Clownfish', category: 'Clownfish', difficulty: 'Intermediate', minTankSize: 30, reefSafe: true },
  
  // Tangs
  { id: 'yellow-tang', name: 'Yellow Tang', category: 'Tang', difficulty: 'Intermediate', minTankSize: 75, reefSafe: true },
  { id: 'blue-tang', name: 'Blue Tang', category: 'Tang', difficulty: 'Intermediate', minTankSize: 100, reefSafe: true },
  { id: 'powder-brown-tang', name: 'Powder Brown Tang', category: 'Tang', difficulty: 'Advanced', minTankSize: 125, reefSafe: true },
  
  // Wrasses
  { id: 'six-line-wrasse', name: 'Six Line Wrasse', category: 'Wrasse', difficulty: 'Beginner', minTankSize: 30, reefSafe: true },
  { id: 'fairy-wrasse', name: 'Fairy Wrasse', category: 'Wrasse', difficulty: 'Intermediate', minTankSize: 50, reefSafe: true },
  { id: 'cleaner-wrasse', name: 'Cleaner Wrasse', category: 'Wrasse', difficulty: 'Advanced', minTankSize: 75, reefSafe: true },
  
  // Gobies
  { id: 'mandarin-goby', name: 'Mandarin Goby', category: 'Goby', difficulty: 'Advanced', minTankSize: 30, reefSafe: true },
  { id: 'watchman-goby', name: 'Yellow Watchman Goby', category: 'Goby', difficulty: 'Beginner', minTankSize: 20, reefSafe: true },
  { id: 'firefish-goby', name: 'Firefish Goby', category: 'Goby', difficulty: 'Beginner', minTankSize: 20, reefSafe: true },
  
  // Cardinals
  { id: 'banggai-cardinal', name: 'Banggai Cardinal', category: 'Cardinal', difficulty: 'Beginner', minTankSize: 30, reefSafe: true },
  { id: 'pajama-cardinal', name: 'Pajama Cardinal', category: 'Cardinal', difficulty: 'Beginner', minTankSize: 30, reefSafe: true },
  
  // Angels
  { id: 'coral-beauty', name: 'Coral Beauty Angel', category: 'Angelfish', difficulty: 'Intermediate', minTankSize: 75, reefSafe: false },
  { id: 'flame-angel', name: 'Flame Angel', category: 'Angelfish', difficulty: 'Intermediate', minTankSize: 75, reefSafe: false },
  
  // Others
  { id: 'royal-gramma', name: 'Royal Gramma', category: 'Other', difficulty: 'Beginner', minTankSize: 30, reefSafe: true },
  { id: 'chromis', name: 'Blue Green Chromis', category: 'Other', difficulty: 'Beginner', minTankSize: 30, reefSafe: true },
];

// Coral species data for dropdown options
export const coralSpecies = [
  // Soft Corals
  { id: 'mushroom', name: 'Mushroom Coral', category: 'Soft', difficulty: 'Beginner', lighting: 'Low', flow: 'Low' },
  { id: 'leather', name: 'Leather Coral', category: 'Soft', difficulty: 'Beginner', lighting: 'Medium', flow: 'Medium' },
  { id: 'zoanthids', name: 'Zoanthids', category: 'Soft', difficulty: 'Beginner', lighting: 'Medium', flow: 'Medium' },
  { id: 'kenya-tree', name: 'Kenya Tree Coral', category: 'Soft', difficulty: 'Beginner', lighting: 'Medium', flow: 'High' },
  
  // LPS (Large Polyp Stony)
  { id: 'frogspawn', name: 'Frogspawn Coral', category: 'LPS', difficulty: 'Intermediate', lighting: 'Medium', flow: 'Medium' },
  { id: 'hammer', name: 'Hammer Coral', category: 'LPS', difficulty: 'Intermediate', lighting: 'Medium', flow: 'Medium' },
  { id: 'torch', name: 'Torch Coral', category: 'LPS', difficulty: 'Intermediate', lighting: 'Medium', flow: 'Medium' },
  { id: 'bubble', name: 'Bubble Coral', category: 'LPS', difficulty: 'Intermediate', lighting: 'Medium', flow: 'Low' },
  { id: 'plate', name: 'Plate Coral', category: 'LPS', difficulty: 'Intermediate', lighting: 'Medium', flow: 'Low' },
  
  // SPS (Small Polyp Stony)
  { id: 'birdsnest', name: 'Birdsnest Coral', category: 'SPS', difficulty: 'Advanced', lighting: 'High', flow: 'High' },
  { id: 'montipora', name: 'Montipora', category: 'SPS', difficulty: 'Advanced', lighting: 'High', flow: 'High' },
  { id: 'acropora', name: 'Acropora', category: 'SPS', difficulty: 'Expert', lighting: 'High', flow: 'High' },
  { id: 'staghorn', name: 'Staghorn Coral', category: 'SPS', difficulty: 'Expert', lighting: 'High', flow: 'High' },
  
  // Other
  { id: 'gsp', name: 'Green Star Polyps', category: 'Other', difficulty: 'Beginner', lighting: 'Medium', flow: 'Medium' },
  { id: 'xenia', name: 'Pulsing Xenia', category: 'Other', difficulty: 'Beginner', lighting: 'Medium', flow: 'Medium' },
];

// Tank volume options
export const tankVolumes = [
  { value: 10, label: '10 gallons' },
  { value: 20, label: '20 gallons' },
  { value: 29, label: '29 gallons' },
  { value: 40, label: '40 gallons' },
  { value: 55, label: '55 gallons' },
  { value: 75, label: '75 gallons' },
  { value: 90, label: '90 gallons' },
  { value: 120, label: '120 gallons' },
  { value: 150, label: '150 gallons' },
  { value: 180, label: '180 gallons' },
  { value: 220, label: '220 gallons' },
  { value: 300, label: '300+ gallons' },
];

// Lighting options
export const lightingOptions = [
  { value: 'none', label: 'No lighting / Basic' },
  { value: 'fluorescent', label: 'Fluorescent (T5/T8)' },
  { value: 'led-low', label: 'LED - Low intensity' },
  { value: 'led-medium', label: 'LED - Medium intensity' },
  { value: 'led-high', label: 'LED - High intensity (Reef)' },
  { value: 'halide', label: 'Metal Halide' },
];

// Filtration options
export const filtrationOptions = [
  { value: 'hob', label: 'Hang-on-back filter' },
  { value: 'canister', label: 'Canister filter' },
  { value: 'sump', label: 'Sump system' },
  { value: 'protein-skimmer', label: 'Protein skimmer' },
  { value: 'live-rock', label: 'Live rock filtration' },
  { value: 'refugium', label: 'Refugium' },
];