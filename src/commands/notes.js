const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { userScrapers } = require('../utils/userSessions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('notes')
        .setDescription('Affiche vos notes École Directe'),
    
    async execute(interaction) {
        const userId = interaction.user.id;
        const scraper = userScrapers.get(userId);

        if (!scraper || !scraper.isLoggedIn) {
            const loginEmbed = new EmbedBuilder()
                .setTitle('🔐 Connexion requise')
                .setDescription('Vous devez d\'abord vous connecter avec `/login`')
                .setColor(0xFF9900)
                .addFields({
                    name: '📋 Étapes',
                    value: '1. Utilisez `/login`\n2. Saisissez vos identifiants\n3. Répondez à la question de sécurité\n4. Réessayez `/notes`',
                    inline: false
                })
                .setFooter({ text: 'École Directe • Non connecté' });

            return interaction.reply({ embeds: [loginEmbed], ephemeral: true });
        }

        await interaction.deferReply();

        try {
            console.log('📊 Récupération des notes via WebScraper...');
            const notes = await scraper.getNotes();

            if (notes && notes.length > 0) {
                // Créer l'embed avec les notes
                const embed = new EmbedBuilder()
                    .setTitle('📊 Vos Notes - École Directe')
                    .setColor(0x0099FF)
                    .setTimestamp();

                // Ajouter les notes récentes
                const recentNotes = notes.slice(0, 8);
                const notesText = recentNotes.map((note, index) => 
                    `**${index + 1}.** ${note.matiere || 'Matière'}\n📝 **${note.note}**/${note.sur} - ${note.date || 'Date inconnue'}`
                ).join('\n\n');
                
                embed.setDescription(`**Total :** ${notes.length} notes trouvées\n\n${notesText}`);
                embed.setFooter({ text: 'École Directe • Notes récupérées par web scraping' });

                await interaction.editReply({ embeds: [embed] });
            } else {
                const errorEmbed = new EmbedBuilder()
                    .setTitle('📊 Aucune note trouvée')
                    .setDescription('Aucune note n\'a été trouvée sur votre compte École Directe.')
                    .setColor(0xFFAA00)
                    .addFields({
                        name: '💡 Suggestions',
                        value: '• Vérifiez que des notes sont publiées\n• Reconnectez-vous avec `/login`\n• Contactez votre établissement',
                        inline: false
                    })
                    .setFooter({ text: 'École Directe • Aucune donnée' });

                await interaction.editReply({ embeds: [errorEmbed] });
            }
        } catch (error) {
            console.error('Erreur récupération notes:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Erreur lors de la récupération des notes')
                .setDescription(`**Erreur :** ${error.message}`)
                .setColor(0xFF0000)
                .addFields({
                    name: '🔧 Détails',
                    value: error.message.includes('WebScraper non initialisé') ? 
                           'Le navigateur n\'est pas initialisé. Reconnectez-vous avec `/login`.' :
                           'Erreur technique lors de la récupération des données.',
                    inline: false
                },
                {
                    name: '💡 Solutions',
                    value: '• Reconnectez-vous avec `/login`\n• Vérifiez votre connexion\n• Contactez votre établissement si le problème persiste',
                    inline: false
                })
                .setFooter({ text: 'École Directe • Erreur web scraping' });

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};
