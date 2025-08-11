const puppeteer = require('puppeteer');
const AntiBotBypass = require('./anti-bot-bypass');

class WebScraper {
    constructor() {
        this.browser = null;
        this.page = null;
        this.isLoggedIn = false;
        this.userInfo = null;
    }

    /**
     * Initialise le navigateur avec configuration anti-détection
     */
    async init() {
        console.log('🚀 Initialisation du navigateur...');
        
        const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
        
        // Configuration de base
        const browserConfig = {
            headless: isProduction ? 'new' : false,
            defaultViewport: null,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-features=VizDisplayCompositor',
                '--disable-extensions',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-field-trial-config',
                '--disable-back-forward-cache',
                '--disable-hang-monitor',
                '--disable-prompt-on-repost',
                '--disable-background-networking',
                '--disable-breakpad',
                '--disable-component-extensions-with-background-pages',
                '--disable-features=TranslateUI',
                '--disable-ipc-flooding-protection',
                '--enable-features=NetworkService,NetworkServiceInProcess',
                '--force-color-profile=srgb',
                '--metrics-recording-only',
                '--no-crash-upload',
                '--no-default-browser-check',
                '--no-pings',
                '--password-store=basic',
                '--use-mock-keychain',
                '--disable-blink-features=AutomationControlled'
            ]
        };

        // Configuration spécifique pour la production (Render)
        if (isProduction) {
            // Essayer différents chemins de cache pour Puppeteer
            const potentialCachePaths = [
                '/opt/render/.cache/puppeteer',
                './puppeteer-cache',
                process.env.PUPPETEER_CACHE_DIR
            ].filter(Boolean);

            for (const path of potentialCachePaths) {
                try {
                    console.log('🔍 Tentative cache path:', path);
                    process.env.PUPPETEER_CACHE_DIR = path;
                    
                    const fs = require('fs');
                    if (fs.existsSync(path)) {
                        console.log('✅ Cache path trouvé:', path);
                        break;
                    }
                } catch (e) {
                    console.log('❌ Cache path non accessible:', path);
                }
            }
            
            console.log('🌐 Mode production détecté - Configuration Render');
            console.log('📁 Cache Puppeteer final:', process.env.PUPPETEER_CACHE_DIR);
        } else {
            console.log('💻 Mode développement - Navigateur visible');
        }

