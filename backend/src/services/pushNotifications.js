const { Expo } = require("expo-server-sdk");

const expo = new Expo();

async function enviarNotificacionPush(tokens, titulo, mensaje, data = {}) {

  try {

    if (!tokens.length) return;

    const messages = [];

    for (const token of tokens) {

      if (!Expo.isExpoPushToken(token)) {
        console.log(`Token inválido: ${token}`);
        continue;
      }

      messages.push({
        to: token,

        sound: "default",

        title: titulo,

        body: mensaje,

        data,

        priority: "high",

        channelId: "default",
      });

    }

    const chunks = expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {

      try {

        await expo.sendPushNotificationsAsync(chunk);

      } catch (error) {

        console.log("Error enviando chunk:");
        console.log(error);

      }

    }

    console.log("Push notifications enviadas");

  } catch (error) {

    console.log("Error push notifications:");
    console.log(error);

  }

}

module.exports = {
  enviarNotificacionPush,
};