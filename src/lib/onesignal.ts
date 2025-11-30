/**
 * OneSignal Utility Module
 * Provides helper functions for managing OneSignal push notifications
 */

declare global {
    interface Window {
        OneSignal: any;
        OneSignalDeferred: Array<(OneSignal: any) => void>;
    }
}

/**
 * Request notification permission from the user
 * @returns Promise that resolves when permission is granted or denied
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!window.OneSignal) {
        console.warn('OneSignal not initialized');
        return false;
    }

    try {
        const permission = await window.OneSignal.Notifications.requestPermission();
        return permission;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
};

/**
 * Check if push notifications are enabled
 * @returns Promise that resolves to true if enabled
 */
export const isPushEnabled = async (): Promise<boolean> => {
    if (!window.OneSignal) {
        return false;
    }

    try {
        return await window.OneSignal.User.PushSubscription.optedIn;
    } catch (error) {
        console.error('Error checking push status:', error);
        return false;
    }
};

/**
 * Set user tags for targeted notifications
 * @param tags Object containing key-value pairs for user segmentation
 */
export const setUserTags = async (tags: Record<string, string>): Promise<void> => {
    if (!window.OneSignal) {
        console.warn('OneSignal not initialized');
        return;
    }

    try {
        await window.OneSignal.User.addTags(tags);
    } catch (error) {
        console.error('Error setting user tags:', error);
    }
};

/**
 * Get the OneSignal user ID
 * @returns Promise that resolves to the user's OneSignal ID
 */
export const getOneSignalUserId = async (): Promise<string | null> => {
    if (!window.OneSignal) {
        return null;
    }

    try {
        return await window.OneSignal.User.PushSubscription.id;
    } catch (error) {
        console.error('Error getting OneSignal user ID:', error);
        return null;
    }
};

/**
 * Show a native prompt to subscribe to push notifications
 */
export const showNativePrompt = async (): Promise<void> => {
    if (!window.OneSignal) {
        console.warn('OneSignal not initialized');
        return;
    }

    try {
        await window.OneSignal.Slidedown.promptPush();
    } catch (error) {
        console.error('Error showing native prompt:', error);
    }
};

/**
 * Set external user ID (e.g., your app's user ID)
 * @param externalId Your application's user ID
 */
export const setExternalUserId = async (externalId: string): Promise<void> => {
    if (!window.OneSignal) {
        console.warn('OneSignal not initialized');
        return;
    }

    try {
        await window.OneSignal.login(externalId);
    } catch (error) {
        console.error('Error setting external user ID:', error);
    }
};

/**
 * Remove external user ID (logout)
 */
export const removeExternalUserId = async (): Promise<void> => {
    if (!window.OneSignal) {
        console.warn('OneSignal not initialized');
        return;
    }

    try {
        await window.OneSignal.logout();
    } catch (error) {
        console.error('Error removing external user ID:', error);
    }
};
