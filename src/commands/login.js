const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const EcoleDirecteAPI = require('../api/ecoledirecte');

// Stockage temporaire des sessions utilisateur (en production, utiliser une base de données)
const userSessions = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('login')
        .setDescription('Se connecter à École Directe'),
    
    async execute(interaction) {
        try {
            // Créer le modal pour la connexion
            const modal = new ModalBuilder()
                .setCustomId('loginModal')
                .setTitle('🔐 Connexion École Directe');

            // Champ identifiant
            const usernameInput = new TextInputBuilder()
                .setCustomId('username')
                .setLabel('Identifiant')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Votre identifiant École Directe')
                .setRequired(true);

            // Champ mot de passe
            const passwordInput = new TextInputBuilder()
                .setCustomId('password')
                .setLabel('Mot de passe')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Votre mot de passe')
                .setRequired(true);

            // Ajouter les champs au modal
            const firstActionRow = new ActionRowBuilder().addComponents(usernameInput);
            const secondActionRow = new ActionRowBuilder().addComponents(passwordInput);

            modal.addComponents(firstActionRow, secondActionRow);

            // Afficher le modal avec gestion d'erreur
            await interaction.showModal(modal);
        } catch (error) {
            console.error('❌ Erreur lors de l\'exécution de login:', error);
            
            // Si l'interaction a expiré, on ne peut plus répondre
            if (error.code === 10062 || error.code === 40060) {
                console.log('⚠️ Interaction expirée, impossible de répondre');
                return;
            }
            
            // Pour les autres erreurs, essayer de répondre si possible
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: '❌ Une erreur est survenue lors de l\'ouverture du formulaire de connexion.',
                        ephemeral: true
                    });
                }
            } catch (replyError) {
                console.error('❌ Impossible de répondre à l\'interaction:', replyError);
            }
        }
    },

    // Gestion du QCM de sécurité
    async handleQCM(interaction, username, password, qcmData) {
        const userId = interaction.user.id;
        
        // Stocker les données de connexion temporairement
        userSessions.set(userId, {
            username,
            password,
            tempToken: qcmData.tempToken,
            gtkValue: qcmData.gtkValue,
            timestamp: Date.now()
        });

        // Décoder la question
        const questionText = Buffer.from(qcmData.question, 'base64').toString('utf-8');
        
        // Décoder les propositions et créer les options du menu
        const options = qcmData.propositions.map((prop, index) => {
            const value = Buffer.from(prop, 'base64').toString('utf-8');
            return {
                label: value,
                value: prop, // Garder la valeur base64 pour l'envoi
                description: `Option ${index + 1}`
            };
        });

        // Créer le menu de sélection
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('qcmAnswer')
            .setPlaceholder('Sélectionnez votre réponse')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        // Créer l'embed pour la question de sécurité
        const embed = new EmbedBuilder()
            .setTitle('🔐 Question de sécurité École Directe')
            .setDescription(`**${questionText}**\n\nVeuillez sélectionner votre réponse dans le menu ci-dessous pour finaliser votre connexion.`)
            .setColor(0x0099FF)
            .addFields({
                name: '🛡️ Sécurité',
                value: 'Cette étape est requise par École Directe pour sécuriser votre connexion.',
                inline: false
            })
            .setFooter({ text: 'École Directe • Authentification à deux facteurs' })
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed],
            components: [row]
        });
    },

    // Finaliser la connexion après réponse QCM
    async finalizeLogin(interaction, selectedAnswer) {
        const userId = interaction.user.id;
        const sessionData = userSessions.get(userId);

        if (!sessionData) {
            return await interaction.editReply({
                content: '❌ Session expirée. Veuillez relancer la commande `/login`.',
                components: []
            });
        }

        try {
            // Afficher un message de chargement
            const loadingEmbed = new EmbedBuilder()
                .setTitle('⏳ Finalisation de la connexion...')
                .setDescription('Validation de votre réponse auprès d\'École Directe...')
                .setColor(0xFFAA00);

            await interaction.editReply({
                embeds: [loadingEmbed],
                components: []
            });

            const api = new EcoleDirecteAPI();
            const result = await api.completeQCMLogin(
                sessionData.username,
                sessionData.password,
                sessionData.tempToken,
                sessionData.gtkValue,
                selectedAnswer
            );

            // Nettoyer la session
            userSessions.delete(userId);

            if (result.success) {
                const successEmbed = new EmbedBuilder()
                    .setTitle('✅ Connexion réussie !')
                    .setDescription(`Bienvenue **${result.account.prenom} ${result.account.nom}** !\n\nVous êtes maintenant connecté à École Directe.`)
                    .setColor(0x00FF00)
                    .addFields(
                        { name: '🏫 Établissement', value: result.account.nomEtablissement || 'Non spécifié', inline: true },
                        { name: '🎓 Type de compte', value: result.account.typeCompte || 'Élève', inline: true },
                        { name: '📱 Fonctionnalités', value: 'Utilisez `/notes`, `/emploi`, `/devoirs`, etc.', inline: false }
                    )
                    .setFooter({ text: 'École Directe • Connexion active' })
                    .setTimestamp();

                await interaction.editReply({
                    embeds: [successEmbed]
                });
            } else {
                const errorEmbed = new EmbedBuilder()
                    .setTitle('❌ Erreur de connexion')
                    .setDescription(`**Erreur :** ${result.error}\n\nVeuillez vérifier votre réponse et réessayer.`)
                    .setColor(0xFF0000)
                    .addFields({
                        name: '💡 Que faire ?',
                        value: '• Vérifiez que votre réponse est correcte\n• Relancez `/login` si nécessaire\n• Contactez votre établissement en cas de problème persistant',
                        inline: false
                    })
                    .setFooter({ text: 'École Directe • Échec de connexion' });

                await interaction.editReply({
                    embeds: [errorEmbed]
                });
            }
        } catch (error) {
            console.error('Erreur finalisation login:', error);
            
            const crashEmbed = new EmbedBuilder()
                .setTitle('💥 Erreur technique')
                .setDescription('Une erreur est survenue lors de la finalisation de la connexion.')
                .setColor(0xFF0000)
                .addFields({
                    name: '🔧 Détails techniques',
                    value: `\`\`\`${error.message}\`\`\``,
                    inline: false
                })
                .setFooter({ text: 'École Directe • Erreur système' });

            await interaction.editReply({
                embeds: [crashEmbed],
                components: []
            });
        }
    }
};

// Exporter également la Map pour l'utiliser dans d'autres commandes
module.exports.userSessions = userSessions;
