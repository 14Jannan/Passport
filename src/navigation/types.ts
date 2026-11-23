import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParams = {
  SignIn: { registered?: boolean } | undefined;
  Register: undefined;
};

export type TabParams = {
  Discover: undefined;
  Saved: undefined;
  Bucket: undefined;
  Journal: undefined;
  Profile: undefined;
};

export type MainStackParams = {
  Home: NavigatorScreenParams<TabParams> | undefined;
  CountryDetails: { countryCode: string };
  JournalEditor: { countryCode: string };
  Settings: undefined;
};
