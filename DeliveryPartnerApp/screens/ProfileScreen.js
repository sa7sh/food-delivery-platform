import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Linking, Modal, Pressable, useColorScheme, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDeliveryAuthStore } from '../store/authStore';
import { API_URL } from '../constants/Config';

// Theme Colors
const lightColors = {
  background: '#fff',
  card: '#fff',
  text: '#2d3436',
  subText: '#95a5a6',
  border: '#f1f2f6',
  infoBtn: '#f8f9fa',
  headerTitle: '#2d3436',
  statsBg: '#f8f9fa',
  sheet: '#ffffff',
};

const darkColors = {
  background: '#121212',
  card: '#1e1e1e',
  text: '#ffffff',
  subText: '#b2bec3',
  border: '#2c2c2c',
  infoBtn: '#2c2c2c',
  headerTitle: '#ffffff',
  statsBg: '#1a1a1a',
  sheet: '#1e1e1e',
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';
  const colors = theme === 'dark' ? darkColors : lightColors;

  const navigation = useNavigation();
  const { token, deliveryPartner, logout, updatePartner } = useDeliveryAuthStore();
  const [partner, setPartner] = React.useState(deliveryPartner);
  const [stats, setStats] = React.useState({ trips: 0, rating: 5.0, joinedAt: null });
  const [uploading, setUploading] = React.useState(false);
  const [showImageOptions, setShowImageOptions] = React.useState(false);

  const formatDuration = (dateString) => {
    if (!dateString) return '0d';
    const joined = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - joined);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays}d`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}m`;
    const years = (diffDays / 365).toFixed(1);
    return `${years.endsWith('.0') ? Math.floor(years) : years}y`;
  };

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    // Use store data as the initial state
    if (deliveryPartner) {
      setPartner(deliveryPartner);

      try {
        // 1. Fetch latest profile details
        const response = await fetch(`${API_URL}/delivery-rating/${deliveryPartner._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await response.json();
        if (json.success && json.partner) {
          const merged = { ...deliveryPartner, ...json.partner };
          setPartner(merged);
          updatePartner(json.partner);
        }

        // 2. Fetch lifetime statistics
        const statsResponse = await fetch(`${API_URL}/profile-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const statsJson = await statsResponse.json();
        if (statsJson.success) {
          setStats(statsJson.stats);
        }
      } catch (err) {
        console.log('Error fetching latest profile data:', err);
      }
    }
  };

  const handleEditProfileImage = () => {
    setShowImageOptions(true);
  };

  const uploadImage = async (uri) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('profileImage', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });

      const response = await fetch(`${API_URL}/driver/profile/image`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await response.json();
      if (json.success) {
        updatePartner(json.partner);
        setPartner(json.partner);
        Alert.alert('Success', 'Profile image updated successfully');
      } else {
        Alert.alert('Error', json.message || 'Failed to upload image');
      }
    } catch (err) {
      console.log('Upload Error:', err);
      Alert.alert('Error', 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  const pickFromGallery = async () => {
    setShowImageOptions(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is required to pick an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      uploadImage(result.assets[0].uri);
    }
  };

  const takeFromCamera = async () => {
    setShowImageOptions(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      uploadImage(result.assets[0].uri);
    }
  };

  const handleLogout = () => {
    // Zustand logout() clears the store and AsyncStorage entry.
    // App.js reacts to isAuthenticated becoming false and shows the Auth screen.
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  const handleSupport = () => navigation.navigate('Support');
  const handleInsurance = () => navigation.navigate('Insurance');

  const MenuItem = ({ icon, title, subtitle, color = "#2d3436", onPress }) => (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        <View>
          <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.menuSub, { color: colors.subText }]}>{subtitle}</Text>}
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.subText} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PROFILE HEADER */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              style={[styles.avatar, { backgroundColor: theme === 'dark' ? '#2c1a36' : '#f5f0fa' }]}
              onPress={handleEditProfileImage}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color={theme === 'dark' ? '#bb86fc' : '#9139BA'} size="large" />
              ) : partner?.profileImage ? (
                <Image source={{ uri: partner.profileImage }} style={styles.avatarImg} />
              ) : (
                <Text style={[styles.avatarInitial, { color: theme === 'dark' ? '#bb86fc' : '#9139BA' }]}>{partner?.name?.[0] || 'D'}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editBadge}
              onPress={handleEditProfileImage}
              disabled={uploading}
            >
              <MaterialCommunityIcons name="pencil" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{partner?.name || 'Partner'}</Text>
          <Text style={[styles.userID, { color: colors.subText }]}>Phone: {partner?.phone}</Text>

          <View style={[styles.statsRow, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.text }]}>{partner?.averageRating ? parseFloat(partner.averageRating).toFixed(1) : '5.0'}</Text>
              <Text style={[styles.statLabel, { color: colors.subText }]}>Rating</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.trips || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.subText }]}>Trips</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.text }]}>{formatDuration(stats.joinedAt)}</Text>
              <Text style={[styles.statLabel, { color: colors.subText }]}>Partner</Text>
            </View>
          </View>
        </View>

        {/* SETTINGS SECTION */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.subText }]}>VEHICLE & DOCUMENTS</Text>
          <MenuItem icon="bike" title="Vehicle Details" subtitle={partner?.vehicle || "Not added"} color="#9139BA" />
          <MenuItem icon="file-document-outline" title="Documents" subtitle="Driving License, PAN, Aadhaar" color="#3498db" />
          <MenuItem icon="bank-outline" title="Bank Details" subtitle={partner?.bankName ? `${partner.bankName} •••• ${partner.accountNumber?.slice(-4)}` : "Not added"} color="#2ecc71" />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.subText }]}>PREFERENCES</Text>
          <MenuItem icon="bell-outline" title="Notifications" color={colors.text} />
          <MenuItem icon="shield-check-outline" title="Insurance & Safety" subtitle="Coverage & emergency info" color="#27ae60" onPress={handleInsurance} />
          <MenuItem icon="help-circle-outline" title="Support" subtitle="Call, Email or WhatsApp" color="#e67e22" onPress={handleSupport} />
        </View>

        {/* 4. Updated Logout Button with onPress */}
        <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.border }]} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#9139BA" />
          <Text style={[styles.logoutText, { color: colors.text }]}>Log Out</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.subText }]}>Treato v1.0.4</Text>
      </ScrollView>

      {/* Image Picker Options Modal */}
      <Modal
        visible={showImageOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowImageOptions(false)}
        >
          <View style={[styles.modalCard, { backgroundColor: colors.sheet }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Profile Photo</Text>
            <Text style={[styles.modalSub, { color: colors.subText }]}>Update your delivery partner profile image</Text>

            <TouchableOpacity style={styles.supportOption} onPress={takeFromCamera}>
              <View style={[styles.iconBox, { backgroundColor: '#e74c3c' + '15' }]}>
                <MaterialCommunityIcons name="camera" size={24} color="#e74c3c" />
              </View>
              <Text style={[styles.supportOptionText, { color: colors.text }]}>Take from Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.supportOption} onPress={pickFromGallery}>
              <View style={[styles.iconBox, { backgroundColor: '#3498db' + '15' }]}>
                <MaterialCommunityIcons name="image-multiple" size={24} color="#3498db" />
              </View>
              <Text style={[styles.supportOptionText, { color: colors.text }]}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelOption}
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={styles.cancelOptionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#fff' },
  avatarContainer: { marginBottom: 15 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#2d3436', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImg: { width: 90, height: 90, resizeMode: 'cover' },
  avatarInitial: { fontSize: 36, color: '#fff', fontWeight: '900' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#9139BA', width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 24, fontWeight: '900', color: '#2d3436' },
  userID: { fontSize: 13, color: '#95a5a6', marginTop: 4, fontWeight: '600' },

  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 25, backgroundColor: '#f8f9fa', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 20 },
  stat: { alignItems: 'center', paddingHorizontal: 15 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#2d3436' },
  statLabel: { fontSize: 12, color: '#95a5a6', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: '#dfe6e9' },

  section: { paddingHorizontal: 20, marginTop: 25 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#b2bec3', letterSpacing: 1.2, marginBottom: 15 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuTitle: { fontSize: 16, fontWeight: '700', color: '#2d3436' },
  menuSub: { fontSize: 12, color: '#95a5a6', marginTop: 2 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, padding: 15, marginHorizontal: 20, borderRadius: 15, borderWidth: 1, borderColor: '#f1f2f6' },
  logoutText: { marginLeft: 10, color: '#9139BA', fontWeight: 'bold', fontSize: 16 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#2d3436', marginBottom: 6 },
  modalSub: { fontSize: 14, color: '#95a5a6', marginBottom: 24 },
  supportOption: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f2f6' },
  supportOptionText: { fontSize: 16, fontWeight: '700', color: '#2d3436' },
  cancelOption: { marginTop: 16, alignItems: 'center', paddingVertical: 12 },
  cancelOptionText: { fontSize: 16, fontWeight: '700', color: '#e74c3c' },
  insuranceHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  infoCard: { backgroundColor: '#f8f9fa', borderRadius: 16, padding: 16, marginBottom: 12 },
  infoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoCardTitle: { fontSize: 15, fontWeight: '800', color: '#2d3436' },
  infoCardBody: { fontSize: 13, color: '#636e72', lineHeight: 20 },
  sosBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#e74c3c', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, marginTop: 10, alignSelf: 'flex-start' },
  sosBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  policyLink: { alignItems: 'center', paddingVertical: 12 },
  policyLinkText: { color: '#3498db', fontWeight: '700', fontSize: 14 },
  version: { textAlign: 'center', color: '#dfe6e9', fontSize: 12, marginVertical: 30 }
});