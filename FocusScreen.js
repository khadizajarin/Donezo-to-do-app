// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Platform,
//   StatusBar,
//   Animated,
//   Alert,
// } from 'react-native';
// import * as Notifications from 'expo-notifications';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // ─── App List ─────────────────────────────────────────────────────────────────
// const APPS = [
//   { key: 'facebook',  label: 'Facebook',  emoji: '📘', bg: '#1a3a5c', color: '#60a5fa' },
//   { key: 'instagram', label: 'Instagram', emoji: '📷', bg: '#3d1a2e', color: '#f472b6' },
//   { key: 'whatsapp',  label: 'WhatsApp',  emoji: '💬', bg: '#0a2e1a', color: '#34d399' },
//   { key: 'messenger', label: 'Messenger', emoji: '🔵', bg: '#1a2a4a', color: '#818cf8' },
//   { key: 'tiktok',    label: 'TikTok',    emoji: '🎵', bg: '#1a0f2e', color: '#c084fc' },
//   { key: 'youtube',   label: 'YouTube',   emoji: '▶️', bg: '#2e0f0f', color: '#f87171' },
//   { key: 'twitter',   label: 'X/Twitter', emoji: '🐦', bg: '#0f1e2e', color: '#38bdf8' },
//   { key: 'reddit',    label: 'Reddit',    emoji: '👾', bg: '#2e180f', color: '#fb923c' },
// ];

// const LIMIT_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

// // ─── Circular Progress Ring ───────────────────────────────────────────────────
// function RingTimer({ minsLeft, totalMins }) {
//   const RADIUS = 60;
//   const CIRC   = 2 * Math.PI * RADIUS;
//   const pct    = totalMins > 0 ? minsLeft / totalMins : 1;
//   const offset = CIRC * (1 - pct);
//   const color  = pct > 0.5 ? '#34d399' : pct > 0.2 ? '#fbbf24' : '#f87171';

//   return (
//     <View style={ring.wrap}>
//       <View style={ring.svgWrap}>
//         {/* Track */}
//         <View style={[ring.circle, ring.track]} />
//         {/* We simulate the ring with a border trick */}
//         <View
//           style={[
//             ring.circle,
//             {
//               borderColor: color,
//               borderWidth: 8,
//               opacity: pct,
//             },
//           ]}
//         />
//       </View>
//       <View style={ring.label}>
//         <Text style={[ring.mins, { color }]}>{minsLeft}</Text>
//         <Text style={ring.unit}>min left</Text>
//       </View>
//     </View>
//   );
// }

// const ring = StyleSheet.create({
//   wrap:   { width: 148, height: 148, alignItems: 'center', justifyContent: 'center' },
//   svgWrap:{ position: 'absolute', width: 148, height: 148 },
//   circle: {
//     position: 'absolute',
//     width: 132,
//     height: 132,
//     borderRadius: 66,
//     top: 8,
//     left: 8,
//   },
//   track:  { borderColor: '#1e1e30', borderWidth: 8 },
//   label:  { alignItems: 'center' },
//   mins:   { fontSize: 36, fontWeight: '800', lineHeight: 40 },
//   unit:   { fontSize: 11, color: '#94a3b8', fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
// });

// // ─── App Tile ─────────────────────────────────────────────────────────────────
// function AppTile({ app, blocked, onToggle }) {
//   const scaleAnim = useRef(new Animated.Value(1)).current;

//   const handlePress = () => {
//     Animated.sequence([
//       Animated.timing(scaleAnim, { toValue: 0.88, duration: 80,  useNativeDriver: true }),
//       Animated.timing(scaleAnim, { toValue: 1,    duration: 120, useNativeDriver: true }),
//     ]).start();
//     onToggle(app.key);
//   };

//   return (
//     <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={styles.appItem}>
//       <Animated.View
//         style={[
//           styles.appIcon,
//           { backgroundColor: app.bg, transform: [{ scale: scaleAnim }] },
//           blocked && { borderColor: app.color, borderWidth: 2 },
//         ]}
//       >
//         <Text style={styles.appEmoji}>{app.emoji}</Text>
//         {blocked && (
//           <View style={styles.blockedBadge}>
//             <Text style={styles.blockedBadgeText}>🚫</Text>
//           </View>
//         )}
//       </Animated.View>
//       <Text style={[styles.appName, blocked && { color: app.color }]}>{app.label}</Text>
//     </TouchableOpacity>
//   );
// }

