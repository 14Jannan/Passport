import { useNavigation } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { AppTextInput } from '../../components/AppTextInput';
import { EmptyState } from '../../components/EmptyState';
import { ScreenLayout } from '../../components/ScreenLayout';
import type { MainStackParams } from '../../navigation/types';
import { useAppTheme } from '../../theme/theme';

export function JournalScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParams>>();
  const { theme } = useAppTheme();

  return (
    <ScreenLayout>
      <EmptyState
        icon="book-open"
        title="Travel journal"
        description="Capture your adventures, stories, and personal memories for each destination you visit."
      />
      <View style={styles.actionRow}>
        <AppButton
          label="New entry"
          onPress={() => navigation.navigate('EditJournalEntry')}
        />
        <AppButton
          label="Preview entry"
          variant="secondary"
          onPress={() =>
            navigation.navigate('JournalEntry', { entryId: 'sample' })
          }
        />
      </View>
      <View
        style={[
          styles.placeholderCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
          theme.shadows.sm,
        ]}
      >
        <Text style={[styles.placeholderTitle, { color: theme.colors.text }]}>
          Coming in Prompt 6
        </Text>
        <Text style={[styles.placeholderDesc, { color: theme.colors.muted }]}>
          Photo attachments, local image storage, personal notes, and travel
          memoirs will be fully integrated here.
        </Text>
      </View>
    </ScreenLayout>
  );
}

export function JournalEntryScreen({
  navigation,
  route,
}: NativeStackScreenProps<MainStackParams, 'JournalEntry'>) {
  return (
    <ScreenLayout>
      <EmptyState
        icon="file-text"
        title="Journal entry"
        description="Your notes, travel memories, and destination photos will appear here."
      />
      <AppButton
        label="Edit entry"
        onPress={() =>
          navigation.navigate('EditJournalEntry', {
            entryId: route.params.entryId,
          })
        }
      />
    </ScreenLayout>
  );
}

export function EditJournalEntryScreen({
  route,
}: NativeStackScreenProps<MainStackParams, 'EditJournalEntry'>) {
  return (
    <ScreenLayout>
      <EmptyState
        icon="edit-3"
        title={route.params?.entryId ? 'Edit entry' : 'New entry'}
        description="Preview the journal editor. Drafts and personal entries will be stored locally."
      />
      <AppTextInput label="Title" placeholder="e.g. Sunset over Mount Fuji" />
      <AppTextInput
        label="Travel notes"
        placeholder="Write down memories, local food, and tips..."
        multiline
        style={styles.notesInput}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    gap: 12,
  },
  notesInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  placeholderCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
    marginTop: 8,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  placeholderDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
});
