module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`✅ Bot connecté en tant que ${client.user.tag}!`);
        console.log(`📊 Présent sur ${client.guilds.cache.size} serveur(s)`);
        console.log(`👥 Servant ${client.users.cache.size} utilisateurs`);
        
        // Définir le statut du bot
        client.user.setActivity('École Directe | /help', { type: 3 }); // 3 = WATCHING
    },
};
