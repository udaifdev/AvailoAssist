// import React, { useEffect, useState } from 'react';
// import axiosInstance from '../../../API/axios';

// interface NotificationSetupProps {
//     workerId: string;
// }

// const NotificationSetup: React.FC<NotificationSetupProps> = ({ workerId }) => {
//     console.log('worker side notification setup..........', workerId)
    
//     const [isSubscribed, setIsSubscribed] = useState(false);
//     const [registrationError, setRegistrationError] = useState<string>('');
//     const [error, setError] = useState<string>('');

//     const clearSubscription = async (registration: ServiceWorkerRegistration) => {
//         try {
//             const subscription = await registration.pushManager.getSubscription();
//             if (subscription) {
//                 await subscription.unsubscribe();
//                 // Notify backend about unsubscription
//                 await axiosInstance.post('/worker/unsubscribe', { workerId });
//                 setIsSubscribed(false);
//                 console.log('Successfully unsubscribed');
//             }
//         } catch (error) {
//             console.error('Error clearing subscription:', error);
//             setError('Failed to clear subscription');
//         }
//     };

//     useEffect(() => {
//         let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

//         const setupPushNotifications = async () => {
//             try {
//                 // Check browser support
//                 if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
//                     throw new Error('Push notifications are not supported');
//                 }

//                 // Check if notification permission is already granted
//                 if (Notification.permission === 'denied') {
//                     throw new Error('Notification permission was denied');
//                 }

//                 // Unregister any existing service workers first
//                 const registrations = await navigator.serviceWorker.getRegistrations();
//                 for (const registration of registrations) {
//                     await clearSubscription(registration);
//                     await registration.unregister();
//                 }

//                 // Register service worker if not already registered
//                 serviceWorkerRegistration = await navigator.serviceWorker.register('/worker.js');
                
//                 // Wait for the service worker to be ready
//                 const serviceWorkerReady = await navigator.serviceWorker.ready;
                
//                 // Check for existing subscription
//                 const existingSubscription = await serviceWorkerReady.pushManager.getSubscription();
                
//                 if (existingSubscription) {
//                     setIsSubscribed(true);
//                     await sendSubscriptionToServer(existingSubscription);
//                     return;
//                 }

//                 // Request notification permission
//                 const permission = await Notification.requestPermission();
//                 if (permission !== 'granted') {
//                     throw new Error('Notification permission not granted');
//                 }

//                 // Create new subscription
//                 const vapidPublicKey = 'BG67jXVQhSXB1Y6h8Aj_jlihcUcf5zzwvndjMvpWs5eciF9_Cllxtl9B0JpHgMAyyExb-S_NjFLX9pmoyX3W0vY';
//                 const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

//                 const subscription = await serviceWorkerReady.pushManager.subscribe({
//                     userVisibleOnly: true,
//                     applicationServerKey: convertedVapidKey
//                 });

//                 await sendSubscriptionToServer(subscription);
//                 setIsSubscribed(true);

//             } catch (error:any) {
//                 console.error('Notification setup error:', error);
//                 setRegistrationError(error.message);
//             }
//         };

//         const sendSubscriptionToServer = async (subscription: PushSubscription) => {
//             try {
//                 const response = await axiosInstance.post('/worker/subscribe', {
//                     subscription: {
//                         endpoint: subscription.endpoint,
//                         keys: {
//                             p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
//                             auth: arrayBufferToBase64(subscription.getKey('auth'))
//                         }
//                     },
//                     workerId
//                 });

//                 if (!response.data.success) {
//                     throw new Error('Failed to save subscription on server');
//                 }

//                 console.log('Subscription saved successfully');
//             } catch (error) {
//                 console.error('Error saving subscription:', error);
//                 throw error;
//             }
//         };

//         setupPushNotifications();

//         // Cleanup function
//         return () => {
//             if (serviceWorkerRegistration) {
//                 clearSubscription(serviceWorkerRegistration)
//                     .then(() => serviceWorkerRegistration?.unregister())
//                     .catch(console.error);
//             }
//         };
//     }, [workerId]);

//     return (
//         <div className="notification-setup">
//             {registrationError && (
//                 <div className="error-message">
//                     {registrationError}
//                 </div>
//             )}
//             {error && (
//                 <div className="error-message">
//                     {error}
//                 </div>
//             )}
//             {isSubscribed && (
//                 <div className="success-message">
//                     Notifications are enabled
//                 </div>
//             )}
//         </div>
//     );
// };

// // Utility functions remain the same
// function urlBase64ToUint8Array(base64String: string): Uint8Array {
//     const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
//     const base64 = (base64String + padding)
//         .replace(/\-/g, '+')
//         .replace(/_/g, '/');

//     const rawData = window.atob(base64);
//     const outputArray = new Uint8Array(rawData.length);

//     for (let i = 0; i < rawData.length; ++i) {
//         outputArray[i] = rawData.charCodeAt(i);
//     }
//     return outputArray;
// }

// function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
//     if (!buffer) return '';
//     const bytes = new Uint8Array(buffer);
//     return btoa(String.fromCharCode.apply(null, Array.from(bytes)));
// }

// export default NotificationSetup;