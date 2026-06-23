import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useRef, useState } from "react";
import {
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const MIN_PLAYERS = 1;
const MAX_PLAYERS = 20;

const NUMBERS = Array.from(
  { length: MAX_PLAYERS - MIN_PLAYERS + 1 },
  (_, i) => MIN_PLAYERS + i,
);

interface SquadSizePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function SquadSizePicker({ value, onChange }: SquadSizePickerProps) {
  const [open, setOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value ? parseInt(value) : 11);
  const scrollRef = useRef<ScrollView>(null);

  const numValue = value ? parseInt(value) : null;
  const isValid =
    numValue !== null && numValue >= MIN_PLAYERS && numValue <= MAX_PLAYERS;

  const handleOpen = useCallback(() => {
    const initial = numValue ?? 11;
    setTempValue(initial);
    setOpen(true);
    setTimeout(() => {
      const offset = (initial - MIN_PLAYERS) * ITEM_HEIGHT;
      scrollRef.current?.scrollTo({ y: offset, animated: false });
    }, 50);
  }, [numValue]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(index, NUMBERS.length - 1));
      setTempValue(NUMBERS[clamped]);
    },
    [],
  );

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(index, NUMBERS.length - 1));
      setTempValue(NUMBERS[clamped]);
      // Snap to position
      scrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    onChange(String(tempValue));
    setOpen(false);
  }, [tempValue, onChange]);

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, isValid && styles.triggerDone]}
        onPress={handleOpen}
        activeOpacity={0.8}
      >
        <Ionicons
          name="people-outline"
          size={18}
          color={isValid ? "#B71C1C" : "#9E9E9E"}
        />
        <Text
          style={[styles.triggerText, !numValue && styles.triggerPlaceholder]}
        >
          {numValue ? `${numValue} Players` : "Select squad size"}
        </Text>
        {isValid ? (
          <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
        ) : (
          <Ionicons name="chevron-down" size={18} color="#9E9E9E" />
        )}
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Select Squad Size</Text>
            <Text style={styles.pickerSubtitle}>
              Min {MIN_PLAYERS} · Max {MAX_PLAYERS} players
            </Text>

            {/* Wheel Picker */}
            <View style={styles.wheelWrap}>
              {/* Selection highlight bar */}
              <View style={styles.selectionHighlight} pointerEvents="none" />

              <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onScroll={handleScroll}
                onMomentumScrollEnd={handleScrollEnd}
                onScrollEndDrag={handleScrollEnd}
                scrollEventThrottle={16}
                contentContainerStyle={{
                  paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                }}
              >
                {NUMBERS.map((n) => {
                  const isActive = n === tempValue;
                  return (
                    <TouchableOpacity
                      key={n}
                      style={styles.wheelItem}
                      activeOpacity={0.7}
                      onPress={() => {
                        setTempValue(n);
                        const offset = (n - MIN_PLAYERS) * ITEM_HEIGHT;
                        scrollRef.current?.scrollTo({
                          y: offset,
                          animated: true,
                        });
                      }}
                    >
                      <Text
                        style={[
                          styles.wheelText,
                          isActive && styles.wheelTextActive,
                        ]}
                      >
                        {n}
                      </Text>
                      {isActive && (
                        <Text style={styles.wheelLabel}>
                          {n === 1 ? "Player" : "Players"}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmText}>Select {tempValue} Players</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  triggerDone: {
    borderColor: "#B71C1C",
    backgroundColor: "#FBE9E7",
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#212121",
  },
  triggerPlaceholder: {
    color: "#9E9E9E",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "80%",
    alignItems: "center",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#212121",
    marginBottom: 4,
  },
  pickerSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9E9E9E",
    marginBottom: 20,
  },
  wheelWrap: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  selectionHighlight: {
    position: "absolute",
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: "#FBE9E7",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#B71C1C",
    zIndex: 0,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  wheelText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#BDBDBD",
  },
  wheelTextActive: {
    fontSize: 26,
    fontWeight: "800",
    color: "#B71C1C",
  },
  wheelLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#B71C1C",
  },
  confirmButton: {
    backgroundColor: "#B71C1C",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
