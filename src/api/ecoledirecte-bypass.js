const axios = require('axios');

class EcoleDirecteAPI {
    constructor() {
        this.baseURL = 'https://api.ecoledirecte.com/v3';
        this.token = null;
        this.account = null;
    }

    async login(username, password) {
        try {
            console.log('🔓 Tentative de connexion École Directe...');
            
            // ÉTAPE 1: Récupération GTK
            const gtkResponse = await axios.get(`${this.baseURL}/login.awp?gtk=1&v=4.81.0`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            const gtkCookie = gtkResponse.headers['set-cookie']?.find(cookie => cookie.includes('GTK='));
            const gtkValue = gtkCookie ? gtkCookie.split('GTK=')[1].split(';')[0] : '';
            
            // ÉTAPE 2: Login initial
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
                // QCM requis
                console.log('🔐 QCM de sécurité détecté - récupération...');
                const tempToken = loginResponse.data.token;
                
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
                    return {
                        success: false,
                        qcmRequired: true,
                        qcmData: {
                            tempToken: tempToken,
                            gtkValue: gtkValue,
                            question: qcmResponse.data.data.question,
                            propositions: qcmResponse.data.data.propositions
                        }
                    };
                } else {
                    throw new Error('Échec récupération QCM: ' + qcmResponse.data.message);
                }
            } else if (loginResponse.data.code === 200) {
                // Connexion directe réussie
                this.token = loginResponse.data.token;
                this.account = loginResponse.data.data.accounts[0];
                return {
                    success: true,
                    account: this.account,
                    token: this.token
                };
            } else {
                throw new Error(loginResponse.data.message || 'Erreur de connexion');
            }
            
        } catch (error) {
            console.error('Erreur login:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async completeQCMLogin(username, password, tempToken, gtkValue, selectedAnswer) {
        try {
            console.log('🔐 Finalisation de la connexion avec QCM...');
            
            // ÉTAPE 1: Envoi de la réponse QCM
            const qcmAnswerResponse = await axios.post(`${this.baseURL}/connexion/doubleauth.awp?v=4.81.0`, 
                `data=${JSON.stringify({ choix: selectedAnswer })}`,
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
            
            if (qcmAnswerResponse.data.code === 200) {
                const cnValue = qcmAnswerResponse.data.data.cn;
                const cvValue = qcmAnswerResponse.data.data.cv;
                
                // ÉTAPE 2: Login final avec certificats
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
                
                if (finalLoginResponse.data.code === 200) {
                    this.token = finalLoginResponse.data.token;
                    this.account = finalLoginResponse.data.data.accounts[0];
                    
                    console.log('✅ Connexion finale réussie !');
                    return {
                        success: true,
                        account: this.account,
                        token: this.token
                    };
                } else {
                    throw new Error('Échec login final: ' + finalLoginResponse.data.message);
                }
            } else {
                throw new Error('Réponse QCM incorrecte: ' + qcmAnswerResponse.data.message);
            }
            
        } catch (error) {
            console.error('Erreur finalisation QCM:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getNotes() {
        if (!this.token || !this.account) {
            throw new Error('Non connecté - utilisez d\'abord login()');
        }
        
        try {
            const response = await axios.post(`${this.baseURL}/eleves/${this.account.id}/notes.awp?verbe=get&v=4.81.0`, 
                `data={"anneeScolaire":""}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Token': this.token,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                }
            );
            
            if (response.data.code === 200) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getEmploiDuTemps() {
        if (!this.token || !this.account) {
            throw new Error('Non connecté - utilisez d\'abord login()');
        }
        
        try {
            const response = await axios.post(`${this.baseURL}/eleves/${this.account.id}/emploidutemps.awp?verbe=get&v=4.81.0`, 
                `data={"dateDebut":"","dateFin":"","avecTrous":false}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Token': this.token,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                }
            );
            
            if (response.data.code === 200) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getDevoirs() {
        if (!this.token || !this.account) {
            throw new Error('Non connecté - utilisez d\'abord login()');
        }
        
        try {
            const response = await axios.post(`${this.baseURL}/eleves/${this.account.id}/cahierdetexte.awp?verbe=get&v=4.81.0`, 
                `data={"dateDebut":"","dateFin":""}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Token': this.token,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                }
            );
            
            if (response.data.code === 200) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getVieScolaire() {
        if (!this.token || !this.account) {
            throw new Error('Non connecté - utilisez d\'abord login()');
        }
        
        try {
            const response = await axios.post(`${this.baseURL}/eleves/${this.account.id}/viescolaire.awp?verbe=get&v=4.81.0`, 
                `data={}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Token': this.token,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                }
            );
            
            if (response.data.code === 200) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    logout() {
        this.token = null;
        this.account = null;
        console.log('✅ Déconnexion réussie');
    }
}

module.exports = EcoleDirecteAPI;
