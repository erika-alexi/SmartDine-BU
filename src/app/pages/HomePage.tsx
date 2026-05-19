import { useNavigate } from 'react-router';
import { Utensils, ArrowRight, CreditCard, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // 1. GET LIVE DATA FROM CONTEXT
  const { menuItems, addToCart, isLoading } = useCart();

  // 2. DYNAMICALLY FIND YOUR SPECIALS FROM THE LIVE DATABASE
  const todaysSpecials = [
    menuItems.find(item => item.id === 'main-1'),
    menuItems.find(item => item.id === 'rice-1'),
    menuItems.find(item => item.id === 'main-4')
  ].filter(Boolean); // Filters out any undefined items if they haven't loaded yet

  const handleAddToCart = (item: any) => {
    if (!isAuthenticated) {
      toast.error('Please login first', {
        description: "You need to login before adding items to cart"
      });
      setTimeout(() => navigate('/login'), 1000);
      return;
    }
    addToCart(item);
    toast.success('Added to cart!');
  };

  // 3. SHOW LOADING STATE WHILE DATABASE IS FETCHING
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading live specials...</div>;
  }

  return (
    <div className="min-h-screen w-full">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-[#F57C00] to-[#FF9800] py-12 text-white sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-white/20 p-5 sm:p-6">
                <Utensils className="h-12 w-12 sm:h-16 sm:w-16" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold sm:text-5xl">SmartDine BU</h1>
            <p className="mb-2 text-lg sm:text-xl">Bicol University Polangui - Canteen Ordering System</p>
            <p className="mb-8 text-base opacity-90 sm:text-lg">Order delicious Filipino food from our school canteen!</p>
            <button
              onClick={() => isAuthenticated ? navigate('/menu') : navigate('/login')}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-[#F57C00] hover:bg-gray-100 sm:px-8"
            >
              {isAuthenticated ? 'View Menu' : 'Start Ordering'}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Today's Specials */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">Today's Specials</h2>
            <p className="text-gray-600">Check out our featured dishes!</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {todaysSpecials.map((item: any) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 sm:p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-4">{item.category}</p>
                  <div className="flex items-center justify-between gap-3">
                    {/* THIS NOW USES THE 150 PRICE FROM THE LIVE item OBJECT */}
                    <span className="text-2xl font-bold text-[#F57C00]">₱{item.price}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="shrink-0 rounded-lg bg-[#F57C00] px-4 py-2 text-white hover:bg-[#E65100]"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

           {/* Features */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="bg-[#FFF3E0] p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-8 w-8 text-[#F57C00]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Wide Menu Selection</h3>
              <p className="text-gray-600">Choose from authentic Filipino dishes, snacks, and beverages</p>
            </div>

            <div className="text-center">
              <div className="bg-[#E3F2FD] p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-[#0288D1]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Flexible Payment</h3>
              <p className="text-gray-600">Pay with Cash on Delivery or GCash</p>
            </div>

            <div className="text-center">
              <div className="bg-[#FFF3E0] p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-[#F57C00]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Quick & Easy</h3>
              <p className="text-gray-600">Order online and pick up at your convenience</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
