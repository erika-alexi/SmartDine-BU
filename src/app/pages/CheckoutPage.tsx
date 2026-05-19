import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { calculateCartTotal } from '../utils/orderTotals';
import { getDisplayPickupTime, getPickupOptions, getPriorityFee, validatePickupTime } from '../utils/pickup';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, totalPrice } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'GCash'>('COD');
  const [pickupTime, setPickupTime] = useState('');
  const pickupOptions = getPickupOptions();
  const subtotal = calculateCartTotal(cart);
  const priorityFee = getPriorityFee(pickupTime);
  const finalTotal = subtotal + priorityFee;
  const pickupValidation = validatePickupTime(pickupTime);

  const handlePlaceOrder = () => {
    const validation = validatePickupTime(pickupTime);

    if (cart.length === 0 || subtotal <= 0) {
      alert('Your cart is empty. Please add menu items before checking out.');
      navigate('/cart');
      return;
    }

    if (!validation.isValid) {
      alert(`Invalid pickup time\n${validation.error}`);
      return;
    }

    const orderData = {
      paymentMethod,
      pickupTime: getDisplayPickupTime(pickupTime),
      pickupType: pickupTime === 'ASAP' ? 'ASAP' : 'Scheduled',
      priorityFee,
      subtotal,
      total: finalTotal,
      items: cart
    };

    localStorage.setItem('pending_order', JSON.stringify(orderData));

    if (paymentMethod === 'GCash') {
      navigate('/payment');
    } else {
      navigate('/order-confirmation');
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#F57C00] mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Cart
        </button>

        <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:mb-8 sm:text-3xl">Checkout</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details */}
            <div className="rounded-lg bg-white p-4 shadow-md sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID / Email
                  </label>
                  <input
                    type="text"
                    value={user?.studentId || user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Time *
                  </label>
                  <select
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00]"
                    required
                  >
                    <option value="">Select pickup time</option>
                    {pickupOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {pickupValidation.warning && (
                    <p className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
                      ⚠️ Warning: {pickupValidation.warning}
                    </p>
                  )}
                  {pickupTime && !pickupValidation.isValid && (
                    <p className="mt-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
                      ⚠️ Warning: {pickupValidation.error}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-lg bg-white p-4 shadow-md sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border-gray-300 has-[:checked]:border-[#F57C00] has-[:checked]:bg-orange-50">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="w-4 h-4 text-[#F57C00]"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when you pick up your order</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border-gray-300 has-[:checked]:border-[#F57C00] has-[:checked]:bg-orange-50">
                  <input
                    type="radio"
                    name="payment"
                    value="GCash"
                    checked={paymentMethod === 'GCash'}
                    onChange={() => setPaymentMethod('GCash')}
                    className="w-4 h-4 text-[#F57C00]"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">GCash</p>
                    <p className="text-sm text-gray-600">Pay online via GCash</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-lg bg-white p-4 shadow-md sm:p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex justify-between gap-3 text-sm">
                    <span className="min-w-0 break-words text-gray-600">
                      {item.name} x{item.quantity}
                      {item.addOns && item.addOns.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {' '}(+{item.addOns.length} add-ons)
                        </span>
                      )}
                    </span>
                    <span className="font-medium">
                      ₱{(item.price + (item.addOns?.reduce((sum, a) => sum + a.price, 0) || 0)) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₱{subtotal}</span>
                </div>
                {priorityFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ASAP Priority Fee</span>
                    <span className="font-medium">+₱{priorityFee}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-3 border-t mb-6">
                  <span>Total</span>
                  <span className="text-[#F57C00]">₱{finalTotal}</span>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-[#F57C00] text-white py-3 rounded-lg hover:bg-[#E65100] font-semibold"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
