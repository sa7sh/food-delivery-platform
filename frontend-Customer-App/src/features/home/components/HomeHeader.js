import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../../store';

export default function HomeHeader({ onLocationPress }) {
  const { selectedAddress } = useUserStore();

  return (
    <View className="flex-row items-center justify-between px-4 pt-2 pb-4">
      {/* Location Section */}
      <TouchableOpacity
        onPress={onLocationPress}
        className="flex-1 mr-4"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center mb-1">
          <Ionicons name="location" size={24} color="#DBC0E8B5" />
          <Text className="text-lg font-bold text-gray-900 ml-1" numberOfLines={1}>
            {selectedAddress?.city || 'Prashant Nagar'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#374151" className="ml-1" />
        </View>
        <Text className="text-gray-600 text-xs font-medium pl-8" numberOfLines={1}>
          {selectedAddress?.street || 'Naupada, Thane West, Thane'}
        </Text>
      </TouchableOpacity>

      {/* Right Icons Section */}
      <View className="flex-row items-center space-x-3">
        {/* Wallet / Offers Icon */}
        <TouchableOpacity className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center">
          <Ionicons name="card-outline" size={22} color="#f97316" />
        </TouchableOpacity>

        {/* User Profile */}
        <TouchableOpacity className="w-10 h-10 rounded-full bg-white border border-gray-200 items-center justify-center shadow-sm">
          <Text className="text-orange-600 font-bold text-lg">S</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