// // ─── Block Overlay ────────────────────────────────────────────────────────────
// function BlockOverlay({ blockedApps, onSnooze, onDone }) {
//   const fadeAnim  = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(40)).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
//       Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
//     ]).start();
//   }, []);

//   return (
//     <Animated.View style={[styles.overlayWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
//       <View style={styles.overlayCard}>
//         <Text style={styles.overlayIcon}>🛡️</Text>

//         {/* Blocked app icons row */}
//         <View style={styles.overlayAppRow}>
//           {blockedApps.slice(0, 4).map((a) => (
//             <View key={a.key} style={[styles.overlayAppIcon, { backgroundColor: a.bg }]}>
//               <Text style={{ fontSize: 18 }}>{a.emoji}</Text>
//             </View>
//           ))}
//           {blockedApps.length > 4 && (
//             <View style={[styles.overlayAppIcon, { backgroundColor: '#1e1e30' }]}>
//               <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '700' }}>+{blockedApps.length - 4}</Text>
//             </View>
//           )}
//         </View>

//         <Text style={styles.overlayTitle}>Time's up, friend.</Text>
//         <Text style={styles.overlayBody}>
//           You've hit your scroll limit.{'\n'}
//           Donezo thinks you deserve a break. 🌙
//         </Text>

//         <TouchableOpacity style={styles.btnSnooze} onPress={onSnooze} activeOpacity={0.8}>
//           <Text style={styles.btnSnoozeText}>⏰  Snooze 5 minutes</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.btnDone} onPress={onDone} activeOpacity={0.8}>
//           <Text style={styles.btnDoneText}>✅  I'm done scrolling</Text>
//         </TouchableOpacity>
//       </View>
//     </Animated.View>
//   );
// }

// // ─── Focus Screen (main) ──────────────────────────────────────────────────────
// export default function FocusScreen() {
//   const [view,         setView]         = useState('setup');   // 'setup' | 'active' | 'blocked'
//   const [limitMins,    setLimitMins]    = useState(20);
//   const [blockedKeys,  setBlockedKeys]  = useState(['facebook', 'instagram', 'messenger', 'tiktok']);
//   const [minsLeft,     setMinsLeft]     = useState(20);
//   const [sessionStart, setSessionStart] = useState(null);

//   const timerRef    = useRef(null);
//   const headerAnim  = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.timing(headerAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
//     loadSettings();
//     return () => clearInterval(timerRef.current);
//   }, []);

//   // ── Persist settings ─────────────────────────────────────────────────────────
//   const loadSettings = async () => {
//     try {
//       const s = await AsyncStorage.getItem('focusSettings');
//       if (s) {
//         const { limitMins: lm, blockedKeys: bk } = JSON.parse(s);
//         if (lm) setLimitMins(lm);
//         if (bk) setBlockedKeys(bk);
//       }
//     } catch (e) {}
//   };

//   const saveSettings = async (lm, bk) => {
//     try {
//       await AsyncStorage.setItem('focusSettings', JSON.stringify({ limitMins: lm, blockedKeys: bk }));
//     } catch (e) {}
//   };

//   // ── Toggle app blocked ────────────────────────────────────────────────────────
//   const toggleApp = (key) => {
//     const updated = blockedKeys.includes(key)
//       ? blockedKeys.filter((k) => k !== key)
//       : [...blockedKeys, key];
//     setBlockedKeys(updated);
//     saveSettings(limitMins, updated);
//   };

//   const setLimit = (mins) => {
//     setLimitMins(mins);
//     saveSettings(mins, blockedKeys);
//   };

//   // ── Session controls ──────────────────────────────────────────────────────────
//   const startSession = async () => {
//     if (blockedKeys.length === 0) {
//       Alert.alert('No apps selected', 'Please select at least one app to block.');
//       return;
//     }
//     setMinsLeft(limitMins);
//     setSessionStart(new Date());
//     setView('active');

//     // Schedule the block notification
//     await Notifications.scheduleNotificationAsync({
//       content: {
//         title: '🛡️ Donezo — Time\'s Up!',
//         body: `You've been scrolling for ${limitMins} minutes. Time for a break!`,
//         sound: 'default',
//         priority: 'high',
//         color: '#f87171',
//       },
//       trigger: { seconds: limitMins * 60 },
//     });

