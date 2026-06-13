import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Reusable section header with optional subtitle and right-side action.
 * Used across home feed sections, looking feed, store sections, etc.
 */
export function SectionHeader({ title, subtitle, right, style }: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textGroup}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {right && <View>{right}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    color: '#222',
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    color: '#777',
    fontSize: 12,
    marginTop: 2,
  },
});
