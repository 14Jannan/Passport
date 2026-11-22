import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParams = {
  SignIn: { registered?: boolean } | undefined;
  Register: undefined;
};

export type TabParams = {
  Discover: undefined;
  Saved: undefined;
  Journal: undefined;
  Profile: undefined;
};

export type MainStackParams = {
  Home: NavigatorScreenParams<TabParams> | undefined;
  DestinationDetails: { destinationId: string };
  Search: undefined;
  JournalEntry: { entryId: string };
  EditJournalEntry: { entryId?: string } | undefined;
  Settings: undefined;
};
