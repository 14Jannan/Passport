import { Dirs, FileSystem } from 'react-native-file-access';
import {
  launchCamera,
  launchImageLibrary,
  type CameraOptions,
  type ImagePickerResponse,
} from 'react-native-image-picker';

/** Largest accepted photo after picker-side resizing. */
export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;

export type PhotoSource = 'camera' | 'library';

export interface PickedPhoto {
  uri: string;
  fileName: string | null;
  type: string | null;
  fileSize: number | null;
}

export type PhotoErrorReason =
  | 'camera_unavailable'
  | 'permission'
  | 'invalid'
  | 'too_large'
  | 'unknown';

export type PhotoPickOutcome =
  | { status: 'picked'; photo: PickedPhoto }
  | { status: 'cancelled' }
  | { status: 'error'; reason: PhotoErrorReason; message: string };

/**
 * Resize on the picker side so stored photos stay small (≈ 1600px, 80% JPEG
 * quality) and no base64 payload crosses the bridge.
 */
const pickerOptions: CameraOptions = {
  mediaType: 'photo',
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.8,
  includeBase64: false,
  saveToPhotos: false,
};

const errorMessages: Record<PhotoErrorReason, string> = {
  camera_unavailable:
    'No camera is available on this device. Choose a photo from your gallery instead.',
  permission:
    'Passport does not have permission to use the camera or photos. Allow access in your device settings and try again.',
  invalid: 'That file could not be used as a photo. Try a different image.',
  too_large: 'That photo is too large. Choose an image under 15 MB.',
  unknown: 'Something went wrong while selecting the photo. Try again.',
};

export function photoError(reason: PhotoErrorReason): PhotoPickOutcome {
  return { status: 'error', reason, message: errorMessages[reason] };
}

/** Convert a raw image-picker response into a validated outcome. */
export function interpretPickerResponse(
  response: ImagePickerResponse | undefined,
): PhotoPickOutcome {
  if (!response || response.didCancel) {
    return { status: 'cancelled' };
  }
  if (response.errorCode === 'camera_unavailable') {
    return photoError('camera_unavailable');
  }
  if (response.errorCode === 'permission') {
    return photoError('permission');
  }
  if (response.errorCode) {
    return {
      status: 'error',
      reason: 'unknown',
      message: response.errorMessage || errorMessages.unknown,
    };
  }
  const asset = response.assets?.[0];
  if (!asset?.uri || !/^(file|content|ph):\/\//.test(asset.uri)) {
    return photoError('invalid');
  }
  if (asset.type && !asset.type.startsWith('image/')) {
    return photoError('invalid');
  }
  if (asset.fileSize && asset.fileSize > MAX_PHOTO_BYTES) {
    return photoError('too_large');
  }
  return {
    status: 'picked',
    photo: {
      uri: asset.uri,
      fileName: asset.fileName ?? null,
      type: asset.type ?? null,
      fileSize: asset.fileSize ?? null,
    },
  };
}

/** Open the device camera or the system photo picker for a single photo. */
export async function pickJournalPhoto(
  source: PhotoSource,
): Promise<PhotoPickOutcome> {
  try {
    const response =
      source === 'camera'
        ? await launchCamera({ ...pickerOptions, cameraType: 'back' })
        : await launchImageLibrary({ ...pickerOptions, selectionLimit: 1 });
    return interpretPickerResponse(response);
  } catch {
    return photoError(source === 'camera' ? 'camera_unavailable' : 'unknown');
  }
}

const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'gif'];

function extensionFor(photo: PickedPhoto) {
  const fromName = photo.fileName?.match(/\.([a-z\d]{1,5})$/i)?.[1];
  const fromType = photo.type?.split('/')[1];
  const candidate = (fromName ?? fromType ?? '').toLowerCase();
  return allowedExtensions.includes(candidate) ? candidate : 'jpg';
}

/** Root directory for journal photos (app-private, backed by DocumentDir). */
export function journalPhotoRoot(): string {
  return `${Dirs.DocumentDir}/journal`;
}

export function journalPhotoDir(userId: number): string {
  return `${journalPhotoRoot()}/${userId}`;
}

/** Unique, filesystem-safe name such as `JPN-1732350000000-k3j9x2.jpg`. */
export function safePhotoName(countryCode: string, photo: PickedPhoto) {
  const code = countryCode.replace(/[^A-Z]/gi, '').toUpperCase() || 'XXX';
  const random = Math.random().toString(36).slice(2, 8);
  return `${code}-${Date.now()}-${random}.${extensionFor(photo)}`;
}

function toPath(uri: string) {
  return uri.startsWith('file://') ? decodeURI(uri.slice(7)) : uri;
}

/** Only files Passport created inside its journal directory may be deleted. */
export function isManagedJournalPhoto(uri: string | null | undefined) {
  return (
    !!uri &&
    uri.startsWith(`file://${journalPhotoRoot()}/`) &&
    !uri.includes('..')
  );
}

/**
 * Copy a temporary picker photo into persistent app storage and return its
 * permanent `file://` URI. The temporary URI is never stored.
 */
export async function persistJournalPhoto(
  userId: number,
  countryCode: string,
  photo: PickedPhoto,
): Promise<string> {
  const dir = journalPhotoDir(userId);
  if (!(await FileSystem.exists(dir))) {
    await FileSystem.mkdir(dir);
  }
  const target = `${dir}/${safePhotoName(countryCode, photo)}`;
  await FileSystem.cp(toPath(photo.uri), target);
  if (!(await FileSystem.exists(target))) {
    throw new Error('Photo copy could not be verified.');
  }
  return `file://${target}`;
}

export async function journalPhotoExists(uri: string): Promise<boolean> {
  try {
    return await FileSystem.exists(toPath(uri));
  } catch {
    return false;
  }
}

/** Best-effort delete of a managed journal photo. Never throws. */
export async function deleteJournalPhoto(
  uri: string | null | undefined,
): Promise<void> {
  if (!uri || !isManagedJournalPhoto(uri)) {
    return;
  }
  try {
    const path = toPath(uri);
    if (await FileSystem.exists(path)) {
      await FileSystem.unlink(path);
    }
  } catch {
    // A leftover file is collected by the next orphan sweep.
  }
}

/**
 * Remove photos in the user's journal directory that no entry references,
 * e.g. copies left behind when the app closed during editing.
 */
export async function cleanupOrphanJournalPhotos(
  userId: number,
  referenced: Array<string | null>,
): Promise<number> {
  const dir = journalPhotoDir(userId);
  try {
    if (!(await FileSystem.exists(dir))) {
      return 0;
    }
    const keep = new Set(referenced.filter(Boolean));
    let removed = 0;
    for (const name of await FileSystem.ls(dir)) {
      const uri = `file://${dir}/${name}`;
      if (!keep.has(uri)) {
        await FileSystem.unlink(`${dir}/${name}`);
        removed += 1;
      }
    }
    return removed;
  } catch {
    return 0;
  }
}
