// Test d'environnement pour Render
const fs = require('fs');
const { execSync } = require('child_process');

console.log('=== DIAGNOSTIC ENVIRONNEMENT RENDER ===\n');

// Variables d'environnement
console.log('📋 Variables d\'environnement :');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- RENDER:', process.env.RENDER);
console.log('- HOME:', process.env.HOME);
console.log('- PWD:', process.env.PWD);
console.log('- USER:', process.env.USER);
console.log('- PUPPETEER_CACHE_DIR:', process.env.PUPPETEER_CACHE_DIR);
console.log('- PUPPETEER_EXECUTABLE_PATH:', process.env.PUPPETEER_EXECUTABLE_PATH);

// Informations système
console.log('\n🖥️ Informations système :');
try {
    console.log('- OS:', execSync('uname -a', {encoding: 'utf8'}).trim());
} catch (e) {
    console.log('- OS: Windows (local)');
}

try {
    console.log('- Utilisateur:', execSync('whoami', {encoding: 'utf8'}).trim());
} catch (e) {
    console.log('- Utilisateur: N/A');
}

// Vérification des chemins Chromium
console.log('\n🔍 Recherche de navigateurs :');
const possiblePaths = [
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/opt/render/.cache/puppeteer',
    process.env.HOME + '/.cache/puppeteer',
    '/tmp/.cache/puppeteer'
];

possiblePaths.forEach(path => {
    try {
        if (fs.existsSync(path)) {
            const stats = fs.statSync(path);
            console.log(`✅ ${path} (${stats.isDirectory() ? 'dossier' : 'fichier'})`);
            
            if (stats.isDirectory()) {
                try {
                    const contents = fs.readdirSync(path);
                    console.log(`   Contenu: ${contents.slice(0, 5).join(', ')}${contents.length > 5 ? '...' : ''}`);
                } catch (e) {
                    console.log(`   Erreur lecture: ${e.message}`);
                }
            }
        } else {
            console.log(`❌ ${path}`);
        }
    } catch (e) {
        console.log(`❌ ${path} (erreur: ${e.message})`);
    }
});

// Test Puppeteer
console.log('\n🚀 Test Puppeteer :');
try {
    const puppeteer = require('puppeteer');
    console.log('✅ Puppeteer importé avec succès');
    
    // Configuration Puppeteer
    console.log('📋 Configuration Puppeteer :');
    try {
        const config = require('./.puppeteerrc.cjs');
        console.log('- Cache Directory:', config.cacheDirectory);
        console.log('- Browser Revision:', config.browserRevision);
        console.log('- Product:', config.product);
    } catch (e) {
        console.log('⚠️ Pas de configuration .puppeteerrc.cjs');
    }
    
    // Test de lancement (très rapide)
    (async () => {
        try {
            console.log('🔄 Test de lancement rapide...');
            
            const launchOptions = {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            };
            
            // Ajouter executablePath si défini
            if (process.env.PUPPETEER_EXECUTABLE_PATH) {
                launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
                console.log('🎯 Utilisation executablePath:', process.env.PUPPETEER_EXECUTABLE_PATH);
            }
            
            const browser = await puppeteer.launch(launchOptions);
            console.log('✅ Navigateur lancé avec succès !');
            
            const version = await browser.version();
            console.log('📊 Version Chrome:', version);
            
            await browser.close();
            console.log('✅ Navigateur fermé proprement');
        } catch (e) {
            console.log('❌ Erreur lancement:', e.message);
            console.log('📝 Stack trace:', e.stack);
        }
    })();
    
} catch (e) {
    console.log('❌ Erreur import Puppeteer:', e.message);
}

console.log('\n=== FIN DIAGNOSTIC ===');
