import { useState } from "react";

import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  View,
  Modal,
} from "react-native";

import { router } from "expo-router";
import { signUp } from "aws-amplify/auth";
import { Ionicons } from "@expo/vector-icons";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Modal personalizado ──
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    type: "success" | "error";
    onClose: () => void;
  }>({
    title: "",
    message: "",
    type: "error",
    onClose: () => {},
  });

  function showAlert(
    title: string,
    message: string,
    type: "success" | "error" = "error",
    onClose?: () => void
  ) {
    setModalConfig({
      title,
      message,
      type,
      onClose: onClose || (() => setModalVisible(false)),
    });
    setModalVisible(true);
  }

  async function handleRegister() {
    try {
      if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
        showAlert("Error", "Completa todos los campos");
        return;
      }

      if (password !== confirmPassword) {
        showAlert("Error", "Las contraseñas no coinciden");
        return;
      }

      if (password.length < 8) {
        showAlert("Error", "La contraseña debe tener mínimo 8 caracteres");
        return;
      }

      if (!isTeacher) {
        const alumnoRegex = /^L\d{8}@tehuacan\.tecnm\.mx$/;
        if (!alumnoRegex.test(email.trim())) {
          showAlert("Correo inválido", "Debes usar tu correo institucional de alumno.");
          return;
        }
      }

      if (isTeacher) {
        if (!email.trim().endsWith("@tehuacan.tecnm.mx")) {
          showAlert("Correo inválido", "Debes usar un correo institucional.");
          return;
        }
      }

      setLoading(true);
      console.log("Intentando registrar usuario...");

      const result = await signUp({
        username: email.trim(),
        password,
        options: {
          userAttributes: {
            email: email.trim(),
          },
        },
      });

      console.log("REGISTRO EXITOSO:");
      console.log(result);

      showAlert(
        "Código enviado",
        "Revisa tu correo institucional",
        "success",
        () => {
          setModalVisible(false);
          router.push({
            pathname: "/confirm" as any,
            params: {
              email: email.trim(),
              isTeacher: isTeacher ? "true" : "false",
            },
          });
        }
      );
    } catch (error: any) {
      console.log("ERROR REGISTER:");
      console.log(error);
      showAlert("Error", error?.message || "No se pudo registrar", "error");
    } finally {
      setLoading(false);
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
          <Ionicons name="person-add" size={30} color="#fff" />
        </View>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Regístrate para continuar</Text>
      </View>

      {/* ========================================
          CARD
      ======================================== */}
      <View style={styles.formCard}>

        {/* Email */}
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

        {/* Contraseña */}
        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={18} color="#059669" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Mínimo 8 caracteres"
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

        {/* Confirmar contraseña */}
        <Text style={styles.label}>Confirmar contraseña</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={18} color="#059669" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Repite tu contraseña"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#6b7280"
            />
          </TouchableOpacity>
        </View>

        {/* ========================================
            CHECKBOX MAESTRO
        ======================================== */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIsTeacher(!isTeacher)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, isTeacher && styles.checkboxActive]}>
            {isTeacher && (
              <Ionicons name="checkmark" size={14} color="#fff" />
            )}
          </View>
          <View style={styles.checkboxTextGroup}>
            <Text style={styles.checkboxText}>Soy maestro</Text>
            <Text style={styles.checkboxSubtext}>
              {isTeacher
                ? "Tu cuenta deberá ser validada por un administrador."
                : "Usa tu correo institucional de alumno."}
            </Text>
          </View>
        </TouchableOpacity>

        {/* ========================================
            BOTON
        ======================================== */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Registrarse</Text>
            </>
          )}
        </TouchableOpacity>

      </View>

      {/* ========================================
          LINK LOGIN
      ======================================== */}
      <TouchableOpacity
        onPress={() => router.push("/login" as any)}
        style={styles.linkContainer}
      >
        <Text style={styles.linkText}>¿Ya tienes cuenta? </Text>
        <Text style={styles.linkBold}>Inicia sesión</Text>
      </TouchableOpacity>

      {/* ========================================
          MODAL PERSONALIZADO
      ======================================== */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            {/* Ícono: verde para éxito, rojo para error */}
            <View
              style={[
                styles.modalIconCircle,
                modalConfig.type === "success"
                  ? styles.modalIconSuccess
                  : styles.modalIconError,
              ]}
            >
              <Ionicons
                name={
                  modalConfig.type === "success"
                    ? "checkmark-circle-outline"
                    : "alert-circle-outline"
                }
                size={32}
                color="#fff"
              />
            </View>

            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <Text style={styles.modalMessage}>{modalConfig.message}</Text>

            <TouchableOpacity
              style={[
                styles.modalButton,
                modalConfig.type === "success"
                  ? styles.modalButtonSuccess
                  : styles.modalButtonError,
              ]}
              onPress={modalConfig.onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  /* ── HEADER ── */
  headerSection: {
    alignItems: "center",
    marginBottom: 26,
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
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  /* ── CARD ── */
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

  /* ── CHECKBOX ── */
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 20,
    marginBottom: 4,
    padding: 14,
    backgroundColor: "#ecfdf5",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#a7f3d0",
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 1,
    backgroundColor: "#fff",
  },

  checkboxActive: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },

  checkboxTextGroup: {
    flex: 1,
  },

  checkboxText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "700",
    marginBottom: 3,
  },

  checkboxSubtext: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 19,
  },

  /* ── BOTÓN ── */
  button: {
    backgroundColor: "#059669",
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 24,
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
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 8,
    letterSpacing: 0.3,
  },

  /* ── LINK ── */
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  linkText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  linkBold: {
    fontSize: 16,
    color: "#34d399",
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  /* ── MODAL ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },

  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
  },

  modalIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  modalIconSuccess: {
    backgroundColor: "#059669",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  modalIconError: {
    backgroundColor: "#dc2626",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
    textAlign: "center",
  },

  modalMessage: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 28,
  },

  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 52,
    borderRadius: 14,
  },

  modalButtonSuccess: {
    backgroundColor: "#059669",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },

  modalButtonError: {
    backgroundColor: "#dc2626",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },

  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.8,
  },
});