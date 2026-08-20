-- roles
create type public.app_role as enum ('admin','staff');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "admins manage roles" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  image_url text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "public reads active categories" on public.categories for select to anon using (active);
create policy "authenticated reads categories" on public.categories for select to authenticated using (true);
create policy "admins manage categories" on public.categories for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger categories_updated before update on public.categories for each row execute function public.set_updated_at();

-- products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  details text[] not null default '{}',
  price numeric(10,2) not null default 0,
  compare_at_price numeric(10,2),
  currency text not null default 'EUR',
  on_sale boolean not null default false,
  category_slug text not null default 'sneakers',
  subcategory text,
  style text not null default 'everyday',
  images text[] not null default '{}',
  sizes text[] not null default '{}',
  availability text not null default 'in_stock',
  product_type text not null default 'unbranded',
  featured boolean not null default false,
  is_new boolean not null default false,
  best_seller boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public reads active products" on public.products for select to anon using (active);
create policy "authenticated reads products" on public.products for select to authenticated using (true);
create policy "admins manage products" on public.products for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger products_updated before update on public.products for each row execute function public.set_updated_at();

-- orders
create sequence public.order_number_seq start 1001;
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('MS-' || nextval('public.order_number_seq')::text),
  subtotal numeric(10,2) not null default 0,
  currency text not null default 'EUR',
  contact text,
  note text,
  status text not null default 'NOVO',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "admins manage orders" on public.orders for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger orders_updated before update on public.orders for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  size text not null,
  quantity int not null default 1,
  unit_price numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
