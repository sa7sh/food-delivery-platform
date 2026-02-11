import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { colors } from '../../../theme';
import { useUserStore } from '../../../store';
import { ROUTES } from '../../../constants';

function AddressCard({ address, onEdit, onDelete, onSelect, colors, isDark }) {
  const getIcon = () => {
    switch (address.label?.toLowerCase()) {
      case 'home': return 'home-outline';
      case 'work': return 'briefcase-outline';
      default: return 'location-outline';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.addressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => onSelect(address)}
      activeOpacity={0.7}
    >
      <View style={styles.addressHeader}>
        <View style={styles.labelContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceHighlight }]}>
            <Ionicons name={getIcon()} size={20} color="#9139BA" />
          </View>
          <Text style={[styles.labelText, { color: colors.text }]}>{address.label}</Text>
        </View>
        {address.isDefault && (
          <View style={[styles.defaultBadge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5' }]}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>

      <View style={styles.addressBody}>
        <Text style={[styles.addressText, { color: colors.text }]}>{address.street}</Text>
        <Text style={[styles.addressSubText, { color: colors.textSub }]}>
          {address.city}, {address.state} - {address.pincode}
        </Text>
        {address.landmark && (
          <Text style={[styles.landmarkText, { color: colors.textSub }]}>
            <Text style={{ fontWeight: '600', color: colors.text }}>Landmark: </Text>{address.landmark}
          </Text>
        )}
      </View>

      <View style={[styles.addressActions, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(address)}
        >
          <Ionicons name="create-outline" size={18} color="#9139BA" />
          <Text style={[styles.actionText, { color: '#9139BA' }]}>Edit</Text>
        </TouchableOpacity>

        <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onDelete(address)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function SavedAddressesScreen() {
  const navigation = useNavigation();
  const { addresses = [], fetchAddresses, deleteAddress, setSelectedAddress } = useUserStore();
  const { colors, isDark } = useTheme();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = () => {
    navigation.navigate(ROUTES.ADD_ADDRESS);
  };

  const handleEditAddress = (address) => {
    Alert.alert('Edit Address', `Navigating to edit: ${address.label}`);
  };

  const handleDeleteAddress = (address) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to remove this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteAddress(address.id);
            if (result.success) {
              Alert.alert('Success', 'Address deleted');
            }
          },
        },
      ]
    );
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    Alert.alert('Success', `${address.label} set as delivery address`);
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={[styles.headerArea, { backgroundColor: colors.surface }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Addresses</Text>
          <TouchableOpacity onPress={handleAddAddress} style={[styles.addButton, { backgroundColor: '#9139BA' }]}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEditAddress}
              onDelete={handleDeleteAddress}
              onSelect={handleSelectAddress}
              colors={colors}
              isDark={isDark}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceHighlight }]}>
              <Ionicons name="map-outline" size={60} color={colors.textSub} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No saved addresses</Text>
            <Text style={[styles.emptyText, { color: colors.textSub }]}>
              Add your home or work address for a faster checkout experience next time.
            </Text>
            <TouchableOpacity
              style={[styles.addFirstButton, { backgroundColor: '#9139BA' }]}
              onPress={handleAddAddress}
            >
              <Text style={styles.addFirstButtonText}>Add New Address</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerArea: {
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.gray[900],
    letterSpacing: -0.5,
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[600],
    borderRadius: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  addressCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.gray[900],
  },
  defaultBadge: {
    backgroundColor: colors.success + '15', // Transparent success color
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.success || '#10B981',
    textTransform: 'uppercase',
  },
  addressBody: {
    marginBottom: 16,
  },
  addressText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray[800],
    lineHeight: 22,
  },
  addressSubText: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 2,
  },
  landmarkText: {
    fontSize: 13,
    color: colors.gray[600],
    marginTop: 8,
    fontStyle: 'italic',
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary[600],
  },
  verticalDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#F1F5F9',
  },
  deleteText: {
    color: colors.error,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.gray[900],
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  addFirstButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  addFirstButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});