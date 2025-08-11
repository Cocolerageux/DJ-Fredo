const puppeteer = require('puppeteer');

async function testBrowser() {
    console.log('🚀 Test simple du navigateur...');
    
    try {
        // Lancer le navigateur en mode visible
        const browser = await puppeteer.launch({
            headless: false,  // Mode visible
            devtools: true,   // Outils de développement ouverts
            args: [
                '--no-sandbox',
                '--start-maximized',
                '--disable-web-security'
            ]
        });

        console.log('✅ Navigateur lancé !');

        const page = await browser.newPage();
        console.log('✅ Nouvelle page créée');

        // Aller sur Google d'abord pour tester
        await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });
        console.log('✅ Google chargé');

        // Attendre 3 secondes pour voir
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Aller sur École Directe
        console.log('🔄 Navigation vers École Directe...');
        await page.goto('https://www.ecoledirecte.com', { waitUntil: 'networkidle2' });
        console.log('✅ École Directe chargé');

        // Attendre 10 secondes pour voir la page
        console.log('⏳ Attente 10 secondes pour observer...');
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Fermer le navigateur
        await browser.close();
        console.log('🔐 Navigateur fermé');

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

testBrowser();
