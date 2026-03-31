import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useCallback } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  interpolateColor,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_STORAGE_WELCOMED_KEY } from '@shared/lib/storage';
import { Colors, fontFamily } from '@shared/lib/theme';
import { useAppGateContext } from '@app/providers/AppGateProvider';
import type { ViewToken, FlatList } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Slide = { id: string; emoji: string; title: string; subtitle: string };

const slides: Slide[] = [
  {
    id: '1',
    emoji: '💰',
    title: 'Welcome to FiftyFifty',
    subtitle: 'Split shared expenses\nfairly and effortlessly.',
  },
  {
    id: '2',
    emoji: '👨‍👩‍👧‍👦',
    title: 'Family Finances',
    subtitle: 'Track who spent what.\nThe app calculates who owes whom.',
  },
  {
    id: '3',
    emoji: '✨',
    title: 'Ready to Begin?',
    subtitle: 'Create your family and\nstart splitting expenses.',
  },
];

function SlideItem({
  item,
  index,
  scrollX,
  textColor,
  subtitleColor,
}: {
  item: Slide;
  index: number;
  scrollX: SharedValue<number>;
  textColor: string;
  subtitleColor: string;
}) {
  const animStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];
    return {
      opacity: interpolate(scrollX.value, inputRange, [0.3, 1, 0.3]),
      transform: [
        { scale: interpolate(scrollX.value, inputRange, [0.8, 1, 0.8]) },
        { translateY: interpolate(scrollX.value, inputRange, [30, 0, 30]) },
      ],
    };
  });

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.slideContent, animStyle]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
        <Text style={[styles.slideTitle, { color: textColor, fontFamily: fontFamily.display }]}>
          {item.title}
        </Text>
        <Text style={[styles.slideSubtitle, { color: subtitleColor, fontFamily: fontFamily.body }]}>
          {item.subtitle}
        </Text>
      </Animated.View>
    </View>
  );
}

function Dot({
  index,
  scrollX,
  activeColor,
  inactiveColor,
}: {
  index: number;
  scrollX: SharedValue<number>;
  activeColor: string;
  inactiveColor: string;
}) {
  const animStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];
    return {
      width: interpolate(scrollX.value, inputRange, [8, 28, 8], 'clamp'),
      backgroundColor: interpolateColor(scrollX.value, inputRange, [
        inactiveColor,
        activeColor,
        inactiveColor,
      ]),
    };
  });

  return <Animated.View style={[styles.dot, animStyle]} />;
}

export default function WelcomeScreen() {
  const { refresh } = useAppGateContext();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  const scrollX = useSharedValue(0);
  const currentIndex = useSharedValue(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      currentIndex.value = viewableItems[0].index ?? 0;
    }
  }).current;

  const handlePress = useCallback(async () => {
    if (currentIndex.value < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex.value + 1,
        animated: true,
      });
    } else {
      await AsyncStorage.setItem(APP_STORAGE_WELCOMED_KEY, 'true');
      refresh();
    }
  }, [refresh]);

  const buttonTextStyle = useAnimatedStyle(() => ({
    opacity: currentIndex.value === slides.length - 1 ? withTiming(1) : withTiming(0),
    position: 'absolute' as const,
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    opacity: currentIndex.value === slides.length - 1 ? withTiming(0) : withTiming(1),
    position: 'absolute' as const,
  }));

  const buttonWidthStyle = useAnimatedStyle(() => ({
    width: currentIndex.value === slides.length - 1 ? withSpring(160) : withSpring(56),
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.heroGradientStart, theme.heroGradientMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.FlatList
        ref={flatListRef as React.RefObject<Animated.FlatList<Slide>>}
        data={slides}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <SlideItem
            item={item}
            index={index}
            scrollX={scrollX}
            textColor="#FFFFFF"
            subtitleColor="rgba(255,255,255,0.82)"
          />
        )}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) + 16 }]}>
        <View style={styles.pagination}>
          {slides.map((_, i) => (
            <Dot
              key={i}
              index={i}
              scrollX={scrollX}
              activeColor="#FFFFFF"
              inactiveColor="rgba(255,255,255,0.4)"
            />
          ))}
        </View>

        <Pressable onPress={handlePress}>
          <Animated.View
            style={[styles.button, buttonWidthStyle, { backgroundColor: theme.surface1 }]}
          >
            <Animated.Text
              style={[styles.buttonText, buttonTextStyle, { fontFamily: fontFamily.bodySemiBold }]}
            >
              Get Started
            </Animated.Text>
            <Animated.Text style={[styles.arrow, arrowStyle, { fontFamily: fontFamily.body }]}>
              →
            </Animated.Text>
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listTransparent: { flex: 1, backgroundColor: 'transparent' },
  slide: { width: SCREEN_WIDTH, flex: 1, justifyContent: 'center', alignItems: 'center' },
  slideContent: { alignItems: 'center', paddingHorizontal: 40 },
  emoji: { fontSize: 80, marginBottom: 32 },
  slideTitle: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  slideSubtitle: { fontSize: 17, lineHeight: 26, textAlign: 'center' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  pagination: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  buttonText: { fontSize: 17, fontWeight: '600' },
  arrow: { fontSize: 24, fontWeight: '300' },
});
