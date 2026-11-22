export interface Country {
  cca3: string;
  commonName: string;
  officialName: string | null;
  capitals: string[];
  region: string | null;
  subregion: string | null;
  population: number | null;
  area: number | null;
  flagUrl: string | null;
  flagAlt: string | null;
}
