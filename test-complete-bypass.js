// Test de la stratégie de contournement complète
const WebScraper = require('./src/scraper/webscraper');

async function testCompleteBypass() {
    console.log('🛡️ Test complet de contournement anti-bot');
    console.log('=========================================');
    
    const scraper = new WebScraper();
    
    try {
        // Simuler l'environnement Render
        process.env.NODE_ENV = 'production';
        process.env.RENDER = 'true';
        process.env.PUPPETEER_CACHE_DIR = './puppeteer-cache';
        
        console.log('🚀 Initialisation en mode production...');
        await scraper.init();
        
        console.log('✅ WebScraper initialisé');
        
        // Test direct de la méthode login (qui contient notre logique de contournement)
        console.log('🔐 Test de la méthode login complète...');
        
        try {
            // Utiliser des identifiants de test
            await scraper.login('test_user', 'test_password');
            console.log('❌ Login ne devrait pas réussir avec des identifiants de test');
        } catch (error) {
            if (error.message.includes('Champ identifiant non trouvé')) {
                console.log('✅ Erreur attendue: Champs non trouvés (normal avec des identifiants de test)');
                console.log('✅ Cela signifie que le contournement anti-bot a fonctionné !');
            } else if (error.message.includes('Voight-Kampff')) {
                console.log('❌ Test anti-bot non résolu:', error.message);
            } else {
                console.log('📋 Autre erreur (peut indiquer que le contournement a fonctionné):', error.message);
            }
        }
        
        // Vérifier l'état de la page actuelle
        if (scraper.page && !scraper.page.isClosed()) {
            const currentTitle = await scraper.page.title();
            const currentUrl = scraper.page.url();
            
            console.log('📄 État final de la page:');
            console.log('  - Titre:', currentTitle);
            console.log('  - URL:', currentUrl);
            
            if (currentTitle.includes('Voight-Kampff')) {
                console.log('❌ Toujours bloqué par le test anti-bot');
            } else {
                console.log('✅ Test anti-bot contourné avec succès');
            }
        }
        
    } catch (error) {
        console.error('❌ Erreur globale:', error.message);
    } finally {
        await scraper.close();
        console.log('🔐 Test terminé');
    }
}

testCompleteBypass();
