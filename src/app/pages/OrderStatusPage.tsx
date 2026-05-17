import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, Clock, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { displayStatus, getOrderById, updateOrder } from '../services/orderService';

export function OrderStatusPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    const found = await getOrderById(orderId);
    if (found) setOrder(found);
  };

  const handleCustomerConfirm = async () => {
    if (!order) return;

    const nextStatus = order.adminConfirmed ? 'Completed' : 'Ready for Pickup';
    const updated = await updateOrder(order.id, {
      customerConfirmed: true,
      status: nextStatus,
    });

    if (updated) {
      if (updated.status === 'Completed') {
        addNotification(
          'Order Completed',
          `Order ${orderId} has been completed. Thank you!`,
          orderId
        );
      }
      setOrder(updated);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-gray-600">Order not found</p>
          <button
            onClick={() => navigate('/my-orders')}
            className="mt-4 text-[#F57C00] hover:underline"
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  const getStatusStep = () => {
    if (order.status === 'Completed') return 3;
    if (order.status === 'Ready for Pickup') return 2;
    if (order.status === 'Preparing') return 1;
    return 0;
  };

  const currentStep = getStatusStep();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/my-orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#F57C00] mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Orders
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Status</h1>
            <p className="text-gray-600">Order #{orderId}</p>
          </div>

          {/* Status Progress */}
          <div className="mb-12">
            <div className="flex justify-between items-center relative">
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
                <div
                  className="h-full bg-[#F57C00] transition-all duration-500"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>

              {[
                { label: 'Order Received', icon: CheckCircle },
                { label: 'Preparing', icon: Clock },
                { label: 'Ready for Pickup', icon: Package },
                { label: 'Completed', icon: CheckCircle }
              ].map((step, index) => (
                <div key={index} className="flex flex-col items-center relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      index <= currentStep
                        ? 'bg-[#F57C00] text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-center max-w-[80px]">{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup Time:</span>
                  <span className="font-medium">{order.pickupTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₱{order.subtotal ?? order.total}</span>
                </div>
                {Number(order.priorityFee || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ASAP Priority Fee:</span>
                    <span className="font-medium">+₱{order.priorityFee}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-[#F57C00]">₱{order.total}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Items Ordered</h3>
              <div className="space-y-2 text-sm">
                {order.items.slice(0, 3).map((item: any, index: number) => {
                  const itemTotal = item.price * item.quantity;
                  const addOnsTotal = item.addOns?.reduce((sum: number, addOn: any) => sum + addOn.price, 0) || 0;
                  const fullItemTotal = (item.price + addOnsTotal) * item.quantity;
                  
                  return (
                    <div key={index} className="border-b border-gray-200 pb-2 last:border-0">
                      <div className="flex justify-between">
                        <span className="text-gray-900 font-medium">
                          {item.name} x{item.quantity}
                        </span>
                        <span className="font-semibold">₱{fullItemTotal}</span>
                      </div>
                      {item.addOns && item.addOns.length > 0 && (
                        <div className="ml-2 mt-1">
                          {item.addOns.map((addOn: any, addOnIndex: number) => (
                            <div key={addOnIndex} className="text-xs text-gray-500">
                              + {addOn.name} (₱{addOn.price})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {order.items.length > 3 && (
                  <p className="text-gray-500 text-xs mt-2">+{order.items.length - 3} more items</p>
                )}
              </div>
            </div>
          </div>

          {/* Confirmation Section */}
          {order.status === 'Ready for Pickup' && !order.customerConfirmed && (
            <div className="bg-orange-50 border border-[#F57C00] rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Ready for Pickup!</h3>
              <p className="text-gray-600 mb-4">
                Your order is ready. Please pick it up and confirm once received.
              </p>
              <button
                onClick={handleCustomerConfirm}
                className="bg-[#F57C00] text-white px-6 py-2 rounded-lg hover:bg-[#E65100]"
              >
                Confirm Pickup
              </button>
            </div>
          )}

          {order.status === 'Completed' && (
            <div className="bg-green-50 border border-green-500 rounded-lg p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Order Completed!</h3>
              <p className="text-gray-600">Thank you for your order!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
