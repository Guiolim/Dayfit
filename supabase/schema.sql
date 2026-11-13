-- NutriFit: rode no Supabase > SQL Editor
create type role_t as enum ('admin','personal','patient');

create table profiles(id uuid primary key references auth.users on delete cascade,
  name text, role role_t not null default 'patient', trainer_id uuid references profiles(id), created_at timestamptz default now());
create table foods(id serial primary key, name text unique not null, kcal numeric, protein numeric, carbs numeric, fat numeric); -- por 100 g
create table exercises(id serial primary key, name text unique not null, muscle text);
create table diet_plans(id serial primary key, patient_id uuid not null references profiles(id) on delete cascade, author_id uuid references profiles(id), title text, kcal_goal int, notes text, created_at timestamptz default now());
create table diet_items(id serial primary key, plan_id int not null references diet_plans on delete cascade, meal text not null, food_id int references foods(id), grams numeric not null);
create table workout_plans(id serial primary key, patient_id uuid not null references profiles(id) on delete cascade, author_id uuid references profiles(id), title text, notes text, created_at timestamptz default now());
create table workout_items(id serial primary key, plan_id int not null references workout_plans on delete cascade, day text, exercise_id int references exercises(id), sets int, reps text, notes text);
create table workout_logs(id serial primary key, item_id int references workout_items on delete cascade, patient_id uuid references profiles(id) on delete cascade, load numeric, done_at timestamptz default now());

create function my_role() returns role_t language sql stable security definer set search_path=public as $$ select role from profiles where id=auth.uid() $$;
create function can_manage(pid uuid) returns boolean language sql stable security definer set search_path=public as
$$ select my_role()='admin' or exists(select 1 from profiles where id=pid and trainer_id=auth.uid()) $$;

create function handle_new_user() returns trigger language plpgsql security definer set search_path=public as
$$ begin insert into profiles(id,name) values(new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1))); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

alter table profiles enable row level security;
create policy p_sel on profiles for select using (id=auth.uid() or can_manage(id));
create policy p_upd on profiles for update using (my_role()='admin');
alter table foods enable row level security;
create policy f_sel on foods for select to authenticated using (true);
create policy f_all on foods for all using (my_role() in ('admin','personal'));
alter table exercises enable row level security;
create policy e_sel on exercises for select to authenticated using (true);
create policy e_all on exercises for all using (my_role() in ('admin','personal'));

alter table diet_plans enable row level security;
create policy dp_sel on diet_plans for select using (patient_id=auth.uid() or can_manage(patient_id));
create policy dp_all on diet_plans for all using (can_manage(patient_id)) with check (can_manage(patient_id));
alter table workout_plans enable row level security;
create policy wp_sel on workout_plans for select using (patient_id=auth.uid() or can_manage(patient_id));
create policy wp_all on workout_plans for all using (can_manage(patient_id)) with check (can_manage(patient_id));

alter table diet_items enable row level security;
create policy di_sel on diet_items for select using (exists(select 1 from diet_plans p where p.id=plan_id and (p.patient_id=auth.uid() or can_manage(p.patient_id))));
create policy di_all on diet_items for all using (exists(select 1 from diet_plans p where p.id=plan_id and can_manage(p.patient_id)))
  with check (exists(select 1 from diet_plans p where p.id=plan_id and can_manage(p.patient_id)));
alter table workout_items enable row level security;
create policy wi_sel on workout_items for select using (exists(select 1 from workout_plans p where p.id=plan_id and (p.patient_id=auth.uid() or can_manage(p.patient_id))));
create policy wi_all on workout_items for all using (exists(select 1 from workout_plans p where p.id=plan_id and can_manage(p.patient_id)))
  with check (exists(select 1 from workout_plans p where p.id=plan_id and can_manage(p.patient_id)));
alter table workout_logs enable row level security;
create policy wl_sel on workout_logs for select using (patient_id=auth.uid() or can_manage(patient_id));
create policy wl_ins on workout_logs for insert with check (patient_id=auth.uid());

-- Seed: alimentos (valores aproximados por 100 g, conferir com a TACO)
insert into foods(name,kcal,protein,carbs,fat) values
('Ovo inteiro',143,12.6,0.7,9.5),('Pão integral',250,9,49,3.5),('Banana',89,1.1,23,0.3),
('Leite integral',61,3.2,4.7,3.3),('Leite desnatado',35,3.4,5,0.1),('Iogurte natural',61,3.5,4.7,3.3),
('Aveia em flocos',389,17,66,7),('Mamão',43,0.5,11,0.3),('Arroz cozido',128,2.5,28,0.2),
('Feijão cozido',77,4.8,14,0.5),('Peito de frango grelhado',159,32,0,2.5),('Azeite',884,0,0,100),
('Batata inglesa cozida',77,2,17,0.1),('Carne bovina magra',219,35,0,7.7),('Mel',304,0.3,82,0),
('Mandioca cozida',125,0.6,30,0.3),('Abacate',160,2,8.5,14.7),('Amendoim',567,26,16,49),
('Castanha-do-pará',659,14,12,67),('Brócolis',34,2.8,7,0.4),('Cenoura',41,0.9,10,0.2),
('Tomate',18,0.9,3.9,0.2),('Couve',35,2.9,4.4,0.7),('Espinafre',23,2.9,3.6,0.4),
('Alface',15,1.4,2.9,0.2),('Tilápia',128,26,0,2.7);
insert into exercises(name,muscle) values
('Agachamento livre','Pernas'),('Leg press','Pernas'),('Cadeira extensora','Quadríceps'),('Mesa flexora','Posterior'),
('Stiff','Posterior/glúteo'),('Elevação pélvica','Glúteo'),('Panturrilha em pé','Panturrilha'),
('Supino reto','Peito'),('Remada baixa','Costas'),('Puxada frontal','Costas'),
('Desenvolvimento com halteres','Ombro'),('Elevação lateral','Ombro'),('Rosca direta','Bíceps'),('Tríceps corda','Tríceps'),('Prancha','Abdômen');

-- Primeiro admin (troque o e-mail depois de criar a conta pelo app):
-- update profiles set role='admin' where id=(select id from auth.users where email='seu@email.com');
