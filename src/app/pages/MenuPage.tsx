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
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#F57C00] mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Our Menu
          </h1>
          <p className="text-gray-600">
            Browse our delicious Filipino food selection
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for food..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00]"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8 flex gap-2 flex-wrap">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
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

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-40 object-cover"
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

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {item.name}
                </h3>

                <p className="text-sm text-gray-500 mb-3">
                  {item.category}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-[#F57C00]">
                    ₱{item.price}
                  </span>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="bg-[#F57C00] text-white px-3 py-2 rounded-lg hover:bg-[#E65100] flex items-center gap-1"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">

            <h2 className="text-2xl font-bold mb-4">
              Customize {selectedItem.name}
            </h2>

            <div className="space-y-5 mb-6">
              {Object.entries(addOnOptions).map(([groupName, options]) => (
                <div key={groupName}>
                  <h3 className="capitalize font-semibold text-gray-900 mb-2">{groupName}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {options.map(addOn => {
                      const checked = selectedAddOns.some(item => item.id === addOn.id);
                      return (
                        <button
                          key={addOn.id}
                          type="button"
                          onClick={() => toggleAddOn(addOn)}
                          className={`text-left border rounded-lg p-3 transition-colors ${
                            checked
                              ? 'border-[#F57C00] bg-orange-50 text-gray-900'
                              : 'border-gray-200 hover:border-[#F57C00]'
                          }`}
                        >
                          <span className="block font-medium">{addOn.name}</span>
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

            <div className="flex gap-3">
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
