import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// --- Notification Handler ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: true,
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
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  };

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) setTasks(JSON.parse(storedTasks));
    } catch (error) { console.log(error); }
  };

  const saveTasks = async (newTasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (error) { console.log(error); }
  };

  const scheduleNotification = async (taskText, selectedTime) => {
    if (!selectedTime) return null;

    const now = new Date();
    let triggerDate = new Date(selectedTime);
    triggerDate.setSeconds(0);
    if (triggerDate <= now) triggerDate.setDate(triggerDate.getDate() + 1);

    const secondsUntilTrigger = Math.floor((triggerDate - now) / 1000);

    return await Notifications.scheduleNotificationAsync({
      content: { title: '📝 Task Reminder', body: taskText, sound: true },
      trigger: { seconds: secondsUntilTrigger, repeats: false },
    });
  };

  const addTask = async () => {
    if (!task.trim()) return;

    const notificationId = await scheduleNotification(task, time);

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
    if (taskToDelete?.notificationId)
      await Notifications.cancelScheduledNotificationAsync(taskToDelete.notificationId);

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
    if (selectedDays.includes(index)) setSelectedDays(selectedDays.filter((d) => d !== index));
    else setSelectedDays([...selectedDays, index]);
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case 'Daily': return { backgroundColor: '#ADD8E6' };
      case 'Today': return { backgroundColor: '#FFB6C1' };
      case 'Someday': return { backgroundColor: '#98FB98' };
      default: return { backgroundColor: '#d1d5db' };
    }
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.taskName}>{item.name}</Text>

        <View style={[styles.categoryTag, getCategoryStyle(item.category)]}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>

        {item.time && <Text style={styles.taskTime}>{formatTime(new Date(item.time))}</Text>}

        {item.category === 'Someday' && item.selectedDays && item.selectedDays.length > 0 && (
          <View style={styles.daysRow}>
            {item.selectedDays.map((d) => (
              <View key={d} style={styles.dayTag}>
                <Text style={styles.dayTagText}>{weekdays[d]}</Text>
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Task Reminder</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Enter task to remember "
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoryContainer}>
        {['Daily', 'Today', 'Someday'].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryButton, selectedCategory === cat && { backgroundColor: '#3b82f6' }]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={styles.categoryButtonText}>{cat}</Text>
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
              <Text style={styles.dayText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
        <Text style={styles.timeButtonText}>
          {time ? `Time: ${formatTime(time)}` : 'Pick a Time (optional)'}
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
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  addButton: { backgroundColor: '#3b82f6', paddingHorizontal:15, paddingVertical: 8, borderRadius: 10, marginLeft: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  categoryButton: { padding: 10, borderRadius: 6, backgroundColor: '#e5e7eb' },
  categoryButtonText: { fontSize: 14, color: '#000' },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10, justifyContent: 'center' },
  dayButton: { padding: 6, margin: 3, borderRadius: 6, backgroundColor: '#e5e7eb' },
  dayText: { fontWeight: 'bold', color: '#111827' },
  timeButton: { backgroundColor: '#e0e7ff', padding: 10, borderRadius: 6, alignItems: 'center', marginBottom: 10 },
  timeButtonText: { fontSize: 16 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', padding: 12, marginBottom: 8, borderRadius: 8 },
  taskName: { fontSize: 16, fontWeight: '500' },
  taskTime: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  daysRow: { flexDirection: 'row', marginTop: 4, flexWrap: 'wrap' },
  dayTag: { backgroundColor: '#d1d5db', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 4, marginBottom: 4 },
  dayTagText: { fontSize: 12, fontWeight: 'bold' },
  categoryTag: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, marginTop: 4, alignSelf: 'flex-start' },
  categoryText: { fontSize: 12, color: '#000', fontWeight: 'bold' },
  deleteButton: { marginLeft: 10, backgroundColor: '#f87171', padding: 6, borderRadius: 6 },
  deleteButtonText: { color: '#fff', fontWeight: 'bold' },
});
