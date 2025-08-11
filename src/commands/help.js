const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche la liste des commandes disponibles'),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0xFF9900)
            .setTitle('🎓 Bot École Directe - Statut')
            .setDescription('**⚠️ Limitation détectée**\n\nVotre établissement semble avoir désactivé l\'accès à l\'API École Directe.')
            .addFields(
                { 
                    name: '� Diagnostic', 
                    value: '• ✅ Bot opérationnel\n• ✅ Serveur École Directe accessible\n• ❌ API bloquée par l\'établissement', 
                    inline: false 
                },
                { 
                    name: '� Solutions', 
                    value: '• Utiliser le [site web École Directe](https://www.ecoledirecte.com)\n• Contacter votre établissement\n• Vérifier les restrictions API', 
                    inline: false 
                },
                { 
                    name: '🔧 Commandes disponibles', 
                    value: '`/login` - Informations sur les limitations\n`/help` - Afficher cette aide', 
                    inline: false 
                }
            )
            .setFooter({ 
                text: 'Bot développé selon la documentation officielle École Directe',
                iconURL: interaction.client.user.displayAvatarURL() 
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
