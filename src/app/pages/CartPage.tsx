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
    <div className="min-h-screen py-4 sm:py-8">
      <div className="mx-auto max-w-4xl px-3 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/menu')}
          className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-[#F57C00] sm:mb-6 sm:text-base"
        >
          <ArrowLeft className="h-5 w-5" />
          Continue Shopping
        </button>

        <h1 className="mb-4 text-2xl font-bold text-gray-900 sm:mb-8 sm:text-3xl">Shopping Cart</h1>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8">
          {/* Cart Items */}
          <div className="space-y-3 lg:col-span-2 sm:space-y-4">
            {cart.map((item, index) => (
              <div key={`${item.id}-${index}`} className="rounded-lg bg-white p-3 shadow-md sm:p-4">
                <div className="grid grid-cols-[5.5rem_1fr] gap-3 sm:flex sm:gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-24 w-full rounded-lg object-cover sm:h-24 sm:w-24"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900 sm:text-base">{item.name}</h3>
                    <p className="mb-1 text-xs text-gray-500 sm:mb-2 sm:text-sm">{item.category}</p>
                    {item.addOns && item.addOns.length > 0 && (
                      <div className="mb-1 text-xs text-gray-600 sm:mb-2">
                        <p className="font-medium">Add-ons:</p>
                        {item.addOns.map(addOn => (
                          <p key={addOn.id}>- {addOn.name} (+₱{addOn.price})</p>
                        ))}
                      </div>
                    )}
                    <p className="text-base font-bold text-[#F57C00] sm:text-lg">
                      ₱{item.price + (item.addOns?.reduce((sum, a) => sum + a.price, 0) || 0)}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center justify-between gap-3 border-t border-gray-100 pt-2 sm:col-span-1 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                    <button
                      onClick={() => removeFromCart(item.id, item.addOns)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-1 rounded-lg border border-gray-300 sm:gap-2">
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
              <h2 className="mb-3 text-lg font-bold text-gray-900 sm:mb-4 sm:text-xl">Order Summary</h2>
              <div className="mb-4 space-y-2 sm:mb-6 sm:space-y-3">
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
                className="w-full rounded-lg bg-[#F57C00] py-2.5 font-semibold text-white hover:bg-[#E65100] sm:py-3"
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
