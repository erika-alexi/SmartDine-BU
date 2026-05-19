import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, ShoppingCart, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart, AddOn } from '../contexts/CartContext';
import { addOnOptions } from '../data/menuData';
import { toast } from 'sonner';

export function MenuPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, menuItems, isLoading } = useCart();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);

  const categories = [
    'All',
    ...new Set(menuItems.map(item => item.category))
  ];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (item: any) => {
    if (!isAuthenticated) {
      toast.error('Please login first', {
        description: 'You need to login before adding items to cart'
      });
      setTimeout(() => navigate('/login'), 1000);
      return;
    }

    if (item.category === 'Main Dishes') {
      setSelectedItem(item);
      setSelectedAddOns([]);
    } else {
      addToCart(item);
      toast.success(`${item.name} added to cart!`);
    }
  };

  const confirmAddWithAddOns = () => {
    if (selectedItem) {
      addToCart(selectedItem, selectedAddOns);
      toast.success(`${selectedItem.name} added to cart!`);
      setSelectedItem(null);
      setSelectedAddOns([]);
    }
  };

  const toggleAddOn = (addOn: AddOn) => {
    setSelectedAddOns(prev => {
      const exists = prev.find(a => a.id === addOn.id);
      if (exists) {
        return prev.filter(a => a.id !== addOn.id);
      }
      return [...prev, addOn];
    });
  };

  return (
    <div className="min-h-screen py-4 sm:py-8">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <button
            onClick={() => navigate('/')}
            className="mb-3 flex items-center gap-2 text-sm text-gray-600 hover:text-[#F57C00] sm:mb-4 sm:text-base"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </button>

          <h1 className="mb-1 text-2xl font-bold text-gray-900 sm:mb-2 sm:text-3xl">
            Our Menu
          </h1>
          <p className="text-sm text-gray-600 sm:text-base">
            Browse our delicious Filipino food selection
          </p>
        </div>

        {/* Search */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for food..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57C00] sm:py-3 sm:text-base"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 sm:mb-8 sm:flex-wrap sm:overflow-visible">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-base ${
                selectedCategory === category
                  ? 'bg-[#F57C00] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading menu...</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-28 w-full object-cover sm:h-40"
                />
                {item.allergens && item.allergens.length > 0 && (
                  <div className="absolute top-2 right-2 group">
                    <div
                      className="bg-red-500 text-white p-1 rounded-full shadow-md cursor-help"
                      aria-label={`Contains ${item.allergens.join(', ')}`}
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="absolute right-0 top-8 bg-gray-900 text-white text-xs rounded p-2 min-w-36 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      Contains: {item.allergens.join(', ')}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-4">
                <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900 sm:text-base">
                  {item.name}
                </h3>

                <p className="mb-2 truncate text-xs text-gray-500 sm:mb-3 sm:text-sm">
                  {item.category}
                </p>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <span className="text-lg font-bold text-[#F57C00] sm:text-xl">
                    ₱{item.price}
                  </span>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex shrink-0 items-center justify-center gap-1 rounded-lg bg-[#F57C00] px-3 py-2 text-xs text-white hover:bg-[#E65100] sm:text-base"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No items found matching your search
            </p>
          </div>
        )}
      </div>

      {/* Add-ons Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-4 sm:p-6">

            <h2 className="mb-4 text-xl font-bold sm:text-2xl">
              Customize {selectedItem.name}
            </h2>

            <div className="space-y-5 mb-6">
              {Object.entries(addOnOptions).map(([groupName, options]) => (
                <div key={groupName}>
                  <h3 className="capitalize font-semibold text-gray-900 mb-2">{groupName}</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {options.map(addOn => {
                      const checked = selectedAddOns.some(item => item.id === addOn.id);
                      return (
                        <button
                          key={addOn.id}
                          type="button"
                          onClick={() => toggleAddOn(addOn)}
                          className={`rounded-lg border p-2 text-left transition-colors sm:p-3 ${
                            checked
                              ? 'border-[#F57C00] bg-orange-50 text-gray-900'
                              : 'border-gray-200 hover:border-[#F57C00]'
                          }`}
                        >
                          <span className="block text-sm font-medium sm:text-base">{addOn.name}</span>
                          <span className="text-sm text-gray-600">+₱{addOn.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-[#F57C00]">
                  ₱
                  {selectedItem.price +
                    selectedAddOns.reduce((sum, a) => sum + a.price, 0)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 border border-gray-300 py-3 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={confirmAddWithAddOns}
                className="flex-1 bg-[#F57C00] text-white py-3 rounded-lg"
              >
                Add to Cart
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
