const axios = require('axios');

class EcoleDirecteBypass {
    constructor() {
        this.baseURL = 'https://api.ecoledirecte.com/v3';
        this.token = null;
        this.userAccount = null;
    }

    async loginWithQCM(username, password, birthYear) {
        try {
            console.log('🔓 BYPASS COMPLET ÉCOLE DIRECTE');
            console.log('================================\n');
            
            // ÉTAPE 1: Récupération GTK
            console.log('📋 ÉTAPE 1: Récupération du cookie GTK...');
            const gtkResponse = await axios.get(`${this.baseURL}/login.awp?gtk=1&v=4.81.0`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            const gtkCookie = gtkResponse.headers['set-cookie']?.find(cookie => cookie.includes('GTK='));
            const gtkValue = gtkCookie ? gtkCookie.split('GTK=')[1].split(';')[0] : '';
            console.log('✅ GTK récupéré');
            
            // ÉTAPE 2: Login initial (déclenche le QCM)
            console.log('\n📋 ÉTAPE 2: Connexion initiale...');
            const loginResponse = await axios.post(`${this.baseURL}/login.awp?v=4.81.0`, 
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
                        'Referer': 'https://www.ecoledirecte.com/',
                        'Accept': 'application/json, text/plain, */*'
                    }
                }
            );
            
            console.log('📊 Code de réponse:', loginResponse.data.code);
            
            if (loginResponse.data.code === 250) {
                console.log('🔐 QCM de sécurité détecté');
                const tempToken = loginResponse.data.token;
                
                // ÉTAPE 3: Récupération du QCM
                console.log('\n📋 ÉTAPE 3: Récupération du QCM...');
                const qcmResponse = await axios.post(`${this.baseURL}/connexion/doubleauth.awp?verbe=get&v=4.81.0`, 
                    `data={}`,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'X-Token': tempToken,
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Origin': 'https://www.ecoledirecte.com',
                            'Referer': 'https://www.ecoledirecte.com/',
                            'Accept': 'application/json, text/plain, */*'
                        }
                    }
                );
                
                if (qcmResponse.data.code === 200) {
                    const questionB64 = qcmResponse.data.data.question;
                    const propositionsB64 = qcmResponse.data.data.propositions;
                    
                    const questionText = Buffer.from(questionB64, 'base64').toString('utf-8');
                    console.log('❓ Question:', questionText);
                    
                    // Chercher la bonne réponse
                    const yearBase64 = Buffer.from(birthYear.toString()).toString('base64');
                    const foundOption = propositionsB64.find(prop => prop === yearBase64);
                    
                    if (!foundOption) {
                        console.log('❌ Année de naissance non trouvée dans les options');
                        console.log('Options disponibles:', propositionsB64.map(p => Buffer.from(p, 'base64').toString()));
                        return { success: false, error: 'Année non disponible' };
                    }
                    
                    console.log('✅ Réponse trouvée:', birthYear);
                    
                    // ÉTAPE 4: Envoi de la réponse QCM
                    console.log('\n📋 ÉTAPE 4: Envoi de la réponse QCM...');
                    const qcmAnswerResponse = await axios.post(`${this.baseURL}/connexion/doubleauth.awp?v=4.81.0`, 
                        `data=${JSON.stringify({ choix: yearBase64 })}`,
                        {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'X-Token': tempToken,
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                'Origin': 'https://www.ecoledirecte.com',
                                'Referer': 'https://www.ecoledirecte.com/',
                                'Accept': 'application/json, text/plain, */*'
                            }
                        }
                    );
                    
                    console.log('📊 Réponse QCM - Code:', qcmAnswerResponse.data.code);
                    
