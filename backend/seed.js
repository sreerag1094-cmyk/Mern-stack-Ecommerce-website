// Usage: npm run seed   (creates an admin, a demo user and sample products + orders)
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');
const Product = require('./models/product');
const Order = require('./models/order');
const Recommendation = require('./models/recommendation');

const img = (t) => `https://placehold.co/600x400?text=${encodeURIComponent(t)}`;

const products = [
  ['Wireless Headphones', 'Over-ear Bluetooth headphones with noise cancelling.', 99.99, 'Electronics', 'SoundMax', 25, 4.5],
  ['Bluetooth Speaker', 'Portable waterproof speaker, 12h battery.', 49.99, 'Electronics', 'SoundMax', 40, 4.2],
  ['Smart Watch', 'Fitness tracking, heart-rate and sleep monitor.', 149.0, 'Electronics', 'Fitly', 15, 4.4],
  ['USB-C Charger 65W', 'Fast GaN charger for laptops and phones.', 29.99, 'Electronics', 'VoltPro', 60, 4.6],
  ['Running Shoes', 'Lightweight breathable running shoes.', 79.5, 'Fashion', 'Stride', 30, 4.3],
  ['Denim Jacket', 'Classic fit denim jacket.', 64.0, 'Fashion', 'UrbanCo', 20, 4.0],
  ['Backpack 25L', 'Water-resistant everyday backpack.', 45.0, 'Fashion', 'TrailGo', 35, 4.5],
  ['Coffee Maker', 'Programmable 12-cup drip coffee maker.', 59.99, 'Home', 'BrewWell', 18, 4.1],
  ['Air Fryer', '4L digital air fryer with presets.', 89.0, 'Home', 'CrispIt', 22, 4.7],
  ['Desk Lamp', 'LED desk lamp with adjustable brightness.', 24.99, 'Home', 'Lumo', 50, 4.2],
  ['Yoga Mat', 'Non-slip 6mm yoga mat.', 19.99, 'Sports', 'FlexFit', 70, 4.4],
  ['Dumbbell Set', 'Adjustable dumbbells 2-20 kg.', 119.0, 'Sports', 'IronCore', 10, 4.6],
].map(([name, description, price, category, brand, countInStock, rating]) => ({
  name, description, price, category, brand, countInStock, rating,
  numReviews: Math.floor(rating * 12), image: img(name),
}));

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany(), Recommendation.deleteMany()]);

  const admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin' });
  const user = await User.create({ name: 'Demo User', email: 'user@example.com', password: 'user123' });
  const created = await Product.insertMany(products);

  // A few sample baskets so the recommender has something to learn from
  const basket = (u, idxs) => ({
    user: u._id,
    items: idxs.map((i) => ({ product: created[i]._id, name: created[i].name, image: created[i].image, price: created[i].price, quantity: 1 })),
    shippingAddress: { street: '1 Main St', city: 'Kochi', postalCode: '682001', country: 'India' },
    totalPrice: idxs.reduce((s, i) => s + created[i].price, 0),
    status: 'delivered',
  });
  await Order.create([
    basket(user, [0, 3]), basket(admin, [0, 3, 1]), basket(user, [2, 3]),
    basket(admin, [4, 6]), basket(user, [4, 6, 10]), basket(admin, [7, 8]),
    basket(user, [7, 8, 9]), basket(admin, [10, 11]),
  ]);

  console.log('Seeded. admin@example.com / admin123   user@example.com / user123');
  await mongoose.disconnect();
})();
