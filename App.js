// import React, { useState, useEffect } from 'react';
// import { StatusBar } from 'expo-status-bar';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Platform,
//   ScrollView,
// } from 'react-native';
// import * as Notifications from 'expo-notifications';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // --- Notification Handler ---
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowBanner: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//     shouldShowList: true,
//   }),
// });

// // Weekday mapping
// const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// export default function App() {
//   const [task, setTask] = useState('');
//   const [tasks, setTasks] = useState([]);
//   const [time, setTime] = useState(new Date());
//   const [showTimePicker, setShowTimePicker] = useState(false);
//   const [reminderType, setReminderType] = useState('today'); // today / daily / someDays
//   const [selectedDays, setSelectedDays] = useState([]); // for someDays

//   useEffect(() => {
//     loadTasks();
//     registerForPushNotifications();
//   }, []);

//   useEffect(() => {
//     saveTasks();
//   }, [tasks]);

//   async function registerForPushNotifications() {
//     if (Platform.OS === 'android') {
//       await Notifications.setNotificationChannelAsync('default', {
//         name: 'default',
//         importance: Notifications.AndroidImportance.DEFAULT,
//       });
//     }

//     const { status } = await Notifications.requestPermissionsAsync();
//     if (status !== 'granted') {
//       alert('Permission for notifications not granted!');
//     }
//   }

//   const getTaskColor = (type) => {
//     if(type==='today') return '#60a5fa'; // blue
//     else if(type==='daily') return '#34d399'; // green
//     else return '#fbbf24'; // yellow for someDays
//   };

//   const scheduleNotification = async (taskText, selectedTime, type, days=[]) => {
//     const now = new Date();
//     let triggerDate = new Date(selectedTime);
//     triggerDate.setSeconds(0);

//     if(type==='today' && triggerDate<=now){
//       triggerDate.setDate(triggerDate.getDate()+1);
//     }

//     if(type==='daily' && triggerDate<=now){
//       triggerDate.setDate(triggerDate.getDate()+1);
//     }

//     const secondsUntilTrigger = Math.floor((triggerDate - now)/1000);

//     const notificationId = await Notifications.scheduleNotificationAsync({
//       content:{
//         title:'📝 Daily To-Do Reminder',
//         body:taskText,
//         sound:true,
//         priority: Notifications.AndroidNotificationPriority.HIGH,
//       },
//       trigger:{
//         seconds:secondsUntilTrigger,
//         repeats: type!=='today', // daily or someDays repeats
//       }
//     });

//     return notificationId;
//   };

//   const addTask = async () => {
//     if(!task.trim()) return;

//     const notificationId = await scheduleNotification(task, time, reminderType, selectedDays);

//     const newTask = {
//       id: Date.now().toString(),
//       text: task,
//       completed: false,
//       time: time,
//       reminderType,
//       selectedDays,
//       notificationId,
//     };

//     setTasks(prev => [...prev,newTask]);
//     setTask('');
//     setReminderType('today');
//     setSelectedDays([]);
//   };

//   const toggleTask = (id) => {
//     setTasks(prev =>
//       prev.map(t => (t.id===id? {...t, completed:!t.completed} : t))
//     );
//   };

//   const deleteTask = async (id) => {
//     const taskToDelete = tasks.find(t => t.id===id);
//     if(taskToDelete?.notificationId){
//       await Notifications.cancelScheduledNotificationAsync(taskToDelete.notificationId);
//     }
//     setTasks(prev => prev.filter(t => t.id!==id));
//   };

//   const saveTasks = async () => {
//     try{
//       const tasksToSave = tasks.map(t=>({...t, time:t.time.toISOString()}));
//       await AsyncStorage.setItem('TASKS', JSON.stringify(tasksToSave));
//     } catch(e){
//       console.log('Error saving tasks:', e);
//     }
//   };

//   const loadTasks = async () => {
//     try{
//       const savedTasks = await AsyncStorage.getItem('TASKS');
//       if(savedTasks){
//         const parsed = JSON.parse(savedTasks).map(t=>({...t, time:new Date(t.time)}));
//         setTasks(parsed);
//       }
//     } catch(e){
//       console.log('Error loading tasks:', e);
//     }
//   };

//   const toggleDay = (index) => {
//     if(selectedDays.includes(index)){
//       setSelectedDays(selectedDays.filter(d=>d!==index));
//     } else {
//       setSelectedDays([...selectedDays,index]);
//     }
//   };

//   return (
//     <ScrollView style={{flex:1,backgroundColor:'#f0f4f8'}}>
//       <View style={styles.container}>
//         <Text style={styles.title}>📝 Roza's Daily To-Do</Text>


