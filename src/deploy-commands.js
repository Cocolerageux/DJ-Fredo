const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];

// Récupérer tous les fichiers de commandes
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Charger toutes les commandes
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`✅ Commande chargée: ${command.data.name}`);
    } else {
        console.log(`❌ La commande ${filePath} n'a pas les propriétés "data" ou "execute" requises.`);
    }
}

// Créer une instance REST et définir le token
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Déployer les commandes
(async () => {
    try {
        console.log(`🔄 Déploiement de ${commands.length} commande(s) slash...`);

        let data;
        
        if (process.env.GUILD_ID) {
            // Déploiement pour un serveur spécifique (plus rapide pour le développement)
            data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands },
            );
            console.log(`✅ ${data.length} commande(s) déployée(s) sur le serveur ${process.env.GUILD_ID}.`);
        } else {
            // Déploiement global (peut prendre jusqu'à 1 heure pour être visible)
            data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
            console.log(`✅ ${data.length} commande(s) déployée(s) globalement.`);
        }

    } catch (error) {
        console.error('❌ Erreur lors du déploiement des commandes:', error);
    }
})();
