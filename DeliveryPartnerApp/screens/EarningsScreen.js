import React, { useState, useCallback } from 'react';
import {
  StyleSheet, View, Text, ScrollView,
  TouchableOpacity, FlatList, ActivityIndicator, RefreshControl
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../constants/Config';

export default function EarningsScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEarnings = async () => {
    try {
      const token = await AsyncStorage.getItem('deliveryToken');
      const response = await fetch(`${API_URL}/orders/delivery/my-earnings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await response.json();
      setData(json);
    } catch (e) {
      console.log('Error fetching earnings:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchEarnings();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEarnings();
  };

  // Compute bar chart heights from weekly data
  const getBarHeight = (amount, maxAmount) => {
    if (!maxAmount || maxAmount === 0) return 2;
    return Math.max(2, (amount / maxAmount) * 100);
  };

  const maxAmount = data?.weeklyData
    ? Math.max(...data.weeklyData.map(d => d.amount), 1)
    : 1;

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transLeft}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="moped" size={20} color="#2d3436" />
        </View>
        <View>
          <Text style={styles.transStore}>{item.store}</Text>
          <Text style={styles.transTime}>{item.date} · {item.time}</Text>
        </View>
      </View>
      <View style={styles.transRight}>
        <Text style={styles.transAmount}>+₹{item.amount}</Text>
        <Text style={styles.transStatus}>COMPLETED</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#9139BA" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>
        <TouchableOpacity style={styles.calendarBtn} onPress={onRefresh}>
          <MaterialCommunityIcons name="refresh" size={20} color="#9139BA" />
          <Text style={styles.calendarText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#9139BA']} />}
      >
        {/* TOTAL BALANCE CARD */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>TOTAL EARNINGS</Text>
          <Text style={styles.balanceAmount}>₹{(data?.totalEarnings || 0).toFixed(2)}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{(data?.todayEarnings || 0).toFixed(2)}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{(data?.weekEarnings || 0).toFixed(2)}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{data?.transactions?.length || 0}</Text>
              <Text style={styles.statLabel}>Deliveries</Text>
            </View>
          </View>
        </View>

        {/* WEEKLY CHART */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Weekly Overview</Text>
          <View style={styles.chartContainer}>
            {(data?.weeklyData || []).map((item, index) => (
              <View key={index} style={styles.barWrapper}>
                <Text style={styles.barAmount}>{item.amount > 0 ? `₹${item.amount}` : ''}</Text>
                <View
                  style={[
                    styles.bar,
                    { height: `${getBarHeight(item.amount, maxAmount)}%` },
                    item.amount === maxAmount && item.amount > 0 && styles.activeBar
                  ]}
                />
                <Text style={styles.barDay}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* RECENT ACTIVITY */}
        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.viewAll}>{data?.transactions?.length || 0} deliveries</Text>
        </View>

        {data?.transactions?.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="moped-outline" size={48} color="#dfe6e9" />
            <Text style={styles.emptyText}>No completed deliveries yet</Text>
          </View>
        ) : (
          <FlatList
            data={data?.transactions || []}
            renderItem={renderTransaction}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#2d3436' },
  calendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f0fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10
  },
  calendarText: { color: '#9139BA', fontWeight: 'bold', marginLeft: 5, fontSize: 13 },
  scrollContent: { paddingBottom: 100 },

  balanceCard: {
    margin: 20,
    padding: 25,
    backgroundColor: '#2d3436',
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10
  },
  balanceLabel: { color: '#b2bec3', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  balanceAmount: { color: '#fff', fontSize: 36, fontWeight: '900', marginVertical: 10 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '800' },
  statLabel: { color: '#b2bec3', fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.15)' },

  chartSection: { paddingHorizontal: 20, marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2d3436', marginBottom: 20 },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    backgroundColor: '#f8f9fa',
    padding: 15,
    paddingTop: 30,
    borderRadius: 20
  },
  barWrapper: { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' },
  barAmount: { fontSize: 8, color: '#9139BA', fontWeight: 'bold', marginBottom: 2 },
  bar: { width: 12, backgroundColor: '#dfe6e9', borderRadius: 6, marginBottom: 8 },
  activeBar: { backgroundColor: '#9139BA' },
  barDay: { fontSize: 10, color: '#b2bec3', fontWeight: 'bold' },

  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15
  },
  viewAll: { color: '#9139BA', fontWeight: 'bold', fontSize: 13 },

  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6'
  },
  transLeft: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  transStore: { fontSize: 15, fontWeight: '700', color: '#2d3436' },
  transTime: { fontSize: 12, color: '#b2bec3', marginTop: 2 },
  transRight: { alignItems: 'flex-end' },
  transAmount: { fontSize: 16, fontWeight: 'bold', color: '#2ecc71' },
  transStatus: { fontSize: 10, color: '#b2bec3', fontWeight: 'bold', textTransform: 'uppercase', marginTop: 2 },

  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#b2bec3', fontSize: 15, marginTop: 12, fontWeight: '600' },
});