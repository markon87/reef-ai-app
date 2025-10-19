export interface Fish {
    id: string;
    name: string;
    aggression: "peaceful" | "semi-aggressive" | "aggressive";
    minTankSize: number; // in gallons
    diet: "herbivore" | "carnivore" | "omnivore";
    compatibleWith: string[]; // IDs of compatible species
}