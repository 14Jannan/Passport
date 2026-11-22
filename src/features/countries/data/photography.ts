/**
 * Curated destination travel photography directory.
 *
 * All images are licensed under the Unsplash License (free for commercial and
 * non-commercial use, no permission needed).
 * Attribution details are recorded below for ethical credit and transparency.
 */

export interface DestinationPhoto {
  imageUrl: string;
  thumbnailUrl: string;
  photographer: string;
  photographerUrl: string;
  location: string;
  title: string;
  license: string;
}

export const destinationPhotos: Record<string, DestinationPhoto> = {
  JPN: {
    imageUrl:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80&auto=format&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=75&auto=format&fit=crop',
    photographer: 'David Becker',
    photographerUrl: 'https://unsplash.com/@becker_david',
    location: 'Mount Fuji, Japan',
    title: 'Chureito Pagoda and Mount Fuji',
    license: 'Unsplash License',
  },
  LKA: {
    imageUrl:
      'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=1200&q=80&auto=format&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=600&q=75&auto=format&fit=crop',
    photographer: 'Dylan Shaw',
    photographerUrl: 'https://unsplash.com/@dylanshaw',
    location: 'Sigiriya Rock Fortress, Sri Lanka',
    title: 'Ancient Palace Fortress of Sigiriya',
    license: 'Unsplash License',
  },
  FRA: {
    imageUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80&auto=format&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=75&auto=format&fit=crop',
    photographer: 'Chris Karidis',
    photographerUrl: 'https://unsplash.com/@chriskaridis',
    location: 'Paris, France',
    title: 'Eiffel Tower at Twilight',
    license: 'Unsplash License',
  },
  CAN: {
    imageUrl:
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&q=80&auto=format&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=75&auto=format&fit=crop',
    photographer: 'Kalep Tatu',
    photographerUrl: 'https://unsplash.com/@kaleptatu',
    location: 'Moraine Lake, Banff, Canada',
    title: 'Valley of the Ten Peaks',
    license: 'Unsplash License',
  },
  AUS: {
    imageUrl:
      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=80&auto=format&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=75&auto=format&fit=crop',
    photographer: 'Dan Freeman',
    photographerUrl: 'https://unsplash.com/@danfreemanphoto',
    location: 'Sydney Harbour, Australia',
    title: 'Sydney Opera House Panorama',
    license: 'Unsplash License',
  },
  ITA: {
    imageUrl:
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80&auto=format&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=75&auto=format&fit=crop',
    photographer: 'David Kohler',
    photographerUrl: 'https://unsplash.com/@dkohler',
    location: 'Rome, Italy',
    title: 'The Roman Colosseum',
    license: 'Unsplash License',
  },
  CHE: {
    imageUrl:
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200&q=80&auto=format&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=600&q=75&auto=format&fit=crop',
    photographer: 'Dino Reichmuth',
    photographerUrl: 'https://unsplash.com/@dinoreichmuth',
    location: 'Zermatt, Switzerland',
    title: 'The Iconic Matterhorn Peak',
    license: 'Unsplash License',
  },
  BRA: {
    imageUrl:
      'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&q=80&auto=format&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&q=75&auto=format&fit=crop',
    photographer: 'Agustin Diaz Gargiulo',
    photographerUrl: 'https://unsplash.com/@agustindiazg',
    location: 'Rio de Janeiro, Brazil',
    title: 'Christ the Redeemer & Sugarloaf',
    license: 'Unsplash License',
  },
  USA: {
    imageUrl:
      'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=1200&q=80&auto=format&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=600&q=75&auto=format&fit=crop',
    photographer: 'Gerd Eichmann',
    photographerUrl: 'https://unsplash.com/@gerdeichmann',
    location: 'Grand Canyon, Arizona, USA',
    title: 'Grand Canyon Sunset Vista',
    license: 'Unsplash License',
  },
  GBR: {
    imageUrl:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80&auto=format&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=75&auto=format&fit=crop',
    photographer: 'Eva Dang',
    photographerUrl: 'https://unsplash.com/@evadan',
    location: 'London, United Kingdom',
    title: 'Big Ben and Westminster Bridge',
    license: 'Unsplash License',
  },
  ESP: {
    imageUrl:
      'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&q=80&auto=format&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=75&auto=format&fit=crop',
    photographer: 'Enes',
    photographerUrl: 'https://unsplash.com/@enes',
    location: 'Barcelona, Spain',
    title: 'Basilica de la Sagrada Familia',
    license: 'Unsplash License',
  },
  DEU: {
    imageUrl:
      'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80&auto=format&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&q=75&auto=format&fit=crop',
    photographer: 'Daniel Seßler',
    photographerUrl: 'https://unsplash.com/@danielsessler',
    location: 'Bavaria, Germany',
    title: 'Neuschwanstein Castle',
    license: 'Unsplash License',
  },
  EGY: {
    imageUrl:
      'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1200&q=80&auto=format&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=600&q=75&auto=format&fit=crop',
    photographer: 'Simon Berger',
    photographerUrl: 'https://unsplash.com/@simonberger',
    location: 'Giza, Egypt',
    title: 'The Great Pyramids of Giza',
    license: 'Unsplash License',
  },
  IND: {
    imageUrl:
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80&auto=format&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=75&auto=format&fit=crop',
    photographer: 'Jovyn Chamb',
    photographerUrl: 'https://unsplash.com/@jovynchamb',
    location: 'Agra, India',
    title: 'The Taj Mahal at Sunrise',
    license: 'Unsplash License',
  },
  GRC: {
    imageUrl:
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80&auto=format&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=75&auto=format&fit=crop',
    photographer: 'Matthew Waring',
    photographerUrl: 'https://unsplash.com/@matthewwaring',
    location: 'Santorini, Greece',
    title: 'Blue Domes of Oia',
    license: 'Unsplash License',
  },
  ISL: {
    imageUrl:
      'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1200&q=80&auto=format&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600&q=75&auto=format&fit=crop',
    photographer: 'Jonatan Pie',
    photographerUrl: 'https://unsplash.com/@jonatanpie',
    location: 'South Coast, Iceland',
    title: 'Aurora Borealis over Waterfalls',
    license: 'Unsplash License',
  },
  NZL: {
    imageUrl:
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80&auto=format&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=75&auto=format&fit=crop',
    photographer: 'Tobias Keller',
    photographerUrl: 'https://unsplash.com/@tobiasreich',
    location: 'Fiordland, New Zealand',
    title: 'Milford Sound Peaks',
    license: 'Unsplash License',
  },
  NOR: {
    imageUrl:
      'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?w=1200&q=80&auto=format&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?w=600&q=75&auto=format&fit=crop',
    photographer: 'Jarand K. Løkeland',
    photographerUrl: 'https://unsplash.com/@jarand',
    location: 'Western Fjords, Norway',
    title: 'Fjord Reflections',
    license: 'Unsplash License',
  },
  THA: {
    imageUrl:
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&q=80&auto=format&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=75&auto=format&fit=crop',
    photographer: 'Sara Dubler',
    photographerUrl: 'https://unsplash.com/@saradubler',
    location: 'Krabi, Thailand',
    title: 'Phi Phi Islands Emerald Waters',
    license: 'Unsplash License',
  },
  ZAF: {
    imageUrl:
      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1200&q=80&auto=format&fit=crop',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&q=75&auto=format&fit=crop',
    photographer: 'Kobus van der Walt',
    photographerUrl: 'https://unsplash.com/@kobus',
    location: 'Cape Town, South Africa',
    title: 'Table Mountain at Sunset',
    license: 'Unsplash License',
  },
};

/**
 * Get curated travel photography for a country by its ISO alpha-3 code.
 */
export function getCountryPhotography(
  countryCode: string | undefined | null,
): DestinationPhoto | null {
  if (!countryCode) {
    return null;
  }
  const code = countryCode.trim().toUpperCase();
  return destinationPhotos[code] ?? null;
}
