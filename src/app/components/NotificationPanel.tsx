import { X, Check } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.orderId) {
      navigate(`/order-status/${notification.orderId}`);
      onClose();
    }
  };

  return (
    <div className="fixed top-16 right-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-[#F57C00] hover:text-[#E65100]"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{notification.title}</p>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-[#F57C00] rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                  {notification.read && (
                    <Check className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
