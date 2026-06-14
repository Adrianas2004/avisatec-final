import "../awsConfig";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import {
  View,
  StyleSheet,
  Platform,
  ImageBackground,
} from "react-native";

import {
  Stack,
  router,
} from "expo-router";

import { StatusBar } from "expo-status-bar";

import "react-native-reanimated";

import { useEffect } from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";

import * as Notifications from "expo-notifications";

import {
  saveNotification,
} from "../lib/notificationsStorage";



/*
========================================
NOTIFICATION HANDLER
========================================
*/
Notifications.setNotificationHandler({

  handleNotification: async () => ({

    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,

  }),

});



/*
========================================
ANDROID CHANNEL
========================================
*/
Notifications.setNotificationChannelAsync(
  "default",
  {
    name: "default",

    importance:
      Notifications.AndroidImportance.MAX,
  }
);





export default function RootLayout() {

  /*
  ========================================
  EFFECTS
  ========================================
  */
  useEffect(() => {

    /*
    ========================================
    ANDROID NOTIFICATIONS
    ========================================
    */
    if (Platform.OS === "android") {

      Notifications.setNotificationChannelAsync(
        "default",
        {
          name: "default",

          importance:
            Notifications.AndroidImportance.MAX,

          vibrationPattern: [0, 250, 250, 250],

          lightColor: "#2563eb",

          enableVibrate: true,

          enableLights: true,

          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC,

        }
      );

    }




    /*
========================================
GUARDAR NOTIFICACIONES
========================================
*/
    const receivedListener =
      Notifications.addNotificationReceivedListener(
        async (notification) => {

          const data =
            notification.request.content.data;

          const nuevaNotificacion = {

            id: Date.now().toString(),

            title:
              notification.request.content.title,

            body:
              notification.request.content.body,

            data,

            createdAt:
              new Date().toISOString(),

          };

          await saveNotification(
            nuevaNotificacion

            
          );



          console.log(
            "NOTIFICACION GUARDADA"
          );

        }
      );







    /*
    ========================================
    OPEN COURSE FROM NOTIFICATION
    ========================================
    */
    const responseListener =
      Notifications.addNotificationResponseReceivedListener(
        (response) => {

          const data =
            response.notification.request.content.data;

          console.log(
            "NOTIFICACIÓN TOCADA:"
          );

          console.log(data);

          /*
          ========================================
          ABRIR CURSO
          ========================================
          */
          if (
            data.tipo === "nuevo_curso"
            && data.courseId
          ) {

            router.push(
              `/curso/${data.courseId}`
            );

          }

          /*
          ========================================
          ABRIR AVISO
          ========================================
          */
          if (
            data.tipo === "nuevo_aviso"
            && data.avisoId
          ) {

            router.push(
              `/aviso/${data.avisoId}`
            );

          }

        }
      );

    return () => {

      receivedListener.remove();

      responseListener.remove();

    };

  }, []);




  const colorScheme =
    useColorScheme();




  return (

    <ThemeProvider
      value={
        colorScheme === "dark"
          ? DarkTheme
          : DefaultTheme
      }
    >

      {/* ========================================
          FONDO GLOBAL
      ======================================== */}
      <ImageBackground
        source={require("../assets/patterns/bg-pattern.png")}
        resizeMode="repeat"
        style={styles.background}
      >

        {/* ========================================
            APP
        ======================================== */}
        <View style={styles.overlay}>

          <Stack
            screenOptions={{

              headerShown: false,

              contentStyle: {
                backgroundColor: "transparent",
              },

            }}
          >

            <Stack.Screen name="index" />

            <Stack.Screen name="login" />

            <Stack.Screen name="register" />

            <Stack.Screen name="confirm" />

            <Stack.Screen name="(tabs)" />

            <Stack.Screen name="curso/[id]" />

            <Stack.Screen name="aviso/[id]" />

            <Stack.Screen
              name="modal"
              options={{
                presentation: "modal",
              }}
            />

          </Stack>

        </View>

      </ImageBackground>

      <StatusBar style="auto" />

    </ThemeProvider>

  );

}





/*
========================================
STYLES
========================================
*/
const styles = StyleSheet.create({

  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
  },

});