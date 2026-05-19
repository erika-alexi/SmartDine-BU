import { useNavigate } from 'react-router';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some delicious food to get started!</p>
          <button
            onClick={() => navigate('/menu')}
            className="bg-[#F57C00] text-white px-6 py-3 rounded-lg hover:bg-[#E65100]"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/menu')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#F57C00] mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Continue Shopping
        </button>

        <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:mb-8 sm:text-3xl">Shopping Cart</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div key={`${item.id}-${index}`} className="rounded-lg bg-white p-4 shadow-md">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-40 w-full rounded-lg object-cover sm:h-24 sm:w-24"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                    {item.addOns && item.addOns.length > 0 && (
                      <div className="text-xs text-gray-600 mb-2">
                        <p className="font-medium">Add-ons:</p>
                        {item.addOns.map(addOn => (
                          <p key={addOn.id}>- {addOn.name} (+₱{addOn.price})</p>
                        ))}
                      </div>
                    )}
                    <p className="text-lg font-bold text-[#F57C00]">
                      ₱{item.price + (item.addOns?.reduce((sum, a) => sum + a.price, 0) || 0)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <button
                      onClick={() => removeFromCart(item.id, item.addOns)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.addOns)}
                        className="p-2 hover:bg-gray-100 rounded-l-lg"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-3 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.addOns)}
                        className="p-2 hover:bg-gray-100 rounded-r-lg"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-lg bg-white p-4 shadow-md sm:p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₱{totalPrice}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-[#F57C00]">₱{totalPrice}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-[#F57C00] text-white py-3 rounded-lg hover:bg-[#E65100] font-semibold"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
