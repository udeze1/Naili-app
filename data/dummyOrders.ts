// /data/dummyOrders.ts
export const orders = [
  {
    id: '1',
    vendor: 'Nonifoods',
    status: 'Ongoing',
    items: ['Egusi Soup & Pounded Yam'],
    date: new Date(),
    orderId: 'NF001',
    price: '₦3,200',
    ETA: 15, // ETA in minutes (dummy)
  },
  {
    id: '2',
    vendor: 'Spicy Bites',
    status: 'Delivered',
    items: ['Jollof Rice & Chicken'],
    date: new Date(Date.now() - 3600 * 1000 * 5), // 5 hours ago
    orderId: 'SB078',
    price: '₦2,700',
    ETA: null,
  },
];