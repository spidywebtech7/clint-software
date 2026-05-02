import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  RefreshControl,
  useColorScheme,
  Alert
} from 'react-native';
import { Search, Phone, Calendar, Trash2, Filter, Check } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import api, { SOCKET_URL } from '../api/api';
import { colors } from '../theme/colors';
import { io } from 'socket.io-client';

interface Client {
  _id: string;
  name: string;
  phone: string;
  date: string;
  status: 'Called' | 'Pending' | 'Follow-up Required';
  notes: string;
}

const ClientListScreen = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const isDark = useColorScheme() === 'dark';

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients', { params: { search } });
      setClients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search]);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('clients:changed', () => {
      fetchClients();
    });

    return () => {
      socket.disconnect();
    };
  }, []);


  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClients();
    setRefreshing(false);
  };

  const handleComplete = async (id: string) => {
    try {
      await api.patch(`/clients/${id}/complete`);
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Client",
      "Are you sure you want to remove this client?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await api.delete(`/clients/${id}`);
              fetchClients();
            } catch (err) {
              Alert.alert("Error", "Failed to delete client");
            }
          }
        }
      ]
    );
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed': return { bg: colors.success + '20', text: colors.success };
      case 'Pending': return { bg: colors.warning + '20', text: colors.warning };
      case 'Called': return { bg: colors.primary + '20', text: colors.primary };
      case 'Follow-up Required': return { bg: colors.danger + '20', text: colors.danger };
      default: return { bg: colors.slate[100], text: colors.slate[600] };
    }
  };

  const renderClient = ({ item }: { item: Client }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <View style={[styles.clientCard, { backgroundColor: isDark ? colors.slate[900] : '#fff' }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.clientName, { color: isDark ? '#fff' : colors.slate[900] }]}>{item.name}</Text>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
              <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {item.status !== 'Completed' && (
              <TouchableOpacity 
                style={[styles.callButton, { backgroundColor: colors.primary }]} 
                onPress={() => handleComplete(item._id)}
              >
                <Check size={20} color="#fff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.callButton} 
              onPress={() => handleCall(item.phone)}
            >
              <Phone size={20} color="#fff" fill="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.infoRow}>
            <Phone size={14} color={colors.slate[400]} />
            <Text style={styles.infoText}>{item.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Calendar size={14} color={colors.slate[400]} />
            <Text style={styles.infoText}>
              {item.meetingDate ? new Date(item.meetingDate).toLocaleDateString() : 'No Meeting'}
            </Text>
          </View>
        </View>

        {item.businessType ? (
          <View style={[styles.infoRow, { marginBottom: 10 }]}>
            <Text style={[styles.infoText, { fontWeight: '700', color: colors.primary }]}>{item.businessType}</Text>
          </View>
        ) : null}

        {item.notes ? (
          <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>
        ) : null}

        <TouchableOpacity 
          style={styles.deleteAction} 
          onPress={() => handleDelete(item._id)}
        >
          <Trash2 size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.slate[950] : colors.slate[50] }]}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? colors.slate[900] : '#fff' }]}>
          <Search size={20} color={colors.slate[400]} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#fff' : colors.slate[900] }]}
            placeholder="Search clients..."
            placeholderTextColor={colors.slate[400]}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={[styles.filterBtn, { backgroundColor: isDark ? colors.slate[900] : '#fff' }]}>
          <Filter size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={clients}
        renderItem={renderClient}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No clients found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginTop: 10,
  },
  searchBar: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  clientCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  callButton: {
    backgroundColor: colors.success,
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardInfo: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: colors.slate[500],
  },
  notes: {
    fontSize: 14,
    color: colors.slate[400],
    fontStyle: 'italic',
    borderLeftWidth: 2,
    borderLeftColor: colors.slate[200],
    paddingLeft: 10,
  },
  deleteAction: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.slate[400],
    fontSize: 16,
  }
});

export default ClientListScreen;
