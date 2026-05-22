import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';

import { useThemeStore } from '../../store/useThemeStore';
import { useSessionStore } from '../../store/useSessionStore';
import { sessionService } from '../../services/sessionService';
import { Colors } from '../../constants/theme';

type Phase =
  | 'loading_question'
  | 'question_ready'
  | 'recording'
  | 'transcribing'
  | 'transcript_review'
  | 'evaluating';

export default function SessionScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const {
    sessionId, targetRole, seniority,
    currentQuestion, questionNumber, totalQuestions,
    setQuestion, setEvaluation, setTranscript, transcript,
  } = useSessionStore();

  const isDark = theme === 'dark';
  const c = isDark ? Colors.dark : Colors.light;

  const [phase, setPhase] = useState<Phase>('loading_question');
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(16).fill(4));
  const [editableTranscript, setEditableTranscript] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const waveInterval = useRef<any>(null);
  const timerInterval = useRef<any>(null);

  // Load question on mount
  useEffect(() => {
    if (sessionId) loadNextQuestion();
  }, [sessionId]);

  // Animate waveform
  useEffect(() => {
    if (phase === 'recording') {
      waveInterval.current = setInterval(() => {
        setWaveHeights(
          Array(16).fill(0).map(() => Math.floor(Math.random() * 28) + 4)
        );
      }, 120);
      timerInterval.current = setInterval(() => {
        setRecordingDuration(d => d + 1);
      }, 1000);
    } else {
      clearInterval(waveInterval.current);
      clearInterval(timerInterval.current);
      setWaveHeights(Array(16).fill(4));
      setRecordingDuration(0);
    }
    return () => {
      clearInterval(waveInterval.current);
      clearInterval(timerInterval.current);
    };
  }, [phase]);

  const loadNextQuestion = async () => {
    if (!sessionId) return;
    setPhase('loading_question');
    try {
      const question = await sessionService.generateQuestion(sessionId);
      setQuestion(question);
      setPhase('question_ready');
    } catch (err: any) {
      Alert.alert('Error', 'Could not generate question. Is the backend running?');
    }
  };

  const handleStartRecording = async () => {
    try {
      // Request microphone permission
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Permission required',
          'Please allow microphone access to record your answer.'
        );
        return;
      }

      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setPhase('recording');

    } catch (err: any) {
      Alert.alert('Recording error', err.message || 'Could not start recording.');
    }
  };

  const handleStopRecording = async () => {
    if (!recordingRef.current) return;
    setPhase('transcribing');

    try {
      // Stop and unload recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) throw new Error('No audio file found.');

      // Reset audio mode
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      // Send to backend for Whisper transcription
      const result = await sessionService.transcribe(
        uri,
        currentQuestion!.question_id
      );

      setEditableTranscript(result.transcript);
      setTranscript(result.transcript);
      setPhase('transcript_review');

    } catch (err: any) {
      Alert.alert('Transcription error', err.message || 'Could not transcribe audio.');
      setPhase('question_ready');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!editableTranscript.trim()) {
      Alert.alert('Empty answer', 'Please record or type your answer.');
      return;
    }
    if (!currentQuestion || !sessionId) return;

    setPhase('evaluating');
    setTranscript(editableTranscript);

    try {
      const evaluation = await sessionService.evaluate(
        currentQuestion.question_id,
        sessionId,
        editableTranscript,
      );
      setEvaluation(evaluation);
      router.push('/(tabs)/feedback');
    } catch (err: any) {
      Alert.alert('Evaluation error', err.message || 'Could not evaluate answer.');
      setPhase('transcript_review');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // No session
  if (!sessionId) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={[styles.emptyTitle, { color: c.text }]}>No active session</Text>
          <Text style={[styles.emptySub, { color: c.text2 }]}>
            Go to Home, upload your resume and tap Start Practice Session.
          </Text>
          <TouchableOpacity
            style={[styles.homeBtn, { backgroundColor: Colors.indigo.DEFAULT }]}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.homeBtnText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.roleText, { color: c.text }]}>
            {seniority} {targetRole}
          </Text>
          <Text style={[styles.questionCount, { color: c.text3 }]}>
            Question {questionNumber} of {totalQuestions}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)')}
          style={[styles.closeBtn, { backgroundColor: c.surf2 }]}
        >
          <Ionicons name="close" size={18} color={c.text2} />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBg, { backgroundColor: c.border }]}>
        <View style={[
          styles.progressFill,
          { width: `${(questionNumber / totalQuestions) * 100}%` }
        ]} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading question */}
        {phase === 'loading_question' && (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.indigo.DEFAULT} size="large" />
            <Text style={[styles.statusText, { color: c.text2 }]}>
              Generating your question...
            </Text>
          </View>
        )}

        {/* Question bubble */}
        {phase !== 'loading_question' && currentQuestion && (
          <View style={[styles.questionBubble, {
            backgroundColor: c.surf, borderColor: c.border
          }]}>
            <Text style={[styles.aiLabel, { color: Colors.indigo.DEFAULT }]}>
              ⬡ AI Interviewer
            </Text>
            <Text style={[styles.questionText, { color: c.text }]}>
              {currentQuestion.question_text}
            </Text>
          </View>
        )}

        {/* Ready to record */}
        {phase === 'question_ready' && (
          <Text style={[styles.hint, { color: c.text2 }]}>
            Take a moment to think, then tap the mic to answer.
          </Text>
        )}

        {/* Waveform while recording */}
        {phase === 'recording' && (
          <View style={styles.recordingWrap}>
            <Text style={[styles.timer, { color: Colors.terra.DEFAULT }]}>
              ● {formatTime(recordingDuration)}
            </Text>
            <View style={styles.waveRow}>
              {waveHeights.map((h, i) => (
                <View
                  key={i}
                  style={[styles.waveBar, {
                    height: h,
                    backgroundColor: i % 2 === 0
                      ? Colors.terra.DEFAULT
                      : Colors.terra.light,
                  }]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Transcribing */}
        {phase === 'transcribing' && (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.terra.DEFAULT} size="large" />
            <Text style={[styles.statusText, { color: c.text2 }]}>
              Transcribing your answer...
            </Text>
          </View>
        )}

        {/* Transcript review */}
        {phase === 'transcript_review' && (
          <View>
            <View style={[styles.transcriptHeader, {
              backgroundColor: isDark ? Colors.indigo.dim : '#EDE9F8'
            }]}>
              <Ionicons name="checkmark-circle" size={16}
                color={isDark ? Colors.lavender : Colors.indigo.DEFAULT} />
              <Text style={[styles.transcriptLabel, {
                color: isDark ? Colors.lavender : Colors.indigo.DEFAULT
              }]}>
                Transcript — edit if needed
              </Text>
            </View>
            <TextInput
              value={editableTranscript}
              onChangeText={setEditableTranscript}
              multiline
              style={[styles.transcriptInput, {
                backgroundColor: c.surf,
                borderColor: c.border,
                color: c.text,
              }]}
              placeholder="Your answer will appear here..."
              placeholderTextColor={c.text3}
            />
            <TouchableOpacity
              style={styles.rerecordBtn}
              onPress={() => setPhase('question_ready')}
            >
              <Ionicons name="mic-outline" size={14} color={c.text3} />
              <Text style={[styles.rerecordText, { color: c.text3 }]}>
                Re-record answer
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Evaluating */}
        {phase === 'evaluating' && (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.terra.DEFAULT} size="large" />
            <Text style={[styles.statusText, { color: c.text2 }]}>
              Evaluating your answer...
            </Text>
            <Text style={[styles.statusSub, { color: c.text3 }]}>
              Analysing STAR framework...
            </Text>
          </View>
        )}

      </ScrollView>

      {/* Bottom action area */}
      <View style={styles.bottomArea}>

        {/* Mic button — ready or recording */}
        {(phase === 'question_ready' || phase === 'recording') && (
          <View style={styles.micSection}>
            <TouchableOpacity
              onPress={phase === 'recording'
                ? handleStopRecording
                : handleStartRecording}
              style={[styles.micRing, {
                borderColor: phase === 'recording'
                  ? Colors.terra.DEFAULT : c.border,
                backgroundColor: phase === 'recording'
                  ? (isDark ? Colors.terra.dim : '#FBF0ED')
                  : c.surf2,
              }]}
            >
              <View style={[styles.micBtn, {
                backgroundColor: phase === 'recording'
                  ? Colors.terra.DEFAULT
                  : Colors.indigo.DEFAULT,
              }]}>
                <Ionicons
                  name={phase === 'recording' ? 'stop' : 'mic'}
                  size={28}
                  color="#fff"
                />
              </View>
            </TouchableOpacity>
            <Text style={[styles.micHint, { color: c.text3 }]}>
              {phase === 'recording' ? 'Tap to stop' : 'Tap to answer'}
            </Text>
          </View>
        )}

        {/* Submit button — transcript review */}
        {phase === 'transcript_review' && (
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: Colors.terra.DEFAULT }]}
            onPress={handleSubmitAnswer}
          >
            <Text style={styles.submitBtnText}>Submit Answer →</Text>
          </TouchableOpacity>
        )}

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', padding: 20, paddingBottom: 12,
  },
  roleText: { fontSize: 16, fontWeight: '600' },
  questionCount: { fontSize: 12, marginTop: 2 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  progressBg: { height: 3, marginHorizontal: 20, borderRadius: 2, marginBottom: 20 },
  progressFill: {
    height: '100%', borderRadius: 2,
    backgroundColor: Colors.indigo.DEFAULT,
  },
  scroll: { padding: 20, paddingBottom: 20 },
  centered: { alignItems: 'center', marginTop: 48, gap: 16 },
  statusText: { fontSize: 15, fontWeight: '500' },
  statusSub: { fontSize: 12 },
  questionBubble: {
    borderRadius: 16, borderWidth: 1,
    padding: 16, marginBottom: 16,
  },
  aiLabel: { fontSize: 11, fontWeight: '600', marginBottom: 8 },
  questionText: { fontSize: 16, lineHeight: 26, fontWeight: '500' },
  hint: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  recordingWrap: { alignItems: 'center', gap: 12, marginTop: 8 },
  timer: { fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] },
  waveRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 3, height: 48,
  },
  waveBar: { width: 4, borderRadius: 2 },
  transcriptHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, padding: 10, borderRadius: 10,
    marginBottom: 10,
  },
  transcriptLabel: { fontSize: 13, fontWeight: '600' },
  transcriptInput: {
    borderWidth: 1, borderRadius: 12,
    padding: 14, fontSize: 14, lineHeight: 22,
    minHeight: 140, textAlignVertical: 'top',
  },
  rerecordBtn: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, marginTop: 10, alignSelf: 'center',
  },
  rerecordText: { fontSize: 13 },
  bottomArea: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 8 },
  micSection: { alignItems: 'center', gap: 8 },
  micRing: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  micBtn: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
  },
  micHint: { fontSize: 12 },
  submitBtn: {
    borderRadius: 14, padding: 16,
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  empty: {
    flex: 1, alignItems: 'center',
    justifyContent: 'center', padding: 32,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  emptySub: {
    fontSize: 14, textAlign: 'center',
    lineHeight: 22, marginBottom: 24,
  },
  homeBtn: { borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  homeBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});