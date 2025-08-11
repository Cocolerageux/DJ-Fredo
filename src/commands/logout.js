const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { userScrapers } = require('../utils/userSessions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logout')
        .setDescription('Se déconnecter d\'École Directe'),
    
    async execute(interaction) {
        // Vérifier si l'utilisateur est connecté
        const scraper = userScrapers.get(interaction.user.id);
        if (!scraper || !scraper.isLoggedIn) {
            const embed = new EmbedBuilder()
                .setColor(0xFFFF00)
                .setTitle('⚠️ Déjà déconnecté')
                .setDescription('Vous n\'êtes pas connecté à École Directe.');
            
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            // Fermer le navigateur et nettoyer les ressources
            await scraper.close();
            
            // Supprimer la session de la Map
            userScrapers.delete(interaction.user.id);

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✅ Déconnexion réussie')
                .setDescription('Vous avez été déconnecté d\'École Directe avec succès.')
                .setFooter({ text: 'Le navigateur a été fermé et vos données supprimées.' });

            await interaction.reply({ embeds: [embed], ephemeral: true });

        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors de la déconnexion.');
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
