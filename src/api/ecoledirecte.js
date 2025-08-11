const axios = require('axios');

class EcoleDirecteAPI {
    constructor() {
        this.baseURL = process.env.ECOLEDIRECTE_BASE_URL || 'https://api.ecoledirecte.com/v3';
        this.sessionToken = null;
        this.userAccount = null;
    }

    /**
     * Connexion à l'API École Directe
     * @param {string} username - Nom d'utilisateur
     * @param {string} password - Mot de passe
     * @returns {Promise<Object>} - Informations de connexion
     */
    async login(username, password) {
        try {
            console.log('🔐 Début de l\'authentification École Directe...');
            
            // Étape 1: Récupérer le cookie GTK (requis depuis le 24/03/2024)
            console.log('📡 Récupération du cookie GTK...');
            const gtkResponse = await axios.get(`${this.baseURL}/login.awp?gtk=1&v=4.75.0`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
                },
                maxRedirects: 5,
                validateStatus: (status) => status < 500,
                timeout: 10000
            });
            
            let gtkValue = '';
            if (gtkResponse.headers['set-cookie']) {
                const gtkCookie = gtkResponse.headers['set-cookie'].find(cookie => cookie.includes('GTK='));
                gtkValue = gtkCookie ? gtkCookie.split('GTK=')[1].split(';')[0] : '';
            }
            console.log('🔑 GTK obtenu:', gtkValue ? `Oui (${gtkValue.substring(0, 10)}...)` : 'Non');

            // Étape 2: Tentative de connexion avec différents formats
            console.log('🔐 Tentative de connexion...');
            
            // Format des données selon la documentation officielle
            const loginData = {
                identifiant: username.trim(),
                motdepasse: password,
                isReLogin: false,
                uuid: ""
            };

            console.log('📝 Identifiant utilisé:', username.trim());
            console.log('🔗 URL:', `${this.baseURL}/login.awp?v=4.75.0`);

