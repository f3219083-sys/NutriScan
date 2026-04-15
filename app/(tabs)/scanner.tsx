// Powered by OnSpace.AI
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';
import { getRandomFood, analyzeFoodForProfile } from '@/services/foodAnalysis';
import { MEAL_TYPES } from '@/constants/config';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';

const { width, height } = Dimensions.get('window');
const SCAN_SIZE = width * 0.72;

export default function ScannerScreen() {
  const router = useRouter();
  const { profile, addFoodEntry } = useProfile();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [showMealPicker, setShowMealPicker] = useState(false);
  const [scannedFoodKey, setScannedFoodKey] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const cameraRef = useRef<any>(null);

  const handleScan = async () => {
    if (scanning) return;
    setScanning(true);
    setShowMealPicker(false);

    await new Promise(r => setTimeout(r, 2200));

    const foodKey = getRandomFood();
    const result = analyzeFoodForProfile(
      foodKey,
      profile?.goal || 'healthy_eating',
      profile?.age || 25
    );

    setScannedFoodKey(foodKey);
    setAnalysis(result);
    setScanning(false);
    setShowMealPicker(true);
  };

  const handleMealSelect = async (mealTypeId: string) => {
    if (!scannedFoodKey) return;
    const today = new Date();
    await addFoodEntry({
      id: Date.now().toString(),
      foodKey: scannedFoodKey,
      mealType: mealTypeId,
      timestamp: Date.now(),
      date: today.toDateString(),
    });
    router.push({
      pathname: '/analysis',
      params: {
        foodKey: scannedFoodKey,
        mealType: mealTypeId,
      },
    });
    setShowMealPicker(false);
    setAnalysis(null);
    setScannedFoodKey(null);
  };

  if (!permission) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.permissionContainer}>
          <MaterialIcons name="camera-alt" size={80} color={Colors.primary} />
          <Text style={styles.permissionTitle}>Χρειάζεται Πρόσβαση Κάμερας</Text>
          <Text style={styles.permissionDesc}>
            Για να σκανάρεις φαγητά και να λάβεις εξατομικευμένες συστάσεις, χρειαζόμαστε πρόσβαση στην κάμερά σου.
          </Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Επιτρέπω την Κάμερα</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
      />

      {/* Dark overlay with cutout hint */}
      <View style={styles.overlay}>
        <SafeAreaView style={styles.overlayInner} edges={['top']}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <Text style={styles.topBarTitle}>📸 NutriScan AI</Text>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>{profile?.name?.charAt(0) || 'U'}</Text>
            </View>
          </View>

          <Text style={styles.scanInstruction}>
            Στρέψε την κάμερα σε ένα φαγητό και πάτα το κουμπί
          </Text>

          {/* Scan frame */}
          <View style={styles.scanFrameWrapper}>
            <View style={styles.scanFrame}>
              {/* Corner accents */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />

              {scanning && (
                <View style={styles.scanningOverlay}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text style={styles.scanningText}>Αναλύω...</Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick result preview */}
          {analysis && !showMealPicker && (
            <View style={styles.quickResult}>
              <Text style={styles.quickResultEmoji}>{analysis.emoji}</Text>
              <View style={styles.quickResultInfo}>
                <Text style={styles.quickResultName}>{analysis.name}</Text>
                <Text style={styles.quickResultCalories}>{analysis.calories} kcal</Text>
              </View>
              <View style={[styles.scoreBadge, {
                backgroundColor: analysis.score >= 7 ? Colors.success + '33' :
                  analysis.score >= 5 ? Colors.warning + '33' : Colors.danger + '33'
              }]}>
                <Text style={[styles.scoreText, {
                  color: analysis.score >= 7 ? Colors.success :
                    analysis.score >= 5 ? Colors.warning : Colors.danger
                }]}>{analysis.score}/10</Text>
              </View>
            </View>
          )}

          {/* Meal type picker */}
          {showMealPicker && (
            <View style={styles.mealPicker}>
              <Text style={styles.mealPickerTitle}>
                {analysis?.verdictEmoji} {analysis?.verdictText} — Καταχώρησε ως:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mealPickerScroll}
              >
                {MEAL_TYPES.map((meal) => (
                  <TouchableOpacity
                    key={meal.id}
                    style={styles.mealChip}
                    onPress={() => handleMealSelect(meal.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.mealChipEmoji}>{meal.emoji}</Text>
                    <Text style={styles.mealChipLabel}>{meal.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Scan button */}
          <View style={styles.scanButtonArea}>
            <TouchableOpacity
              style={[styles.scanButton, scanning && styles.scanButtonDisabled]}
              onPress={handleScan}
              disabled={scanning}
              activeOpacity={0.85}
            >
              {scanning ? (
                <ActivityIndicator color={Colors.background} size="small" />
              ) : (
                <MaterialIcons name="qr-code-scanner" size={32} color={Colors.background} />
              )}
            </TouchableOpacity>
            <Text style={styles.scanButtonLabel}>
              {scanning ? 'Αναλύεται...' : 'Σκανάρισε Φαγητό'}
            </Text>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  overlayInner: {
    flex: 1,
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  topBarTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  profileBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBadgeText: {
    color: Colors.background,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.md,
  },
  scanInstruction: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  scanFrameWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    borderRadius: Radius.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: Radius.md,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: Radius.md,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: Radius.md,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: Radius.md,
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,217,126,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  scanningText: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.lg,
  },
  quickResult: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    width: width - Spacing.md * 2,
  },
  quickResultEmoji: {
    fontSize: 32,
  },
  quickResultInfo: {
    flex: 1,
  },
  quickResultName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  quickResultCalories: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  scoreBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  scoreText: {
    fontWeight: FontWeight.bold,
    fontSize: FontSize.sm,
  },
  mealPicker: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    width: width - Spacing.md * 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealPickerTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  mealPickerScroll: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  mealChip: {
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
    gap: 4,
    minWidth: 80,
  },
  mealChipEmoji: {
    fontSize: 20,
  },
  mealChipLabel: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  scanButtonArea: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  scanButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  scanButtonDisabled: {
    backgroundColor: Colors.primaryDark,
    opacity: 0.7,
  },
  scanButtonLabel: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.sm,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  permissionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  permissionDesc: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  permissionBtnText: {
    color: Colors.background,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.md,
  },
});
