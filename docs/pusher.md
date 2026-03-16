# Pusher — État des lieux et décision

## Ce que fait Pusher dans l'app

Pusher gère la **collaboration en temps réel** : quand un utilisateur modifie une fiche, les autres utilisateurs qui regardent la même fiche voient les changements sans recharger la page.

### Architecture actuelle

```
User A modifie la fiche     →  API route (update/update_partial)
                                  ↓
                            Pusher server trigger
                            channel: vampire-sheet-{id}
                            event: update
                            data: { appId }
                                  ↓
User B voit la mise à jour  ←  PusherSheetListener (client)
                                  ↓
                            SWR mutate() → re-fetch les données
```

### Deux canaux

| Canal | Déclenché par | Écouté par | Effet |
|-------|--------------|------------|-------|
| `vampire-sheets` | `POST /api/vampires/create` | `PusherSheetsListener` (page index) | Rafraîchit la liste des fiches |
| `vampire-sheet-{id}` | `PUT /update`, `PATCH /update_partial` | `PusherSheetListener` (page fiche) | Rafraîchit la fiche en cours |

Un seul type d'event : `update`. Le payload ne contient que `{ appId }` — le client filtre ses propres updates et re-fetch via SWR.

### Fichiers concernés

**Serveur (triggers) :**
- `helpers/pusherServer.ts` — init + fonctions `updateOnSheets()`, `updateOnSheet()`
- `helpers/pusherConst.ts` — noms des canaux et events
- `pages/api/vampires/create.ts` — trigger après création
- `pages/api/vampires/[id]/update.ts` — trigger après update complet
- `pages/api/vampires/[id]/update_partial.ts` — trigger après update partiel

**Client (listeners) :**
- `helpers/pusherClient.ts` — init client + fonctions `subscribeToSheets()`, `subscribeToSheet()`
- `components/no-ssr/PusherSheetsListener.tsx` — listener page index
- `components/no-ssr/PusherSheetListener.tsx` — listener page fiche
- `contexts/SystemContext.tsx` — gère l'instance Pusher client, le `appId`, et le fallback

### Fallback sans Pusher

L'app fonctionne sans Pusher. `SystemContext` détecte si la connexion échoue (`needPusherFallback`) et active un polling SWR toutes les 10 secondes. La collaboration temps réel est dégradée mais fonctionnelle.

### Env vars

```
PUSHER_APP_ID='...'              # Server-side
NEXT_PUBLIC_PUSHER_KEY='...'     # Client-side (public)
PUSHER_SECRET='...'              # Server-side
NEXT_PUBLIC_PUSHER_CLUSTER='...' # Client-side (public, ex: eu, us3, ap1)
```

## Vérifier ton compte Pusher

1. Va sur https://dashboard.pusher.com/
2. Connecte-toi (email/GitHub)
3. Si le compte existe encore :
   - Vérifie que l'app est toujours listée (regarde l'App ID)
   - Va dans **App Keys** pour récupérer les clés
   - Vérifie le **plan** (le free tier Pusher permet 200k messages/jour, 100 connexions simultanées — largement suffisant)
   - Vérifie les **stats** pour voir si l'app a encore du trafic
4. Si le compte n'existe plus ou si l'app a été supprimée :
   - Crée une nouvelle app Pusher (free tier)
   - Choisis le cluster le plus proche (probablement `eu` pour toi)
   - Mets à jour les env vars dans Vercel

## Impact migration

Zéro changement de code côté Pusher pendant la migration DB/Auth. Les canaux sont publics, pas de Pusher auth endpoint à maintenir. Juste vérifier que les clés sont bonnes dans les env vars Vercel.
