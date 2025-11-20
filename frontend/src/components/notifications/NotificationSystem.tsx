/**
 * NotificationSystem - Advanced notification management system
 * @module components/notifications
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  LOADING = 'loading'
}

export enum NotificationPosition {
  TOP_LEFT = 'top-left',
  TOP_CENTER = 'top-center',
  TOP_RIGHT = 'top-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_CENTER = 'bottom-center',
  BOTTOM_RIGHT = 'bottom-right'
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  closable?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: number;
}

export interface NotificationContextValue {
  notifications: Notification[];
  success: (title: string, message?: string, options?: Partial<Notification>) => string;
  error: (title: string, message?: string, options?: Partial<Notification>) => string;
  warning: (title: string, message?: string, options?: Partial<Notification>) => string;
  info: (title: string, message?: string, options?: Partial<Notification>) => string;
  loading: (title: string, message?: string) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  update: (id: string, updates: Partial<Notification>) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export interface NotificationProviderProps {
  children: React.ReactNode;
  position?: NotificationPosition;
  maxNotifications?: number;
  defaultDuration?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  position = NotificationPosition.TOP_RIGHT,
  maxNotifications = 5,
  defaultDuration = 5000
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /**
   * Generate unique ID
   */
  const generateId = useCallback((): string => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Add notification
   */
  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'createdAt'>): string => {
      const id = generateId();
      const newNotification: Notification = {
        ...notification,
        id,
        createdAt: Date.now(),
        duration: notification.duration ?? defaultDuration,
        closable: notification.closable ?? true
      };

      setNotifications((prev) => {
        const updated = [...prev, newNotification];
        // Keep only the latest maxNotifications
        if (updated.length > maxNotifications) {
          return updated.slice(-maxNotifications);
        }
        return updated;
      });

      return id;
    },
    [generateId, defaultDuration, maxNotifications]
  );

  /**
   * Dismiss notification
   */
  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  /**
   * Dismiss all notifications
   */
  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Update notification
   */
  const update = useCallback((id: string, updates: Partial<Notification>) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );
  }, []);

  /**
   * Success notification
   */
  const success = useCallback(
    (title: string, message?: string, options?: Partial<Notification>): string => {
      return addNotification({
        type: NotificationType.SUCCESS,
        title,
        message,
        ...options
      });
    },
    [addNotification]
  );

  /**
   * Error notification
   */
  const error = useCallback(
    (title: string, message?: string, options?: Partial<Notification>): string => {
      return addNotification({
        type: NotificationType.ERROR,
        title,
        message,
        duration: 0, // Don't auto-dismiss errors
        ...options
      });
    },
    [addNotification]
  );

  /**
   * Warning notification
   */
  const warning = useCallback(
    (title: string, message?: string, options?: Partial<Notification>): string => {
      return addNotification({
        type: NotificationType.WARNING,
        title,
        message,
        ...options
      });
    },
    [addNotification]
  );

  /**
   * Info notification
   */
  const info = useCallback(
    (title: string, message?: string, options?: Partial<Notification>): string => {
      return addNotification({
        type: NotificationType.INFO,
        title,
        message,
        ...options
      });
    },
    [addNotification]
  );

  /**
   * Loading notification
   */
  const loading = useCallback(
    (title: string, message?: string): string => {
      return addNotification({
        type: NotificationType.LOADING,
        title,
        message,
        persistent: true,
        closable: false,
        duration: 0
      });
    },
    [addNotification]
  );

  /**
   * Auto-dismiss notifications
   */
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    notifications.forEach((notification) => {
      if (notification.duration && notification.duration > 0 && !notification.persistent) {
        const interval = setTimeout(() => {
          dismiss(notification.id);
        }, notification.duration);
        intervals.push(interval);
      }
    });

    return () => {
      intervals.forEach((interval) => clearTimeout(interval));
    };
  }, [notifications, dismiss]);

  const value: NotificationContextValue = {
    notifications,
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    dismissAll,
    update
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer position={position} notifications={notifications} onDismiss={dismiss} />
    </NotificationContext.Provider>
  );
};

/**
 * Notification Container Component
 */
interface NotificationContainerProps {
  position: NotificationPosition;
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  position,
  notifications,
  onDismiss
}) => {
  const positionClasses: Record<NotificationPosition, string> = {
    [NotificationPosition.TOP_LEFT]: 'top-4 left-4',
    [NotificationPosition.TOP_CENTER]: 'top-4 left-1/2 -translate-x-1/2',
    [NotificationPosition.TOP_RIGHT]: 'top-4 right-4',
    [NotificationPosition.BOTTOM_LEFT]: 'bottom-4 left-4',
    [NotificationPosition.BOTTOM_CENTER]: 'bottom-4 left-1/2 -translate-x-1/2',
    [NotificationPosition.BOTTOM_RIGHT]: 'bottom-4 right-4'
  };

  return (
    <div
      className={`fixed z-50 pointer-events-none ${positionClasses[position]}`}
      style={{ maxWidth: '420px' }}
    >
      <div className="space-y-2">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Notification Item Component
 */
interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDismiss }) => {
  const typeColors: Record<NotificationType, string> = {
    [NotificationType.SUCCESS]: 'bg-green-50 border-green-500 text-green-900',
    [NotificationType.ERROR]: 'bg-red-50 border-red-500 text-red-900',
    [NotificationType.WARNING]: 'bg-yellow-50 border-yellow-500 text-yellow-900',
    [NotificationType.INFO]: 'bg-blue-50 border-blue-500 text-blue-900',
    [NotificationType.LOADING]: 'bg-gray-50 border-gray-500 text-gray-900'
  };

  const typeIcons: Record<NotificationType, string> = {
    [NotificationType.SUCCESS]: '✓',
    [NotificationType.ERROR]: '✕',
    [NotificationType.WARNING]: '⚠',
    [NotificationType.INFO]: 'ℹ',
    [NotificationType.LOADING]: '⟳'
  };

  return (
    <div
      className={`
        pointer-events-auto
        rounded-lg border-l-4 p-4 shadow-lg
        animate-slide-in
        ${typeColors[notification.type]}
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-xl">
          {typeIcons[notification.type]}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{notification.title}</h4>
          {notification.message && (
            <p className="mt-1 text-sm opacity-90">{notification.message}</p>
          )}
          
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {notification.action.label}
            </button>
          )}
        </div>

        {notification.closable && (
          <button
            onClick={() => onDismiss(notification.id)}
            className="flex-shrink-0 text-lg opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Hook to use notifications
 */
export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

/**
 * Helper hook for payment notifications
 */
export const usePaymentNotifications = () => {
  const notifications = useNotifications();

  return {
    paymentInitiated: (amount: string, token: string) => {
      return notifications.loading(
        'Payment Initiated',
        `Processing ${amount} ${token}...`
      );
    },

    paymentProcessing: (id: string, txHash: string) => {
      notifications.update(id, {
        type: NotificationType.INFO,
        title: 'Payment Processing',
        message: `Transaction: ${txHash.substring(0, 10)}...`,
        closable: true
      });
    },

    paymentSuccess: (id: string, amount: string, token: string) => {
      notifications.update(id, {
        type: NotificationType.SUCCESS,
        title: 'Payment Successful',
        message: `${amount} ${token} has been sent successfully`,
        duration: 5000,
        closable: true,
        persistent: false
      });
    },

    paymentFailed: (id: string, error: string) => {
      notifications.update(id, {
        type: NotificationType.ERROR,
        title: 'Payment Failed',
        message: error,
        duration: 0,
        closable: true
      });
    },

    ...notifications
  };
};

