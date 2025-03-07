// Simple analytics helper to track events in the application

/**
 * Track a page view
 * @param path - The path to track
 */
export const trackPageView = (path: string) => {
  if (!window.gtag) return;
  window.gtag('config', 'G-3DHCK7TMT3', {
    page_path: path
  });
};

/**
 * Track an event
 * @param eventName - Name of the event to track
 * @param eventParams - Additional parameters for the event
 */
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (!window.gtag) return;
  window.gtag('event', eventName, eventParams);
};

// Pre-defined analytics events
export const ANALYTICS_EVENTS = {
  // Page access events
  LANDING_PAGE_VIEW: 'landing_page_view',
  DASHBOARD_ENTER: 'dashboard_enter',
  
  // User actions
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  GUEST_ENTRY: 'guest_entry',
  
  // Widget interactions
  WIDGET_ADD: 'widget_add',
  WIDGET_REMOVE: 'widget_remove',
  WIDGET_INTERACT: 'widget_interact',
  WIDGET_RESIZE: 'widget_resize',
  WIDGET_MOVE: 'widget_move',
  
  // Feature usage
  CHAT_OPEN: 'chat_open',
  CHAT_MESSAGE_SENT: 'chat_message_sent',
  LAYOUT_SAVED: 'layout_saved',
  LAYOUT_APPLIED: 'layout_applied'
};

// Add TypeScript type definition for gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set', 
      targetId: string | Date, 
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}
