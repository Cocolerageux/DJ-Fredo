#!/bin/bash
# Script de démarrage pour Render
echo "🚀 Démarrage du bot Discord École Directe..."

# Installer les dépendances Chromium pour Puppeteer
echo "📦 Installation des dépendances système..."
apt-get update
apt-get install -y \
    chromium-browser \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgtk-3-0 \
    libxss1 \
    xdg-utils

# Démarrer le bot
echo "🤖 Lancement du bot..."
node src/index.js
