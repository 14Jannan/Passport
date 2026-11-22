import { EmptyState } from '../../components/EmptyState';
import { ScreenLayout } from '../../components/ScreenLayout';

export function SavedScreen() {
  return (
    <ScreenLayout>
      <EmptyState
        title="Saved destinations"
        description="Places you save will appear here."
      />
    </ScreenLayout>
  );
}
