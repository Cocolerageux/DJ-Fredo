const axios = require('axios');

async function testWithWebsiteFormat() {
    console.log('🌐 Test avec le format exact du site web École Directe...\n');
    
    const baseURL = 'https://api.ecoledirecte.com/v3';
    const username = 'c.champagne';
    const password = 'Corentin02520?';
    
    try {
        console.log('📋 ÉTAPE 1: Simulation exacte de la requête web');
        
        // D'abord, récupérer les cookies comme le site web
        console.log('🍪 Récupération des cookies de session...');
        const sessionResponse = await axios.get('https://www.ecoledirecte.com', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
                'Cache-Control': 'no-cache'
            },
            timeout: 10000,
            validateStatus: () => true
        });
        
        console.log('✅ Site web accessible');
        
        // Récupérer le GTK avec les mêmes headers que le navigateur
        console.log('🔑 Récupération GTK avec headers navigateur...');
        const gtkResponse = await axios.get(`${baseURL}/login.awp?gtk=1&v=4.75.0`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
                'Referer': 'https://www.ecoledirecte.com/',
                'Origin': 'https://www.ecoledirecte.com',
                'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-site'
            },
            timeout: 10000,
            validateStatus: () => true
        });
        
        let gtkValue = '';
        if (gtkResponse.headers['set-cookie']) {
            const gtkCookie = gtkResponse.headers['set-cookie'].find(cookie => cookie.includes('GTK='));
            if (gtkCookie) {
                gtkValue = gtkCookie.split('GTK=')[1].split(';')[0];
                console.log('✅ GTK récupéré');
            }
        }
        
        // Test avec plusieurs variations d'encodage
        const loginAttempts = [
            {
                name: "Format JSON standard",
                data: `data=${JSON.stringify({
                    identifiant: username,
                    motdepasse: password,
                    isReLogin: false,
                    uuid: ""
                })}`
            },
            {
                name: "Format URL-encoded",
                data: `data=${encodeURIComponent(JSON.stringify({
                    identifiant: username,
                    motdepasse: password,
                    isReLogin: false,
                    uuid: ""
                }))}`
            },
            {
                name: "Format avec isRelogin (typo courante)",
                data: `data=${JSON.stringify({
                    identifiant: username,
                    motdepasse: password,
                    isRelogin: false,
                    uuid: ""
                })}`
            },
            {
                name: "Format sans uuid",
                data: `data=${JSON.stringify({
                    identifiant: username,
                    motdepasse: password,
                    isReLogin: false
                })}`
            },
            {
                name: "Format avec uuid v4",
                data: `data=${JSON.stringify({
                    identifiant: username,
                    motdepasse: password,
                    isReLogin: false,
                    uuid: "12345678-1234-1234-1234-123456789012"
                })}`
            }
        ];
        
        for (let i = 0; i < loginAttempts.length; i++) {
            const attempt = loginAttempts[i];
            console.log(`\n🔄 Test ${i + 1}/${loginAttempts.length}: ${attempt.name}`);
            
            try {
                const response = await axios.post(`${baseURL}/login.awp?v=4.75.0`, 
                    attempt.data,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'X-Token': gtkValue,
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                            'Accept': 'application/json, text/plain, */*',
                            'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
                            'Referer': 'https://www.ecoledirecte.com/',
                            'Origin': 'https://www.ecoledirecte.com',
                            'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                            'Sec-Ch-Ua-Mobile': '?0',
                            'Sec-Ch-Ua-Platform': '"Windows"',
                            'Sec-Fetch-Dest': 'empty',
                            'Sec-Fetch-Mode': 'cors',
                            'Sec-Fetch-Site': 'same-site'
                        },
                        timeout: 15000,
                        validateStatus: () => true
                    }
                );
                
                console.log(`   Status: ${response.status}`);
                console.log(`   Code API: ${response.data.code}`);
                console.log(`   Message: ${response.data.message}`);
                
                if (response.data.code === 200) {
                    console.log(`\n✅ SUCCÈS ! Format qui fonctionne: ${attempt.name}`);
                    console.log('👤 Utilisateur:', response.data.data.accounts[0].prenom, response.data.data.accounts[0].nom);
                    console.log('🏫 Établissement:', response.data.data.accounts[0].nomEtablissement);
                    console.log('🔑 Token reçu:', response.data.token ? 'Oui' : 'Non');
                    return response.data;
                }
                
                // Attendre entre les tentatives
                if (i < loginAttempts.length - 1) {
                    console.log('   ⏳ Attente 1 seconde...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
            } catch (error) {
                console.log(`   ❌ Erreur: ${error.message}`);
            }
        }
        
        console.log('\n❌ Tous les formats ont échoué');
        console.log('🔍 Cela pourrait indiquer:');
        console.log('   1. Une restriction IP côté établissement');
        console.log('   2. Un mécanisme de sécurité anti-bot');
        console.log('   3. Une différence dans l\'implémentation de l\'API');
        
    } catch (error) {
        console.error('💥 Erreur générale:', error.message);
    }
}

async function testWithDifferentVersions() {
    console.log('\n🔄 Test avec différentes versions de l\'API...');
    
    const versions = ['4.75.0', '4.70.0', '4.60.0', '4.50.0'];
    const baseURL = 'https://api.ecoledirecte.com/v3';
    const username = 'c.champagne';
    const password = 'Corentin02520?';
    
    for (const version of versions) {
        console.log(`\n📡 Test avec version ${version}`);
        
        try {
            // GTK pour cette version
            const gtkResponse = await axios.get(`${baseURL}/login.awp?gtk=1&v=${version}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 5000,
                validateStatus: () => true
            });
            
            let gtkValue = '';
            if (gtkResponse.headers['set-cookie']) {
                const gtkCookie = gtkResponse.headers['set-cookie'].find(cookie => cookie.includes('GTK='));
                if (gtkCookie) {
                    gtkValue = gtkCookie.split('GTK=')[1].split(';')[0];
                }
            }
            
            const response = await axios.post(`${baseURL}/login.awp?v=${version}`, 
                `data=${JSON.stringify({
                    identifiant: username,
                    motdepasse: password,
                    isReLogin: false,
                    uuid: ""
                })}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Token': gtkValue,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    timeout: 10000,
                    validateStatus: () => true
                }
            );
            
            console.log(`   Code: ${response.data.code} - ${response.data.message}`);
            
            if (response.data.code === 200) {
                console.log(`✅ SUCCÈS avec version ${version}!`);
                return;
            }
            
        } catch (error) {
            console.log(`   ❌ Erreur avec version ${version}: ${error.message}`);
        }
    }
}

async function runAdvancedTests() {
    await testWithWebsiteFormat();
    await testWithDifferentVersions();
}

if (require.main === module) {
    runAdvancedTests().catch(console.error);
}