            // Essayer d'abord avec le header X-Token (GTK)
            let response;
            try {
                response = await axios.post(`${this.baseURL}/login.awp?v=4.75.0`, 
                    `data=${encodeURIComponent(JSON.stringify(loginData))}`,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'X-Token': gtkValue,
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                            'Accept': 'application/json, text/plain, */*',
                            'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
                        },
                        timeout: 15000
                    }
                );
            } catch (error) {
                console.log('❌ Échec avec X-Token, essai sans GTK...');
                
                // Essayer sans GTK en cas d'échec
                response = await axios.post(`${this.baseURL}/login.awp?v=4.75.0`, 
                    `data=${encodeURIComponent(JSON.stringify(loginData))}`,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                            'Accept': 'application/json, text/plain, */*',
                            'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
                        },
                        timeout: 15000
                    }
                );
            }

            console.log('📊 Réponse API - Code:', response.data.code);
            console.log('📊 Message:', response.data.message || 'Aucun message');

            if (response.data.code === 200) {
                this.sessionToken = response.data.token;
                this.userAccount = response.data.data.accounts[0];
                console.log('✅ Connexion réussie pour:', this.userAccount.prenom, this.userAccount.nom);
                return {
                    success: true,
                    account: this.userAccount,
                    message: 'Connexion réussie'
                };
            } else if (response.data.code === 250) {
                // Code 250 = QCM requis
                return {
                    success: false,
                    message: 'Vérification de sécurité requise. Connectez-vous d\'abord via le site web École Directe puis réessayez.'
                };
            } else if (response.data.code === 505) {
                return {
                    success: false,
                    message: 'Identifiants incorrects. Vérifiez votre nom d\'utilisateur et mot de passe.'
                };
            } else {
                console.log('🔍 Réponse complète:', JSON.stringify(response.data, null, 2));
                return {
                    success: false,
                    message: response.data.message || `Erreur ${response.data.code}: Connexion échouée`
                };
            }
        } catch (error) {
            console.error('💥 Erreur lors de la connexion:', error.response?.data || error.message);
            if (error.response?.status === 429) {
                return {
                    success: false,
                    message: 'Trop de tentatives de connexion. Attendez quelques minutes avant de réessayer.'
                };
            }
            return {
                success: false,
                message: 'Erreur de connexion au serveur École Directe: ' + (error.response?.data?.message || error.message)
            };
        }
    }

    /**
     * Récupère les notes de l'élève
     * @param {string} periode - Période (optionnel)
     * @returns {Promise<Object>} - Notes de l'élève
     */
    async getNotes(periode = '') {
        if (!this.sessionToken || !this.userAccount) {
            throw new Error('Vous devez être connecté pour accéder aux notes');
        }

        try {
            const url = `${this.baseURL}/eleves/${this.userAccount.id}/notes.awp?verbe=get&v=4.70.0`;
            const response = await axios.post(url, 
                `data=${JSON.stringify({"token": this.sessionToken})}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Token': this.sessionToken,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
                    }
                }
            );

            if (response.data.code === 200) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Erreur lors de la récupération des notes'
                };
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des notes:', error.message);
            return {
                success: false,
                message: 'Erreur lors de la récupération des notes'
            };
        }
    }

    /**
     * Récupère l'emploi du temps
     * @param {string} dateDebut - Date de début (format YYYY-MM-DD)
     * @param {string} dateFin - Date de fin (format YYYY-MM-DD)
     * @returns {Promise<Object>} - Emploi du temps
     */
    async getEmploiDuTemps(dateDebut, dateFin) {
        if (!this.sessionToken || !this.userAccount) {
            throw new Error('Vous devez être connecté pour accéder à l\'emploi du temps');
        }

        try {
            const url = `${this.baseURL}/eleves/${this.userAccount.id}/emploidutemps.awp?verbe=get&v=4.70.0`;
            const response = await axios.post(url, 
                `data=${JSON.stringify({"token": this.sessionToken, "dateDebut": dateDebut, "dateFin": dateFin})}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Token': this.sessionToken,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
                    }
                }
            );

            if (response.data.code === 200) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Erreur lors de la récupération de l\'emploi du temps'
                };
            }
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'emploi du temps:', error.message);
            return {
                success: false,
                message: 'Erreur lors de la récupération de l\'emploi du temps'
            };
        }
    }

    /**
     * Récupère les devoirs
     * @param {string} dateDebut - Date de début (format YYYY-MM-DD)
     * @param {string} dateFin - Date de fin (format YYYY-MM-DD)
     * @returns {Promise<Object>} - Liste des devoirs
     */
    async getDevoirs(dateDebut, dateFin) {
        if (!this.sessionToken || !this.userAccount) {
            throw new Error('Vous devez être connecté pour accéder aux devoirs');
        }

        try {
            const url = `${this.baseURL}/eleves/${this.userAccount.id}/cahierdetexte.awp?verbe=get&v=4.70.0`;
            const response = await axios.post(url, 
                `data=${JSON.stringify({"token": this.sessionToken, "dateDebut": dateDebut, "dateFin": dateFin})}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Token': this.sessionToken,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
                    }
                }
            );

            if (response.data.code === 200) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Erreur lors de la récupération des devoirs'
                };
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des devoirs:', error.message);
            return {
                success: false,
                message: 'Erreur lors de la récupération des devoirs'
            };
        }
    }

    /**
     * Récupère les absences et retards
     * @returns {Promise<Object>} - Absences et retards
     */
    async getVieScolare() {
        if (!this.sessionToken || !this.userAccount) {
            throw new Error('Vous devez être connecté pour accéder à la vie scolaire');
        }

        try {
            const url = `${this.baseURL}/eleves/${this.userAccount.id}/viescolaire.awp?verbe=get&v=4.70.0`;
            const response = await axios.post(url, 
                `data=${JSON.stringify({"token": this.sessionToken})}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Token': this.sessionToken,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
                    }
                }
            );

            if (response.data.code === 200) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Erreur lors de la récupération de la vie scolaire'
                };
            }
        } catch (error) {
            console.error('Erreur lors de la récupération de la vie scolaire:', error.message);
            return {
                success: false,
                message: 'Erreur lors de la récupération de la vie scolaire'
            };
        }
    }

    /**
     * Déconnexion
     */
    logout() {
        this.sessionToken = null;
        this.userAccount = null;
    }
}

module.exports = EcoleDirecteAPI;
