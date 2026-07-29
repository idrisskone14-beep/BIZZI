-- =========================================================
-- Supabase Storage
-- =========================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('provider-photos', 'provider-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('advertisements', 'advertisements', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('provider-proofs', 'provider-proofs', false, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('payment-proofs', 'payment-proofs', false, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read bizzi public files" on storage.objects;
create policy "public read bizzi public files"
on storage.objects for select
to anon
using (bucket_id in ('provider-photos', 'advertisements'));

drop policy if exists "public upload provider photos" on storage.objects;
create policy "public upload provider photos"
on storage.objects for insert
to anon
with check (bucket_id = 'provider-photos');

drop policy if exists "public upload advertisement images" on storage.objects;
create policy "public upload advertisement images"
on storage.objects for insert
to anon
with check (bucket_id = 'advertisements');

drop policy if exists "public upload provider proofs" on storage.objects;
create policy "public upload provider proofs"
on storage.objects for insert
to anon
with check (bucket_id = 'provider-proofs');

drop policy if exists "public upload payment proofs" on storage.objects;
create policy "public upload payment proofs"
on storage.objects for insert
to anon
with check (bucket_id = 'payment-proofs');

create or replace function is_admin()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1
    from admin_profiles
    where auth_user_id = auth.uid()
    and is_active = true
  );
$$;

drop policy if exists "admin read bizzi private files" on storage.objects;
create policy "admin read bizzi private files"
on storage.objects for select
to authenticated
using (
  is_admin()
  and bucket_id in ('provider-proofs', 'payment-proofs', 'provider-photos', 'advertisements')
);

drop policy if exists "admin full providers" on providers;
create policy "admin full providers"
on providers for all
using (is_admin())
with check (is_admin());

drop policy if exists "admin full payments" on payments;
create policy "admin full payments"
on payments for all
using (is_admin())
with check (is_admin());

drop policy if exists "admin full advertisements" on advertisements;
create policy "admin full advertisements"
on advertisements for all
using (is_admin())
with check (is_admin());

drop policy if exists "admin full reports" on reports;
create policy "admin full reports"
on reports for all
using (is_admin())
with check (is_admin());

create or replace function expire_unpaid_providers()
returns void
language plpgsql
security definer
as $$
begin
  update providers
  set visibility_status = 'expired_blurred'
  where status = 'approved'
  and visibility_status in ('trial', 'active')
  and coalesce(subscription_ends_at, trial_ends_at) < now();

  update advertisements
  set status = 'expired'
  where status = 'active'
  and provider_id in (
    select id from providers where visibility_status = 'expired_blurred'
  );
end;
$$;
