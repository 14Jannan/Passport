import { useNavigation } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { AppTextInput } from '../../components/AppTextInput';
import { EmptyState } from '../../components/EmptyState';
import { ScreenLayout } from '../../components/ScreenLayout';
import type { MainStackParams } from '../../navigation/types';

export function JournalScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParams>>();
  return (
    <ScreenLayout>
      <EmptyState
        title="Travel journal"
        description="Keep your travel memories in one place."
      />
      <AppButton
        label="New entry"
        onPress={() => navigation.navigate('EditJournalEntry')}
      />
      <AppButton
        label="Preview entry"
        onPress={() =>
          navigation.navigate('JournalEntry', { entryId: 'sample' })
        }
      />
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
        title="Journal entry"
        description="Your notes and photos will appear here."
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
        title={route.params?.entryId ? 'Edit entry' : 'New entry'}
        description="Preview the journal editor. Drafts are cleared when you leave."
      />
      <AppTextInput label="Title" />
      <AppTextInput label="Travel notes" multiline />
    </ScreenLayout>
  );
}
