
````markdown
# 📅 Cozy Daily Reminder App

A friendly and cozy daily reminder app built with **React Native** and **Expo**.  
It sends warm, friendly push notifications to help you remember your tasks — no cold, robotic reminders here! 🌼

---

## ✨ Features
- 📌 **Add tasks** with categories
- 🔔 **Daily notifications** with cozy messages
- 📅 Supports **repeating reminders** (Every Day category)
- 🎨 Simple and warm UI design
- 📱 Works on both **Android** and **iOS**

---

## 🚀 Getting Started

### 1️⃣ Install dependencies
```bash
npm install
# or
yarn install
````

### 2️⃣ Start the app in Expo Go

```bash
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone.

---

## 🔔 Notifications

We use [`expo-notifications`](https://docs.expo.dev/versions/latest/sdk/notifications/) for push notifications.

### Notification Handler

```javascript
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

### Cozy Daily Reminder Example

```javascript
if (category === "Every Day") {
  return await Notifications.scheduleNotificationAsync({
    content: { 
      title: '☀️ Hey there!', 
      body: `Just a gentle nudge: ${taskText}`, 
      sound: true 
    },
    trigger: { 
      hour: triggerDate.getHours(), 
      minute: triggerDate.getMinutes(), 
      repeats: true 
    }
  });
}
```

---

## 📦 Building the APK

**1. Prebuild for native code**

```bash
npx expo prebuild
```

**2. Build a development APK**

```bash
eas build --profile development --platform android
```

**3. Build a production APK**

```bash
eas build --profile production --platform android
```

You will get a download link from **EAS** to install the APK.

---

## 🛠 Tech Stack

* **React Native**
* **Expo**
* **expo-notifications**

---

## 📜 License

This project is licensed under the MIT License — feel free to use and modify it.

---

💌 Made with care to make your reminders feel like a friend’s message, not an alarm clock.

