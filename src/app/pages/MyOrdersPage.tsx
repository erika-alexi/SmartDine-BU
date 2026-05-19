import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Package, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { displayStatus, getOrdersForUser } from '../services/orderService';

export function MyOrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    const userOrders = await getOrdersForUser(user?.id);
    setOrders(userOrders);
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') return order.status !== 'Completed';
    if (filter === 'completed') return order.status === 'Completed';
    return true;
  });

  const getStatusColor = (status: string) => {
    if (status === 'Completed') return 'bg-green-100 text-green-800';
    if (status === 'Ready for Pickup') return 'bg-blue-100 text-blue-800';
    return 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#F57C00] mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </button>

        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All Orders' },
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as any)}
              className={`rounded-lg px-3 py-2 text-sm font-medium sm:px-4 sm:text-base ${
                filter === tab.value
                  ? 'bg-[#F57C00] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">Start ordering delicious food!</p>
            <button
              onClick={() => navigate('/menu')}
              className="bg-[#F57C00] text-white px-6 py-3 rounded-lg hover:bg-[#E65100]"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div
                key={order.id}
                className="cursor-pointer rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg sm:p-6"
                onClick={() => navigate(`/order-status/${order.id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h3 className="break-all font-semibold text-gray-900">Order #{order.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {displayStatus(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''} • {order.paymentMethod}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-gray-600 mb-1">Total</p>
                      <p className="text-xl font-bold text-[#F57C00]">₱{order.total}</p>
                    </div>
                    <button className="bg-[#F57C00] text-white px-4 py-2 rounded-lg hover:bg-[#E65100]">
                      View Details
                    </button>
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
