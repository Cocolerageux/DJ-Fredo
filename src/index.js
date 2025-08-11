const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http');
require('dotenv').config();

// Debug des variables d'environnement
console.log('Debug Variables d\'environnement :');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- DISCORD_TOKEN:', process.env.DISCORD_TOKEN ? 'Defini' : 'Manquant');
console.log('- DISCORD_CLIENT_ID:', process.env.DISCORD_CLIENT_ID ? 'Defini' : 'Manquant');

// Verification des variables critiques
if (!process.env.DISCORD_TOKEN) {
    console.error('ERREUR: DISCORD_TOKEN non defini dans les variables d\'environnement');
    console.error('Verifiez votre configuration Render ou votre fichier .env');
    process.exit(1);
}

// Création du client Discord avec les intents nécessaires
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

// Collection pour stocker les commandes
client.commands = new Collection();

// Chargement dynamique des commandes
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`[INFO] Commande chargée: ${command.data.name}`);
        } else {
            console.log(`[WARNING] La commande ${filePath} n'a pas les propriétés "data" ou "execute" requises.`);
        }
    }
}

// Chargement des événements
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        console.log(`[INFO] Événement chargé: ${event.name}`);
    }
}

// Serveur de santé pour Render
const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'healthy', 
            bot: client.user ? 'connected' : 'disconnected',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        }));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🌐 Serveur de santé démarré sur le port ${PORT}`);
});

// Connexion du bot
client.login(process.env.DISCORD_TOKEN);

module.exports = client;
