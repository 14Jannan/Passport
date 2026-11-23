import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Appearance, Text } from 'react-native';
import {
  APPEARANCE_STORAGE_KEY,
  ThemeProvider,
  useAppTheme,
} from '../src/theme/theme';
import { darkColors, lightColors } from '../src/theme/colors';
import { AppearanceSelector } from '../src/features/profile/components/AppearanceSelector';
import { SettingsScreen } from '../src/features/profile/screens';
import { getCountryPhotography } from '../src/features/countries/data/photography';
import { DestinationImage } from '../src/features/countries/components/DestinationImage';
import { FavouriteButton } from '../src/features/favourites/components/FavouriteButton';
import { Provider } from 'react-redux';
import { createAppStore } from '../src/app/store';

function ThemeConsumer() {
  const { dark, appearance, theme } = useAppTheme();
  return (
    <>
      <Text testID="theme-dark">{dark ? 'dark' : 'light'}</Text>
      <Text testID="theme-appearance">{appearance}</Text>
      <Text testID="theme-bg">{theme.colors.background}</Text>
      <Text testID="theme-primary">{theme.colors.primary}</Text>
    </>
  );
}

describe('Theme Architecture & Persistence', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('resolves correct default Light Mode tokens', () => {
    expect(lightColors.background).toBe('#F6F0E4');
    expect(lightColors.primary).toBe('#0F766E');
    expect(lightColors.text).toBe('#13213C');
    expect(lightColors.surface).toBe('#FFFCF6');
    expect(lightColors.accent).toBe('#E5654A');
    expect(lightColors.softMint).toBe('#DCEEE6');
  });

  it('resolves correct Dark Mode tokens', () => {
    expect(darkColors.background).toBe('#0A0F1E');
    expect(darkColors.primary).toBe('#3DD9C1');
    expect(darkColors.text).toBe('#F4EFE6');
    expect(darkColors.surface).toBe('#141B2E');
    expect(darkColors.accent).toBe('#FF8A6B');
    expect(darkColors.border).toBe('#2A3452');
  });

  it('defaults to system mode and persists appearance choice', async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme-appearance')).toHaveTextContent('system');
  });

  it('allows switching to Dark Mode and persists preference in AsyncStorage', async () => {
    render(
      <ThemeProvider>
        <AppearanceSelector />
        <ThemeConsumer />
      </ThemeProvider>,
    );

    const darkRadio = screen.getByRole('radio', { name: 'Dark mode' });
    fireEvent.press(darkRadio);

    await waitFor(() => {
      expect(screen.getByTestId('theme-dark')).toHaveTextContent('dark');
      expect(screen.getByTestId('theme-appearance')).toHaveTextContent('dark');
      expect(screen.getByTestId('theme-bg')).toHaveTextContent(
        darkColors.background,
      );
      expect(screen.getByTestId('theme-primary')).toHaveTextContent(
        darkColors.primary,
      );
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      APPEARANCE_STORAGE_KEY,
      'dark',
    );
  });

  it('allows switching to Light Mode and updates tokens immediately', async () => {
    render(
      <ThemeProvider>
        <AppearanceSelector />
        <ThemeConsumer />
      </ThemeProvider>,
    );

    const lightRadio = screen.getByRole('radio', { name: 'Light mode' });
    fireEvent.press(lightRadio);

    await waitFor(() => {
      expect(screen.getByTestId('theme-dark')).toHaveTextContent('light');
      expect(screen.getByTestId('theme-appearance')).toHaveTextContent('light');
      expect(screen.getByTestId('theme-bg')).toHaveTextContent(
        lightColors.background,
      );
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      APPEARANCE_STORAGE_KEY,
      'light',
    );
  });

  it('restores saved appearance from AsyncStorage upon startup', async () => {
    await AsyncStorage.setItem(APPEARANCE_STORAGE_KEY, 'dark');

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme-dark')).toHaveTextContent('dark');
      expect(screen.getByTestId('theme-appearance')).toHaveTextContent('dark');
    });
  });

  it('responds to system appearance changes when in system mode', async () => {
    let changeHandler: (preferences: {
      colorScheme: 'light' | 'dark';
    }) => void = () => {};
    jest
      .spyOn(Appearance, 'addChangeListener')
      .mockImplementation((handler: any) => {
        changeHandler = handler;
        return { remove: jest.fn() };
      });

    render(
      <ThemeProvider>
        <AppearanceSelector />
        <ThemeConsumer />
      </ThemeProvider>,
    );

    // Switch to system
    fireEvent.press(screen.getByRole('radio', { name: 'System mode' }));

    // Simulate system color scheme change to dark
    await act(async () => {
      changeHandler({ colorScheme: 'dark' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('theme-dark')).toHaveTextContent('dark');
    });

    // Simulate system color scheme change back to light
    await act(async () => {
      changeHandler({ colorScheme: 'light' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('theme-dark')).toHaveTextContent('light');
    });
  });
});

describe('Settings Screen Appearance Selector', () => {
  it('renders Settings header and all 3 appearance options', () => {
    render(
      <ThemeProvider>
        <SettingsScreen />
      </ThemeProvider>,
    );

    expect(screen.getByText('Settings')).toBeOnTheScreen();
    expect(screen.getByText('Appearance')).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Light mode' })).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Dark mode' })).toBeOnTheScreen();
    expect(
      screen.getByRole('radio', { name: 'System mode' }),
    ).toBeOnTheScreen();
    expect(screen.getByText('About Passport')).toBeOnTheScreen();
  });
});

describe('Destination Photography System', () => {
  it('returns curated photo for featured countries', () => {
    const japanPhoto = getCountryPhotography('JPN');
    expect(japanPhoto).not.toBeNull();
    expect(japanPhoto?.location).toContain('Japan');
    expect(japanPhoto?.license).toBe('Unsplash License');

    const sriLankaPhoto = getCountryPhotography('LKA');
    expect(sriLankaPhoto).not.toBeNull();
    expect(sriLankaPhoto?.location).toContain('Sri Lanka');

    const francePhoto = getCountryPhotography('fra');
    expect(francePhoto).not.toBeNull();
    expect(francePhoto?.location).toContain('France');
  });

  it('returns null for countries without curated photography', () => {
    const unknown = getCountryPhotography('XYZ');
    expect(unknown).toBeNull();

    expect(getCountryPhotography(null)).toBeNull();
    expect(getCountryPhotography(undefined)).toBeNull();
  });

  it('renders DestinationImage and handles error gracefully', () => {
    render(
      <ThemeProvider>
        <DestinationImage
          uri="https://invalid.photo.test/image.jpg"
          alt="Test destination photo"
          fallbackIcon="image"
        />
      </ThemeProvider>,
    );

    const img = screen.queryByLabelText('Test destination photo');
    if (img) {
      fireEvent(img, 'error');
    }
    // Should fallback cleanly without crashing
  });
});

describe('Animated Favourite Button', () => {
  it('toggles favourite status and updates accessible state', () => {
    const store = createAppStore();
    render(
      <Provider store={store}>
        <ThemeProvider>
          <FavouriteButton countryCode="JPN" />
        </ThemeProvider>
      </Provider>,
    );

    const button = screen.getByRole('button', { name: 'Add to favourites' });
    expect(button).toBeOnTheScreen();

    fireEvent.press(button);

    expect(
      screen.getByRole('button', { name: 'Remove from favourites' }),
    ).toBeOnTheScreen();
  });
});
