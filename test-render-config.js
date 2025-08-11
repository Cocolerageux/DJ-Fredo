// Test de la nouvelle configuration Puppeteer
const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

console.log('🧪 Test de la nouvelle configuration Puppeteer\n');

// Simuler l'environnement Render
process.env.NODE_ENV = 'production';
process.env.PUPPETEER_CACHE_DIR = './puppeteer-cache';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'false';

console.log('📋 Variables d\'environnement simulées :');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PUPPETEER_CACHE_DIR:', process.env.PUPPETEER_CACHE_DIR);
console.log('- PUPPETEER_SKIP_CHROMIUM_DOWNLOAD:', process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD);

// Installer Chrome comme le ferait Render
console.log('\n📦 Installation de Chrome...');
try {
    execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });
    console.log('✅ Chrome installé avec succès');
} catch (e) {
    console.error('❌ Erreur installation Chrome:', e.message);
    process.exit(1);
}

// Test du webscraper
console.log('\n🚀 Test du webscraper...');
(async () => {
    try {
        const WebScraper = require('./src/scraper/webscraper');
        const scraper = new WebScraper();
        
        console.log('🔄 Initialisation du scraper...');
        await scraper.init();
        
        console.log('✅ WebScraper initialisé avec succès !');
        console.log('🎉 La configuration fonctionne parfaitement');
        
        await scraper.close();
        console.log('✅ Test terminé avec succès');
        
    } catch (e) {
        console.error('❌ Erreur lors du test:', e.message);
        console.error('📝 Stack:', e.stack);
        process.exit(1);
    }
})();
