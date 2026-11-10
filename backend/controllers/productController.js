const Product = require('../models/product');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORTS = {
  newest: '-createdAt',
  oldest: 'createdAt',
  price_asc: 'price',
  price_desc: '-price',
  rating: '-rating',
  name_asc: 'name',
  name_desc: '-name',
};

// GET /api/products?search=&category=&brand=&minPrice=&maxPrice=&minRating=&inStock=&sort=&page=&limit=
exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, brand, minPrice, maxPrice, minRating, inStock, sort } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 100);

    const filter = {};
    if (search) {
      const rx = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ name: rx }, { description: rx }, { category: rx }, { brand: rx }];
    }
    if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
    if (brand) filter.brand = new RegExp(`^${escapeRegex(brand)}$`, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minRating) filter.rating = { $gte: Number(minRating) };
    if (inStock === 'true') filter.countInStock = { $gt: 0 };

    const sortBy = SORTS[sort] || SORTS.newest;

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).sort(sortBy).skip((page - 1) * limit).limit(limit),
    ]);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      count: products.length,
      products,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/categories
exports.getCategories = async (req, res, next) => {
  try {
    const [categories, brands] = await Promise.all([
      Product.distinct('category'),
      Product.distinct('brand'),
    ]);
    res.json({ success: true, categories: categories.sort(), brands: brands.filter(Boolean).sort() });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// POST /api/products  (admin)
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id  (admin)
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id  (admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json({ success: true, message: 'Product removed' });
  } catch (err) {
    next(err);
  }
};
