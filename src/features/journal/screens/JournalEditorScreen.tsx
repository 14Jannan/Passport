import { Feather } from '@react-native-vector-icons/feather/static';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { AppButton } from '../../../components/AppButton';
import { FadeInView } from '../../../components/FadeInView';
import type { MainStackParams } from '../../../navigation/types';
import { useAppTheme } from '../../../theme/theme';
import { useGetCountriesQuery } from '../../countries/api/countriesApi';
import { useFavouriteToggle } from '../../favourites/hooks/useFavouriteToggle';
import { useIsFavourite } from '../../favourites/hooks/useFavourites';
import { JournalPhoto } from '../components/JournalPhoto';
import { useJournalEntry } from '../hooks/useJournal';
import {
  deleteJournalEntryWithPhoto,
  saveJournalEntry,
} from '../services/journalActions';
import {
  deleteJournalPhoto,
  persistJournalPhoto,
  pickJournalPhoto,
  type PhotoSource,
} from '../services/journalPhotos';
import {
  JOURNAL_NOTE_MAX,
  JournalError,
  type JournalPhotoChange,
} from '../types';

type Busy = 'camera' | 'library' | 'copying' | 'saving' | 'deleting' | null;
type Message = { kind: 'error' | 'success'; text: string } | null;

const busyLabels: Record<Exclude<Busy, null>, string> = {
  camera: 'Opening camera…',
  library: 'Opening your gallery…',
  copying: 'Saving a private copy of your photo…',
  saving: 'Saving your journal…',
  deleting: 'Deleting entry…',
};

