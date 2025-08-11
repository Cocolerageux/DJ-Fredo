# Bot Discord École Directe

Un bot Discord qui permet d'accéder aux informations d'École Directe directement depuis Discord.

## 🚀 Fonctionnalités

- 🔐 **Connexion sécurisée** à École Directe
- 📊 **Consultation des notes** et moyennes
- 📅 **Affichage de l'emploi du temps** de la semaine
- 📚 **Liste des devoirs** à venir
- 🏫 **Vie scolaire** : absences, retards, sanctions, encouragements
- 🚪 **Déconnexion sécurisée**

## 📋 Prérequis

- Node.js v16 ou plus récent
- Un bot Discord configuré
- Accès à l'API École Directe

## ⚙️ Installation

1. **Cloner le projet**
   ```bash
   git clone <votre-repo>
   cd bot-discord-ecoledirecte
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration**
   - Copier `.env.example` vers `.env`
   - Remplir les variables d'environnement :
     ```env
     DISCORD_TOKEN=votre_token_bot_discord
     CLIENT_ID=id_de_votre_application_discord
     GUILD_ID=id_de_votre_serveur_discord (optionnel)
     ECOLEDIRECTE_BASE_URL=https://api.ecoledirecte.com/v3
     ```

4. **Créer votre bot Discord**
   - Aller sur [Discord Developer Portal](https://discord.com/developers/applications)
   - Créer une nouvelle application
   - Aller dans "Bot" et créer un bot
   - Copier le token dans `.env`
   - Inviter le bot sur votre serveur avec les permissions nécessaires

5. **Déployer les commandes**
   ```bash
   node src/deploy-commands.js
   ```

6. **Lancer le bot**
   ```bash
   npm start
   ```

   Ou en mode développement :
   ```bash
   npm run dev
   ```

## 🎯 Commandes disponibles

- `/help` - Affiche l'aide
- `/login` - Se connecter à École Directe
- `/notes` - Voir vos notes
- `/emploi` - Voir l'emploi du temps de la semaine
- `/devoirs` - Voir les devoirs à venir
- `/vie-scolaire` - Voir absences, retards, etc.
- `/logout` - Se déconnecter

## 🔒 Sécurité

- Les identifiants ne sont **jamais stockés** de manière permanente
- Les sessions sont temporaires et en mémoire uniquement
- Toutes les interactions sont éphémères (visibles par vous seul)
- Le bot utilise l'API officielle d'École Directe

## 📁 Structure du projet

```
src/
├── api/
│   └── ecoledirecte.js     # Interface avec l'API École Directe
├── commands/
│   ├── help.js             # Commande d'aide
│   ├── login.js            # Connexion à École Directe
│   ├── notes.js            # Affichage des notes
│   ├── emploi.js           # Emploi du temps
│   ├── devoirs.js          # Liste des devoirs
│   ├── vie-scolaire.js     # Vie scolaire
│   └── logout.js           # Déconnexion
├── events/
│   ├── ready.js            # Événement de démarrage
│   └── interactionCreate.js # Gestion des interactions
├── deploy-commands.js      # Script de déploiement des commandes
└── index.js               # Point d'entrée principal
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## ⚠️ Avertissement

Ce bot utilise l'API non-officielle d'École Directe. Bien qu'elle soit publiquement documentée, son utilisation doit respecter les conditions d'utilisation d'École Directe.

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez que vos identifiants École Directe sont corrects
2. Assurez-vous que le bot a les permissions nécessaires sur Discord
3. Consultez les logs pour plus d'informations sur les erreurs

## 🔗 Liens utiles

- [Documentation Discord.js](https://discord.js.org/)
- [API École Directe](https://github.com/EduWireApps/ecoledirecte-api-docs)
- [Discord Developer Portal](https://discord.com/developers/applications)
