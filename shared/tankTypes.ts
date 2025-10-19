import { Fish } from './fishTypes';
import { Coral } from './coralTypes';

export interface Tank {
  id: string;
  name: string;
  sizeLiters: number;
  fish: Fish[];
  corals: Coral[];
}