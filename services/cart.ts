import { supabaseClient } from '../lib/supabase';

export interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    brand?: string;
    category?: string;
    description?: string;
  };
}

// ✅ 1. GET or CREATE USER CART
export async function getOrCreateUserCart(userId: string): Promise<string | null> {
  const { data: existingCart, error } = await supabaseClient
    .from('cart')
    .select()
    .eq('user_id', userId)
    .eq('status', 'open')
    .maybeSingle();

  if (error) {
    console.error('❌ Error checking cart:', error.message);
    return null;
  }

  if (existingCart) return existingCart.id;

  const { data: newCart, error: insertError } = await supabaseClient
    .from('cart')
    .insert([{ user_id: userId, status: 'open' }])
    .select()
    .single();

  if (insertError || !newCart) {
    console.error('❌ Error creating cart:', insertError?.message);
    return null;
  }

  return newCart.id;
}

// ✅ 2. ADD TO CART
export async function addToCart(product_id: string, quantity: number, user_id: string) {
  const cart_id = await getOrCreateUserCart(user_id);
  if (!cart_id) return;

  if (quantity === 0) {
    const { error } = await supabaseClient
      .from('cart_items')
      .delete()
      .match({ cart_id, product_id, added_by: user_id });

    if (error) console.error('❌ Remove error:', error.message);
    return;
  }

  const { error } = await supabaseClient
    .from('cart_items')
    .upsert([
      {
        cart_id,
        product_id,
        quantity,
        added_by: user_id,
      },
    ])
    .select();

  if (error) console.error('❌ Upsert error:', error.message);
}

// ✅ 3. UPDATE CART ITEM
export async function updateCartItem(
  cart_id: string,
  product_id: string,
  quantity: number,
  user_id: string
) {
  if (quantity === 0) {
    const { error } = await supabaseClient
      .from('cart_items')
      .delete()
      .match({ cart_id, product_id, added_by: user_id });

    return { success: !error, error };
  }

  const { data: existing } = await supabaseClient
    .from('cart_items')
    .select('*')
    .eq('cart_id', cart_id)
    .eq('product_id', product_id)
    .eq('added_by', user_id)
    .maybeSingle();

  if (existing) {
    const { error: updateError } = await supabaseClient
      .from('cart_items')
      .update({ quantity })
      .eq('id', existing.id);

    return { success: !updateError, error: updateError };
  } else {
    const { error: insertError } = await supabaseClient
      .from('cart_items')
      .insert([{ cart_id, product_id, quantity, added_by: user_id }]);

    return { success: !insertError, error: insertError };
  }
}

// ✅ 4. GET CART ITEMS
export async function getCartItems(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabaseClient
    .from('cart_items')
    .select(`
      id,
      quantity,
      product:product_id (
        id,
        name,
        price,
        image_url,
        brand,
        category,
        description
      )
    `)
    .eq('added_by', userId);

  if (error) {
    console.error('❌ Error fetching cart items:', error.message);
    return [];
  }

  return data as unknown as CartItem[];
}

// ✅ 5. CONFIRM ORDER
export async function confirmOrder({
  userId,
  items,
  delivery_address,
  delivery_phone,
  delivery_note,
}: {
  userId: string;
  items: CartItem[];
  delivery_address: string;
  delivery_phone: string;
  delivery_note?: string;
}): Promise<{ orderId: string } | null> {
  if (!userId) {
    console.error('❌ No user ID provided for confirmOrder.');
    return null;
  }

  const { data: order, error: orderError } = await supabaseClient
    .from('orders')
    .insert([
      {
        customer_id: userId,
        delivery_address,
        delivery_phone,
        delivery_note,
        status: 'pending',
      },
    ])
    .select()
    .single();

  if (orderError || !order) {
    console.error('❌ Order creation error:', orderError?.message);
    return null;
  }

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: item.product.price,
  }));

  const { error: itemError } = await supabaseClient
    .from('order_items')
    .insert(orderItems);

  if (itemError) {
    console.error('❌ Order items insert error:', itemError.message);
    return null;
  }

  await supabaseClient
    .from('cart_items')
    .delete()
    .eq('added_by', userId);

  return { orderId: order.id };
}