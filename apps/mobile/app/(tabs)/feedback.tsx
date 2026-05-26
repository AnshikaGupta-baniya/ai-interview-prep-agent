import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';

import { useThemeStore } from '../../store/useThemeStore';
import { useSessionStore } from '../../store/useSessionStore';
import { Colors } from '../../constants/theme';

const STAR_DIMS = [
  { key: 'situation', label: 'Situation', desc: 'Context setting' },
  { key: 'task', label: 'Task', desc: 'Your responsibility' },
  { key: 'action', label: 'Action', desc: 'Steps you took' },
  { key: 'result', label: 'Result', desc: 'Outcome achieved' },
  { key: 'relevance', label: 'Relevance', desc: 'Role fit' },
] as const;

function ScoreBar({ score, delay, isDark }: { score: number; delay: number; isDark: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: score / 5,
      duration: 800,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [score]);

  const barColor =
    score >= 4 ? Colors.terra.DEFAULT :
    score === 3 ? Colors.indigo.DEFAULT :
    Colors.indigo.light;

  return (
    <View style={[barStyles.bg, { backgroundColor: isDark ? Colors.dark.border : Colors.light.border }]}>
      <Animated.View
        style={[
          barStyles.fill,
          {
            backgroundColor: barColor,
            width: anim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const barStyles = StyleSheet.create({
  bg: { height: 6, borderRadius: 3, overflow: 'hidden', flex: 1 },
  fill: { height: '100%', borderRadius: 3 },
});

export default function FeedbackScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();

  const {
    currentEvaluation,
    currentQuestion,
    questionNumber,
    totalQuestions,
    nextQuestion,
    resetSession,
    targetRole,
    seniority,
  } = useSessionStore();

  const isDark = theme === 'dark';
  const c = isDark ? Colors.dark : Colors.light;
  const [showIdeal, setShowIdeal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentEvaluation) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      Animated.timing(scoreAnim, {
        toValue: currentEvaluation.overall_score,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [currentEvaluation]);

  const handleNextQuestion = () => {
    nextQuestion();
    router.replace('/(tabs)/session');
  };

  const handleEndSession = () => {
    resetSession();
    router.replace('/(tabs)');
  };

  if (!currentEvaluation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={[styles.emptyTitle, { color: c.text }]}>No feedback yet</Text>
          <Text style={[styles.emptySub, { color: c.text2 }]}>
            Complete a session to see your STAR breakdown here.
          </Text>
          <TouchableOpacity
            style={[styles.homeBtn, { backgroundColor: Colors.indigo.DEFAULT }]}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.homeBtnText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const {
    scores,
    overall_score,
    strengths,
    gaps,
    coaching_tip,
    ideal_answer,
  } = currentEvaluation;

  const isLastQuestion = questionNumber >= totalQuestions;

  const scoreLabel =
    overall_score >= 4.5 ? 'Excellent' :
    overall_score >= 3.5 ? 'Strong answer' :
    overall_score >= 2.5 ? 'Good effort' :
    'Needs work';

  const scoreLabelColor =
    overall_score >= 4.5 ? '#2ECC9A' :
    overall_score >= 3.5 ? Colors.terra.DEFAULT :
    overall_score >= 2.5 ? Colors.indigo.DEFAULT :
    Colors.indigo.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: c.text }]}>Feedback</Text>
          <Text style={[styles.headerSub, { color: c.text3 }]}>
            Question {questionNumber} of {totalQuestions} · {seniority} {targetRole}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleEndSession}
          style={[styles.closeBtn, { backgroundColor: c.surf2 }]}
        >
          <Ionicons name="close" size={18} color={c.text2} />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.scoreCard, { backgroundColor: c.surf, borderColor: c.border }]}>
          <View style={styles.scoreTop}>
            <View>
              <Animated.Text style={styles.bigScore}>
                {scoreAnim.interpolate({
                  inputRange: [0, overall_score],
                  outputRange: ['0.0', overall_score.toFixed(1)],
                })}
              </Animated.Text>

              <Text style={[styles.scoreOutOf, { color: c.text3 }]}>out of 5.0</Text>
            </View>

            <View
              style={[
                styles.scoreBadge,
                {
                  backgroundColor: isDark ? '#1A2820' : '#E8F5EE',
                  borderColor: scoreLabelColor,
                },
              ]}
            >
              <Text style={[styles.scoreBadgeText, { color: scoreLabelColor }]}>
                {scoreLabel}
              </Text>
            </View>
          </View>

          {currentQuestion && (
            <View
              style={[
                styles.questionRecap,
                { backgroundColor: isDark ? Colors.indigo.dim : '#EDE9F8' },
              ]}
            >
              <Text
                style={[
                  styles.questionRecapLabel,
                  { color: isDark ? Colors.lavender : Colors.indigo.DEFAULT },
                ]}
              >
                ⬡ Question asked
              </Text>

              <Text
                style={[
                  styles.questionRecapText,
                  { color: isDark ? Colors.lavender : Colors.indigo.DEFAULT },
                ]}
              >
                {currentQuestion.question_text}
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: c.text3 }]}>STAR BREAKDOWN</Text>

        <View style={[styles.card, { backgroundColor: c.surf, borderColor: c.border }]}>
          {STAR_DIMS.map((dim, i) => {
            const score = scores[dim.key];

            return (
              <View
                key={dim.key}
                style={[
                  styles.starRow,
                  i < STAR_DIMS.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: c.border,
                  },
                ]}
              >
                <View style={styles.starLeft}>
                  <Text style={[styles.starLabel, { color: c.text }]}>
                    {dim.label}
                  </Text>
                  <Text style={[styles.starDesc, { color: c.text3 }]}>
                    {dim.desc}
                  </Text>
                </View>

                <View style={styles.starRight}>
                  <ScoreBar score={score} delay={i * 120} isDark={isDark} />
                  <Text
                    style={[
                      styles.starScore,
                      {
                        color:
                          score >= 4 ? Colors.terra.DEFAULT :
                          score === 3 ? Colors.indigo.DEFAULT :
                          Colors.indigo.light,
                      },
                    ]}
                  >
                    {score}/5
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: c.text3 }]}>WHAT YOU DID WELL</Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#1A2820' : '#E8F5EE',
              borderColor: isDark ? '#2A4830' : '#A8E6CF',
              padding: 14,
            },
          ]}
        >
          <View style={styles.cardIconRow}>
            <Ionicons name="checkmark-circle" size={18} color="#2ECC9A" />
            <Text style={[styles.cardBodyText, { color: isDark ? '#A8E6CF' : '#1A5C40' }]}>
              {strengths}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: c.text3 }]}>WHAT WAS MISSING</Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? Colors.terra.dim : '#FBF0ED',
              borderColor: isDark ? '#6B3828' : Colors.terra.light,
              padding: 14,
            },
          ]}
        >
          <View style={styles.cardIconRow}>
            <Ionicons name="alert-circle-outline" size={18} color={Colors.terra.DEFAULT} />
            <Text style={[styles.cardBodyText, { color: isDark ? Colors.terra.light : '#7A3020' }]}>
              {gaps}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: c.text3 }]}>COACHING TIP</Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? Colors.amber.dim : '#FEF9EC',
              borderColor: isDark ? '#4A3C18' : '#F5E4A0',
              padding: 14,
            },
          ]}
        >
          <View style={styles.cardIconRow}>
            <Text style={styles.tipEmoji}>💡</Text>
            <Text style={[styles.cardBodyText, { color: isDark ? '#D4A850' : '#6B5010' }]}>
              {coaching_tip}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: c.text3 }]}>IDEAL ANSWER</Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? Colors.indigo.dim : '#EDE9F8',
              borderColor: isDark ? '#3D3880' : '#C8C0F0',
            },
          ]}
        >
          <TouchableOpacity
            style={styles.idealHeader}
            onPress={() => setShowIdeal(!showIdeal)}
          >
            <View style={styles.cardIconRow}>
              <Ionicons
                name="bulb-outline"
                size={18}
                color={isDark ? Colors.lavender : Colors.indigo.DEFAULT}
              />
              <Text
                style={[
                  styles.idealHeaderText,
                  { color: isDark ? Colors.lavender : Colors.indigo.DEFAULT },
                ]}
              >
                {showIdeal ? 'Hide ideal answer' : 'Reveal ideal answer'}
              </Text>
            </View>

            <Ionicons
              name={showIdeal ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={isDark ? Colors.lavender : Colors.indigo.DEFAULT}
            />
          </TouchableOpacity>

          {showIdeal && (
            <Text
              style={[
                styles.idealText,
                {
                  color: isDark ? '#C0BFFF' : '#2A2050',
                  borderTopColor: isDark ? '#3D3880' : '#C8C0F0',
                },
              ]}
            >
              {ideal_answer}
            </Text>
          )}
        </View>

        <View style={styles.actionRow}>
          {!isLastQuestion ? (
            <>
              <TouchableOpacity
                style={[styles.nextBtn, { backgroundColor: Colors.terra.DEFAULT }]}
                onPress={handleNextQuestion}
              >
                <Text style={styles.nextBtnText}>Next Question →</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.endBtn, { backgroundColor: c.surf2, borderColor: c.border }]}
                onPress={handleEndSession}
              >
                <Text style={[styles.endBtnText, { color: c.text2 }]}>
                  End Session
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View
                style={[
                  styles.sessionCompleteCard,
                  {
                    backgroundColor: isDark ? '#1A2820' : '#E8F5EE',
                    borderColor: isDark ? '#2A4830' : '#A8E6CF',
                  },
                ]}
              >
                <Text style={styles.completeEmoji}>🎉</Text>

                <Text
                  style={[
                    styles.completeTitle,
                    { color: isDark ? '#A8E6CF' : '#1A5C40' },
                  ]}
                >
                  Session Complete!
                </Text>

                <Text
                  style={[
                    styles.completeSub,
                    { color: isDark ? '#5A9870' : '#2E7D52' },
                  ]}
                >
                  You answered all {totalQuestions} questions.
                </Text>

                <View style={styles.reportRow}>
                  <View style={styles.reportStat}>
                    <Text style={[styles.reportNum, { color: Colors.terra.DEFAULT }]}>
                      {overall_score.toFixed(1)}
                    </Text>
                    <Text
                      style={[
                        styles.reportLbl,
                        { color: isDark ? '#5A9870' : '#2E7D52' },
                      ]}
                    >
                      Last score
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.reportDivider,
                      { backgroundColor: isDark ? '#2A4830' : '#A8E6CF' },
                    ]}
                  />

                  <View style={styles.reportStat}>
                    <Text style={[styles.reportNum, { color: Colors.indigo.DEFAULT }]}>
                      {totalQuestions}
                    </Text>
                    <Text
                      style={[
                        styles.reportLbl,
                        { color: isDark ? '#5A9870' : '#2E7D52' },
                      ]}
                    >
                      Questions
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.reportNote,
                    { color: isDark ? '#5A9870' : '#2E7D52' },
                  ]}
                >
                  Full report available in Progress tab
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.nextBtn, { backgroundColor: Colors.indigo.DEFAULT }]}
                onPress={handleEndSession}
              >
                <Text style={styles.nextBtnText}>Back to Home →</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerSub: { fontSize: 11, marginTop: 2 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { padding: 20, paddingBottom: 48 },
  scoreCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  scoreTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  bigScore: {
    fontSize: 52,
    fontWeight: '700',
    color: Colors.terra.DEFAULT,
  },
  scoreOutOf: { fontSize: 13, marginTop: 4 },
  scoreBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scoreBadgeText: { fontSize: 13, fontWeight: '600' },
  questionRecap: { borderRadius: 10, padding: 10 },
  questionRecapLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  questionRecapText: { fontSize: 13, lineHeight: 20 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  cardIconRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  cardBodyText: { flex: 1, fontSize: 14, lineHeight: 22 },
  tipEmoji: { fontSize: 18 },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  starLeft: { width: 80 },
  starLabel: { fontSize: 13, fontWeight: '600' },
  starDesc: { fontSize: 10, marginTop: 1 },
  starRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  starScore: { fontSize: 13, fontWeight: '700', width: 28 },
  idealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  idealHeaderText: { fontSize: 14, fontWeight: '600', flex: 1 },
  idealText: {
    fontSize: 14,
    lineHeight: 22,
    padding: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionRow: { gap: 10, marginTop: 4 },
  nextBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  endBtn: {
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  endBtnText: { fontSize: 15, fontWeight: '500' },
  sessionCompleteCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  completeEmoji: { fontSize: 40, marginBottom: 8 },
  completeTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  completeSub: { fontSize: 14 },
  reportRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 12,
    alignItems: 'center',
  },
  reportStat: { alignItems: 'center' },
  reportNum: { fontSize: 28, fontWeight: '700' },
  reportLbl: { fontSize: 11, marginTop: 2 },
  reportDivider: { width: 1, height: 40 },
  reportNote: { fontSize: 12, marginTop: 10, textAlign: 'center' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  homeBtn: {
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  homeBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});