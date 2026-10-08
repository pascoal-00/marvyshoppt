CREATE OR REPLACE FUNCTION public.track_order(_number text, _contact text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
declare o record; c text := lower(trim(coalesce(_contact,''))); digits text := regexp_replace(coalesce(_contact,''),'\D','','g');
begin
  if length(coalesce(_number,'')) < 3 or length(c) < 4 then return null; end if;
  select * into o from orders where upper(order_number) = upper(trim(_number)) limit 1;
  if not found then return null; end if;
  if not (lower(o.customer_email) = c or (length(digits) >= 6 and right(regexp_replace(o.customer_phone,'\D','','g'), 6) = right(digits, 6))) then
    return null; end if;
  return jsonb_build_object('orderNumber', o.order_number, 'status', o.status, 'createdAt', o.created_at, 'updatedAt', o.updated_at,
    'subtotal', o.subtotal, 'shipping', o.shipping, 'city', o.city, 'country', o.country,
    'items', coalesce((select jsonb_agg(jsonb_build_object('name', product_name, 'size', size, 'quantity', quantity, 'price', unit_price)) from order_items where order_id = o.id), '[]'::jsonb));
end $$;
REVOKE ALL ON FUNCTION public.track_order(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.track_order(text, text) TO anon, authenticated, service_role;