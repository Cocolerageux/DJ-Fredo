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

### 3. Variables d'environnement ⚠️ **CRITIQUE**

Dans la section **Environment**, ajoutez **EXACTEMENT** :

```env
DISCORD_TOKEN=MTxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxxxxxxxxxxxxxxxxx
DISCORD_CLIENT_ID=1234567890123456789
NODE_ENV=production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
PUPPETEER_CACHE_DIR=./puppeteer-cache
DEBUG=puppeteer:*
```

🚨 **NOUVELLE STRATÉGIE :**
- Chrome s'installe maintenant au **démarrage** (pas au build)
- Cache local dans le projet (pas `/opt/render/`)
- **Supprimez** `PUPPETEER_EXECUTABLE_PATH` - auto-détection
- DEBUG activé pour diagnostiquer les problèmes

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

### ❌ Bot ne se connecte pas - "TokenInvalid"
**Erreur :** `Error [TokenInvalid]: An invalid token was provided`

**Si le bot marche localement mais pas sur Render :**

1. **Variables d'environnement Render :**
   - Allez dans votre service → **Environment**
   - Vérifiez que `DISCORD_TOKEN` est bien là
   - **IMPORTANT** : Cliquez sur "Save Environment Variables"
   - Si la variable existe, **supprimez-la et recréez-la**

2. **Redéploiement obligatoire :**
   - Après modification des variables : **Manual Deploy** → **Deploy latest commit**
   - Attendez que le déploiement soit terminé

3. **Vérification dans les logs :**
   - Render → Logs
   - Cherchez : `Debug Variables d'environnement`
   - Doit afficher : `DISCORD_TOKEN: Defini`

**Solutions alternatives :**
- Essayez de changer la région Render (US East → EU Frankfurt)
- Créez un nouveau service avec les mêmes paramètres
- Contactez le support Render si le problème persiste

### ⚠️ Bot se connecte mais commandes ne marchent pas
1. Vérifiez que `DISCORD_CLIENT_ID` est correct
2. Assurez-vous que le bot a les bonnes permissions sur Discord
3. Consultez les logs pour les erreurs

### Erreurs Puppeteer
**Erreur :** `Could not find Chrome (ver. 139.0.7258.66)`

**Solution complète :**
1. **Variables d'environnement Render :**
   ```env
   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
   PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
   ```

2. **Vérification du build :**
   - Render → Logs → Build logs
   - Cherchez : "📦 Installation de Chrome..."
   - Doit afficher : "✅ Configuration terminée !"

3. **Si l'erreur persiste :**
   - Manual Deploy → Clear build cache
   - Redéployez avec un build fresh
   - Le script créera automatiquement le répertoire cache

4. **Debug dans les logs de démarrage :**
   - Cherchez : "📁 Cache Puppeteer: /opt/render/.cache/puppeteer"
   - Si pas affiché → problème de variables d'environnement

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
