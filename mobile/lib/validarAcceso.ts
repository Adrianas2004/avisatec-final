import { getCurrentUser } from "aws-amplify/auth";
import { API_URL } from "../constants/api";

export async function validarAcceso(
  router: any,
  email?: string
) {
  try {

    const currentUser =
      await getCurrentUser();

    const cognitoSub =
      currentUser.userId;

    /*
    Obtener email real de Cognito
    */
    const userEmail =
      email ||
      currentUser.signInDetails?.loginId ||
      "";

    const response =
      await fetch(
        `${API_URL}/users/${cognitoSub}`
      );

    const data =
      await response.json();

    /*
    ========================================
    NO EXISTE EN POSTGRESQL
    ========================================
    */
    if (!data.exists) {

      const alumnoRegex =
        /^L\d{8}@tehuacan\.tecnm\.mx$/i;

      const esAlumno =
        alumnoRegex.test(userEmail);

      router.replace({
        pathname: "/completarPerfil",
        params: {
          cognito_sub: cognitoSub,
          email: userEmail,
          soy_maestro:
            (!esAlumno).toString(),
        },
      });

      return false;
    }

    const usuario =
      data.user;

    /*
    ========================================
    PENDIENTE DE VALIDACION
    ========================================
    */
    if (
      usuario.rol === "pendiente"
    ) {

      router.replace(
        "/enValidacion"
      );

      return false;
    }

    /*
    ========================================
    ADMIN
    ========================================
    */
    if (
      usuario.rol === "admin"
    ) {

      router.replace(
        "/(tabs)"
      );

      return false;
    }

    /*
    ========================================
    INTERESES
    ========================================
    */
    const interestsResponse =
      await fetch(
        `${API_URL}/users/${cognitoSub}/intereses`
      );

    const interestsData =
      await interestsResponse.json();

    if (
      !interestsData.hasInterests
    ) {

      router.replace({
        pathname:
          "/seleccionarIntereses",

        params: {
          usuario_id:
            interestsData.usuario_id,
        },
      });

      return false;
    }

    /*
    ========================================
    TODO CORRECTO
    ========================================
    */
    router.replace("/(tabs)");

    return true;

  } catch (error) {

    console.log(
      "ERROR VALIDANDO ACCESO:"
    );

    console.log(error);

    router.replace("/login");

    return false;
  }
}