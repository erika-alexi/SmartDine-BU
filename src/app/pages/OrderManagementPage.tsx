import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { displayStatus, getAllOrders, updateOrder } from '../services/orderService';

export function OrderManagementPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    await updateOrder(orderId, { status: newStatus as any });
    const target = orders.find((order: any) => order.id === orderId);
    if (target?.userId) {
      const notificationKey = `smartdine_notifications_${target.userId}`;
      const notifications = JSON.parse(localStorage.getItem(notificationKey) || '[]');
      notifications.unshift({
        id: `notif-${Date.now()}`,
        title: 'Order Status Updated',
        message: `Your order ${orderId} is now: ${displayStatus(newStatus)}`,
        timestamp: new Date().toISOString(),
        read: false,
        orderId
      });
      localStorage.setItem(notificationKey, JSON.stringify(notifications));
    }
    loadOrders();
  };

  const confirmOrder = async (orderId: string) => {
    const target = orders.find((order: any) => order.id === orderId);
    if (!target) return;

    const nextStatus = target.customerConfirmed ? 'Completed' : 'Ready for Pickup';
    await updateOrder(orderId, {
      adminConfirmed: true,
      status: nextStatus,
    });

    if (target.userId) {
      const notificationKey = `smartdine_notifications_${target.userId}`;
      const notifications = JSON.parse(localStorage.getItem(notificationKey) || '[]');
      notifications.unshift({
        id: `notif-${Date.now()}`,
        title: nextStatus === 'Completed' ? 'Order Completed' : 'Order Ready for Pickup',
        message: nextStatus === 'Completed'
          ? `Order ${orderId} has been completed. Thank you!`
          : `Your order ${orderId} is ready! Please pick it up.`,
        timestamp: new Date().toISOString(),
        read: false,
        orderId
      });
      localStorage.setItem(notificationKey, JSON.stringify(notifications));
    }

    loadOrders();
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#F57C00] mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">Order Management</h1>
          <p className="text-gray-600">View and manage all orders</p>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow-md sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by order ID or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00]"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Order Received</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="rounded-lg bg-white p-4 shadow-md sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <h3 className="break-all font-bold text-gray-900">Order #{order.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'Ready for Pickup'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {displayStatus(order.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Customer</p>
                        <p className="font-medium">{order.userName}</p>
                        <p className="text-xs text-gray-500">{order.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Order Details</p>
                        <p className="font-medium">{order.items.length} items • ₱{order.total}</p>
                        <p className="text-xs text-gray-500">{order.paymentMethod} • {order.pickupTime}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Items:</p>
                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 5).map((item: any, idx: number) => (
                          <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                            {item.name} x{item.quantity}
                          </span>
                        ))}
                        {order.items.length > 5 && (
                          <span className="text-sm text-gray-500">+{order.items.length - 5} more</span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-2 lg:w-auto lg:min-w-[200px]">
                    {order.status !== 'Completed' && (
                      <>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00]"
                        >
                          <option value="Pending">Order Received</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Ready for Pickup">Ready for Pickup</option>
                        </select>

                        {(order.status === 'Ready for Pickup' || order.customerConfirmed) && !order.adminConfirmed && (
                          <button
                            onClick={() => confirmOrder(order.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                          >
                            Confirm Complete
                          </button>
                        )}
                      </>
                    )}

                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      <p>Customer: {order.customerConfirmed ? '✓' : '○'}</p>
                      <p>Admin: {order.adminConfirmed ? '✓' : '○'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
