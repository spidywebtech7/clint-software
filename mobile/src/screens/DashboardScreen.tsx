import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  RefreshControl,
  Dimensions,
  useColorScheme 
} from 'react-native';
import { Users, PhoneOutgoing, Clock, AlertCircle } from 'lucide-react-native';
import api from '../api/api';
import { colors } from '../theme/colors';
import { BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const [stats, setStats] = useState({ total: 0, called: 0, pending: 0, followUp: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const isDark = useColorScheme() === 'dark';

  const fetchStats = async () => {
    try {
      const res = await api.get('/clients/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total', value: stats.total, icon: Users, color: '#3b82f6' },
    { label: 'Called', value: stats.called, icon: PhoneOutgoing, color: colors.success },
    { label: 'Pending', value: stats.pending, icon: Clock, color: colors.warning },
    { label: 'Follow-ups', value: stats.followUp, icon: AlertCircle, color: colors.danger },
  ];

  const chartData = {
    labels: ['Called', 'Pending', 'Follow'],
    datasets: [{
      data: [stats.called, stats.pending, stats.followUp]
    }]
  };

  const textColor = isDark ? '#fff' : colors.slate[900];
  const cardBg = isDark ? colors.slate[900] : '#fff';

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDark ? colors.slate[950] : colors.slate[50] }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: textColor }]}>Dashboard</Text>
        <Text style={styles.date}>{new Date().toDateString()}</Text>
      </View>

      <View style={styles.grid}>
        {statCards.map((card, idx) => (
          <View key={card.label} style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={[styles.iconContainer, { backgroundColor: card.color + '20' }]}>
              <card.icon size={24} color={card.color} />
            </View>
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={styles.cardLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.chartContainer, { backgroundColor: cardBg }]}>
        <Text style={[styles.chartTitle, { color: textColor }]}>Call Distribution</Text>
        <BarChart
          data={chartData}
          width={width - 48}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: cardBg,
            backgroundGradientFrom: cardBg,
            backgroundGradientTo: cardBg,
            decimalPlaces: 0,
            color: (opacity = 1) => isDark ? `rgba(99, 102, 241, ${opacity})` : `rgba(79, 70, 229, ${opacity})`,
            labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 16 },
            propsForBackgroundLines: { strokeDasharray: "" },
          }}
          verticalLabelRotation={0}
          style={styles.chart}
          fromZero
          showBarTops={false}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    marginTop: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
  },
  date: {
    fontSize: 14,
    color: colors.slate[500],
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.slate[900],
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 12,
    color: colors.slate[500],
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartContainer: {
    padding: 24,
    borderRadius: 32,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default DashboardScreen;
