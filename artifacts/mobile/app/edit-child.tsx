import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";

const AVATAR_COLORS = [
  { color: "#A78BFA", label: "Purple" },
  { color: "#FF6B9D", label: "Pink" },
  { color: "#48CAE4", label: "Blue" },
  { color: "#F8961E", label: "Orange" },
  { color: "#90BE6D", label: "Green" },
  { color: "#F3722C", label: "Coral" },
];

const GENDERS = ["Male", "Female", "Other"];

export default function EditChildScreen() {
  const insets = useSafeAreaInsets();
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const { children, updateChild } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const child = children.find((c) => c.id === childId);

  const [name,           setName]           = useState(child?.name ?? "");
  const [age,            setAge]            = useState(child ? String(child.age) : "");
  const [gender,         setGender]         = useState(child?.gender ?? "Male");
  const [activities,     setActivities]     = useState(child?.favoriteActivities ?? "");
  const [emotionalNotes, setEmotionalNotes] = useState(child?.emotionalNotes ?? "");
  const [parentNotes,    setParentNotes]    = useState(child?.parentNotes ?? "");
  const [selectedColor,  setSelectedColor]  = useState(child?.avatarColor ?? AVATAR_COLORS[0].color);
  const [loading,        setLoading]        = useState(false);

  if (!child) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#4A3070" />
        </TouchableOpacity>
        <Text style={styles.notFound}>Child not found</Text>
      </View>
    );
  }

  async function handleSave() {
    if (!name.trim() || !age.trim()) return;
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateChild(childId!, {
      name: name.trim(),
      age: parseInt(age, 10) || 0,
      gender,
      favoriteActivities: activities,
      emotionalNotes,
      parentNotes,
      avatarColor: selectedColor,
      initials: name.trim().slice(0, 2).toUpperCase(),
    });
    setLoading(false);
    router.back();
  }

  const previewInitials = name ? name.slice(0, 2).toUpperCase() : child.initials;

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}>
      {/* Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#4A3070" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar preview */}
        <View style={styles.avatarWrap}>
          <View style={[styles.avatarCircle, { backgroundColor: selectedColor }]}>
            <View style={styles.avatarShine} />
            <Text style={styles.avatarInitials}>{previewInitials}</Text>
          </View>
          <Text style={styles.avatarLabel}>Choose Color</Text>
          <View style={styles.colorRow}>
            {AVATAR_COLORS.map((ac) => (
              <TouchableOpacity
                key={ac.color}
                onPress={() => setSelectedColor(ac.color)}
                style={[
                  styles.colorDot,
                  { backgroundColor: ac.color },
                  selectedColor === ac.color && styles.colorDotSelected,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Field label="Child Name *" icon="person-outline">
            <TextInput
              style={styles.input}
              placeholder="Enter child's name"
              placeholderTextColor="#A090B8"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </Field>

          <Field label="Age *" icon="calendar-outline">
            <TextInput
              style={styles.input}
              placeholder="Age in years"
              placeholderTextColor="#A090B8"
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
            />
          </Field>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              {GENDERS.map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGender(g)}
                  style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                >
                  <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Field label="Favorite Activities" icon="star-outline">
            <TextInput
              style={styles.input}
              placeholder="e.g. Drawing, Dancing, Reading"
              placeholderTextColor="#A090B8"
              value={activities}
              onChangeText={setActivities}
            />
          </Field>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Emotional Notes</Text>
            <View style={[styles.inputWrap, styles.textareaWrap]}>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Any emotional observations..."
                placeholderTextColor="#A090B8"
                value={emotionalNotes}
                onChangeText={setEmotionalNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Parent Notes</Text>
            <View style={[styles.inputWrap, styles.textareaWrap]}>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Your personal notes about your child..."
                placeholderTextColor="#A090B8"
                value={parentNotes}
                onChangeText={setParentNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={!name.trim() || !age.trim() || loading}
              activeOpacity={0.85}
              style={{ flex: 0.6 }}
            >
              <LinearGradient
                colors={name.trim() && age.trim() ? ["#C4A8F5", "#F0A8C8"] : ["#D8CCE8", "#E8D8F0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveBtn}
              >
                <Text style={styles.saveBtnText}>{loading ? "Saving..." : "Save Changes"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Field({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon as any} size={18} color="#A090B8" style={styles.inputIcon} />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5EFFE" },
  notFound: { fontSize: 16, color: "#A090B8", textAlign: "center", marginTop: 40, fontFamily: "Inter_400Regular" },
  navBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", shadowColor: "#C4A8F5", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
  navTitle: { fontSize: 18, fontWeight: "700", color: "#4A3070", fontFamily: "Inter_700Bold" },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },
  avatarWrap: { alignItems: "center", paddingVertical: 20 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", marginBottom: 12, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 14, elevation: 8 },
  avatarShine: { position: "absolute", width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(255,255,255,0.25)", top: -10, left: -10 },
  avatarInitials: { fontSize: 32, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  avatarLabel: { fontSize: 13, color: "#A090B8", marginBottom: 12, fontFamily: "Inter_500Medium" },
  colorRow: { flexDirection: "row", gap: 12 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotSelected: { borderWidth: 3, borderColor: "#4A3070" },
  form: { gap: 4 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#4A3B7A", marginBottom: 8, fontFamily: "Inter_600SemiBold" },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, paddingHorizontal: 14, height: 52, borderWidth: 1, borderColor: "#EAD4F5", shadowColor: "#C4A8F5", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: "#4A3070", fontFamily: "Inter_400Regular" },
  textareaWrap: { height: "auto", alignItems: "flex-start", paddingVertical: 12 },
  textarea: { minHeight: 72 },
  genderRow: { flexDirection: "row", gap: 10 },
  genderBtn: { flex: 1, height: 44, borderRadius: 12, backgroundColor: "#F0E8FF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#EAD4F5" },
  genderBtnActive: { backgroundColor: "#A78BFA", borderColor: "#A78BFA" },
  genderText: { fontSize: 14, color: "#A090B8", fontFamily: "Inter_600SemiBold", fontWeight: "600" },
  genderTextActive: { color: "#FFFFFF" },
  btnRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelBtn: { flex: 0.4, height: 54, borderRadius: 27, backgroundColor: "#F0E8FF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#EAD4F5" },
  cancelText: { fontSize: 15, color: "#A78BFA", fontFamily: "Inter_600SemiBold", fontWeight: "600" },
  saveBtn: { height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", shadowColor: "#C4A8F5", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 12, elevation: 8 },
  saveBtnText: { fontSize: 15, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
});
