const puppeteer = require('puppeteer');

async function testEcoleDirecteOnly() {
    console.log('🎓 Test École Directe uniquement...');
    
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });

        const page = await browser.newPage();
        console.log('✅ Page créée');

        // Configurer la page pour éviter les problèmes
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.setViewport({ width: 1366, height: 768 });
        
        console.log('🔄 Navigation directe vers École Directe...');
        await page.goto('https://www.ecoledirecte.com', { 
            waitUntil: 'domcontentloaded',
            timeout: 15000 
        });
        
        console.log('✅ École Directe chargé');
        
        // Vérifier le titre de la page
        const title = await page.title();
        console.log('📄 Titre:', title);
        
        // Vérifier l'URL
        const url = page.url();
        console.log('📍 URL:', url);
        
        // Attendre et analyser la page
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const pageInfo = await page.evaluate(() => {
            return {
                hasLoginForm: !!document.querySelector('form'),
                inputsCount: document.querySelectorAll('input').length,
                buttonsCount: document.querySelectorAll('button').length
            };
        });
        
        console.log('📊 Informations page:', pageInfo);
        
        if (pageInfo.hasLoginForm) {
            console.log('✅ Formulaire de connexion détecté');
        } else {
            console.log('⚠️ Aucun formulaire de connexion trouvé');
        }
        
        // Attendre 5 secondes pour observation
        console.log('⏳ Attente 5 secondes...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('🎉 Test réussi !');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        console.error('📋 Stack:', error.stack);
    } finally {
        if (browser) {
            await browser.close();
            console.log('🔐 Navigateur fermé');
        }
    }
}

testEcoleDirecteOnly();