        try {
            this.browser = await puppeteer.launch(browserConfig);
            console.log('✅ Navigateur initialisé avec succès');
        } catch (error) {
            console.error('❌ Erreur initialisation navigateur:', error.message);
            
            if (isProduction) {
                console.log('🔄 Tentative de détection automatique de Chrome...');
                
                // Chercher Chrome dans le cache Puppeteer
                const fs = require('fs');
                const path = require('path');
                const cacheDir = process.env.PUPPETEER_CACHE_DIR || 
                                (isProduction ? '/opt/render/.cache/puppeteer' : './puppeteer-cache');
                
                console.log(`🔍 Recherche dans: ${cacheDir}`);
                
                try {
                    if (fs.existsSync(cacheDir)) {
                        console.log('✅ Répertoire cache trouvé');
                        
                        const chromeDir = path.join(cacheDir, 'chrome');
                        if (fs.existsSync(chromeDir)) {
                            console.log('✅ Dossier chrome trouvé');
                            
                            // Chercher toutes les versions disponibles
                            const allVersions = fs.readdirSync(chromeDir);
                            const linuxVersions = allVersions.filter(v => v.startsWith('linux-'));
                            const win64Versions = allVersions.filter(v => v.startsWith('win64-'));
                            
                            console.log(`📋 Toutes versions: ${allVersions.join(', ')}`);
                            console.log(`📋 Versions Linux: ${linuxVersions.join(', ')}`);
                            console.log(`📋 Versions Win64: ${win64Versions.join(', ')}`);
                            
                            // Prioriser Linux pour production, Win64 pour développement
                            const versions = isProduction ? linuxVersions : win64Versions;
                            
                            if (versions.length > 0) {
                                const latestVersion = versions.sort().pop();
                                console.log(`🎯 Version sélectionnée: ${latestVersion}`);
                                
                                // Construire le chemin vers l'exécutable
                                let execPath;
                                if (isProduction) {
                                    execPath = path.join(chromeDir, latestVersion, 'chrome-linux64', 'chrome');
                                } else {
                                    execPath = path.join(chromeDir, latestVersion, 'chrome-win64', 'chrome.exe');
                                }
                                
                                console.log(`🔍 Chemin exécutable: ${execPath}`);
                                
                                if (fs.existsSync(execPath)) {
                                    console.log('✅ Exécutable Chrome trouvé');
                                    browserConfig.executablePath = execPath;
                                    this.browser = await puppeteer.launch(browserConfig);
                                    console.log('✅ Navigateur initialisé avec Chrome du cache');
                                    this.page = await this.browser.newPage();
                                    console.log('✅ Navigateur initialisé');
                                    return;
                                } else {
                                    console.log('❌ Exécutable Chrome non trouvé');
                                }
                            }
                        } else {
                            console.log('❌ Dossier chrome non trouvé');
                        }
                    } else {
                        console.log('❌ Répertoire cache non trouvé');
                    }
                } catch (e) {
                    console.log('❌ Erreur lors de la détection:', e.message);
                }
                
                // Essayer les chemins système
                console.log('🔄 Tentative avec les navigateurs système...');
                const systemPaths = [
                    '/usr/bin/chromium-browser',
                    '/usr/bin/chromium',
                    '/usr/bin/google-chrome-stable',
                    '/usr/bin/google-chrome'
                ];
                
                for (const execPath of systemPaths) {
                    try {
                        if (fs.existsSync(execPath)) {
                            console.log(`🔍 Test de ${execPath}...`);
                            browserConfig.executablePath = execPath;
                            this.browser = await puppeteer.launch(browserConfig);
                            console.log(`✅ Navigateur initialisé avec ${execPath}`);
                            this.page = await this.browser.newPage();
                            console.log('✅ Navigateur initialisé');
                            return;
                        }
                    } catch (e) {
                        console.log(`❌ Échec avec ${execPath}:`, e.message);
                    }
                }
                
                // Dernière tentative sans executablePath
                console.log('🔄 Dernière tentative sans executablePath...');
                delete browserConfig.executablePath;
                this.browser = await puppeteer.launch(browserConfig);
                console.log('✅ Navigateur initialisé en mode fallback');
            } else {
                throw error;
            }
        }
        
