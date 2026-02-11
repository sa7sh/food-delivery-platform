import React, { useState } from 'react';
import * as Location from 'expo-location';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { useUserStore } from '../../../store';

export default function AddAddressScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { addAddress, isLoading } = useUserStore();

  const [isLocating, setIsLocating] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    latitude: null,
    longitude: null,
    isDefault: false,
  });

  const handleUseLocation = async () => {
    setIsLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        setIsLocating(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Reverse Geocoding
      let addressResponse = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (addressResponse.length > 0) {
        const addr = addressResponse[0];
        setFormData(prev => ({
          ...prev,
          street: `${addr.name || ''} ${addr.street || ''}`.trim(),
          city: addr.city || addr.subregion || '',
          state: addr.region || '',
          pincode: addr.postalCode || '',
          latitude,
          longitude,
        }));
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not detect location. Please try again or enter manually.');
    } finally {
      setIsLocating(false);
    }
  };

  const [errors, setErrors] = useState({});

  const validate = () => {
    let valid = true;
    let newErrors = {};

    if (!formData.label.trim()) {
      newErrors.label = 'Label is required (e.g. Home, Work)';
      valid = false;
    }
    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
      valid = false;
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
      valid = false;
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
      valid = false;
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const result = await addAddress(formData);
      if (result.success) {
        Alert.alert('Success', 'Address saved successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', result.error || 'Failed to save address');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleLabelSelect = (label) => {
    setFormData({ ...formData, label });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={[styles.headerArea, { backgroundColor: colors.surface }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Add New Address</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Label Selection */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Label</Text>
          <View style={styles.labelRow}>
            {['Home', 'Work', 'Other'].map((label) => (
              <TouchableOpacity
                key={label}
                style={[
                  styles.labelChip,
                  {
                    backgroundColor: formData.label === label ? '#9139BA' : colors.surfaceHighlight,
                    borderColor: formData.label === label ? '#9139BA' : colors.border
                  }
                ]}
                onPress={() => handleLabelSelect(label)}
              >
                <Ionicons
                  name={label === 'Home' ? 'home-outline' : label === 'Work' ? 'briefcase-outline' : 'location-outline'}
                  size={16}
                  color={formData.label === label ? '#FFF' : colors.textSub}
                />
                <Text style={[
                  styles.chipText,
                  { color: formData.label === label ? '#FFF' : colors.text }
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.label && <Text style={styles.errorText}>{errors.label}</Text>}

          {/* Use Current Location Button */}
          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleUseLocation}
            disabled={isLocating}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color="#9139BA" />
            ) : (
              <Ionicons name="locate" size={20} color="#9139BA" />
            )}
            <Text style={styles.locationButtonText}>
              {isLocating ? 'Detecting Location...' : 'Use Current Location'}
            </Text>
          </TouchableOpacity>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSub }]}>Street Address</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: errors.street ? colors.error : colors.border
                }
              ]}
              placeholder="e.g. 123 Main St, Apt 4B"
              placeholderTextColor={colors.textSub}
              value={formData.street}
              onChangeText={(text) => setFormData({ ...formData, street: text })}
            />
            {errors.street && <Text style={styles.errorText}>{errors.street}</Text>}
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={[styles.label, { color: colors.textSub }]}>City</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: errors.city ? colors.error : colors.border
                  }
                ]}
                placeholder="City"
                placeholderTextColor={colors.textSub}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
              />
              {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSub }]}>State</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: errors.state ? colors.error : colors.border
                  }
                ]}
                placeholder="State"
                placeholderTextColor={colors.textSub}
                value={formData.state}
                onChangeText={(text) => setFormData({ ...formData, state: text })}
              />
              {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={[styles.label, { color: colors.textSub }]}>Pincode</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: errors.pincode ? colors.error : colors.border
                  }
                ]}
                placeholder="123456"
                placeholderTextColor={colors.textSub}
                keyboardType="number-pad"
                maxLength={6}
                value={formData.pincode}
                onChangeText={(text) => setFormData({ ...formData, pincode: text })}
              />
              {errors.pincode && <Text style={styles.errorText}>{errors.pincode}</Text>}
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              {/* Spacer */}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSub }]}>Landmark (Optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="Near Central Park"
              placeholderTextColor={colors.textSub}
              value={formData.landmark}
              onChangeText={(text) => setFormData({ ...formData, landmark: text })}
            />
          </View>

          {/* Location Coordinates Preview (Optional but good for debugging/confirmation) */}
          {formData.latitude && formData.longitude && (
            <View style={[styles.coordinatesBox, { backgroundColor: colors.surfaceHighlight }]}>
              <Ionicons name="location-sharp" size={16} color={colors.primary[500]} />
              <Text style={[styles.coordinatesText, { color: colors.textSub }]}>
                GPS: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
              </Text>
            </View>
          )}

          {/* Default Switch */}
          <View style={[styles.switchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.switchLabel, { color: colors.text }]}>Set as default address</Text>
            <Switch
              value={formData.isDefault}
              onValueChange={(val) => setFormData({ ...formData, isDefault: val })}
              trackColor={{ false: colors.border, true: '#9139BA' }}
              thumbColor={'#fff'}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, { opacity: isLoading ? 0.7 : 1 }]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Address</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerArea: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  backButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 10,
  },
  labelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#DBC0E8',
  },
  locationButtonText: {
    color: '#9139BA',
    fontWeight: '600',
    fontSize: 15,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  coordinatesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: -8,
    marginBottom: 16,
    gap: 6,
  },
  coordinatesText: {
    fontSize: 13,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#9139BA',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
