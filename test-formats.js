const EcoleDirecteAPI = require('./src/api/ecoledirecte');

async function testLoginFormats() {
    console.log('🔍 Test des différents formats d\'identifiants École Directe...\n');
    
    const api = new EcoleDirecteAPI();
    
    // Remplacez par vos vrais identifiants
    const baseUsername = 'c.champagne'; // Votre identifiant de base
    const password = 'Corentin02520?'; // Votre mot de passe
    
    // Différents formats à tester
    const formats = [
        baseUsername,                           // Format original
        baseUsername.toLowerCase(),             // En minuscules
        baseUsername.toUpperCase(),             // En majuscules
        'C.CHAMPAGNE',                         // Format majuscule complet
        'c.champagne@',                        // Avec @
        'champagne.c',                         // Inversé
    ];
    
    console.log('📧 Formats d\'identifiants à tester:');
    formats.forEach((format, index) => {
        console.log(`${index + 1}. ${format}`);
    });
    console.log();
    
    for (let i = 0; i < formats.length; i++) {
        const username = formats[i];
        console.log(`\n🔄 Test ${i + 1}/${formats.length}: "${username}"`);
        
        try {
            const result = await api.login(username, password);
            
            if (result.success) {
                console.log('✅ SUCCÈS ! Format d\'identifiant valide:', username);
                console.log('👤 Compte:', result.account.prenom, result.account.nom);
                console.log('🏫 Établissement:', result.account.nomEtablissement);
                break; // Arrêter dès qu'on trouve le bon format
            } else {
                console.log('❌ Échec:', result.message);
            }
            
        } catch (error) {
            console.error('💥 Erreur:', error.message);
        }
        
        // Attendre un peu entre les tentatives pour éviter le rate limiting
        if (i < formats.length - 1) {
            console.log('⏳ Attente 2 secondes...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    console.log('\n🏁 Test terminé.');
}

// Fonction pour tester la connectivité
async function testConnectivity() {
    console.log('🌐 Test de connectivité à École Directe...\n');
    
    const axios = require('axios');
    
    try {
        console.log('📡 Test de l\'URL de base...');
        const response = await axios.get('https://api.ecoledirecte.com/v3/login.awp?gtk=1&v=4.75.0', {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        console.log('✅ Serveur accessible, code:', response.status);
        console.log('🍪 Cookies reçus:', response.headers['set-cookie'] ? 'Oui' : 'Non');
        
    } catch (error) {
        console.error('❌ Erreur de connectivité:', error.message);
    }
}

// Exécuter les tests
async function runTests() {
    await testConnectivity();
    console.log('\n' + '='.repeat(50) + '\n');
    await testLoginFormats();
}

if (require.main === module) {
    runTests().catch(console.error);
}