        this.page = await this.browser.newPage();
        console.log('✅ Navigateur initialisé');
    }

    /**
     * Connexion via le site web École Directe avec contournement anti-bot avancé
     */
    async login(username, password) {
        if (!this.browser || !this.page) {
            throw new Error('WebScraper non initialisé');
        }

        console.log('🔐 Connexion École Directe via web scraping avec contournement avancé...');

        try {
            // Initialiser le système de contournement anti-bot
            const antiBotBypass = new AntiBotBypass(this.browser);
            
            // Tenter le contournement
            console.log('🛡️ Lancement du contournement anti-bot...');
            const bypassResult = await antiBotBypass.bypassAntiBotProtection();
            
            if (!bypassResult.success) {
                throw new Error(`Contournement anti-bot échoué: ${bypassResult.error}`);
            }
            
            console.log('✅ Contournement anti-bot réussi!');
            
            // Remplacer notre page par celle qui a réussi le contournement
            if (this.page && !this.page.isClosed()) {
                await this.page.close();
            }
            this.page = bypassResult.page;
            
            console.log('🔍 Recherche des éléments de connexion...');

            // Analyser la page pour trouver les champs de connexion
            const pageAnalysis = await this.page.evaluate(() => {
                return {
                    allInputs: Array.from(document.querySelectorAll('input')).map(input => ({
                        type: input.type,
                        name: input.name,
                        id: input.id,
                        placeholder: input.placeholder,
                        className: input.className,
                        visible: input.offsetWidth > 0 && input.offsetHeight > 0
                    })),
                    allButtons: Array.from(document.querySelectorAll('button, input[type="submit"]')).map(btn => ({
                        text: btn.textContent || btn.value,
                        type: btn.type,
                        className: btn.className,
                        id: btn.id,
                        visible: btn.offsetWidth > 0 && btn.offsetHeight > 0
                    }))
                };
            });
            
            console.log('📊 Éléments trouvés:');
            console.log('  - Inputs:', pageAnalysis.allInputs);
            console.log('  - Boutons:', pageAnalysis.allButtons);

            // Attendre et chercher les champs de connexion
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Chercher le champ identifiant avec plusieurs sélecteurs possibles
            const usernameSelectors = [
                'input[name="identifiant"]',
                'input[name="username"]', 
                'input[name="login"]',
                'input[type="text"]',
                'input[type="email"]',
                'input[placeholder*="identifiant"]',
                'input[placeholder*="nom"]',
                'input[id*="identifiant"]',
                'input[id*="username"]',
                'input[id*="login"]'
            ];

            let usernameField = null;
            for (const selector of usernameSelectors) {
                try {
                    usernameField = await this.page.$(selector);
                    if (usernameField) {
                        console.log(`✅ Champ identifiant trouvé avec: ${selector}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!usernameField) {
                throw new Error('Champ identifiant non trouvé sur la page');
            }

            // Chercher le champ mot de passe
            const passwordSelectors = [
                'input[name="motdepasse"]',
                'input[name="password"]',
                'input[type="password"]',
                'input[placeholder*="mot de passe"]',
                'input[placeholder*="password"]',
                'input[id*="password"]',
                'input[id*="motdepasse"]'
            ];

            let passwordField = null;
            for (const selector of passwordSelectors) {
                try {
                    passwordField = await this.page.$(selector);
                    if (passwordField) {
                        console.log(`✅ Champ mot de passe trouvé avec: ${selector}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!passwordField) {
                throw new Error('Champ mot de passe non trouvé sur la page');
            }

            console.log('✅ Champs de connexion trouvés');

            // Simuler la saisie humaine
            console.log('⌨️ Saisie des identifiants...');
            
            // Cliquer et saisir l'identifiant
            await usernameField.click();
            await new Promise(resolve => setTimeout(resolve, 500));
            await usernameField.type(username, { delay: 100 });

            // Cliquer et saisir le mot de passe
            await passwordField.click();
            await new Promise(resolve => setTimeout(resolve, 500));
            await passwordField.type(password, { delay: 100 });

            console.log('✅ Identifiants saisis');

            // Chercher et cliquer sur le bouton de connexion
            const submitSelectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                'button:contains("Connexion")',
                'button:contains("Se connecter")',
                'button:contains("Login")',
                'button:contains("Valider")',
                'input[value*="connexion"]',
                'input[value*="connecter"]',
                '.btn-connexion',
                '#btn-login',
                '[class*="connect"]'
            ];

            let submitButton = null;
            for (const selector of submitSelectors) {
                try {
                    if (selector.includes(':contains')) {
                        // Pour les sélecteurs avec text, utiliser evaluate
                        submitButton = await this.page.evaluateHandle((text) => {
                            const buttons = document.querySelectorAll('button');
                            for (const btn of buttons) {
                                if (btn.textContent.toLowerCase().includes(text)) {
                                    return btn;
                                }
                            }
                            return null;
                        }, selector.split(':contains("')[1].split('")')[0].toLowerCase());
                        
                        if (submitButton && await submitButton.evaluate(el => el !== null)) {
                            console.log(`✅ Bouton de connexion trouvé avec texte: ${selector}`);
                            break;
                        }
                    } else {
                        submitButton = await this.page.$(selector);
                        if (submitButton) {
                            console.log(`✅ Bouton de connexion trouvé avec: ${selector}`);
                            break;
                        }
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!submitButton || await submitButton.evaluate(el => el === null)) {
                // Essayer d'appuyer sur Entrée
                console.log('🔄 Bouton non trouvé, tentative avec la touche Entrée...');
                await this.page.keyboard.press('Enter');
            } else {
                console.log('🔐 Clic sur le bouton de connexion...');
                await submitButton.click();
            }

            // Attendre la réponse de connexion
            console.log('⏳ Attente de la réponse de connexion...');
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Vérifier le résultat de la connexion
            const pageUrl = this.page.url();
            const pageTitle = await this.page.title();
            
            console.log('📍 URL après connexion:', pageUrl);
            console.log('📄 Titre après connexion:', pageTitle);

            // Vérifier s'il y a des erreurs d'authentification
            const errorMessages = await this.page.evaluate(() => {
                const possibleErrorSelectors = [
                    '.error', '.alert-danger', '.message-error', 
                    '[class*="error"]', '[class*="alert"]',
                    'div:contains("erreur")', 'div:contains("incorrect")',
                    'div:contains("invalide")', 'span:contains("erreur")'
                ];
                
                const errors = [];
                for (const selector of possibleErrorSelectors) {
                    try {
                        const elements = document.querySelectorAll(selector.replace(':contains', ''));
                        for (const el of elements) {
                            if (el.textContent && 
                                (el.textContent.toLowerCase().includes('erreur') ||
                                 el.textContent.toLowerCase().includes('incorrect') ||
                                 el.textContent.toLowerCase().includes('invalide') ||
                                 el.textContent.toLowerCase().includes('échec'))) {
                                errors.push(el.textContent.trim());
                            }
                        }
                    } catch (e) {
                        // Ignorer les erreurs de sélecteur
                    }
                }
                return errors;
            });

            if (errorMessages.length > 0) {
                throw new Error(`Erreur de connexion: ${errorMessages.join(', ')}`);
            }

            // Détecter si on a un QCM anti-bot
            const qcmDetected = await this.page.evaluate(() => {
                const bodyText = document.body.innerText.toLowerCase();
                return bodyText.includes('qcm') || 
                       bodyText.includes('question') ||
                       bodyText.includes('réponse') ||
                       document.querySelector('input[type="radio"]') !== null;
            });

            if (qcmDetected) {
                console.log('🧩 QCM de sécurité détecté');
                const qcmData = await this.extractQCMData();
                return { 
                    success: false, 
                    requiresQCM: true, 
                    qcmData 
                };
            }

            // Vérifier si on est connecté
            if (pageUrl.includes('accueil') || 
                pageUrl.includes('dashboard') || 
                pageUrl.includes('eleve') || 
                pageUrl.includes('parent') ||
                pageTitle.toLowerCase().includes('accueil')) {
                
                console.log('✅ Connexion réussie!');
                this.isLoggedIn = true;
                
                // Extraire les informations utilisateur
                this.userInfo = await this.extractUserInfo();
                
                return { 
                    success: true, 
                    userInfo: this.userInfo 
                };
            } else {
                throw new Error('Connexion échouée - redirection inattendue');
            }

        } catch (error) {
            console.error('❌ Erreur lors de la connexion web:', error.message);
            throw new Error(`Erreur de connexion web: ${error.message}`);
        }
    }

    /**
     * Extrait les données du QCM de sécurité
     */
    async extractQCMData() {
        console.log('🧩 Extraction des données QCM...');
        
        try {
            const qcmData = await this.page.evaluate(() => {
                const questions = [];
                
                // Chercher les questions et réponses
                const questionElements = document.querySelectorAll('div[class*="question"], .question, h3, h4, p');
                const radioInputs = document.querySelectorAll('input[type="radio"]');
                
                // Extraire les questions
                for (const el of questionElements) {
                    const text = el.textContent.trim();
                    if (text.includes('?') && text.length > 10) {
                        questions.push({
                            text: text,
                            element: el.outerHTML
                        });
                    }
                }
                
                // Extraire les réponses
                const answers = [];
                for (const radio of radioInputs) {
                    const label = document.querySelector(`label[for="${radio.id}"]`) || 
                                 radio.nextElementSibling || 
                                 radio.parentElement;
                    
                    answers.push({
                        value: radio.value,
                        text: label ? label.textContent.trim() : '',
                        name: radio.name,
                        id: radio.id
                    });
                }
                
                return {
                    questions,
                    answers,
                    hasQCM: questions.length > 0 && answers.length > 0
                };
            });
            
            console.log('📊 QCM Data:', qcmData);
            return qcmData;
            
        } catch (error) {
            console.error('❌ Erreur extraction QCM:', error.message);
            return null;
        }
    }

    /**
     * Complète la connexion avec la réponse au QCM
     */
    async completeQCMLogin(selectedAnswer) {
        console.log('🧩 Soumission de la réponse QCM:', selectedAnswer);
        
        try {
            // Sélectionner la réponse
            await this.page.click(`input[type="radio"][value="${selectedAnswer}"]`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Chercher et cliquer sur le bouton de validation
            const submitButton = await this.page.$('button[type="submit"], input[type="submit"], .btn-valider');
            if (submitButton) {
                await submitButton.click();
            } else {
                await this.page.keyboard.press('Enter');
            }
            
            // Attendre la réponse
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Vérifier le résultat
            const pageUrl = this.page.url();
            const pageTitle = await this.page.title();
            
            if (pageUrl.includes('accueil') || pageUrl.includes('dashboard') || pageTitle.toLowerCase().includes('accueil')) {
                console.log('✅ Connexion QCM réussie!');
                this.isLoggedIn = true;
                this.userInfo = await this.extractUserInfo();
                return { success: true, userInfo: this.userInfo };
            } else {
                throw new Error('Réponse QCM incorrecte ou autre erreur');
            }
            
        } catch (error) {
            console.error('❌ Erreur QCM login:', error.message);
            throw error;
        }
    }

    /**
     * Extrait les informations de l'utilisateur connecté
     */
    async extractUserInfo() {
        console.log('👤 Extraction des informations utilisateur...');
        
        try {
            const userInfo = await this.page.evaluate(() => {
                // Chercher le nom de l'utilisateur
                const nameSelectors = [
                    '.username', '.user-name', '.nom-utilisateur',
                    '[class*="name"]', '[class*="nom"]',
                    'span:contains("Bonjour")', 'div:contains("Bienvenue")'
                ];
                
                let userName = '';
                for (const selector of nameSelectors) {
                    try {
                        const element = document.querySelector(selector);
                        if (element && element.textContent.trim()) {
                            userName = element.textContent.trim();
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
                
                // Chercher la classe
                const classSelectors = [
                    '.classe', '.class', '[class*="classe"]'
                ];
                
                let userClass = '';
                for (const selector of classSelectors) {
                    try {
                        const element = document.querySelector(selector);
                        if (element && element.textContent.trim()) {
                            userClass = element.textContent.trim();
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
                
                return {
                    name: userName,
                    class: userClass,
                    url: window.location.href,
                    title: document.title
                };
            });
            
            console.log('👤 Informations utilisateur:', userInfo);
            return userInfo;
            
        } catch (error) {
            console.error('❌ Erreur extraction user info:', error.message);
            return null;
        }
    }

    /**
     * Récupère les notes de l'élève
     */
    async getNotes() {
        if (!this.isLoggedIn) {
            throw new Error('Non connecté');
        }

        console.log('📊 Récupération des notes...');
        
        try {
            // Naviguer vers la page des notes
            const notesUrl = this.page.url().replace(/\/[^\/]*$/, '/notes') || 
                           this.page.url() + '/notes';
            
            await this.page.goto(notesUrl, { waitUntil: 'networkidle2', timeout: 30000 });
            await new Promise(resolve => setTimeout(resolve, 2000));

            const notes = await this.page.evaluate(() => {
                const noteElements = document.querySelectorAll('.note, .grade, [class*="note"]');
                const extractedNotes = [];

                for (const element of noteElements) {
                    const text = element.textContent.trim();
                    const parentText = element.parentElement?.textContent || '';
                    
                    // Chercher des patterns de notes (ex: 15/20, 12.5/20, etc.)
                    const noteMatch = text.match(/(\d+(?:[.,]\d+)?)\s*\/\s*(\d+)/);
                    if (noteMatch) {
                        extractedNotes.push({
                            note: noteMatch[1].replace(',', '.'),
                            sur: noteMatch[2],
                            matiere: parentText.replace(text, '').trim(),
                            date: new Date().toISOString().split('T')[0] // Date par défaut
                        });
                    }
                }

                return extractedNotes;
            });

            console.log('📊 Notes trouvées:', notes.length);
            return notes;

        } catch (error) {
            console.error('❌ Erreur récupération notes:', error.message);
            throw error;
        }
    }

    /**
     * Récupère l'emploi du temps
     */
    async getEmploiDuTemps(dateDebut, dateFin) {
        if (!this.isLoggedIn) {
            throw new Error('Non connecté');
        }

        console.log('📅 Récupération de l\'emploi du temps...');
        
        try {
            // Naviguer vers la page emploi du temps
            const edtUrl = this.page.url().replace(/\/[^\/]*$/, '/emploidutemps') || 
                          this.page.url() + '/emploidutemps';
            
            await this.page.goto(edtUrl, { waitUntil: 'networkidle2', timeout: 30000 });
            await new Promise(resolve => setTimeout(resolve, 2000));

            const emploi = await this.page.evaluate(() => {
                const courseElements = document.querySelectorAll('.course, .cours, [class*="cours"]');
                const courses = [];

                for (const element of courseElements) {
                    const text = element.textContent.trim();
                    if (text.length > 5) { // Filtrer les éléments trop courts
                        courses.push({
                            matiere: text,
                            horaire: '', // À implémenter selon la structure
                            salle: '',   // À implémenter selon la structure
                            professeur: '' // À implémenter selon la structure
                        });
                    }
                }

                return courses;
            });

            console.log('📅 Cours trouvés:', emploi.length);
            return emploi;

        } catch (error) {
            console.error('❌ Erreur récupération emploi du temps:', error.message);
            throw error;
        }
    }

    /**
     * Récupère les devoirs
     */
    async getDevoirs(dateDebut, dateFin) {
        if (!this.isLoggedIn) {
            throw new Error('Non connecté');
        }

        console.log('📚 Récupération des devoirs...');
        
        try {
            // Naviguer vers la page des devoirs
            const devoirsUrl = this.page.url().replace(/\/[^\/]*$/, '/devoirs') || 
                              this.page.url() + '/cahierdetexte';
            
            await this.page.goto(devoirsUrl, { waitUntil: 'networkidle2', timeout: 30000 });
            await new Promise(resolve => setTimeout(resolve, 2000));

            const devoirs = await this.page.evaluate(() => {
                const devoirElements = document.querySelectorAll('.devoir, .homework, [class*="devoir"]');
                const extractedDevoirs = [];

                for (const element of devoirElements) {
                    const text = element.textContent.trim();
                    if (text.length > 10) { // Filtrer les éléments trop courts
                        extractedDevoirs.push({
                            matiere: '', // À extraire selon la structure
                            description: text,
                            dateRemise: '', // À extraire selon la structure
                            fait: false
                        });
                    }
                }

                return extractedDevoirs;
            });

            console.log('📚 Devoirs trouvés:', devoirs.length);
            return devoirs;

        } catch (error) {
            console.error('❌ Erreur récupération devoirs:', error.message);
            throw error;
        }
    }

    /**
     * Récupère les informations de vie scolaire
     */
    async getVieScolare() {
        if (!this.isLoggedIn) {
            throw new Error('Non connecté');
        }

        console.log('🏫 Récupération de la vie scolaire...');
        
        try {
            // Naviguer vers la page vie scolaire
            const viescoUrl = this.page.url().replace(/\/[^\/]*$/, '/viescolaire') || 
                             this.page.url() + '/viescolaire';
            
            await this.page.goto(viescoUrl, { waitUntil: 'networkidle2', timeout: 30000 });
            await new Promise(resolve => setTimeout(resolve, 2000));

            const vieScolaire = await this.page.evaluate(() => {
                const absenceElements = document.querySelectorAll('.absence, [class*="absence"]');
                const retardElements = document.querySelectorAll('.retard, [class*="retard"]');
                const sanctionElements = document.querySelectorAll('.sanction, [class*="sanction"]');

                return {
                    absences: Array.from(absenceElements).map(el => ({
                        date: '',
                        motif: el.textContent.trim()
                    })),
                    retards: Array.from(retardElements).map(el => ({
                        date: '',
                        motif: el.textContent.trim()
                    })),
                    sanctions: Array.from(sanctionElements).map(el => ({
                        date: '',
                        motif: el.textContent.trim()
                    }))
                };
            });

            console.log('🏫 Vie scolaire récupérée');
            return vieScolaire;

        } catch (error) {
            console.error('❌ Erreur récupération vie scolaire:', error.message);
            throw error;
        }
    }

    /**
     * Ferme le navigateur
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('🔐 Navigateur fermé');
        }
    }
}

module.exports = WebScraper;
