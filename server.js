
const express = require('express');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');

const app = express();
const port = process.env.PORT || 3000;

// Permet de lire le fichier index.html que nous allons créer après
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// La route qui génère le code de couplage
app.get('/pair', async (req, res) => {
    let phone = req.query.number;
    if (!phone) return res.status(400).json({ error: "Numéro manquant" });

    // On crée une session temporaire pour générer le code
    const { state, saveCreds } = await useMultiFileAuthState('temp_session');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    try {
        await delay(2000);
        let code = await sock.requestPairingCode(phone.trim());
        res.json({ code: code });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Erreur WhatsApp" });
    }
});

app.listen(port, () => {
    console.log(`Serveur PROD-XMD lancé sur le port ${port}`);
});
