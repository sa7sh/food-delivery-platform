import React from 'react';
import {
  StyleSheet, View, Text, ScrollView,
  TouchableOpacity, Dimensions, FlatList
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');

export default function EarningsScreen() {
  const weeklyData = [
    { day: 'Mon', amount: 450, height: 40 },
    { day: 'Tue', amount: 620, height: 60 },
    { day: 'Wed', amount: 300, height: 30 },
    { day: 'Thu', amount: 840, height: 85 },
    { day: 'Fri', amount: 500, height: 50 },
    { day: 'Sat', amount: 0, height: 2 }, // Current day or empty
    { day: 'Sun', amount: 0, height: 2 },
  ];

  const transactions = [
    { id: '1', store: 'Biryani by Kilo', time: '12:45 PM', amount: '65.00', status: 'Completed' },
    { id: '2', store: "McDonald's", time: '11:20 AM', amount: '42.00', status: 'Completed' },
    { id: '3', store: 'Starbucks', time: '09:15 AM', amount: '55.50', status: 'Completed' },
    { id: '4', store: 'KFC', time: 'Yesterday', amount: '82.00', status: 'Completed' },
  ];

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transLeft}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="moped" size={20} color="#2d3436" />
        </View>
        <View>
          <Text style={styles.transStore}>{item.store}</Text>
          <Text style={styles.transTime}>{item.time}</Text>
        </View>
      </View>
      <View style={styles.transRight}>
        <Text style={styles.transAmount}>+₹{item.amount}</Text>
        <Text style={styles.transStatus}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>
        <TouchableOpacity style={styles.calendarBtn}>
          <MaterialCommunityIcons name="calendar-month" size={20} color="#9139BA" />
          <Text style={styles.calendarText}>This Week</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* TOTAL BALANCE CARD */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>WITHDRAWABLE BALANCE</Text>
          <Text style={styles.balanceAmount}>₹2,450.00</Text>
          <TouchableOpacity style={styles.withdrawBtn}>
            <Text style={styles.withdrawText}>Withdraw to Bank</Text>
          </TouchableOpacity>
        </View>

        {/* WEEKLY CHART */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Weekly Overview</Text>
          <View style={styles.chartContainer}>
            {weeklyData.map((item, index) => (
              <View key={index} style={styles.barWrapper}>
                <View style={[styles.bar, { height: item.height + '%' }, item.amount > 800 && styles.activeBar]} />
                <Text style={styles.barDay}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* RECENT ACTIVITY */}
        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
        </View>

        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={item => item.id}
          scrollEnabled={false} // Since it's inside a ScrollView
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  withdrawBtn: {
    backgroundColor: '#9139BA',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10
  },
  withdrawText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  chartSection: { paddingHorizontal: 20, marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2d3436', marginBottom: 20 },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 20
  },
  barWrapper: { alignItems: 'center', flex: 1 },
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
  transStatus: { fontSize: 10, color: '#b2bec3', fontWeight: 'bold', textTransform: 'uppercase', marginTop: 2 }
});