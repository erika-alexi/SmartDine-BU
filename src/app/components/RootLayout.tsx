import { Outlet, useNavigate, useLocation } from 'react-router';
import { Utensils, ShoppingCart, Bell, User, LogOut, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNotifications } from '../contexts/NotificationContext';
import { ChatBot } from './ChatBot';
import { NotificationPanel } from './NotificationPanel';
import { useState } from 'react';

export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    if (isAdminRoute) {
      navigate('/admin/login');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => navigate(isAdminRoute ? '/admin/dashboard' : '/')}
              className="flex items-center gap-2 hover:opacity-80"
            >
              <div className="bg-[#F57C00] p-2 rounded-lg">
                <Utensils className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">SmartDine BU</h1>
                <p className="text-xs text-gray-500">School Canteen System</p>
              </div>
            </button>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              {!isAdminRoute && user && (
                <>
                  <button
                    onClick={() => navigate('/menu')}
                    className="text-gray-700 hover:text-[#F57C00] px-3 py-2 rounded-md"
                  >
                    Menu
                  </button>
                  <button
                    onClick={() => navigate('/my-orders')}
                    className="text-gray-700 hover:text-[#F57C00] px-3 py-2 rounded-md flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Orders
                  </button>
                  <button
                    onClick={() => navigate('/cart')}
                    className="relative text-gray-700 hover:text-[#F57C00] p-2"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#F57C00] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative text-gray-700 hover:text-[#F57C00] p-2"
                  >
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </>
              )}

              {user ? (
                <div className="flex items-center gap-3 border-l pl-4 ml-2">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600 p-2"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                !isAdminRoute && (
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-[#F57C00] text-white px-4 py-2 rounded-lg hover:bg-[#E65100]"
                  >
                    Login
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ChatBot - only show for non-admin users */}
      {!isAdminRoute && <ChatBot />}
    </div>
  );
}
