-- Bizzi - Valider le prestataire test cree par Codex
-- Date : 30 juin 2026
--
-- Ce fichier valide uniquement le test suivant :
-- Prestataire : Test Bizzi Plomberie
-- Telephone : +2250700232149
-- Provider ID : f78ecf56-9855-435f-935f-251ed87b42ba
-- Payment ID : 3a104ce3-1b9a-4b27-b61d-2b487e0136f0
-- Advertisement ID : d25c3335-6730-4978-a77a-479200d9b5fe

update payments
set status = 'approved',
    approved_at = now(),
    updated_at = now()
where id = '3a104ce3-1b9a-4b27-b61d-2b487e0136f0'::uuid;

update providers
set status = 'approved',
    visibility_status = 'active',
    subscription_ends_at = greatest(coalesce(subscription_ends_at, now()), now()) + interval '1 month',
    updated_at = now()
where id = 'f78ecf56-9855-435f-935f-251ed87b42ba'::uuid;

update advertisements
set status = 'active',
    updated_at = now()
where id = 'd25c3335-6730-4978-a77a-479200d9b5fe'::uuid;

select
  p.id,
  p.full_name,
  p.phone,
  p.status,
  p.visibility_status,
  p.subscription_ends_at
from providers p
where p.id = 'f78ecf56-9855-435f-935f-251ed87b42ba'::uuid;

