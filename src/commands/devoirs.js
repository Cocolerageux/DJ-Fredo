const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { userScrapers } = require('../utils/userSessions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('devoirs')
        .setDescription('Affiche vos devoirs à venir'),
    
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
            // Récupérer les devoirs pour les 2 prochaines semaines
            const now = new Date();
            const dateDebut = now.toISOString().split('T')[0];
            
            const dateFin = new Date(now);
            dateFin.setDate(now.getDate() + 14);
            const dateFinStr = dateFin.toISOString().split('T')[0];

            const devoirsResult = await scraper.getDevoirs(dateDebut, dateFinStr);

            if (!devoirsResult.success) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('❌ Erreur')
                    .setDescription(devoirsResult.message);
                
                return await interaction.editReply({ embeds: [embed] });
            }

            const cahierTexte = devoirsResult.data;
            
            if (!cahierTexte || cahierTexte.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(0xFFFF00)
                    .setTitle('📚 Aucun devoir')
                    .setDescription('Aucun devoir trouvé pour les prochaines semaines.');
                
                return await interaction.editReply({ embeds: [embed] });
            }

            // Collecter tous les devoirs
            let tousLesDevoirs = [];
            
            cahierTexte.forEach(jour => {
                if (jour.aFaire && jour.aFaire.length > 0) {
                    jour.aFaire.forEach(devoir => {
                        tousLesDevoirs.push({
                            ...devoir,
                            date: jour.date
                        });
                    });
                }
            });

            // Trier par date
            tousLesDevoirs.sort((a, b) => new Date(a.date) - new Date(b.date));

            // Limiter à 10 devoirs pour éviter les messages trop longs
            const devoirsLimites = tousLesDevoirs.slice(0, 10);

            if (devoirsLimites.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(0xFFFF00)
                    .setTitle('📚 Aucun devoir')
                    .setDescription('Aucun devoir trouvé pour les prochaines semaines.');
                
                return await interaction.editReply({ embeds: [embed] });
            }

            // Créer l'embed
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('📚 Vos devoirs à venir')
                .setDescription('Voici vos prochains devoirs :')
                .setTimestamp();

            devoirsLimites.forEach((devoir, index) => {
                const date = new Date(devoir.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                
                const matiere = devoir.matiere || 'Matière inconnue';
                const contenu = devoir.aFaire || devoir.contenu || 'Contenu non spécifié';
                const effectue = devoir.effectue ? '✅' : '❌';
                
                // Limiter la longueur du contenu pour éviter les messages trop longs
                const contenuLimite = contenu.length > 200 ? contenu.substring(0, 200) + '...' : contenu;
                
                embed.addFields({
                    name: `📅 ${date} - ${matiere} ${effectue}`,
                    value: contenuLimite,
                    inline: false
                });
            });

            if (tousLesDevoirs.length > 10) {
                embed.setFooter({ text: `... et ${tousLesDevoirs.length - 10} autre(s) devoir(s)` });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erreur lors de la récupération des devoirs:', error);
            
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors de la récupération de vos devoirs.');
            
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