//         {/* Reminder type selector */}
//         <View style={styles.reminderContainer}>
//           <TouchableOpacity style={[styles.reminderButton, reminderType==='today' && {backgroundColor:'#60a5fa'}]} onPress={()=>setReminderType('today')}>
//             <Text style={styles.reminderText}>Today</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={[styles.reminderButton, reminderType==='daily' && {backgroundColor:'#34d399'}]} onPress={()=>setReminderType('daily')}>
//             <Text style={styles.reminderText}>Daily</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={[styles.reminderButton, reminderType==='someDays' && {backgroundColor:'#fbbf24'}]} onPress={()=>setReminderType('someDays')}>
//             <Text style={styles.reminderText}>Some Days</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Task input */}
//         <View style={styles.inputContainer}>
//           <TextInput
//             style={styles.input}
//             placeholder="Add a new task..."
//             placeholderTextColor="#aaa"
//             value={task}
//             onChangeText={setTask}
//           />
//           <TouchableOpacity style={styles.addButton} onPress={()=>setShowTimePicker(true)}>
//             <Text style={styles.addButtonText}>⏰</Text>
//           </TouchableOpacity>
//         </View>


//         {/* Weekday selector if someDays */}
//         {reminderType==='someDays' && (
//           <View style={styles.daysContainer}>
//             {weekdays.map((day,index)=>(
//               <TouchableOpacity key={day} style={[styles.dayButton, selectedDays.includes(index) && {backgroundColor:'#fbbf24'}]} onPress={()=>toggleDay(index)}>
//                 <Text style={styles.dayText}>{day}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}

//         {/* Time picker */}
//         {showTimePicker && (
//           <DateTimePicker
//             value={time}
//             mode="time"
//             is24Hour
//             display="default"
//             onChange={(event, selectedTime)=>{
//               setShowTimePicker(false);
//               if(selectedTime) setTime(selectedTime);
//               addTask();
//             }}
//           />
//         )}

//         {/* Task List */}
//         <FlatList
//           style={{width:'100%'}}
//           data={tasks}
//           keyExtractor={item=>item.id}
//           extraData={tasks}
//           renderItem={({item})=>{
//             let tagText = '';
//             if(item.reminderType==='today') tagText='Today';
//             else if(item.reminderType==='daily') tagText='Daily';
//             else if(item.reminderType==='someDays'){
//               tagText = item.selectedDays.map(d=>weekdays[d]).join(', ');
//             }
//             return (
//               <View style={[styles.taskContainer]}>
//                 <View style={{flex:1}}>
//                   <TouchableOpacity style={styles.taskTextContainer} onPress={()=>toggleTask(item.id)}>
//                     <Text style={[styles.taskText, item.completed && styles.taskTextCompleted]}>
//                       {item.text} ⏰ {item.time.getHours()}:{item.time.getMinutes()<10?'0'+item.time.getMinutes():item.time.getMinutes()}
//                     </Text>
//                   </TouchableOpacity>
//                   <View style={[styles.tag, {backgroundColor:getTaskColor(item.reminderType)}]}>
//                     <Text style={styles.tagText}>{tagText}</Text>
//                   </View>
//                 </View>
//                 <TouchableOpacity style={styles.deleteButton} onPress={()=>deleteTask(item.id)}>
//                   <Text style={styles.deleteButtonText}>🗑</Text>
//                 </TouchableOpacity>
//               </View>
//             )
//           }}
//         />

//         <StatusBar style="auto" />
//       </View>
//     </ScrollView>
//   );
// }

