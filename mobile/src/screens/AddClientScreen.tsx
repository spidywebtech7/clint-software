import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Alert
} from 'react-native';
import { User, Phone, Calendar, StickyNote, Save, Mail, Briefcase } from 'lucide-react-native';
import api from '../api/api';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';

const AddClientScreen = () => {
  const navigation = useNavigation();
  const isDark = useColorScheme() === 'dark';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessType: '',
    meetingDate: new Date().toISOString().split('T')[0],
    status: 'Pending',
    notes: ''
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      Alert.alert("Required Fields", "Please enter name and phone number");
      return;
    }
    setLoading(true);
    try {
      await api.post('/clients', formData);
      Alert.alert("Success", "Client added successfully");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", "Failed to add client");
    } finally {
      setLoading(false);
    }
  };

  const inputBg = isDark ? colors.slate[900] : '#fff';
  const textColor = isDark ? '#fff' : colors.slate[900];
  const labelColor = isDark ? colors.slate[400] : colors.slate[600];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: isDark ? colors.slate[950] : colors.slate[50] }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>New Client</Text>
          <Text style={styles.subtitle}>Start tracking a new contact</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: labelColor }]}>Full Name</Text>
            <View style={[styles.inputWrapper, { backgroundColor: inputBg }]}>
              <User size={20} color={colors.slate[400]} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="John Doe"
                placeholderTextColor={colors.slate[400]}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: labelColor }]}>Email Address</Text>
            <View style={[styles.inputWrapper, { backgroundColor: inputBg }]}>
              <Mail size={20} color={colors.slate[400]} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="john@example.com"
                placeholderTextColor={colors.slate[400]}
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: labelColor }]}>Phone Number</Text>
            <View style={[styles.inputWrapper, { backgroundColor: inputBg }]}>
              <Phone size={20} color={colors.slate[400]} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="+1 234 567 890"
                placeholderTextColor={colors.slate[400]}
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: labelColor }]}>Business Type</Text>
            <View style={[styles.inputWrapper, { backgroundColor: inputBg }]}>
              <Briefcase size={20} color={colors.slate[400]} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="e.g. Jewels"
                placeholderTextColor={colors.slate[400]}
                value={formData.businessType}
                onChangeText={(text) => setFormData({...formData, businessType: text})}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: labelColor }]}>Meeting Date</Text>
            <View style={[styles.inputWrapper, { backgroundColor: inputBg }]}>
              <Calendar size={20} color={colors.slate[400]} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.slate[400]}
                value={formData.meetingDate}
                onChangeText={(text) => setFormData({...formData, meetingDate: text})}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: labelColor }]}>Status</Text>
            <View style={styles.statusOptions}>
              {['Pending', 'Completed', 'Called', 'Follow-up Required'].map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setFormData({...formData, status})}
                  style={[
                    styles.statusBtn,
                    formData.status === status && { backgroundColor: colors.primary }
                  ]}
                >
                  <Text style={[
                    styles.statusBtnText,
                    formData.status === status && { color: '#fff' }
                  ]}>{status === 'Follow-up Required' ? 'Follow-up' : status}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>


          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: labelColor }]}>Notes</Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper, { backgroundColor: inputBg }]}>
              <StickyNote size={20} color={colors.slate[400]} style={{ marginTop: 12 }} />
              <TextInput
                style={[styles.input, styles.textArea, { color: textColor }]}
                placeholder="Add some details..."
                placeholderTextColor={colors.slate[400]}
                multiline
                numberOfLines={4}
                value={formData.notes}
                onChangeText={(text) => setFormData({...formData, notes: text})}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            <Save size={20} color="#fff" />
            <Text style={styles.submitBtnText}>{loading ? 'Saving...' : 'Save Client'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
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
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 16,
    height: 56,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.slate[100],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate[600],
  },
  textAreaWrapper: {
    height: 120,
    alignItems: 'flex-start',
  },
  textArea: {
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  }
});

export default AddClientScreen;
