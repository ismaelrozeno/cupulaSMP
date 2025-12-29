const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Rcon } = require('rcon-client');

admin.initializeApp();

// --- CONFIGURAÇÕES DO SERVIDOR MINECRAFT ---
const RCON_HOST = 'SEU_IP_DO_SERVIDOR'; // Ex: 192.168.1.50 ou jogar.acupula.com.br
const RCON_PORT = 25575;                // Porta definida no server.properties
const RCON_PASSWORD = 'SUA_SENHA_RCON'; // Senha definida no server.properties

exports.autoWhitelist = functions.firestore
    .document('artifacts/{appId}/users/{userId}/profile/data')
    .onCreate(async (snap, context) => {
        const userData = snap.data();
        const nick = userData.minecraftNick;

        if (!nick) {
            console.log('Nenhum nick encontrado para whitelist.');
            return null;
        }

        console.log(`Iniciando whitelist para: ${nick}`);

        try {
            const rcon = await Rcon.connect({
                host: RCON_HOST,
                port: RCON_PORT,
                password: RCON_PASSWORD,
                timeout: 5000
            });

            // Envia o comando para o console do servidor
            const response = await rcon.send(`whitelist add ${nick}`);
            console.log(`Resposta do Servidor: ${response}`);

            await rcon.end();

            // Atualiza o status no banco de dados para sucesso
            return snap.ref.update({ 
                whitelistStatus: 'success',
                whitelistResponse: response,
                whitelistedAt: admin.firestore.FieldValue.serverTimestamp()
            });

        } catch (error) {
            console.error('Erro na conexão RCON:', error);
            return snap.ref.update({ whitelistStatus: 'error', whitelistError: error.message });
        }
    });