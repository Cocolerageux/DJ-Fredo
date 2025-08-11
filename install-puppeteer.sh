#!/bin/bash

echo "🚀 Installation et configuration Puppeteer pour Render..."

# Créer le répertoire cache si nécessaire
mkdir -p /opt/render/.cache/puppeteer

# Installer Chrome avec Puppeteer
echo "📦 Installation de Chrome..."
npx puppeteer browsers install chrome --path /opt/render/.cache/puppeteer

# Vérifier l'installation
echo "🔍 Vérification de l'installation Chrome..."
if [ -d "/opt/render/.cache/puppeteer" ]; then
    echo "✅ Répertoire cache créé: /opt/render/.cache/puppeteer"
    ls -la /opt/render/.cache/puppeteer/
else
    echo "❌ Erreur: Répertoire cache non trouvé"
fi

# Déployer les commandes Discord
echo "🤖 Déploiement des commandes Discord..."
node src/deploy-commands.js

echo "✅ Configuration terminée !"
