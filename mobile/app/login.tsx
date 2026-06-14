import { useState } from "react";
import { useEffect } from "react";
import { validarAcceso }
  from "../lib/validarAcceso";

import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  View,
} from "react-native";

import { router } from "expo-router";
import { API_URL } from "../constants/api";
import { signIn, signOut, getCurrentUser } from "aws-amplify/auth";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {

    async function checkSession() {

      try {

        const user = await getCurrentUser();

        console.log("SESION ACTIVA");

        console.log(user);

      } catch {

        console.log("SIN SESION");

      }

    }

    checkSession();

  }, []);

  /*
  ========================================
  LOGIN
  ========================================
  */
  async function handleLogin() {

    try {

      if (
        !email.trim() ||
        !password.trim()
      ) {

        Alert.alert(
          "Error",
          "Completa todos los campos"
        );

        return;

      }

      setLoading(true);

      //AQUI REMPLACE ESTO 

      //await signIn({
        //username: email.trim(),
        //password,
      //});

      const result = await signIn({
        username: email.trim(),
        password,
      });

      /*
      ========================================
      CUENTA SIN CONFIRMAR
      ========================================
      */
      if (
        result.nextStep?.signInStep ===
        "CONFIRM_SIGN_UP"
      ) {

        Alert.alert(
          "Cuenta sin confirmar",
          "Debes confirmar tu correo antes de iniciar sesión."
        );

        router.push({
          pathname: "/confirm",
          params: {
            email: email.trim(),
          },
        });

        return;

      }

      /*
      ========================================
      LOGIN EXITOSO
      ========================================
      */
      if (result.isSignedIn) {

        await validarAcceso(
          router,
          email.trim()
        );

      }

    } catch (error: any) {

      if (__DEV__) {
        console.log(error);
      }

     

      /*
      ========================================
      CREDENCIALES INCORRECTAS
      ========================================
      */
      if (
        error?.name ===
        "NotAuthorizedException"
      ) {

        Alert.alert(
          "Error",
          "Correo o contraseña incorrectos"
        );

        return;

      }

      /*
      ========================================
      USUARIO NO EXISTE
      ========================================
      */
      if (
        error?.name ===
        "UserNotFoundException"
      ) {

        Alert.alert(
          "Error",
          "La cuenta no existe"
        );

        return;

      }

      Alert.alert(
        "Error",
        error?.message ||
        "No se pudo iniciar sesión"
      );

    } finally {

      setLoading(false);

    }

  }

  /*
  ========================================
  FORCE LOGOUT
  ========================================
  */
  async function handleForceLogout() {
    try {
      await signOut({ global: true });
      Alert.alert("Sesión cerrada", "Ahora puedes iniciar sesión nuevamente");
    } catch (error) {
      console.log(error);
      Alert.alert("Info", "No había sesión activa");
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >

      {/* ========================================
          HEADER
      ======================================== */}
      <View style={styles.headerSection}>
        <View style={styles.iconCircle}>
          <Ionicons name="school" size={32} color="#fff" />
        </View>
        <Text style={styles.title}>AvisaTec</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
      </View>

      {/* ========================================
          FORM CARD
      ======================================== */}
      <View style={styles.formCard}>

        {/* EMAIL */}
        <Text style={styles.label}>Correo institucional</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={18} color="#059669" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="L00000000@tehuacan.tecnm.mx"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* PASSWORD */}
        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={18} color="#059669" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Tu contraseña"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#6b7280"
            />
          </TouchableOpacity>
        </View>

        {/* INFO */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color="#059669" />
          <Text style={styles.infoText}>
            Usa tu correo institucional @tehuacan.tecnm.mx
          </Text>
        </View>

        {/* ========================================
            LOGIN BUTTON
        ======================================== */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="log-in-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Entrar</Text>
            </>
          )}
        </TouchableOpacity>

        {/* ========================================
            FORCE LOGOUT
        ======================================== */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleForceLogout}
          activeOpacity={0.85}
        >
          <Ionicons name="power-outline" size={18} color="#dc2626" />
          <Text style={styles.logoutButtonText}>Cerrar sesión actual</Text>
        </TouchableOpacity>

      </View>

      {/* ========================================
          REGISTER LINK
      ======================================== */}
      <TouchableOpacity
        onPress={() => router.replace("/register" as any)}
        style={styles.linkContainer}
      >
        <Text style={styles.linkText}>¿No tienes cuenta? </Text>
        <Text style={styles.linkBold}>Regístrate</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  /* igual que register.tsx — sin backgroundColor para ver el patrón */
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  /* ── HEADER ── */
  headerSection: {
    alignItems: "center",
    marginBottom: 28,
  },

  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  subtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.85)",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  /* ── CARD — idéntica a register.tsx ── */
  formCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 28,
    padding: 24,
    marginBottom: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
    marginLeft: 2,
    letterSpacing: 0.3,
  },

  /* ── INPUTS ── */
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: "#111827",
  },

  eyeButton: {
    padding: 6,
  },

  /* ── INFO BOX — verde en lugar de azul ── */
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    padding: 12,
    borderRadius: 14,
    marginTop: 18,
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#a7f3d0",
  },

  infoText: {
    color: "#065f46",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },

  /* ── BOTÓN ENTRAR ── */
  button: {
    backgroundColor: "#059669",
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 20,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    marginLeft: 8,
    letterSpacing: 0.3,
  },

  /* ── BOTÓN CERRAR SESIÓN — se mantiene rojo, solo ajuste visual ── */
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: "#fecaca",
    backgroundColor: "#fff5f5",
    gap: 8,
  },

  logoutButtonText: {
    color: "#dc2626",
    fontWeight: "700",
    fontSize: 15,
  },

  /* ── LINK ── */
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  linkText: {
    fontSize: 17,
    color: "rgba(255,255,255,0.85)",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  linkBold: {
    fontSize: 17,
    color: "#34d399",
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
});