//     // Countdown tick every 60 seconds
//     timerRef.current = setInterval(() => {
//       setMinsLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(timerRef.current);
//           setView('blocked');
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 60000);
//   };

//   const endSession = () => {
//     clearInterval(timerRef.current);
//     Notifications.cancelAllScheduledNotificationsAsync();
//     setView('setup');
//     setMinsLeft(limitMins);
//   };

//   const snooze = async () => {
//     setMinsLeft(5);
//     setView('active');
//     await Notifications.scheduleNotificationAsync({
//       content: {
//         title: '🛡️ Donezo — Snooze Over!',
//         body: 'Your 5-minute snooze is up. Put the phone down! 🌙',
//         sound: 'default',
//         priority: 'high',
//         color: '#f87171',
//       },
//       trigger: { seconds: 5 * 60 },
//     });
//     timerRef.current = setInterval(() => {
//       setMinsLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(timerRef.current);
//           setView('blocked');
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 60000);
//   };

//   const blockedApps = APPS.filter((a) => blockedKeys.includes(a.key));

//   // ── BLOCK OVERLAY VIEW ───────────────────────────────────────────────────────
//   if (view === 'blocked') {
//     return (
//       <View style={styles.container}>
//         <BlockOverlay
//           blockedApps={blockedApps}
//           onSnooze={snooze}
//           onDone={endSession}
//         />
//       </View>
//     );
//   }

//   // ── ACTIVE SESSION VIEW ──────────────────────────────────────────────────────
//   if (view === 'active') {
//     return (
//       <View style={styles.container}>
//         <Animated.View style={[
//           styles.header,
//           {
//             opacity: headerAnim,
//             transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
//           },
//         ]}>
//           <Text style={styles.headerEmoji}>⏱️</Text>
//           <Text style={styles.headerTitle}>Session Active</Text>
//           <Text style={styles.headerSub}>Blocking {blockedApps.length} app{blockedApps.length !== 1 ? 's' : ''}</Text>
//         </Animated.View>

//         {/* Status pill */}
//         <View style={styles.statusCard}>
//           <View style={styles.statusDot} />
//           <View style={{ flex: 1 }}>
//             <Text style={styles.statusText}>Blocker is ON</Text>
//             <Text style={styles.statusSub}>You're doing great — stay off the feed!</Text>
//           </View>
//         </View>

//         {/* Ring timer */}
//         <View style={styles.ringCard}>
//           <RingTimer minsLeft={minsLeft} totalMins={limitMins} />
//           <Text style={styles.ringDesc}>
//             Block triggers in{' '}
//             <Text style={{ color: '#f87171', fontWeight: '800' }}>{minsLeft} min</Text>
//           </Text>
//         </View>

//         {/* Blocked apps */}
//         <View style={styles.card}>
//           <Text style={styles.sectionLabel}>currently blocked</Text>
//           <View style={styles.badgeWrap}>
//             {blockedApps.map((a) => (
//               <View key={a.key} style={[styles.badge, { backgroundColor: a.bg, borderColor: a.color + '44' }]}>
//                 <Text style={[styles.badgeText, { color: a.color }]}>{a.emoji} {a.label}</Text>
//               </View>
//             ))}
//           </View>
//         </View>

//         {/* End button */}
//         <TouchableOpacity style={styles.btnEnd} onPress={endSession} activeOpacity={0.8}>
//           <Text style={styles.btnEndText}>✕  End Session</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   // ── SETUP VIEW ───────────────────────────────────────────────────────────────
//   return (
//     <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>

//       {/* Header */}
//       <Animated.View style={[
//         styles.header,
//         {
//           opacity: headerAnim,
//           transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
//         },
//       ]}>
//         <Text style={styles.headerEmoji}>🛡️</Text>
//         <Text style={styles.headerTitle}>Doomscroll Blocker</Text>
//         <Text style={styles.headerSub}>set limits before bad habits set in</Text>
//       </Animated.View>

