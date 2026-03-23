import React from "react";
import { StyleSheet, View, ViewProps, ViewStyle } from "react-native";
import { COLORS } from "@/constants/colors";

interface Props extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "emerald" | "silver" | "honor" | "shame" | "vitality" | "decay";
  style?: ViewStyle;
}

const variantStyles: Record<string, { bg: string; border: string; glow: string }> = {
  default: { bg: "rgba(255,255,255,0.04)", border: COLORS.silverBorder, glow: "transparent" },
  emerald: { bg: "rgba(0,224,122,0.06)", border: COLORS.emeraldBorder, glow: "rgba(0,224,122,0.08)" },
  silver: { bg: "rgba(192,200,216,0.06)", border: COLORS.silverBorder, glow: "rgba(192,200,216,0.08)" },
  honor: { bg: "rgba(255,215,0,0.05)", border: "rgba(255,215,0,0.25)", glow: COLORS.honorGlow },
  shame: { bg: "rgba(168,85,247,0.05)", border: "rgba(168,85,247,0.25)", glow: COLORS.shameGlow },
  vitality: { bg: "rgba(0,224,122,0.05)", border: "rgba(0,224,122,0.25)", glow: COLORS.vitalityGlow },
  decay: { bg: "rgba(239,68,68,0.05)", border: "rgba(239,68,68,0.25)", glow: COLORS.decayGlow },
};

export function GlassPanel({ children, variant = "default", style, ...props }: Props) {
  const vs = variantStyles[variant];

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: vs.bg,
          borderColor: vs.border,
          shadowColor: vs.glow,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    overflow: "hidden",
  },
});
