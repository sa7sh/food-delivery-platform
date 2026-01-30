import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient'; // Package not installed
import { Ionicons } from '@expo/vector-icons';
import SearchBar from './SearchBar.js';

export default function HeroSection({ onSearchPress }) {
  // Using View with simple background style if linear gradient fails, or try to import it.
  // Assuming expo-linear-gradient IS available in standard expo managed workflow or I'll use View.
  // The user prompt image had a nice glowing effect.

  return (
    <View className="mb-6 relative z-0">
      {/* Background Container */}
      <View className="absolute top-0 left-0 right-0 h-full bg-orange-400 rounded-b-[32px] overflow-hidden">
        {/* Decorative Circles for premium logic */}
        <View className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-orange-300 opacity-30" />
        <View className="absolute top-20 -left-10 w-32 h-32 rounded-full bg-orange-300 opacity-20" />
      </View>

      <View className="px-4 pb-10 pt-2">
        {/* Search Bar */}
        <View className="mt-2 mb-8 shadow-sm">
          <SearchBar onPress={onSearchPress} />
        </View>

        {/* Promo Content */}
        <View className="items-center">
          <Text className="text-red-900 text-lg font-serif italic text-center opacity-90 tracking-wider">
            Celebrating
          </Text>

          <View className="mt-1 mb-4 relative">
            <Text className="text-red-950 text-4xl font-black font-serif text-center shadow-orange-200">
              Basant Panchami
            </Text>
            {/* Decoration Underline */}
            <View className="absolute -bottom-2 w-32 h-1 bg-red-700/30 self-center rounded-full" />
          </View>

          {/* CTA Button Area */}
          <View className="flex-row justify-center items-center mt-4 space-x-6">
            {/* Food Icon Decor */}
            <Text className="text-4xl opacity-90 transform -rotate-12">🥘</Text>

            <View className="bg-red-600 px-6 py-2.5 rounded-full shadow-lg shadow-red-900/20 flex-row items-center space-x-2 border border-red-500">
              <Text className="text-white font-bold text-base tracking-wide">Order now</Text>
              <Ionicons name="arrow-forward-circle" size={20} color="white" />
            </View>

            <Text className="text-4xl opacity-90 transform rotate-12">🍮</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
