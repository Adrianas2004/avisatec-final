import { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";

import { router } from "expo-router";
import { updatePassword } from "aws-amplify/auth";
import { Ionicons } from "@expo/vector-icons";

// ─────────────────────────────────────────────
//  Tipos para el modal de feedback
// ─────────────────────────────────────────────
type FeedbackType = "success" | "error" | "warning";

interface FeedbackModal {
  visible: boolean;
  type: FeedbackType;
  title: string;
  message: string;
  onClose?: () => void;
}

const FEEDBACK_CONFIG: Record<
  FeedbackType,
  { icon: string; color: string; bg: string; border: string; iconBg: string }
> = {
  success: {
    icon: "checkmark-circle",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    iconBg: "#d1fae5",
  },
  error: {
    icon: "close-circle",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    iconBg: "#fee2e2",
  },
  warning: {
    icon: "warning",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    iconBg: "#fef3c7",
  },
};

export default function CambiarPasswordScreen() {

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Modal de feedback unificado ──
  const [feedback, setFeedback] = useState<FeedbackModal>({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  function mostrarFeedback(
    type: FeedbackType,
    title: string,
    message: string,
    onClose?: () => void
  ) {
    setFeedback({ visible: true, type, title, message, onClose });
  }

  function cerrarFeedback() {
    const cb = feedback.onClose;
    setFeedback((prev) => ({ ...prev, visible: false, onClose: undefined }));
    cb?.();
  }

  /*
  ========================================
  CAMBIAR PASSWORD
  ========================================
  */
  async function cambiarPassword() {
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        mostrarFeedback(
          "warning",
          "Campos incompletos",
          "Por favor completa todos los campos antes de continuar"
        );
        return;
      }

      if (newPassword !== confirmPassword) {
        mostrarFeedback(
          "warning",
          "Contraseñas distintas",
          "La nueva contraseña y su confirmación no coinciden"
        );
        return;
      }

      if (newPassword.length < 8) {
        mostrarFeedback(
          "warning",
          "Contraseña muy corta",
          "La contraseña debe tener mínimo 8 caracteres"
        );
        return;
      }

      setLoading(true);

      await updatePassword({
        oldPassword: currentPassword,
        newPassword: newPassword,
      });

      mostrarFeedback(
        "success",
        "¡Contraseña actualizada!",
        "Tu contraseña se cambió correctamente",
        () => router.back()
      );

    } catch (error: any) {
      console.log(error);
      mostrarFeedback(
        "error",
        "Error",
        error?.message || "No se pudo cambiar la contraseña"
      );
    } finally {
      setLoading(false);
    }
  }

  const cfg = FEEDBACK_CONFIG[feedback.type];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >

      {/* ========================================
          HEADER
      ======================================== */}
      <View style={styles.headerSection}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <Ionicons name="lock-closed" size={30} color="#fff" />
        </View>

        <Text style={styles.title}>Cambiar contraseña</Text>
        <Text style={styles.subtitle}>
          Mantén tu cuenta segura actualizando tu contraseña
        </Text>

      </View>

      {/* ========================================
          CARD
      ======================================== */}
      <View style={styles.formCard}>

        {/* CONTRASEÑA ACTUAL */}
        <Text style={styles.label}>Contraseña actual</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={18} color="#059669" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            secureTextEntry={!showCurrentPassword}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Ingresa tu contraseña actual"
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity
            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#6b7280"
            />
          </TouchableOpacity>
        </View>

        {/* NUEVA CONTRASEÑA */}
        <Text style={styles.label}>Nueva contraseña</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#059669" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            secureTextEntry={!showNewPassword}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity
            onPress={() => setShowNewPassword(!showNewPassword)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showNewPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#6b7280"
            />
          </TouchableOpacity>
        </View>

        {/* CONFIRMAR CONTRASEÑA */}
        <Text style={styles.label}>Confirmar contraseña</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#059669" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repite tu nueva contraseña"
            placeholderTextColor="#9ca3af"
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

        {/* INFO BOX */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color="#059669" />
          <Text style={styles.infoText}>
            Usa una contraseña segura con letras, números y símbolos.
          </Text>
        </View>

        {/* BOTÓN */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={cambiarPassword}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Guardar contraseña</Text>
            </>
          )}
        </TouchableOpacity>

      </View>

      {/* ========================================
          MODAL — FEEDBACK (éxito / error / aviso)
      ======================================== */}
      <Modal visible={feedback.visible} transparent animationType="fade">
        <Pressable style={styles.feedbackOverlay} onPress={cerrarFeedback}>
          <Pressable style={styles.feedbackCard}>

            <View style={[styles.feedbackIconCircle, { backgroundColor: cfg.iconBg, borderColor: cfg.border }]}>
              <Ionicons name={cfg.icon as any} size={38} color={cfg.color} />
            </View>

            <Text style={[styles.feedbackTitle, { color: cfg.color }]}>{feedback.title}</Text>
            <Text style={styles.feedbackMessage}>{feedback.message}</Text>

            <TouchableOpacity
              style={[styles.feedbackButton, { backgroundColor: cfg.color }]}
              onPress={cerrarFeedback}
              activeOpacity={0.85}
            >
              <Text style={styles.feedbackButtonText}>Entendido</Text>
            </TouchableOpacity>

          </Pressable>
        </Pressable>
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

  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
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
    marginBottom: 8,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  /* ── CARD ── */
  formCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 28,
    padding: 24,
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

  /* ── INFO BOX ── */
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ecfdf5",
    borderRadius: 14,
    padding: 14,
    marginTop: 20,
    marginBottom: 4,
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#a7f3d0",
  },

  infoText: {
    flex: 1,
    color: "#065f46",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 21,
  },

  /* ── BOTÓN ── */
  button: {
    backgroundColor: "#059669",
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 22,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
    gap: 10,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.3,
  },

  /* ── MODAL FEEDBACK ── */
  feedbackOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  feedbackCard: {
    backgroundColor: "#fff",
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },

  feedbackIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    marginBottom: 20,
  },

  feedbackTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },

  feedbackMessage: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },

  feedbackButton: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  feedbackButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});