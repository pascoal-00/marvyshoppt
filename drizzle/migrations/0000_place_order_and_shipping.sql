ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS shipping_base numeric NOT NULL DEFAULT 13.5;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS shipping_extra numeric NOT NULL DEFAULT 3;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS free_shipping_over numeric NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping numeric NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.calc_shipping(_subtotal numeric, _units int)
RETURNS numeric LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select case when _units <= 0 then 0
    when s.free_shipping_over > 0 and _subtotal >= s.free_shipping_over then 0
    else s.shipping_base + greatest(_units - 1, 0) * s.shipping_extra end
  from (select coalesce((select shipping_base from store_settings limit 1),13.5) shipping_base,
               coalesce((select shipping_extra from store_settings limit 1),3) shipping_extra,
               coalesce((select free_shipping_over from store_settings limit 1),0) free_shipping_over) s
$$;

CREATE OR REPLACE FUNCTION public.place_order(_items jsonb, _customer jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
declare
  it jsonb; p record; v_sub numeric := 0; v_units int := 0; v_ship numeric; o record; q int;
begin
  if jsonb_typeof(_items) <> 'array' or jsonb_array_length(_items) = 0 or jsonb_array_length(_items) > 50 then
    raise exception 'invalid items'; end if;
  if length(coalesce(_customer->>'name','')) < 2 or length(_customer->>'name') > 120
     or length(coalesce(_customer->>'phone','')) < 6 or length(_customer->>'phone') > 30
     or coalesce(_customer->>'email','') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(_customer->>'email') > 160
     or length(coalesce(_customer->>'addressLine','')) < 5 or length(_customer->>'addressLine') > 200
     or length(coalesce(_customer->>'postalCode','')) < 3 or length(_customer->>'postalCode') > 20
     or length(coalesce(_customer->>'city','')) < 2 or length(_customer->>'city') > 80
     or length(coalesce(_customer->>'country','')) < 2 or length(_customer->>'country') > 60
     or length(coalesce(_customer->>'note','')) > 500 then
    raise exception 'invalid customer'; end if;

  insert into orders (subtotal, contact, customer_name, customer_phone, customer_email, address_line, postal_code, city, country, note, status)
  values (0, (_customer->>'name') || ' · ' || (_customer->>'phone'), _customer->>'name', _customer->>'phone', _customer->>'email',
    _customer->>'addressLine', _customer->>'postalCode', _customer->>'city', _customer->>'country', nullif(_customer->>'note',''), 'NOVO')
  returning id, order_number into o;

  for it in select * from jsonb_array_elements(_items) loop
    q := least(greatest(coalesce((it->>'quantity')::int,1),1),20);
    select id, name, price into p from products where slug = it->>'slug' and active limit 1;
    if not found then continue; end if;
    insert into order_items (order_id, product_id, product_name, size, quantity, unit_price)
    values (o.id, p.id,
      case when coalesce(it->>'color','') <> '' then p.name || ' (' || left(it->>'color',60) || ')' else p.name end,
      left(coalesce(it->>'size','-'),40), q, p.price);
    v_sub := v_sub + p.price * q; v_units := v_units + q;
  end loop;

  if v_units = 0 then raise exception 'no valid products'; end if;
  v_ship := calc_shipping(v_sub, v_units);
  update orders set subtotal = v_sub, shipping = v_ship where id = o.id;
  return jsonb_build_object('orderNumber', o.order_number, 'subtotal', v_sub, 'shipping', v_ship);
end $$;

REVOKE ALL ON FUNCTION public.place_order(jsonb, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb, jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.calc_shipping(numeric, int) TO anon, authenticated, service_role;