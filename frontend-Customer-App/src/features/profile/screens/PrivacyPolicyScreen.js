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

export default function PrivacyPolicyScreen() {
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Last Updated */}
          <View style={[styles.updateBanner, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.1)' : '#EFF6FF', borderLeftColor: colors.primary[500] }]}>
            <Text style={[styles.updateText, { color: colors.primary[500] }]}>Last Updated: {lastUpdated}</Text>
          </View>

          {/* Introduction */}
          <View style={styles.section}>
            <Text style={[styles.intro, { color: colors.textSub }]}>
              Welcome to Treato! Your privacy is important to us. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when
              you use our food delivery application.
            </Text>
          </View>

          {/* Section 1 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Information We Collect</Text>

            <Text style={[styles.subTitle, { color: colors.text }]}>1.1 Personal Information</Text>
            <Text style={[styles.paragraph, { color: colors.textSub }]}>
              When you create an account, we collect information such as:
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSub }]}>• Full name</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSub }]}>• Email address</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSub }]}>• Phone number</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSub }]}>• Delivery addresses</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSub }]}>• Payment information</Text>

            <Text style={[styles.subTitle, { color: colors.text }]}>1.2 Order Information</Text>
            <Text style={[styles.paragraph, { color: colors.textSub }]}>
              We collect details about your orders including:
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSub }]}>• Items ordered</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSub }]}>• Order history</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSub }]}>• Delivery preferences</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSub }]}>• Restaurant ratings and reviews</Text>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>2. How We Use Your Information</Text>

            <Text style={[styles.paragraph, { color: colors.textSub }]}>
              We use the collected information for the following purposes:
            </Text>

            <Text style={[styles.bulletPoint, { color: colors.textSub }]}>• To process and deliver your food orders</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSub }]}>• To communicate with you about your orders</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSub }]}>• To provide customer support</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSub }]}>• To send you promotional offers and updates</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSub }]}>• To improve our services and user experience</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSub }]}>• To detect and prevent fraud</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSub }]}>• To comply with legal obligations</Text>
          </View>

          {/* Section 3 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Information Sharing</Text>

            <Text style={[styles.paragraph, { color: colors.textSub }]}>
              We may share your information with:
            </Text>

            <Text style={[styles.subTitle, { color: colors.text }]}>3.1 Restaurant Partners</Text>
            <Text style={[styles.paragraph, { color: colors.textSub }]}>
              We share order details with restaurants to fulfill your orders.
            </Text>

            <Text style={[styles.subTitle, { color: colors.text }]}>3.2 Delivery Partners</Text>
            <Text style={[styles.paragraph, { color: colors.textSub }]}>
              Delivery address and contact information is shared with delivery personnel.
            </Text>
          </View>

          {/* Section 4 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Data Security</Text>

            <Text style={[styles.paragraph, { color: colors.textSub }]}>
              We implement appropriate technical and organizational measures to protect your
              personal information:
            </Text>

            <Text style={[styles.bulletPoint, { color: colors.textSub }]}>• Encryption of data in transit and at rest</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSub }]}>• Secure payment processing</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSub }]}>• Regular security assessments</Text>
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Contact Us</Text>

            <Text style={[styles.paragraph, { color: colors.textSub }]}>
              If you have questions or concerns about this Privacy Policy, please contact us:
            </Text>

            <View style={[styles.contactBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB', borderColor: colors.border }]}>
              <Text style={[styles.contactTitle, { color: colors.text }]}>Treato Support</Text>
              <Text style={[styles.contactItem, { color: colors.textSub }]}>📧 Email: privacy@treato.com</Text>
              <Text style={[styles.contactItem, { color: colors.textSub }]}>📞 Phone: +91 1800-123-4567</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={[styles.footer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB', borderColor: colors.border }]}>
            <Text style={[styles.footerText, { color: colors.textSub }]}>
              By using Treato, you acknowledge that you have read and understood this Privacy Policy.
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
  bulletPoint: {
    fontSize: 14,
    lineHeight: 24,
    paddingLeft: 12,
  },
  contactBox: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  contactItem: {
    fontSize: 14,
    lineHeight: 24,
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
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});