// frontend/src/utils/webPushConfig.ts
import axiosInstance from '../API/axios';


// Configuration constants
const SUBSCRIPTION_CHECK_INTERVAL = 12 * 60 * 60 * 1000; // 12 hours
const SUBSCRIPTION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const MAX_RETRIES = 20;
const INITIAL_BACKOFF_MS = 1000;

// Store active subscriptions in memory
const activeSubscriptions = new Map<string, PushSubscription>();



// Main initialization function
export const initializeNotifications = async (userId: string): Promise<boolean> => {
  try {
    startPeriodicCheck(userId);
    const subscription = await requestNotificationPermission();

    if (!subscription) {
      return false;
    }

    activeSubscriptions.set(userId, subscription);
    return await saveSubscriptionWithRetry(subscription, userId);
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
    return false;
  }
};


// Function to request notification permission
// Request notification permission and create subscription
export const requestNotificationPermission = async (): Promise<PushSubscription | null> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    await unsubscribeExisting();

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || 'BA7vOsBuHw_k9EJORm_v068uvYAU5YLFPfQ91ymcQUsog0SxWiFXceoXShYJEDAcnvfXAdOVOqPL7NXujGs5ct8')
    });

    return subscription;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};


// Helper function to convert base64 to Uint8Array
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};


// Unsubscribe from existing subscriptions
const unsubscribeExisting = async (): Promise<void> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      await existingSubscription.unsubscribe();
    }
  } catch (error) {
    console.error('Error unsubscribing from existing subscription:', error);
  }
};


// Save subscription with retry logic
const saveSubscriptionWithRetry = async (subscription: PushSubscription, userId: string, retryCount = 0): Promise<boolean> => {
  try {
    await axiosInstance.post('/user/userOrworker-save-subscription', {
      subscription,
      userId,
      expirationTime: Date.now() + SUBSCRIPTION_EXPIRY
    });
    return true;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const backoffTime = INITIAL_BACKOFF_MS * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      return saveSubscriptionWithRetry(subscription, userId, retryCount + 1);
    }
    console.error('Failed to save subscription after retries:', error);
    return false;
  }
};

// Validate existing subscription
const validateSubscription = async (subscription: PushSubscription): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const currentSubscription = await registration.pushManager.getSubscription();
    return currentSubscription?.endpoint === subscription.endpoint;
  } catch (error) {
    console.error('Error validating subscription:', error);
    return false;
  }
};

// Start periodic subscription check
const startPeriodicCheck = (userId: string): void => {
  setInterval(async () => {
    const subscription = activeSubscriptions.get(userId);
    if (subscription) {
      const isValid = await validateSubscription(subscription);
      if (!isValid) {
        const newSubscription = await requestNotificationPermission();
        if (newSubscription) {
          activeSubscriptions.set(userId, newSubscription);
          await saveSubscriptionWithRetry(newSubscription, userId);
        }
      }
    }
  }, SUBSCRIPTION_CHECK_INTERVAL);
};


// Save subscription to the backend
export const saveSubscription = async (subscription: PushSubscription, userId: string): Promise<boolean> => {
  try {
    await axiosInstance.post('/user/userOrworker-save-subscription', { subscription, userId });
    console.log('Subscription saved successfully on the backend.');
    return true;
  } catch (error) {
    console.error('Error saving subscription to the backend:', error);
    return false;
  }
};


// Updated notification sending function
export const sendNotification = async (workerId: string, message: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.post('/user/notifications/send-to-worker', {
      workerId,
      message
    });
    return response.status === 200;
  } catch (error: any) {
    if (error.response?.status === 410) {
        // Subscription expired, trigger resubscription flow
        console.log('Worker subscription expired, attempting to resubscribe...');
      // Subscription expired, attempt to refresh
      const subscription = await requestNotificationPermission();
      if (subscription) {
      const saved =   await saveSubscriptionWithRetry(subscription, workerId);
      if (saved) {
        // Retry sending notification
        return sendNotification(workerId, message);
      }
      }
    }
    console.error('Error sending notification:', error);
    return false;
  }
};



// Add this new function to handle user notifications
export const sendNotificationToUser = async (userId: string, message: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.post('/worker/notifications/send-to-user', {userId,message});

    return response.status === 200;
    
  } catch (error: any) {
    if (error.response?.status === 410) {
      // Subscription expired, trigger resubscription flow
      console.log('User subscription expired, attempting to resubscribe...');
      const subscription = await requestNotificationPermission();
      if (subscription) {
        const saved = await saveSubscriptionWithRetry(subscription, userId);
        if (saved) {
          // Retry sending notification after resubscribing
          return sendNotificationToUser(userId, message);
        }
      }
    }
    console.error('Error sending notification to user:', error);
    return false;
  }
};





// export const initializeNotifications = async (userId: string): Promise<boolean> => {
//   try {
//     // Request permission and get subscription
//     const subscription = await requestNotificationPermission();

//     if (subscription) {
//       // Save the subscription to the backend
//       const isSaved = await saveSubscription(subscription, userId);
//       return isSaved;
//     } else {
//       console.warn('Subscription could not be initialized as permission was denied.');
//       return false;
//     }
//   } catch (error) {
//     console.error('Failed to initialize notifications:', error);
//     return false;
//   }
// };


// Function to request notification permission
// export const requestNotificationPermission = async (): Promise<PushSubscription | null> => {
//   try {
//     const permission = await Notification.requestPermission();

//     if (permission === 'granted') {
//       console.log('Notification permission granted.');

//       // Unsubscribe from any existing subscriptions
//       await unsubscribeExisting();

//       // Register service worker and get push subscription
//       const registration = await navigator.serviceWorker.ready;
//       const subscription = await registration.pushManager.subscribe({
//         userVisibleOnly: true,
//         applicationServerKey: urlBase64ToUint8Array('BA7vOsBuHw_k9EJORm_v068uvYAU5YLFPfQ91ymcQUsog0SxWiFXceoXShYJEDAcnvfXAdOVOqPL7NXujGs5ct8') // Replace with your VAPID public key
//       });

//       console.log('Push subscription successfully created:', subscription);
//       return subscription;
//     } else {
//       console.warn('Notification permission denied.');
//       return null;
//     }
//   } catch (error) {
//     console.error('Error requesting notification permission:', error);
//     return null;
//   }
// };