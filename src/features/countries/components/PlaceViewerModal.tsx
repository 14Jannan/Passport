import { Feather } from '@react-native-vector-icons/feather/static';
import { useState } from 'react';
import {
  FlatList,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../theme/theme';
import type { FamousPlace } from '../api/famousPlacesApi';
import { CommonsImage } from './CommonsImage';

type Props = {
  places: FamousPlace[];
  /** Index to open at, or null when closed. */
  index: number | null;
  countryName: string;
  onClose: () => void;
};

/** Full-screen, swipeable gallery of a country's famous places. */
export function PlaceViewerModal({
  places,
  index,
  countryName,
  onClose,
}: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const [current, setCurrent] = useState(index ?? 0);
  const visible = index !== null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      onShow={() => setCurrent(index ?? 0)}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        {visible && (
          <FlatList
            data={places}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={index ?? 0}
            getItemLayout={(_, i) => ({
              length: width,
              offset: width * i,
              index: i,
            })}
            keyExtractor={item => item.id}
            onMomentumScrollEnd={event =>
              setCurrent(Math.round(event.nativeEvent.contentOffset.x / width))
            }
            renderItem={({ item }) => (
              <View style={{ width }}>
                <CommonsImage
                  url={item.imageUrl}
                  label={`Photo of ${item.title}`}
                  style={{ width, height: height * 0.55 }}
                />
                <ScrollView
                  style={styles.copyScroll}
                  contentContainerStyle={[
                    styles.copy,
                    { paddingBottom: insets.bottom + 24 },
                  ]}
                >
                  <Text style={[styles.kicker, { color: theme.colors.gold }]}>
                    {countryName.toUpperCase()}
                  </Text>
                  <Text accessibilityRole="header" style={styles.title}>
                    {item.title}
                  </Text>
                  {item.description && (
                    <Text style={styles.description}>{item.description}</Text>
                  )}
                  {item.summary && (
                    <Text style={styles.summary}>{item.summary}</Text>
                  )}
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={`Read about ${item.title} on Wikipedia`}
                    onPress={() =>
                      Linking.openURL(item.articleUrl).catch(() => {})
                    }
                    style={({ pressed }) => [
                      styles.link,
                      {
                        backgroundColor: theme.colors.primary,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <Feather
                      name="book-open"
                      size={16}
                      color={theme.colors.onPrimary}
                    />
                    <Text
                      style={[
                        styles.linkText,
                        { color: theme.colors.onPrimary },
                      ]}
                    >
                      Read on Wikipedia
                    </Text>
                  </Pressable>
                  <Text style={styles.credit}>
                    Photo via Wikimedia Commons · Text via Wikipedia (CC BY-SA)
                  </Text>
                </ScrollView>
              </View>
            )}
          />
        )}
        <View style={[styles.topBar, { top: insets.top + 8 }]}>
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {Math.min(current + 1, places.length)} / {places.length}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close photo viewer"
            onPress={onClose}
            style={styles.close}
          >
            <Feather name="x" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#05070D' },
  copyScroll: { flex: 1 },
  copy: { padding: 22, gap: 10 },
  kicker: { fontSize: 12, fontWeight: '800', letterSpacing: 1.6 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', lineHeight: 34 },
  description: { color: 'rgba(255,255,255,0.75)', fontSize: 15 },
  summary: { color: 'rgba(255,255,255,0.88)', fontSize: 15, lineHeight: 23 },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 24,
    marginTop: 6,
  },
  linkText: { fontSize: 15, fontWeight: '700' },
  credit: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 4 },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counter: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  counterText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  close: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
