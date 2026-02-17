import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [partner, setPartner] = React.useState(null);

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      const data = await AsyncStorage.getItem('deliveryPartner');
      if (data) {
        setPartner(JSON.parse(data));
      }
    } catch (e) {
      console.log("Error loading profile", e);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  const MenuItem = ({ icon, title, subtitle, color = "#2d3436" }) => (
    <TouchableOpacity style={styles.menuItem}>
      <View style={styles.menuLeft}>
        <View style={[styles.iconBox, { backgroundColor: color + '10' }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        <View>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSub}>{subtitle}</Text>}
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#b2bec3" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PROFILE HEADER */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{partner?.name?.[0] || 'D'}</Text>
            </View>
            <TouchableOpacity style={styles.editBadge}>
              <MaterialCommunityIcons name="pencil" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{partner?.name || 'Partner'}</Text>
          <Text style={styles.userID}>Phone: {partner?.phone}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>1.2k</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>2y</Text>
              <Text style={styles.statLabel}>Partner</Text>
            </View>
          </View>
        </View>

        {/* SETTINGS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>VEHICLE & DOCUMENTS</Text>
          <MenuItem icon="bike" title="Vehicle Details" subtitle={partner?.vehicle || "Not added"} color="#9139BA" />
          <MenuItem icon="file-document-outline" title="Documents" subtitle="Driving License, PAN, Aadhaar" color="#3498db" />
          <MenuItem icon="bank-outline" title="Bank Details" subtitle={partner?.bankName ? `${partner.bankName} •••• ${partner.accountNumber?.slice(-4)}` : "Not added"} color="#2ecc71" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <MenuItem icon="bell-outline" title="Notifications" />
          <MenuItem icon="shield-check-outline" title="Insurance & Safety" />
          <MenuItem icon="help-circle-outline" title="Support" />
        </View>

        {/* 4. Updated Logout Button with onPress */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#9139BA" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Treato v1.0.4</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#fff' },
  avatarContainer: { marginBottom: 15 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#2d3436', justifyContent: 'center', alignItems: 'center' },
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
  version: { textAlign: 'center', color: '#dfe6e9', fontSize: 12, marginVertical: 30 }
});