//       {/* Scroll Limit Picker */}
//       <View style={styles.card}>
//         <Text style={styles.sectionLabel}>scroll limit</Text>
//         <View style={styles.limitRow}>
//           <Text style={styles.limitDesc}>Block after</Text>
//           <View style={styles.limitBadge}>
//             <Text style={styles.limitBadgeText}>{limitMins} min</Text>
//           </View>
//         </View>
//         <View style={styles.limitOptions}>
//           {LIMIT_OPTIONS.map((m) => (
//             <TouchableOpacity
//               key={m}
//               style={[styles.limitBtn, limitMins === m && styles.limitBtnActive]}
//               onPress={() => setLimit(m)}
//               activeOpacity={0.75}
//             >
//               <Text style={[styles.limitBtnText, limitMins === m && styles.limitBtnTextActive]}>
//                 {m}m
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       {/* App Picker */}
//       <View style={styles.card}>
//         <Text style={styles.sectionLabel}>apps to block</Text>
//         <View style={styles.appGrid}>
//           {APPS.map((app) => (
//             <AppTile
//               key={app.key}
//               app={app}
//               blocked={blockedKeys.includes(app.key)}
//               onToggle={toggleApp}
//             />
//           ))}
//         </View>

//         {/* Selected badges */}
//         {blockedApps.length > 0 && (
//           <View style={[styles.badgeWrap, { marginTop: 14 }]}>
//             {blockedApps.map((a) => (
//               <View key={a.key} style={[styles.badge, { backgroundColor: a.bg, borderColor: a.color + '44' }]}>
//                 <Text style={[styles.badgeText, { color: a.color }]}>{a.emoji} {a.label}</Text>
//               </View>
//             ))}
//           </View>
//         )}
//       </View>

//       {/* How it works note */}
//       <View style={styles.noteCard}>
//         <Text style={styles.noteTitle}>💡 How it works</Text>
//         <Text style={styles.noteText}>
//           Start a session and Donezo will send a{' '}
//           <Text style={{ color: '#f87171', fontWeight: '700' }}>full-screen notification</Text>{' '}
//           when your scroll time is up. Tap "I'm done" to end or snooze for 5 more minutes.
//         </Text>
//         <Text style={[styles.noteText, { marginTop: 6, color: '#6b7280' }]}>
//           For true app blocking, Android requires Accessibility Services (needs a native build).
//         </Text>
//       </View>

//       {/* Start button */}
//       <TouchableOpacity style={styles.btnStart} onPress={startSession} activeOpacity={0.85}>
//         <Text style={styles.btnStartText}>▶  Start Focus Session</Text>
//       </TouchableOpacity>

//     </ScrollView>
//   );
// }

// // ─── Styles ───────────────────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#0f0f1a',
//     paddingHorizontal: 20,
//     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 54,
//   },

//   header:      { alignItems: 'center', marginBottom: 26 },
//   headerEmoji: { fontSize: 38, marginBottom: 4 },
//   headerTitle: { fontSize: 30, fontWeight: '800', color: '#f1f5f9', letterSpacing: -0.8 },
//   headerSub:   { fontSize: 13, color: '#94a3b8', marginTop: 3, letterSpacing: 0.4 },

//   card: {
//     backgroundColor: '#161624',
//     borderWidth: 1,
//     borderColor: '#1e1e30',
//     borderRadius: 18,
//     padding: 18,
//     marginBottom: 14,
//   },
//   sectionLabel: {
//     fontSize: 11,
//     fontWeight: '700',
//     color: '#94a3b8',
//     letterSpacing: 1.2,
//     textTransform: 'uppercase',
//     marginBottom: 12,
//   },

//   // Limit picker
//   limitRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
//   limitDesc:      { flex: 1, fontSize: 14, color: '#94a3b8', fontWeight: '600' },
//   limitBadge:     { backgroundColor: '#1e1b4b', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: '#818cf844' },
//   limitBadgeText: { color: '#818cf8', fontWeight: '800', fontSize: 13 },
//   limitOptions:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
//   limitBtn: {
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#1e1e30',
//     backgroundColor: '#0f0f1a',
//   },
//   limitBtnActive:     { backgroundColor: '#1e1b4b', borderColor: '#818cf8' },
//   limitBtnText:       { fontSize: 13, fontWeight: '700', color: '#6b7280' },
//   limitBtnTextActive: { color: '#818cf8' },

//   // App grid
//   appGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
//   appItem:   { width: '21%', alignItems: 'center', gap: 6 },
//   appIcon: {
//     width: 54,
//     height: 54,
//     borderRadius: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 2,
//     borderColor: 'transparent',
//     position: 'relative',
//   },
//   appEmoji:        { fontSize: 26 },
//   blockedBadge:    { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#0f0f1a', borderRadius: 8 },
//   blockedBadgeText:{ fontSize: 13 },
//   appName:         { fontSize: 10, color: '#94a3b8', fontWeight: '600', textAlign: 'center' },

