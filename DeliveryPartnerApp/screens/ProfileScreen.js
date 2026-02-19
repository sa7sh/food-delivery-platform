import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Linking, Modal, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDeliveryAuthStore } from '../store/authStore';
import { API_URL } from '../constants/Config';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { token, deliveryPartner, logout, updatePartner } = useDeliveryAuthStore();
  const [partner, setPartner] = React.useState(deliveryPartner);
  const [showSupport, setShowSupport] = React.useState(false);
  const [showInsurance, setShowInsurance] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    // Use store data as the initial state
    if (deliveryPartner) {
      setPartner(deliveryPartner);

      // Fetch latest rating and details from backend
      try {
        const response = await fetch(`${API_URL}/delivery-rating/${deliveryPartner._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await response.json();
        if (json.success && json.partner) {
          const merged = { ...deliveryPartner, ...json.partner };
          setPartner(merged);
          // Persist the fresh data back into the store (and AsyncStorage)
          updatePartner(json.partner);
        }
      } catch (err) {
        console.log('Error fetching latest profile data:', err);
      }
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

  const handleSupport = () => setShowSupport(true);
  const handleInsurance = () => setShowInsurance(true);

  const MenuItem = ({ icon, title, subtitle, color = "#2d3436", onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
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
              <Text style={styles.statValue}>{partner?.averageRating ? parseFloat(partner.averageRating).toFixed(1) : '5.0'}</Text>
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
          <MenuItem icon="shield-check-outline" title="Insurance & Safety" subtitle="Coverage & emergency info" color="#27ae60" onPress={handleInsurance} />
          <MenuItem icon="help-circle-outline" title="Support" subtitle="Call, Email or WhatsApp" color="#e67e22" onPress={handleSupport} />
        </View>

        {/* 4. Updated Logout Button with onPress */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#9139BA" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Treato v1.0.4</Text>
      </ScrollView>

      {/* Support Modal */}
      <Modal
        visible={showSupport}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSupport(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowSupport(false)}>
          <Pressable style={styles.modalCard} onPress={() => { }}>
            <Text style={styles.modalTitle}>Contact Support</Text>
            <Text style={styles.modalSub}>How would you like to reach us?</Text>

            <TouchableOpacity style={styles.supportOption} onPress={() => { setShowSupport(false); Linking.openURL('tel:+918450906057'); }}>
              <MaterialCommunityIcons name="phone" size={22} color="#27ae60" />
              <Text style={styles.supportOptionText}>Call Support</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.supportOption} onPress={() => { setShowSupport(false); Linking.openURL('mailto:support@treato.in?subject=Delivery%20Partner%20Support'); }}>
              <MaterialCommunityIcons name="email-outline" size={22} color="#3498db" />
              <Text style={styles.supportOptionText}>Email Support</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.supportOption} onPress={() => { setShowSupport(false); Linking.openURL('https://wa.me/918450906057?text=Hi%2C%20I%20need%20support%20as%20a%20delivery%20partner.'); }}>
              <MaterialCommunityIcons name="whatsapp" size={22} color="#25D366" />
              <Text style={styles.supportOptionText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelOption} onPress={() => setShowSupport(false)}>
              <Text style={styles.cancelOptionText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Insurance & Safety Modal */}
      <Modal
        visible={showInsurance}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInsurance(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowInsurance(false)}>
          <Pressable style={[styles.modalCard, { maxHeight: '85%' }]} onPress={() => { }}>
            <View style={styles.insuranceHeader}>
              <MaterialCommunityIcons name="shield-check" size={32} color="#27ae60" />
              <Text style={styles.modalTitle}>Insurance & Safety</Text>
            </View>
            <Text style={styles.modalSub}>Your protection while on the road</Text>

            {/* Coverage Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <MaterialCommunityIcons name="car-emergency" size={20} color="#27ae60" />
                <Text style={styles.infoCardTitle}>Accident Coverage</Text>
              </View>
              <Text style={styles.infoCardBody}>You are covered for accidental injuries while on active delivery. Coverage includes hospitalization up to ₹1,00,000 and personal accident cover of ₹5,00,000.</Text>
            </View>

            {/* SOS Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <MaterialCommunityIcons name="phone-alert" size={20} color="#e74c3c" />
                <Text style={styles.infoCardTitle}>SOS Emergency</Text>
              </View>
              <Text style={styles.infoCardBody}>In case of an emergency, call our 24/7 SOS helpline immediately.</Text>
              <TouchableOpacity style={styles.sosBtn} onPress={() => { setShowInsurance(false); Linking.openURL('tel:+918450906057'); }}>
                <MaterialCommunityIcons name="phone" size={16} color="#fff" />
                <Text style={styles.sosBtnText}>Call SOS Helpline</Text>
              </TouchableOpacity>
            </View>

            {/* Safety Tips Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <MaterialCommunityIcons name="helmet" size={20} color="#3498db" />
                <Text style={styles.infoCardTitle}>Safety Guidelines</Text>
              </View>
              <Text style={styles.infoCardBody}>• Always wear a helmet{`\n`}• Follow traffic rules{`\n`}• Do not use phone while riding{`\n`}• Take breaks on long routes</Text>
            </View>

            <TouchableOpacity style={styles.policyLink} onPress={() => Linking.openURL('https://treato.in/policy')}>
              <Text style={styles.policyLinkText}>View Full Insurance Policy →</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelOption} onPress={() => setShowInsurance(false)}>
              <Text style={styles.cancelOptionText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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