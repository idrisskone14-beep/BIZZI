-- Bizzi - Seed production Cote d'Ivoire
-- A executer apres schema-bizzi.sql et supabase-production-bizzi.sql
-- Objectif : catalogue national de depart pour villes, communes, services et forfaits.

alter table cities add column if not exists latitude numeric(10, 7);
alter table cities add column if not exists longitude numeric(10, 7);
alter table communes add column if not exists latitude numeric(10, 7);
alter table communes add column if not exists longitude numeric(10, 7);

insert into countries (name, iso_code, currency)
values ('Côte d''Ivoire', 'CI', 'FCFA')
on conflict (name) do update
set iso_code = excluded.iso_code,
    currency = excluded.currency,
    is_active = true;

insert into subscription_plans (name, duration_months, price, currency)
values
  ('1 mois', 1, 999, 'FCFA'),
  ('6 mois', 6, 4900, 'FCFA'),
  ('12 mois', 12, 9900, 'FCFA')
on conflict (name) do update
set duration_months = excluded.duration_months,
    price = excluded.price,
    currency = excluded.currency,
    is_active = true;

with ci as (
  select id from countries where name = 'Côte d''Ivoire'
)
insert into cities (country_id, name, latitude, longitude)
select ci.id, v.name, v.latitude, v.longitude
from ci
cross join (values
  ('Abidjan', 5.3453000, -4.0244000),
  ('Abobo', 5.4161000, -4.0159000),
  ('Adjamé', 5.3651000, -4.0236000),
  ('Anyama', 5.4946000, -4.0518000),
  ('Bingerville', 5.3558000, -3.8854000),
  ('Cocody', 5.3599000, -3.9816000),
  ('Koumassi', 5.3002000, -3.9479000),
  ('Marcory', 5.3029000, -3.9875000),
  ('Port-Bouët', 5.2618000, -3.9262000),
  ('Treichville', 5.2937000, -4.0039000),
  ('Yopougon', 5.3364000, -4.0739000),
  ('Bouaké', 7.6906000, -5.0301000),
  ('Yamoussoukro', 6.8276000, -5.2893000),
  ('San Pedro', 4.7485000, -6.6363000),
  ('Daloa', 6.8774000, -6.4502000),
  ('Korhogo', 9.4580000, -5.6296000),
  ('Man', 7.4125000, -7.5538000),
  ('Gagnoa', 6.1319000, -5.9506000),
  ('Abengourou', 6.7297000, -3.4964000),
  ('Divo', 5.8374000, -5.3572000),
  ('Soubré', 5.7856000, -6.6083000),
  ('Bondoukou', 8.0402000, -2.8000000),
  ('Séguéla', 7.9611000, -6.6731000),
  ('Odienné', 9.5051000, -7.5643000),
  ('Aboisso', 5.4678000, -3.2071000),
  ('Agboville', 5.9280000, -4.2132000),
  ('Adzopé', 6.1069000, -3.8619000),
  ('Bouaflé', 6.9904000, -5.7442000),
  ('Issia', 6.4922000, -6.5856000),
  ('Guiglo', 6.5437000, -7.4935000),
  ('Duékoué', 6.7420000, -7.3492000),
  ('Sassandra', 4.9500000, -6.0833000),
  ('Grand-Bassam', 5.2118000, -3.7388000),
  ('Dabou', 5.3256000, -4.3769000),
  ('Tiassalé', 5.8984000, -4.8229000),
  ('Toumodi', 6.5579000, -5.0177000),
  ('Mankono', 8.0586000, -6.1897000),
  ('Ferkessédougou', 9.5928000, -5.1945000),
  ('Bouna', 9.2693000, -3.0009000),
  ('Boundiali', 9.5217000, -6.4869000),
  ('Katiola', 8.1373000, -5.1009000),
  ('Dabakala', 8.3632000, -4.4286000),
  ('Tanda', 7.8034000, -3.1683000),
  ('Bongouanou', 6.6518000, -4.2040000),
  ('Daoukro', 7.0591000, -3.9631000),
  ('Lakota', 5.8528000, -5.6828000),
  ('Oumé', 6.3831000, -5.4176000),
  ('Sinfra', 6.6210000, -5.9114000),
  ('Vavoua', 7.3819000, -6.4778000),
  ('Zuénoula', 7.4292000, -6.0472000),
  ('Touba', 8.2833000, -7.6833000),
  ('Biankouma', 7.7404000, -7.6138000),
  ('Danané', 7.2596000, -8.1548000),
  ('Tabou', 4.4229000, -7.3528000),
  ('Fresco', 5.1000000, -5.5833000),
  ('Jacqueville', 5.2050000, -4.4146000),
  ('Tiébissou', 7.1578000, -5.2245000),
  ('Bocanda', 7.0626000, -4.4995000),
  ('M''Bahiakro', 7.4577000, -4.3391000)
) as v(name, latitude, longitude)
on conflict (country_id, name) do update
set latitude = excluded.latitude,
    longitude = excluded.longitude,
    is_active = true;

with abidjan as (
  select id from cities where name = 'Abidjan'
)
insert into communes (city_id, name, latitude, longitude)
select abidjan.id, v.name, v.latitude, v.longitude
from abidjan
cross join (values
  ('Abobo', 5.4161000, -4.0159000),
  ('Adjamé', 5.3651000, -4.0236000),
  ('Anyama', 5.4946000, -4.0518000),
  ('Bingerville', 5.3558000, -3.8854000),
  ('Cocody', 5.3599000, -3.9816000),
  ('Koumassi', 5.3002000, -3.9479000),
  ('Marcory', 5.3029000, -3.9875000),
  ('Plateau', 5.3269000, -4.0207000),
  ('Port-Bouët', 5.2618000, -3.9262000),
  ('Treichville', 5.2937000, -4.0039000),
  ('Yopougon', 5.3364000, -4.0739000)
) as v(name, latitude, longitude)
on conflict (city_id, name) do update
set latitude = excluded.latitude,
    longitude = excluded.longitude,
    is_active = true;

