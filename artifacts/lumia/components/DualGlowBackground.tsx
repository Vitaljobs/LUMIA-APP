import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { COLORS } from "@/constants/colors";

interface Props extends ViewProps {
  children: React.ReactNode;
  intensity?: "subtle" | "normal" | "strong";
}

export function DualGlowBackground({ children, intensity = "normal", style, ...props }: Props) {
  const opacities = {
    subtle: { top: 0.08, bottom: 0.06 },
    normal: { top: 0.14, bottom: 0.10 },
    strong: { top: 0.22, bottom: 0.18 },
  };
  const op = opacities[intensity];

  return (
    <View style={[styles.container, style]} {...props}>
      {/* Deep background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.bg }]} />

      {/* Silver-white glow from top */}
      <LinearGradient
        colors={[`rgba(200,215,255,${op.top})`, `rgba(200,215,255,0.04)`, "transparent"]}
        style={styles.topGlow}
        pointerEvents="none"
      />

      {/* Emerald glow from bottom */}
      <LinearGradient
        colors={["transparent", `rgba(0,200,100,0.04)`, `rgba(0,200,100,${op.bottom})`]}
        style={styles.bottomGlow}
        pointerEvents="none"
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  topGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    zIndex: 0,
  },
  bottomGlow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    zIndex: 0,
  },
});
