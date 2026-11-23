/**
 * Google Maps link & embed URL utility functions
 */

export interface ParsedMapResult {
  mapUrl: string;
  embedUrl: string;
}

export const DEFAULT_OFFICE_ADDRESS =
  'Soren Kunj, Bajra - Bariatu Road, Morabadi, Ranchi, Jharkhand 834008';
export const DEFAULT_OFFICE_MAP_URL =
  'https://maps.app.goo.gl/YycvaTm3dYoeduYF6?g_st=aw';
export const DEFAULT_OFFICE_MAP_COORDINATES = '23.429047,85.350092';
export const DEFAULT_OFFICE_MAP_EMBED_URL =
  'https://maps.google.com/maps?q=23.429047,85.350092+(B2+Transport+Office)&t=&z=16&ie=UTF8&iwloc=&output=embed';

/**
 * Intelligent parser that converts any Google Maps link, iframe embed snippet,
 * place URL, coordinates, or textual location query into a valid Google Map direct URL
 * and a valid embeddable iframe URL.
 */
export function parseGoogleMapInput(
  input?: string | null,
  fallbackAddress: string = DEFAULT_OFFICE_ADDRESS
): ParsedMapResult {
  if (!input || !input.trim()) {
    return {
      mapUrl: DEFAULT_OFFICE_MAP_URL,
      embedUrl: DEFAULT_OFFICE_MAP_EMBED_URL,
    };
  }

  const trimmed = input.trim();

  // 1. Check if user pasted an <iframe>...</iframe> snippet
  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    const srcUrl = iframeSrcMatch[1].trim();
    return {
      mapUrl: srcUrl.includes('output=embed') ? DEFAULT_OFFICE_MAP_URL : srcUrl,
      embedUrl: srcUrl,
    };
  }

  // 2. Check if already an embed URL (e.g. google.com/maps/embed... or output=embed)
  if (trimmed.includes('/maps/embed') || trimmed.includes('output=embed')) {
    return {
      mapUrl: trimmed,
      embedUrl: trimmed,
    };
  }

  // 3. Check for coordinates in URL: @23.3965,85.3360 or 23.3965,85.3360
  const coordsMatch = trimmed.match(/@?([0-9]{1,2}\.[0-9]+,[0-9]{1,3}\.[0-9]+)/);
  if (coordsMatch && coordsMatch[1]) {
    return {
      mapUrl: `https://maps.google.com/?q=${coordsMatch[1]}`,
      embedUrl: `https://maps.google.com/maps?q=${coordsMatch[1]}+(B2+Transport+Office)&t=&z=16&ie=UTF8&iwloc=&output=embed`,
    };
  }

  // 4. Check for Google Maps place link: /place/Place+Name/@lat,lng
  const placeMatch = trimmed.match(/\/place\/([^/@?]+)/);
  if (placeMatch && placeMatch[1]) {
    try {
      const place = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      return {
        mapUrl: trimmed,
        embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(
          place
        )}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
      };
    } catch {
      // ignore decode error and continue
    }
  }

  // 5. Check for query parameter in URL: ?q=... or ?query=...
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsedUrl = new URL(trimmed);
      const q = parsedUrl.searchParams.get('q') || parsedUrl.searchParams.get('query');
      if (q) {
        return {
          mapUrl: trimmed,
          embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(
            q
          )}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
        };
      }
    } catch {
      // not a valid standard URL object, proceed
    }
  }

  // 6. Check for Google shortlink (maps.app.goo.gl or goo.gl/maps)
  if (trimmed.includes('maps.app.goo.gl') || trimmed.includes('goo.gl/maps')) {
    if (trimmed.includes('YycvaTm3dYoeduYF6')) {
      return {
        mapUrl: trimmed,
        embedUrl: DEFAULT_OFFICE_MAP_EMBED_URL,
      };
    }
    const fallbackQuery = fallbackAddress?.trim() || DEFAULT_OFFICE_MAP_COORDINATES;
    return {
      mapUrl: trimmed,
      embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(
        fallbackQuery
      )}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
    };
  }

  // 7. Plain text location name / address (e.g. "Soren Kunj, Morabadi, Ranchi")
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return {
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`,
      embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(
        trimmed
      )}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
    };
  }

  // 8. General fallback for any other URL
  const fallbackQuery = fallbackAddress?.trim() || '23.3965,85.3360';
  return {
    mapUrl: trimmed,
    embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(
      fallbackQuery
    )}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
  };
}