                    if (qcmAnswerResponse.data.code === 200) {
                        const cnValue = qcmAnswerResponse.data.data.cn;
                        const cvValue = qcmAnswerResponse.data.data.cv;
                        console.log('✅ Certificats de sécurité obtenus');
                        
                        // ÉTAPE 5: Login final avec certificats
                        console.log('\n📋 ÉTAPE 5: Connexion finale avec certificats...');
                        const finalLoginResponse = await axios.post(`${this.baseURL}/login.awp?v=4.81.0`, 
                            `data=${JSON.stringify({
                                identifiant: username,
                                motdepasse: password,
                                isReLogin: false,
                                uuid: "",
                                fa: [{ cn: cnValue, cv: cvValue }]
                            })}`,
                            {
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'X-Gtk': gtkValue,
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                    'Origin': 'https://www.ecoledirecte.com',
                                    'Referer': 'https://www.ecoledirecte.com/',
                                    'Accept': 'application/json, text/plain, */*'
                                }
                            }
                        );
                        
                        console.log('📊 Login final - Code:', finalLoginResponse.data.code);
                        
                        if (finalLoginResponse.data.code === 200) {
                            this.token = finalLoginResponse.data.token;
                            this.userAccount = finalLoginResponse.data.data.accounts[0];
                            
                            console.log('\n🎉 BYPASS RÉUSSI !');
                            console.log('👤 Utilisateur:', this.userAccount.prenom, this.userAccount.nom);
                            console.log('🏫 Établissement:', this.userAccount.nomEtablissement);
                            console.log('🔑 Token:', this.token.substring(0, 20) + '...');
                            
                            return {
                                success: true,
                                account: this.userAccount,
                                token: this.token
                            };
                        } else {
                            console.log('❌ Échec login final:', finalLoginResponse.data.message);
                            return { success: false, error: finalLoginResponse.data.message };
                        }
                    } else {
                        console.log('❌ Échec réponse QCM:', qcmAnswerResponse.data.message);
                        return { success: false, error: qcmAnswerResponse.data.message };
                    }
                } else {
                    console.log('❌ Échec récupération QCM:', qcmResponse.data.message);
                    return { success: false, error: qcmResponse.data.message };
                }
            } else if (loginResponse.data.code === 200) {
                // Connexion directe sans QCM
                console.log('✅ Connexion directe réussie (pas de QCM)');
                this.token = loginResponse.data.token;
                this.userAccount = loginResponse.data.data.accounts[0];
                return {
                    success: true,
                    account: this.userAccount,
                    token: this.token
                };
            } else {
                console.log('❌ Échec login initial:', loginResponse.data.message);
                return { success: false, error: loginResponse.data.message };
            }
            
        } catch (error) {
            console.error('💥 Erreur bypass:', error.message);
            return { success: false, error: error.message };
        }
    }
    
    async getNotes() {
        if (!this.token || !this.userAccount) {
            throw new Error('Non connecté');
        }
        
        try {
            const response = await axios.post(`${this.baseURL}/eleves/${this.userAccount.id}/notes.awp?verbe=get&v=4.81.0`, 
                `data={"anneeScolaire":""}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Token': this.token,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                }
            );
            
            return {
                success: response.data.code === 200,
                data: response.data.data
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Test du bypass complet
async function testCompleteBypass() {
    const bypass = new EcoleDirecteBypass();
    
    // IMPORTANT: Remplacez 2005 par votre vraie année de naissance
    const birthYear = 2008; // ✅ Année de naissance de l'utilisateur
    
    const result = await bypass.loginWithQCM('c.champagne', 'Corentin02520?', birthYear);
    
    if (result.success) {
        console.log('\n🎯 Test de récupération des notes...');
        const notesResult = await bypass.getNotes();
        
        if (notesResult.success) {
            console.log('✅ Notes récupérées avec succès !');
            console.log('📊 Données disponibles:', Object.keys(notesResult.data));
        } else {
            console.log('❌ Échec récupération notes:', notesResult.error);
        }
    }
}

if (require.main === module) {
    testCompleteBypass();
}

module.exports = EcoleDirecteBypass;
