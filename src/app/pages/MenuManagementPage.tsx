import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Edit, Trash2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { menuItems as defaultMenuItems, categories } from '../data/menuData';
import { archiveMenuItem, getMenuItems, upsertMenuItem } from '../services/menuService';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function MenuManagementPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Main Dishes',
    image: '',
    allergens: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    loadMenu();
  }, [user]);

  const loadMenu = async () => {
    const liveMenu = await getMenuItems();
    setMenuItems(liveMenu);

    if (supabase) {
      return;
    }

    const savedMenu = localStorage.getItem('smartdine_menu');
    if (savedMenu) {
      setMenuItems(JSON.parse(savedMenu));
    } else {
      setMenuItems(defaultMenuItems);
      localStorage.setItem('smartdine_menu', JSON.stringify(defaultMenuItems));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allergensList = formData.allergens
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0);

    const savedItem = {
      id: editingItem?.id || `custom-${Date.now()}`,
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image || editingItem?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      allergens: allergensList
    };

    try {
      await upsertMenuItem(savedItem);
    } catch (error) {
      toast.error('Menu item was not saved to Supabase', {
        description: error instanceof Error ? error.message : 'Please check admin permissions.'
      });
      return;
    }

    if (editingItem) {
      const updated = menuItems.map(item =>
        item.id === editingItem.id
          ? savedItem
          : item
      );
      setMenuItems(updated);
      if (!supabase) {
        localStorage.setItem('smartdine_menu', JSON.stringify(updated));
      }
    } else {
      const updated = [...menuItems, savedItem];
      setMenuItems(updated);
      if (!supabase) {
        localStorage.setItem('smartdine_menu', JSON.stringify(updated));
      }
    }

    toast.success(editingItem ? 'Menu item updated' : 'Menu item added');
    resetForm();
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      allergens: item.allergens?.join(', ') || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await archiveMenuItem(id);
        const updated = menuItems.filter(item => item.id !== id);
        setMenuItems(updated);
        if (!supabase) {
          localStorage.setItem('smartdine_menu', JSON.stringify(updated));
        }
        toast.success('Menu item removed');
      } catch (error) {
        toast.error('Menu item was not removed from Supabase', {
          description: error instanceof Error ? error.message : 'Please check admin permissions.'
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: 'Main Dishes',
      image: '',
      allergens: ''
    });
    setEditingItem(null);
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#F57C00] mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </button>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">Menu Management</h1>
            <p className="text-gray-600">Add, edit, or remove menu items</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#F57C00] px-6 py-3 text-white hover:bg-[#E65100] sm:w-auto"
          >
            <Plus className="h-5 w-5" />
            Add New Item
          </button>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {menuItems.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                {item.allergens && item.allergens.length > 0 && (
                  <p className="text-xs text-red-600 mb-2">
                    Allergens: {item.allergens.join(', ')}
                  </p>
                )}
                <p className="text-xl font-bold text-[#F57C00] mb-3">₱{item.price}</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="mb-6 flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₱) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00]"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allergens (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.allergens}
                    onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                    placeholder="Peanuts, Dairy, Soy"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00]"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-[#F57C00] text-white rounded-lg hover:bg-[#E65100]"
                  >
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
