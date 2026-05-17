import { CartItem } from '../contexts/CartContext';

export function calculateCartTotal(items: Pick<CartItem, 'price' | 'quantity' | 'addOns'>[]) {
  return items.reduce((sum, item) => {
    const addOnsTotal = item.addOns?.reduce((addOnSum, addOn) => addOnSum + Number(addOn.price), 0) || 0;
    return sum + (Number(item.price) + addOnsTotal) * Number(item.quantity);
  }, 0);
}
