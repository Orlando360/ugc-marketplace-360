-- ================================================
-- UGC Marketplace 360 — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ================================================

-- 1. Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null default 'cliente' check (role in ('admin', 'cliente')),
  full_name text,
  company text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Service role can insert profiles"
  on public.profiles for insert
  with check (true);

-- 2. UGC Creators table
create table if not exists public.ugc_creators (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  handle text not null unique,
  category text not null,
  followers integer not null default 0,
  engagement numeric(5,2) not null default 0,
  price integer not null default 0,
  emoji text default '✨',
  photo_url text,
  bio text,
  tags text[] default '{}',
  available boolean default true,
  packages jsonb default '[]',
  created_at timestamptz default now()
);

alter table public.ugc_creators enable row level security;

-- Public read
create policy "Anyone can read creators"
  on public.ugc_creators for select
  using (true);

-- Admin write
create policy "Admins can manage creators"
  on public.ugc_creators for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 3. Hiring requests table
create table if not exists public.hiring_requests (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references public.ugc_creators(id) on delete set null,
  client_email text not null,
  client_name text not null,
  package_name text not null,
  package_price integer not null default 0,
  brief text not null,
  status text not null default 'pendiente' check (status in ('pendiente', 'negociacion', 'cerrado')),
  created_at timestamptz default now()
);

alter table public.hiring_requests enable row level security;

-- Anyone can insert (clients hire without auth)
create policy "Anyone can create hiring requests"
  on public.hiring_requests for insert
  with check (true);

-- Admin can read and update all
create policy "Admins can manage all requests"
  on public.hiring_requests for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- ================================================
-- SEED: 6 demo creators
-- ================================================

insert into public.ugc_creators (name, handle, category, followers, engagement, price, emoji, bio, tags, available, packages) values

('Valentina Ríos', 'valentinatips', 'Beauty', 85000, 5.2, 450000, '💄',
 'Creadora de contenido beauty con 3 años de experiencia. Especializada en tutoriales de maquillaje natural y skincare colombiano.',
 array['skincare', 'maquillaje', 'rutina', 'cuidadopersonal', 'belleza'],
 true,
 '[{"name":"Básico","price":450000,"deliverables":["1 video UGC 30s","1 reseña escrita","1 foto producto"],"turnaround":"5 días"},{"name":"Pro","price":850000,"deliverables":["3 videos UGC 30-60s","Reels editado","Story pack x5","2 fotos producto"],"turnaround":"8 días"},{"name":"Premium","price":1500000,"deliverables":["5 videos UGC","Reels + TikTok","Story pack x10","Fotos profesionales x5","BTS behind the scenes"],"turnaround":"12 días"}]'
),

('Daniela Moreno', 'danilifestvle', 'Lifestyle', 120000, 4.8, 600000, '🌿',
 'Lifestyle & wellness creator desde Medellín. Contenido auténtico sobre vida saludable, yoga, y minimalismo consciente.',
 array['lifestyle', 'wellness', 'yoga', 'minimalismo', 'vidassana'],
 true,
 '[{"name":"Esencial","price":600000,"deliverables":["2 videos UGC lifestyle","3 fotos estilo de vida"],"turnaround":"6 días"},{"name":"Completo","price":1100000,"deliverables":["4 videos UGC","Reels narrativo","Fotos x6","Caption optimizado"],"turnaround":"10 días"},{"name":"Campaña","price":2000000,"deliverables":["8 contenidos mixed","Guion personalizado","Revisiones ilimitadas","Entrega por fases"],"turnaround":"18 días"}]'
),

('Camila Torres', 'camilafitco', 'Fitness', 95000, 6.1, 520000, '💪',
 'Personal trainer certificada y creadora fitness. Mis videos generan conexión real: clientes reales, resultados reales, sin filtros.',
 array['fitness', 'entrenamiento', 'salud', 'gym', 'transformacion'],
 true,
 '[{"name":"Starter","price":520000,"deliverables":["2 videos workout UGC","1 testimonial auténtico"],"turnaround":"5 días"},{"name":"Avanzado","price":950000,"deliverables":["4 videos fitness","Antes y después","Story x4","Caption motivacional"],"turnaround":"9 días"},{"name":"Elite","price":1800000,"deliverables":["8 videos mixed","Reel transformación","Plan de contenido 30 días","Métricas de rendimiento"],"turnaround":"15 días"}]'
),

('Sara Jiménez', 'saratech360', 'Tech', 45000, 7.3, 380000, '📱',
 'Tech reviewer y early adopter. Reseñas honestas de gadgets, apps y servicios digitales con lenguaje accesible para todos.',
 array['tecnología', 'gadgets', 'apps', 'review', 'digital'],
 true,
 '[{"name":"Review Básico","price":380000,"deliverables":["1 video reseña UGC","Puntos clave producto"],"turnaround":"4 días"},{"name":"Review Completo","price":720000,"deliverables":["2 videos unboxing + reseña","Demo de uso","FAQ escrito"],"turnaround":"7 días"},{"name":"Campaña Tech","price":1300000,"deliverables":["4 videos tech content","Comparativa","Tutorial uso","Story educativo x6"],"turnaround":"12 días"}]'
),

('Isabella Vargas', 'isabellafood', 'Food', 78000, 5.7, 420000, '🍳',
 'Food creator y chef amateur. Recetas rápidas, reseñas de restaurantes y contenido gastronómico que hace agua la boca desde Bogotá.',
 array['comida', 'recetas', 'gastronomia', 'foodie', 'restaurantes'],
 true,
 '[{"name":"Receta Simple","price":420000,"deliverables":["1 video receta UGC","Foto plato final","Ingredientes listos"],"turnaround":"4 días"},{"name":"Food Story","price":800000,"deliverables":["3 videos cocina","Unboxing ingredientes","Story pack x6","Caption gastronómico"],"turnaround":"8 días"},{"name":"Chef Pack","price":1450000,"deliverables":["6 videos food","Recetario digital","Fotos profesionales x8","Serie de contenido"],"turnaround":"14 días"}]'
),

('Luciana Herrera', 'lucianafashion', 'Fashion', 200000, 4.2, 800000, '👗',
 'Fashion influencer y estilista. Outfits para todos los presupuestos, hauls sostenibles y el mejor street style de Colombia.',
 array['moda', 'outfit', 'fashion', 'estilo', 'tendencias'],
 true,
 '[{"name":"Look UGC","price":800000,"deliverables":["2 videos outfit UGC","3 fotos look","Caption trend"],"turnaround":"5 días"},{"name":"Colección","price":1500000,"deliverables":["5 videos fashion","Haul completo","Story x8","Reels tendencia"],"turnaround":"10 días"},{"name":"Brand Ambassador","price":3000000,"deliverables":["10 contenidos mes","Exclusividad categoría","Métricas mensuales","Contenido evergreen"],"turnaround":"30 días"}]'
)

on conflict (handle) do nothing;
