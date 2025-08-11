// Module de contournement anti-bot avancé pour École Directe
class AntiBotBypass {
    constructor(browser) {
        this.browser = browser;
        this.maxAttempts = 15;
        this.currentAttempt = 0;
    }

    async createStealthPage() {
        console.log('🎭 Création d\'une page furtive...');
        
        const page = await this.browser.newPage();
        
        // Rotation d'user agents réalistes
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        ];
        
        const userAgent = userAgents[this.currentAttempt % userAgents.length];
        await page.setUserAgent(userAgent);
        
        // Viewport aléatoire mais réaliste
        const viewports = [
            { width: 1920, height: 1080 },
            { width: 1366, height: 768 },
            { width: 1536, height: 864 },
            { width: 1440, height: 900 }
        ];
        
        const viewport = viewports[this.currentAttempt % viewports.length];
        await page.setViewport({
            ...viewport,
            deviceScaleFactor: 1,
            isMobile: false,
            hasTouch: false
        });
        
        // Headers ultra-réalistes avec rotation
        const headerSets = [
            {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
            },
            {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'fr,fr-FR;q=0.9,en;q=0.8,en-US;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-User': '?1'
            }
        ];
        
        const headers = headerSets[this.currentAttempt % headerSets.length];
        await page.setExtraHTTPHeaders(headers);
        
        // Script de masquage ultra-avancé
        await page.evaluateOnNewDocument(() => {
            // Supprimer toutes les traces d'automatisation
            Object.defineProperty(navigator, 'webdriver', { 
                get: () => undefined,
                configurable: true 
            });
            
            // Masquer les propriétés Puppeteer
            delete window.navigator.webdriver;
            delete window.chrome?.runtime?.onConnect;
            delete window.chrome?.runtime?.onMessage;
            
            // Simuler Chrome de manière plus réaliste
            window.chrome = {
                runtime: {
                    onConnect: undefined,
                    onMessage: undefined,
                    connect: () => {},
                    sendMessage: () => {}
                },
                app: {
                    isInstalled: false,
                    InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
                    RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' }
                },
                csi: () => ({ onloadT: Date.now(), startE: Date.now(), tran: 15 }),
                loadTimes: () => ({
                    requestTime: Date.now() / 1000,
                    startLoadTime: Date.now() / 1000,
                    commitLoadTime: Date.now() / 1000,
                    finishDocumentLoadTime: Date.now() / 1000,
                    finishLoadTime: Date.now() / 1000,
                    firstPaintTime: Date.now() / 1000,
                    firstPaintAfterLoadTime: 0,
                    navigationType: 'other',
                    wasFetchedViaSpdy: false,
                    wasNpnNegotiated: false,
                    npnNegotiatedProtocol: 'unknown',
                    wasAlternateProtocolAvailable: false,
                    connectionInfo: 'http/1.1'
                })
            };
            
            // Simuler les plugins de manière plus réaliste
            Object.defineProperty(navigator, 'plugins', {
                get() {
                    return [
                        {
                            0: { type: "application/x-google-chrome-pdf", suffixes: "pdf", description: "Portable Document Format", enabledPlugin: true },
                            description: "Portable Document Format",
                            filename: "internal-pdf-viewer",
                            length: 1,
                            name: "Chrome PDF Plugin"
                        },
                        {
                            0: { type: "application/pdf", suffixes: "pdf", description: "Portable Document Format", enabledPlugin: true },
                            description: "Portable Document Format",
                            filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
                            length: 1,
                            name: "Chrome PDF Viewer"
                        },
                        {
                            0: { type: "application/x-nacl", suffixes: "", description: "Native Client Executable", enabledPlugin: true },
                            1: { type: "application/x-pnacl", suffixes: "", description: "Portable Native Client Executable", enabledPlugin: true },
                            description: "",
                            filename: "internal-nacl-plugin",
                            length: 2,
                            name: "Native Client"
                        }
                    ];
                },
                configurable: true
            });
            
            // Simuler les langues
            Object.defineProperty(navigator, 'languages', {
                get() { return ['fr-FR', 'fr', 'en-US', 'en']; },
                configurable: true
            });
            
            // Simuler la plateforme
            Object.defineProperty(navigator, 'platform', {
                get() { return 'Win32'; },
                configurable: true
            });
            
            // Simuler le nombre de processeurs
            Object.defineProperty(navigator, 'hardwareConcurrency', {
                get() { return 8; },
                configurable: true
            });
            
            // Simuler la mémoire disponible
            Object.defineProperty(navigator, 'deviceMemory', {
                get() { return 8; },
                configurable: true
            });
            
            // Simuler WebGL de manière réaliste
            const getParameter = WebGLRenderingContext.prototype.getParameter;
            WebGLRenderingContext.prototype.getParameter = function(parameter) {
                switch (parameter) {
                    case 37445: return 'Intel Inc.';
                    case 37446: return 'Intel(R) UHD Graphics 620';
                    case 7936: return 'WebKit';
                    case 7937: return 'WebKit WebGL';
                    case 35724: return 'WebGL 1.0 (OpenGL ES 2.0 Chromium)';
                    case 7938: return '1.0';
                    default: return getParameter.call(this, parameter);
                }
            };
            
            // Masquer les variables d'automatisation communes
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_JSON;
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Object;
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Proxy;
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Reflect;
            
            // Simuler les permissions
            if (navigator.permissions && navigator.permissions.query) {
                const originalQuery = navigator.permissions.query;
                navigator.permissions.query = (parameters) => (
                    parameters.name === 'notifications' ?
                        Promise.resolve({ state: Notification.permission }) :
                        originalQuery(parameters)
                );
            }
            
            // Masquer les traces d'iframe
            Object.defineProperty(window, 'outerHeight', {
                get() { return screen.height; }
            });
            Object.defineProperty(window, 'outerWidth', {
                get() { return screen.width; }
            });
            
            // Simuler les événements de souris et clavier
            ['mousedown', 'mouseup', 'mousemove', 'keydown', 'keyup'].forEach(eventType => {
                document.addEventListener(eventType, (e) => {
                    e.isTrusted = true;
                }, true);
            });
        });
        
