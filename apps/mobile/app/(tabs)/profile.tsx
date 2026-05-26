import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

import { useThemeStore } from '../../store/useThemeStore';
import { useResumeStore } from '../../store/useResumeStore';
import { useAuthStore } from '../../store/useAuthStore';

import { sessionService } from '../../services/sessionService';
import { Colors } from '../../constants/theme';

export default function ProfileScreen() {
  const router = useRouter();

  // Theme Store
  const { theme } = useThemeStore();

  // Resume Store
  const { resume, clearResume } = useResumeStore();

  // Auth Store
  const { user, logout } = useAuthStore();

  // Local State
  const [sessions, setSessions] = useState<any[]>([]);

  // Theme Helpers
  const isDark = theme === 'dark';

  const c = isDark
    ? Colors.dark
    : Colors.light;

  // Fetch session history
  useEffect(() => {
    sessionService
      .getHistory(user?.id || 'anonymous')
      .then(setSessions)
      .catch(console.log);
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            clearResume();

            await logout();

            router.replace('/auth');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: c.bg },
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text
          style={[
            styles.pageTitle,
            { color: c.text },
          ]}
        >
          Profile
        </Text>

        {/* User Card */}
        <View
          style={[
            styles.userCard,
            {
              backgroundColor: c.surf,
              borderColor: c.border,
            },
          ]}
        >
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: Colors.indigo.DEFAULT,
              },
            ]}
          >
            <Text style={styles.avatarText}>
              AG
            </Text>
          </View>

          <View style={styles.userInfo}>
            <Text
              style={[
                styles.userName,
                { color: c.text },
              ]}
            >
              {resume?.parsed_json?.full_name || 'Anshika Gupta'}
            </Text>

            <Text
              style={[
                styles.userEmail,
                { color: c.text2 },
              ]}
            >
              {resume?.parsed_json?.email || 'anshika@example.com'}
            </Text>

            {resume && (
              <View
                style={[
                  styles.resumeTag,
                  {
                    backgroundColor: isDark
                      ? '#1A2C20'
                      : '#E8F5EE',
                  },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={12}
                  color="#4CAF7D"
                />

                <Text
                  style={[
                    styles.resumeTagText,
                    {
                      color: isDark
                        ? '#4CAF7D'
                        : '#2E7D52',
                    },
                  ]}
                >
                  Resume uploaded · {resume.chunk_count} chunks
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Preferences */}
        <Text
          style={[
            styles.sectionLabel,
            { color: c.text3 },
          ]}
        >
          PREFERENCES
        </Text>

        <View
          style={[
            styles.section,
            {
              backgroundColor: c.surf,
              borderColor: c.border,
            },
          ]}
        >

          {/* Resume */}
          <TouchableOpacity
            style={[
              styles.row,
              { borderBottomColor: c.border },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: isDark
                    ? Colors.terra.dim
                    : '#FBF0ED',
                },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={18}
                color={Colors.terra.DEFAULT}
              />
            </View>

            <Text
              style={[
                styles.rowLabel,
                { color: c.text },
              ]}
            >
              My Resume
            </Text>

            <Ionicons
              name="chevron-forward"
              size={16}
              color={c.text3}
            />
          </TouchableOpacity>

          {/* Session History */}
          <TouchableOpacity
            style={[
              styles.row,
              { borderBottomWidth: 0 },
            ]}
            onPress={() => {
              if (sessions.length > 0) {
                router.push({
                  pathname: '/session-detail',
                  params: { sessionId: sessions[0].id },
                });
              } else {
                Alert.alert(
                  'No sessions',
                  'Complete a practice session first.'
                );
              }
            }}
          >
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: isDark
                    ? '#1E2820'
                    : '#E8F5EE',
                },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={18}
                color="#4CAF7D"
              />
            </View>

            <Text
              style={[
                styles.rowLabel,
                { color: c.text },
              ]}
            >
              Session History
            </Text>

            <Ionicons
              name="chevron-forward"
              size={16}
              color={c.text3}
            />
          </TouchableOpacity>

        </View>

        {/* Account */}
        <Text
          style={[
            styles.sectionLabel,
            { color: c.text3 },
          ]}
        >
          ACCOUNT
        </Text>

        <View
          style={[
            styles.section,
            {
              backgroundColor: c.surf,
              borderColor: c.border,
            },
          ]}
        >

          {/* Help */}
          <TouchableOpacity
            style={[
              styles.row,
              { borderBottomColor: c.border },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: isDark
                    ? '#1E1B38'
                    : '#EDE9F8',
                },
              ]}
            >
              <Ionicons
                name="help-circle-outline"
                size={18}
                color={Colors.indigo.DEFAULT}
              />
            </View>

            <Text
              style={[
                styles.rowLabel,
                { color: c.text },
              ]}
            >
              Help & Support
            </Text>

            <Ionicons
              name="chevron-forward"
              size={16}
              color={c.text3}
            />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            style={[
              styles.row,
              { borderBottomWidth: 0 },
            ]}
            onPress={handleLogout}
          >
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: '#FBF0ED',
                },
              ]}
            >
              <Ionicons
                name="log-out-outline"
                size={18}
                color={Colors.terra.DEFAULT}
              />
            </View>

            <Text
              style={[
                styles.rowLabel,
                {
                  color: Colors.terra.DEFAULT,
                },
              ]}
            >
              Log out
            </Text>

            <Ionicons
              name="chevron-forward"
              size={16}
              color={c.text3}
            />
          </TouchableOpacity>

        </View>

        {/* Recent Sessions */}
        <Text
          style={[
            styles.sectionLabel,
            { color: c.text3 },
          ]}
        >
          RECENT SESSIONS
        </Text>

        <View
          style={[
            styles.section,
            {
              backgroundColor: c.surf,
              borderColor: c.border,
            },
          ]}
        >
          {sessions.length === 0 ? (
            <View
              style={{
                padding: 16,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: c.text3,
                  fontSize: 13,
                }}
              >
                No sessions yet
              </Text>
            </View>
          ) : (
            sessions.slice(0, 3).map((session, i) => (
              <View
                key={session.id}
                style={[
                  styles.row,
                  {
                    borderBottomWidth: i < 2 ? 1 : 0,
                    borderBottomColor: c.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconWrap,
                    {
                      backgroundColor: isDark
                        ? Colors.indigo.dim
                        : '#EDE9F8',
                    },
                  ]}
                >
                  <Ionicons
                    name="bar-chart-outline"
                    size={18}
                    color={
                      isDark
                        ? Colors.lavender
                        : Colors.indigo.DEFAULT
                    }
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.rowLabel,
                      { color: c.text },
                    ]}
                  >
                    {session.seniority} {session.target_role}
                  </Text>

                  <Text
                    style={{
                      fontSize: 11,
                      color: c.text3,
                      marginTop: 1,
                    }}
                  >
                    {session.total_questions} questions
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color:
                      (session.avg_score || 0) >= 4
                        ? '#2ECC9A'
                        : Colors.terra.DEFAULT,
                  }}
                >
                  {session.avg_score?.toFixed(1) || '—'}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Version */}
        <Text
          style={[
            styles.version,
            { color: c.text3 },
          ]}
        >
          AI Interview Coach v1.0.0
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
  },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  userInfo: {
    flex: 1,
    gap: 4,
  },

  userName: {
    fontSize: 17,
    fontWeight: '600',
  },

  userEmail: {
    fontSize: 13,
  },

  resumeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 4,
  },

  resumeTagText: {
    fontSize: 11,
    fontWeight: '500',
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginHorizontal: 20,
    marginBottom: 8,
  },

  section: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
  },

  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowLabel: {
    flex: 1,
    fontSize: 15,
  },

  version: {
    textAlign: 'center',
    fontSize: 11,
    marginBottom: 32,
  },
});