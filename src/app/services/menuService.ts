import { supabase } from '../lib/supabase';
import { menuItems as fallbackMenuItems } from '../data/menuData';

const categoryOrder = [
  'Main Dishes',
  'Rice Meals',
  'Noodles & Soups',
  'Snacks',
  'Desserts',
  'Beverages',
  'Street Food',
  'Add-ons'
];

export function normalizeMenuCategory(category: string) {
  return category === 'Extras' ? 'Add-ons' : category;
}

export function sortMenuItems<T extends { category: string; name: string }>(items: T[]) {
  return [...items].sort((first, second) => {
    const firstIndex = categoryOrder.indexOf(normalizeMenuCategory(first.category));
    const secondIndex = categoryOrder.indexOf(normalizeMenuCategory(second.category));
    const safeFirstIndex = firstIndex === -1 ? categoryOrder.length : firstIndex;
    const safeSecondIndex = secondIndex === -1 ? categoryOrder.length : secondIndex;
    return safeFirstIndex - safeSecondIndex || first.name.localeCompare(second.name);
  });
}

export async function getMenuItems() {
  if (!supabase) {
    return sortMenuItems(fallbackMenuItems);
  }

  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('available', true)
    .order('category');

  if (error) {
    console.warn('Using bundled menu because Supabase menu fetch failed:', error.message);
    return fallbackMenuItems;
  }

  return sortMenuItems((data && data.length > 0 ? data : fallbackMenuItems).map(item => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
    category: normalizeMenuCategory(item.category),
    image: item.image_url || item.image,
    allergens: item.allergens || []
  })));
}

export async function upsertMenuItem(item: {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  allergens: string[];
}) {
  if (!supabase) return;

  const { error } = await supabase.from('menu_items').upsert({
    id: item.id,
    name: item.name,
    price: item.price,
    category: normalizeMenuCategory(item.category),
    image_url: item.image,
    allergens: item.allergens,
    available: true
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function archiveMenuItem(id: string) {
  if (!supabase) return;

  const { error } = await supabase
    .from('menu_items')
    .update({ available: false })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
