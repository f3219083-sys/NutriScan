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
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useProfile } from '@/hooks/useProfile';
import { GOALS, MEAL_TYPES } from '@/constants/config';
import { MOCK_FOOD_DATABASE } from '@/constants/config';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { profile, foodHistory } = useProfile();

  const goal = GOALS.find(g => g.id === profile?.goal) || GOALS[3];
  const today = new Date().toDateString();
  const todayEntries = foodHistory.filter(e => e.date === today);

  const totalCaloriesToday = todayEntries.reduce((sum, entry) => {
    const food = MOCK_FOOD_DATABASE[entry.foodKey];
    return sum + (food?.calories || 0);
  }, 0);

  const caloriesPercent = Math.min(100, (totalCaloriesToday / goal.dailyCalories) * 100);

  const mealCounts = MEAL_TYPES.reduce((acc, m) => {
    acc[m.id] = todayEntries.filter(e => e.mealType === m.id).length;
    return acc;
  }, {} as Record<string, number>);

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? 'Καλημέρα' : greetingHour < 17 ? 'Καλό απόγευμα' : 'Καλησπέρα';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>{profile?.name || 'Χρήστης'} 👋</Text>
          </View>
          <View style={styles.goalBadge}>
            <Text style={styles.goalEmoji}>{goal.icon}</Text>
          </View>
        </View>

        {/* Daily Calories Card */}
        <View style={styles.caloriesCard}>
          <View style={styles.caloriesHeader}>
            <Text style={styles.caloriesLabel}>Θερμίδες Σήμερα</Text>
            <Text style={styles.caloriesGoal}>Στόχος: {goal.dailyCalories} kcal</Text>
          </View>
          <View style={styles.caloriesRow}>
            <Text style={styles.caloriesValue}>{totalCaloriesToday}</Text>
            <Text style={styles.caloriesUnit}> kcal</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${caloriesPercent}%` as any,
              backgroundColor: caloriesPercent > 90 ? Colors.danger : Colors.primary }]} />
          </View>
          <Text style={styles.caloriesRemaining}>
            {Math.max(0, goal.dailyCalories - totalCaloriesToday)} kcal υπόλοιπο
          </Text>
        </View>

        {/* Meal Tracker */}
        <Text style={styles.sectionTitle}>Γεύματα Σήμερα</Text>
        <View style={styles.mealsGrid}>
          {MEAL_TYPES.map((meal) => (
            <TouchableOpacity
              key={meal.id}
              style={styles.mealCard}
              onPress={() => router.push('/(tabs)/scanner')}
              activeOpacity={0.8}
            >
              <Text style={styles.mealEmoji}>{meal.emoji}</Text>
              <Text style={styles.mealLabel}>{meal.label}</Text>
              <Text style={styles.mealCount}>
                {mealCounts[meal.id] > 0 ? `${mealCounts[meal.id]} εγγραφές` : 'Κενό'}
              </Text>
              {mealCounts[meal.id] === 0 && (
                <View style={styles.addBadge}>
                  <MaterialIcons name="add" size={14} color={Colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Goal Info */}
        <View style={styles.goalCard}>
          <Text style={styles.sectionTitle}>Ο Στόχος Σου</Text>
          <View style={styles.goalContent}>
            <Text style={styles.goalBigEmoji}>{goal.icon}</Text>
            <View style={styles.goalInfo}>
              <Text style={styles.goalName}>{goal.label}</Text>
              <Text style={styles.goalDesc}>{goal.description}</Text>
              <Text style={styles.goalAge}>Ηλικία: {profile?.age} ετών</Text>
            </View>
          </View>
          <View style={styles.macrosRow}>
            {[
              { label: 'Πρωτεΐνη', value: goal.macros.protein, color: Colors.info },
              { label: 'Υδατάνθρακες', value: goal.macros.carbs, color: Colors.accent },
              { label: 'Λιπαρά', value: goal.macros.fat, color: Colors.warning },
            ].map((m) => (
              <View key={m.label} style={styles.macroItem}>
                <Text style={[styles.macroValue, { color: m.color }]}>{m.value}%</Text>
                <Text style={styles.macroLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Scan CTA */}
        <TouchableOpacity
          style={styles.scanCTA}
          onPress={() => router.push('/(tabs)/scanner')}
          activeOpacity={0.85}
        >
          <MaterialIcons name="qr-code-scanner" size={28} color={Colors.background} />
          <Text style={styles.scanCTAText}>Σκανάρισε Φαγητό Τώρα</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing.xxl }} />
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  userName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  goalBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalEmoji: {
    fontSize: 24,
  },
  caloriesCard: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  caloriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  caloriesLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  caloriesGoal: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
  caloriesValue: {
    fontSize: 48,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  caloriesUnit: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  caloriesRemaining: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  mealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  mealCard: {
    width: (width - Spacing.md * 2 - Spacing.sm) / 2,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  mealEmoji: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  mealLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  mealCount: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  addBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCard: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  goalBigEmoji: {
    fontSize: 40,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  goalDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  goalAge: {
    fontSize: FontSize.xs,
    color: Colors.accent,
    marginTop: 4,
    fontWeight: FontWeight.medium,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  macroLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scanCTA: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  scanCTAText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.background,
  },
});
