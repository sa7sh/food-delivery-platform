import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ROUTES } from '../../../constants';
import { useAuthStore, useUserStore, useCartStore, useOrdersStore } from '../../../store';
import { useTheme } from '../../../hooks/useTheme';
import { authService } from '../../../services/api/auth/authService';

/**
 * SUB-COMPONENT: ProfileHeader
 */
const InternalProfileHeader = ({ user, onEditPress, colors, isDark }) => (
  <View style={[headerStyles.container, { backgroundColor: colors.surface }]}>
    <View style={headerStyles.profileRow}>
      <View style={headerStyles.avatarContainer}>
        <Image
          source={{ uri: user?.profileImage || user?.avatar || 'https://ui-avatars.com/api/?name=' + (user?.name || 'User') + '&background=F97316&color=fff' }}
          style={[headerStyles.avatar, { backgroundColor: colors.surfaceHighlight }]}
        />
        <TouchableOpacity style={[headerStyles.editBadge, { borderColor: colors.surface }]} onPress={onEditPress}>
          <Ionicons name="camera" size={14} color="#9139BA" />
        </TouchableOpacity>
      </View>

      <View style={headerStyles.infoContainer}>
        <Text style={[headerStyles.userName, { color: colors.text }]}>{user?.name || 'Guest User'}</Text>
        <Text style={[headerStyles.userEmail, { color: colors.textSub }]}>{user?.email || 'Login to manage account'}</Text>
        <View style={headerStyles.badgeRow}>
          <View style={[headerStyles.verifiedBadge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5' }]}>
            <Ionicons name="checkmark-circle" size={12} color={colors.success} />
            <Text style={headerStyles.verifiedText}>Verified Member</Text>
          </View>
        </View>
      </View>
    </View>
  </View>
);

/**
 * SUB-COMPONENT: MenuOption
 */
const MenuOption = ({ icon, title, subtitle, onPress, danger = false, iconColor, colors, isDark, rightElement }) => (
  <TouchableOpacity style={menuStyles.item} onPress={onPress} activeOpacity={0.7}>
    <View style={[menuStyles.iconCircle, { backgroundColor: danger ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2') : colors.surfaceHighlight }]}>
      <Ionicons name={icon} size={20} color={danger ? '#EF4444' : (iconColor || colors.icon)} />
    </View>
    <View style={menuStyles.textContainer}>
      <Text style={[menuStyles.title, { color: danger ? '#EF4444' : colors.text }]}>{title}</Text>
      {subtitle && <Text style={[menuStyles.subtitle, { color: colors.textSub }]}>{subtitle}</Text>}
    </View>
    {rightElement || <Ionicons name="chevron-forward" size={18} color={colors.textSub} />}
  </TouchableOpacity>
);

/**
 * MAIN SCREEN: ProfileScreen
 */
export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const { profile, fetchProfile } = useUserStore();
  const { clearCart } = useCartStore();
  const { reset: resetOrders } = useOrdersStore();
  const { colors, isDark, toggleTheme } = useTheme();

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEditPhoto = async () => {
    const showImagePicker = async (sourceType) => {
      try {
        // Request permissions
        if (sourceType === 'camera') {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
            return;
          }
        } else {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Gallery permission is required to select photos.');
            return;
          }
        }

        // Launch picker
        const result = sourceType === 'camera'
          ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
          : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

        if (!result.canceled && result.assets[0]) {
          const imageUri = result.assets[0].uri;
          // Update profile with new image
          const { updateProfile } = useUserStore.getState();
          await updateProfile({ profileImage: imageUri });
          await fetchProfile();
        }
      } catch (error) {
        console.error('Image picker error:', error);
        Alert.alert('Error', 'Failed to pick image. Please try again.');
      }
    };

    // Show options for iOS and Android
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            showImagePicker('camera');
          } else if (buttonIndex === 2) {
            showImagePicker('gallery');
          }
        }
      );
    } else {
      Alert.alert(
        'Update Profile Photo',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: () => showImagePicker('camera') },
          { text: 'Choose from Gallery', onPress: () => showImagePicker('gallery') },
        ],
        { cancelable: true }
      );
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          clearCart();
          resetOrders();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Attempting to delete account...');
              const response = await authService.deleteAccount();
              console.log('Delete account response:', response);
              await logout();
              clearCart();
              resetOrders();
              Alert.alert('Success', 'Your account has been deleted successfully.');
            } catch (error) {
              console.error('Delete account error:', error);
              const errorMessage = error?.message || error?.data?.message || 'Failed to delete account. Please try again.';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const currentUser = profile || user;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={[styles.topArea, { backgroundColor: colors.surface }]} edges={['top']}>
        <View style={styles.headerNav}>
          <Text style={[styles.headerNavTitle, { color: colors.text }]}>My Profile</Text>
          <TouchableOpacity
            style={[styles.settingsBtn, { backgroundColor: colors.surfaceHighlight }]}
            onPress={() => navigation.navigate(ROUTES.EDIT_PROFILE)}
          >
            <Ionicons name="settings-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        <InternalProfileHeader
          user={currentUser}
          onEditPress={handleEditPhoto}
          colors={colors}
          isDark={isDark}
        />

        {/* Account Group */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSub }]}>Account Settings</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : '#0F172A' }]}>
            <MenuOption
              icon="location-outline"
              title="Saved Addresses"
              subtitle="Home, Work, and more"
              onPress={() => navigation.navigate(ROUTES.SAVED_ADDRESSES)}
              iconColor="#F97316"
              colors={colors}
              isDark={isDark}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <MenuOption
              icon="receipt-outline"
              title="Order History"
              subtitle="View your past orders"
              onPress={() => navigation.navigate(ROUTES.ORDER_HISTORY)}
              iconColor="#8B5CF6"
              colors={colors}
              isDark={isDark}
            />
          </View>
        </View>

        {/* Preferences Group */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSub }]}>Preferences</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : '#0F172A' }]}>
            <MenuOption
              icon="notifications-outline"
              title="Notifications"
              onPress={() => { }}
              colors={colors} isDark={isDark}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Dark Mode Toggle */}
            <MenuOption
              icon={isDark ? "moon" : "moon-outline"}
              title="Dark Mode"
              subtitle={isDark ? "On" : "Off"}
              onPress={toggleTheme}
              colors={colors} isDark={isDark}
              rightElement={
                <View style={[
                  styles.toggleTrack,
                  { backgroundColor: isDark ? colors.primary[500] : colors.border }
                ]}>
                  <View style={[
                    styles.toggleKnob,
                    {
                      transform: [{ translateX: isDark ? 18 : 2 }],
                      backgroundColor: '#fff'
                    }
                  ]} />
                </View>
              }
            />
          </View>
        </View>

        {/* Legal Group */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSub }]}>About & Legal</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : '#0F172A' }]}>
            <MenuOption icon="shield-checkmark-outline" title="Privacy Policy" onPress={() => navigation.navigate(ROUTES.PRIVACY_POLICY)} colors={colors} isDark={isDark} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <MenuOption icon="document-text-outline" title="Terms & Conditions" onPress={() => navigation.navigate(ROUTES.TERMS)} colors={colors} isDark={isDark} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <MenuOption icon="help-circle-outline" title="Help & Support" onPress={() => navigation.navigate(ROUTES.HELP_SUPPORT)} colors={colors} isDark={isDark} />
          </View>
        </View>

        {/* Logout Button */}
        <View style={[styles.section, { marginBottom: 8 }]}>
          <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : '#0F172A' }]}>
            <MenuOption
              icon="log-out-outline"
              title="Log Out"
              onPress={handleLogout}
              danger
              colors={colors} isDark={isDark}
            />
          </View>
        </View>

        {/* Delete Account Button */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : '#0F172A' }]}>
            <MenuOption
              icon="trash-outline"
              title="Delete Account"
              subtitle="Permanently delete your account and data"
              onPress={handleDeleteAccount}
              danger
              colors={colors} isDark={isDark}
            />
          </View>
        </View>

        <View style={styles.versionWrapper}>
          <Text style={[styles.versionText, { color: colors.textSub }]}>Treato</Text>
          <Text style={[styles.versionSubText, { color: colors.textSub }]}>Version 1.0.0 (Build 2025)</Text>
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topArea: {},
  headerNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 15 },
  headerNavTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  settingsBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  scrollView: { flex: 1 },
  section: { marginTop: 28, paddingHorizontal: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, marginLeft: 8, marginBottom: 12 },
  card: { borderRadius: 24, paddingHorizontal: 16, paddingVertical: 6, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  divider: { height: 1, marginLeft: 56 },
  versionWrapper: { alignItems: 'center', marginTop: 10 },
  versionText: { fontSize: 14, fontWeight: '700' },
  versionSubText: { fontSize: 12, marginTop: 4 },

  // Toggle Switch
  toggleTrack: { width: 44, height: 24, borderRadius: 12, justifyContent: 'center' },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 1 },
});

const headerStyles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingBottom: 30, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 85, height: 85, borderRadius: 28 },
  editBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#fff', width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  infoContainer: { marginLeft: 20, flex: 1 },
  userName: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  userEmail: { fontSize: 14, marginTop: 4, fontWeight: '500' },
  badgeRow: { marginTop: 10 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', gap: 4 },
  verifiedText: { fontSize: 11, fontWeight: '700', color: '#10B981' },
});

const menuStyles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  iconCircle: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  textContainer: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 2, fontWeight: '500' },
});
