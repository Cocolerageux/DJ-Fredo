# 🚀 Guide de déploiement sur Render

## Prérequis ✅

1. **Compte GitHub** avec le code poussé
2. **Compte Render** (gratuit) : https://render.com
3. **Bot Discord créé** : https://discord.com/developers/applications

## 📋 Variables d'environnement requises

Avant de déployer, assurez-vous d'avoir :
- `DISCORD_TOKEN` - Token de votre bot Discord
- `DISCORD_CLIENT_ID` - ID de votre application Discord

## 🔧 Étapes de déploiement

### 1. Créer un nouveau service Web sur Render

1. Connectez-vous à [Render](https://render.com)
2. Cliquez sur **"New +"** → **"Web Service"**
3. Connectez votre repository GitHub `DJ-Fredo`

### 2. Configuration du service

**Paramètres de base :**
- **Name** : `dj-fredo-bot`
- **Runtime** : `Node`
- **Branch** : `main`
- **Root Directory** : *(laissez vide)*

**Commandes de build :**
- **Build Command** : `npm run render-build`
- **Start Command** : `npm run render-start`

### 3. Variables d'environnement

Dans la section **Environment**, ajoutez :

```env
DISCORD_TOKEN=votre_token_discord_ici
DISCORD_CLIENT_ID=votre_client_id_ici
NODE_ENV=production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### 4. Plan et région

- **Plan** : Free (suffisant pour commencer)
- **Region** : Frankfurt (EU Central) - plus proche de la France

### 5. Déploiement

1. Cliquez sur **"Create Web Service"**
2. Render va automatiquement :
   - Cloner votre repository
   - Installer les dépendances
   - Déployer les commandes Discord
   - Démarrer le bot

## 🔍 Surveillance et logs

### Health Check
Votre bot expose un endpoint de santé : `https://votre-service.onrender.com/health`

### Logs en temps réel
- Allez dans **Logs** sur votre service Render
- Surveillez les messages de connexion

### Redémarrages automatiques
Render redémarre automatiquement votre bot en cas de crash.

## ⚠️ Limitations du plan gratuit

- **750 heures/mois** - suffisant pour un bot 24/7
- **Suspension après 15min d'inactivité** (se réveille automatiquement)
- **512MB RAM** - suffisant pour un bot Discord

## 🐛 Résolution de problèmes

### Bot ne se connecte pas
1. Vérifiez le `DISCORD_TOKEN` dans les variables d'environnement
2. Consultez les logs pour les erreurs

### Erreurs Puppeteer
1. Vérifiez que `PUPPETEER_EXECUTABLE_PATH` est correct
2. Les dépendances Chromium sont installées automatiquement

### QCM ne fonctionne pas
En production (mode headless), les QCM nécessitent une approche différente.
Le bot tentera de détecter automatiquement les réponses.

## 📈 Amélioration des performances

### Passer au plan payant ($7/mois)
- **Pas de suspension**
- **Plus de RAM**
- **SSL personnalisé**

### Optimisations possibles
- Cache des sessions utilisateur
- Base de données pour la persistance
- Monitoring avancé

## 🎯 Prochaines étapes

Une fois déployé :
1. Testez `/login` avec vos identifiants École Directe
2. Vérifiez que toutes les commandes fonctionnent
3. Configurez la surveillance des erreurs
4. Documentez l'utilisation pour vos utilisateurs

Votre bot est maintenant en ligne 24h/24 ! 🎉