//   // Badges
//   badgeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
//   badge: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 8,
//     borderWidth: 1,
//   },
//   badgeText: { fontSize: 12, fontWeight: '700' },

//   // Note card
//   noteCard: {
//     backgroundColor: '#161624',
//     borderWidth: 1,
//     borderColor: '#1e1e30',
//     borderRadius: 14,
//     padding: 16,
//     marginBottom: 18,
//   },
//   noteTitle: { fontSize: 13, fontWeight: '800', color: '#f1f5f9', marginBottom: 6 },
//   noteText:  { fontSize: 12, color: '#94a3b8', lineHeight: 18 },

//   // Buttons
//   btnStart: {
//     backgroundColor: '#818cf8',
//     borderRadius: 16,
//     paddingVertical: 16,
//     paddingBottom: 20,
//     alignItems: 'center',
//   },
//   btnStartText: { color: '#fff', fontWeight: '800', fontSize: 15 },

//   btnEnd: {
//     marginTop: 8,
//     backgroundColor: '#2d1b1b',
//     borderWidth: 1,
//     borderColor: '#f8717144',
//     borderRadius: 16,
//     paddingVertical: 16,
//     alignItems: 'center',
//   },
//   btnEndText: { color: '#f87171', fontWeight: '800', fontSize: 15 },

//   // Status card (active session)
//   statusCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#0a2e1a',
//     borderWidth: 1,
//     borderColor: '#34d39933',
//     borderRadius: 14,
//     padding: 14,
//     marginBottom: 14,
//     gap: 12,
//   },
//   statusDot:  { width: 10, height: 10, borderRadius: 5, backgroundColor: '#34d399' },
//   statusText: { fontSize: 13, color: '#34d399', fontWeight: '700' },
//   statusSub:  { fontSize: 11, color: '#065f46', marginTop: 2 },

//   // Ring card
//   ringCard: {
//     backgroundColor: '#161624',
//     borderWidth: 1,
//     borderColor: '#1e1e30',
//     borderRadius: 18,
//     padding: 24,
//     alignItems: 'center',
//     marginBottom: 14,
//     gap: 12,
//   },
//   ringDesc: { fontSize: 14, color: '#94a3b8', fontWeight: '500' },

//   // Block overlay
//   overlayWrap: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//   },
//   overlayCard: {
//     backgroundColor: '#161624',
//     borderWidth: 1,
//     borderColor: '#1e1e30',
//     borderRadius: 24,
//     padding: 28,
//     alignItems: 'center',
//     width: '100%',
//   },
//   overlayIcon:    { fontSize: 56, marginBottom: 16 },
//   overlayAppRow:  { flexDirection: 'row', gap: 8, marginBottom: 18 },
//   overlayAppIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
//   overlayTitle:   { fontSize: 22, fontWeight: '800', color: '#f1f5f9', marginBottom: 8 },
//   overlayBody:    { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 22, marginBottom: 24 },

//   btnSnooze: {
//     width: '100%',
//     paddingVertical: 14,
//     borderRadius: 14,
//     backgroundColor: '#0f0f1a',
//     borderWidth: 1,
//     borderColor: '#1e1e30',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   btnSnoozeText: { color: '#94a3b8', fontWeight: '700', fontSize: 14 },

//   btnDone: {
//     width: '100%',
//     paddingVertical: 14,
//     borderRadius: 14,
//     backgroundColor: '#1e1b4b',
//     borderWidth: 1,
//     borderColor: '#818cf844',
//     alignItems: 'center',
//   },
//   btnDoneText: { color: '#818cf8', fontWeight: '800', fontSize: 14 },
// });

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  Animated,
  Alert,
  Switch,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── App List ─────────────────────────────────────────────────────────────────
