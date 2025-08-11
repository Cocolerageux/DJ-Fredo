const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { userScrapers } = require('../utils/userSessions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emploi')
        .setDescription('Affiche votre emploi du temps de la semaine'),
    
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
            // Calculer la date de début et fin de la semaine courante
            const now = new Date();
            const startOfWeek = new Date(now);
            const dayOfWeek = now.getDay();
            const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Ajuster pour que lundi soit le premier jour
            startOfWeek.setDate(diff);
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            const dateDebut = startOfWeek.toISOString().split('T')[0];
            const dateFin = endOfWeek.toISOString().split('T')[0];

            const emploiResult = await scraper.getEmploiDuTemps(dateDebut, dateFin);

            if (!emploiResult.success) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('❌ Erreur')
                    .setDescription(emploiResult.message);
                
                return await interaction.editReply({ embeds: [embed] });
            }

            const planning = emploiResult.data;
            
            if (!planning || planning.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(0xFFFF00)
                    .setTitle('📅 Emploi du temps vide')
                    .setDescription('Aucun cours trouvé pour cette semaine.');
                
                return await interaction.editReply({ embeds: [embed] });
            }

            // Grouper les cours par jour
            const coursByJour = {};
            const joursNoms = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

            planning.forEach(cours => {
                const date = new Date(cours.start_date || cours.date);
                const jourNom = joursNoms[date.getDay()];
                
                if (!coursByJour[jourNom]) {
                    coursByJour[jourNom] = [];
                }
                
                coursByJour[jourNom].push(cours);
            });

            // Créer l'embed
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('📅 Emploi du temps de la semaine')
                .setDescription(`Du ${dateDebut} au ${dateFin}`)
                .setTimestamp();

            // Ajouter chaque jour
            Object.keys(coursByJour).forEach(jour => {
                const cours = coursByJour[jour];
                let jourText = '';
                
                cours.forEach(c => {
                    const heureDebut = c.start_date ? new Date(c.start_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Heure inconnue';
                    const heureFin = c.end_date ? new Date(c.end_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
                    const matiere = c.matiere || c.text || 'Matière inconnue';
                    const salle = c.salle || '';
                    const professeur = c.prof || '';
                    
                    jourText += `**${heureDebut}${heureFin ? ' - ' + heureFin : ''}**\n`;
                    jourText += `📚 ${matiere}\n`;
                    if (salle) jourText += `🏫 Salle: ${salle}\n`;
                    if (professeur) jourText += `👨‍🏫 Prof: ${professeur}\n`;
                    jourText += '\n';
                });

                if (jourText) {
                    embed.addFields({
                        name: `📆 ${jour}`,
                        value: jourText.trim() || 'Aucun cours',
                        inline: false
                    });
                }
            });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erreur lors de la récupération de l\'emploi du temps:', error);
            
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors de la récupération de votre emploi du temps.');
            
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
