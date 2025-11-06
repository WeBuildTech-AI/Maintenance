import axios from "axios";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDsfuFCJwP-teylJmfxbOLncOfOoSxNKOw",
  authDomain: "maintainos-notifications.firebaseapp.com",
  projectId: "maintainos-notifications",
  storageBucket: "maintainos-notifications.firebasestorage.app",
  messagingSenderId: "665080262614",
  appId: "1:665080262614:web:8f9195c15a44eb5090be77",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const BACKEND_URL =
  "https://evanescence-army-enrolled-sections.trycloudflare.com";

export const requestNotificationPermission = async (userId: string) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey:
        "BNrGD_odOpsx2vwvAKbv0M0hXMW7V5lCHyYa6MobrsFvRw58JhTm5FOdcxgkLd3nkxY00PT82gZ1oxdLiJz_fVo",
    });

    console.log("✅ FCM Token:", token);

    await axios.post(`${BACKEND_URL}/push-token`, {
      userId,
      token,
      platform: "web",
    });

    console.log("📡 Token sent to backend");
    return token;
  } catch (error) {
    console.error("⚠️ Error requesting notification permission:", error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve, reject) => {
    try {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    } catch (err) {
      reject(err);
    }
  });
