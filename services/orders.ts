// lib/orders.ts or api/orders.ts
import { supabaseClient } from '../lib/supabase';
import { CartItem } from '../services/cart'; // Adjust the import path as necessary

export type Order = {
  id: string;
  customer_id: string;
  cart_id: string | null;
  created_by?: string;
  status: string;
  total_amount: number;
  created_at: string;
};

export async function fetchOrderHistory(): Promise<Order[]> {
  const {
    data,
    error
  } = await supabaseClient
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error.message);
    return [];
  }

  return data || [];
} 

export const placeOrder = async (
  customer_id: string,
  cart_id: string,
  total_amount: number
) => {
  const { data: order, error: orderError } = await supabaseClient
    .from('orders')
    .insert([{ customer_id, cart_id, total_amount, status: 'completed' }])
    .select()
    .single();

  if (orderError) return { error: orderError };

  const { data: cartItems, error: cartError } = await supabaseClient
    .from('cart_items')
    .select('item_id, quantity')
    .eq('cart_id', cart_id);

  if (cartError) return { error: cartError };

  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    item_id: item.item_id,
    quantity: item.quantity,
  }));

  const { error: insertError } = await supabaseClient
    .from('order_items')
    .insert(orderItems);

  if (insertError) return { error: insertError };

  await supabaseClient.from('cart_items').delete().eq('cart_id', cart_id);

  return { data: order };
}; 

export const confirmOrder = async (
  cartId: string,
  userId: string,
  cartItems: CartItem[],
  delivery_address: string,
  delivery_phone: string,
  delivery_notes: string
) => {
  try {
    const total_amount = cartItems.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    );

    // 1. Create the order with delivery info
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert([
        {
          customer_id: userId,
          cart_id: cartId,
          total_amount,
          status: 'pending',
          delivery_address,
          delivery_phone,
          delivery_notes,
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Add order items
    const orderItemsPayload = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product?.id,
      quantity: item.quantity,
      unit_price: item.product?.price || 0,
    }));

    const { error: orderItemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItemsPayload);

    if (orderItemsError) throw orderItemsError;

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Confirm order failed:', error);
    return { success: false, error };
  }
};