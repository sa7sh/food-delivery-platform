import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';

const CATEGORIES = [
  { id: '1', name: 'Burger', image: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png' },
  { id: '2', name: 'Pizza', image: 'https://cdn-icons-png.flaticon.com/512/1404/1404945.png' },
  { id: '3', name: 'Asian', image: 'https://cdn-icons-png.flaticon.com/512/5717/5717446.png' },
  { id: '4', name: 'Tacos', image: 'https://cdn-icons-png.flaticon.com/512/4428/4428148.png' },
  { id: '5', name: 'Dessert', image: 'https://cdn-icons-png.flaticon.com/512/2836/2836645.png' },
];

export const FilterModal = ({ visible, onClose, onApply, activeFilters, onReset, styles }) => {
  const [localFilters, setLocalFilters] = useState(activeFilters);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [visible, activeFilters]);

  const toggleCuisine = (cuisine) => {
    setLocalFilters(prev => ({
      ...prev,
      cuisine: prev.cuisine === cuisine ? null : cuisine
    }));
  };

  const toggleOpen = () => {
    setLocalFilters(prev => ({
      ...prev,
      isOpen: !prev.isOpen
    }));
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} />
        </TouchableOpacity>

        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* Drag Handle */}
          <View style={styles.dragHandleContainer}>
            <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Filter</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.textSub }]}>AVAILABILITY</Text>
            <TouchableOpacity
              style={[
                styles.filterOptionRow,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.background,
                  borderColor: localFilters.isOpen ? '#9139BA' : colors.border,
                  borderWidth: 1
                }
              ]}
              onPress={toggleOpen}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="time-outline" size={22} color={localFilters.isOpen ? '#9139BA' : colors.textSub} style={{ marginRight: 12 }} />
                <Text style={[styles.filterOptionText, { color: colors.text }]}>Open Now</Text>
              </View>

              <View style={[
                styles.toggleCircle,
                {
                  backgroundColor: localFilters.isOpen ? '#9139BA' : 'transparent',
                  borderColor: localFilters.isOpen ? '#9139BA' : colors.textSub
                }
              ]}>
                {localFilters.isOpen && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.textSub }]}>CUISINES</Text>
            <View style={styles.chipContainer}>
              {CATEGORIES.map(cat => {
                const isActive = localFilters.cuisine === cat.name;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isActive ? '#9139BA' : (isDark ? 'rgba(255,255,255,0.05)' : colors.background),
                        borderColor: isActive ? '#9139BA' : colors.border,
                      }
                    ]}
                    onPress={() => toggleCuisine(cat.name)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isActive ? '#fff' : colors.text }
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={onReset} style={styles.resetBtn}>
              <Text style={[styles.resetText, { color: colors.textSub }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onApply(localFilters)}
              style={[styles.applyBtn, { backgroundColor: '#9139BA' }]}
              activeOpacity={0.8}
            >
              <Text style={styles.applyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
