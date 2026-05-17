import { supabase } from '../lib/supabase';
import { CartItem } from '../contexts/CartContext';
import { User } from '../contexts/AuthContext';

export type OrderStatus = 'Pending' | 'Preparing' | 'Ready for Pickup' | 'Completed' | 'Cancelled';

export interface SmartDineOrder {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  studentId?: string;
  items: CartItem[];
  total: number;
  subtotal?: number;
  priorityFee?: number;
  pickupType?: 'ASAP' | 'Scheduled';
  paymentMethod: 'COD' | 'GCash';
  pickupTime: string;
  status: OrderStatus;
  customerConfirmed: boolean;
  adminConfirmed: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'smartdine_orders';

function getLocalOrders(): SmartDineOrder[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').map((order: any) => ({
    ...order,
    status: normalizeStatus(order.status),
  }));
}

function saveLocalOrders(orders: SmartDineOrder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function mapRowToOrder(row: any): SmartDineOrder {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    studentId: row.student_id || undefined,
    items: (row.order_items || []).map((item: any) => ({
      id: item.menu_item_id || item.id,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      category: '',
      image: '',
      addOns: item.add_ons || [],
    })),
    total: Number(row.total),
    subtotal: Number(row.subtotal ?? row.total),
    priorityFee: Number(row.priority_fee ?? 0),
    pickupType: row.pickup_type || (String(row.pickup_time).startsWith('ASAP') ? 'ASAP' : 'Scheduled'),
    paymentMethod: row.payment_method,
    pickupTime: row.pickup_time,
    status: normalizeStatus(row.status),
    customerConfirmed: Boolean(row.customer_confirmed),
    adminConfirmed: Boolean(row.admin_confirmed),
    createdAt: row.created_at,
  };
}

function appendLocalOrder(order: SmartDineOrder) {
  const orders = getLocalOrders();
  orders.push(order);
  saveLocalOrders(orders);
}

function normalizeStatus(status: string): OrderStatus {
  return status === 'Order Received' ? 'Pending' : status as OrderStatus;
}

export async function createOrder(params: {
  user: User | null;
  cart: CartItem[];
  paymentMethod: 'COD' | 'GCash';
  pickupTime: string;
  total: number;
  subtotal?: number;
  priorityFee?: number;
  pickupType?: 'ASAP' | 'Scheduled';
}) {
  const order: SmartDineOrder = {
    id: `ORD-${Date.now()}`,
    userId: params.user?.id,
    userName: params.user?.name || 'Guest',
    userEmail: params.user?.email || '',
    studentId: params.user?.studentId,
    items: params.cart,
    total: Number(params.total),
    subtotal: Number(params.subtotal ?? params.total),
    priorityFee: Number(params.priorityFee || 0),
    pickupType: params.pickupType || (params.pickupTime.startsWith('ASAP') ? 'ASAP' : 'Scheduled'),
    paymentMethod: params.paymentMethod,
    pickupTime: params.pickupTime,
    status: 'Pending',
    customerConfirmed: false,
    adminConfirmed: false,
    createdAt: new Date().toISOString(),
  };

  if (!supabase || !params.user?.id) {
    appendLocalOrder(order);
    return order;
  }

  const { error: orderError } = await supabase.from('orders').insert({
    id: order.id,
    user_id: params.user.id,
    user_name: order.userName,
    user_email: order.userEmail,
    student_id: order.studentId || null,
    status: order.status,
    payment_method: order.paymentMethod,
    pickup_time: order.pickupTime,
    total: order.total,
    subtotal: order.subtotal ?? order.total,
    priority_fee: order.priorityFee ?? 0,
    pickup_type: order.pickupType ?? 'Scheduled',
    admin_confirmed: false,
    customer_confirmed: false,
  });

  if (orderError) {
    throw new Error(`Supabase order insert failed: ${orderError.message}`);
  }

  const { error: itemsError } = await supabase.from('order_items').insert(
    params.cart.map(item => ({
      order_id: order.id,
      menu_item_id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: item.quantity,
      add_ons: item.addOns || [],
    }))
  );

  if (itemsError) {
    throw new Error(`Supabase order items insert failed: ${itemsError.message}`);
  }

  return order;
}

export async function getOrdersForUser(userId?: string) {
  if (supabase && userId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) return data.map(mapRowToOrder);
    if (error) console.warn('Using local orders because Supabase fetch failed:', error.message);
  }

  return getLocalOrders()
    .filter(order => !userId || order.userId === userId)
    .reverse();
}

export async function getAllOrders() {
  if (supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (!error && data) return data.map(mapRowToOrder);
    if (error) console.warn('Using local orders because Supabase admin fetch failed:', error.message);
  }

  return getLocalOrders().reverse();
}

export async function getOrderById(orderId?: string) {
  if (!orderId) return null;

  if (supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .maybeSingle();

    if (!error && data) return mapRowToOrder(data);
    if (error) console.warn('Using local order because Supabase order fetch failed:', error.message);
  }

  return getLocalOrders().find(order => order.id === orderId) || null;
}

export async function updateOrder(orderId: string, changes: Partial<SmartDineOrder>) {
  if (supabase) {
    const payload: Record<string, unknown> = {};
    if (changes.status) payload.status = normalizeStatus(changes.status);
    if (typeof changes.adminConfirmed === 'boolean') payload.admin_confirmed = changes.adminConfirmed;
    if (typeof changes.customerConfirmed === 'boolean') payload.customer_confirmed = changes.customerConfirmed;

    const { error } = await supabase
      .from('orders')
      .update(payload)
      .eq('id', orderId);

    if (error) console.warn('Updating local order because Supabase update failed:', error.message);
  }

  const orders = getLocalOrders();
  const index = orders.findIndex(order => order.id === orderId);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...changes, status: normalizeStatus(changes.status || orders[index].status) };
    saveLocalOrders(orders);
    return orders[index];
  }
  return null;
}

export function displayStatus(status: string) {
  return status === 'Pending' ? 'Order Received' : status;
}
