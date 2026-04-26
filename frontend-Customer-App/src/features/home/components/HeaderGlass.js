import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES } from '../../../constants';

export const HeaderGlass = ({ scrollY, colors, isDark, selectedAddress, profile, styles }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0.7, 1],
    extrapolate: 'clamp',
  });

  const handleLocationPress = () => {
    navigation.navigate(ROUTES.PROFILE, {
      screen: ROUTES.SAVED_ADDRESSES
    });
  };

  const profileImageSource = profile?.profileImage
    ? { uri: profile.profileImage }
    : { uri: 'https://i.pravatar.cc/150?img=12' };

  return (
    <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: headerOpacity }]}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(20,20,20,1)' : '#C9A6DB' }]} />
        <View style={[styles.headerBorder, { backgroundColor: colors.border }]} />
      </Animated.View>

      <View style={styles.headerContent}>
        <TouchableOpacity style={styles.locationBtn} onPress={handleLocationPress} activeOpacity={0.7}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
            <Ionicons name="location" size={18} color="#9139BA" />
          </View>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.locationLabel, { color: colors.textSub }]}>DELIVERING TO</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={1}>
                {selectedAddress ? selectedAddress.label : 'Select Location'} • {selectedAddress ? (selectedAddress.street || selectedAddress.city) : 'Add Address'}
              </Text>
              <Ionicons name="chevron-down" size={14} color={colors.textSub} style={{ marginLeft: 4 }} />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.profileBtn, { borderColor: colors.surface }]}
          onPress={() => navigation.navigate(ROUTES.PROFILE)}
        >
          <Image source={profileImageSource} style={styles.profileImg} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
