import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { AppTextInput } from '../../components/AppTextInput';
import { EmptyState } from '../../components/EmptyState';
import { ScreenLayout } from '../../components/ScreenLayout';
import type { MainStackParams } from '../../navigation/types';

export function DiscoverScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParams>>();
  return (
    <ScreenLayout>
      <EmptyState
        title="Discover"
        description="Find a place for your next trip."
      />
      <AppButton
        label="Search destinations"
        onPress={() => navigation.navigate('Search')}
      />
      <AppButton
        label="Preview destination"
        onPress={() =>
          navigation.navigate('DestinationDetails', { destinationId: 'sample' })
        }
      />
    </ScreenLayout>
  );
}

export function SearchScreen() {
  return (
    <ScreenLayout>
      <EmptyState
        title="Search"
        description="Destination search will be available when the travel catalog is connected."
      />
      <AppTextInput
        label="Destination"
        placeholder="Enter a city or country"
        editable={false}
      />
    </ScreenLayout>
  );
}

export function DestinationDetailsScreen() {
  return (
    <ScreenLayout>
      <EmptyState
        title="Destination details"
        description="Travel guides and place information will appear here."
      />
    </ScreenLayout>
  );
}
