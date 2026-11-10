/**
 * Recommendation system (RapidMiner integration)
 *
 *   1. GET  /api/analytics/export          -> transaction data for RapidMiner (CSV)
 *   2. RapidMiner: FP-Growth + Create Association Rules -> export rules as CSV
 *   3. POST /api/analytics/import-rules    -> rules stored in MongoDB (Recommendation)
 *   4. GET  /api/analytics/recommendations -> served to the React app
 *
 * If no RapidMiner rules have been imported yet, a built-in co-purchase /
 * category-based fallback keeps the feature working.
 */
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');
const Recommendation = require('../models/recommendation');

const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Minimal CSV parser (quotes, auto-detects , or ; delimiter)
const parseCSV = (text) => {
  const firstLine = text.split(/\r?\n/)[0] || '';
  const delim = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else cell += c;
    } else if (c === '"') inQuotes = true;
    else if (c === delim) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((x) => x !== '')) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x !== '')) rows.push(row);
  return rows;
};

// GET /api/analytics/export?format=long|basket   (admin)
exports.exportTransactions = async (req, res, next) => {
  try {
    const orders = await Order.find({ status: { $ne: 'cancelled' } }).lean();
    const format = req.query.format === 'basket' ? 'basket' : 'long';
    let csv;

    if (format === 'long') {
      const lines = ['order_id,user_id,product_id,product_name,quantity,price'];
      orders.forEach((o) =>
        o.items.forEach((i) =>
          lines.push([o._id, o.user, i.product, i.name, i.quantity, i.price].map(csvCell).join(','))
        )
      );
      csv = lines.join('\n');
    } else {
      // One row per order, one true/false column per product: ready for FP-Growth
      const products = await Product.find().select('name').lean();
      const header = ['order_id', ...products.map((p) => p._id.toString())];
      const lines = [header.join(',')];
      orders.forEach((o) => {
        const bought = new Set(o.items.map((i) => i.product.toString()));
        lines.push([o._id, ...products.map((p) => (bought.has(p._id.toString()) ? 'true' : 'false'))].join(','));
      });
      csv = lines.join('\n');
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="transactions_${format}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

// Resolve a RapidMiner item label (product id or exact product name) to a product id
const makeResolver = async () => {
  const products = await Product.find().select('name').lean();
  const byId = new Map(products.map((p) => [p._id.toString(), p._id.toString()]));
  const byName = new Map(products.map((p) => [p.name.trim().toLowerCase(), p._id.toString()]));
  return (label) => {
    const l = String(label).trim().replace(/^\[|\]$/g, '').trim();
    if (byId.has(l)) return byId.get(l);
    return byName.get(l.toLowerCase()) || null;
  };
};

const splitItems = (s) =>
  String(s || '')
    .split(/[,|]/)
    .map((x) => x.trim())
    .filter(Boolean);

// POST /api/analytics/import-rules   (admin)
// Accepts JSON { rules: [{ premises, conclusion, confidence, lift }] } or text/csv exported
// from RapidMiner (columns: Premises, Conclusion, Support, Confidence, Lift ...)
exports.importRules = async (req, res, next) => {
  try {
    let rules = [];
    if (typeof req.body === 'string') {
      const rows = parseCSV(req.body);
      if (rows.length < 2) {
        res.status(400);
        throw new Error('CSV is empty');
      }
      const head = rows[0].map((h) => h.trim().toLowerCase());
      const idx = (name) => head.indexOf(name);
      const iP = idx('premises');
      const iC = idx('conclusion');
      if (iP < 0 || iC < 0) {
        res.status(400);
        throw new Error('CSV needs "Premises" and "Conclusion" columns');
      }
      const iConf = idx('confidence');
      const iLift = idx('lift');
      rules = rows.slice(1).map((r) => ({
        premises: splitItems(r[iP]),
        conclusion: splitItems(r[iC]),
        confidence: iConf >= 0 ? parseFloat(r[iConf]) || 0 : 0,
        lift: iLift >= 0 ? parseFloat(r[iLift]) || 0 : 0,
      }));
    } else if (req.body && Array.isArray(req.body.rules)) {
      rules = req.body.rules.map((r) => ({
        premises: Array.isArray(r.premises) ? r.premises : splitItems(r.premises),
        conclusion: Array.isArray(r.conclusion) ? r.conclusion : splitItems(r.conclusion),
        confidence: Number(r.confidence) || 0,
        lift: Number(r.lift) || 0,
      }));
    } else {
      res.status(400);
      throw new Error('Send JSON {rules:[...]} or a text/csv body');
    }

    const resolve = await makeResolver();
    const map = new Map(); // antecedent id -> Map(consequent id -> {confidence, lift})
    let used = 0;
    let skipped = 0;

    for (const r of rules) {
      const ants = r.premises.map(resolve).filter(Boolean);
      const cons = r.conclusion.map(resolve).filter(Boolean);
      if (!ants.length || !cons.length) { skipped++; continue; }
      used++;
      for (const a of ants) {
        if (!map.has(a)) map.set(a, new Map());
        for (const c of cons) {
          if (c === a) continue;
          const prev = map.get(a).get(c);
          if (!prev || r.confidence > prev.confidence) {
            map.get(a).set(c, { confidence: r.confidence, lift: r.lift });
          }
        }
      }
    }

    await Recommendation.deleteMany({ source: 'rapidminer' });
    const docs = [...map.entries()].map(([a, cons]) => ({
      product: a,
      source: 'rapidminer',
      recommended: [...cons.entries()]
        .map(([c, v]) => ({ product: c, ...v }))
        .sort((x, y) => y.confidence - x.confidence || y.lift - x.lift)
        .slice(0, 10),
    }));
    if (docs.length) await Recommendation.insertMany(docs, { ordered: false }).catch(() => {});

    res.json({ success: true, rulesUsed: used, rulesSkipped: skipped, productsCovered: docs.length });
  } catch (err) {
    next(err);
  }
};

// POST /api/analytics/rebuild   (admin) - built-in co-purchase fallback
exports.rebuildFallback = async (req, res, next) => {
  try {
    const orders = await Order.find({ status: { $ne: 'cancelled' } }).lean();
    const pair = new Map(); // a -> Map(b -> count)
    const count = new Map();
    orders.forEach((o) => {
      const ids = [...new Set(o.items.map((i) => i.product.toString()))];
      ids.forEach((a) => {
        count.set(a, (count.get(a) || 0) + 1);
        ids.forEach((b) => {
          if (a === b) return;
          if (!pair.has(a)) pair.set(a, new Map());
          pair.get(a).set(b, (pair.get(a).get(b) || 0) + 1);
        });
      });
    });
    await Recommendation.deleteMany({ source: 'copurchase' });
    const docs = [...pair.entries()].map(([a, m]) => ({
      product: a,
      source: 'copurchase',
      recommended: [...m.entries()]
        .map(([b, n]) => ({ product: b, confidence: n / count.get(a), lift: 0 }))
        .sort((x, y) => y.confidence - x.confidence)
        .slice(0, 10),
    }));
    if (docs.length) await Recommendation.insertMany(docs, { ordered: false }).catch(() => {});
    res.json({ success: true, productsCovered: docs.length });
  } catch (err) {
    next(err);
  }
};

const topRated = (exclude = [], limit = 4, category) => {
  const filter = { _id: { $nin: exclude } };
  if (category) filter.category = category;
  return Product.find(filter).sort('-rating -numReviews').limit(limit);
};

const fromRules = async (productIds, limit) => {
  // RapidMiner rules take priority; co-purchase is only used where no RapidMiner rule exists
  const recs = await Recommendation.find({ product: { $in: productIds } });
  const score = new Map();
  recs
    .sort((a, b) => (a.source === 'rapidminer' ? -1 : 1) - (b.source === 'rapidminer' ? -1 : 1))
    .forEach((r) =>
      r.recommended.forEach((x) => {
        const id = x.product.toString();
        if (productIds.some((p) => p.toString() === id)) return;
        const s = x.confidence + x.lift * 0.01 + (r.source === 'rapidminer' ? 1 : 0);
        score.set(id, Math.max(score.get(id) || 0, s));
      })
    );
  const ids = [...score.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([id]) => id);
  const products = await Product.find({ _id: { $in: ids } });
  return ids.map((id) => products.find((p) => p._id.toString() === id)).filter(Boolean);
};

// GET /api/analytics/recommendations/product/:id
exports.recommendForProduct = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 4, 12);
    const base = await Product.findById(req.params.id);
    if (!base) {
      res.status(404);
      throw new Error('Product not found');
    }
    let products = await fromRules([base._id], limit);
    let strategy = products.length ? 'association-rules' : 'category-fallback';
    if (products.length < limit) {
      const extra = await topRated([base._id, ...products.map((p) => p._id)], limit - products.length, base.category);
      products = products.concat(extra);
    }
    res.json({ success: true, strategy, products });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/recommendations   (personalised when logged in)
exports.recommendForUser = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 8, 20);
    let products = [];
    let strategy = 'top-rated';
    let bought = [];
    if (req.user) {
      const orders = await Order.find({ user: req.user._id, status: { $ne: 'cancelled' } }).lean();
      bought = [...new Set(orders.flatMap((o) => o.items.map((i) => i.product.toString())))];
      if (bought.length) {
        products = await fromRules(bought, limit);
        if (products.length) strategy = 'personalised';
      }
    }
    if (products.length < limit) {
      const extra = await topRated([...bought, ...products.map((p) => p._id)], limit - products.length);
      products = products.concat(extra);
    }
    res.json({ success: true, strategy, products });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/summary   (admin) - small dashboard numbers
exports.summary = async (req, res, next) => {
  try {
    const [orders, revenue, rules] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Recommendation.countDocuments(),
    ]);
    res.json({ success: true, orders, revenue: revenue[0]?.total || 0, productsWithRecommendations: rules });
  } catch (err) {
    next(err);
  }
};

exports._internals = { parseCSV, mongoose };
