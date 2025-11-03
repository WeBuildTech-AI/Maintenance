import React, { useEffect, useState } from "react";
import {
  onMessageListener,
  requestNotificationPermission,
} from "../Firebase/firebase";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

const NotificationProvider: React.FC = () => {
  const [notification, setNotification] = useState<any>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!user?.id) return;

    const setupFCM = async () => {
      await requestNotificationPermission(user.id);

      // Listen to foreground notifications
      onMessageListener()
        .then((payload: any) => {
          console.log("🔔 Foreground notification:", payload);
          setNotification({
            title: payload.notification?.title,
            body: payload.notification?.body,
          });

          // Auto hide after 5 seconds
          setTimeout(() => setNotification(null), 5000);
        })
        .catch((err) => console.error("FCM message error:", err));
    };

    setupFCM();
  }, [user?.id]);

  return (
    <>
      {notification && (
        <div className="fixed top-5 right-5 bg-blue-600 text-white p-4 rounded-xl shadow-lg z-50 transition-all duration-300">
          <h4 className="font-bold">{notification.title}</h4>
          <p>{notification.body}</p>
        </div>
      )}
    </>
  );
};

export default NotificationProvider;
