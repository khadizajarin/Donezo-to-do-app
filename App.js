import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  StatusBar,
  Animated,
  Alert,
  Linking,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CATEGORIES = [
  { label: 'Every Day', emoji: '🔁', color: '#818cf8', bg: '#1e1b4b' },
  { label: 'Today', emoji: '⚡', color: '#34d399', bg: '#064e3b' },
  { label: 'Someday', emoji: '🌸', color: '#f472b6', bg: '#500724' },
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function formatTime(raw) {
  if (!raw) return '';
  const d = typeof raw === 'string' ? new Date(raw) : raw;
  let h = d.getHours(), m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m < 10 ? '0' + m : m} ${ampm}`;
}

function TaskCard({ item, onDelete }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const cat = CATEGORIES.find((c) => c.label === item.category) || CATEGORIES[0];

  return (
    <Animated.View style={[styles.taskCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.taskAccentBar, { backgroundColor: cat.color }]} />
      <View style={{ flex: 1, paddingLeft: 14 }}>
        <Text style={styles.taskName}>{item.name}</Text>
        <View style={styles.tagRow}>
          <View style={[styles.catPill, { backgroundColor: cat.bg, borderColor: cat.color + '55' }]}>
            <Text style={[styles.catPillText, { color: cat.color }]}>{cat.emoji} {item.category}</Text>
          </View>
          {item.time && (
            <View style={styles.timePill}>
              <Text style={styles.timePillText}>🕐 {formatTime(item.time)}</Text>
            </View>
          )}
        </View>
        {item.category === 'Someday' && item.selectedDays?.length > 0 && (
          <View style={styles.daysRow}>
            {item.selectedDays.map((d) => (
              <View key={d} style={[styles.miniDay, { borderColor: cat.color + '66' }]}>
                <Text style={[styles.miniDayText, { color: cat.color }]}>{weekdays[d]}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id)} activeOpacity={0.7}>
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [time, setTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Today');
  const [selectedDays, setSelectedDays] = useState([]);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadTasks();
    registerForPushNotifications();
    Animated.timing(headerAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, []);

  const registerForPushNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Daily Reminders',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        enableLights: true,
        enableVibrate: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }
  };

  // Battery optimization prompt - shows ONLY ONCE
  const showBatteryOptimizationPrompt = async () => {
    if (Platform.OS !== 'android') return;

    try {
      const hasSeenPrompt = await AsyncStorage.getItem('hasSeenBatteryPrompt');
      if (hasSeenPrompt === 'true') return;

      Alert.alert(
        "Important for Daily Reminders",
        "For 'Every Day' reminders to appear at the exact time every day, please disable battery optimization for Donezo.\n\n" +
        "Go to: Settings → Apps → Donezo → Battery → Unrestricted",
        [
          { text: "Later" },
          {
            text: "Open Settings",
            onPress: async () => {
              await AsyncStorage.setItem('hasSeenBatteryPrompt', 'true');
              Linking.openSettings();
            },
          },
        ]
      );

      // Mark as seen even if "Later" is pressed
      await AsyncStorage.setItem('hasSeenBatteryPrompt', 'true');
    } catch (e) {
      console.log("Battery prompt error:", e);
    }
  };

  const loadTasks = async () => {
    try {
      const s = await AsyncStorage.getItem('tasks');
      if (s) setTasks(JSON.parse(s));
    } catch (e) {
      console.log(e);
    }
  };

  const saveTasks = async (t) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(t));
      setTasks(t);
    } catch (e) {
      console.log(e);
    }
  };

  const scheduleNotification = async (text, t, category, days) => {
    if (!t) return null;

    const triggerTime = new Date(t);
    triggerTime.setSeconds(0);
    triggerTime.setMilliseconds(0);

    const hours = triggerTime.getHours();
    const minutes = triggerTime.getMinutes();
    const now = new Date();

    if (category === 'Every Day') {
      return await Notifications.scheduleNotificationAsync({
        content: {
          title: '☀️ Hey there!',
          body: text,
          sound: 'default',
          priority: 'high',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });
    }

    if (category === 'Today') {
      let triggerDate = new Date(triggerTime);
      if (triggerDate <= now) {
        triggerDate.setDate(triggerDate.getDate() + 1);
      }

      return await Notifications.scheduleNotificationAsync({
        content: {
          title: "🪴 Don't forget!",
          body: text,
          sound: 'default',
          priority: 'high',
        },
        trigger: { date: triggerDate.getTime() },
      });
    }

    if (category === 'Someday' && days.length > 0) {
      const ids = [];
      for (const d of days) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: '✨ Time for this!',
            body: text,
            sound: 'default',
            priority: 'high',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: d + 1,
            hour: hours,
            minute: minutes,
            repeats: true,
          },
        });
        ids.push(id);
      }
      return ids;
    }

    return null;
  };

  const addTask = async () => {
    if (!task.trim()) return;

    const notificationId = time
      ? await scheduleNotification(task, time, selectedCategory, selectedDays)
      : null;

    const newTask = {
      id: Date.now().toString(),
      name: task,
      time: time ? time.toISOString() : null,
      category: selectedCategory,
      selectedDays: selectedCategory === 'Someday' ? selectedDays : [],
      notificationId,
    };

    await saveTasks([...(tasks || []), newTask]);

    // Show battery prompt only once when user adds "Every Day" task with time
    if (selectedCategory === 'Every Day' && time) {
      setTimeout(showBatteryOptimizationPrompt, 800);
    }

    setTask('');
    setTime(null);
    setSelectedDays([]);
  };

  const deleteTask = async (id) => {
    const t = tasks.find((x) => x.id === id);
    if (t?.notificationId) {
      const ids = Array.isArray(t.notificationId) ? t.notificationId : [t.notificationId];
      for (const nid of ids) {
        await Notifications.cancelScheduledNotificationAsync(nid);
      }
    }
    await saveTasks(tasks.filter((x) => x.id !== id));
  };

  const toggleDay = (i) =>
    setSelectedDays((prev) =>
      prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i]
    );

  const activeCat = CATEGORIES.find((c) => c.label === selectedCategory);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />

      {/* Header */}
      <Animated.View style={[
        styles.header,
        {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        },
      ]}>
        <Text style={styles.headerEmoji}>🌙</Text>
        <Text style={styles.headerTitle}>Donezo</Text>
        <Text style={styles.headerSub}>your cozy reminder space</Text>
      </Animated.View>

      {/* Input Row */}
      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="What to remember today?"
          placeholderTextColor="#3d3d52"
          value={task}
          onChangeText={setTask}
          onSubmitEditing={addTask}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: activeCat.color }]}
          onPress={addTask}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <View style={styles.catRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.label}
            style={[
              styles.catBtn,
              selectedCategory === cat.label && {
                backgroundColor: cat.bg,
                borderColor: cat.color,
              },
            ]}
            onPress={() => setSelectedCategory(cat.label)}
            activeOpacity={0.75}
          >
            <Text style={[
              styles.catBtnText,
              selectedCategory === cat.label && { color: cat.color },
            ]}>
              {cat.emoji} {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Weekday Picker */}
      {selectedCategory === 'Someday' && (
        <View style={styles.weekRow}>
          {weekdays.map((day, i) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.weekBtn,
                selectedDays.includes(i) && { backgroundColor: '#500724', borderColor: '#f472b6' },
              ]}
              onPress={() => toggleDay(i)}
              activeOpacity={0.75}
            >
              <Text style={[
                styles.weekBtnText,
                selectedDays.includes(i) && { color: '#f472b6' },
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Time Button */}
      <TouchableOpacity
        style={[styles.timeBtn, time && { borderColor: activeCat.color + '88' }]}
        onPress={() => setShowTimePicker(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.timeBtnIcon}>⏰</Text>
        <Text style={[styles.timeBtnText, time && { color: activeCat.color }]}>
          {time ? `Reminder at ${formatTime(time)}` : 'Set a reminder time (optional)'}
        </Text>
        {time && (
          <TouchableOpacity onPress={() => setTime(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ color: '#475569', fontSize: 15 }}>✕</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={time || new Date()}
          mode="time"
          onChange={(_, d) => {
            setShowTimePicker(false);
            if (d) setTime(d);
          }}
        />
      )}

      {/* Divider */}
      {tasks.length > 0 && (
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>{tasks.length} reminder{tasks.length !== 1 ? 's' : ''}</Text>
          <View style={styles.divider} />
        </View>
      )}

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TaskCard item={item} onDelete={deleteTask} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>✨</Text>
            <Text style={styles.emptyText}>Nothing here yet.{'\n'}Add your first reminder!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 54,
  },

  header: { alignItems: 'center', marginBottom: 26 },
  headerEmoji: { fontSize: 38, marginBottom: 4 },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#f1f5f9',
    letterSpacing: -1,
  },
  headerSub: {
    fontSize: 13,
    color: '#334155',
    marginTop: 3,
    letterSpacing: 0.4,
  },

  inputCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  input: {
    flex: 1,
    backgroundColor: '#161624',
    borderWidth: 1,
    borderColor: '#1e1e30',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 15,
    color: '#e2e8f0',
  },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { fontSize: 30, fontWeight: '300', color: '#fff', lineHeight: 34 },

  catRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  catBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#1e1e30',
    backgroundColor: '#161624',
    alignItems: 'center',
  },
  catBtnText: { fontSize: 12, fontWeight: '700', color: '#334155' },

  weekRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  weekBtn: {
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e1e30',
    backgroundColor: '#161624',
  },
  weekBtnText: { fontSize: 12, fontWeight: '700', color: '#334155' },

  timeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161624',
    borderWidth: 1,
    borderColor: '#1e1e30',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 20,
    gap: 10,
  },
  timeBtnIcon: { fontSize: 16 },
  timeBtnText: { flex: 1, fontSize: 14, fontWeight: '500', color: '#334155' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  divider: { flex: 1, height: 1, backgroundColor: '#161624' },
  dividerText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161624',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e1e30',
    marginBottom: 10,
    overflow: 'hidden',
    paddingVertical: 14,
    paddingRight: 14,
  },
  taskAccentBar: {
    width: 4,
    alignSelf: 'stretch',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  taskName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  catPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  catPillText: { fontSize: 12, fontWeight: '700' },
  timePill: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timePillText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  daysRow: { flexDirection: 'row', marginTop: 8, gap: 5, flexWrap: 'wrap' },
  miniDay: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  miniDayText: { fontSize: 11, fontWeight: '700' },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#2d1b1b',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  deleteBtnText: { color: '#f87171', fontSize: 12, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyText: {
    fontSize: 15,
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
});