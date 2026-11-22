import { Dirs, FileSystem } from 'react-native-file-access';
import { launchImageLibrary } from 'react-native-image-picker';

export async function pickJournalPhoto() {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1,
  });
  if (result.didCancel) {
    return null;
  }
  const photo = result.assets?.[0];
  if (result.errorCode || !photo?.uri) {
    throw new Error(result.errorMessage ?? 'Could not select a photo.');
  }
  const extension = photo.fileName?.match(/\.([a-z\d]{1,8})$/i)?.[1];
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${Dirs.DocumentDir}/journal-${id}${
    extension ? `.${extension}` : ''
  }`;
  await FileSystem.cp(photo.uri, path);
  return `file://${path}`;
}