const APPS = [
  { key: 'facebook',   label: 'Facebook',   emoji: '📘', bg: '#1a3a5c', color: '#60a5fa' },
  { key: 'instagram',  label: 'Instagram',  emoji: '📷', bg: '#3d1a2e', color: '#f472b6' },
  { key: 'whatsapp',   label: 'WhatsApp',   emoji: '💬', bg: '#0a2e1a', color: '#34d399' },
  { key: 'messenger',  label: 'Messenger',  emoji: '🔵', bg: '#1a2a4a', color: '#818cf8' },
  { key: 'tiktok',     label: 'TikTok',     emoji: '🎵', bg: '#1a0f2e', color: '#c084fc' },
  { key: 'youtube',    label: 'YouTube',    emoji: '▶️',  bg: '#2e0f0f', color: '#f87171' },
  { key: 'twitter',    label: 'X/Twitter',  emoji: '🐦', bg: '#0f1e2e', color: '#38bdf8' },
  { key: 'reddit',     label: 'Reddit',     emoji: '👾', bg: '#2e180f', color: '#fb923c' },
  { key: 'snapchat',   label: 'Snapchat',   emoji: '👻', bg: '#2e2a00', color: '#fde047' },
  { key: 'linkedin',   label: 'LinkedIn',   emoji: '💼', bg: '#0f2233', color: '#7dd3fc' },
  { key: 'pinterest',  label: 'Pinterest',  emoji: '📌', bg: '#2e0f14', color: '#fda4af' },
  { key: 'telegram',   label: 'Telegram',   emoji: '✈️',  bg: '#0a1f2e', color: '#67e8f9' },
  { key: 'discord',    label: 'Discord',    emoji: '🎮', bg: '#1a1a3e', color: '#a5b4fc' },
  { key: 'twitch',     label: 'Twitch',     emoji: '🟣', bg: '#1e0f2e', color: '#d8b4fe' },
  { key: 'threads',    label: 'Threads',    emoji: '🧵', bg: '#1a1a1a', color: '#e2e8f0' },
  { key: 'bereal',     label: 'BeReal',     emoji: '📸', bg: '#0f1a0f', color: '#86efac' },
];

const LIMIT_OPTIONS = [1, 5, 10, 15, 20, 30, 45, 60];

