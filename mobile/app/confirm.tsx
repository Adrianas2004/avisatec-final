import { useState } from "react";

import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
  ScrollView,
  Modal,
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";
import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import { Ionicons } from "@expo/vector-icons";

export default function ConfirmScreen() {
  const { email, isTeacher } = useLocalSearchParams();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

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

  /*
  ========================================
  CONFIRMAR CUENTA
  ========================================
  */
  async function handleConfirm() {
    try {
      if (!code.trim()) {
        showAlert("Error", "Ingresa el código");
        return;
      }

      setLoading(true);

      const result = await confirmSignUp({
        username: String(email),
        confirmationCode: code,
      });

      console.log("CONFIRMADO:");
      console.log(result);

      /*
      ========================================
      SI ES MAESTRO
      ========================================
      */
      if (isTeacher === "true") {
        showAlert(
          "Cuenta enviada",
          "Tu cuenta fue enviada para validación.\n\nUn administrador deberá autorizar el acceso.",
          "success",
          () => {
            setModalVisible(false);
            router.replace("/login" as any);
          }
        );
        return;
      }

      /*
      ========================================
      SI ES ALUMNO
      ========================================
      */
      showAlert(
        "Cuenta confirmada",
        "Ahora puedes iniciar sesión",
        "success",
        () => {
          setModalVisible(false);
          router.replace("/login" as any);
        }
      );
    } catch (error: any) {
      console.log(error);
      showAlert("Error", error?.message || "No se pudo confirmar", "error");
    } finally {
      setLoading(false);
    }
  }

  /*
  ========================================
  REENVIAR CODIGO
  ========================================
  */
  async function handleResendCode() {
    try {
      await resendSignUpCode({ username: String(email) });
      showAlert("Código reenviado", "Revisa tu correo", "success");
    } catch (error: any) {
      console.log(error);
      showAlert("Error", error?.message || "No se pudo reenviar", "error");
    }
  }

  /*
  ========================================
  UI
  ========================================
  */
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
          <Ionicons name="mail-unread" size={30} color="#fff" />
        </View>
        <Text style={styles.title}>Confirma tu cuenta</Text>
        <Text style={styles.subtitle}>Enviamos un código a</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      {/* ========================================
          CARD
      ======================================== */}
      <View style={styles.card}>

        {/* AVISO MAESTRO */}
        {isTeacher === "true" && (
          <View style={styles.teacherBox}>
            <View style={styles.teacherRow}>
              <Ionicons name="time-outline" size={18} color="#92400e" />
              <Text style={styles.teacherText}>Registro como maestro</Text>
            </View>
            <Text style={styles.teacherSubtext}>
              Después de confirmar tu cuenta, deberá ser validada por un administrador.
            </Text>
          </View>
        )}

        {/* INPUT CÓDIGO */}
        <Text style={styles.label}>Código de verificación</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="keypad-outline" size={18} color="#059669" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="000000"
            placeholderTextColor="#9ca3af"
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
            maxLength={6}
          />
        </View>

        {/* BOTÓN CONFIRMAR */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleConfirm}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Confirmar cuenta</Text>
            </>
          )}
        </TouchableOpacity>

        {/* REENVIAR CÓDIGO */}
        <TouchableOpacity
          onPress={handleResendCode}
          style={styles.resendButton}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={16} color="#059669" />
          <Text style={styles.resendText}>Reenviar código</Text>
        </TouchableOpacity>

      </View>

      {/* VOLVER AL LOGIN */}
      <TouchableOpacity
        onPress={() => router.replace("/login" as any)}
        style={styles.linkContainer}
      >
        <Ionicons name="arrow-back-outline" size={15} color="rgba(255,255,255,0.85)" />
        <Text style={styles.linkText}>Volver al inicio de sesión</Text>
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
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  subtitle: {
    fontSize: 20,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  email: {
    fontSize: 18,
    fontWeight: "700",
    color: "#34d399",
    marginTop: 5,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  /* ── CARD ── */
  card: {
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

  /* ── AVISO MAESTRO ── */
  teacherBox: {
    backgroundColor: "#fef3c7",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "#fde68a",
  },

  teacherRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },

  teacherText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#92400e",
  },

  teacherSubtext: {
    fontSize: 13,
    color: "#78350f",
    lineHeight: 20,
  },

  /* ── INPUT ── */
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 2,
    letterSpacing: 0.3,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 20,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: 10,
  },

  /* ── BOTÓN ── */
  button: {
    backgroundColor: "#059669",
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
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

  /* ── REENVIAR ── */
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 6,
  },

  resendText: {
    color: "#059669",
    fontWeight: "600",
    fontSize: 15,
  },

  /* ── LINK VOLVER ── */
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  linkText: {
    fontSize: 18,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "bold",
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