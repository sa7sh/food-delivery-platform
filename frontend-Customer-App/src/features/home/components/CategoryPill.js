import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../../constants';

export const CategoryPill = ({ item, colors, styles }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.catPill}
      onPress={() => navigation.navigate(ROUTES.SEARCH, { query: item.name })}
    >
      <View style={[styles.catImgWrap, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <Image source={{ uri: item.image }} style={styles.catImg} />
      </View>
      <Text style={[styles.catText, { color: colors.text }]}>{item.name}</Text>
    </TouchableOpacity>
  );
};
