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
            const result = await api.getNotes();

            if (result.success) {
                const notesData = result.data;
                
                // Créer l'embed avec les notes
                const embed = new EmbedBuilder()
                    .setTitle('📊 Vos Notes - École Directe')
                    .setColor(0x0099FF)
                    .setTimestamp();

                // Ajouter les informations générales
                if (notesData.periodes && notesData.periodes.length > 0) {
                    const currentPeriode = notesData.periodes[0];
                    embed.setDescription(`**Période :** ${currentPeriode.periode}\n**Classe :** ${currentPeriode.classe || 'Non spécifiée'}`);
                    
                    // Ajouter les moyennes générales
                    if (currentPeriode.ensembleMatieres && currentPeriode.ensembleMatieres.moyenneGenerale) {
                        embed.addFields({
                            name: '� Moyenne Générale',
                            value: `**${currentPeriode.ensembleMatieres.moyenneGenerale.moyenne}** / 20\n🎯 Moyenne de classe: ${currentPeriode.ensembleMatieres.moyenneGenerale.moyenneClasse || 'N/A'}`,
                            inline: true
                        });
                    }
                }

                // Ajouter les notes récentes (max 5)
                if (notesData.notes && notesData.notes.length > 0) {
                    const recentNotes = notesData.notes.slice(0, 5);
                    const notesText = recentNotes.map(note => 
                        `**${note.libelleMatiere}**\n📝 ${note.devoir}\n🎯 **${note.valeur}** / ${note.noteSur} (Coeff: ${note.coef})\n📅 ${new Date(note.date).toLocaleDateString('fr-FR')}`
                    ).join('\n\n');
                    
                    embed.addFields({
                        name: '� Notes Récentes',
                        value: notesText || 'Aucune note récente',
                        inline: false
                    });
                }

                // Ajouter les moyennes par matière (top 3)
                if (notesData.periodes && notesData.periodes[0] && notesData.periodes[0].ensembleMatieres && notesData.periodes[0].ensembleMatieres.disciplines) {
                    const matieres = notesData.periodes[0].ensembleMatieres.disciplines.slice(0, 3);
                    const matieresText = matieres.map(matiere => 
                        `**${matiere.discipline}**: ${matiere.moyenne || 'N/A'} / 20`
                    ).join('\n');
                    
                    if (matieresText) {
                        embed.addFields({
                            name: '� Moyennes par Matière (Top 3)',
                            value: matieresText,
                            inline: true
                        });
                    }
                }

                embed.setFooter({ text: 'École Directe • Notes mises à jour' });

                await interaction.editReply({ embeds: [embed] });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erreur récupération notes:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Erreur lors de la récupération des notes')
                .setDescription(`**Erreur :** ${error.message}`)
                .setColor(0xFF0000)
                .addFields({
                    name: '💡 Solutions',
                    value: '• Vérifiez votre connexion\n• Reconnectez-vous avec `/login`\n• Contactez votre établissement si le problème persiste',
                    inline: false
                })
                .setFooter({ text: 'École Directe • Erreur' });

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};