// // --- Styles ---
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     paddingTop: 60,
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontSize:26,
//     fontWeight:'bold',
//     marginBottom:20,
//     color:'#374151',
//   },
//   inputContainer:{
//     flexDirection:'row',
//     marginBottom:10,
//     width:'100%',
//   },
//   input:{
//     flex:1,
//     backgroundColor:'#fff',
//     padding:14,
//     borderRadius:12,
//     borderWidth:1,
//     borderColor:'#e0e0e0',
//     shadowColor:"#000",
//     shadowOffset:{width:0,height:2},
//     shadowOpacity:0.05,
//     shadowRadius:3,
//     elevation:2,
//   },
//   addButton:{
//     backgroundColor:'#60a5fa',
//     marginLeft:10,
//     paddingHorizontal:18,
//     borderRadius:12,
//     justifyContent:'center',
//     alignItems:'center',
//     shadowColor:"#000",
//     shadowOffset:{width:0,height:3},
//     shadowOpacity:0.15,
//     shadowRadius:3,
//     elevation:3,
//   },
//   addButtonText:{
//     fontSize:24,
//     color:'#fff',
//     fontWeight:'bold',
//   },
//   reminderContainer:{
//     flexDirection:'row',
//     marginBottom:10,
//     justifyContent:'space-between',
//     width:'100%',
//   },
//   reminderButton:{
//     flex:1,
//     padding:10,
//     marginHorizontal:2,
//     borderRadius:10,
//     backgroundColor:'#e5e7eb',
//     alignItems:'center',
//   },
//   reminderText:{
//     fontWeight:'bold',
//     color:'#111827'
//   },
//   daysContainer:{
//     flexDirection:'row',
//     flexWrap:'wrap',
//     marginBottom:10,
//     justifyContent:'center'
//   },
//   dayButton:{
//     padding:6,
//     margin:3,
//     borderRadius:6,
//     backgroundColor:'#e5e7eb'
//   },
//   dayText:{
//     fontWeight:'bold',
//     color:'#111827'
//   },
//   taskContainer:{
//     flexDirection:'row',
//     backgroundColor:'#fff',
//     padding:14,
//     borderRadius:12,
//     marginBottom:12,
//     alignItems:'center',
//     justifyContent:'space-between',
//     borderWidth:1,
//     borderColor:'#e5e7eb',
//   },
//   taskTextContainer:{
//     flex:1,
//   },
//   taskText:{
//     fontSize:16,
//     color:'#111827'
//   },
//   taskTextCompleted:{
//     textDecorationLine:'line-through',
//     color:'#9ca3af'
//   },
//   tag:{
//     marginTop:4,
//     alignSelf:'flex-start',
//     paddingHorizontal:8,
//     paddingVertical:2,
//     borderRadius:6,
//   },
//   tagText:{
//     fontSize:12,
//     color:'#fff',
//     fontWeight:'bold',
//   },
//   deleteButton:{
//     marginLeft:12,
//     backgroundColor:'#fbbf71',
//     paddingHorizontal:12,
//     paddingVertical:6,
//     borderRadius:8
//   },
//   deleteButtonText:{
//     color:'#fff',
//     fontSize:16
//   }
// });


import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [time, setTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Today');
  const [selectedDays, setSelectedDays] = useState([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
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

  const addTask = async () => {
    if (!task.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      name: task,
      time,
      category: selectedCategory,
      selectedDays: selectedCategory === 'Someday' ? selectedDays : [],
    };

    const updatedTasks = [...(tasks || []), newTask];
    await saveTasks(updatedTasks);

    setTask('');
    setTime(null);
    setSelectedDays([]);
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
      case 'Daily':
        return { backgroundColor: '#ADD8E6' }; // light blue
      case 'Today':
        return { backgroundColor: '#FFB6C1' }; // light red/pink
      case 'Someday':
        return { backgroundColor: '#98FB98' }; // light green
      default:
        return { backgroundColor: '#d1d5db' };
    }
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.taskName}>{item.name}</Text>
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
      <View style={[styles.categoryTag, getCategoryStyle(item.category)]}>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Task Reminder</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter task"
        value={task}
        onChangeText={setTask}
      />

      <View style={styles.categoryContainer}>
        {['Daily', 'Today', 'Someday'].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              selectedCategory === cat && { backgroundColor: '#3b82f6' },
            ]}
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
              style={[
                styles.dayButton,
                selectedDays.includes(index) && { backgroundColor: '#3b82f6' },
              ]}
              onPress={() => toggleDay(index)}
            >
              <Text style={styles.dayText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.timeButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={styles.timeButtonText}>
          {time ? `Time: ${formatTime(time)}` : 'Pick a Time to have a reminder (optional)'}
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

      <TouchableOpacity style={styles.addButton} onPress={addTask}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

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
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  categoryButton: { padding: 10, borderRadius: 6, backgroundColor: '#e5e7eb' },
  categoryButtonText: { fontSize: 14, color: '#000' },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10, justifyContent: 'center' },
  dayButton: { padding: 6, margin: 3, borderRadius: 6, backgroundColor: '#e5e7eb' },
  dayText: { fontWeight: 'bold', color: '#111827' },
  timeButton: { backgroundColor: '#e0e7ff', padding: 10, borderRadius: 6, alignItems: 'center', marginBottom: 10 },
  timeButtonText: { fontSize: 16 },
  addButton: { backgroundColor: '#3b82f6', padding: 10, borderRadius: 50, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 10 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', padding: 12, marginBottom: 8, borderRadius: 8 },
  taskName: { fontSize: 16, fontWeight: '500' },
  taskTime: { fontSize: 14, color: '#6b7280' },
  daysRow: { flexDirection: 'row', marginTop: 4, flexWrap: 'wrap' },
  dayTag: { backgroundColor: '#d1d5db', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 4, marginBottom: 4 },
  dayTagText: { fontSize: 12, fontWeight: 'bold' },
  categoryTag: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, marginTop: 6 },
  categoryText: { fontSize: 12, color: '#000', fontWeight: 'bold' },
});
