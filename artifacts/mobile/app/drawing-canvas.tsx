import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Point { x: number; y: number }
interface DrawPath { points: Point[]; color: string; width: number; isEraser: boolean }
type Tool = "pencil" | "brush" | "eraser";

function pointsToSvgD(points: Point[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) d += ` L ${points[i].x} ${points[i].y}`;
  return d;
}

// ── Color palette ─────────────────────────────────────────────────────────────
const COLORS = [
  "#1A0F2E", "#6C4DFF", "#FF6B6B", "#90BE6D",
  "#F8961E", "#48CAE4", "#FF6B9D", "#9B7FFF", "#FFFFFF",
];

// ── Tool button (extracted so animated refs are never inside .map) ─────────────
function ToolBtn({ tool, active, onPress }: { tool: Tool; active: boolean; onPress: () => void }) {
  const iconName = tool === "pencil" ? "pencil" : tool === "brush" ? "brush" : "remove-circle-outline";
  return (
    <TouchableOpacity onPress={onPress} style={[styles.toolBtn, active && styles.toolBtnActive]}>
      <Ionicons name={iconName} size={20} color={active ? "#fff" : "#6C4DFF"} />
      <Text style={[styles.toolLabel, active && styles.toolLabelActive]}>
        {tool.charAt(0).toUpperCase() + tool.slice(1)}
      </Text>
    </TouchableOpacity>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function DrawingCanvas() {
  const insets = useSafeAreaInsets();
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const { children } = useApp();
  const child = children.find((c) => c.id === childId);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Drawing state
  const [paths, setPaths]                     = useState<DrawPath[]>([]);
  const [currentPathPoints, setCurrentPath]   = useState<Point[]>([]);
  const currentPointsRef                      = useRef<Point[]>([]);
  const [activeTool, setActiveTool]           = useState<Tool>("pencil");
  const [selectedColor, setSelectedColor]     = useState("#1A0F2E");

  // Description state
  const [description, setDescription] = useState("");
  const [descFocused, setDescFocused] = useState(false);

  const brushWidth = activeTool === "brush" ? 10 : activeTool === "eraser" ? 24 : 4;
  const strokeColor = activeTool === "eraser" ? "#FFFFFF" : selectedColor;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder:  () => true,
    onPanResponderGrant: (evt) => {
      const pt = { x: evt.nativeEvent.locationX, y: evt.nativeEvent.locationY };
      currentPointsRef.current = [pt];
      setCurrentPath([pt]);
    },
    onPanResponderMove: (evt) => {
      const pt = { x: evt.nativeEvent.locationX, y: evt.nativeEvent.locationY };
      currentPointsRef.current = [...currentPointsRef.current, pt];
      setCurrentPath([...currentPointsRef.current]);
    },
    onPanResponderRelease: () => {
      if (currentPointsRef.current.length > 0) {
        setPaths((prev) => [
          ...prev,
          { points: [...currentPointsRef.current], color: strokeColor, width: brushWidth, isEraser: activeTool === "eraser" },
        ]);
        currentPointsRef.current = [];
        setCurrentPath([]);
      }
    },
  });

  function handleUndo() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPaths((prev) => prev.slice(0, -1));
  }

  function handleClear() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPaths([]);
    setCurrentPath([]);
  }

  function selectTool(tool: Tool) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTool(tool);
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: topPad }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* ── Nav bar ── */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#1A0F2E" />
        </TouchableOpacity>

        {/* Child chip */}
        {child && (
          <View style={styles.childChip}>
            <LinearGradient
              colors={[child.avatarColor + "DD", child.avatarColor]}
              style={styles.chipAvatar}
            >
              <Text style={styles.chipInitials}>{child.initials}</Text>
            </LinearGradient>
            <View>
              <Text style={styles.chipName}>{child.name}</Text>
              <Text style={styles.chipAge}>Age {child.age}</Text>
            </View>
          </View>
        )}

        {/* Undo + Clear */}
        <View style={styles.actionBtns}>
          <TouchableOpacity onPress={handleUndo} style={styles.iconBtn} disabled={paths.length === 0}>
            <Ionicons name="arrow-undo" size={18} color={paths.length > 0 ? "#6C4DFF" : "#C0B0D8"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClear} style={styles.iconBtn} disabled={paths.length === 0}>
            <Ionicons name="trash-outline" size={18} color={paths.length > 0 ? "#FF6B6B" : "#C0B0D8"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Canvas ── */}
      <View style={styles.canvasWrap}>
        <View style={styles.canvas} {...panResponder.panHandlers}>
          <Svg style={StyleSheet.absoluteFill}>
            {paths.map((p, idx) => (
              <Path
                key={idx}
                d={pointsToSvgD(p.points)}
                stroke={p.color}
                strokeWidth={p.width}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {currentPathPoints.length > 0 && (
              <Path
                d={pointsToSvgD(currentPathPoints)}
                stroke={strokeColor}
                strokeWidth={brushWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>
          {paths.length === 0 && currentPathPoints.length === 0 && (
            <View style={styles.canvasHint} pointerEvents="none">
              <Ionicons name="brush-outline" size={42} color="#E0D9FF" />
              <Text style={styles.canvasHintText}>Draw here</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Tools ── */}
      <View style={styles.toolsSection}>
        {/* Color picker */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.colorsRow}
        >
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => { setSelectedColor(c); if (activeTool === "eraser") setActiveTool("pencil"); }}
              style={[
                styles.colorDot,
                { backgroundColor: c },
                c === "#FFFFFF" && styles.colorDotWhite,
                selectedColor === c && activeTool !== "eraser" && styles.colorDotSelected,
              ]}
            />
          ))}
        </ScrollView>

        {/* Tool row */}
        <View style={styles.toolsRow}>
          <ToolBtn tool="pencil"  active={activeTool === "pencil"}  onPress={() => selectTool("pencil")}  />
          <ToolBtn tool="brush"   active={activeTool === "brush"}   onPress={() => selectTool("brush")}   />
          <ToolBtn tool="eraser"  active={activeTool === "eraser"}  onPress={() => selectTool("eraser")}  />
        </View>
      </View>

      {/* ── Description box ── */}
      <View style={[styles.descSection, { paddingBottom: botPad + 12 }]}>
        <View style={styles.descLabelRow}>
          <Ionicons name="create-outline" size={15} color="#8B7BAB" />
          <Text style={styles.descLabel}>Parent Notes</Text>
        </View>
        <View style={[styles.descBox, descFocused && styles.descBoxFocused]}>
          <TextInput
            style={styles.descInput}
            placeholder="Describe the situation, child's mood, and any observations about this drawing…"
            placeholderTextColor="#C0B0D8"
            value={description}
            onChangeText={setDescription}
            onFocus={() => setDescFocused(true)}
            onBlur={() => setDescFocused(false)}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={500}
          />
          {description.length > 0 && (
            <Text style={styles.charCount}>{description.length}/500</Text>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F1FF" },

  /* Nav */
  navBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#6C4DFF", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  childChip: { flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, shadowColor: "#6C4DFF", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  chipAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  chipInitials: { fontSize: 11, fontWeight: "800", color: "#fff", fontFamily: "Inter_700Bold" },
  chipName: { fontSize: 13, fontWeight: "700", color: "#1A0F2E", fontFamily: "Inter_700Bold" },
  chipAge: { fontSize: 10, color: "#8B7BAB", fontFamily: "Inter_400Regular" },
  actionBtns: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#EDE9FF" },

  /* Canvas */
  canvasWrap: { flex: 1, paddingHorizontal: 16, paddingVertical: 6 },
  canvas: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#DDD6FF",
    shadowColor: "#6C4DFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  canvasHint: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", gap: 10 },
  canvasHintText: { fontSize: 15, color: "#DDD6FF", fontFamily: "Inter_500Medium" },

  /* Tools */
  toolsSection: { paddingHorizontal: 16, gap: 10, paddingBottom: 6 },
  colorsRow: { gap: 9, alignItems: "center", paddingHorizontal: 2 },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorDotWhite: { borderWidth: 1.5, borderColor: "#DDD6FF" },
  colorDotSelected: { borderWidth: 3, borderColor: "#6C4DFF", transform: [{ scale: 1.1 }] },
  toolsRow: { flexDirection: "row", gap: 10 },
  toolBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#EDE9FF", borderRadius: 14, paddingVertical: 9, borderWidth: 1, borderColor: "#DDD6FF" },
  toolBtnActive: { backgroundColor: "#6C4DFF", borderColor: "#6C4DFF" },
  toolLabel: { fontSize: 12, fontWeight: "600", color: "#6C4DFF", fontFamily: "Inter_600SemiBold" },
  toolLabelActive: { color: "#fff" },

  /* Description */
  descSection: { paddingHorizontal: 16, gap: 8, paddingTop: 2 },
  descLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  descLabel: { fontSize: 12, fontWeight: "600", color: "#8B7BAB", fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
  descBox: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    borderWidth: 1.5,
    borderColor: "#DDD6FF",
    shadowColor: "#6C4DFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 80,
  },
  descBoxFocused: { borderColor: "#6C4DFF" },
  descInput: { fontSize: 13, color: "#1A0F2E", fontFamily: "Inter_400Regular", lineHeight: 20, minHeight: 52 },
  charCount: { fontSize: 10, color: "#C0B0D8", fontFamily: "Inter_400Regular", textAlign: "right", marginTop: 4 },
});