grant select, update, delete on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "admins manage order items" on public.order_items for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- store settings (single row)
create table public.store_settings (
  id boolean primary key default true check (id),
  store_name text not null default 'M-Shop',
  whatsapp_number text not null default '244957280181',
  delivery_time text not null default 'Até 2 semanas',
  shipping_from text not null default 'Desde €13,50',
  shipping_note text not null default 'Os custos de envio podem variar de acordo com a quantidade e características da encomenda. O valor final será confirmado pela M-Shop.',
  replica_notice text not null default 'IMPORTANTE: Este produto é uma réplica/reprodução e NÃO é um produto original da marca apresentada. A M-Shop não representa nem é afiliada às marcas originais.',
  currency text not null default 'EUR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.store_settings to anon;
grant select, insert, update on public.store_settings to authenticated;
grant all on public.store_settings to service_role;
alter table public.store_settings enable row level security;
create policy "public reads settings" on public.store_settings for select to anon using (true);
create policy "authenticated reads settings" on public.store_settings for select to authenticated using (true);
create policy "admins manage settings" on public.store_settings for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger settings_updated before update on public.store_settings for each row execute function public.set_updated_at();

insert into public.store_settings (id) values (true);

insert into public.categories (slug,label,image_url,sort_order) values
 ('sneakers','SNEAKERS','/__l5e/assets-v1/2195743a-1c26-4517-b3c2-c3bb0597478d/image-5.png',1),
 ('acessorios','ACESSÓRIOS','/seed/p6.jpg',2),
 ('new-in','NEW IN','/__l5e/assets-v1/c19eae5c-7569-44f8-9122-b111eff3eda6/image-7.png',3),
 ('best-sellers','BEST SELLERS','/__l5e/assets-v1/883ec433-1850-4f5d-9f2d-a7540f60f086/image.png',4);

insert into public.products (slug,name,description,details,price,category_slug,style,images,sizes,availability,product_type,is_new,best_seller,featured,sort_order,created_at) values
('alexander-mcqueen-oversized-sneaker','ALEXANDER MCQUEEN OVERSIZED SNEAKER','O icónico Oversized Sneaker em pele preta lisa com a sola oversized branca. Silhueta de assinatura, presença imediata em qualquer look.',
 array['Pele de bezerro com acabamento liso','Sola oversized em borracha branca','Logo no calcanhar','Corte low-top unissexo'],390,'sneakers','street',
 array['/__l5e/assets-v1/883ec433-1850-4f5d-9f2d-a7540f60f086/image.png','/__l5e/assets-v1/6127d30e-d8fa-4fc3-98bc-a21026eac932/image-2.png'],
 array['39','40','41','42','43','44','45'],'low_stock','replica',true,true,true,1,'2026-08-14'),
('dolce-gabbana-portofino-dg-white','DOLCE & GABBANA PORTOFINO DG WHITE','Portofino em pele branca com o logo DG em preto na lateral e contraforte contrastante. Luxo italiano em versão sneaker.',
 array['Pele de novilho branca','Logo DG impresso na lateral','Contraforte em pele preta','Sola em borracha leve'],420,'sneakers','street',
 array['/__l5e/assets-v1/0c8817a9-e110-407a-9cd0-08101839db93/image-3.png','/__l5e/assets-v1/f001ed60-466c-433c-81b4-8ed3c68e955e/image-4.png'],
 array['39','40','41','42','43','44','45'],'low_stock','replica',true,true,true,2,'2026-08-13'),
('dolce-gabbana-portofino-black','DOLCE & GABBANA PORTOFINO BLACK','Versão preta do Portofino, com língua em prata metalizada e sola branca. Contraste elegante para uso diário.',
 array['Pele preta com acabamento mate','Detalhe metalizado na língua','Lettering no calcanhar','Sola branca em borracha'],420,'sneakers','street',
 array['/__l5e/assets-v1/f001ed60-466c-433c-81b4-8ed3c68e955e/image-4.png','/__l5e/assets-v1/0c8817a9-e110-407a-9cd0-08101839db93/image-3.png'],
 array['39','40','41','42','43','44','45'],'unknown','replica',true,false,false,3,'2026-08-11'),
('nike-air-force-1-07-white','NIKE AIR FORCE 1 ''07 WHITE','O clássico total white que nunca sai de moda. Pele lisa, perfurações no antepé e amortecimento Air.',
 array['Parte superior em pele','Amortecimento na entressola','Sola em borracha com padrão pivot','Corte low-top unissexo'],129,'sneakers','everyday',
 array['/__l5e/assets-v1/2195743a-1c26-4517-b3c2-c3bb0597478d/image-5.png','/__l5e/assets-v1/d5b71cd8-225d-4bdd-ba20-375952be32bb/image-6.png'],
 array['39','40','41','42','43','44','45'],'in_stock','replica',true,true,true,4,'2026-08-10'),
('nike-air-force-1-07-black','NIKE AIR FORCE 1 ''07 BLACK','Air Force 1 em total black, com detalhes prateados nos ilhoses. Versátil, resistente e sempre atual.',
 array['Pele preta com Swoosh tonal','Amortecimento Air','Sola em borracha','Corte low-top unissexo'],129,'sneakers','everyday',
 array['/__l5e/assets-v1/d5b71cd8-225d-4bdd-ba20-375952be32bb/image-6.png','/__l5e/assets-v1/2195743a-1c26-4517-b3c2-c3bb0597478d/image-5.png'],
 array['39','40','41','42','43','44','45'],'in_stock','replica',false,true,false,5,'2026-08-05'),
('adidas-samba-og-white-gum','ADIDAS SAMBA OG WHITE GUM','Samba OG em pele branca com três riscas pretas, biqueira em camurça e sola gum. O clássico terrace que domina as ruas.',
 array['Pele branca com três riscas pretas','Biqueira em camurça (T-toe)','Sola gum de borracha','Corte low-top unissexo'],139,'sneakers','everyday',
 array['/__l5e/assets-v1/c19eae5c-7569-44f8-9122-b111eff3eda6/image-7.png','/seed/edit1.jpg'],
 array['39','40','41','42','43','44','45'],'low_stock','replica',true,true,false,6,'2026-08-09'),
('new-balance-530-white-silver','NEW BALANCE 530 WHITE SILVER','New Balance 530 em branco, prateado e navy. Estética retro running com amortecimento para uso diário.',
 array['Malha e sintético com detalhes prateados','Amortecimento confortável','Logo N em relevo','Corte low-top unissexo'],149,'sneakers','sport',
 array['/__l5e/assets-v1/d426c881-7e1c-4c40-b68a-fea0e994a7d4/image-8.png','/seed/edit2.jpg'],
 array['39','40','41','42','43','44','45'],'in_stock','replica',true,false,false,7,'2026-08-07'),
('m-shop-cap-01','M-SHOP CAP 01','Boné de seis painéis em sarja de algodão, com fecho ajustável.',
 array['100% algodão','Fecho metálico ajustável','Aba pré-curvada'],25,'acessorios','essentials',
 array['/seed/p6.jpg','/seed/edit2.jpg'],array['Tamanho único'],'in_stock','unbranded',false,true,false,8,'2026-07-20'),
('m-shop-essential-tee','M-SHOP ESSENTIAL TEE','T-shirt oversized em algodão pesado, com caimento estruturado.',
 array['Algodão 240 g/m²','Corte oversized','Gola canelada reforçada'],35,'acessorios','essentials',
 array['/seed/p7.jpg','/seed/edit1.jpg'],array['S','M','L','XL'],'in_stock','unbranded',true,false,false,9,'2026-08-14'),
('m-shop-utility-bag','M-SHOP UTILITY BAG','Bolsa crossbody em nylon técnico com dois compartimentos com fecho.',
 array['Nylon resistente à água','Alça ajustável','Dois compartimentos com fecho'],45,'acessorios','everyday',
 array['/seed/p8.jpg','/seed/edit2.jpg'],array['Tamanho único'],'low_stock','unbranded',false,false,false,10,'2026-07-15');