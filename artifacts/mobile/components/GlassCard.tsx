import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export function GlassCard({ children, style, padding = 20 }: Props) {
  return (
    <View style={[styles.card, { padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,248,252,0.95)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(234,212,245,0.7)",
    shadowColor: "#C4A8F5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
  },
});
