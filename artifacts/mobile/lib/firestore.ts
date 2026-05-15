import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Drawing } from "@/context/AppContext";

/**
 * Save a drawing + its full analysis under users/{userId}/drawings/{drawingId}.
 * Safe to call multiple times — setDoc overwrites on conflict.
 */
export async function saveDrawingToFirestore(
  userId: string,
  drawing: Drawing
): Promise<void> {
  const ref = doc(db, "users", userId, "drawings", drawing.id);
  await setDoc(ref, {
    id: drawing.id,
    childId: drawing.childId,
    date: drawing.date,
    pathsJson: drawing.pathsJson,
    imageUri: drawing.imageUri ?? null,
    mainEmotion: drawing.mainEmotion,
    confidence: drawing.confidence,
    emotions: drawing.emotions,
    summary: drawing.summary,
    emotionalState: drawing.emotionalState,
    socialIndicators: drawing.socialIndicators,
    stressSignals: drawing.stressSignals,
    creativityLevel: drawing.creativityLevel,
    confidenceLevel: drawing.confidenceLevel,
    recommendations: drawing.recommendations,
    userId,
    createdAt: serverTimestamp(),
  });
}

/**
 * Load all drawings for a parent user, sorted newest-first.
 */
export async function loadDrawingsFromFirestore(
  userId: string
): Promise<Drawing[]> {
  const q = query(
    collection(db, "users", userId, "drawings"),
    orderBy("date", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      childId: data.childId ?? "",
      date: data.date ?? "",
      pathsJson: data.pathsJson ?? "[]",
      imageUri: data.imageUri ?? undefined,
      mainEmotion: data.mainEmotion ?? "Happy",
      confidence: data.confidence ?? 0,
      emotions: data.emotions ?? [],
      summary: data.summary ?? "",
      emotionalState: data.emotionalState ?? "",
      socialIndicators: data.socialIndicators ?? "",
      stressSignals: data.stressSignals ?? "",
      creativityLevel: data.creativityLevel ?? 0,
      confidenceLevel: data.confidenceLevel ?? 0,
      recommendations: data.recommendations ?? [],
    } as Drawing;
  });
}
