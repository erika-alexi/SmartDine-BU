import type { MenuItem } from '../contexts/CartContext';

export const menuItems: MenuItem[] = [
  // Main Dishes
  {
    id: 'main-1',
    name: 'Adobo',
    price: 75,
    category: 'Main Dishes',
    image: 'https://cdn.designfast.io/image/2026-03-20/e0dc9c17-eb90-45a7-a28f-c9f621d8bf3f.jpeg',
    allergens: ['Soy']
  },
  {
    id: 'main-2',
    name: 'Sinigang',
    price: 80,
    category: 'Main Dishes',
    image: 'https://cdn.designfast.io/image/2026-03-20/100c6b97-585d-4d7f-a5b3-cd808a019cdb.jpeg',
    allergens: ['Shellfish']
  },
  {
    id: 'main-3',
    name: 'Kare-Kare',
    price: 95,
    category: 'Main Dishes',
    image: 'https://cdn.designfast.io/image/2026-03-20/c253b147-7f67-42c2-9607-853f14398a28.jpeg',
    allergens: ['Peanuts']
  },
  {
    id: 'main-4',
    name: 'Fried Chicken',
    price: 85,
    category: 'Main Dishes',
    image: 'https://cdn.designfast.io/image/2026-03-20/aac80fd9-9a63-4068-bbfc-08787157a95f.jpeg',
    allergens: []
  },
  {
    id: 'main-5',
    name: 'Bicol Express',
    price: 90,
    category: 'Main Dishes',
    image: 'https://cdn.designfast.io/image/2026-03-20/dbe7accd-d630-491d-970c-14f18db5368b.jpeg',
    allergens: ['Dairy']
  },

  // Rice Meals
  {
    id: 'rice-1',
    name: 'Tapsilog',
    price: 70,
    category: 'Rice Meals',
    image: 'https://cdn.designfast.io/image/2026-03-20/5f852354-a1af-45b4-8086-d047fdbf6dec.jpeg',
    allergens: ['Soy']
  },
  {
    id: 'rice-2',
    name: 'Hamsilog',
    price: 65,
    category: 'Rice Meals',
    image: 'https://cdn.designfast.io/image/2026-03-20/deef82c7-24a8-4be8-b38f-f53b1d946bcb.jpeg',
    allergens: []
  },
  {
    id: 'rice-3',
    name: 'Hotsilog',
    price: 60,
    category: 'Rice Meals',
    image: 'https://cdn.designfast.io/image/2026-03-20/2909876c-a1bd-4e12-b55a-d4e068dda877.jpeg',
    allergens: []
  },
  {
    id: 'rice-4',
    name: 'Tocilog',
    price: 70,
    category: 'Rice Meals',
    image: 'https://cdn.designfast.io/image/2026-03-20/c5fd52f8-3ca6-4fcc-90ed-5410d2be8f03.jpeg',
    allergens: ['Soy']
  },

  // Noodles & Soups
  {
    id: 'noodle-1',
    name: 'Pancit Bihon',
    price: 50,
    category: 'Noodles & Soups',
    image: 'https://cdn.designfast.io/image/2026-03-20/e16e4b69-01df-4537-92af-2e945bd1409a.jpeg',
    allergens: ['Soy']
  },
  {
    id: 'noodle-2',
    name: 'Lomi',
    price: 55,
    category: 'Noodles & Soups',
    image: 'https://cdn.designfast.io/image/2026-03-20/3627bff0-6472-44b4-a56d-7242e9b00027.jpeg',
    allergens: ['Eggs']
  },
  {
    id: 'noodle-3',
    name: 'Lugaw',
    price: 40,
    category: 'Noodles & Soups',
    image: 'https://cdn.designfast.io/image/2026-03-20/d5ba9ec0-f465-4c76-b946-30efcd48f6d2.jpeg',
    allergens: []
  },
  {
    id: 'noodle-4',
    name: 'Mami',
    price: 50,
    category: 'Noodles & Soups',
    image: 'https://cdn.designfast.io/image/2026-03-20/d17e3d91-18c2-43cb-8fcc-f9c5e9023d93.jpeg',
    allergens: ['Soy']
  },

  // Snacks
  {
    id: 'snack-1',
    name: 'Pandesal',
    price: 5,
    category: 'Snacks',
    image: 'https://cdn.designfast.io/image/2026-03-20/92dd46af-a936-4bbe-8ade-b8ba795b3cf8.jpeg',
    allergens: ['Gluten']
  },
  {
    id: 'snack-2',
    name: 'Ensaymada',
    price: 15,
    category: 'Snacks',
    image: 'https://cdn.designfast.io/image/2026-03-20/2f982c87-3d6d-4c2c-94f9-84a7e76cf34d.jpeg',
    allergens: ['Gluten', 'Dairy']
  },
  {
    id: 'snack-3',
    name: 'Spanish Bread',
    price: 12,
    category: 'Snacks',
    image: 'https://cdn.designfast.io/image/2026-03-20/2f398e3c-0a64-450e-962a-2f44e872f3cb.jpeg',
    allergens: ['Gluten']
  },
  {
    id: 'snack-4',
    name: 'Chips',
    price: 20,
    category: 'Snacks',
    image: 'https://cdn.designfast.io/image/2026-03-20/b0a61075-541d-4756-aaae-9a896f5fa6f3.jpeg',
    allergens: []
  },
  {
    id: 'snack-5',
    name: 'Chicharon',
    price: 25,
    category: 'Snacks',
    image: 'https://cdn.designfast.io/image/2026-03-20/774decdd-7e85-4099-aaa3-ebb92aa19a9a.jpeg',
    allergens: []
  },

  // Desserts
  {
    id: 'dessert-1',
    name: 'Turon',
    price: 20,
    category: 'Desserts',
    image: 'https://cdn.designfast.io/image/2026-03-20/dfd2b9bd-d5f9-4be4-b4a2-7f4804401caa.jpeg',
    allergens: []
  },
  {
    id: 'dessert-2',
    name: 'Ice Cream',
    price: 30,
    category: 'Desserts',
    image: 'https://cdn.designfast.io/image/2026-03-20/0191064b-0354-41cd-9ea8-8b66019f78c9.jpeg',
    allergens: ['Dairy']
  },
  {
    id: 'dessert-3',
    name: 'Puto',
    price: 10,
    category: 'Desserts',
    image: 'https://cdn.designfast.io/image/2026-03-20/4f2a0707-7a02-4fcf-ac9a-29b9b897bad9.jpeg',
    allergens: []
  },
  {
    id: 'dessert-4',
    name: 'Bibingka',
    price: 25,
    category: 'Desserts',
    image: 'https://cdn.designfast.io/image/2026-03-20/99812d49-0c16-4d57-830f-417ae7ef6529.jpeg',
    allergens: ['Dairy', 'Eggs']
  },
  {
    id: 'dessert-5',
    name: 'Suman',
    price: 15,
    category: 'Desserts',
    image: 'https://cdn.designfast.io/image/2026-03-20/0456d19b-e40b-4895-aeed-ef3ed889ac66.jpeg',
    allergens: []
  },

  // Beverages
  {
    id: 'drink-1',
    name: 'Coke',
    price: 25,
    category: 'Beverages',
    image: 'https://cdn.designfast.io/image/2026-03-20/fb6b72e6-d6e7-446d-922c-6f88b4e3533e.png',
    allergens: []
  },
  {
    id: 'drink-2',
    name: 'Sprite',
    price: 25,
    category: 'Beverages',
    image: 'https://cdn.designfast.io/image/2026-03-20/d0a83867-89d8-4328-b54b-f01b84871dae.jpeg',
    allergens: []
  },
  {
    id: 'drink-3',
    name: 'Royal',
    price: 25,
    category: 'Beverages',
    image: 'https://cdn.designfast.io/image/2026-03-20/d09b370d-3dcf-47bf-aae9-7f68306f4a97.jpeg',
    allergens: []
  },
  {
    id: 'drink-4',
    name: 'Mountain Dew',
    price: 25,
    category: 'Beverages',
    image: 'https://cdn.designfast.io/image/2026-03-20/4556587b-9c95-4229-aae6-31b7fe3cb87d.jpeg',
    allergens: []
  },
  {
    id: 'drink-5',
    name: 'Bottled Water',
    price: 15,
    category: 'Beverages',
    image: 'https://cdn.designfast.io/image/2026-03-20/31d182ba-224b-4850-9dea-eec689483e03.png',
    allergens: []
  },

  // Street Food
  {
    id: 'street-1',
    name: 'Kwek-Kwek',
    price: 20,
    category: 'Street Food',
    image: 'https://cdn.designfast.io/image/2026-03-20/f33324ad-6b7e-41b4-b153-8c083345a13d.jpeg',
    allergens: ['Eggs']
  },
  {
    id: 'street-2',
    name: 'Fish Balls',
    price: 15,
    category: 'Street Food',
    image: 'https://cdn.designfast.io/image/2026-03-20/602b897c-0481-40f8-8f7a-2760cdb0a7a5.jpeg',
    allergens: []
  },
  {
    id: 'street-3',
    name: 'Kikiam',
    price: 20,
    category: 'Street Food',
    image: 'https://cdn.designfast.io/image/2026-03-20/0b456d7f-d80d-40d5-9cc9-84d3427ee453.jpeg',
    allergens: ['Soy']
  },

  // Add-ons
  {
    id: 'extra-1',
    name: 'Fried Egg',
    price: 10,
    category: 'Add-ons',
    image: 'https://cdn.designfast.io/image/2026-03-20/f5ba0727-4fb3-4da0-a307-167df5ad61a4.jpeg',
    allergens: ['Eggs']
  },
  {
    id: 'extra-2',
    name: 'Lumpia',
    price: 15,
    category: 'Add-ons',
    image: 'https://cdn.designfast.io/image/2026-03-20/f738f023-d1f3-4bf2-a283-7fa4500393c8.webp',
    allergens: []
  },
  {
    id: 'extra-3',
    name: 'Rice Refill',
    price: 10,
    category: 'Add-ons',
    image: 'https://cdn.designfast.io/image/2026-03-20/92ec6d79-db1a-420a-8114-573d2e5d2671.webp',
    allergens: []
  }
];

export const addOnOptions = {
  rice: [
    { id: 'rice-plain', name: 'Plain Rice', price: 15 },
    { id: 'rice-garlic', name: 'Garlic Rice', price: 20 },
    { id: 'rice-java', name: 'Java Rice', price: 25 }
  ],
  drinks: [
    { id: 'drink-coke', name: 'Coke', price: 25 },
    { id: 'drink-sprite', name: 'Sprite', price: 25 },
    { id: 'drink-water', name: 'Bottled Water', price: 15 }
  ],
  fruits: [
    { id: 'fruit-banana', name: 'Banana', price: 10 },
    { id: 'fruit-mango', name: 'Mango Slices', price: 20 },
    { id: 'fruit-watermelon', name: 'Watermelon', price: 15 }
  ]
};

export const categories = [
  'All',
  'Main Dishes',
  'Rice Meals',
  'Noodles & Soups',
  'Snacks',
  'Desserts',
  'Beverages',
  'Street Food',
  'Add-ons'
];
