import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface FormTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  required?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
}

/**
 * Shared labelled text input for forms (match setup, tournament creation, team creation, etc.)
 * Replaces `renderTextInput` helper in my-cricket.tsx.
 */
export function FormTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  keyboardType = 'default',
}: FormTextInputProps) {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>
        {label} {required && '*'}
      </Text>
      <TextInput
        style={styles.formInput}
        placeholder={placeholder}
        placeholderTextColor="#CCC"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    color: '#555',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#222',
    fontSize: 15,
  },
});
