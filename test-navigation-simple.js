const puppeteer = require('puppeteer');

async function testSimpleSite() {
    console.log('🌐 Test avec site simple...');
    
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security'
            ]
        });
        
        const page = await browser.newPage();
        console.log('✅ Page créée');
        
        // Test avec un site simple
        console.log('🔄 Test avec httpbin.org...');
        await page.goto('https://httpbin.org/get', { 
            waitUntil: 'domcontentloaded',
            timeout: 10000 
        });
        console.log('✅ Site simple OK');
        
        // Test avec Discord (sans se connecter)
        console.log('🔄 Test avec Discord...');
        await page.goto('https://discord.com', { 
            waitUntil: 'domcontentloaded',
            timeout: 10000 
        });
        console.log('✅ Discord OK');
        
        // Test avec École Directe
        console.log('🔄 Test avec École Directe...');
        await page.goto('https://www.ecoledirecte.com', { 
            waitUntil: 'domcontentloaded',
            timeout: 10000 
        });
        console.log('✅ École Directe OK');
        
        console.log('🎉 Tous les tests de navigation réussis !');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testSimpleSite();
