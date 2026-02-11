import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { colors } from '../../../theme';

export default function SearchSuggestions({ suggestions, onSuggestionPress }) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <FlatList
          data={suggestions}
          keyExtractor={(item, index) => index.toString()}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item, index }) => (
            <TouchableOpacity
              activeOpacity={0.75}
              style={[
                styles.suggestionItem,
                index === suggestions.length - 1 && styles.lastItem,
              ]}
              onPress={() => onSuggestionPress(item)}
            >
              {/* Left icon */}
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>Search</Text>
              </View>

              {/* Suggestion text */}
              <Text style={styles.suggestionText} numberOfLines={1}>
                {item}
              </Text>

              {/* Right arrow */}
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

/* ----------------------------------
   STYLES
----------------------------------- */
const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
  },

  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[100],
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },

  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[50],
  },

  lastItem: {
    borderBottomWidth: 0,
  },

  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  iconText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.gray[400],
  },

  suggestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray[800],
  },

  arrow: {
    fontSize: 18,
    color: colors.gray[300],
    marginLeft: 8,
  },
});
