import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ChipGroupProps {
  items: string[];
  selected: string;
  onSelect: (item: string) => void;
  activeColor?: string;
}

/**
 * Shared chip/tag selector for forms.
 * Replaces `renderChipGroup` helper in my-cricket.tsx.
 */
export function ChipGroup({ items, selected, onSelect, activeColor = '#00A66A' }: ChipGroupProps) {
  return (
    <View style={styles.chipGrid}>
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          style={[
            styles.chip,
            selected === item && { backgroundColor: activeColor, borderColor: activeColor },
          ]}
          onPress={() => onSelect(item)}
        >
          <Text style={[styles.chipText, selected === item && styles.chipTextActive]}>
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#F8F8F8',
  },
  chipText: {
    color: '#555',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
});
