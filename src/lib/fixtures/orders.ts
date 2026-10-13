/**
 * Fixture Orders for Addis Eats (Sample Data)
 * Timestamps in UTC ISO strings; prices in integer whole Birr (ETB).
 * Neighborhoods in Addis Ababa (Bole, Kazanchis, Megenagna, Piassa, Sarbet).
 */

export type OrderStatus = "received" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";

export interface OrderItem {
  dishId: string;
  name: string;
  price: number; // Integer ETB at purchase time
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  phone: string;
  address: string;
  neighborhood: "Bole" | "Kazanchis" | "Megenagna" | "Piassa" | "Sarbet";
  items: OrderItem[];
  subtotal: number; // Integer ETB
  status: OrderStatus;
  createdAt: string; // UTC ISO string
  estimatedDeliveryMinutes?: number;
  courier?: {
    name: string;
    phone: string;
    lat: number;
    lng: number;
  };
  deliveryLocation: {
    lat: number;
    lng: number;
    description: string;
  };
  idempotencyKey?: string;
}

export const FIXTURE_ORDERS: Order[] = [
  {
    id: "ord_812",
    userId: "usr_cust_1",
    customerName: "Abebe Bikila",
    phone: "+251911223344",
    address: "Bole Atlas, Cameroon St, House 412",
    neighborhood: "Bole",
    items: [
      { dishId: "kitfo", name: "Special Kitfo", price: 450, quantity: 2 },
      { dishId: "ethiopian-coffee", name: "Traditional Buna Ceremony Coffee", price: 80, quantity: 2 },
    ],
    subtotal: 1060,
    status: "received",
    createdAt: "2026-06-12T11:45:00.000Z",
    estimatedDeliveryMinutes: 35,
    courier: {
      name: "Mulugeta Tadesse",
      phone: "+251911998877",
      lat: 9.0010,
      lng: 38.7850,
    },
    deliveryLocation: {
      lat: 8.9950,
      lng: 38.7896,
      description: "Bole Atlas, Cameroon St",
    },
  },
  {
    id: "ord_811",
    userId: "usr_cust_1",
    customerName: "Abebe Bikila",
    phone: "+251911223344",
    address: "Bole Atlas, Cameroon St, House 412",
    neighborhood: "Bole",
    items: [
      { dishId: "doro-wot", name: "Classic Doro Wot", price: 520, quantity: 1 },
      { dishId: "fresh-spris-juice", name: "Spris Layered Juice", price: 130, quantity: 2 },
    ],
    subtotal: 780,
    status: "out_for_delivery",
    createdAt: "2026-06-11T12:15:00.000Z",
    estimatedDeliveryMinutes: 15,
    courier: {
      name: "Yared Bekele",
      phone: "+251922887766",
      lat: 8.9980,
      lng: 38.7870,
    },
    deliveryLocation: {
      lat: 8.9950,
      lng: 38.7896,
      description: "Bole Atlas, Cameroon St",
    },
  },
  {
    id: "ord_810",
    userId: "usr_cust_1",
    customerName: "Abebe Bikila",
    phone: "+251911223344",
    address: "Bole Atlas, Cameroon St, House 412",
    neighborhood: "Bole",
    items: [
      { dishId: "shekla-tibs", name: "Shekla Beef Tibs", price: 420, quantity: 2 },
      { dishId: "baklava", name: "Honey Walnut Baklava", price: 160, quantity: 1 },
    ],
    subtotal: 1000,
    status: "delivered",
    createdAt: "2026-06-08T18:30:00.000Z",
    deliveryLocation: {
      lat: 8.9950,
      lng: 38.7896,
      description: "Bole Atlas, Cameroon St",
    },
  },
  {
    id: "ord_809",
    userId: "usr_cust_1",
    customerName: "Abebe Bikila",
    phone: "+251911223344",
    address: "Bole Atlas, Cameroon St, House 412",
    neighborhood: "Bole",
    items: [
      { dishId: "shiro-tegamino", name: "Shiro Tegamino", price: 280, quantity: 1 },
      { dishId: "chechebsa", name: "Chechebsa (Kita Firfir)", price: 240, quantity: 1 },
    ],
    subtotal: 520,
    status: "delivered",
    createdAt: "2026-06-05T09:10:00.000Z",
    deliveryLocation: {
      lat: 8.9950,
      lng: 38.7896,
      description: "Bole Atlas, Cameroon St",
    },
  },
  // Customer B orders (for IDOR attack 2 testing)
  {
    id: "ord_201",
    userId: "usr_cust_2",
    customerName: "Sara Haile",
    phone: "+251922334455",
    address: "Kazanchis, Guinea Conakry St, Apt 3B",
    neighborhood: "Kazanchis",
    items: [
      { dishId: "beyaynetu", name: "Vegetable Beyaynetu", price: 360, quantity: 2 },
      { dishId: "fresh-spris-juice", name: "Spris Layered Juice", price: 130, quantity: 2 },
    ],
    subtotal: 980,
    status: "received",
    createdAt: "2026-06-12T13:00:00.000Z",
    deliveryLocation: {
      lat: 9.0180,
      lng: 38.7720,
      description: "Kazanchis, Guinea Conakry St",
    },
  },
  // Additional neighborhood fixture orders for Day 46 Dashboard aggregation
  {
    id: "ord_301",
    userId: "usr_cust_3",
    customerName: "Tewodros Kassahun",
    phone: "+251933001122",
    address: "Megenagna, Ring Road Commercial Plaza",
    neighborhood: "Megenagna",
    items: [
      { dishId: "siga-key-wat", name: "Siga Key Wat", price: 400, quantity: 2 },
      { dishId: "ethiopian-coffee", name: "Traditional Buna Ceremony Coffee", price: 80, quantity: 3 },
    ],
    subtotal: 1040,
    status: "delivered",
    createdAt: "2026-06-03T12:00:00.000Z",
    deliveryLocation: {
      lat: 9.0210,
      lng: 38.8020,
      description: "Megenagna",
    },
  },
  {
    id: "ord_302",
    userId: "usr_cust_4",
    customerName: "Almaz Ayana",
    phone: "+251944112233",
    address: "Piassa, Churchill Ave, Historic Block",
    neighborhood: "Piassa",
    items: [
      { dishId: "quanta-firfir", name: "Quanta Firfir", price: 310, quantity: 1 },
      { dishId: "ethiopian-coffee", name: "Traditional Buna Ceremony Coffee", price: 80, quantity: 1 },
    ],
    subtotal: 390,
    status: "delivered",
    createdAt: "2026-06-04T08:30:00.000Z",
    deliveryLocation: {
      lat: 9.0340,
      lng: 38.7520,
      description: "Piassa",
    },
  },
  {
    id: "ord_303",
    userId: "usr_cust_5",
    customerName: "Haile Gebrselassie",
    phone: "+251955223344",
    address: "Sarbet, Old Airport Road, Villa 12",
    neighborhood: "Sarbet",
    items: [
      { dishId: "kitfo", name: "Special Kitfo", price: 450, quantity: 3 },
      { dishId: "fish-tibs", name: "Lake Tana Fish Tibs", price: 390, quantity: 2 },
    ],
    subtotal: 2130,
    status: "delivered",
    createdAt: "2026-06-07T19:00:00.000Z",
    deliveryLocation: {
      lat: 8.9880,
      lng: 38.7410,
      description: "Sarbet",
    },
  },
  {
    id: "ord_304",
    userId: "usr_cust_6",
    customerName: "Meseret Defar",
    phone: "+251966334455",
    address: "Bole Brass, Ring Road",
    neighborhood: "Bole",
    items: [
      { dishId: "doro-wot", name: "Classic Doro Wot", price: 520, quantity: 2 },
    ],
    subtotal: 1040,
    status: "delivered",
    createdAt: "2026-06-09T13:40:00.000Z",
    deliveryLocation: {
      lat: 8.9910,
      lng: 38.7940,
      description: "Bole Brass",
    },
  },
  {
    id: "ord_305",
    userId: "usr_cust_7",
    customerName: "Kenenisa Bekele",
    phone: "+251977445566",
    address: "Kazanchis, ECA Compound Gate 2",
    neighborhood: "Kazanchis",
    items: [
      { dishId: "shekla-tibs", name: "Shekla Beef Tibs", price: 420, quantity: 1 },
      { dishId: "shiro-tegamino", name: "Shiro Tegamino", price: 280, quantity: 1 },
    ],
    subtotal: 700,
    status: "delivered",
    createdAt: "2026-06-10T14:10:00.000Z",
    deliveryLocation: {
      lat: 9.0160,
      lng: 38.7690,
      description: "Kazanchis",
    },
  },
];
