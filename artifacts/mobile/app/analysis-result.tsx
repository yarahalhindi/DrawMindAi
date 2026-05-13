import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmotionBar } from "@/components/EmotionBar";
import { GlassCard } from "@/components/GlassCard";
import { useApp } from "@/context/AppContext";

const INSIGHT_ICONS: Record<string, string> = {
  "Emotional State": "heart",
  "Social Indicators": "people",
  "Stress Signals": "alert-circle",
  "Creativity Level": "color-palette",
  "Confidence Level": "star",
};

function CircleScore({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={cs.circleWrap}>
      <View style={[cs.circle, { borderColor: color }]}>
        <Text style={[cs.circleNum, { color }]}>{value}%</Text>
      </View>
      <Text style={cs.circleLabel}>{label}</Text>
    </View>
  );
}

const cs = StyleSheet.create({
  circleWrap: { alignItems: "center", gap: 6 },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDF8F5",
  },
  circleNum: {
    fontSize: 18,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
  },
  circleLabel: {
    fontSize: 11,
    color: "#A090B8",
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    maxWidth: 72,
  },
});

export default function AnalysisResultScreen() {
  const insets = useSafeAreaInsets();
  const { childId, drawingId } = useLocalSearchParams<{ childId: string; drawingId: string }>();
  const { drawings, children } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Resolve the drawing reactively — state update from addDrawing() may not
  // have committed to context yet when this screen first mounts (race condition).
  type Drawing = (typeof drawings)[number];
  const [latestDrawing, setLatestDrawing] = useState<Drawing | null>(null);
  const [timedOut, setTimedOut]           = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const found = drawingId
      ? drawings.find((d) => d.id === drawingId)
      : drawings.find((d) => d.childId === childId);
    if (found) {
      setLatestDrawing(found);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [drawings, drawingId, childId]);

  // Safety timeout — stop waiting after 6 seconds
  useEffect(() => {
    timerRef.current = setTimeout(() => setTimedOut(true), 6000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const child = children.find((c) => c.id === childId);

  // Extract image URI from pathsJson (canvas snapshot or uploaded photo)
  let uploadedImageUri: string | null = null;
  if (latestDrawing?.pathsJson) {
    try {
      const parsed = JSON.parse(latestDrawing.pathsJson);
      if (parsed?.imageUri) uploadedImageUri = parsed.imageUri;
    } catch {
      uploadedImageUri = null;
    }
  }

  // Show spinner while waiting for context to update
  if (!latestDrawing && !timedOut) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: topPad }]}>
        <LinearGradient colors={["#C4A8F5", "#F0A8C8"]} style={styles.loadingIcon}>
          <Ionicons name="sparkles" size={28} color="#fff" />
        </LinearGradient>
        <Text style={styles.loadingTitle}>Preparing your analysis…</Text>
        <Text style={styles.loadingSubtitle}>Almost ready</Text>
        <ActivityIndicator size="large" color="#A78BFA" style={{ marginTop: 8 }} />
      </View>
    );
  }

  if (!latestDrawing) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color="#4A3070" />
        </TouchableOpacity>
        <Text style={styles.noDataText}>No analysis found</Text>
      </View>
    );
  }

  const behaviorInsights = [
    {
      label: "Emotional State",
      value: latestDrawing.emotionalState,
    },
    {
      label: "Social Indicators",
      value: latestDrawing.socialIndicators,
    },
    {
      label: "Stress Signals",
      value: latestDrawing.stressSignals,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Nav */}
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color="#4A3070" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>AI Analysis</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Drawing Preview */}
        <GlassCard style={styles.drawingPreview} padding={24}>
          <View style={styles.thumbOuter}>
            {uploadedImageUri ? (
              <Image
                source={{ uri: uploadedImageUri }}
                style={styles.thumbImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={["#F0E8FF", "#EAD4F5"]}
                style={styles.thumbInner}
              >
                <Image
                  source={require("@/assets/images/whale-magnifier.png")}
                  style={styles.whaleThumb}
                  resizeMode="contain"
                />
              </LinearGradient>
            )}
          </View>
          <View style={styles.previewInfo}>
            <Text style={styles.previewChildName}>{child?.name}'s Drawing</Text>
            <Text style={styles.previewDate}>{latestDrawing.date}</Text>
            <View style={styles.savedBadge}>
              <Ionicons name="checkmark-circle" size={13} color="#6C4DFF" />
              <Text style={styles.savedBadgeText}>Saved to profile</Text>
            </View>
          </View>
        </GlassCard>

        {/* Main Emotion */}
        <LinearGradient
          colors={["#C4A8F5", "#F0A8C8"]}
          style={styles.mainEmotionCard}
        >
          <Text style={styles.mainEmotionLabel}>Main Emotion</Text>
          <Text style={styles.mainEmotionValue}>{latestDrawing.mainEmotion}</Text>
          <Text style={styles.mainEmotionConf}>
            {latestDrawing.confidence}% confidence
          </Text>
        </LinearGradient>

        {/* Emotion Circles */}
        <GlassCard style={styles.circlesCard} padding={20}>
          <Text style={styles.sectionTitle}>Emotion Breakdown</Text>
          <View style={styles.circlesRow}>
            {latestDrawing.emotions.slice(0, 4).map((e) => (
              <CircleScore
                key={e.name}
                label={e.name}
                value={e.percentage}
                color={e.color}
              />
            ))}
          </View>
        </GlassCard>

        {/* Emotion Bars */}
        <GlassCard style={styles.barsCard} padding={20}>
          <Text style={styles.sectionTitle}>Detailed Scores</Text>
          {latestDrawing.emotions.map((e, idx) => (
            <EmotionBar
              key={e.name}
              label={e.name}
              percentage={e.percentage}
              color={e.color}
              delay={idx * 150}
            />
          ))}
        </GlassCard>

        {/* AI Summary */}
        <LinearGradient
          colors={["#FDF8F5", "#F5ECF8"]}
          style={styles.summaryCard}
        >
          <View style={styles.summaryHeader}>
            <LinearGradient
              colors={["#C4A8F5", "#F0A8C8"]}
              style={styles.summaryIcon}
            >
              <Ionicons name="sparkles" size={18} color="#fff" />
            </LinearGradient>
            <Text style={styles.summaryTitle}>AI Summary</Text>
          </View>
          <Text style={styles.summaryText}>{latestDrawing.summary}</Text>
        </LinearGradient>

        {/* Behavioral Insights */}
        <GlassCard style={styles.insightsCard} padding={20}>
          <Text style={styles.sectionTitle}>Behavioral Insights</Text>
          <View style={styles.insightsList}>
            {behaviorInsights.map((ins) => (
              <View key={ins.label} style={styles.insightItem}>
                <View style={styles.insightIconWrap}>
                  <Ionicons
                    name={
                      (INSIGHT_ICONS[ins.label] as any) ??
                      "information-circle-outline"
                    }
                    size={18}
                    color="#A78BFA"
                  />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightLabel}>{ins.label}</Text>
                  <Text style={styles.insightValue}>{ins.value}</Text>
                </View>
              </View>
            ))}
            <View style={styles.insightItem}>
              <View style={styles.insightIconWrap}>
                <Ionicons name="color-palette" size={18} color="#A78BFA" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Creativity Level</Text>
                <EmotionBar
                  label=""
                  percentage={latestDrawing.creativityLevel}
                  color="#C4B0FF"
                  delay={500}
                />
              </View>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightIconWrap}>
                <Ionicons name="star" size={18} color="#A78BFA" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Confidence Level</Text>
                <EmotionBar
                  label=""
                  percentage={latestDrawing.confidenceLevel}
                  color="#90BE6D"
                  delay={650}
                />
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Recommendations */}
        <GlassCard style={styles.recsCard} padding={20}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.recsList}>
            {latestDrawing.recommendations.map((rec, idx) => (
              <View key={idx} style={styles.recItem}>
                <LinearGradient
                  colors={["#C4A8F5", "#F0A8C8"]}
                  style={styles.recNum}
                >
                  <Text style={styles.recNumText}>{idx + 1}</Text>
                </LinearGradient>
                <Text style={styles.recText}>{rec}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.viewProfileBtn}
            onPress={() => router.replace({ pathname: "/child-analysis", params: { childId: childId! } })}
            activeOpacity={0.85}
          >
            <Ionicons name="person-outline" size={18} color="#6C4DFF" />
            <Text style={styles.viewProfileText}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => router.replace("/(tabs)")}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={["#C4A8F5", "#F0A8C8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.doneBtn}
            >
              <Ionicons name="home-outline" size={18} color="#fff" />
              <Text style={styles.doneBtnText}>Done</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5EFFE",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4A3070",
    fontFamily: "Inter_700Bold",
  },
  loadingSubtitle: {
    fontSize: 14,
    color: "#A090B8",
    fontFamily: "Inter_400Regular",
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF5F8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#C4A8F5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4A3070",
    fontFamily: "Inter_700Bold",
  },
  noDataText: {
    fontSize: 16,
    color: "#A090B8",
    textAlign: "center",
    marginTop: 40,
    fontFamily: "Inter_400Regular",
  },
  drawingPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  thumbOuter: {
    shadowColor: "#C4A8F5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  thumbInner: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  whaleThumb: {
    width: 72,
    height: 72,
  },
  previewInfo: { gap: 4, flex: 1 },
  savedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  savedBadgeText: {
    fontSize: 11,
    color: "#6C4DFF",
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
  },
  previewChildName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4A3070",
    fontFamily: "Inter_700Bold",
  },
  previewDate: {
    fontSize: 13,
    color: "#A090B8",
    fontFamily: "Inter_400Regular",
  },
  mainEmotionCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 6,
    shadowColor: "#C4A8F5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  mainEmotionLabel: {
    fontSize: 14,
    color: "rgba(74,48,112,0.7)",
    fontFamily: "Inter_500Medium",
  },
  mainEmotionValue: {
    fontSize: 36,
    fontWeight: "800",
    color: "#4A3070",
    fontFamily: "Inter_700Bold",
  },
  mainEmotionConf: {
    fontSize: 14,
    color: "rgba(74,48,112,0.65)",
    fontFamily: "Inter_400Regular",
  },
  circlesCard: {},
  circlesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
  barsCard: {},
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4A3070",
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
  },
  summaryCard: {
    borderRadius: 24,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: "#EAD4F5",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4A3070",
    fontFamily: "Inter_700Bold",
  },
  summaryText: {
    fontSize: 14,
    color: "#4A3B7A",
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
  insightsCard: {},
  insightsList: { gap: 14 },
  insightItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  insightIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F0E8FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  insightContent: { flex: 1, gap: 4 },
  insightLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#A090B8",
    fontFamily: "Inter_600SemiBold",
  },
  insightValue: {
    fontSize: 14,
    color: "#4A3070",
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
  recsCard: {},
  recsList: { gap: 12 },
  recItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  recNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  recNumText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  recText: {
    flex: 1,
    fontSize: 14,
    color: "#4A3070",
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch",
  },
  viewProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#C4B0FF",
    shadowColor: "#C4A8F5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6C4DFF",
    fontFamily: "Inter_700Bold",
  },
  doneBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 30,
    paddingVertical: 16,
    shadowColor: "#C4A8F5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
});
