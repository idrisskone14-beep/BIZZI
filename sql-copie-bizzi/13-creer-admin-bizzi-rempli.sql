-- Bizzi - Creation du profil admin Supabase
-- User UID fourni : b34e0c69-81cc-4f22-b290-3c087a078d9d
--
-- A executer dans Supabase SQL Editor apres avoir cree l'utilisateur
-- dans Authentication > Users.

insert into admin_profiles (auth_user_id, full_name, role, is_active)
values (
  'b34e0c69-81cc-4f22-b290-3c087a078d9d'::uuid,
  'Admin Bizzi',
  'admin',
  true
)
on conflict (auth_user_id) do update
set full_name = excluded.full_name,
    role = excluded.role,
    is_active = true,
    updated_at = now();

select
  auth_user_id,
  full_name,
  role,
  is_active
from admin_profiles
where auth_user_id = 'b34e0c69-81cc-4f22-b290-3c087a078d9d'::uuid;
