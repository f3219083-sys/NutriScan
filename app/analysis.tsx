// Powered by OnSpace.AI
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useProfile } from '@/hooks/useProfile';
import { analyzeFoodForProfile } from '@/services/foodAnalysis';
import { MEAL_TYPES } from '@/constants/config';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function AnalysisScreen() {
  const router = useRouter();
  const { foodKey, mealType } = useLocalSearchParams<{ foodKey: string; mealType: string }>();
  const { profile } = useProfile();

  const analysis = analyzeFoodForProfile(
    foodKey || 'salad',
    profile?.goal || 'healthy_eating',
    profile?.age || 25
  );

  const meal = MEAL_TYPES.find(m => m.id === mealType);

  const scoreColor =
    analysis.score >= 8 ? Colors.success :
    analysis.score >= 6 ? Colors.success :
    analysis.score >= 4 ? Colors.warning :
    Colors.danger;

  const scoreBarWidth = (analysis.score / 10) * 100;

  const macros = [
    { label: 'Πρωτεΐνη', value: analysis.protein, unit: 'g', color: Colors.info, icon: '💪' },
    { label: 'Υδατάνθρακες', value: analysis.carbs, unit: 'g', color: Colors.accent, icon: '🌾' },
    { label: 'Λιπαρά', value: analysis.fat, unit: 'g', color: Colors.warning, icon: '🧈' },
    { label: 'Φυτικές Ίνες', value: analysis.fiber, unit: 'g', color: Colors.primary, icon: '🥦' },
    { label: 'Σάκχαρα', value: analysis.sugar, unit: 'g', color: Colors.danger, icon: '🍯' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ανάλυση Φαγητού</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Food Hero */}
        <View style={styles.foodHero}>
          <Text style={styles.foodEmoji}>{analysis.emoji}</Text>
          <Text style={styles.foodName}>{analysis.name}</Text>
          <Text style={styles.portionSize}>{analysis.portionSize}</Text>
          {meal && (
            <View style={styles.mealTag}>
              <Text style={styles.mealTagEmoji}>{meal.emoji}</Text>
              <Text style={styles.mealTagText}>{meal.label}</Text>
            </View>
          )}
        </View>

        {/* Score Card */}
        <View style={[styles.scoreCard, { borderColor: scoreColor + '66' }]}>
          <View style={styles.scoreTop}>
            <View>
              <Text style={styles.scoreLabel}>Βαθμολογία για τον στόχο σου</Text>
              <Text style={styles.verdictText}>
                {analysis.verdictEmoji} {analysis.verdictText}
              </Text>
            </View>
            <View style={[styles.scoreBig, { backgroundColor: scoreColor + '22' }]}>
              <Text style={[styles.scoreBigNum, { color: scoreColor }]}>{analysis.score}</Text>
              <Text style={[styles.scoreBigDenom, { color: scoreColor }]}>/10</Text>
            </View>
          </View>
          <View style={styles.scoreBarBg}>
            <View style={[styles.scoreBarFill, { width: `${scoreBarWidth}%` as any, backgroundColor: scoreColor }]} />
          </View>
          <Text style={styles.goalAdvice}>{analysis.goalAdvice}</Text>
        </View>

        {/* Calories */}
        <View style={styles.caloriesCard}>
          <Text style={styles.caloriesNum}>{analysis.calories}</Text>
          <Text style={styles.caloriesLabel}>θερμίδες (kcal)</Text>
        </View>

        {/* Macros */}
        <Text style={styles.sectionTitle}>Θρεπτικά Στοιχεία</Text>
        <View style={styles.macrosGrid}>
          {macros.map((m) => (
            <View key={m.label} style={styles.macroCard}>
              <Text style={styles.macroIcon}>{m.icon}</Text>
              <Text style={[styles.macroValue, { color: m.color }]}>
                {m.value}{m.unit}
              </Text>
              <Text style={styles.macroLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* Alternatives */}
        {analysis.alternatives.length > 0 && (
          <View style={styles.alternativesCard}>
            <View style={styles.altHeader}>
              <MaterialIcons name="swap-horiz" size={20} color={Colors.accent} />
              <Text style={styles.altTitle}>Εναλλακτικές Προτάσεις</Text>
            </View>
            <Text style={styles.altSubtitle}>
              Καλύτερες επιλογές για τον στόχο σου:
            </Text>
            {analysis.alternatives.map((alt, i) => (
              <View key={i} style={styles.altRow}>
                <View style={styles.altDot} />
                <Text style={styles.altText}>{alt}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Scan Again */}
        <TouchableOpacity
          style={styles.scanAgainBtn}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <MaterialIcons name="qr-code-scanner" size={20} color={Colors.background} />
          <Text style={styles.scanAgainText}>Σκανάρισε Άλλο Φαγητό</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  scroll: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  foodHero: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  foodEmoji: {
    fontSize: 80,
    marginBottom: Spacing.sm,
  },
  foodName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  portionSize: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  mealTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealTagEmoji: {
    fontSize: 16,
  },
  mealTagText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  scoreCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
  },
  scoreTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  scoreLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  verdictText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  scoreBig: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  scoreBigNum: {
    fontSize: 36,
    fontWeight: FontWeight.bold,
  },
  scoreBigDenom: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  scoreBarBg: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalAdvice: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  caloriesCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  caloriesNum: {
    fontSize: 56,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  caloriesLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  macroCard: {
    width: (width - Spacing.md * 2 - Spacing.sm * 2) / 3,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  macroIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  macroValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  macroLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  alternativesCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  altHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  altTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  altSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  altRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  altDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  altText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    flex: 1,
  },
  scanAgainBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  scanAgainText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.background,
  },
});
