import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function CategoryScroll({ categories, selectedCategory, onSelectCategory }) {
  return (
    <View className="mb-8">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => onSelectCategory(category.id)}
              className="items-center mr-5"
              activeOpacity={0.8}
            >
              <View className="relative">
                {/* Circle Container */}
                <View
                  className={`w-[72px] h-[72px] rounded-full items-center justify-center mb-2 overflow-hidden border-2 shadow-sm
                    ${isSelected ? 'bg-orange-50 border-orange-500 shadow-orange-200' : 'bg-white border-gray-100'}`}
                  style={isSelected ? { elevation: 4 } : {}}
                >
                  {/* Fallback to Icon Text - Ideally fetch Image */}
                  <Text className="text-4xl">{category.icon}</Text>
                </View>

                {/* Selection Check or Dot - Optional, sticking to border selection for cleanliness */}
              </View>
              <Text
                className={`text-xs text-center leading-4 w-20 
                ${isSelected ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium'}`}
                numberOfLines={2}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
