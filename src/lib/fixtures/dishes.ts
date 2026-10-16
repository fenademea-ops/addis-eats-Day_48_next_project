/**
 * Fixture Dish Catalog for Addis Eats (Sample Data)
 * Prices are in integer whole Ethiopian Birr (ETB).
 */

export interface Dish {
  id: string;
  name: string;
  category: "Traditional" | "Vegetarian" | "Breakfast" | "Drinks" | "Desserts";
  price: number; // Integer ETB
  description: string;
  image: string;
  prepTime: string;
  spicy: boolean;
  featured?: boolean;
  ingredients?: string[];
  isAvailable?: boolean; // When false, item is Sold Out
}

export const FIXTURE_DISHES: Dish[] = [
  {
    id: "kitfo",
    name: "Special Kitfo",
    category: "Traditional",
    price: 450,
    description: "Finely minced lean beef seasoned with mitmita chili blend and infused with herb-clarified niter kibbeh butter. Served with kocho and ayib cottage cheese.",
    image: "/images/kitfo.png",
    prepTime: "15-20 min",
    spicy: true,
    featured: true,
    ingredients: ["Prime minced beef", "Niter kibbeh", "Mitmita chili", "Kocho", "Ayib"],
  },
  {
    id: "doro-wot",
    name: "Classic Doro Wot",
    category: "Traditional",
    price: 520,
    description: "Slow-simmered chicken drumstick in a rich, velvety berbere sauce with caramelized red onions and a hard-boiled egg. The crown jewel of Ethiopian feasts.",
    image: "/images/doro_wat.jpg",
    prepTime: "25-30 min",
    spicy: true,
    featured: true,
    ingredients: ["Free-range chicken", "Slow-cooked red onions", "Berbere", "Boiled egg", "Fresh injera"],
  },
  {
    id: "shekla-tibs",
    name: "Shekla Beef Tibs",
    category: "Traditional",
    price: 420,
    description: "Sizzling beef tenderloin cubes sautéed with rosemary, red onions, garlic, and fresh green jalapeño peppers. Served over a traditional clay brazier.",
    image: "/images/shekla-tibs.jpg",
    prepTime: "15 min",
    spicy: false,
    featured: true,
    ingredients: ["Beef tenderloin", "Fresh rosemary", "Onions", "Green peppers", "Clarified butter"],
  },
  {
    id: "siga-key-wat",
    name: "Siga Key Wat",
    category: "Traditional",
    price: 400,
    description: "Hearty beef stew cooked tender in spiced berbere gravy, seasoned with garlic, ginger, and aromatic korarima cardamom.",
    image: "/images/Siga_Key_Wat.jpg",
    prepTime: "20 min",
    spicy: true,
    ingredients: ["Tender beef cubes", "Berbere spice blend", "Korarima", "Red onions", "Garlic"],
  },
  {
    id: "shiro-tegamino",
    name: "Shiro Tegamino",
    category: "Vegetarian",
    price: 280,
    description: "Velvety spiced chickpea and split pea puree simmered bubbly in a traditional clay pot with garlic and diced tomatoes. Served with fresh injera.",
    image: "/images/Shiro_Tegabino.webp",
    prepTime: "10-15 min",
    spicy: false,
    featured: true,
    ingredients: ["Sun-dried chickpea flour", "Garlic", "Tomatoes", "Spiced oil", "Fresh injera"],
  },
  {
    id: "beyaynetu",
    name: "Vegetable Beyaynetu",
    category: "Vegetarian",
    price: 360,
    description: "Vibrant fasting platter featuring misir wot (red lentils), gomen (collard greens), ater kik (yellow split peas), tikil gomen (cabbage), and beetroot salad.",
    image: "/images/Beyaynetu.jpg",
    prepTime: "15 min",
    spicy: false,
    featured: true,
    ingredients: ["Red lentils", "Collard greens", "Yellow split peas", "Cabbage and carrots", "Beetroot salad"],
  },
  {
    id: "quanta-firfir",
    name: "Quanta Firfir",
    category: "Breakfast",
    price: 310,
    description: "Torn pieces of sourdough injera tossed in a savory, spiced berbere stew loaded with dried seasoned beef jerky (quanta). A traditional hearty breakfast.",
    image: "/images/quanta-firfir.jpg",
    prepTime: "15 min",
    spicy: true,
    ingredients: ["Dried seasoned beef (quanta)", "Torn injera", "Berbere gravy", "Clarified butter"],
  },
  {
    id: "chechebsa",
    name: "Chechebsa (Kita Firfir)",
    category: "Breakfast",
    price: 240,
    description: "Pan-fried shredded flatbread tossed in spiced niter kibbeh butter and mild berbere, drizzled with wild highland honey.",
    image: "/images/chechebsa.jpg",
    prepTime: "10 min",
    spicy: false,
    featured: true,
    ingredients: ["Wheat flatbread", "Niter kibbeh", "Highland honey", "Light berbere"],
  },
  {
    id: "fish-tibs",
    name: "Lake Tana Fish Tibs",
    category: "Traditional",
    price: 390,
    description: "Crispy fried lake fish fillets sautéed with shallots, sweet peppers, garlic, and fresh lemon. Light and savory.",
    image: "/images/fish-tibs.jpg",
    prepTime: "15-20 min",
    spicy: false,
    ingredients: ["White fish fillet", "Shallots", "Green peppers", "Lemon juice", "Garlic butter"],
  },
  {
    id: "ethiopian-coffee",
    name: "Traditional Buna Ceremony Coffee",
    category: "Drinks",
    price: 80,
    description: "Freshly roasted single-origin Yirgacheffe Arabica beans brewed in an authentic earthenware jebena. Served with popped corn and aromatic frankincense.",
    image: "/images/coffee.jpg",
    prepTime: "10 min",
    spicy: false,
    featured: true,
    ingredients: ["Fresh Yirgacheffe coffee beans", "Spring water", "Tena'adam rue herb"],
  },
  {
    id: "fresh-spris-juice",
    name: "Spris Layered Juice",
    category: "Drinks",
    price: 130,
    description: "Naturally layered chilled smoothie with ripe mango, creamy avocado, and sweet papaya, served with fresh lime squeeze.",
    image: "/images/juice.jpg",
    prepTime: "5 min",
    spicy: false,
    ingredients: ["Ripe mango", "Avocado", "Papaya", "Lime"],
  },
  {
    id: "baklava",
    name: "Honey Walnut Baklava",
    category: "Desserts",
    price: 160,
    description: "Flaky golden phyllo pastry layered with crushed walnuts, infused with cardamom syrup and pure Ethiopian honey.",
    image: "/images/baklava.jpg",
    prepTime: "5 min",
    spicy: false,
    ingredients: ["Phyllo dough", "Walnuts", "Cardamom", "Forest honey", "Butter"],
  },
];

export const CATEGORIES = [
  "All",
  "Traditional",
  "Vegetarian",
  "Breakfast",
  "Drinks",
  "Desserts",
] as const;

export type Category = (typeof CATEGORIES)[number];
