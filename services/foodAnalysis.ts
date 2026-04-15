// Powered by OnSpace.AI
import { MOCK_FOOD_DATABASE, SCAN_KEYWORDS } from '@/constants/config';
import { GOALS } from '@/constants/config';

export interface FoodAnalysis {
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  portionSize: string;
  score: number;
  verdict: 'excellent' | 'good' | 'moderate' | 'bad';
  verdictText: string;
  verdictEmoji: string;
  alternatives: string[];
  goalAdvice: string;
}

export function detectFoodFromText(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [keyword, foodKey] of Object.entries(SCAN_KEYWORDS)) {
    if (lower.includes(keyword)) return foodKey;
  }
  return null;
}

export function getRandomFood(): string {
  const keys = Object.keys(MOCK_FOOD_DATABASE);
  return keys[Math.floor(Math.random() * keys.length)];
}

export function analyzeFoodForProfile(foodKey: string, goalId: string, age: number): FoodAnalysis {
  const food = MOCK_FOOD_DATABASE[foodKey] || MOCK_FOOD_DATABASE['salad'];
  const goal = GOALS.find(g => g.id === goalId) || GOALS[0];
  const rawScore = food.scores[goalId] || 5;

  let ageBonus = 0;
  if (age > 40 && goalId === 'belly_fat') ageBonus = -1;
  if (age > 50 && goalId === 'weight_loss') ageBonus = -0.5;
  if (age < 25 && goalId === 'muscle_gain') ageBonus = 0.5;

  const score = Math.min(10, Math.max(1, rawScore + ageBonus));

  let verdict: FoodAnalysis['verdict'];
  let verdictText: string;
  let verdictEmoji: string;

  if (score >= 8) {
    verdict = 'excellent';
    verdictText = 'Εξαιρετική επιλογή!';
    verdictEmoji = '✅';
  } else if (score >= 6) {
    verdict = 'good';
    verdictText = 'Καλή επιλογή';
    verdictEmoji = '👍';
  } else if (score >= 4) {
    verdict = 'moderate';
    verdictText = 'Μέτρια επιλογή';
    verdictEmoji = '⚠️';
  } else {
    verdict = 'bad';
    verdictText = 'Αποφύγετε το!';
    verdictEmoji = '❌';
  }

  const goalAdvice = buildGoalAdvice(goalId, score, food, age);

  return {
    name: food.name,
    emoji: food.emoji,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    fiber: food.fiber,
    sugar: food.sugar,
    portionSize: food.portionSize,
    score: Math.round(score),
    verdict,
    verdictText,
    verdictEmoji,
    alternatives: food.alternatives,
    goalAdvice,
  };
}

function buildGoalAdvice(goalId: string, score: number, food: any, age: number): string {
  const ageNote = age > 45 ? ' Για την ηλικία σου, ' : '';

  if (goalId === 'belly_fat') {
    if (score >= 7) return `${ageNote}Αυτό το φαγητό υποστηρίζει την καύση κοιλιακού λίπους χάρη στα χαμηλά λιπαρά του.`;
    if (score >= 5) return `${ageNote}Καταναλώστε με μέτρο. Προτιμήστε μικρότερη μερίδα.`;
    return `${ageNote}Αποφύγετε - υψηλές θερμίδες που δυσκολεύουν την καύση κοιλιακού λίπους.`;
  }
  if (goalId === 'muscle_gain') {
    if (food.protein > 20) return `Εξαιρετική πηγή πρωτεΐνης (${food.protein}g) για μυϊκή ανάπτυξη!`;
    if (food.protein > 10) return `Καλή πρωτεΐνη (${food.protein}g). Συνδύαστε με άλλη πηγή πρωτεΐνης.`;
    return `Χαμηλή πρωτεΐνη (${food.protein}g). Προσθέστε πρωτεΐνη στο γεύμα σας.`;
  }
  if (goalId === 'weight_loss') {
    if (food.calories < 150) return `Χαμηλές θερμίδες (${food.calories} kcal) - ιδανικό για απώλεια βάρους!`;
    if (food.calories < 300) return `Μέτριες θερμίδες (${food.calories} kcal). Κατάλληλο αν φάτε λιγότερο αργότερα.`;
    return `Υψηλές θερμίδες (${food.calories} kcal). Μειώστε τη μερίδα ή επιλέξτε εναλλακτικό.`;
  }
  if (score >= 7) return 'Εξαιρετική επιλογή για ισορροπημένη διατροφή και ευεξία!';
  if (score >= 5) return 'Αποδεκτή επιλογή. Εντάξτε το με μέτρο στη διατροφή σας.';
  return 'Καταναλώστε σπάνια. Επιλέξτε πιο θρεπτικές εναλλακτικές.';
}