        return page;
    }

    async simulateHumanBehavior(page) {
        console.log('🤖 Simulation de comportement humain...');
        
        // Mouvements de souris aléatoires
        for (let i = 0; i < 3; i++) {
            await page.mouse.move(
                Math.random() * 1000,
                Math.random() * 600,
                { steps: 10 }
            );
            await this.randomDelay(200, 800);
        }
        
        // Simuler un scroll
        await page.evaluate(() => {
            window.scrollBy(0, Math.random() * 200);
        });
        
        await this.randomDelay(1000, 3000);
    }

    async randomDelay(min, max) {
        const delay = Math.random() * (max - min) + min;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    async attemptNavigation(page, url) {
        console.log(`🌐 Tentative de navigation vers: ${url}`);
        
        try {
            // Navigation avec délai d'attente plus long
            await page.goto(url, { 
                waitUntil: 'domcontentloaded',
                timeout: 45000 
            });
            
            // Attendre que la page se stabilise
            await this.randomDelay(2000, 5000);
            
            return true;
        } catch (error) {
            console.log(`❌ Erreur navigation: ${error.message}`);
            return false;
        }
    }

    async checkForAntiBotTest(page) {
        try {
            const pageInfo = await page.evaluate(() => {
                return {
                    title: document.title,
                    bodyText: document.body ? document.body.innerText.substring(0, 1000) : '',
                    url: window.location.href,
                    hasLoginForm: !!document.querySelector('input[type="text"], input[type="email"], input[name="identifiant"]')
                };
            });
            
            console.log(`📄 Page info - Titre: ${pageInfo.title}`);
            console.log(`🔗 URL: ${pageInfo.url}`);
            
            // Vérifier les indicateurs de test anti-bot
            const antiBotIndicators = [
                'Voight-Kampff',
                'Checking Your Browser',
                'Verifying your browser',
                'Browser test',
                'Please wait while we verify',
                'Security check',
                'Cloudflare'
            ];
            
            const isAntiBotPage = antiBotIndicators.some(indicator => 
                pageInfo.title.includes(indicator) || pageInfo.bodyText.includes(indicator)
            );
            
            if (isAntiBotPage) {
                console.log('🛡️ Test anti-bot détecté!');
                return { blocked: true, info: pageInfo };
            }
            
            if (pageInfo.hasLoginForm) {
                console.log('✅ Formulaire de connexion trouvé!');
                return { blocked: false, success: true, info: pageInfo };
            }
            
            console.log('📋 Page chargée mais statut incertain');
            return { blocked: false, success: false, info: pageInfo };
            
        } catch (error) {
            console.log(`❌ Erreur lors de la vérification: ${error.message}`);
            return { blocked: true, error: error.message };
        }
    }

    async bypassAntiBotProtection() {
        console.log(`🚀 Démarrage du contournement anti-bot (tentative ${this.currentAttempt + 1}/${this.maxAttempts})`);
        
        for (this.currentAttempt = 0; this.currentAttempt < this.maxAttempts; this.currentAttempt++) {
            let page = null;
            
            try {
                console.log(`\n🔄 === TENTATIVE ${this.currentAttempt + 1}/${this.maxAttempts} ===`);
                
                // Créer une nouvelle page furtive
                page = await this.createStealthPage();
                
                // Simuler un comportement humain initial
                await this.simulateHumanBehavior(page);
                
                // Essayer différentes URLs dans un ordre stratégique
                const urls = [
                    'https://www.ecoledirecte.com/',
                    'https://www.ecoledirecte.com/login',
                    'https://www.ecoledirecte.com/connexion',
                    'https://ecoledirecte.com/',
                    'https://www.ecoledirecte.com/Eleve/login'
                ];
                
                const url = urls[this.currentAttempt % urls.length];
                
                // Tenter la navigation
                const navSuccess = await this.attemptNavigation(page, url);
                if (!navSuccess) {
                    console.log('❌ Navigation échouée');
                    continue;
                }
                
                // Vérifier le statut de la page
                const pageStatus = await this.checkForAntiBotTest(page);
                
                if (pageStatus.success) {
                    console.log('🎉 Contournement réussi!');
                    return { success: true, page: page };
                }
                
                if (pageStatus.blocked) {
                    console.log('🛡️ Toujours bloqué par l\'anti-bot');
                    
                    // Essayer d'attendre sur la page bloquée pour voir si elle se débloque
                    console.log('⏳ Attente sur la page de test...');
                    await this.simulateHumanBehavior(page);
                    
                    // Re-vérifier après simulation
                    const recheckStatus = await this.checkForAntiBotTest(page);
                    if (recheckStatus.success) {
                        console.log('🎉 Contournement réussi après attente!');
                        return { success: true, page: page };
                    }
                }
                
                // Fermer la page et essayer avec une nouvelle approche
                if (page && !page.isClosed()) {
                    await page.close();
                }
                page = null;
                
                // Délai avant la prochaine tentative
                const waitTime = 3000 + Math.random() * 7000;
                console.log(`⏳ Attente de ${Math.round(waitTime/1000)}s avant prochaine tentative...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                
            } catch (error) {
                console.log(`❌ Erreur tentative ${this.currentAttempt + 1}: ${error.message}`);
                
                if (page && !page.isClosed()) {
                    try {
                        await page.close();
                    } catch (e) {
                        // Ignorer les erreurs de fermeture
                    }
                }
            }
        }
        
        console.log('❌ Échec du contournement après toutes les tentatives');
        return { success: false, error: 'Impossible de contourner la protection anti-bot' };
    }
}

module.exports = AntiBotBypass;
