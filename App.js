import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// --- Notification Handler ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // ✅ replaces shouldShowAlert
    shouldShowList: true,   // ✅ adds to show in notification list
    shouldPlaySound: true,
    shouldSetBadge: false
  }),
});

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [time, setTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Today');
  const [selectedDays, setSelectedDays] = useState([]);

  useEffect(() => {
    loadTasks();
    registerForPushNotifications();
  }, []);

  const registerForPushNotifications = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') alert('Permission for notifications not granted!');

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
      sound: true,
      vibrationPattern: [0, 250, 250, 250], // optional
      lightColor: '#FF231F7C', // optional
    });
  }
};


  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) setTasks(JSON.parse(storedTasks));
    } catch (error) {
      console.log(error);
    }
  };

  const saveTasks = async (newTasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (error) {
      console.log(error);
    }
  };

  const scheduleNotification = async (taskText, selectedTime, category, selectedDays) => {
    if (!selectedTime) return null;

    const now = new Date();
    let triggerDate = new Date(selectedTime);
    triggerDate.setSeconds(0);

    if (triggerDate <= now) triggerDate.setDate(triggerDate.getDate() + 1);

    if (category === "Every Day") {
      return await Notifications.scheduleNotificationAsync({
        content: { title: '☀️ Hey there!',  body: taskText, sound: true },
        trigger: { hour: triggerDate.getHours(), minute: triggerDate.getMinutes(), repeats: true }
      });
    }

    if (category === "Today") {
      return await Notifications.scheduleNotificationAsync({
        content: { title: '🪴 Don’t forget, friend!',  body: taskText, sound: true },
        trigger: triggerDate
      });
    }

    if (category === "Someday" && selectedDays.length > 0) {
      let ids = [];
      for (let dayIndex of selectedDays) {
        const id = await Notifications.scheduleNotificationAsync({
          content: { title: '✨ Time for this!',  body: taskText, sound: true },
          trigger: { weekday: dayIndex + 1, hour: triggerDate.getHours(), minute: triggerDate.getMinutes(), repeats: true }
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
      time,
      category: selectedCategory,
      selectedDays: selectedCategory === 'Someday' ? selectedDays : [],
      notificationId,
    };

    const updatedTasks = [...(tasks || []), newTask];
    await saveTasks(updatedTasks);

    setTask('');
    setTime(null);
    setSelectedDays([]);
  };

  const deleteTask = async (id) => {
    const taskToDelete = tasks.find((t) => t.id === id);

    if (taskToDelete?.notificationId) {
      if (Array.isArray(taskToDelete.notificationId)) {
        for (let notifId of taskToDelete.notificationId) {
          await Notifications.cancelScheduledNotificationAsync(notifId);
        }
      } else {
        await Notifications.cancelScheduledNotificationAsync(taskToDelete.notificationId);
      }
    }

    const updatedTasks = (tasks || []).filter((t) => t.id !== id);
    await saveTasks(updatedTasks);
  };

  const formatTime = (date) => {
    if (!date) return '';
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  const toggleDay = (index) => {
    if (selectedDays.includes(index)) {
      setSelectedDays(selectedDays.filter((d) => d !== index));
    } else {
      setSelectedDays([...selectedDays, index]);
    }
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case 'Every Day': return { backgroundColor: '#2563eb', textColor: '#ffffff' };
      case 'Today': return { backgroundColor: '#10b981', textColor: '#ffffff' };
      case 'Someday': return { backgroundColor: '#facc15', textColor: '#000000' };
      default: return { backgroundColor: '#6b7280', textColor: '#ffffff' };
    }
  };

  const renderTask = ({ item }) => {
    const categoryStyle = getCategoryStyle(item.category);
    return (
      <View style={styles.taskCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.taskName}>{item.name}</Text>

          <View style={styles.tagTimeRow}>
            <View style={[styles.categoryTag, { backgroundColor: categoryStyle.backgroundColor }]}>
              <Text style={[styles.categoryText, { color: categoryStyle.textColor }]}>{item.category}</Text>
            </View>
            {item.time && <Text style={styles.taskTime}>{formatTime(new Date(item.time))}</Text>}
          </View>

          {item.category === 'Someday' && item.selectedDays && item.selectedDays.length > 0 && (
            <View style={styles.daysRow}>
              {item.selectedDays.map((d) => (
                <View key={d} style={[styles.dayTag, { backgroundColor: '#374151' }]}>
                  <Text style={[styles.dayTagText, { color: '#ffffff' }]}>{weekdays[d]}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTask(item.id)}>
          <Text style={styles.deleteButtonText}>🗑</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🌙 My Cozy Reminders</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="What would you like to remember today?"
          placeholderTextColor="#d1d5db"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoryContainer}>
        {['Every Day', 'Today', 'Someday'].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryButton, selectedCategory === cat && { backgroundColor: '#3b82f6' }]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.categoryButtonText, selectedCategory === cat && { color: '#ffffff' }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedCategory === 'Someday' && (
        <View style={styles.daysContainer}>
          {weekdays.map((day, index) => (
            <TouchableOpacity
              key={day}
              style={[styles.dayButton, selectedDays.includes(index) && { backgroundColor: '#3b82f6' }]}
              onPress={() => toggleDay(index)}
            >
              <Text style={[styles.dayText, selectedDays.includes(index) && { color: '#ffffff' }]}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
        <Text style={styles.timeButtonText}>
          {time ? `Reminder set for: ${formatTime(time)}` : 'Pick a time to gently remind yourself (optional)'}
        </Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={time || new Date()}
          mode="time"
          onChange={(event, selectedDate) => {
            setShowTimePicker(false);
            if (selectedDate) setTime(selectedDate);
          }}
        />
      )}

      {tasks && tasks.length > 0 && (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          style={{ marginTop: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#1f2937' },
  header: { fontSize: 30, fontWeight: 'bold', marginTop: 50, marginBottom: 25, color: '#f3f4f6', textAlign: 'center' },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, width: '100%' },
  input: { flex: 1, borderWidth: 1, borderColor: '#374151', borderRadius: 15, padding: 14, backgroundColor: '#374151', fontSize: 16, color: '#f3f4f6' },
  addButton: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 15, marginLeft: 10, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 24 },
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  categoryButton: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: '#374151' },
  categoryButtonText: { fontSize: 15, fontWeight: '600', color: '#d1d5db' },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, justifyContent: 'center' },
  dayButton: { padding: 8, margin: 4, borderRadius: 10, backgroundColor: '#374151' },
  dayText: { fontWeight: '600', color: '#d1d5db' },
  timeButton: { backgroundColor: '#2563eb', padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  timeButtonText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#374151', padding: 16, marginBottom: 12, borderRadius: 15, elevation: 3 },
  taskName: { fontSize: 16, fontWeight: '700', color: '#f3f4f6' },
  tagTimeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
  taskTime: { fontSize: 14, color: '#d1d5db', fontWeight: '500' },
  daysRow: { flexDirection: 'row', marginTop: 8, flexWrap: 'wrap' },
  dayTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginRight: 6, marginBottom: 6 },
  dayTagText: { fontSize: 12, fontWeight: '700' },
  categoryTag: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8 },
  categoryText: { fontSize: 13, fontWeight: '700' },
  deleteButton: { marginLeft: 12, backgroundColor: '#f87171', padding: 10, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  deleteButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
});
