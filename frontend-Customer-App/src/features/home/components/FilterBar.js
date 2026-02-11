import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme';

export default function FilterBar({ filters, onFilterPress }) {
  // Helper to get icon name based on label/type
  const getIcon = (label) => {
    if (label === 'Filters') return 'options-outline';
    if (label.includes('Near')) return 'flash-outline';
    if (label.includes('Offers')) return 'pricetag-outline';
    if (label.includes('Rating')) return 'star-outline';
    if (label.includes('New')) return 'sparkles-outline';
    return null;
  };

  return (
    <View className="mb-6">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {filters.map((filter) => {
          const iconName = getIcon(filter.label);
          const isFilterBtn = filter.label === 'Filters';

          return (
            <TouchableOpacity
              key={filter.id}
              onPress={() => onFilterPress(filter.id)}
              className={`flex-row items-center border rounded-xl px-3.5 py-2 mr-3 shadow-sm
                ${isFilterBtn ? 'bg-white border-gray-300' : 'bg-white border-gray-200'}`}
              activeOpacity={0.7}
            >
              {iconName && (
                <Ionicons
                  name={iconName}
                  size={16}
                  color={filter.label.includes('Near') ? '#16a34a' : '#374151'}
                  style={{ marginRight: 6 }}
                />
              )}

              <Text className="text-sm font-semibold text-gray-700">
                {filter.label}
              </Text>

              {isFilterBtn && (
                <Ionicons name="caret-down-outline" size={12} color="#374151" style={{ marginLeft: 6 }} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
