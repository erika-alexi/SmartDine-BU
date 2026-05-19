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
      <section className="w-full bg-gradient-to-br from-[#F57C00] to-[#FF9800] py-8 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 flex justify-center sm:mb-6">
              <div className="rounded-full bg-white/20 p-4 sm:p-6">
                <Utensils className="h-10 w-10 sm:h-16 sm:w-16" />
              </div>
            </div>
            <h1 className="mb-3 text-3xl font-bold sm:mb-4 sm:text-5xl">SmartDine BU</h1>
            <p className="mb-2 text-base sm:text-xl">Bicol University Polangui - Canteen Ordering System</p>
            <p className="mb-6 text-sm opacity-90 sm:mb-8 sm:text-lg">Order delicious Filipino food from our school canteen!</p>
            <button
              onClick={() => isAuthenticated ? navigate('/menu') : navigate('/login')}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#F57C00] hover:bg-gray-100 sm:px-8 sm:py-3 sm:text-base"
            >
              {isAuthenticated ? 'View Menu' : 'Start Ordering'}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Today's Specials */}
      <section className="py-8 sm:py-16">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="mb-5 text-center sm:mb-12">
            <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">Today's Specials</h2>
            <p className="text-sm text-gray-600 sm:text-base">Check out our featured dishes!</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {todaysSpecials.map((item: any) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-28 w-full object-cover sm:h-48"
                />
                <div className="p-3 sm:p-6">
                  <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900 sm:mb-2 sm:text-xl">{item.name}</h3>
                  <p className="mb-3 truncate text-xs text-gray-600 sm:mb-4 sm:text-base">{item.category}</p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    {/* THIS NOW USES THE 150 PRICE FROM THE LIVE item OBJECT */}
                    <span className="text-lg font-bold text-[#F57C00] sm:text-2xl">₱{item.price}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="shrink-0 rounded-lg bg-[#F57C00] px-3 py-2 text-xs text-white hover:bg-[#E65100] sm:px-4 sm:text-base"
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
      <section className="bg-white py-8 sm:py-16">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            <div className="flex items-center gap-3 text-left sm:block sm:text-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF3E0] p-3 sm:mx-auto sm:mb-4 sm:h-16 sm:w-16 sm:p-4">
                <Utensils className="h-6 w-6 text-[#F57C00] sm:h-8 sm:w-8" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold sm:mb-2 sm:text-lg">Wide Menu Selection</h3>
                <p className="text-sm text-gray-600 sm:text-base">Choose from authentic Filipino dishes, snacks, and beverages</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left sm:block sm:text-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E3F2FD] p-3 sm:mx-auto sm:mb-4 sm:h-16 sm:w-16 sm:p-4">
                <CreditCard className="h-6 w-6 text-[#0288D1] sm:h-8 sm:w-8" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold sm:mb-2 sm:text-lg">Flexible Payment</h3>
                <p className="text-sm text-gray-600 sm:text-base">Pay with Cash on Delivery or GCash</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left sm:block sm:text-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF3E0] p-3 sm:mx-auto sm:mb-4 sm:h-16 sm:w-16 sm:p-4">
                <Zap className="h-6 w-6 text-[#F57C00] sm:h-8 sm:w-8" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold sm:mb-2 sm:text-lg">Quick & Easy</h3>
                <p className="text-sm text-gray-600 sm:text-base">Order online and pick up at your convenience</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
