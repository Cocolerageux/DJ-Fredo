const WebScraper = require('./src/scraper/webscraper');

async function testWebScraper() {
    console.log('🌐 TEST DU WEB SCRAPER ÉCOLE DIRECTE');
    console.log('===================================\n');

    const scraper = new WebScraper();
    
    try {
        console.log('🚀 Initialisation...');
        await scraper.init();
        
        console.log('🔐 Tentative de connexion...');
        const result = await scraper.login('c.champagne', 'Corentin02520?');
        
        console.log('📊 Résultat de la connexion:', result);
        
        if (result.success) {
            console.log('✅ Connexion réussie !');
            console.log('👤 Utilisateur:', result.account);
            
            // Test récupération des notes
            console.log('\n📚 Test récupération des notes...');
            const notesResult = await scraper.getNotes();
            console.log('📊 Résultat notes:', notesResult);
            
        } else if (result.qcmRequired) {
            console.log('🔐 QCM requis !');
            console.log('❓ Question:', result.qcmData.question);
            console.log('📋 Options:', result.qcmData.options);
            
            // Simuler la réponse avec un mois (essayons février pour février 2008)
            const monthOptions = result.qcmData.options;
            let testMonth = null;
            
            // Si naissance en 2008, essayons différents mois
            const monthsToTry = ['février', 'fevrier', 'mars', 'avril', 'mai'];
            for (const month of monthsToTry) {
                if (monthOptions.includes(month)) {
                    testMonth = month;
                    break;
                }
            }
            
            if (testMonth) {
                console.log(`\n🎯 Test finalisation avec ${testMonth}...`);
                const finalResult = await scraper.completeQCMLogin(testMonth);
                console.log('📊 Résultat final:', finalResult);
                
                if (finalResult.success) {
                    console.log('✅ QCM validé ! Test des notes...');
                    const notesResult = await scraper.getNotes();
                    console.log('📊 Notes:', notesResult);
                }
            } else {
                console.log('❌ Aucun mois de test trouvé dans les options');
            }
        } else {
            console.log('❌ Échec de connexion:', result.error);
        }
        
    } catch (error) {
        console.error('💥 Erreur test web scraper:', error);
    } finally {
        console.log('\n🔐 Fermeture du navigateur...');
        await scraper.close();
    }
}

if (require.main === module) {
    testWebScraper().catch(console.error);
}

module.exports = testWebScraper;
