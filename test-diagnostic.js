const axios = require('axios');

async function testManualAuthentication() {
    console.log('🔍 Test d\'authentification manuel École Directe...\n');
    
    const baseURL = 'https://api.ecoledirecte.com/v3';
    const username = 'c.champagne';
    const password = 'Corentin02520?';
    
    try {
        console.log('📋 ÉTAPE 1: Test de connectivité de base');
        const healthResponse = await axios.get(`${baseURL}/login.awp`, {
            timeout: 10000,
            validateStatus: () => true
        });
        console.log('✅ Serveur principal accessible, status:', healthResponse.status);
        
        console.log('\n📋 ÉTAPE 2: Récupération du cookie GTK');
        const gtkResponse = await axios.get(`${baseURL}/login.awp?gtk=1&v=4.75.0`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            },
            timeout: 10000,
            validateStatus: () => true
        });
        
        console.log('Status GTK:', gtkResponse.status);
        console.log('Headers reçus:', Object.keys(gtkResponse.headers));
        
        let gtkValue = '';
        if (gtkResponse.headers['set-cookie']) {
            console.log('Cookies reçus:', gtkResponse.headers['set-cookie']);
            const gtkCookie = gtkResponse.headers['set-cookie'].find(cookie => cookie.includes('GTK='));
            if (gtkCookie) {
                gtkValue = gtkCookie.split('GTK=')[1].split(';')[0];
                console.log('✅ GTK extrait:', gtkValue.substring(0, 20) + '...');
            } else {
                console.log('❌ Aucun cookie GTK trouvé');
            }
        } else {
            console.log('❌ Aucun cookie reçu');
        }
        
        console.log('\n📋 ÉTAPE 3: Test de différentes approches d\'authentification');
        
        // Approche 1: Format exact de la documentation
        console.log('\n🔄 Approche 1: Format documentation officielle');
        const loginData1 = {
            identifiant: username,
            motdepasse: password,
            isReLogin: false,
            uuid: ""
        };
        
        try {
            const response1 = await axios.post(`${baseURL}/login.awp?v=4.75.0`, 
                `data=${encodeURIComponent(JSON.stringify(loginData1))}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Token': gtkValue,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
                    },
                    timeout: 15000,
                    validateStatus: () => true
                }
            );
            
            console.log('Status:', response1.status);
            console.log('Code API:', response1.data.code);
            console.log('Message:', response1.data.message);
            console.log('Data keys:', Object.keys(response1.data));
            
            if (response1.data.code === 200) {
                console.log('✅ SUCCÈS avec approche 1!');
                return;
            }
            
        } catch (error) {
            console.log('❌ Erreur approche 1:', error.message);
        }
        
        // Approche 2: Sans GTK
        console.log('\n🔄 Approche 2: Sans GTK');
        try {
            const response2 = await axios.post(`${baseURL}/login.awp?v=4.75.0`, 
                `data=${JSON.stringify(loginData1)}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
                    },
                    timeout: 15000,
                    validateStatus: () => true
                }
            );
            
            console.log('Status:', response2.status);
            console.log('Code API:', response2.data.code);
            console.log('Message:', response2.data.message);
            
            if (response2.data.code === 200) {
                console.log('✅ SUCCÈS avec approche 2!');
                return;
            }
            
        } catch (error) {
            console.log('❌ Erreur approche 2:', error.message);
        }
        
        // Approche 3: Format form-data direct
        console.log('\n🔄 Approche 3: Form-data direct');
        try {
            const response3 = await axios.post(`${baseURL}/login.awp?v=4.75.0`, 
                `data={"identifiant":"${username}","motdepasse":"${password}","isReLogin":false,"uuid":""}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Token': gtkValue,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
                    },
                    timeout: 15000,
                    validateStatus: () => true
                }
            );
            
            console.log('Status:', response3.status);
            console.log('Code API:', response3.data.code);
            console.log('Message:', response3.data.message);
            
            if (response3.data.code === 200) {
                console.log('✅ SUCCÈS avec approche 3!');
                return;
            }
            
        } catch (error) {
            console.log('❌ Erreur approche 3:', error.message);
        }
        
        console.log('\n📋 ÉTAPE 4: Informations de diagnostic');
        console.log('🎯 Tous les tests ont échoué avec le code 505.');
        console.log('💡 Suggestions:');
        console.log('   1. Vérifiez que les identifiants sont corrects sur le site web');
        console.log('   2. Connectez-vous d\'abord sur https://www.ecoledirecte.com');
        console.log('   3. Vérifiez si votre compte nécessite une authentification à deux facteurs');
        console.log('   4. L\'établissement pourrait avoir des restrictions API');
        
    } catch (error) {
        console.error('💥 Erreur générale:', error.message);
    }
}

async function testWebsiteLogin() {
    console.log('\n🌐 Test de l\'URL du site web École Directe...');
    
    try {
        const webResponse = await axios.get('https://www.ecoledirecte.com', {
            timeout: 10000,
            validateStatus: () => true
        });
        console.log('✅ Site web accessible, status:', webResponse.status);
        console.log('🔗 Veuillez tester vos identifiants sur: https://www.ecoledirecte.com');
        
    } catch (error) {
        console.log('❌ Site web inaccessible:', error.message);
    }
}

async function runFullDiagnostic() {
    await testManualAuthentication();
    await testWebsiteLogin();
}

if (require.main === module) {
    runFullDiagnostic().catch(console.error);
}
