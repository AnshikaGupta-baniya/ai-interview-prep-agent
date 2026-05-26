import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../store/useThemeStore';
import { useAuthStore } from '../../store/useAuthStore';
import { sessionService } from '../../services/sessionService';
import { Colors } from '../../constants/theme';
import { SessionSummary } from '../../types';

function getScoreTags(score: number | null): {
  label: string; color: string; bg: string
}[] {
  if (!score) return [];
  const tags = [];

  if (score >= 4) {
    tags.push({ label: 'Strong communicator', color: '#1A5C40', bg: '#E8F5EE' });
  }
  if (score >= 3.5) {
    tags.push({ label: 'Good STAR structure', color: '#4A3C18', bg: '#FEF9EC' });
  }
  if (score < 3) {
    tags.push({ label: 'Needs more detail', color: '#7A3020', bg: '#FBF0ED' });
  }
  if (score < 3.5 && score >= 3) {
    tags.push({ label: 'Quantify results', color: '#2A2050', bg: '#EDE9F8' });
  }

  return tags;
}

export default function ProgressScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const isDark = theme === 'dark';
  const c = isDark ? Colors.dark : Colors.light;

  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await sessionService.getHistory(user?.id || 'anonymous');
      setSessions(data);
    } catch (err) {
      console.log('History fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const avgScore = sessions.length > 0
    ? (sessions.reduce((sum, s) => sum + (s.avg_score || 0), 0) / sessions.length).toFixed(1)
    : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={[styles.pageTitle, { color: c.text }]}>Progress</Text>

        <View style={styles.statRow}>
          {[
            {
              label: 'Sessions',
              value: sessions.length.toString(),
              color: isDark ? Colors.lavender : Colors.indigo.DEFAULT,
            },
            {
              label: 'Avg score',
              value: avgScore || '—',
              color: Colors.terra.DEFAULT,
            },
            {
              label: 'Questions',
              value: sessions.reduce((sum, s) => sum + s.total_questions, 0).toString(),
              color: Colors.amber.DEFAULT,
            },
          ].map((s) => (
            <View key={s.label} style={[styles.statBox, { backgroundColor: c.surf2 }]}>
              <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.statLbl, { color: c.text3 }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: c.text3 }]}>
          SESSION HISTORY
        </Text>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.indigo.DEFAULT} />
          </View>
        ) : sessions.length === 0 ? (
          <View style={[styles.emptyCard, {
            backgroundColor: c.surf,
            borderColor: c.border,
          }]}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={[styles.emptyTitle, { color: c.text }]}>
              No sessions yet
            </Text>
            <Text style={[styles.emptySub, { color: c.text2 }]}>
              Complete your first practice session to see your progress here.
            </Text>
          </View>
        ) : (
          sessions.map((session) => {
            const tags = getScoreTags(session.avg_score);
            const scoreColor =
              (session.avg_score || 0) >= 4 ? '#2ECC9A' :
              (session.avg_score || 0) >= 3 ? Colors.terra.DEFAULT :
              Colors.indigo.light;

            return (
              <View
                key={session.id}
                style={[styles.sessionCard, {
                  backgroundColor: c.surf,
                  borderColor: c.border,
                }]}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.roleIcon, {
                    backgroundColor: isDark ? Colors.indigo.dim : '#EDE9F8',
                  }]}>
                    <Ionicons
                      name="briefcase-outline"
                      size={18}
                      color={isDark ? Colors.lavender : Colors.indigo.DEFAULT}
                    />
                  </View>

                  <View style={styles.cardMeta}>
                    <Text style={[styles.cardRole, { color: c.text }]}>
                      {session.seniority} {session.target_role}
                    </Text>
                    <Text style={[styles.cardDate, { color: c.text3 }]}>
                      {formatDate(session.created_at)} · {session.total_questions} questions
                    </Text>
                  </View>

                  <Text style={[styles.cardScore, { color: scoreColor }]}>
                    {session.avg_score?.toFixed(1) || '—'}
                  </Text>
                </View>

                {tags.length > 0 && (
                  <View style={styles.tagRow}>
                    {tags.map((tag) => (
                      <View
                        key={tag.label}
                        style={[styles.tag, {
                          backgroundColor: isDark ? tag.bg + '30' : tag.bg,
                          borderColor: isDark ? tag.color + '50' : tag.color + '40',
                        }]}
                      >
                        <Text style={[styles.tagText, {
                          color: isDark ? tag.bg : tag.color,
                        }]}>
                          {tag.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={[styles.cardActions, { borderTopColor: c.border }]}>
                  <TouchableOpacity
                    style={[styles.cardActionBtn, {
                      backgroundColor: isDark ? Colors.indigo.dim : '#EDE9F8',
                    }]}
                    onPress={() => router.push({
                      pathname: '/session-detail',
                      params: { sessionId: session.id },
                    })}
                  >
                    <Ionicons
                      name="eye-outline"
                      size={14}
                      color={isDark ? Colors.lavender : Colors.indigo.DEFAULT}
                    />
                    <Text style={[styles.cardActionText, {
                      color: isDark ? Colors.lavender : Colors.indigo.DEFAULT,
                    }]}>
                      View
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.cardActionBtn, {
                      backgroundColor: isDark ? Colors.terra.dim : '#FBF0ED',
                    }]}
                    onPress={() => router.push({
                      pathname: '/session-detail',
                      params: {
                        sessionId: session.id,
                        autoDownload: 'true',
                      },
                    })}
                  >
                    <Ionicons
                      name="share-outline"
                      size={14}
                      color={Colors.terra.DEFAULT}
                    />
                    <Text style={[styles.cardActionText, { color: Colors.terra.DEFAULT }]}>
                      Download
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 48 },
  pageTitle: { fontSize: 28, fontWeight: '700', marginBottom: 20 },
  statRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statBox: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '700' },
  statLbl: { fontSize: 10, marginTop: 2 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  centered: { alignItems: 'center', padding: 32 },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
  },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  sessionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMeta: { flex: 1 },
  cardRole: { fontSize: 15, fontWeight: '600' },
  cardDate: { fontSize: 11, marginTop: 2 },
  cardScore: { fontSize: 22, fontWeight: '700' },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tag: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  tagText: { fontSize: 11, fontWeight: '500' },
  cardActions: {
      flexDirection: 'row', gap: 8,
  paddingTop: 10, marginTop: 10,
  borderTopWidth: 1,
  },
  cardActionBtn: {
  flex: 1, flexDirection: 'row',
  alignItems: 'center', justifyContent: 'center',
  gap: 6, padding: 8, borderRadius: 10,
  },
  cardActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});