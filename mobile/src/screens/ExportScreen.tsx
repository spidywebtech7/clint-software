import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  useColorScheme,
  Alert
} from 'react-native';
import { Download, FileText, Table as TableIcon, FileJson, LogOut } from 'lucide-react-native';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const ExportScreen = () => {
  const { logout } = useAuth();
  const isDark = useColorScheme() === 'dark';
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: string) => {
    setExporting(format);
    try {
      // In a real app, you would use expo-sharing or similar to save the file
      // Here we just trigger the backend and show a success message
      await api.get(`/clients/export/${format}`);
      Alert.alert("Export Started", `The ${format.toUpperCase()} export has been triggered on the server. In a production app, this would download to your device.`);
    } catch (err) {
      Alert.alert("Error", "Export failed");
    } finally {
      setExporting(null);
    }
  };

  const textColor = isDark ? '#fff' : colors.slate[900];
  const cardBg = isDark ? colors.slate[900] : '#fff';

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? colors.slate[950] : colors.slate[50] }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Settings & Export</Text>
        <Text style={styles.subtitle}>Manage your data and account</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export Data</Text>
        <View style={styles.grid}>
          {[
            { id: 'excel', name: 'Excel', icon: TableIcon, color: colors.success },
            { id: 'pdf', name: 'PDF', icon: FileText, color: colors.danger },
            { id: 'csv', name: 'CSV', icon: FileJson, color: colors.warning },
          ].map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.exportCard, { backgroundColor: cardBg }]}
              onPress={() => handleExport(item.id)}
              disabled={exporting !== null}
            >
              <item.icon size={32} color={item.color} />
              <Text style={[styles.exportName, { color: textColor }]}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity 
          style={[styles.logoutBtn, { backgroundColor: cardBg }]}
          onPress={logout}
        >
          <LogOut size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>CallCRM Mobile v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    color: colors.slate[500],
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.slate[400],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  exportCard: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  exportName: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.danger,
  },
  footer: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
  },
  version: {
    color: colors.slate[400],
    fontSize: 12,
  }
});

export default ExportScreen;
