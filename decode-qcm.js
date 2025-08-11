// Décodage de la question QCM interceptée
const question = 'UXVlbGxlIGVzdCB2b3RyZSBhbm7DqWUgZGUgbmFpc3NhbmNlID8=';
const propositions = [
    'MjAxMQ==', 'MTk5OQ==',
    'MjAwOA==', 'MjAxMA==',
    'MjAwMQ==', 'MjAwOQ==',
    'MjAwNA==', 'MjAwMw==',
    'MjAxMg==', 'MjAwNg==',
    'MjAwMg==', 'MjAwMA==',
    'MTk5OA==', 'MjAwNw==',
    'MjAwNQ=='
];

console.log('🔍 DÉCODAGE DU QCM ÉCOLE DIRECTE\n');

console.log('❓ Question:', Buffer.from(question, 'base64').toString('utf-8'));
console.log('\n📋 Propositions:');

propositions.forEach((prop, index) => {
    const decoded = Buffer.from(prop, 'base64').toString('utf-8');
    console.log(`   ${index + 1}. ${decoded}`);
});

console.log('\n💡 Le système demande votre année de naissance pour vérifier votre identité.');
console.log('🔑 Ceci explique pourquoi l\'API échouait - il faut d\'abord passer ce QCM !');

// Maintenant créons un bypass complet avec gestion du QCM
console.log('\n🚀 Création d\'un bypass complet...');

const axios = require('axios');

async function bypassWithQCM() {
    const baseURL = 'https://api.ecoledirecte.com/v3';
    const username = 'c.champagne';
    const password = 'Corentin02520?';
    
    try {
        console.log('\n📋 ÉTAPE 1: Authentification initiale...');
        
        // GTK
        const gtkResponse = await axios.get(`${baseURL}/login.awp?gtk=1&v=4.81.0`);
        const gtkCookie = gtkResponse.headers['set-cookie']?.find(cookie => cookie.includes('GTK='));
        const gtkValue = gtkCookie ? gtkCookie.split('GTK=')[1].split(';')[0] : '';
        
        // Login initial
        const loginResponse = await axios.post(`${baseURL}/login.awp?v=4.81.0`, 
            `data=${JSON.stringify({
                identifiant: username,
                motdepasse: password,
                isReLogin: false,
                uuid: "",
                fa: []
            })}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Gtk': gtkValue,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Origin': 'https://www.ecoledirecte.com',
                    'Referer': 'https://www.ecoledirecte.com/'
                }
            }
        );
        
        console.log('✅ Login initial - Code:', loginResponse.data.code);
        
        if (loginResponse.data.code === 250) {
            console.log('🔐 QCM requis détecté');
            const token = loginResponse.data.token;
            
            // Récupérer le QCM
            console.log('\n📋 ÉTAPE 2: Récupération du QCM...');
            const qcmResponse = await axios.post(`${baseURL}/connexion/doubleauth.awp?verbe=get&v=4.81.0`, 
                `data={}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Token': token,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Origin': 'https://www.ecoledirecte.com',
                        'Referer': 'https://www.ecoledirecte.com/'
                    }
                }
            );
            
            if (qcmResponse.data.code === 200) {
                const questionB64 = qcmResponse.data.data.question;
                const propositionsB64 = qcmResponse.data.data.propositions;
                
                const questionText = Buffer.from(questionB64, 'base64').toString('utf-8');
                console.log('❓ Question QCM:', questionText);
                
                // Pour l'année de naissance, demandons à l'utilisateur
                console.log('\n🔍 Propositions disponibles:');
                propositionsB64.forEach((prop, index) => {
                    const decoded = Buffer.from(prop, 'base64').toString('utf-8');
                    console.log(`   ${index + 1}. ${decoded}`);
                });
                
                console.log('\n⚠️ POUR CONTINUER LE BYPASS:');
                console.log('1. Choisissez votre année de naissance dans la liste');
                console.log('2. Modifiez le code pour inclure votre réponse');
                console.log('3. Le bypass sera alors complet');
                
                return {
                    success: false,
                    needsQCM: true,
                    token: token,
                    question: questionText,
                    options: propositionsB64.map(p => Buffer.from(p, 'base64').toString('utf-8'))
                };
            }
        }
        
    } catch (error) {
        console.error('❌ Erreur bypass:', error.message);
    }
}

if (require.main === module) {
    bypassWithQCM();
}
