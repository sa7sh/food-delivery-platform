import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQItem = ({ question, answer, colors, isDark }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.faqItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.faqHeader}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={[styles.question, { color: colors.text }]}>{question}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSub}
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.faqBody}>
          <Text style={[styles.answer, { color: colors.textSub }]}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

const ContactOption = ({ icon, title, subtitle, onPress, colors, isDark }) => (
  <TouchableOpacity
    style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(145, 57, 186, 0.2)' : '#F3E8FF' }]}>
      <Ionicons name={icon} size={24} color="#9139BA" />
    </View>
    <View style={styles.contactInfo}>
      <Text style={[styles.contactTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.contactSubtitle, { color: colors.textSub }]}>{subtitle}</Text>
    </View>
    <Ionicons name="arrow-forward" size={20} color={colors.textSub} />
  </TouchableOpacity>
);

export default function HelpSupportScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();

  const handleEmail = () => {
    Linking.openURL('mailto:support@treato.com');
  };

  const handleCall = () => {
    Linking.openURL('tel:+9118001234567');
  };

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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>How can we help you?</Text>

          {/* Contact Options */}
          <View style={styles.contactSection}>
            <ContactOption
              icon="mail-outline"
              title="Email Support"
              subtitle="Get a response within 24h"
              onPress={handleEmail}
              colors={colors}
              isDark={isDark}
            />
            <ContactOption
              icon="call-outline"
              title="Call Us"
              subtitle="Mon-Fri, 9am - 6pm"
              onPress={handleCall}
              colors={colors}
              isDark={isDark}
            />
            <ContactOption
              icon="chatbubbles-outline"
              title="Live Chat"
              subtitle="Chat with our support team"
              onPress={() => { /* Mock Action */ }}
              colors={colors}
              isDark={isDark}
            />
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Freqently Asked Questions</Text>

          {/* FAQS */}
          <View style={styles.faqList}>
            <FAQItem
              question="Where is my order?"
              answer="You can track your order in real-time from the 'Orders' tab. If the status hasn't changed for a while, please contact the restaurant directly."
              colors={colors}
              isDark={isDark}
            />
            <FAQItem
              question="How do I change my address?"
              answer="Go to Profile > Saved Addresses to add, edit, or remove delivery addresses."
              colors={colors}
              isDark={isDark}
            />
            <FAQItem
              question="Can I cancel my order?"
              answer="You can cancel your order within 5 minutes of placing it. After that, cancellation depends on whether the restaurant has started preparing your food."
              colors={colors}
              isDark={isDark}
            />
            <FAQItem
              question="My food arrived cold/damaged"
              answer="We are sorry to hear that! Please contact our support team immediately with a photo of the item, and we will resolve it for you."
              colors={colors}
              isDark={isDark}
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept Credit/Debit cards, UPI, Wallets, and Net Banking. Cash on Delivery is available for select locations."
              colors={colors}
              isDark={isDark}
            />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  contactSection: {
    marginBottom: 10,
    gap: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 13,
  },

  // FAQ
  faqList: {
    gap: 10,
  },
  faqItem: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  question: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginRight: 10,
  },
  faqBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  answer: {
    fontSize: 14,
    lineHeight: 22,
  },
});
