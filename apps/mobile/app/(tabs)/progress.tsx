import { View, Text, StyleSheet } from 'react-native';
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
