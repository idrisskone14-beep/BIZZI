# Bizzi V248 — parcours Fally fiabilisé

La V248 corrige profondément le scénario événement :

- création automatique du concert test Fally au démarrage ;
- migration de l’ancien « Concert pilote » et suppression des doublons ;
- conservation des statistiques locales existantes ;
- boost Premium activé une seule fois pour 30 jours, sans prolongation artificielle à chaque chargement ;
- affiche fournie précachée par le service worker ;
- remplacement visuel automatique si une image événement devient indisponible ;
- affichage garanti dans « Événements à la une » pour Abidjan ;
- accès à la fiche depuis le bouton « Voir » et présence dans l’administration locale.

Après le déploiement du paquet `CLOUDFLARE-UPLOAD-ONLY`, ouvrir l’application avec `?refresh=1` une première fois afin de renouveler immédiatement les caches du navigateur.

Le concert reste une donnée fictive locale clairement marquée `TEST BIZZI`. Il n’est pas envoyé à Supabase et ne constitue pas une annonce officielle.
