// Powered by OnSpace.AI
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '@/hooks/useProfile';
import { GOALS } from '@/constants/config';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const { setProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');

  const steps = ['Καλωσόρισες', 'Το Προφίλ Σου', 'Ο Στόχος Σου'];

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
    else handleFinish();
  };

  const handleFinish = async () => {
    await setProfile({
      name: name || 'Χρήστης',
      age: parseInt(age) || 25,
      goal: selectedGoal || 'healthy_eating',
      onboardingComplete: true,
    });
    router.replace('/(tabs)');
  };

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0 && parseInt(age) >= 10 && parseInt(age) <= 100;
    if (step === 2) return selectedGoal !== '';
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Progress */}
        <View style={styles.progressRow}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[styles.progressDot, i <= step && styles.progressDotActive]}
            />
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {step === 0 && (
            <View style={styles.stepContainer}>
              <Image
                source={require('@/assets/images/onboarding-hero.png')}
                style={styles.heroImage}
                contentFit="cover"
                transition={400}
              />
              <Text style={styles.heroTitle}>NutriScan AI</Text>
              <Text style={styles.heroSubtitle}>
                Σκανάρισε φαγητά με την κάμερά σου και μάθε αν ταιριάζουν στους στόχους σου
              </Text>
              <View style={styles.featureList}>
                {[
                  { emoji: '📸', text: 'Σκανάρισε οποιοδήποτε φαγητό' },
                  { emoji: '🎯', text: 'Εξατομικευμένες συστάσεις' },
                  { emoji: '📊', text: 'Αναλυτικά θρεπτικά στοιχεία' },
                  { emoji: '📅', text: 'Ημερήσιο tracking γευμάτων' },
                ].map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Text style={styles.featureEmoji}>{f.emoji}</Text>
                    <Text style={styles.featureText}>{f.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Πες μου για σένα</Text>
              <Text style={styles.stepSubtitle}>
                Θα χρησιμοποιήσω αυτές τις πληροφορίες για εξατομικευμένες συστάσεις
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Όνομα</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="π.χ. Γιώργης"
                  placeholderTextColor={Colors.textMuted}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ηλικία</Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  placeholder="π.χ. 32"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={3}
                />
                {parseInt(age) > 40 && (
                  <Text style={styles.ageNote}>
                    💡 Για άτομα {">"}40, η ανάλυσή μας λαμβάνει υπόψη τον μεταβολισμό ηλικίας
                  </Text>
                )}
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Ποιος είναι ο στόχος σου;</Text>
              <Text style={styles.stepSubtitle}>
                Επίλεξε τον κύριο στόχο για εξατομικευμένη ανάλυση φαγητών
              </Text>
              {GOALS.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalCard,
                    selectedGoal === goal.id && styles.goalCardSelected,
                  ]}
                  onPress={() => setSelectedGoal(goal.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.goalEmoji}>{goal.icon}</Text>
                  <View style={styles.goalInfo}>
                    <Text style={[styles.goalLabel, selectedGoal === goal.id && styles.goalLabelSelected]}>
                      {goal.label}
                    </Text>
                    <Text style={styles.goalDesc}>{goal.description}</Text>
                    <Text style={styles.goalCalories}>{goal.dailyCalories} kcal/ημέρα</Text>
                  </View>
                  <View style={[styles.goalCheck, selectedGoal === goal.id && styles.goalCheckSelected]}>
                    {selectedGoal === goal.id && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {step > 0 && (
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
              <Text style={styles.backBtnText}>← Πίσω</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!canProceed()}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>
              {step === 2 ? 'Ξεκίνα!' : 'Συνέχεια →'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
  },
  stepContainer: {
    paddingBottom: Spacing.xxl,
  },
  heroImage: {
    width: width - Spacing.md * 2,
    height: (width - Spacing.md * 2) * 1.1,
    borderRadius: Radius.xl,
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  heroTitle: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  featureList: {
    gap: Spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  stepTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  stepSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  ageNote: {
    fontSize: FontSize.sm,
    color: Colors.accent,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  goalCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  goalEmoji: {
    fontSize: 32,
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  goalLabelSelected: {
    color: Colors.primary,
  },
  goalDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  goalCalories: {
    fontSize: FontSize.xs,
    color: Colors.accent,
    fontWeight: FontWeight.medium,
  },
  goalCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCheckSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: FontWeight.bold,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  backBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
  },
  backBtnText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  nextBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: Colors.border,
  },
  nextBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.background,
  },
});