// ─── App Tile ─────────────────────────────────────────────────────────────────
function AppTile({ app, blocked, onToggle }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 80,  useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 120, useNativeDriver: true }),
    ]).start();
    onToggle(app.key);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={styles.appItem}>
      <Animated.View
        style={[
          styles.appIcon,
          { backgroundColor: app.bg, transform: [{ scale: scaleAnim }] },
          blocked && { borderColor: app.color, borderWidth: 2 },
        ]}
      >
        <Text style={styles.appEmoji}>{app.emoji}</Text>
        {blocked && (
          <View style={styles.blockedBadge}>
            <Text style={styles.blockedBadgeText}>🚫</Text>
          </View>
        )}
      </Animated.View>
      <Text style={[styles.appName, blocked && { color: app.color }]}>{app.label}</Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function FocusScreen() {
  const [isEnabled,   setIsEnabled]   = useState(false);
  const [limitMins,   setLimitMins]   = useState(20);
  const [blockedKeys, setBlockedKeys] = useState(['facebook', 'instagram', 'tiktok', 'youtube']);
  const [usageMap,    setUsageMap]    = useState({});  // key → minsUsed today
  const [lastReset,   setLastReset]   = useState('');  // date string YYYY-MM-DD

  const headerAnim = useRef(new Animated.Value(0)).current;
  const tickRef    = useRef(null);

  // ── Boot ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    loadState();
    return () => clearInterval(tickRef.current);
  }, []);

  // ── Whenever enabled or limitMins changes, restart the daily tick ───────────
  useEffect(() => {
    clearInterval(tickRef.current);
    if (isEnabled) startDailyTick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled, limitMins, blockedKeys]);

  // ── Midnight reset ──────────────────────────────────────────────────────────
  const todayStr = () => new Date().toISOString().slice(0, 10);

  const maybeResetDaily = async (storedDate) => {
    const today = todayStr();
    if (storedDate !== today) {
      setUsageMap({});
      setLastReset(today);
      await AsyncStorage.setItem('focusLastReset', today);
      await AsyncStorage.setItem('focusUsageMap', JSON.stringify({}));
    }
  };

  // ── Load persisted state ────────────────────────────────────────────────────
  const loadState = async () => {
    try {
      const raw = await AsyncStorage.getItem('focusSettings');
      if (raw) {
        const { limitMins: lm, blockedKeys: bk, isEnabled: en } = JSON.parse(raw);
        if (lm) setLimitMins(lm);
        if (bk) setBlockedKeys(bk);
        if (en !== undefined) setIsEnabled(en);
      }
      const storedDate  = await AsyncStorage.getItem('focusLastReset') || '';
      const storedUsage = await AsyncStorage.getItem('focusUsageMap');
      setLastReset(storedDate);
      if (storedUsage) setUsageMap(JSON.parse(storedUsage));
      await maybeResetDaily(storedDate);
    } catch (e) {}
  };

  const saveSettings = async (en, lm, bk) => {
    try {
      await AsyncStorage.setItem('focusSettings', JSON.stringify({ isEnabled: en, limitMins: lm, blockedKeys: bk }));
    } catch (e) {}
  };

  const saveUsage = async (map) => {
    try {
      await AsyncStorage.setItem('focusUsageMap', JSON.stringify(map));
    } catch (e) {}
  };

  // ── Daily tick: every minute, increment usage for ALL blocked apps ──────────
  const startDailyTick = () => {
    tickRef.current = setInterval(async () => {
      // Midnight reset check
      const today = todayStr();
      if (lastReset !== today) {
        const fresh = {};
        setUsageMap(fresh);
        setLastReset(today);
        await AsyncStorage.setItem('focusLastReset', today);
        await saveUsage(fresh);
        return;
      }

      setUsageMap((prev) => {
        const updated = { ...prev };
        let anyBreached = false;

        blockedKeys.forEach((key) => {
          updated[key] = (updated[key] || 0) + 1;
          if (updated[key] === limitMins) anyBreached = true;
        });

        saveUsage(updated);

        if (anyBreached) fireWarningNotification();
        return updated;
      });
    }, 60000);
  };

  const fireWarningNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🛡️ Donezo — Time\'s Up!',
        body: `You've been scrolling for ${limitMins} minutes. Time for a break! 🌙`,
        sound: 'default',
        priority: 'high',
        color: '#f87171',
      },
      trigger: null, // immediate
    });
  };

  // ── Toggle master switch ────────────────────────────────────────────────────
  const toggleEnabled = (val) => {
    if (val && blockedKeys.length === 0) {
      Alert.alert('No apps selected', 'Please select at least one app to monitor.');
      return;
    }
    setIsEnabled(val);
    saveSettings(val, limitMins, blockedKeys);
  };

  // ── Toggle individual app ───────────────────────────────────────────────────
  const toggleApp = (key) => {
    const updated = blockedKeys.includes(key)
      ? blockedKeys.filter((k) => k !== key)
      : [...blockedKeys, key];
    setBlockedKeys(updated);
    saveSettings(isEnabled, limitMins, updated);
  };

  const setLimit = (mins) => {
    setLimitMins(mins);
    saveSettings(isEnabled, mins, blockedKeys);
  };

  // Reset today's usage manually
  const resetUsage = async () => {
    const fresh = {};
    setUsageMap(fresh);
    await saveUsage(fresh);
  };

  const blockedApps = APPS.filter((a) => blockedKeys.includes(a.key));

  // ── Usage bar for a single app ──────────────────────────────────────────────
  const UsageBar = ({ app }) => {
    const used = usageMap[app.key] || 0;
    const pct  = Math.min(used / limitMins, 1);
    const barColor = pct >= 1 ? '#f87171' : pct >= 0.6 ? '#fbbf24' : app.color;

    return (
      <View style={styles.usageRow}>
        <Text style={styles.usageEmoji}>{app.emoji}</Text>
        <View style={{ flex: 1 }}>
          <View style={styles.usageBarTrack}>
            <View style={[styles.usageBarFill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
          </View>
        </View>
        <Text style={[styles.usageMins, { color: barColor }]}>
          {used}/{limitMins}m
        </Text>
      </View>
    );
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Animated.View style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
          },
        ]}>
          <Text style={styles.headerEmoji}>🛡️</Text>
          <Text style={styles.headerTitle}>Doomscroll Blocker</Text>
          <Text style={styles.headerSub}>always-on daily scroll limits</Text>
        </Animated.View>

        {/* ── Master Toggle ── */}
        <View style={[styles.card, styles.toggleCard]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>
              {isEnabled ? '🟢  Blocker is ON' : '⚫  Blocker is OFF'}
            </Text>
            <Text style={styles.toggleSub}>
              {isEnabled
                ? `Monitoring ${blockedApps.length} app${blockedApps.length !== 1 ? 's' : ''} · resets at midnight`
                : 'Turn on to start monitoring your usage'}
            </Text>
          </View>
          <Switch
            value={isEnabled}
            onValueChange={toggleEnabled}
            trackColor={{ false: '#1e1e30', true: '#1e1b4b' }}
            thumbColor={isEnabled ? '#818cf8' : '#374151'}
          />
        </View>

        {/* ── Today's Usage ── */}
        {isEnabled && blockedApps.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>today's usage</Text>
              <TouchableOpacity onPress={resetUsage}>
                <Text style={styles.resetBtn}>↺ reset</Text>
              </TouchableOpacity>
            </View>
            {blockedApps.map((app) => (
              <UsageBar key={app.key} app={app} />
            ))}
          </View>
        )}

        {/* ── Daily Limit ── */}
        <View style={styles.card}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>daily limit per app</Text>
            <View style={styles.limitBadge}>
              <Text style={styles.limitBadgeText}>{limitMins} min</Text>
            </View>
          </View>
          <View style={styles.limitOptions}>
            {LIMIT_OPTIONS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.limitBtn, limitMins === m && styles.limitBtnActive]}
                onPress={() => setLimit(m)}
                activeOpacity={0.75}
              >
                <Text style={[styles.limitBtnText, limitMins === m && styles.limitBtnTextActive]}>
                  {m}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── App Picker ── */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>apps to monitor</Text>
          <View style={styles.appGrid}>
            {APPS.map((app) => (
              <AppTile
                key={app.key}
                app={app}
                blocked={blockedKeys.includes(app.key)}
                onToggle={toggleApp}
              />
            ))}
          </View>
        </View>

        {/* ── Info note ── */}
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>💡 How it works</Text>
          <Text style={styles.noteText}>
            Turn the blocker ON once — it runs{' '}
            <Text style={{ color: '#818cf8', fontWeight: '700' }}>all day, every day</Text>
            , tracking your selected apps. When you hit your daily limit, Donezo sends a notification reminder. Usage resets at midnight automatically.
          </Text>
          <Text style={[styles.noteText, { marginTop: 6, color: '#475569' }]}>
            Note: For true app blocking, Android requires Accessibility Services (needs a native module build).
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    paddingBottom: 60
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 54,
  },

  header:      { alignItems: 'center', marginBottom: 22 },
  headerEmoji: { fontSize: 38, marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#f1f5f9', letterSpacing: -0.8 },
  headerSub:   { fontSize: 13, color: '#94a3b8', marginTop: 3, letterSpacing: 0.4 },

  card: {
    backgroundColor: '#161624',
    borderWidth: 1,
    borderColor: '#1e1e30',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },

  // Toggle card
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleTitle: { fontSize: 14, fontWeight: '800', color: '#f1f5f9', marginBottom: 3 },
  toggleSub:   { fontSize: 12, color: '#94a3b8', lineHeight: 17 },

  // Section header row
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  resetBtn: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },

  // Usage bars
  usageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  usageEmoji:    { fontSize: 18, width: 26, textAlign: 'center' },
  usageBarTrack: { height: 6, backgroundColor: '#1e1e30', borderRadius: 4, flex: 1 },
  usageBarFill:  { height: 6, borderRadius: 4 },
  usageMins:     { fontSize: 11, fontWeight: '700', minWidth: 44, textAlign: 'right' },

  // Limit picker
  limitBadge: {
    backgroundColor: '#1e1b4b',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#818cf844',
  },
  limitBadgeText: { color: '#818cf8', fontWeight: '800', fontSize: 13 },
  limitOptions:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  limitBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e1e30',
    backgroundColor: '#0f0f1a',
  },
  limitBtnActive:     { backgroundColor: '#1e1b4b', borderColor: '#818cf8' },
  limitBtnText:       { fontSize: 13, fontWeight: '700', color: '#475569' },
  limitBtnTextActive: { color: '#818cf8' },

  // App grid
  appGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  appItem:  { width: '21%', alignItems: 'center', gap: 5 },
  appIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  appEmoji:         { fontSize: 24 },
  blockedBadge:     { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#0f0f1a', borderRadius: 8 },
  blockedBadgeText: { fontSize: 12 },
  appName:          { fontSize: 10, color: '#475569', fontWeight: '600', textAlign: 'center' },

  // Note
  noteCard: {
    backgroundColor: '#161624',
    borderWidth: 1,
    borderColor: '#1e1e30',
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
  },
  noteTitle: { fontSize: 13, fontWeight: '800', color: '#f1f5f9', marginBottom: 6 },
  noteText:  { fontSize: 12, color: '#94a3b8', lineHeight: 18 },
});