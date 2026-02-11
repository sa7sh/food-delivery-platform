import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../hooks/useTheme';

export default function TermsScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();

  const lastUpdated = 'January 27, 2025';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Terms & Conditions</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Last Updated */}
          <View style={[styles.updateBanner, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.1)' : '#F3E8FF', borderLeftColor: colors.primary[500] }]}>
            <Text style={[styles.updateText, { color: colors.primary[500] }]}>Last Updated: {lastUpdated}</Text>
          </View>

          {/* Introduction */}
          <View style={styles.section}>
            <Text style={[styles.intro, { color: colors.textSub }]}>
              Welcome to Treato! These Terms and Conditions govern your use of our
              application and services. By accessing or using Treato, you agree to be
              bound by these terms.
            </Text>
          </View>

          {/* Section 1 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Account Registration</Text>

            <Text style={[styles.paragraph, { color: colors.textSub }]}>
              To use our services, you must create an account. You agree to provide accurate,
              current, and complete information during the registration process and to update
              such information to keep it accurate, current, and complete.
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSub }]}>
              You are responsible for safeguarding your password and for all activities
              that occur under your account.
            </Text>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Orders and Deliveries</Text>

            <Text style={[styles.subTitle, { color: colors.text }]}>2.1 Placing Orders</Text>
            <Text style={[styles.paragraph, { color: colors.textSub }]}>
              When you place an order, you are making an offer to purchase the items relating
              to your order. Acceptance of your order is at the discretion of the restaurant partner.
            </Text>

            <Text style={[styles.subTitle, { color: colors.text }]}>2.2 Delivery Info</Text>
            <Text style={[styles.paragraph, { color: colors.textSub }]}>
              Delivery times are estimates and may vary based on traffic, weather, and other factors.
              We are not responsible for delays outside our control.
            </Text>
          </View>

          {/* Section 3 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>3. User Conduct</Text>

            <Text style={[styles.paragraph, { color: colors.textSub }]}>
              You agree not to use the Service for any unlawful purpose or in any way that
              interrupts, damages, implies, or renders the Service less efficient.
            </Text>
          </View>

          {/* Section 4 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Termination</Text>

            <Text style={[styles.paragraph, { color: colors.textSub }]}>
              We may terminate or suspend your account immediately, without prior notice or
              liability, for any reason whatsoever, including without limitation if you
              breach the Terms.
            </Text>
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Contact Us</Text>

            <Text style={[styles.paragraph, { color: colors.textSub }]}>
              If you have any questions about these Terms, please contact us at support@treato.com.
            </Text>
          </View>

          {/* Footer */}
          <View style={[styles.footer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB', borderColor: colors.border }]}>
            <Text style={[styles.footerText, { color: colors.textSub }]}>
              Treato Inc. All rights reserved.
            </Text>
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  updateBanner: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  updateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  intro: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
  footer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
  },
});
