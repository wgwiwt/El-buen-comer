
export interface Restaurant {
  name: string;
  rating: number; // Keep for community
  awards?: string; // New field for Gourmet recognitions
  price: number | string;
  ambiance: string;
  description: string;
  signatureDish: string;
  category?: string; // e.g., 'sushi', 'steak', 'italian', 'seafood'
  address?: string;
  googleMapsUrl?: string;
}

export enum AppTab {
  GOURMET = 'GOURMET',
  COMMUNITY = 'COMMUNITY',
}

export interface SearchParams {
  location: string;
  distance: string;
}

export const DISTANCE_OPTIONS = [
  { value: '0km', label: 'Casco Urbano' },
  { value: '15km', label: 'A 15 kilómetros' },
  { value: '30km', label: 'A 30 kilómetros' },
];
