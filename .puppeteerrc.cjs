const { join } = require('path');

/**
 * Configuration Puppeteer pour Render
 */
module.exports = {
  // Répertoire de cache pour Chrome
  cacheDirectory: process.env.PUPPETEER_CACHE_DIR || join(__dirname, '.cache', 'puppeteer'),
  
  // Ne pas télécharger Chromium par défaut (on utilise le build command)
  skipDownload: false,
  
  // Version de Chrome à utiliser
  browserRevision: '131.0.6778.204',
  
  // Produit à utiliser (chrome pour Linux sur Render)
  product: 'chrome'
};
