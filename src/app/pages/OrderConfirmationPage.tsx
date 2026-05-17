import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { createOrder } from '../services/orderService';
import { calculateCartTotal } from '../utils/orderTotals';

export function OrderConfirmationPage() {
  const navigate = useNavigate();
  const { cart, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [orderId, setOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [error, setError] = useState('');
  const createdRef = useRef(false);

  useEffect(() => {
    if (createdRef.current) return;
    createdRef.current = true;

    const pendingOrder = localStorage.getItem('pending_order');
    if (!pendingOrder) {
      navigate('/cart');
      return;
    }

    const orderData = JSON.parse(pendingOrder);
    const orderItems = orderData.items?.length ? orderData.items : cart;
    const subtotal = calculateCartTotal(orderItems);
    const priorityFee = Number(orderData.priorityFee || 0);
    const finalTotal = Number(orderData.total || subtotal + priorityFee || totalPrice);

    if (!orderItems.length || finalTotal <= 0) {
      localStorage.removeItem('pending_order');
      alert('Your order total could not be verified. Please review your cart and checkout again.');
      navigate('/cart');
      return;
    }

    createOrder({
      user,
      cart: orderItems,
      total: finalTotal,
      subtotal,
      priorityFee,
      pickupType: orderData.pickupType,
      paymentMethod: orderData.paymentMethod,
      pickupTime: orderData.pickupTime,
    }).then(order => {
      setOrderId(order.id);
      setPaymentMethod(order.paymentMethod);
      setOrderTotal(order.total);

      clearCart();
      localStorage.removeItem('pending_order');

      addNotification(
        'Order Placed Successfully',
        `Your order ${order.id} has been received and is being prepared.`,
        order.id
      );
    }).catch((createError) => {
      setError(createError instanceof Error ? createError.message : 'Order could not be saved.');
      createdRef.current = false;
    });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-red-700 mb-3">Order Not Saved</h1>
            <p className="text-gray-700 mb-6">{error}</p>
            <p className="text-sm text-gray-600 mb-6">
              Please check your Supabase connection, login session, and database policies, then try checkout again.
            </p>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-[#F57C00] text-white py-3 rounded-lg hover:bg-[#E65100] font-semibold"
            >
              Back to Checkout
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!orderId) {
    return null;
  }

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Successful!</h1>
            <p className="text-gray-600">Thank you for your order</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <p className="font-semibold text-gray-900">{orderId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {paymentMethod === 'GCash' ? 'Amount Paid (GCash)' : 'Amount to Pay (COD)'}
                </p>
                <p className="font-semibold text-[#F57C00]">
                  ₱{orderTotal}
                </p>
                {paymentMethod === 'GCash' && (
                  <p className="text-xs text-green-600 mt-1">✓ Paid via GCash</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(`/order-status/${orderId}`)}
              className="w-full bg-[#F57C00] text-white py-3 rounded-lg hover:bg-[#E65100] font-semibold"
            >
              Track Order
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="w-full border-2 border-[#F57C00] text-[#F57C00] py-3 rounded-lg hover:bg-orange-50 font-semibold"
            >
              Order More Food
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full text-gray-600 py-3 rounded-lg hover:bg-gray-100"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
