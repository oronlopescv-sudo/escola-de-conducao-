# Auto-École CV

Plateforme de gestion pour auto-école au Cap-Vert. Panneau d'administration + portail de l'élève avec vidéos et exercices basés sur le **Manuel du Code de la route du Cap-Vert** et le **Décret-législatif n° 4/2005**.

## Stack
Next.js 14 (App Router, TypeScript) · Prisma · PostgreSQL · JWT (cookie httpOnly) · Tailwind CSS

## Fonctionnalités
**Admin :** tableau de bord des indicateurs, gestion des élèves (avec validation de l'âge minimal par catégorie — art. 122º), gestion des 23 modules avec vidéos YouTube, banque de questions.
**Élève :** progression sur la « route », modules avec vidéo + exercices par module, examen blanc de 20 questions avec correction automatique et explications, historique des résultats (objectif 80 %).

## Démarrage rapide (local)
```bash
cp .env.example .env        # éditer DATABASE_URL et JWT_SECRET
npm install
npx prisma db push          # crée les tables
npm run db:seed             # 23 modules + 40+ questions + comptes démo
npm run dev
```
Comptes de démonstration créés par le seed : `aluno@autoescola.cv / aluno123` (uniquement avec `SEED_DEMO=1`).
Le compte admin n'a pas de mot de passe fixe dans le code : il est créé ou renouvelé via la variable d'environnement `ADMIN_PASSWORD`, par le seed, `npm run admin:reset` ou au premier démarrage de l'application.

## Comptes et variables d'environnement
- `DATABASE_URL` et `JWT_SECRET` se définissent dans les variables d'environnement du panneau (EasyPanel) : rien n'est stocké dans le dépôt ni dans le code.
- `ADMIN_PASSWORD` crée le compte admin (`admin@autoescola.cv`) : via le seed (`npm run db:seed`), via `npm run admin:reset`, ou automatiquement au premier démarrage si aucun compte ADMIN n'existe encore.
- Le compte élève de démonstration (`aluno@autoescola.cv / aluno123`) n'est créé que si `SEED_DEMO=1` est défini — ne pas l'utiliser en production.

## Déploiement avec Docker (VPS / EasyPanel)
```bash
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
echo "DB_PASSWORD=$(openssl rand -hex 16)" >> .env
docker compose up -d --build
# première fois : créer les tables et lancer le seed
docker compose exec app npx prisma db push
docker compose exec app npx tsx prisma/seed.ts
```
Sur EasyPanel : créer un service PostgreSQL + un service App pointant vers ce dépôt (Dockerfile inclus), en définissant `DATABASE_URL` et `JWT_SECRET` dans les variables d'environnement du panneau.

## Scripts
| commande | description |
|---|---|
| `npm run dev` | développement |
| `npm run build` | build de production (inclut prisma generate) |
| `npm run db:push` | synchroniser le schéma avec la base de données |
| `npm run db:seed` | alimenter les modules, les questions et les comptes démo |
| `npm test` | tests des règles métier |

## Sécurité
- JWT httpOnly, `sameSite=lax` (atténue le CSRF), `secure` en production
- `JWT_SECRET` obligatoire en production (échoue tôt si absent)
- Limite de débit sur la connexion (10 tentatives / 15 min par IP)
- Comparaison bcrypt à temps constant (anti énumération d'utilisateurs)
- Autorisation par rôle sur toutes les routes API + middleware sur les pages
- L'élève ne reçoit jamais la bonne réponse avant d'avoir soumis
- En-têtes de sécurité (X-Frame-Options, nosniff, Referrer-Policy)
- Prisma (requêtes paramétrées) + validation des payloads

## Améliorations futures
Gestion des instructeurs/véhicules/cours/finances (spec complète), notifications SMS/WhatsApp, téléversement de documents, rapports PDF/Excel, limite de débit avec Redis pour les architectures multi-instances.
