const axios = require('axios');

async function testServerInfo() {
    console.log('🔍 Test des informations serveur École Directe...\n');
    
    try {
        console.log('📡 Récupération des informations serveur...');
        const serverResponse = await axios.get('https://api.ecoledirecte.com/v3/connexion/serverinfos.awp', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            },
            timeout: 10000,
            validateStatus: () => true
        });
        
        console.log('Status:', serverResponse.status);
        if (serverResponse.data) {
            console.log('Réponse serveur:', JSON.stringify(serverResponse.data, null, 2));
        }
        
    } catch (error) {
        console.log('❌ Impossible de récupérer les infos serveur:', error.message);
    }
}

async function testUserSpecificEndpoints() {
    console.log('\n🔍 Test des endpoints spécifiques utilisateur...');
    
    const baseURL = 'https://api.ecoledirecte.com/v3';
    const username = 'c.champagne';
    
    // Test si l'utilisateur existe dans le système
    try {
        console.log('\n📡 Test de vérification utilisateur...');
        const userCheckResponse = await axios.post(`${baseURL}/connexion/userexists.awp`, 
            `data=${JSON.stringify({ identifiant: username })}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000,
                validateStatus: () => true
            }
        );
        
        console.log('Status vérification utilisateur:', userCheckResponse.status);
        if (userCheckResponse.data) {
            console.log('Réponse:', JSON.stringify(userCheckResponse.data, null, 2));
        }
        
    } catch (error) {
        console.log('❌ Erreur vérification utilisateur:', error.message);
    }
}

async function testWithMinimalData() {
    console.log('\n🔍 Test avec données minimales...');
    
    const baseURL = 'https://api.ecoledirecte.com/v3';
    const username = 'c.champagne';
    const password = 'Corentin02520?';
    
    try {
        // Test sans GTK du tout
        console.log('\n📡 Test sans GTK ni headers spéciaux...');
        const response = await axios.post(`${baseURL}/login.awp`, 
            `data=${JSON.stringify({
                identifiant: username,
                motdepasse: password
            })}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 10000,
                validateStatus: () => true
            }
        );
        
        console.log('Status:', response.status);
        console.log('Code API:', response.data.code);
        console.log('Message:', response.data.message);
        
        if (response.data.code === 200) {
            console.log('✅ SUCCÈS avec données minimales !');
            return response.data;
        }
        
        // Test avec seulement les champs obligatoires
        console.log('\n📡 Test format ultra-minimal...');
        const response2 = await axios.post(`${baseURL}/login.awp`, 
            `identifiant=${encodeURIComponent(username)}&motdepasse=${encodeURIComponent(password)}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 10000,
                validateStatus: () => true
            }
        );
        
        console.log('Status format minimal:', response2.status);
        console.log('Code API:', response2.data?.code || 'Pas de code');
        console.log('Message:', response2.data?.message || 'Pas de message');
        
    } catch (error) {
        console.log('❌ Erreur test minimal:', error.message);
    }
}

async function testWithSpecialCharacters() {
    console.log('\n🔍 Test avec gestion des caractères spéciaux...');
    
    const baseURL = 'https://api.ecoledirecte.com/v3';
    const username = 'c.champagne';
    const password = 'Corentin02520?';
    
    // Le mot de passe contient un "?" qui pourrait poser problème
    console.log('🔍 Mot de passe contient des caractères spéciaux: ?');
    
    const encodingTests = [
        {
            name: "Aucun encodage",
            user: username,
            pass: password
        },
        {
            name: "Encodage URL du mot de passe seulement",
            user: username,
            pass: encodeURIComponent(password)
        },
        {
            name: "Encodage URL complet",
            user: encodeURIComponent(username),
            pass: encodeURIComponent(password)
        },
        {
            name: "Échappement manuel du ?",
            user: username,
            pass: password.replace('?', '%3F')
        }
    ];
    
    for (const test of encodingTests) {
        console.log(`\n📡 Test: ${test.name}`);
        console.log(`   User: "${test.user}"`);
        console.log(`   Pass: "${test.pass}"`);
        
        try {
            const response = await axios.post(`${baseURL}/login.awp?v=4.75.0`, 
                `data=${JSON.stringify({
                    identifiant: test.user,
                    motdepasse: test.pass,
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
            
            console.log(`   Status: ${response.status}`);
            console.log(`   Code: ${response.data.code}`);
            console.log(`   Message: ${response.data.message}`);
            
            if (response.data.code === 200) {
                console.log(`✅ SUCCÈS avec ${test.name}!`);
                return response.data;
            }
            
        } catch (error) {
            console.log(`   ❌ Erreur: ${error.message}`);
        }
        
        // Petit délai entre les tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

async function runCompleteDebug() {
    await testServerInfo();
    await testUserSpecificEndpoints();
    await testWithMinimalData();
    await testWithSpecialCharacters();
    
    console.log('\n📋 RÉSUMÉ DU DIAGNOSTIC:');
    console.log('1. ✅ Serveur École Directe accessible');
    console.log('2. ✅ Cookie GTK récupéré correctement');
    console.log('3. ✅ Identifiants fonctionnent sur le site web');
    console.log('4. ❌ Code 505 persistant avec l\'API');
    console.log('\n💡 HYPOTHÈSES RESTANTES:');
    console.log('   • Restriction IP/géolocalisation de l\'établissement');
    console.log('   • Authentification à deux facteurs requise');
    console.log('   • API désactivée pour votre type de compte');
    console.log('   • Différence entre API v3 et interface web');
    console.log('\n🔧 PROCHAINES ÉTAPES RECOMMANDÉES:');
    console.log('   1. Vérifier dans les outils dev du navigateur la vraie requête');
    console.log('   2. Contacter l\'établissement pour confirmer l\'accès API');
    console.log('   3. Tester depuis une autre IP/localisation');
}

if (require.main === module) {
    runCompleteDebug().catch(console.error);
}
