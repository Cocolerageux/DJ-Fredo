const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./src/commands/login.js');

// Simuler un test du bot local
async function testBotLocal() {
    console.log('🤖 Test du bot Discord en local...');
    
    // Créer une instance du client Discord (sans se connecter)
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });
    
    console.log('✅ Client Discord créé');
    
    // Simuler la commande login
    try {
        // Importer le webscraper
        const WebScraper = require('./src/scraper/webscraper');
        
        console.log('🔧 Test du webscraper...');
        const scraper = new WebScraper();
        await scraper.init();
        console.log('✅ WebScraper initialisé avec succès');
        
        // Test très basique - juste vérifier que la navigation fonctionne
        console.log('🌐 Test de navigation vers École Directe...');
        await scraper.page.goto('https://www.ecoledirecte.com', { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        
        const title = await scraper.page.title();
        console.log('📄 Titre de la page:', title);
        
        if (title.includes('EcoleDirecte') || title.includes('Connexion')) {
            console.log('✅ Navigation vers École Directe réussie');
        } else {
            console.log('⚠️ Navigation incertaine, titre:', title);
        }
        
        await scraper.close();
        console.log('✅ Test du webscraper terminé avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors du test du webscraper:', error.message);
    }
    
    console.log('🎉 Test complet terminé');
    process.exit(0);
}

testBotLocal().catch(console.error);
