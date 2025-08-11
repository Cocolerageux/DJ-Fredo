# 🔍 Diagnostic de l'API École Directe

## 📋 Résumé du problème

Après des tests exhaustifs, nous avons identifié que **l'API École Directe est inaccessible** depuis votre établissement scolaire.

## ✅ Ce qui fonctionne

- ✅ **Bot Discord** : Opérationnel et connecté
- ✅ **Serveur École Directe** : Accessible (api.ecoledirecte.com)
- ✅ **Cookie GTK** : Récupéré correctement
- ✅ **Identifiants** : Valides sur le site web
- ✅ **Format des requêtes** : Conforme à la documentation officielle

## ❌ Ce qui ne fonctionne pas

- ❌ **Authentification API** : Code 505 persistant
- ❌ **Toutes les variations testées** : Échec systématique

## 🧪 Tests effectués

### 1. Formats d'authentification
- ✅ Format JSON standard
- ✅ URL-encoded
- ✅ Avec/sans GTK
- ✅ Différentes versions d'API (4.50.0 à 4.75.0)
- ✅ Headers navigateur complets
- ✅ Gestion des caractères spéciaux

### 2. Variations d'identifiants
- ✅ `c.champagne`
- ✅ `C.CHAMPAGNE`
- ✅ Avec encodage URL
- ✅ Formats alternatifs

### 3. Tests de connectivité
- ✅ Serveur principal accessible
- ✅ Cookie GTK récupéré
- ✅ Site web fonctionnel

## 💡 Causes probables

### 1. **Restriction d'établissement** (le plus probable)
Votre établissement a désactivé l'accès à l'API École Directe pour des raisons de sécurité.

### 2. **Géoblocage IP**
L'API pourrait être restreinte à certaines plages d'IP ou localisations.

### 3. **Type de compte**
Certains établissements limitent l'API aux comptes administrateurs uniquement.

### 4. **Authentification renforcée**
Un mécanisme 2FA ou de vérification supplémentaire pourrait être requis.

## 🔧 Solutions possibles

### Option 1 : Contact établissement
Contactez votre établissement pour demander :
- L'activation de l'API École Directe
- Les restrictions en place
- Les conditions d'accès

### Option 2 : Utilisation du site web
Continuez à utiliser : https://www.ecoledirecte.com

### Option 3 : Test depuis une autre connexion
Essayez depuis :
- Un autre réseau Internet
- Un VPN
- Un autre lieu géographique

## 📊 Codes d'erreur rencontrés

| Code | Message | Signification |
|------|---------|---------------|
| 505  | Identifiant et/ou mot de passe invalide | Authentification refusée |
| 200  | -       | Serveur accessible |
| 404  | -       | Endpoint inexistant (normal) |

## 🛠️ État actuel du bot

Le bot a été modifié pour :
- ✅ Informer de la limitation détectée
- ✅ Fournir des solutions alternatives
- ✅ Rediriger vers le site web officiel
- ✅ Expliquer la situation technique

## 📞 Support

Si vous souhaitez continuer le développement :

1. **Contactez votre établissement** pour l'accès API
2. **Testez depuis un autre réseau** 
3. **Vérifiez les paramètres de sécurité** de votre compte

## 🔗 Ressources utiles

- [Site École Directe](https://www.ecoledirecte.com)
- [Documentation API officielle](https://github.com/EduWireApps/ecoledirecte-api-docs)
- [Code source du bot](./src/)

---

**Note** : Ce diagnostic a été réalisé en suivant scrupuleusement la documentation officielle de l'API École Directe v3.
