# RapidMiner recommendation workflow

The API exchanges data with RapidMiner Studio through CSV files. No RapidMiner license
server is needed; the free Studio edition is enough.

## 1. Export transactions from the API

Log in as an admin and download the basket matrix (one row per order, one true/false column per product):

```
GET /api/analytics/export?format=basket        (Authorization: Bearer <admin token>)
```

Use `?format=long` for a plain order/product list instead.

## 2. Build the process in RapidMiner Studio

1. **Read CSV** -> load `transactions_basket.csv` (set the column type of every product column to `binominal`).
2. **Select Attributes** -> exclude `order_id`.
3. **FP-Growth** -> `min support` about 0.05 (lower it for small data sets).
4. **Create Association Rules** -> criterion `confidence`, `min confidence` about 0.3.
5. **Write CSV** -> save the rules as `rules.csv`. The columns `Premises`, `Conclusion`, `Support`, `Confidence`, `Lift` are what the API reads.

Because the export uses product ids as column names, the Premises/Conclusion values are product ids.
Product names also work if you rename the columns before FP-Growth.

## 3. Import the rules

```
POST /api/analytics/import-rules
Authorization: Bearer <admin token>
Content-Type: text/csv

<contents of rules.csv>
```

With curl:

```
curl -X POST $API/api/analytics/import-rules \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: text/csv" \
  --data-binary @rules.csv
```

## 4. Where it shows up

* `GET /api/analytics/recommendations/product/:id` -> "Customers also bought" on the product page
* `GET /api/analytics/recommendations` -> "Recommended for you" on the home page (personalised from the user's order history when logged in)

If no rules are imported, `POST /api/analytics/rebuild` (admin) builds simple co-purchase
recommendations, and the endpoints fall back to top-rated / same-category products.
