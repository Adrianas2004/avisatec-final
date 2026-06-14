import * as Notifications from "expo-notifications";

import * as Device from "expo-device";

import Constants from "expo-constants";

import { Platform } from "react-native";

import axios from "axios";

import { getCurrentUser } from "aws-amplify/auth";

import { API_URL } from "../constants/api";



/*
========================================
CONFIGURAR NOTIFICACIONES
========================================
*/

Notifications.setNotificationHandler({

  handleNotification: async () => ({

    shouldShowAlert: true,

    shouldPlaySound: true,

    shouldSetBadge: true,

    shouldShowBanner: true,

    shouldShowList: true,

  }),

});



/*
========================================
OBTENER TOKEN
========================================
*/

export async function registerForPushNotificationsAsync() {

  let token;



  try {

    /*
    ========================================
    SOLO DISPOSITIVOS REALES
    ========================================
    */

    if (Device.isDevice) {

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus =
        existingStatus;



      /*
      ========================================
      PEDIR PERMISO
      ========================================
      */

      if (existingStatus !== "granted") {

        const { status } =
          await Notifications.requestPermissionsAsync();

        finalStatus = status;

      }



      /*
      ========================================
      SI NO ACEPTÓ
      ========================================
      */

      if (finalStatus !== "granted") {

        alert(
          "No se otorgaron permisos para notificaciones"
        );

        return null;

      }



      /*
      ========================================
      OBTENER EXPO TOKEN
      ========================================
      */

      token = (
        await Notifications.getExpoPushTokenAsync({

          projectId:
            Constants.expoConfig?.extra?.eas?.projectId,

        })

      ).data;

      console.log("EXPO PUSH TOKEN:");

      console.log(token);



      /*
      ========================================
      GUARDAR TOKEN EN BACKEND
      ========================================
      */

      const currentUser =
        await getCurrentUser();

      const cognitoSub =
        currentUser.userId;



      /*
      ========================================
      OBTENER USUARIO POSTGRESQL
      ========================================
      */

      const response =
        await axios.get(
          `${API_URL}/users/${cognitoSub}`
        );

      const usuario =
        response.data.user;



      /*
      ========================================
      GUARDAR TOKEN
      ========================================
      */

      await axios.put(
        `${API_URL}/users/push-token/${usuario.id}`,
        {
          expo_push_token: token,
        }
      );

      console.log(
        "TOKEN GUARDADO EN POSTGRESQL"
      );

    } else {

      alert(
        "Las notificaciones requieren dispositivo físico"
      );

    }



    /*
    ========================================
    ANDROID CHANNEL
    ========================================
    */

    if (Platform.OS === "android") {

      await Notifications.setNotificationChannelAsync(
        "default",
        {

          name: "default",

          importance:
            Notifications.AndroidImportance.MAX,

          vibrationPattern: [
            0,
            250,
            250,
            250,
          ],

          lightColor: "#2563eb",

        }
      );

    }

    return token;

  } catch (error) {

    console.log(
      "ERROR PUSH NOTIFICATIONS:"
    );

    console.log(error);

    return null;

  }

}