const EcoleDirecteWebScraper = require('./src/scraper/webscraper');

async function testWebScraping() {
    console.log('🌐 Test du bypass via Web Scraping...\n');
    
    const scraper = new EcoleDirecteWebScraper();
    
    try {
        // Initialiser le scraper
        await scraper.init();
        
        // Intercepter les appels API pendant la connexion
        const apiCalls = await scraper.interceptApiCalls();
        
        // Tenter la connexion
        const loginResult = await scraper.login('c.champagne', 'Corentin02520?');
        
        if (loginResult.success) {
            console.log('✅ SUCCÈS ! Connexion web réussie');
            
            // Essayer de récupérer les notes
            const notesResult = await scraper.getNotes();
            if (notesResult.success) {
                console.log('📊 Notes récupérées:', notesResult.data);
            }
            
            // Essayer de récupérer l'emploi du temps
            const emploiResult = await scraper.getEmploiDuTemps();
            if (emploiResult.success) {
                console.log('📅 Emploi du temps récupéré:', emploiResult.data);
            }
            
            // Afficher les appels API interceptés
            if (apiCalls.length > 0) {
                console.log('\n🔍 Appels API interceptés:');
                apiCalls.forEach((call, index) => {
                    console.log(`${index + 1}. ${call.method} ${call.url}`);
                    console.log('   Headers:', call.headers);
                    if (call.payload) {
                        console.log('   Payload:', call.payload);
                    }
                });
            }
            
        } else {
            console.log('❌ Échec de la connexion web:', loginResult.message);
        }
        
    } catch (error) {
        console.error('💥 Erreur générale:', error.message);
    } finally {
        await scraper.close();
    }
}

async function testProxyBypass() {
    console.log('\n🔄 Test bypass via proxy/VPN...\n');
    
    const axios = require('axios');
    
    // Exemple avec différents proxies/user agents
    const proxies = [
        // Test avec proxy Tor (si disponible)
        { proxy: 'socks5://127.0.0.1:9050', name: 'Tor' },
        // Test avec différents user agents
        { userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', name: 'Linux Chrome' },
        { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', name: 'macOS Chrome' },
        { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15', name: 'iPhone Safari' }
    ];
    
    for (const config of proxies) {
        console.log(`🔄 Test avec ${config.name}...`);
        
        try {
            const axiosConfig = {
                timeout: 10000,
                headers: {
                    'User-Agent': config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                validateStatus: () => true
            };
            
            if (config.proxy) {
                // Note: nécessiterait la configuration d'un proxy
                console.log(`   ⚠️ Proxy ${config.proxy} nécessiterait une configuration spéciale`);
                continue;
            }
            
            // Test GTK avec cette configuration
            const gtkResponse = await axios.get('https://api.ecoledirecte.com/v3/login.awp?gtk=1&v=4.75.0', axiosConfig);
            
            let gtkValue = '';
            if (gtkResponse.headers['set-cookie']) {
                const gtkCookie = gtkResponse.headers['set-cookie'].find(cookie => cookie.includes('GTK='));
                if (gtkCookie) {
                    gtkValue = gtkCookie.split('GTK=')[1].split(';')[0];
                }
            }
            
            // Test login avec cette configuration
            const loginResponse = await axios.post('https://api.ecoledirecte.com/v3/login.awp?v=4.75.0',
                `data=${JSON.stringify({
                    identifiant: 'c.champagne',
                    motdepasse: 'Corentin02520?',
                    isReLogin: false,
                    uuid: ""
                })}`,
                {
                    ...axiosConfig,
                    headers: {
                        ...axiosConfig.headers,
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Token': gtkValue
                    }
                }
            );
            
            console.log(`   Status: ${loginResponse.status}, Code: ${loginResponse.data.code}`);
            
            if (loginResponse.data.code === 200) {
                console.log(`✅ SUCCÈS avec ${config.name}!`);
                return loginResponse.data;
            }
            
        } catch (error) {
            console.log(`   ❌ Erreur avec ${config.name}: ${error.message}`);
        }
    }
}

async function runBypassTests() {
    console.log('🔓 Tests de bypass de l\'API École Directe\n');
    
    console.log('🎯 Méthodes à tester:');
    console.log('1. 🌐 Web Scraping (Puppeteer)');
    console.log('2. 🔄 Proxy/VPN bypass');
    console.log('3. 🕵️ Interception d\'API calls');
    console.log('');
    
    await testWebScraping();
    await testProxyBypass();
    
    console.log('\n📋 RÉSUMÉ DES OPTIONS DE BYPASS:');
    console.log('');
    console.log('1. 🌐 WEB SCRAPING:');
    console.log('   ✅ Bypass complet des restrictions API');
    console.log('   ✅ Utilise l\'interface web normale');
    console.log('   ❌ Plus lent et fragile');
    console.log('   ❌ Nécessite Puppeteer (lourd)');
    console.log('');
    console.log('2. 🔄 PROXY/VPN:');
    console.log('   ✅ Peut contourner les restrictions IP');
    console.log('   ❌ Nécessite un proxy/VPN configuré');
    console.log('   ❌ Peut ne pas fonctionner si restriction par établissement');
    console.log('');
    console.log('3. 🕵️ REVERSE ENGINEERING:');
    console.log('   ✅ Comprendre le vrai format utilisé par le site');
    console.log('   ✅ Reproduire exactement les requêtes web');
    console.log('   ❌ Plus complexe à maintenir');
    console.log('');
    console.log('💡 RECOMMANDATION:');
    console.log('   • Essayer d\'abord le web scraping pour un prototype');
    console.log('   • Analyser les vrais appels API du site web');
    console.log('   • Contacter l\'établissement reste la meilleure solution');
}

// Vérifier si Puppeteer est installé
async function checkDependencies() {
    try {
        require('puppeteer');
        console.log('✅ Puppeteer disponible');
        return true;
    } catch (error) {
        console.log('❌ Puppeteer non installé');
        console.log('📦 Pour installer: npm install puppeteer');
        console.log('⚠️ Test de web scraping ignoré');
        return false;
    }
}

if (require.main === module) {
    checkDependencies().then(hasP => {
        if (hasP) {
            runBypassTests().catch(console.error);
        } else {
            testProxyBypass().catch(console.error);
        }
    });
}
