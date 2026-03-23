-- PRD-07: Admin Reports - SQL Functions
-- Two RPC functions for report queries (last 7 days)

-- Report 1: Average prep time per menu item
CREATE OR REPLACE FUNCTION get_prep_time_report(p_restaurant_id UUID)
RETURNS TABLE (
  item_name TEXT,
  total_orders BIGINT,
  avg_prep_time_min NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mi.name AS item_name,
    COUNT(DISTINCT oi.order_id) AS total_orders,
    ROUND(
      AVG(
        EXTRACT(EPOCH FROM (h_ready.created_at - h_confirmed.created_at)) / 60
      )::numeric,
      1
    ) AS avg_prep_time_min
  FROM order_items oi
  JOIN menu_items mi ON mi.id = oi.menu_item_id
  JOIN order_status_history h_confirmed
    ON h_confirmed.order_id = oi.order_id
    AND h_confirmed.to_status = 'CONFIRMADO'
  JOIN order_status_history h_ready
    ON h_ready.order_id = oi.order_id
    AND h_ready.to_status = 'PRONTO_PARA_RETIRADA'
  JOIN orders o ON o.id = oi.order_id
  WHERE o.restaurant_id = p_restaurant_id
    AND h_confirmed.created_at >= now() - INTERVAL '7 days'
  GROUP BY mi.id, mi.name
  ORDER BY avg_prep_time_min DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Report 2: Delivery team performance
CREATE OR REPLACE FUNCTION get_delivery_performance_report(p_restaurant_id UUID)
RETURNS TABLE (
  deliverer_name TEXT,
  total_deliveries BIGINT,
  avg_delivery_time_min NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.name AS deliverer_name,
    COUNT(DISTINCT h_delivered.order_id) AS total_deliveries,
    ROUND(
      AVG(
        EXTRACT(EPOCH FROM (h_delivered.created_at - h_ready.created_at)) / 60
      )::numeric,
      1
    ) AS avg_delivery_time_min
  FROM order_status_history h_delivered
  JOIN order_status_history h_ready
    ON h_ready.order_id = h_delivered.order_id
    AND h_ready.to_status = 'PRONTO_PARA_RETIRADA'
  JOIN profiles p ON p.id = h_delivered.changed_by
  JOIN orders o ON o.id = h_delivered.order_id
  WHERE h_delivered.to_status = 'ENTREGUE'
    AND o.restaurant_id = p_restaurant_id
    AND h_delivered.created_at >= now() - INTERVAL '7 days'
  GROUP BY p.id, p.name
  ORDER BY total_deliveries DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
