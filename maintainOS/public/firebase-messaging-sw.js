importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDsfuFCJwP-teylJmfxbOLncOfOoSxNKOw",
  authDomain: "maintainos-notifications.firebaseapp.com",
  projectId: "maintainos-notifications",
  storageBucket: "maintainos-notifications.firebasestorage.app",
  messagingSenderId: "665080262614",
  appId: "1:665080262614:web:8f9195c15a44eb5090be77",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("📩 Received background message:", payload);
  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message",
    icon: "/firebase-logo.png",
  };
  return self.registration.showNotification(notificationTitle, notificationOptions);
});
