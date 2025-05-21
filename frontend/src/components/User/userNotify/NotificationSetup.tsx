// // components/NotificationSetup.tsx
// import React, { useEffect, useState } from 'react';
// import axiosInstance from '../../../API/axios';

// interface NotificationSetupProps {
//   userId?: string;
//   workerId?: string;
// }

// const NotificationSetup: React.FC<NotificationSetupProps> = ({ userId, workerId }) => {
//   // console.log('worker_Id , and user_Id.......', userId, workerId)

//   const [isSubscribed, setIsSubscribed] = useState(false);
//   const [error, setError] = useState<string>('');

//   const clearExistingSubscriptions = async () => {
//     const registrations = await navigator.serviceWorker.getRegistrations();
//     for (const registration of registrations) {
//       const subscription = await registration.pushManager.getSubscription();
//       if (subscription) {
//         await subscription.unsubscribe();
//       }
//       await registration.unregister();
//     }
//   };

//   const setupPushNotifications = async () => {
//     try {
//       if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
//         throw new Error('Push notifications not supported');
//       }

//       // Check permission first
//       if (Notification.permission === 'denied') {
//         throw new Error('Notification permission denied');
//       }

//       // Clear existing subscriptions
//       await clearExistingSubscriptions();

//       // Register service worker
//       const registration = await navigator.serviceWorker.register('/worker.js');
//       await navigator.serviceWorker.ready;

//       // Request permission if needed
//       const permission = await Notification.requestPermission();
//       if (permission !== 'granted') {
//         throw new Error('Notification permission not granted');
//       }

//       // Get VAPID key from environment
//       // const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
//       const vapidPublicKey = 'BG67jXVQhSXB1Y6h8Aj_jlihcUcf5zzwvndjMvpWs5eciF9_Cllxtl9B0JpHgMAyyExb-S_NjFLX9pmoyX3W0vY';
//       if (!vapidPublicKey) {
//         throw new Error('VAPID public key not found');
//       }

//       // Subscribe to push notifications
//       const subscription = await registration.pushManager.subscribe({
//         userVisibleOnly: true,
//         applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
//       });

//       // Save subscription to server
//       await axiosInstance.post('/worker/notifications/subscribe', {
//         subscription,
//         userId,
//         workerId
//       });

//       setIsSubscribed(true);
//       console.log('Push notification setup complete');

//     } catch (error: any) {
//       console.error('Notification setup error:', error);
//       setError(error.message || 'Failed to setup notifications');
//     }
//   };

//   useEffect(() => {
//     if (userId || workerId) {
//       setupPushNotifications();
//     }

//     // Cleanup on unmount
//     return () => {
//       clearExistingSubscriptions().catch(console.error);
//     };
//   }, [userId, workerId]);

//   // You might want to show some UI based on subscription status
//   return (
//     <div className="notification-setup">
//       {error && (
//         <div className="text-red-500 text-sm mt-2">
//           {error}
//         </div>
//       )}
//       {isSubscribed && (
//         <div className="text-green-500 text-sm mt-2">
//           Notifications enabled
//         </div>
//       )}
//     </div>
//   );
// };

// // Utility function for converting VAPID key
// function urlBase64ToUint8Array(base64String: string): Uint8Array {
//   const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
//   const base64 = (base64String + padding)
//     .replace(/-/g, '+')
//     .replace(/_/g, '/');

//   const rawData = window.atob(base64);
//   const outputArray = new Uint8Array(rawData.length);

//   for (let i = 0; i < rawData.length; ++i) {
//     outputArray[i] = rawData.charCodeAt(i);
//   }
//   return outputArray;
// }

// export default NotificationSetup;