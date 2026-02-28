import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Linking, useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const lightColors = {
  background: '#fff',
  card: '#f8f9fa',
  text: '#2d3436',
  subText: '#95a5a6',
  border: '#f1f2f6',
  headerTitle: '#2d3436',
};

const darkColors = {
  background: '#121212',
  card: '#1a1a1a',
  text: '#ffffff',
  subText: '#b2bec3',
  border: '#2c2c2c',
  headerTitle: '#ffffff',
};

export default function InsuranceScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';
  const colors = theme === 'dark' ? darkColors : lightColors;
  const navigation = useNavigation();

  const InfoCard = ({ icon, title, body, color, children }) => (
    <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
      <View style={styles.infoCardHeader}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
        <Text style={[styles.infoCardTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <Text style={[styles.infoCardBody, { color: colors.subText }]}>{body}</Text>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.headerTitle }]}>Insurance & Safety</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topSection}>
          <MaterialCommunityIcons name="shield-check" size={48} color="#27ae60" />
          <Text style={[styles.title, { color: colors.text }]}>You're Protected</Text>
          <Text style={[styles.subtitle, { color: colors.subText }]}>Your safety and protection are our top priorities while you're on the road.</Text>
        </View>

        <InfoCard
          icon="car-emergency"
          title="Accident Coverage"
          color="#27ae60"
          body="You are covered for accidental injuries while on active delivery. Coverage includes hospitalization up to ₹1,00,000 and personal accident cover of ₹5,00,000."
        />

        <InfoCard
          icon="phone-alert"
          title="SOS Emergency"
          color="#e74c3c"
          body="In case of an emergency, call our 24/7 SOS helpline immediately for assistance."
        >
          <TouchableOpacity
            style={styles.sosBtn}
            onPress={() => Linking.openURL('tel:+918450906057')}
          >
            <MaterialCommunityIcons name="phone" size={18} color="#fff" />
            <Text style={styles.sosBtnText}>Call SOS Helpline</Text>
          </TouchableOpacity>
        </InfoCard>

        <InfoCard
          icon="helmet"
          title="Safety Guidelines"
          color="#3498db"
          body="• Always wear a helmet&#10;• Follow traffic rules&#10;• Do not use phone while riding&#10;• Take breaks on long routes"
        />

        <TouchableOpacity
          style={styles.policyLink}
          onPress={() => Linking.openURL('https://treato.in/policy')}
        >
          <Text style={styles.policyLinkText}>View Full Insurance Policy →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  backBtn: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { padding: 20 },
  topSection: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
  title: { fontSize: 22, fontWeight: '800', marginTop: 12, marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
  infoCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  infoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  infoCardTitle: { fontSize: 16, fontWeight: '800' },
  infoCardBody: { fontSize: 13, lineHeight: 20 },
  sosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 15,
    alignSelf: 'flex-start'
  },
  sosBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  policyLink: { alignItems: 'center', paddingVertical: 20 },
  policyLinkText: { color: '#3498db', fontWeight: '700', fontSize: 15 }
});