export function JournalEditorScreen({
  navigation,
  route,
}: NativeStackScreenProps<MainStackParams, 'JournalEditor'>) {
  const code = route.params.countryCode;
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const entry = useJournalEntry(code);
  const isFavourite = useIsFavourite(code);
  const toggleFavourite = useFavouriteToggle();
  const userId = useAppSelector(state =>
    state.session.status === 'signedIn' ? state.session.user.id : null,
  );
  const { data: countries } = useGetCountriesQuery();
  const country = countries?.find(item => item.cca3 === code);
  const name = country?.commonName ?? code;

  const [note, setNote] = useState(entry?.note ?? '');
  const [photo, setPhoto] = useState<string | null>(entry?.photoUri ?? null);
  const [busy, setBusy] = useState<Busy>(null);
  const [message, setMessage] = useState<Message>(null);
  const [focused, setFocused] = useState(false);

  /** A copied photo not yet referenced by a saved entry. */
  const pendingPhoto = useRef<string | null>(null);
  const submitting = useRef(false);
  const allowLeave = useRef(false);

  const savedNote = entry?.note ?? '';
  const savedPhoto = entry?.photoUri ?? null;
  const dirty = note.trim() !== savedNote || photo !== savedPhoto;
  const canSave = !!note.trim() || !!photo;

  // Never leave an unsaved copy behind when the editor closes.
  useEffect(
    () => () => {
      if (pendingPhoto.current) {
        deleteJournalPhoto(pendingPhoto.current);
      }
    },
    [],
  );

  // Protect unsaved notes and photos from accidental back navigation.
  useEffect(
    () =>
      navigation.addListener('beforeRemove', event => {
        if (allowLeave.current || !dirty) {
          return;
        }
        event.preventDefault();
        Alert.alert(
          'Discard changes?',
          'Your unsaved note and photo changes will be lost.',
          [
            { text: 'Keep editing', style: 'cancel' },
            {
              text: 'Discard',
              style: 'destructive',
              onPress: () => {
                allowLeave.current = true;
                navigation.dispatch(event.data.action);
              },
            },
          ],
        );
      }),
    [dirty, navigation],
  );

  function discardPending() {
    if (pendingPhoto.current) {
      deleteJournalPhoto(pendingPhoto.current);
      pendingPhoto.current = null;
    }
  }

  async function choosePhoto(source: PhotoSource) {
    if (busy || userId === null) {
      return;
    }
    setMessage(null);
    setBusy(source);
    const outcome = await pickJournalPhoto(source);
    if (outcome.status === 'cancelled') {
      setBusy(null);
      return;
    }
    if (outcome.status === 'error') {
      setBusy(null);
      setMessage({ kind: 'error', text: outcome.message });
      return;
    }
    setBusy('copying');
    try {
      const uri = await persistJournalPhoto(userId, code, outcome.photo);
      discardPending();
      pendingPhoto.current = uri;
      setPhoto(uri);
    } catch {
      setMessage({
        kind: 'error',
        text: 'Could not store that photo on your device. Free up some space and try again.',
      });
    } finally {
      setBusy(null);
    }
  }

  function replacePhoto() {
    Alert.alert('Replace photo', 'Where should the new photo come from?', [
      { text: 'Take Photo', onPress: () => choosePhoto('camera') },
      { text: 'Choose from Gallery', onPress: () => choosePhoto('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function removePhoto() {
    discardPending();
    setPhoto(null);
  }

  async function save() {
    if (submitting.current || busy) {
      return;
    }
    submitting.current = true;
    setBusy('saving');
    setMessage(null);
    const change: JournalPhotoChange =
      photo === savedPhoto
        ? { kind: 'keep' }
        : photo
        ? { kind: 'set', uri: photo }
        : { kind: 'remove' };
    try {
      await dispatch(
        saveJournalEntry({ countryCode: code, note, photo: change }),
      );
      pendingPhoto.current = null;
      allowLeave.current = true;
      setMessage({ kind: 'success', text: 'Journal saved' });
      setTimeout(() => navigation.goBack(), 500);
    } catch (error) {
      submitting.current = false;
      setBusy(null);
      setMessage({
        kind: 'error',
        text:
          error instanceof JournalError
            ? error.message
            : 'Could not save your journal entry. Try again.',
      });
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Delete journal entry?',
      `Your note and photo for ${name} will be permanently deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBusy('deleting');
            try {
              await dispatch(deleteJournalEntryWithPhoto(code));
              allowLeave.current = true;
              navigation.goBack();
            } catch (error) {
              setBusy(null);
              setMessage({
                kind: 'error',
                text:
                  error instanceof JournalError
                    ? error.message
                    : 'Could not delete the entry.',
              });
            }
          },
        },
      ],
    );
  }

  const remaining = JOURNAL_NOTE_MAX - note.length;
  const working = busy !== null;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 32 },
        ]}
      >
        {/* Header */}
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={[
              styles.iconButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View style={styles.countryPill}>
            {country?.flagUrl ? (
              <Image
                source={{ uri: country.flagUrl }}
                accessibilityLabel={country.flagAlt ?? `Flag of ${name}`}
                style={styles.flag}
              />
            ) : (
              <Feather name="flag" size={16} color={colors.primary} />
            )}
            <Text
              numberOfLines={1}
              style={[styles.countryName, { color: colors.text }]}
            >
              {name}
            </Text>
          </View>
        </View>

        <FadeInView style={styles.titleBlock}>
          <Text style={[styles.kicker, { color: colors.gold }]}>
            {entry ? 'EDIT JOURNAL' : 'NEW JOURNAL ENTRY'}
          </Text>
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: colors.text }]}
          >
            Capture your journey
          </Text>
        </FadeInView>

        {!isFavourite ? (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.body, { color: colors.text }]}>
              Journal entries belong to favourite countries. Save {name} to your
              favourites to attach a note and photo.
            </Text>
            <AppButton
              label="Save to Favourites"
              onPress={() => toggleFavourite(code, name)}
            />
          </View>
        ) : (
          <>
            {/* Note */}
            <FadeInView
              delay={60}
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: focused ? colors.primary : colors.border,
                },
                theme.shadows.sm,
              ]}
            >
              <View style={styles.cardHeader}>
                <Feather name="edit-3" size={18} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Your note
                </Text>
              </View>
              <TextInput
                accessibilityLabel="Journal note"
                value={note}
                onChangeText={setNote}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Write your travel thoughts, plans or memories..."
                placeholderTextColor={colors.muted}
                multiline
                maxLength={JOURNAL_NOTE_MAX}
                textAlignVertical="top"
                editable={busy !== 'saving' && busy !== 'deleting'}
                style={[
                  styles.noteInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.surfaceSecondary,
                  },
                ]}
              />
              <Text
                accessibilityLabel={`${remaining} characters remaining`}
                style={[
                  styles.counter,
                  { color: remaining < 50 ? colors.accent : colors.muted },
                ]}
              >
                {note.length}/{JOURNAL_NOTE_MAX}
              </Text>
            </FadeInView>

            {/* Photo */}
            <FadeInView
              delay={120}
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
                theme.shadows.sm,
              ]}
            >
              <View style={styles.cardHeader}>
                <Feather name="camera" size={18} color={colors.accent} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Travel photo
                </Text>
              </View>

              {photo ? (
                <>
                  <JournalPhoto
                    uri={photo}
                    label={`Selected photo for ${name}`}
                    style={styles.preview}
                  />
                  <View style={styles.photoActions}>
                    <PhotoActionButton
                      icon="refresh-cw"
                      label="Replace Photo"
                      onPress={replacePhoto}
                      disabled={working}
                    />
                    <PhotoActionButton
                      icon="trash-2"
                      label="Remove Photo"
                      onPress={removePhoto}
                      disabled={working}
                      danger
                    />
                  </View>
                </>
              ) : (
                <View style={styles.sourceRow}>
                  <SourceTile
                    icon="camera"
                    label="Take Photo"
                    onPress={() => choosePhoto('camera')}
                    disabled={working}
                  />
                  <SourceTile
                    icon="image"
                    label="Choose from Gallery"
                    onPress={() => choosePhoto('library')}
                    disabled={working}
                  />
                </View>
              )}
            </FadeInView>

            {busy && (
              <View
                accessible
                accessibilityRole="progressbar"
                accessibilityLabel={busyLabels[busy]}
                style={styles.busyRow}
              >
                <ActivityIndicator color={colors.primary} />
                <Text style={{ color: colors.muted }}>{busyLabels[busy]}</Text>
              </View>
            )}

            {message && (
              <View
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                style={[
                  styles.message,
                  {
                    backgroundColor:
                      (message.kind === 'error'
                        ? colors.error
                        : colors.success) + '1F',
                  },
                ]}
              >
                <Feather
                  name={
                    message.kind === 'error' ? 'alert-circle' : 'check-circle'
                  }
                  size={16}
                  color={
                    message.kind === 'error' ? colors.error : colors.success
                  }
                />
                <Text
                  style={[
                    styles.messageText,
                    {
                      color:
                        message.kind === 'error'
                          ? colors.error
                          : colors.success,
                    },
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <AppButton
                label="Save Journal"
                onPress={save}
                loading={busy === 'saving'}
                disabled={!canSave || !dirty || (working && busy !== 'saving')}
              />
              <AppButton
                label="Cancel"
                variant="outline"
                onPress={() => navigation.goBack()}
                disabled={busy === 'saving' || busy === 'deleting'}
              />
              {entry && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Delete journal entry"
                  onPress={confirmDelete}
                  disabled={working}
                  style={({ pressed }) => [
                    styles.deleteButton,
                    { opacity: pressed || working ? 0.6 : 1 },
                  ]}
                >
                  <Feather name="trash" size={16} color={colors.error} />
                  <Text style={[styles.deleteText, { color: colors.error }]}>
                    Delete Entry
                  </Text>
                </Pressable>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SourceTile({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: 'camera' | 'image';
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  const { theme, dark } = useAppTheme();
  const { colors } = theme;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.sourceTile,
        {
          backgroundColor: dark ? colors.surfaceSecondary : colors.softMint,
          borderColor: colors.primary + '55',
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={[styles.sourceIcon, { backgroundColor: colors.primary }]}>
        <Feather name={icon} size={22} color={colors.onPrimary} />
      </View>
      <Text style={[styles.sourceLabel, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

function PhotoActionButton({
  icon,
  label,
  onPress,
  disabled,
  danger = false,
}: {
  icon: 'refresh-cw' | 'trash-2';
  label: string;
  onPress: () => void;
  disabled: boolean;
  danger?: boolean;
}) {
  const { theme } = useAppTheme();
  const color = danger ? theme.colors.error : theme.colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.photoAction,
        { borderColor: color, opacity: disabled ? 0.5 : pressed ? 0.75 : 1 },
      ]}
    >
      <Feather name={icon} size={16} color={color} />
      <Text style={[styles.photoActionText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    gap: 16,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryPill: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  flag: { width: 32, height: 22, borderRadius: 4 },
  countryName: { fontSize: 18, fontWeight: '700', flexShrink: 1 },
  titleBlock: { gap: 4 },
  kicker: { fontSize: 12, fontWeight: '800', letterSpacing: 1.6 },
  title: { fontSize: 32, fontWeight: '800', lineHeight: 38 },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 22 },
  noteInput: {
    minHeight: 150,
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    lineHeight: 23,
  },
  counter: { alignSelf: 'flex-end', fontSize: 12, fontWeight: '600' },
  preview: { height: 260 },
  photoActions: { flexDirection: 'row', gap: 10 },
  photoAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  photoActionText: { fontSize: 14, fontWeight: '700' },
  sourceRow: { flexDirection: 'row', gap: 12 },
  sourceTile: {
    flex: 1,
    minHeight: 130,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 12,
  },
  sourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceLabel: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  busyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
  },
  messageText: { flex: 1, fontSize: 14, fontWeight: '600' },
  actions: { gap: 12 },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 48,
  },
  deleteText: { fontSize: 15, fontWeight: '700' },
});
