import { useState } from 'react'
import { Card, Button } from '../../../components/ui'
import { formatTimestamp } from '../../../lib/utils/time'

interface Notification {
  id: string
  type: 'payment' | 'system' | 'warning'
  title: string
  message: string
  timestamp: number
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'payment',
      title: 'Payment Received',
      message: 'You received 0.5 ETH from 0x742d...0bEb9',
      timestamp: Date.now() - 3600000,
      read: false,
    },
    {
      id: '2',
      type: 'system',
      title: 'Network Switched',
      message: 'Connected to Ethereum Mainnet',
      timestamp: Date.now() - 7200000,
      read: true,
    },
    {
      id: '3',
      type: 'warning',
      title: 'High Gas Fees',
      message: 'Current gas price is above 50 Gwei',
      timestamp: Date.now() - 10800000,
      read: false,
    },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'payment':
        return '💰'
      case 'system':
        return 'ℹ️'
      case 'warning':
        return '⚠️'
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600">{unreadCount} unread</p>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={clearAll}>
            Clear all
          </Button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No notifications
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border-2 ${
                notification.read
                  ? 'border-gray-200 bg-white'
                  : 'border-blue-200 bg-blue-50'
              }`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getIcon(notification.type)}</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium">{notification.title}</p>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{notification.message}</p>
                  <p className="text-xs text-gray-500">
                    {formatTimestamp(notification.timestamp)}
                  </p>
                  {notification.action && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={notification.action.onClick}
                      className="mt-2"
                    >
                      {notification.action.label}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

