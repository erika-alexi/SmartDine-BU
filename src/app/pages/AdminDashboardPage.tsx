import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingBag, Clock, CheckCircle, TrendingUp, Package, Utensils } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { displayStatus, getAllOrders } from '../services/orderService';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    const allOrders = await getAllOrders();
    setOrders(allOrders);
  };

  const activeOrders = orders.filter(o => o.status !== 'Completed');
  const completedOrders = orders.filter(o => o.status === 'Completed');
  const todayRevenue = orders
    .filter(o => {
      const orderDate = new Date(o.createdAt);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    })
    .reduce((sum, o) => sum + o.total, 0);

  const recentOrders = orders.slice(0, 5);

  const stats = [
    {
      label: 'Total Orders',
      value: orders.length,
      icon: ShoppingBag,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'Active Orders',
      value: activeOrders.length,
      icon: Clock,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      label: 'Completed Orders',
      value: completedOrders.length,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600'
    },
    {
      label: "Today's Revenue",
      value: `₱${todayRevenue}`,
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen py-4 sm:py-8">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 sm:text-base">Manage orders and menu items</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="rounded-lg bg-white p-3 shadow-md sm:p-6">
              <div className="flex items-start justify-between gap-2 sm:items-center">
                <div>
                  <p className="mb-1 text-xs text-gray-600 sm:text-sm">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900 sm:text-2xl">{stat.value}</p>
                </div>
                <div className={`rounded-lg p-2 sm:p-3 ${stat.color}`}>
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-2 lg:mb-8 lg:gap-6">
          <button
            onClick={() => navigate('/admin/orders')}
            className="rounded-lg bg-white p-3 text-left shadow-md transition-shadow hover:shadow-lg sm:p-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="w-fit rounded-lg bg-orange-100 p-3 sm:p-4">
                <Package className="h-6 w-6 text-[#F57C00] sm:h-8 sm:w-8" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold text-gray-900 sm:text-lg">Manage Orders</h3>
                <p className="text-xs text-gray-600 sm:text-base">View and update order status</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/menu')}
            className="rounded-lg bg-white p-3 text-left shadow-md transition-shadow hover:shadow-lg sm:p-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="w-fit rounded-lg bg-blue-100 p-3 sm:p-4">
                <Utensils className="h-6 w-6 text-[#4FC3F7] sm:h-8 sm:w-8" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold text-gray-900 sm:text-lg">Manage Menu</h3>
                <p className="text-xs text-gray-600 sm:text-base">Add, edit, or remove menu items</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Orders */}
        <div className="rounded-lg bg-white p-4 shadow-md sm:p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div
                  key={order.id}
                  className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-3">
                      <p className="break-all font-semibold text-gray-900">Order #{order.id}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {displayStatus(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{order.userName} • {order.items.length} items</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-bold text-[#F57C00]">₱{order.total}</p>
                    <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
