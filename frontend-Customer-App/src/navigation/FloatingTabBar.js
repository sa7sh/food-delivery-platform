import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROUTES } from '../constants';
import { useTheme } from '../hooks/useTheme';

// --- Constants ---
const TAB_COUNT = 5;
const NAV_HEIGHT = 70;
const NAV_WIDTH = 320; // Slightly wider to ensure text fits comfortably
const TAB_WIDTH = NAV_WIDTH / TAB_COUNT;

export default function FloatingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = Dimensions.get('window');
  const { colors, isDark } = useTheme();

  // Center alignment
  const leftOffset = (screenWidth - NAV_WIDTH) / 2;
  const translateX = useRef(new Animated.Value(0)).current;

  // Check if we should hide the tab bar based on options
  const focusedRoute = state.routes[state.index];
  const focusedDescriptor = descriptors[focusedRoute.key];
  const focusedOptions = focusedDescriptor.options;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * TAB_WIDTH,
      useNativeDriver: true,
      stiffness: 140,
      damping: 18,
      mass: 1,
    }).start();
  }, [state.index]);

  // Don't render if tabBarStyle.display is 'none'
  if (focusedOptions.tabBarStyle?.display === 'none') {
    return null;
  }

  return (
    <View style={[styles.navContainer, { bottom: insets.bottom + 15, left: leftOffset, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)' }]}>

      {/* Glass Background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(20,20,20,0.9)' : (Platform.OS === 'ios' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.9)') }]} />
      {Platform.OS === 'ios' && <BlurView intensity={isDark ? 40 : 90} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />}

      {/* Sliding Large Pill (The "Circle" that holds the name) */}
      <Animated.View
        style={[
          styles.activePillContainer,
          {
            width: TAB_WIDTH,
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={[styles.activePill, { backgroundColor: '#9139BA', shadowColor: '#9139BA' }]} />
      </Animated.View>

      {/* Tab Content */}
      <View style={styles.tabsRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Labels & Icons
          let iconName = 'home-outline';
          let label = 'Home';

          if (route.name === ROUTES.HOME) {
            iconName = isFocused ? 'home' : 'home-outline';
            label = 'Home';
          } else if (route.name === ROUTES.SEARCH) {
            iconName = isFocused ? 'compass' : 'compass-outline';
            label = 'Explore';
          } else if (route.name === ROUTES.CART) {
            iconName = isFocused ? 'basket' : 'basket-outline';
            label = 'Cart';
          } else if (route.name === ROUTES.ORDERS) {
            iconName = isFocused ? 'receipt' : 'receipt-outline';
            label = 'Orders';
          } else if (route.name === ROUTES.PROFILE) {
            iconName = isFocused ? 'person' : 'person-outline';
            label = 'Profile';
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[styles.tabItem, { width: TAB_WIDTH }]}
              activeOpacity={0.8}
            >
              <View style={styles.itemContent}>
                <Ionicons
                  name={iconName}
                  size={20}
                  color={isFocused ? '#FFFFFF' : colors.textSub}
                  style={{ marginBottom: 2 }}
                />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.label,
                    {
                      color: isFocused ? '#FFFFFF' : colors.textSub,
                      fontWeight: isFocused ? '700' : '500'
                    }
                  ]}
                >
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    width: NAV_WIDTH,
    height: NAV_HEIGHT,
    borderRadius: 35, // Fully rounded ends
    overflow: 'hidden',
    borderWidth: 1,
    // borderColor set inline
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: 'transparent',
  },
  // Wrapper for the sliding animation
  activePillContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  // The Orange Pill Shape
  activePill: {
    width: TAB_WIDTH - 8, // Leave a small gap (4px on each side)
    height: NAV_HEIGHT - 8, // Leave a small gap top/bottom
    borderRadius: 30, // Rounded pill shape
    // backgroundColor set inline
    // shadowColor set inline
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    zIndex: 2, // Ensure tabs sit on top of the pill
  },
  tabItem: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
});