-- Bizzi - Template creation profil admin
-- Remplacer AUTH_USER_ID_ICI par l'ID du user cree dans Supabase Authentication.

insert into admin_profiles (auth_user_id, full_name, role, is_active)
values (
  'AUTH_USER_ID_ICI'::uuid,
  'Admin Bizzi',
  'admin',
  true
)
on conflict (auth_user_id) do update
set full_name = excluded.full_name,
    role = excluded.role,
    is_active = true,
    updated_at = now();

