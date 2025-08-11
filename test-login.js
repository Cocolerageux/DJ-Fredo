const EcoleDirecteAPI = require('./src/api/ecoledirecte');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function testLogin() {
    console.log('🔍 Test de l\'authentification École Directe...\n');
    
    const api = new EcoleDirecteAPI();
    
    // Demander les identifiants de manière sécurisée
    const username = await askQuestion('📧 Entrez votre identifiant École Directe: ');
    const password = await askQuestion('🔒 Entrez votre mot de passe: ');
    
    console.log('\n📡 Test de l\'authentification École Directe...');
    
    
    try {
        console.log('📡 Tentative de connexion à École Directe...');
        const result = await api.login(username, password);
        
        if (result.success) {
            console.log('\n✅ SUCCÈS ! Connexion réussie');
            console.log('👤 Compte:', result.account.prenom, result.account.nom);
            console.log('🏫 Établissement:', result.account.nomEtablissement);
            console.log('📧 Email:', result.account.email);
            console.log('🎓 Type:', result.account.typeCompte);
            console.log('🔑 Token obtenu:', result.account.token ? 'Oui' : 'Non');
            
            // Test des notes
            console.log('\n📊 Test de récupération des notes...');
            const notesResult = await api.getNotes();
            if (notesResult.success) {
                console.log('✅ Notes récupérées avec succès');
                if (notesResult.data.notes) {
                    console.log('📈 Nombre de matières:', notesResult.data.notes.length);
                } else {
                    console.log('📊 Structure des données:', Object.keys(notesResult.data));
                }
            } else {
                console.log('❌ Erreur notes:', notesResult.message);
            }
            
        } else {
            console.log('\n❌ ÉCHEC de la connexion');
            console.log('💬 Message:', result.message);
            console.log('🔍 Essayez de vous connecter d\'abord sur le site web École Directe pour éviter les vérifications de sécurité.');
        }
        
    } catch (error) {
        console.error('\n💥 Erreur inattendue:', error.message);
        console.error('🔍 Détails:', error.stack);
    } finally {
        rl.close();
    }
}

// Exécuter le test
if (require.main === module) {
    testLogin().catch(console.error);
}
