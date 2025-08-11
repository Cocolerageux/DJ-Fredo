const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { userScrapers } = require('../utils/userSessions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vie-scolaire')
        .setDescription('Affiche vos absences et retards'),
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        // Vérifier si l'utilisateur est connecté
        const scraper = userScrapers.get(interaction.user.id);
        if (!scraper || !scraper.isLoggedIn) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Non connecté')
                .setDescription('Vous devez d\'abord vous connecter avec `/login`');
            
            return await interaction.editReply({ embeds: [embed] });
        }

        try {
            const vieScolarireResult = await scraper.getVieScolare();

            if (!vieScolarireResult.success) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('❌ Erreur')
                    .setDescription(vieScolarireResult.message);
                
                return await interaction.editReply({ embeds: [embed] });
            }

            const vieScolare = vieScolarireResult.data;
            
            // Créer l'embed principal
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('🏫 Vie Scolaire')
                .setDescription('Voici votre situation scolaire :')
                .setTimestamp();

            // Absences
            if (vieScolare.absences && vieScolare.absences.length > 0) {
                let absencesText = '';
                vieScolare.absences.slice(0, 5).forEach(absence => {
                    const date = absence.date ? new Date(absence.date).toLocaleDateString('fr-FR') : 'Date inconnue';
                    const motif = absence.motif || 'Non spécifié';
                    const justifiee = absence.justifiee ? '✅ Justifiée' : '❌ Non justifiée';
                    
                    absencesText += `**${date}** - ${motif} (${justifiee})\n`;
                });
                
                embed.addFields({
                    name: `🚫 Absences (${vieScolare.absences.length})`,
                    value: absencesText || 'Aucune absence',
                    inline: false
                });
            } else {
                embed.addFields({
                    name: '🚫 Absences',
                    value: 'Aucune absence enregistrée',
                    inline: true
                });
            }

            // Retards
            if (vieScolare.retards && vieScolare.retards.length > 0) {
                let retardsText = '';
                vieScolare.retards.slice(0, 5).forEach(retard => {
                    const date = retard.date ? new Date(retard.date).toLocaleDateString('fr-FR') : 'Date inconnue';
                    const motif = retard.motif || 'Non spécifié';
                    const justifie = retard.justifie ? '✅ Justifié' : '❌ Non justifié';
                    
                    retardsText += `**${date}** - ${motif} (${justifie})\n`;
                });
                
                embed.addFields({
                    name: `⏰ Retards (${vieScolare.retards.length})`,
                    value: retardsText || 'Aucun retard',
                    inline: false
                });
            } else {
                embed.addFields({
                    name: '⏰ Retards',
                    value: 'Aucun retard enregistré',
                    inline: true
                });
            }

            // Sanctions
            if (vieScolare.sanctions && vieScolare.sanctions.length > 0) {
                let sanctionsText = '';
                vieScolare.sanctions.slice(0, 3).forEach(sanction => {
                    const date = sanction.date ? new Date(sanction.date).toLocaleDateString('fr-FR') : 'Date inconnue';
                    const motif = sanction.motif || 'Non spécifié';
                    const nature = sanction.nature || 'Non spécifiée';
                    
                    sanctionsText += `**${date}** - ${nature}: ${motif}\n`;
                });
                
                embed.addFields({
                    name: `⚠️ Sanctions (${vieScolare.sanctions.length})`,
                    value: sanctionsText || 'Aucune sanction',
                    inline: false
                });
            } else {
                embed.addFields({
                    name: '⚠️ Sanctions',
                    value: 'Aucune sanction enregistrée',
                    inline: true
                });
            }

            // Encouragements/Félicitations
            if (vieScolare.encouragements && vieScolare.encouragements.length > 0) {
                let encouragementsText = '';
                vieScolare.encouragements.slice(0, 3).forEach(encouragement => {
                    const date = encouragement.date ? new Date(encouragement.date).toLocaleDateString('fr-FR') : 'Date inconnue';
                    const motif = encouragement.motif || 'Non spécifié';
                    
                    encouragementsText += `**${date}** - ${motif}\n`;
                });
                
                embed.addFields({
                    name: `🎉 Encouragements (${vieScolare.encouragements.length})`,
                    value: encouragementsText,
                    inline: false
                });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erreur lors de la récupération de la vie scolaire:', error);
            
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors de la récupération de votre vie scolaire.');
            
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
