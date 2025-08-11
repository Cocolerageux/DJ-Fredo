const WebScraper = require('./src/scraper/webscraper');

async function testLogin() {
    console.log('🧪 Test de connexion École Directe');
    
    const scraper = new WebScraper();
    
    try {
        // Initialiser avec mode debug visible
        await scraper.init();
        
        console.log('✅ WebScraper initialisé');
        
        // Essayer de se connecter avec des identifiants de test
        console.log('🔑 Tentative de connexion...');
        await scraper.login('test', 'test'); // Identifiants de test
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        console.error('📋 Stack trace:', error.stack);
    } finally {
        // Garder le navigateur ouvert pour inspection
        console.log('🔍 Navigateur maintenu ouvert pour inspection...');
        console.log('Appuyez sur Ctrl+C pour fermer');
        
        // Attendre 60 secondes avant de fermer automatiquement
        setTimeout(async () => {
            await scraper.close();
            process.exit(0);
        }, 60000);
    }
}

testLogin().catch(console.error);
