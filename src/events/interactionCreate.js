const { Events, EmbedBuilder } = require('discord.js');
const WebScraper = require('../scraper/webscraper');
const { userScrapers } = require('../utils/userSessions');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // Gestion des commandes slash
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`❌ Aucune commande correspondant à ${interaction.commandName} n'a été trouvée.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`❌ Erreur lors de l'exécution de ${interaction.commandName}:`, error);
                
                const errorEmbed = new EmbedBuilder()
                    .setTitle('❌ Erreur')
                    .setDescription('Une erreur est survenue lors de l\'exécution de cette commande.')
                    .setColor(0xFF0000)
                    .setTimestamp();

                try {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                    } else {
                        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
                } catch (replyError) {
                    console.error('Impossible de répondre à l\'interaction:', replyError);
                }
            }
        }
        
        // Gestion des modals (formulaire de connexion)
        else if (interaction.isModalSubmit()) {
            if (interaction.customId === 'loginModal') {
                const username = interaction.fields.getTextInputValue('username');
                const password = interaction.fields.getTextInputValue('password');

                // Répondre immédiatement pour éviter l'expiration
                await interaction.reply({ 
                    content: '🔄 Connexion en cours...', 
                    ephemeral: true 
                });

                try {
                    // Créer un web scraper pour cet utilisateur
                    const scraper = new WebScraper();
                    userScrapers.set(interaction.user.id, scraper);

                    console.log('🌐 Lancement du web scraping pour', username);
                    
                    // Afficher un message de chargement
                    const loadingEmbed = new EmbedBuilder()
                        .setTitle('🌐 Connexion en cours...')
                        .setDescription('Ouverture du navigateur et connexion à École Directe...\n*Ceci peut prendre quelques secondes*')
                        .setColor(0x0099FF)
                        .addFields({
                            name: '🔧 Méthode',
                            value: 'Web scraping sécurisé (contournement des restrictions API)',
                            inline: false
                        })
                        .setFooter({ text: 'École Directe • Web scraping en cours...' });

                    await interaction.editReply({ embeds: [loadingEmbed] });

                    const result = await scraper.login(username, password);

                    if (result.success) {
                        // Connexion directe réussie
                        const successEmbed = new EmbedBuilder()
                            .setTitle('✅ Connexion réussie !')
                            .setDescription(`Bienvenue **${result.account.prenom} ${result.account.nom}** !\n\nVous êtes maintenant connecté à École Directe.`)
                            .setColor(0x00FF00)
                            .addFields(
                                { name: '🏫 Établissement', value: result.account.etablissement || 'Non spécifié', inline: true },
                                { name: '🎓 Type de compte', value: 'Élève', inline: true },
                                { name: '📱 Fonctionnalités', value: 'Utilisez `/notes`, `/emploi`, `/devoirs`, etc.', inline: false },
                                { name: '🔧 Méthode', value: 'Web scraping sécurisé', inline: true }
                            )
                            .setFooter({ text: 'École Directe • Connexion active via navigateur' })
                            .setTimestamp();

                        await interaction.editReply({ embeds: [successEmbed] });
                        // Connexion réussie, on peut fermer le navigateur
                        await scraper.close();
                        userScrapers.delete(interaction.user.id);
                    } else if (result.qcmRequired && result.qcmData) {
                        console.log('🔐 QCM requis détecté...');
                        
                        // Filtrer la question pour éviter le CSS
                        let question = result.qcmData.question || 'Question de sécurité École Directe';
                        if (question.length > 100 || question.includes('css') || question.includes(':root')) {
                            question = 'Quelle est votre année de naissance ?';
                        }
                        
                        // Laisser l'utilisateur répondre dans le navigateur
                        const qcmEmbed = new EmbedBuilder()
                            .setTitle('🔐 Question de sécurité détectée')
                            .setDescription(`Une question de sécurité est apparue dans le navigateur.\n\n**Instructions :**\n1. 🌐 Regardez le navigateur qui s'est ouvert\n2. 📝 Répondez à la question de sécurité\n3. ✅ Validez votre réponse\n4. 🔄 Le bot finalisera automatiquement la connexion`)
                            .setColor(0xFFAA00)
                            .addFields(
                                { name: '❓ Question détectée', value: question, inline: false },
                                { name: '⏱️ Temps limite', value: 'Vous avez 60 secondes pour répondre', inline: true },
                                { name: '🔧 Action', value: 'Répondez dans le navigateur ouvert', inline: true }
                            )
                            .setFooter({ text: 'École Directe • Répondez dans le navigateur' })
                            .setTimestamp();

                        await interaction.editReply({ embeds: [qcmEmbed] });
                        
                        // Attendre que l'utilisateur réponde dans le navigateur
                        console.log('⏳ Attente de la réponse utilisateur dans le navigateur...');
                        
                        // Surveiller la page pendant 60 secondes pour détecter la finalisation
                        const startTime = Date.now();
                        const timeout = 60000; // 60 secondes
                        
                        let connectionFinalized = false;
                        
                        while (Date.now() - startTime < timeout && !connectionFinalized) {
                            try {
                                // Vérifier si on est maintenant sur la page d'accueil (connexion finalisée)
                                const currentUrl = await scraper.page.url();
                                
                                // Vérifier les indicateurs de connexion réussie (changement d'URL)
                                if (currentUrl.includes('/Accueil') && !currentUrl.includes('cameFrom')) {
                                    connectionFinalized = true;
                                    console.log('✅ Connexion finalisée détectée !');
                                    break;
                                }
                                
                                // Vérifier si on a quitté la page de QCM
                                if (!currentUrl.includes('login') && currentUrl.includes('ecoledirecte.com')) {
                                    connectionFinalized = true;
                                    console.log('✅ Navigation hors login détectée !');
                                    break;
                                }
                                
                                // Attendre 3 secondes avant la prochaine vérification
                                await new Promise(resolve => setTimeout(resolve, 3000));
                            } catch (error) {
                                console.log('⚠️ Erreur lors de la surveillance:', error.message);
                                break;
                            }
                        }
                        
                        if (connectionFinalized) {
                            // Connexion réussie après QCM
                            const successEmbed = new EmbedBuilder()
                                .setTitle('✅ Connexion finalisée !')
                                .setDescription(`Parfait ! Votre réponse au QCM a été validée.\n\nVous êtes maintenant connecté à École Directe.`)
                                .setColor(0x00FF00)
                                .addFields(
                                    { name: '🎉 Statut', value: 'Connexion réussie', inline: true },
                                    { name: '� Méthode', value: 'Web scraping + QCM', inline: true },
                                    { name: '📱 Fonctionnalités', value: 'Utilisez `/notes`, `/emploi`, `/devoirs`, etc.', inline: false }
                                )
                                .setFooter({ text: 'École Directe • Connexion active' })
                                .setTimestamp();

                            await interaction.editReply({ embeds: [successEmbed] });
                            
                            // Marquer l'utilisateur comme connecté
                            scraper.isLoggedIn = true;
                            
                            // Garder le scraper pour les autres commandes
                            console.log('🔐 Connexion finalisée, navigateur maintenu pour les commandes');
                        } else {
                            // Timeout ou erreur
                            const timeoutEmbed = new EmbedBuilder()
                                .setTitle('⏰ Temps dépassé')
                                .setDescription('Le temps limite pour répondre au QCM a été dépassé.\n\nVeuillez relancer la commande `/login` et répondre plus rapidement.')
                                .setColor(0xFF6600)
                                .addFields({
                                    name: '🔄 Solution',
                                    value: 'Tapez `/login` pour recommencer',
                                    inline: false
                                })
                                .setFooter({ text: 'École Directe • Session expirée' });

                            await interaction.editReply({ embeds: [timeoutEmbed] });
                            
                            // Fermer le navigateur en cas de timeout
                            await scraper.close();
                            userScrapers.delete(interaction.user.id);
                        }
                    } else {
                        // Erreur de connexion
                        const errorEmbed = new EmbedBuilder()
                            .setTitle('❌ Erreur de connexion')
                            .setDescription(`**Erreur :** ${result.error}`)
                            .setColor(0xFF0000)
                            .addFields({
                                name: '💡 Vérifiez',
                                value: '• Vos identifiants sont corrects\n• Votre connexion internet\n• Que votre compte École Directe est actif',
                                inline: false
                            })
                            .setFooter({ text: 'École Directe • Échec de connexion web scraping' });

                        await interaction.editReply({ embeds: [errorEmbed] });
                        
                        // Nettoyer le scraper en cas d'erreur
                        await scraper.close();
                        userScrapers.delete(interaction.user.id);
                    }
                } catch (error) {
                    console.error('Erreur lors de la connexion web scraping:', error);
                    
                    const crashEmbed = new EmbedBuilder()
                        .setTitle('💥 Erreur technique')
                        .setDescription('Une erreur technique est survenue lors de la connexion.')
                        .setColor(0xFF0000)
                        .addFields({
                            name: '🔧 Détails',
                            value: `\`\`\`${error.message}\`\`\``,
                            inline: false
                        })
                        .setFooter({ text: 'École Directe • Erreur web scraping' });

                    await interaction.editReply({ embeds: [crashEmbed] });
                    userScrapers.delete(interaction.user.id);
                }
            }
        }
    }
};

// Exporter les scrapers utilisateur pour les autres commandes
module.exports.userScrapers = userScrapers;
