import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "avisatec_notifications";

/*
========================================
GUARDAR NOTIFICACION
========================================
*/
export async function saveNotification(notification: any) {

  try {

    const existing =
      await AsyncStorage.getItem(STORAGE_KEY);

    let notifications = existing
      ? JSON.parse(existing)
      : [];

    /*
    ========================================
    AGREGAR NUEVA AL INICIO
    ========================================
    */
    notifications.unshift({
      ...notification,
      read: false,
    });

    /*
    ========================================
    LIMITE 50 NOTIFICACIONES
    ========================================
    */
    notifications = notifications.slice(0, 50);

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(notifications)
    );

  } catch (error) {

    console.log(
      "ERROR GUARDANDO NOTIFICACION:"
    );

    console.log(error);

  }

}

/*
========================================
OBTENER NOTIFICACIONES
========================================
*/
export async function getNotifications() {

  try {

    const data =
      await AsyncStorage.getItem(STORAGE_KEY);

    return data
      ? JSON.parse(data)
      : [];

  } catch (error) {

    console.log(
      "ERROR OBTENIENDO NOTIFICACIONES:"
    );

    console.log(error);

    return [];

  }

}

/*
========================================
ELIMINAR TODAS
========================================
*/
export async function clearNotifications() {

  try {

    await AsyncStorage.removeItem(
      STORAGE_KEY
    );

  } catch (error) {

    console.log(
      "ERROR ELIMINANDO NOTIFICACIONES:"
    );

    console.log(error);

  }

}


/*
========================================
MARCAR COMO LEIDA
========================================
*/
export async function markAsRead(
  notificationId: string
) {

  try {

    const existing =
      await AsyncStorage.getItem(STORAGE_KEY);

    let notifications =
      existing
        ? JSON.parse(existing)
        : [];

    notifications =
      notifications.map((item: any) => {

        if (item.id === notificationId) {

          return {
            ...item,
            read: true,
          };

        }

        return item;

      });

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(notifications)
    );

  } catch (error) {

    console.log(
      "ERROR MARCANDO NOTIFICACION:"
    );

    console.log(error);

  }

}


/*
========================================
ELIMINAR UNA NOTIFICACION
========================================
*/
export async function deleteNotification(
  notificationId: string
) {

  try {

    const existing =
      await AsyncStorage.getItem(STORAGE_KEY);

    let notifications =
      existing
        ? JSON.parse(existing)
        : [];

    notifications =
      notifications.filter(
        (item: any) =>
          item.id !== notificationId
      );

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(notifications)
    );

  } catch (error) {

    console.log(
      "ERROR ELIMINANDO NOTIFICACION:"
    );

    console.log(error);

  }

}
