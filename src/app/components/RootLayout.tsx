import { Outlet, useNavigate, useLocation } from 'react-router';
import { Utensils, ShoppingCart, Bell, User, LogOut, Package, Menu, X } from 'lucide-react';
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    setShowMobileMenu(false);
    if (isAdminRoute) {
      navigate('/admin/login');
    } else {
      navigate('/');
    }
  };

  const goTo = (path: string) => {
    navigate(path);
    setShowMobileMenu(false);
  };

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 items-center justify-between gap-3 py-2">
            {/* Logo */}
            <button
              onClick={() => goTo(isAdminRoute ? '/admin/dashboard' : '/')}
              className="flex min-w-0 items-center gap-2 text-left hover:opacity-80"
            >
              <div className="shrink-0 bg-[#F57C00] p-2 rounded-lg">
                <Utensils className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate font-bold text-gray-900">SmartDine BU</h1>
                <p className="hidden text-xs text-gray-500 sm:block">School Canteen System</p>
              </div>
            </button>

            {/* Navigation */}
            <div className="hidden items-center gap-4 md:flex">
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
                  <div className="flex max-w-44 items-center gap-2">
                    <User className="h-5 w-5 text-gray-600" />
                    <span className="truncate text-sm text-gray-700">{user.name}</span>
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

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="relative rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
              aria-label={showMobileMenu ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={showMobileMenu}
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              {!isAdminRoute && user && (totalItems > 0 || unreadCount > 0) && (
                <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#F57C00]" />
              )}
            </button>
          </div>

          {showMobileMenu && (
            <div className="space-y-2 border-t border-gray-100 pb-4 pt-3 md:hidden">
              {!isAdminRoute && user && (
                <>
                  <button onClick={() => goTo('/menu')} className="block w-full rounded-lg px-3 py-3 text-left text-gray-700 hover:bg-orange-50 hover:text-[#F57C00]">
                    Menu
                  </button>
                  <button onClick={() => goTo('/my-orders')} className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-gray-700 hover:bg-orange-50 hover:text-[#F57C00]">
                    <Package className="h-4 w-4" />
                    Orders
                  </button>
                  <button onClick={() => goTo('/cart')} className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-gray-700 hover:bg-orange-50 hover:text-[#F57C00]">
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Cart
                    </span>
                    {totalItems > 0 && <span className="rounded-full bg-[#F57C00] px-2 py-0.5 text-xs text-white">{totalItems}</span>}
                  </button>
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowMobileMenu(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-gray-700 hover:bg-orange-50 hover:text-[#F57C00]"
                  >
                    <span className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notifications
                    </span>
                    {unreadCount > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{unreadCount}</span>}
                  </button>
                </>
              )}

              {user ? (
                <div className="border-t border-gray-100 pt-2">
                  <div className="flex min-w-0 items-center gap-2 px-3 py-2 text-sm text-gray-700">
                    <User className="h-5 w-5 shrink-0 text-gray-600" />
                    <span className="truncate">{user.name}</span>
                  </div>
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-red-600 hover:bg-red-50">
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </div>
              ) : (
                !isAdminRoute && (
                  <button onClick={() => goTo('/login')} className="w-full rounded-lg bg-[#F57C00] px-4 py-3 font-semibold text-white hover:bg-[#E65100]">
                    Login
                  </button>
                )
              )}
            </div>
          )}
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
