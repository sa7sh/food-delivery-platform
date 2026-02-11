import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing, StatusBar, Platform } from 'react-native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

// Modern Color Palette
const COLORS = {
  background: '#FFF9F6', // Warm cream
  primary: '#9139BA',    // Vibrant Coral/Orange
  textDark: '#1A1D1E',   // Soft Black
  textGray: '#9CA3AF',   // Cool Gray
  shadow: '#9139BA',
};

export default function SplashScreen({ onComplete }) {
  const lottieRef = useRef(null);
  const translateX = useRef(new Animated.Value(-200)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // --- LOGIC STARTS (UNCHANGED) ---
  useEffect(() => {
    // Start Lottie animation
    lottieRef.current?.play();

    // Start movement animation
    Animated.sequence([
      // Phase 1: Accelerate forward
      Animated.timing(translateX, {
        toValue: width * 0.7, // Target center-ish
        duration: 1800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      // Phase 2: Continue moving, scale down and fade out
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: width + 100,
          duration: 800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Navigate after animation completes
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  // --- LOGIC ENDS ---

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Decorative Background Element (The "Sun" or "Spotlight") */}
      <View style={styles.backgroundCircle} />

      {/* App Branding */}
      <View style={styles.brandingContainer}>
        <Text style={styles.appName}>Treato</Text>
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>FOOD DELIVERED FAST</Text>
        </View>
      </View>

      {/* Animation Layer */}
      <Animated.View
        style={[
          styles.scooterWrapper,
          {
            transform: [{ translateX }, { scale }],
            opacity,
          },
        ]}
      >
        <LottieView
          ref={lottieRef}
          source={require('../../../assets/animations/delivery-scooter.json')}
          style={styles.lottie}
          autoPlay={false}
          loop={true}
          speed={1.1}
        />
        {/* Added a shadow beneath the scooter for realism */}
        <View style={styles.scooterShadow} />
      </Animated.View>

      {/* Footer Area */}
      <View style={styles.footer}>
        <LoadingDots />
        <Text style={styles.loadingText}>Loading deliciousness...</Text>
      </View>
    </View>
  );
}

// Animated Loading Dots Component (Logic Unchanged, Styles Updated)
function LoadingDots() {
  const dot1Opacity = useRef(new Animated.Value(0.4)).current;
  const dot2Opacity = useRef(new Animated.Value(0.4)).current;
  const dot3Opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animateDot = (dotOpacity, delay) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.timing(dotOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(dotOpacity, {
          toValue: 0.4,
          duration: 500,
          useNativeDriver: true,
        }),
      ]);
    };

    Animated.loop(
      Animated.parallel([
        animateDot(dot1Opacity, 0),
        animateDot(dot2Opacity, 250),
        animateDot(dot3Opacity, 500),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.loadingDotsContainer}>
      <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
      <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
      <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Ensures background circle doesn't overflow
  },
  // Decorative circle behind everything to add depth
  backgroundCircle: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
    backgroundColor: '#FFF0EB', // Very subtle darker shade of background
    top: -width * 0.4,
    left: -width * 0.1,
    zIndex: -1,
  },
  brandingContainer: {
    position: 'absolute',
    top: height * 0.15, // Moved up slightly for better balance
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
  },
  appName: {
    fontSize: 52,
    fontWeight: '800', // Extra bold
    color: COLORS.primary,
    letterSpacing: -1, // Tight tracking for modern feel
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif', // Fallback fonts
    // Subtle text shadow for pop
    textShadowColor: 'rgba(255, 75, 58, 0.15)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  taglineContainer: {
    marginTop: 12,
    backgroundColor: '#FFE4DE', // Light badge background
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagline: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  scooterWrapper: {
    position: 'absolute',
    top: height * 0.45,
    // Aligning the center of the animation
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 280, // Slightly larger
    height: 280,
  },
  scooterShadow: {
    width: 140,
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 100,
    marginTop: -40, // Pull up beneath the wheels
    transform: [{ scaleX: 1.5 }],
  },
  footer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    width: '100%',
  },
  loadingDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textGray,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});