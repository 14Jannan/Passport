import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/app/store';
import { useQueryListeners } from './src/app/useQueryListeners';
import { useSessionLifecycle } from './src/features/auth/hooks/useSessionLifecycle';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAppTheme } from './src/theme/theme';

function AppContent() {
  useQueryListeners();
  useSessionLifecycle();
  const { dark } = useAppTheme();
  return (
    <>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}
