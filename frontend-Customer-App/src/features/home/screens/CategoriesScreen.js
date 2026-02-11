import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { ROUTES } from '../../../constants';
import { categories as mockCategories } from '../data/mockData';

export default function CategoriesScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Safeguard against undefined categories
  const categoriesList = mockCategories || [];

  const filteredCategories = categoriesList.filter((cat) =>
    cat.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : '#888' }]}
      activeOpacity={0.7}
      onPress={() => {
        navigation.navigate(ROUTES.SEARCH, { query: item.label });
      }}
    >
      <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F3FF' }]}>
        <Text style={styles.emojiIcon}>{item.icon}</Text>
      </View>
      <Text style={[styles.categoryLabel, { color: colors.text }]}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>All Categories</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textSub} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Search categories..."
              placeholderTextColor={colors.textSub}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.textSub} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories Grid */}
        <FlatList
          data={filteredCategories}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSub }]}>No categories found</Text>
            </View>
          }
        />
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
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    height: '100%',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  columnWrapper: {
    gap: 12,
    justifyContent: 'flex-start',
  },
  categoryCard: {
    flex: 1,
    aspectRatio: 0.85, // Taller than wide
    marginBottom: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 6, // Spacing between columns
    maxWidth: '31%', // Ensure 3 items fit
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emojiIcon: {
    fontSize: 24,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
});
