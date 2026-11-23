import { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  View,
  type ImageStyle,
  type StyleProp,
} from 'react-native';
import { Dirs, FileSystem } from 'react-native-file-access';
import { wikimediaUserAgent } from '../api/famousPlacesApi';

/** In-flight and finished downloads, shared across components. */
const downloads = new Map<string, Promise<string | null>>();

function cacheName(url: string) {
  let hash = 0;
  for (let i = 0; i < url.length; i += 1) {
    hash = (hash * 31 + url.charCodeAt(i)) % 2147483647;
  }
  const ext = url.match(/\.(jpe?g|png|webp|gif)(?:[?#]|$)/i)?.[1] ?? 'jpg';
  return `place-${hash.toString(36)}.${ext.toLowerCase()}`;
}

/**
 * Download a Wikimedia Commons photo into the app cache with an identifying
 * User-Agent. Commons answers generic image-loader agents with HTTP 403, and
 * the platform image loader cannot be relied on to forward custom headers.
 */
export function cacheCommonsImage(url: string): Promise<string | null> {
  const existing = downloads.get(url);
  if (existing) {
    return existing;
  }
  const task = (async () => {
    const dir = `${Dirs.CacheDir}/famous-places`;
    const path = `${dir}/${cacheName(url)}`;
    try {
      if (await FileSystem.exists(path)) {
        return `file://${path}`;
      }
      if (!(await FileSystem.exists(dir))) {
        await FileSystem.mkdir(dir);
      }
      const result = await FileSystem.fetch(url, {
        path,
        headers: { 'User-Agent': wikimediaUserAgent },
      });
      if (!result.ok) {
        await FileSystem.unlink(path).catch(() => {});
        return null;
      }
      return `file://${path}`;
    } catch {
      return null;
    }
  })();
  downloads.set(url, task);
  task.then(uri => {
    if (!uri) {
      downloads.delete(url);
    }
  });
  return task;
}

/** Image for a Commons URL, fading from a placeholder once cached. */
export function CommonsImage({
  url,
  label,
  style,
}: {
  url: string;
  label: string;
  style?: StyleProp<ImageStyle>;
}) {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    cacheCommonsImage(url).then(local => {
      if (active) {
        setUri(local);
      }
    });
    return () => {
      active = false;
    };
  }, [url]);

  return uri ? (
    <Image
      source={{ uri }}
      accessibilityLabel={label}
      resizeMode="cover"
      style={style}
    />
  ) : (
    <View
      accessibilityLabel={label}
      style={[StyleSheet.absoluteFill, style as object]}
    />
  );
}
