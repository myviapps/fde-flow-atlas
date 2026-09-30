-- Each query starts with a "-- name:" line. run_queries.py splits on those lines.
-- Revenue means orders with status = 'completed'.

-- name: customers_per_country
-- GROUP BY basics: how many customers in each country?
SELECT country, COUNT(*) AS customers
FROM customers
GROUP BY country
ORDER BY customers DESC, country;

-- name: revenue_by_customer
-- LEFT JOIN keeps customers with no completed orders; COALESCE turns NULL into 0.
-- The status filter sits in ON, not WHERE: in WHERE it would silently drop them.
SELECT c.customer_id, c.name,
       COUNT(o.order_id)          AS orders,
       COALESCE(SUM(o.total), 0)  AS revenue
FROM customers c
LEFT JOIN orders o
       ON o.customer_id = c.customer_id AND o.status = 'completed'
GROUP BY c.customer_id, c.name
ORDER BY revenue DESC, c.customer_id;

-- name: customers_without_orders
-- Anti-join: customers with no orders of any status.
SELECT c.customer_id, c.name, c.signup_date
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL
ORDER BY c.customer_id;

-- name: monthly_revenue_running
-- Window function: running total over months.
WITH monthly AS (
    SELECT strftime('%Y-%m', order_date) AS month, SUM(total) AS revenue
    FROM orders
    WHERE status = 'completed'
    GROUP BY month
)
SELECT month, revenue,
       SUM(revenue) OVER (ORDER BY month) AS running_total
FROM monthly
ORDER BY month;

-- name: top_customer_per_country
-- Window function: RANK() restarts for each country (PARTITION BY).
WITH revenue AS (
    SELECT c.country, c.name, SUM(o.total) AS revenue
    FROM customers c
    JOIN orders o ON o.customer_id = c.customer_id
    WHERE o.status = 'completed'
    GROUP BY c.customer_id
),
ranked AS (
    SELECT country, name, revenue,
           RANK() OVER (PARTITION BY country ORDER BY revenue DESC) AS rnk
    FROM revenue
)
SELECT country, name, revenue
FROM ranked
WHERE rnk = 1
ORDER BY country;

-- name: days_between_orders
-- Window function: LAG() looks at the previous order of the same customer.
WITH ordered AS (
    SELECT customer_id, order_id, order_date,
           LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_date
    FROM orders
)
SELECT customer_id, order_id, prev_date, order_date,
       CAST(julianday(order_date) - julianday(prev_date) AS INTEGER) AS days_since_prev
FROM ordered
WHERE prev_date IS NOT NULL
ORDER BY customer_id, order_date;

-- name: fanout_bug
-- BUG: joining order_items repeats each order once per item row,
-- so the order-level total is summed several times. Revenue is inflated.
SELECT c.customer_id, c.name,
       SUM(o.total)  AS revenue,
       SUM(oi.qty)   AS units
FROM customers c
JOIN orders o       ON o.customer_id = c.customer_id
JOIN order_items oi ON oi.order_id = o.order_id
WHERE o.status = 'completed'
GROUP BY c.customer_id, c.name
ORDER BY c.customer_id;

-- name: fanout_fix
-- FIX: aggregate items to one row per order first, then join.
WITH items_per_order AS (
    SELECT order_id, SUM(qty) AS units
    FROM order_items
    GROUP BY order_id
)
SELECT c.customer_id, c.name,
       SUM(o.total)  AS revenue,
       SUM(i.units)  AS units
FROM customers c
JOIN orders o           ON o.customer_id = c.customer_id
JOIN items_per_order i  ON i.order_id = o.order_id
WHERE o.status = 'completed'
GROUP BY c.customer_id, c.name
ORDER BY c.customer_id;
