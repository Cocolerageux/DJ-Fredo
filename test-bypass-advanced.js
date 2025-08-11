const axios = require('axios');

class EcoleDirecteAPIBypass {
    constructor() {
        this.sessionData = null;
        this.cookies = [];
    }

    /**
     * Méthode 1: Reproduire exactement ce que fait le navigateur
     */
    async browserSimulation(username, password) {
        console.log('🔄 Simulation exacte du navigateur...\n');
        
        try {
            // Étape 1: Charger la page principale comme un navigateur
            console.log('📄 Chargement de la page École Directe...');
            const homeResponse = await axios.get('https://www.ecoledirecte.com', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                    'Cache-Control': 'max-age=0'
                },
                timeout: 15000,
                validateStatus: () => true
            });
            
            // Récupérer les cookies de session
            if (homeResponse.headers['set-cookie']) {
                this.cookies = homeResponse.headers['set-cookie'];
                console.log('🍪 Cookies de session récupérés');
            }
            
            // Étape 2: Faire une requête pour récupérer GTK avec le bon Referer
            console.log('🔑 Récupération GTK avec simulation navigateur...');
            const gtkResponse = await axios.get('https://api.ecoledirecte.com/v3/login.awp?gtk=1&v=4.75.0', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Referer': 'https://www.ecoledirecte.com/',
                    'Origin': 'https://www.ecoledirecte.com',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-site',
                    'Cookie': this.cookies.join('; ')
                },
                timeout: 10000,
                validateStatus: () => true
            });
            
            let gtkValue = '';
            if (gtkResponse.headers['set-cookie']) {
                const gtkCookie = gtkResponse.headers['set-cookie'].find(cookie => cookie.includes('GTK='));
                if (gtkCookie) {
                    gtkValue = gtkCookie.split('GTK=')[1].split(';')[0];
                    console.log('✅ GTK récupéré avec simulation');
                }
            }
            
            // Étape 3: Login avec simulation complète du comportement navigateur
            console.log('🔐 Tentative de connexion avec simulation complète...');
            
            // Attendre un peu comme un vrai utilisateur
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const loginResponse = await axios.post('https://api.ecoledirecte.com/v3/login.awp?v=4.75.0',
                `data=${encodeURIComponent(JSON.stringify({
                    identifiant: username,
                    motdepasse: password,
                    isReLogin: false,
                    uuid: ""
                }))}`,
                {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                        'Accept': 'application/json, text/plain, */*',
                        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Referer': 'https://www.ecoledirecte.com/',
                        'Origin': 'https://www.ecoledirecte.com',
                        'DNT': '1',
                        'Connection': 'keep-alive',
                        'Sec-Fetch-Dest': 'empty',
                        'Sec-Fetch-Mode': 'cors',
                        'Sec-Fetch-Site': 'same-site',
                        'X-Token': gtkValue,
                        'Cookie': this.cookies.join('; ')
                    },
                    timeout: 15000,
                    validateStatus: () => true
                }
            );
            
            console.log('📊 Résultat simulation navigateur:');
            console.log(`   Status: ${loginResponse.status}`);
            console.log(`   Code: ${loginResponse.data.code}`);
            console.log(`   Message: ${loginResponse.data.message}`);
            
            return loginResponse.data;
            
        } catch (error) {
            console.error('💥 Erreur simulation navigateur:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Méthode 2: Utiliser des headers Chrome DevTools copiés
     */
    async realBrowserHeaders(username, password) {
        console.log('\n🔍 Test avec headers réels de Chrome DevTools...\n');
        
        // Headers exacts copiés depuis Chrome DevTools (F12 -> Network)
        // Ces headers sont ceux qu'utilise réellement le navigateur
        const realHeaders = {
            'accept': 'application/json, text/plain, */*',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8',
            'content-type': 'application/x-www-form-urlencoded',
            'dnt': '1',
            'origin': 'https://www.ecoledirecte.com',
            'priority': 'u=1, i',
            'referer': 'https://www.ecoledirecte.com/',
            'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        };
        
        try {
            // GTK avec headers réels
            const gtkResponse = await axios.get('https://api.ecoledirecte.com/v3/login.awp?gtk=1&v=4.75.0', {
                headers: realHeaders,
                timeout: 10000,
                validateStatus: () => true
            });
            
            let gtkValue = '';
            if (gtkResponse.headers['set-cookie']) {
                const gtkCookie = gtkResponse.headers['set-cookie'].find(cookie => cookie.includes('GTK='));
                if (gtkCookie) {
                    gtkValue = gtkCookie.split('GTK=')[1].split(';')[0];
                }
            }
            
            // Login avec headers réels
            const loginResponse = await axios.post('https://api.ecoledirecte.com/v3/login.awp?v=4.75.0',
                `data=${JSON.stringify({
                    identifiant: username,
                    motdepasse: password,
                    isReLogin: false,
                    uuid: ""
                })}`,
                {
                    headers: {
                        ...realHeaders,
                        'x-token': gtkValue
                    },
                    timeout: 15000,
                    validateStatus: () => true
                }
            );
            
            console.log('📊 Résultat headers réels:');
            console.log(`   Status: ${loginResponse.status}`);
            console.log(`   Code: ${loginResponse.data.code}`);
            console.log(`   Message: ${loginResponse.data.message}`);
            
            return loginResponse.data;
            
        } catch (error) {
            console.error('💥 Erreur headers réels:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Méthode 3: Bypass via différentes versions d'API et endpoints
     */
    async apiVersionBypass(username, password) {
        console.log('\n🔀 Test bypass via versions alternatives...\n');
        
        const alternatives = [
            // Différents endpoints
            { url: 'https://api.ecoledirecte.com/v3/connexion/login.awp', version: '4.75.0', name: 'Endpoint connexion' },
            { url: 'https://api.ecoledirecte.com/v2/login.awp', version: '3.0.0', name: 'API v2' },
            { url: 'https://api.ecoledirecte.com/login.awp', version: '', name: 'Sans version' },
            // Différents paramètres
            { url: 'https://api.ecoledirecte.com/v3/login.awp', version: '4.75.0', params: '?mobile=1', name: 'Mode mobile' },
            { url: 'https://api.ecoledirecte.com/v3/login.awp', version: '4.75.0', params: '?app=1', name: 'Mode app' }
        ];
        
        for (const alt of alternatives) {
            console.log(`🔄 Test ${alt.name}...`);
            
            try {
                const fullUrl = `${alt.url}${alt.params || ''}${alt.version ? `${alt.params ? '&' : '?'}v=${alt.version}` : ''}`;
                
                const response = await axios.post(fullUrl,
                    `data=${JSON.stringify({
                        identifiant: username,
                        motdepasse: password,
                        isReLogin: false,
                        uuid: ""
                    })}`,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        },
                        timeout: 10000,
                        validateStatus: () => true
                    }
                );
                
                console.log(`   Status: ${response.status}, Code: ${response.data?.code || 'N/A'}`);
                
                if (response.data?.code === 200) {
                    console.log(`✅ SUCCÈS avec ${alt.name}!`);
                    return response.data;
                }
                
            } catch (error) {
                console.log(`   ❌ Erreur: ${error.message}`);
            }
        }
        
        return { success: false, message: 'Tous les endpoints alternatifs ont échoué' };
    }
}

async function testAllBypassMethods() {
    console.log('🔓 TEST COMPLET DE BYPASS DE L\'API ÉCOLE DIRECTE\n');
    console.log('='.repeat(60));
    
    const bypass = new EcoleDirecteAPIBypass();
    const username = 'c.champagne';
    const password = 'Corentin02520?';
    
    // Test 1: Simulation navigateur complète
    console.log('\n1️⃣ MÉTHODE 1: SIMULATION NAVIGATEUR COMPLÈTE');
    console.log('-'.repeat(50));
    const result1 = await bypass.browserSimulation(username, password);
    
    // Test 2: Headers réels de Chrome
    console.log('\n2️⃣ MÉTHODE 2: HEADERS CHROME DEVTOOLS');
    console.log('-'.repeat(50));
    const result2 = await bypass.realBrowserHeaders(username, password);
    
    // Test 3: Versions alternatives d'API
    console.log('\n3️⃣ MÉTHODE 3: ENDPOINTS ALTERNATIFS');
    console.log('-'.repeat(50));
    const result3 = await bypass.apiVersionBypass(username, password);
    
    // Résumé
    console.log('\n📋 RÉSUMÉ DES TENTATIVES DE BYPASS:');
    console.log('='.repeat(60));
    console.log(`1. Simulation navigateur: ${result1.code === 200 ? '✅ SUCCÈS' : '❌ ÉCHEC'} (Code: ${result1.code})`);
    console.log(`2. Headers Chrome: ${result2.code === 200 ? '✅ SUCCÈS' : '❌ ÉCHEC'} (Code: ${result2.code})`);
    console.log(`3. Endpoints alternatifs: ${result3.code === 200 ? '✅ SUCCÈS' : '❌ ÉCHEC'} (Code: ${result3.code || 'N/A'})`);
    
    if (result1.code !== 200 && result2.code !== 200 && result3.code !== 200) {
        console.log('\n❌ TOUS LES BYPASS ONT ÉCHOUÉ');
        console.log('\n💡 SOLUTIONS RESTANTES:');
        console.log('   • 🌐 Web Scraping (Puppeteer)');
        console.log('   • 🔄 Proxy/VPN depuis une autre IP');
        console.log('   • 📞 Contact direct avec l\'établissement');
        console.log('   • 🕵️ Analyse plus poussée du trafic réseau');
    }
}

if (require.main === module) {
    testAllBypassMethods().catch(console.error);
}
