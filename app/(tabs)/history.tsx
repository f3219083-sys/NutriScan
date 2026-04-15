// Powered by OnSpace.AI
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useProfile } from '@/hooks/useProfile';
import { useAlert } from '@/template';
import { MOCK_FOOD_DATABASE, MEAL_TYPES } from '@/constants/config';
import { GOALS } from '@/constants/config';
import { analyzeFoodForProfile } from '@/services/foodAnalysis';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { FoodEntry } from '@/contexts/ProfileContext';

export default function HistoryScreen() {
  const { foodHistory, clearHistory, profile } = useProfile();
  const { showAlert } = useAlert();
  const [filter, setFilter] = useState('all');

  const goal = GOALS.find(g => g.id === profile?.goal) || GOALS[3];

  const today = new Date().toDateString();
  const todayEntries = foodHistory.filter(e => e.date === today);
  const olderEntries = foodHistory.filter(e => e.date !== today);

  const filteredToday = filter === 'all'
    ? todayEntries
    : todayEntries.filter(e => e.mealType === filter);

  const totalCaloriesToday = todayEntries.reduce((sum, e) => {
    return sum + (MOCK_FOOD_DATABASE[e.foodKey]?.calories || 0);
  }, 0);

  const handleClear = () => {
    showAlert(
      'Διαγραφή Ιστορικού',
      'Θέλεις σίγουρα να διαγράψεις όλο το ιστορικό γευμάτων;',
      [
        { text: 'Άκυρο', style: 'cancel' },
        { text: 'Διαγραφή', style: 'destructive', onPress: clearHistory },
      ]
    );
  };

  const renderEntry = ({ item }: { item: FoodEntry }) => {
    const food = MOCK_FOOD_DATABASE[item.foodKey];
    if (!food) return null;
    const meal = MEAL_TYPES.find(m => m.id === item.mealType);
    const analysis = analyzeFoodForProfile(item.foodKey, profile?.goal || 'healthy_eating', profile?.age || 25);
    const timeStr = new Date(item.timestamp).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });

    const scoreColor = analysis.score >= 7 ? Colors.success : analysis.score >= 5 ? Colors.warning : Colors.danger;

    return (
      <View style={styles.entryCard}>
        <View style={styles.entryLeft}>
          <Text style={styles.entryEmoji}>{food.emoji}</Text>
        </View>
        <View style={styles.entryMiddle}>
          <Text style={styles.entryName}>{food.name}</Text>
          <View style={styles.entryMeta}>
            <Text style={styles.entryMeal}>{meal?.emoji} {meal?.label}</Text>
            <Text style={styles.entryTime}>{timeStr}</Text>
          </View>
          <Text style={styles.entryCalories}>{food.calories} kcal</Text>
        </View>
        <View style={[styles.entryScore, { backgroundColor: scoreColor + '22' }]}>
          <Text style={[styles.entryScoreText, { color: scoreColor }]}>
            {analysis.score}/10
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Ιστορικό</Text>
          <Text style={styles.headerSub}>Γεύματα & αναλύσεις</Text>
        </View>
        {foodHistory.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
            <MaterialIcons name="delete-outline" size={20} color={Colors.danger} />
          </TouchableOpacity>
        )}
      </View>

      {/* Today Summary */}
      {todayEntries.length > 0 && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Σήμερα</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalCaloriesToday}</Text>
              <Text style={styles.summaryLabel}>kcal</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{todayEntries.length}</Text>
              <Text style={styles.summaryLabel}>γεύματα</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{goal.dailyCalories - totalCaloriesToday}</Text>
              <Text style={styles.summaryLabel}>υπόλοιπο</Text>
            </View>
          </View>
        </View>
      )}

      {/* Filter bar */}
      {todayEntries.length > 0 && (
        <View style={styles.filterBar}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: 'all', label: 'Όλα', emoji: '📋' }, ...MEAL_TYPES]}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.filterContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.filterChip, filter === item.id && styles.filterChipActive]}
                onPress={() => setFilter(item.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.filterEmoji}>{item.emoji}</Text>
                <Text style={[styles.filterLabel, filter === item.id && styles.filterLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {foodHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyTitle}>Καμία Εγγραφή Ακόμα</Text>
          <Text style={styles.emptyDesc}>
            Σκανάρισε τα φαγητά σου για να δεις την ιστορία γευμάτων σου εδώ
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredToday}
          keyExtractor={item => item.id}
          renderItem={renderEntry}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            olderEntries.length > 0 ? (
              <View>
                <Text style={styles.olderLabel}>Παλαιότερα</Text>
                {olderEntries.slice(0, 10).map(e => (
                  <View key={e.id}>
                    {renderEntry({ item: e })}
                  </View>
                ))}
              </View>
            ) : null
          }
          ListEmptyComponent={
            filter !== 'all' ? (
              <View style={styles.emptyFilter}>
                <Text style={styles.emptyFilterText}>
                  Δεν υπάρχουν εγγραφές για αυτό το γεύμα σήμερα
                </Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  clearBtn: {
    padding: Spacing.sm,
    backgroundColor: Colors.danger + '22',
    borderRadius: Radius.sm,
    marginTop: 4,
  },
  summaryCard: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  summaryTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  filterBar: {
    minHeight: 52,
    marginBottom: Spacing.sm,
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  filterEmoji: {
    fontSize: 14,
  },
  filterLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  filterLabelActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  entryLeft: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryEmoji: {
    fontSize: 24,
  },
  entryMiddle: {
    flex: 1,
  },
  entryName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  entryMeta: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 2,
  },
  entryMeal: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  entryTime: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  entryCalories: {
    fontSize: FontSize.sm,
    color: Colors.accent,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
  entryScore: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  entryScoreText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  emptyEmoji: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  olderLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  emptyFilter: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyFilterText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
