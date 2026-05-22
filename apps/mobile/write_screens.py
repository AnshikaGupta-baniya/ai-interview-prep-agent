import os

screens = {
    "app/(tabs)/profile.tsx": """import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../store/useThemeStore';

export default function ProfileScreen() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';
  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#16141E' : '#FAF8FC' }]}>
      <SafeAreaView>
        <Text style={[styles.title, { color: isDark ? '#F0EDF8' : '#1A1720' }]}>Profile</Text>
        <TouchableOpacity style={styles.btn} onPress={toggleTheme}>
          <Text style={styles.btnText}>Switch to {isDark ? 'Light' : 'Dark'} Mode</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', marginTop: 20, marginBottom: 20 },
  btn: { backgroundColor: '#6B5EA8', padding: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
});
""",
    "app/(tabs)/session.tsx": """import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../store/useThemeStore';

export default function SessionScreen() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#16141E' : '#FAF8FC' }]}>
      <SafeAreaView>
        <View style={styles.center}>
          <Text style={[styles.title, { color: isDark ? '#F0EDF8' : '#1A1720' }]}>Practice Session</Text>
          <Text style={[styles.sub, { color: isDark ? '#8A87A0' : '#6B6880' }]}>Upload your resume first, then start a session from Home.</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { padding: 24, marginTop: 80, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  sub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
""",
    "app/(tabs)/feedback.tsx": """import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../store/useThemeStore';

export default function FeedbackScreen() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#16141E' : '#FAF8FC' }]}>
      <SafeAreaView>
        <View style={styles.center}>
          <Text style={styles.emoji}>📊</Text>
          <Text style={[styles.title, { color: isDark ? '#F0EDF8' : '#1A1720' }]}>Feedback</Text>
          <Text style={[styles.sub, { color: isDark ? '#8A87A0' : '#6B6880' }]}>Complete a session to see your STAR breakdown and coaching tips here.</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { padding: 24, marginTop: 80, alignItems: 'center' },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  sub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
""",
    "app/(tabs)/progress.tsx": """import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../store/useThemeStore';

export default function ProgressScreen() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#16141E' : '#FAF8FC' }]}>
      <SafeAreaView>
        <View style={styles.center}>
          <Text style={styles.emoji}>📈</Text>
          <Text style={[styles.title, { color: isDark ? '#F0EDF8' : '#1A1720' }]}>Your Progress</Text>
          <Text style={[styles.sub, { color: isDark ? '#8A87A0' : '#6B6880' }]}>Session history and score trends will appear here after your first practice.</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { padding: 24, marginTop: 80, alignItems: 'center' },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  sub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
""",
}

for path, content in screens.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Written: {path}")

print("All screens written successfully")
