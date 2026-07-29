# Bizzi V183 - Carte, distance, itineraire et monitoring

## Objectif

Activer deux briques externes sans exposer de secret dans l'application publique :

- carte / distance / itineraire : Mapbox en priorite, OpenStreetMap en secours ;
- bugs / alertes / monitoring : Sentry, Better Stack/Logtail ou une URL personnalisee.

## 1. SQL Supabase

Executer dans Supabase SQL Editor :

```sql
-- fichier a copier
sql-copie-bizzi/81-cartographie-monitoring-v183.sql
```

Ce script complete :

- `map_lookup_events` ;
- `app_error_events` ;
- `monitoring_forwarding_events` ;
- `integration_health_checks`.

## 2. Fonctions Supabase a deployer

Deployer ou redeployer :

```text
outputs/supabase/functions/map-geocode
outputs/supabase/functions/error-ingest
outputs/supabase/functions/monitoring-forwarder
```

## 3. Cartographie

Option recommandee :

```bash
supabase secrets set BIZZI_MAPS_PROVIDER="auto"
supabase secrets set MAPBOX_ACCESS_TOKEN="VOTRE_CLE_MAPBOX"
supabase secrets set OPENSTREETMAP_USER_AGENT="Bizzi/1.0 contact@bizzi-africa.com"
```

Si Mapbox n'est pas encore disponible, Bizzi peut utiliser OpenStreetMap :

```bash
supabase secrets set BIZZI_MAPS_PROVIDER="openstreetmap"
supabase secrets set OPENSTREETMAP_USER_AGENT="Bizzi/1.0 contact@bizzi-africa.com"
```

Pour un routage OpenStreetMap plus robuste, utiliser votre propre serveur OSRM ou fournisseur compatible :

```bash
supabase secrets set OPENSTREETMAP_ROUTING_URL="https://votre-routeur-osrm.example.com"
```

## 4. Monitoring Sentry

```bash
supabase secrets set BIZZI_MONITORING_PROVIDER="sentry"
supabase secrets set BIZZI_SENTRY_DSN="VOTRE_DSN_SENTRY"
```

## 5. Monitoring Better Stack / Logtail

```bash
supabase secrets set BIZZI_MONITORING_PROVIDER="better_stack"
supabase secrets set BIZZI_MONITORING_FORWARD_URL="URL_INGESTION_BETTER_STACK"
supabase secrets set BIZZI_MONITORING_FORWARD_KEY="TOKEN_SOURCE"
```

## 6. Test terrain

Tester :

- Cocody Riviera 2 vers Marcory Zone 4 ;
- Bouake centre vers quartier Air France ;
- Yamoussoukro centre vers quartier Millionnaire.

Ensuite verifier dans l'admin Bizzi :

- les livraisons ont une distance calculee ;
- `map_lookup_events` recoit les recherches ;
- `app_error_events` recoit les erreurs ;
- `monitoring_forwarding_events` indique `sent` si Sentry ou Better Stack est branche.
