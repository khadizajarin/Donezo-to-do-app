import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import * as Notifications from 'expo-notifications';

import RemindersScreen from './RemindersScreen';
import FocusScreen from './FocusScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const TABS = [
  { key: 'reminders', label: 'Reminders', emoji: '🌙' },
  { key: 'focus',     label: 'Focus',     emoji: '🛡️' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('reminders');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />

      {/* Top Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.75}
            >
              <Text style={styles.tabEmoji}>{tab.emoji}</Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Screen content */}
      <View style={styles.screenArea}>
        {activeTab === 'reminders' ? <RemindersScreen /> : <FocusScreen />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  screenArea: {
    flex: 1,
  },

  // Bottom tab bar
  tabBar: {
    marginTop: 40,
    flexDirection: 'row',
    backgroundColor: '#161624',
    borderTopWidth: 1,
    borderTopColor: '#1e1e30',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
  },
  tabEmoji: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.4,
  },
  tabLabelActive: {
    color: '#818cf8',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -10,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#818cf8',
  },
});