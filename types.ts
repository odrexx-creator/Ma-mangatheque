
export interface Volume {
  id: string;
  number: number;
  owned: boolean;
}

export interface Series {
  id: string;
  title: string;
  author: string;
  nationality: string;
  imageUrl?: string;
  color: string;
  volumes: Volume[];
  totalAvailableInFrance?: number; // Nouveau: nombre de tomes sortis en France
  characterName?: string; // Nouveau: nom du personnage sur l'image
}

export type View = 'home' | 'detail' | 'report';
