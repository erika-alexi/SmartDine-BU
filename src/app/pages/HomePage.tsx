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

          <div className="-mx-3 flex snap-x gap-3 overflow-x-auto px-3 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 lg:gap-8">
            {todaysSpecials.map((item: any) => (
              <div key={item.id} className="min-w-[78%] snap-start overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-xl sm:min-w-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-36 w-full object-cover sm:h-48"
                />
                <div className="p-3 sm:p-6">
                  <h3 className="mb-1 line-clamp-1 text-base font-semibold text-gray-900 sm:mb-2 sm:text-xl">{item.name}</h3>
                  <p className="mb-3 truncate text-xs text-gray-600 sm:mb-4 sm:text-base">{item.category}</p>
                  <div className="flex items-center justify-between gap-3">
                    {/* THIS NOW USES THE 150 PRICE FROM THE LIVE item OBJECT */}
                    <span className="text-lg font-bold text-[#F57C00] sm:text-2xl">₱{item.price}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="shrink-0 rounded-lg bg-[#F57C00] px-3 py-2 text-xs font-medium text-white hover:bg-[#E65100] sm:px-4 sm:text-base"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#FFF8F1] py-8 sm:bg-white sm:py-16">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="-mx-3 flex snap-x gap-3 overflow-x-auto px-3 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-8 sm:overflow-visible sm:px-0 sm:pb-0">
            <div className="min-w-[74%] snap-start rounded-lg bg-white/80 p-4 shadow-sm sm:min-w-0 sm:bg-transparent sm:p-0 sm:text-center sm:shadow-none">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF1DE] p-3 sm:mx-auto sm:mb-4 sm:h-16 sm:w-16 sm:p-4">
                <Utensils className="h-7 w-7 text-[#F57C00] sm:h-8 sm:w-8" />
              </div>
              <h3 className="mb-1.5 text-base font-bold leading-tight text-gray-900 sm:mb-2 sm:text-lg">Wide Menu Selection</h3>
              <p className="text-sm leading-snug text-gray-500 sm:text-base sm:leading-relaxed">
                Choose from Filipino dishes, snacks, drinks, and canteen favorites.
              </p>
            </div>

            <div className="min-w-[74%] snap-start rounded-lg bg-white/80 p-4 shadow-sm sm:min-w-0 sm:bg-transparent sm:p-0 sm:text-center sm:shadow-none">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF6FD] p-3 sm:mx-auto sm:mb-4 sm:h-16 sm:w-16 sm:p-4">
                <CreditCard className="h-7 w-7 text-[#0288D1] sm:h-8 sm:w-8" />
              </div>
              <h3 className="mb-1.5 text-base font-bold leading-tight text-gray-900 sm:mb-2 sm:text-lg">Flexible Payment</h3>
              <p className="text-sm leading-snug text-gray-500 sm:text-base sm:leading-relaxed">
                Pay through Cash on Delivery or upload GCash proof of payment.
              </p>
            </div>

            <div className="min-w-[74%] snap-start rounded-lg bg-white/80 p-4 shadow-sm sm:min-w-0 sm:bg-transparent sm:p-0 sm:text-center sm:shadow-none">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF1DE] p-3 sm:mx-auto sm:mb-4 sm:h-16 sm:w-16 sm:p-4">
                <Zap className="h-7 w-7 text-[#F57C00] sm:h-8 sm:w-8" />
              </div>
              <h3 className="mb-1.5 text-base font-bold leading-tight text-gray-900 sm:mb-2 sm:text-lg">Quick & Easy</h3>
              <p className="text-sm leading-snug text-gray-500 sm:text-base sm:leading-relaxed">
                Order ahead, choose pickup time, and track status from your phone.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
