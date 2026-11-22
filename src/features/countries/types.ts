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

export interface CountryCurrency {
  code: string;
  name: string | null;
  symbol: string | null;
}

export interface CountryDetails extends Country {
  languages: string[];
  currencies: CountryCurrency[];
  timezones: string[];
  continents: string[];
  coordinates: [latitude: number, longitude: number] | null;
  mapUrl: string | null;
}
