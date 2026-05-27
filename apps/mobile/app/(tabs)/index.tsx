import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useThemeStore } from '../../store/useThemeStore';
import { useResumeStore } from '../../store/useResumeStore';
import { useSessionStore } from '../../store/useSessionStore';

import { resumeService } from '../../services/resumeService';
import { sessionService } from '../../services/sessionService';

import {
  Colors,
  ROLES,
  SENIORITY_LEVELS,
} from '../../constants/theme';

export default function HomeScreen() {

  const router = useRouter();

  const { theme, toggleTheme } = useThemeStore();

  const {
    resume,
    setResume,
    setUploading,
    isUploading,
  } = useResumeStore();

  const {
    targetRole,
    seniority,
    setSession,
  } = useSessionStore();

  const [selectedRole, setSelectedRole] = useState(
    targetRole || ROLES[0]
  );

  const [selectedSeniority, setSelectedSeniority] = useState(
    seniority || 'Senior'
  );

  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoles = ROLES.filter(role =>
    role.toLowerCase().includes(
      searchQuery.toLowerCase()
    )
  );

  const isDark = theme === 'dark';

  const c = isDark
    ? Colors.dark
    : Colors.light;

  const handleUpload = async () => {

    try {

      const result =
        await DocumentPicker.getDocumentAsync({
          type: [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ],
          copyToCacheDirectory: true,
        });

      if (result.canceled) return;

      const file = result.assets[0];

      setUploading(true);

      const uploaded = await resumeService.upload(
        file.uri,
        file.name,
        file.mimeType || 'application/pdf'
      );

      setResume(uploaded);

      Alert.alert(
        'Resume uploaded',
        `Parsed ${uploaded.chunk_count} experience chunks. Ready to practice!`
      );

    } catch (err: any) {

      Alert.alert(
        'Upload failed',
        err.message || 'Please try again.'
      );

    } finally {

      setUploading(false);

    }
  };

  const handleStartSession = async () => {

    if (!resume) {
      Alert.alert(
        'No resume',
        'Please upload your resume first.'
      );
      return;
    }

    if (!selectedRole) {
      Alert.alert(
        'No role selected',
        'Please select a target role.'
      );
      return;
    }

    if (!selectedSeniority) {
      Alert.alert(
        'No seniority',
        'Please select a seniority level.'
      );
      return;
    }

    try {

      // Start backend session
      const session = await sessionService.start(
        resume.resume_id,
        selectedRole,
        selectedSeniority,
        'mixed'
      );

      // Save session in Zustand
      setSession(
        session.session_id,
        selectedRole,
        selectedSeniority,
        resume.resume_id
      );

      // Navigate
      router.push('/(tabs)/session');

    } catch (err: any) {

      Alert.alert(
        'Error',
        err.message || 'Could not start session.'
      );

    }
  };

  return (

    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: c.bg },
      ]}
    >

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>

          <View style={styles.avatarRow}>

            <View
              style={[
                styles.avatar,
                {
                  backgroundColor:
                    Colors.indigo.DEFAULT,
                },
              ]}
            >
              <Text style={styles.avatarText}>
                AG
              </Text>
            </View>

            <View>

              <Text
                style={[
                  styles.greeting,
                  { color: c.text2 },
                ]}
              >
                All the Best!
              </Text>

              <Text
                style={[
                  styles.name,
                  { color: c.text },
                ]}
              >
                Anshika
              </Text>

            </View>

          </View>

          {/* THEME TOGGLE */}
          <TouchableOpacity
            onPress={toggleTheme}
            style={[
              styles.iconBtn,
              {
                backgroundColor: c.surf2,
                borderColor: c.border,
                borderWidth: 1,
              },
            ]}
          >

            <Ionicons
              name={
                isDark
                  ? 'sunny-outline'
                  : 'moon-outline'
              }
              size={20}
              color={
                isDark
                  ? Colors.amber.DEFAULT
                  : Colors.indigo.DEFAULT
              }
            />

          </TouchableOpacity>

        </View>

        {/* ROLE SELECTOR */}
        <Text
          style={[
            styles.sectionTitle,
            { color: c.text3 },
          ]}
        >
          TARGET ROLE
        </Text>

        {/* SEARCH BOX */}
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: c.surf,
              borderColor: c.border,
            },
          ]}
        >

          <Ionicons
            name="search-outline"
            size={16}
            color={c.text3}
          />

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search role..."
            placeholderTextColor={c.text3}
            style={[
              styles.searchInput,
              { color: c.text },
            ]}
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
            >
              <Ionicons
                name="close-circle"
                size={16}
                color={c.text3}
              />
            </TouchableOpacity>
          )}

        </View>

        {/* ROLE PILLS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScroll}
          contentContainerStyle={{
            paddingRight: 16,
          }}
        >

          {filteredRoles.length > 0 ? (

            filteredRoles.map((role) => (

              <TouchableOpacity
                key={role}
                onPress={() => {
                  setSelectedRole(role);
                  setSearchQuery('');
                }}
                style={[
                  styles.pill,
                  selectedRole === role
                    ? {
                        backgroundColor: isDark
                          ? Colors.indigo.dim
                          : '#EDE9F8',
                        borderColor: isDark
                          ? '#3D3880'
                          : '#C8C0F0',
                      }
                    : {
                        backgroundColor: c.surf2,
                        borderColor: c.border,
                      },
                ]}
              >

                <Text
                  style={[
                    styles.pillText,
                    {
                      color:
                        selectedRole === role
                          ? (
                              isDark
                                ? Colors.lavender
                                : Colors.indigo.DEFAULT
                            )
                          : c.text2,
                    },
                  ]}
                >
                  {role}
                </Text>

              </TouchableOpacity>

            ))

          ) : (

            <View style={styles.noResult}>

              <Text
                style={[
                  styles.noResultText,
                  { color: c.text3 },
                ]}
              >
                No roles found for "{searchQuery}"
              </Text>

            </View>

          )}

        </ScrollView>

        {/* SELECTED ROLE */}
        {selectedRole ? (

          <View
            style={[
              styles.selectedBadge,
              {
                backgroundColor: isDark
                  ? Colors.indigo.dim
                  : '#EDE9F8',
                borderColor: isDark
                  ? '#3D3880'
                  : '#C8C0F0',
              },
            ]}
          >

            <Ionicons
              name="checkmark-circle"
              size={14}
              color={
                isDark
                  ? Colors.lavender
                  : Colors.indigo.DEFAULT
              }
            />

            <Text
              style={[
                styles.selectedBadgeText,
                {
                  color: isDark
                    ? Colors.lavender
                    : Colors.indigo.DEFAULT,
                },
              ]}
            >
              {selectedRole} selected
            </Text>

          </View>

        ) : null}

        {/* SENIORITY */}
        <Text
          style={[
            styles.sectionTitle,
            { color: c.text3, marginTop: 12 },
          ]}
        >
          SENIORITY LEVEL
        </Text>

        <View style={styles.seniorityRow}>

          {SENIORITY_LEVELS.map((level) => (

            <TouchableOpacity
              key={level}
              onPress={() => setSelectedSeniority(level)}
              style={[
                styles.seniorityPill,
                selectedSeniority === level
                  ? {
                      backgroundColor:
                        Colors.terra.DEFAULT,
                      borderColor:
                        Colors.terra.DEFAULT,
                    }
                  : {
                      backgroundColor: c.surf2,
                      borderColor: c.border,
                      borderWidth: 1,
                    },
              ]}
            >

              <Text
                style={[
                  styles.pillText,
                  {
                    color:
                      selectedSeniority === level
                        ? '#fff'
                        : c.text2,
                  },
                ]}
              >
                {level}
              </Text>

            </TouchableOpacity>

          ))}

        </View>

        {/* SELECTED SENIORITY */}
        {selectedSeniority ? (

          <View
            style={[
              styles.selectedBadge,
              {
                backgroundColor: isDark
                  ? Colors.terra.dim
                  : '#FBF0ED',
                borderColor: isDark
                  ? '#6B3828'
                  : Colors.terra.light,
                marginBottom: 32,
              },
            ]}
          >

            <Ionicons
              name="checkmark-circle"
              size={14}
              color={Colors.terra.DEFAULT}
            />

            <Text
              style={[
                styles.selectedBadgeText,
                {
                  color: Colors.terra.DEFAULT,
                },
              ]}
            >
              {selectedSeniority} level selected
            </Text>

          </View>

        ) : null}

        {/* MAIN CARD */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: c.surf,
            },
          ]}
        >

          <Text
            style={[
              styles.cardTitle,
              { color: c.text },
            ]}
          >
            Your AI Interview Coach
          </Text>

          <Text
            style={[
              styles.cardBody,
              { color: c.text2 },
            ]}
          >
            Questions built from your resume experience.
          </Text>

          {resume ? (

            <View style={styles.resumeBadge}>

              <Ionicons
                name="checkmark-circle"
                size={14}
                color="#4CAF7D"
              />

              <Text
                style={[
                  styles.resumeBadgeText,
                  { color: c.text },
                ]}
              >
                Resume ready
              </Text>

            </View>

          ) : (

            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={handleUpload}
              disabled={isUploading}
            >

              {isUploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.ctaBtnText}>
                  Upload Resume
                </Text>
              )}

            </TouchableOpacity>

          )}

          {resume && (

            <TouchableOpacity
              style={[
                styles.ctaBtn,
                { marginTop: 8 },
              ]}
              onPress={handleStartSession}
            >

              <Text style={styles.ctaBtnText}>
                Start Session
              </Text>

            </TouchableOpacity>

          )}

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },

  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#fff',
    fontWeight: '700',
  },

  greeting: {
    fontSize: 12,
  },

  name: {
    fontSize: 18,
    fontWeight: '700',
  },

  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginHorizontal: 16,
    marginBottom: 10,
    letterSpacing: 0.8,
  },

  pillScroll: {
    marginBottom: 8,
  },

  pill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    marginLeft: 16,
  },

  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  seniorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    gap: 10,
    marginBottom: 10,
  },

  seniorityPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },

  card: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
  },

  cardBody: {
    marginTop: 8,
    marginBottom: 18,
    lineHeight: 20,
  },

  resumeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  resumeBadgeText: {
    fontSize: 14,
    fontWeight: '500',
  },

  ctaBtn: {
    backgroundColor: Colors.indigo.DEFAULT,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  ctaBtnText: {
    color: '#fff',
    fontWeight: '700',
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },

  noResult: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  noResultText: {
    fontSize: 12,
  },

  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginHorizontal: 16,
    marginTop: 6,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  selectedBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },

});