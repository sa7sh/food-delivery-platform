import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Linking, useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const lightColors = {
  background: '#fff',
  text: '#2d3436',
  subText: '#95a5a6',
  border: '#f1f2f6',
  headerTitle: '#2d3436',
};

const darkColors = {
  background: '#121212',
  text: '#ffffff',
  subText: '#b2bec3',
  border: '#2c2c2c',
  headerTitle: '#ffffff',
};

export default function SupportScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';
  const colors = theme === 'dark' ? darkColors : lightColors;
  const navigation = useNavigation();

  const SupportOption = ({ icon, title, color, onPress }) => (
    <TouchableOpacity
      style={[styles.supportOption, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text style={[styles.supportOptionText, { color: colors.text }]}>{title}</Text>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.subText} style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.headerTitle }]}>Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoSection}>
          <Text style={[styles.title, { color: colors.text }]}>Contact Support</Text>
          <Text style={[styles.subtitle, { color: colors.subText }]}>How would you like to reach us? Our team is available to help you with any issues.</Text>
        </View>

        <View style={styles.optionsContainer}>
          <SupportOption
            icon="phone"
            title="Call Support"
            color="#27ae60"
            onPress={() => Linking.openURL('tel:+918450906057')}
          />
          <SupportOption
            icon="email-outline"
            title="Email Support"
            color="#3498db"
            onPress={() => Linking.openURL('mailto:support@treato.in?subject=Delivery%20Partner%20Support')}
          />
          <SupportOption
            icon="whatsapp"
            title="WhatsApp Support"
            color="#25D366"
            onPress={() => Linking.openURL('https://wa.me/918450906057?text=Hi%2C%20I%20need%20support%20as%20a%20delivery%20partner.')}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.subText }]}>Available 24/7 for active delivery partners</Text>
        </View>
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
  content: { padding: 24 },
  infoSection: { marginBottom: 32 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 22 },
  optionsContainer: { borderRadius: 16, overflow: 'hidden' },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1
  },
  supportOptionText: { fontSize: 16, fontWeight: '600', marginLeft: 16 },
  footer: { marginTop: 40, alignItems: 'center' },
  footerText: { fontSize: 12, fontWeight: '500' }
});
