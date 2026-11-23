import { api } from '../../../services/api';

/**
 * Famous places for every country, sourced from English Wikipedia articles
 * in the "World Heritage Sites in …" and "Tourist attractions in …"
 * categories, with lead photos served by Wikimedia Commons.
 */
export interface FamousPlace {
  id: string;
  title: string;
  description: string | null;
  summary: string | null;
  imageUrl: string;
  articleUrl: string;
}

export const wikipediaEndpoint = 'https://en.wikipedia.org/w/api.php';
const MAX_PLACES = 10;
export const wikimediaUserAgent =
  'PassportTravelApp/1.0 (React Native travel journal; educational project)';

function categoryName(country: string) {
  return country.trim().replace(/\s+/g, '_');
}

/** CirrusSearch query matching heritage sites and attractions of a country. */
export function famousPlacesSearch(countryName: string) {
  const name = categoryName(countryName);
  return `incategory:${[
    `World_Heritage_Sites_in_${name}`,
    `World_Heritage_Sites_in_the_${name}`,
    `Tourist_attractions_in_${name}`,
    `Tourist_attractions_in_the_${name}`,
  ].join('|')}`;
}

/** Looser keyword search used when the category search is sparse. */
export function fallbackPlacesSearch(countryName: string) {
  return `${countryName} landmark OR monument OR "national park" OR temple OR castle OR waterfall`;
}

export function famousPlacesParams(search: string) {
  return {
    action: 'query',
    format: 'json',
    formatversion: '2',
    origin: '*',
    generator: 'search',
    gsrsearch: search,
    gsrnamespace: '0',
    gsrlimit: '20',
    prop: 'pageimages|description|extracts',
    piprop: 'thumbnail',
    pithumbsize: '900',
    exintro: '1',
    explaintext: '1',
    exsentences: '2',
    exlimit: '20',
  };
}

function articleUrl(title: string) {
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(
    title.replace(/ /g, '_'),
  )}`;
}

const excludedTitle =
  /^(list of|tourism in|outline of|culture of|geography of)/i;

/**
 * Normalize a MediaWiki `generator=search` response into ranked places with
 * photos. Returns `null` for malformed payloads and `[]` for no matches.
 */
export function normalizeFamousPlaces(
  payload: unknown,
  countryName: string,
): FamousPlace[] | null {
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }
  const query = (payload as { query?: { pages?: unknown } }).query;
  if (query === undefined) {
    return [];
  }
  if (!Array.isArray(query.pages)) {
    return null;
  }
  const places: Array<FamousPlace & { rank: number }> = [];
  for (const page of query.pages as Array<Record<string, any>>) {
    const title = typeof page?.title === 'string' ? page.title.trim() : '';
    const image = page?.thumbnail?.source;
    if (
      !title ||
      typeof image !== 'string' ||
      !image.startsWith('https://') ||
      excludedTitle.test(title) ||
      title.toLowerCase() === countryName.trim().toLowerCase()
    ) {
      continue;
    }
    places.push({
      id: String(page.pageid ?? title),
      title,
      description:
        typeof page.description === 'string' ? page.description : null,
      summary:
        typeof page.extract === 'string' && page.extract.trim()
          ? page.extract.trim()
          : null,
      imageUrl: image,
      articleUrl: articleUrl(title),
      rank: typeof page.index === 'number' ? page.index : places.length + 1,
    });
  }
  return places
    .sort((a, b) => a.rank - b.rank)
    .map(({ rank: _rank, ...place }) => place);
}

function mergePlaces(primary: FamousPlace[], extra: FamousPlace[]) {
  const seen = new Set(primary.map(place => place.id));
  return [...primary, ...extra.filter(place => !seen.has(place.id))].slice(
    0,
    MAX_PLACES,
  );
}

export const famousPlacesApi = api.injectEndpoints({
  endpoints: build => ({
    getFamousPlaces: build.query<FamousPlace[], { code: string; name: string }>(
      {
        keepUnusedDataFor: 3600,
        async queryFn({ name }, _api, _options, baseQuery) {
          const request = (search: string) =>
            baseQuery({
              url: wikipediaEndpoint,
              params: famousPlacesParams(search),
              // Wikimedia rejects generic HTTP-client agents (403), so identify
              // the app as its API etiquette policy asks.
              headers: {
                'User-Agent': wikimediaUserAgent,
                'Api-User-Agent': wikimediaUserAgent,
              },
              timeout: 20000,
            });

          const first = await request(famousPlacesSearch(name));
          if (first.error) {
            return { error: first.error };
          }
          const places = normalizeFamousPlaces(first.data, name);
          if (!places) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: 'Invalid famous places response.',
              },
            };
          }
          if (places.length >= 4) {
            return { data: places.slice(0, MAX_PLACES) };
          }
          const second = await request(fallbackPlacesSearch(name));
          const extra = second.error
            ? []
            : normalizeFamousPlaces(second.data, name) ?? [];
          return { data: mergePlaces(places, extra) };
        },
      },
    ),
  }),
});

export const { useGetFamousPlacesQuery } = famousPlacesApi;
