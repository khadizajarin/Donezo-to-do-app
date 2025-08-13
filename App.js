

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Load tasks from storage on mount
  useEffect(() => {
    loadTasks();
    registerForPushNotifications();
  }, []);

  // Save tasks whenever tasks array changes
  useEffect(() => {
    saveTasks();
  }, [tasks]);

  async function registerForPushNotifications() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission for notifications not granted!');
    }
  }

  // Schedule daily repeating notification
  const scheduleNotification = async (taskText, selectedTime) => {
    const now = new Date();
    let triggerDate = new Date(selectedTime);
    triggerDate.setSeconds(0);

    if (triggerDate <= now) triggerDate.setDate(triggerDate.getDate() + 1);

    const secondsUntilTrigger = Math.floor((triggerDate - now) / 1000);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📝 Daily To-Do Reminder',
        body: taskText,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        seconds: secondsUntilTrigger,
        repeats: true, // daily repeat
      },
    });

    return notificationId;
  };

  // Add task
  const addTask = async () => {
    if (!task.trim()) return;

    const notificationId = await scheduleNotification(task, time);

    const newTask = {
      id: Date.now().toString(),
      text: task,
      completed: false,
      time: time,
      notificationId,
    };

    setTasks(prev => [...prev, newTask]); // functional update
    setTask('');
  };

  // Toggle task complete
  const toggleTask = (id) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // Delete task
  const deleteTask = async (id) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (taskToDelete?.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(taskToDelete.notificationId);
    }
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Save tasks to AsyncStorage
  const saveTasks = async () => {
    try {
      const tasksToSave = tasks.map(t => ({ ...t, time: t.time.toISOString() }));
      await AsyncStorage.setItem('TASKS', JSON.stringify(tasksToSave));
    } catch (e) {
      console.log('Error saving tasks:', e);
    }
  };

  // Load tasks from AsyncStorage
  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('TASKS');
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks).map(t => ({
          ...t,
          time: new Date(t.time),
        }));
        setTasks(parsedTasks);
      }
    } catch (e) {
      console.log('Error loading tasks:', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 Roza's Daily To-Do</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          placeholderTextColor="#aaa"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.addButtonText}>⏰</Text>
        </TouchableOpacity>
      </View>

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) setTime(selectedTime);
            addTask();
          }}
        />
      )}

      <FlatList
        style={{ width: '100%' }}
        data={tasks}
        keyExtractor={(item) => item.id}
        extraData={tasks} // ensures FlatList refreshes
        renderItem={({ item }) => (
          <View style={[styles.taskContainer, item.completed && styles.taskContainerCompleted]}>
            <TouchableOpacity
              style={styles.taskTextContainer}
              onPress={() => toggleTask(item.id)}
            >
              <Text
                style={[
                  styles.taskText,
                  item.completed && styles.taskTextCompleted
                ]}
              >
                {item.text} ⏰ {item.time.getHours()}:{item.time.getMinutes()<10?'0'+item.time.getMinutes():item.time.getMinutes()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteTask(item.id)}
            >
              <Text style={styles.deleteButtonText}>🗑</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <StatusBar style="auto" />
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    width: '100%',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  addButton: {
    backgroundColor: '#60a5fa',
    marginLeft: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  taskContainerCompleted: {
    backgroundColor: '#e0e7ff',
  },
  taskTextContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#111827',
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  deleteButton: {
    marginLeft: 12,
    backgroundColor: '#f87171',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
