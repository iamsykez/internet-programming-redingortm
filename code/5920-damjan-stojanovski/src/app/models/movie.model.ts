export interface Movie {
  id: number;
  title: string;
  year: number;
  director: string;
  genre: string[];
  plot: string;
  cast: CastMember[];
  oscars: { [key: string]: string };
  rating: number;
}

export interface CastMember {
  actor: string;
  character: string;
} 