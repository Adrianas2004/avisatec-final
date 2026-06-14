import { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Modal,
  Pressable,
  TouchableOpacity,
} from "react-native";

import axios from "axios";
import { getCurrentUser } from "aws-amplify/auth";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../constants/api";
import { router } from "expo-router";

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
  { icon: string; color: string; border: string; iconBg: string }
> = {
  success: { icon: "checkmark-circle", color: "#059669", border: "#a7f3d0", iconBg: "#d1fae5" },
  error:   { icon: "close-circle",     color: "#dc2626", border: "#fecaca", iconBg: "#fee2e2" },
  warning: { icon: "warning",          color: "#d97706", border: "#fde68a", iconBg: "#fef3c7" },
};

export default function PerfilScreen() {
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [feedback, setFeedback] = useState<FeedbackModal>({
    visible: false, type: "error", title: "", message: "",
  });

  function mostrarFeedback(type: FeedbackType, title: string, message: string, onClose?: () => void) {
    setFeedback({ visible: true, type, title, message, onClose });
  }

  function cerrarFeedback() {
    const cb = feedback.onClose;
    setFeedback((prev) => ({ ...prev, visible: false, onClose: undefined }));
    cb?.();
  }

  useEffect(() => {
    obtenerUsuario();
  }, []);

  async function obtenerUsuario() {
    try {
      const currentUser = await getCurrentUser();
      const cognitoSub = currentUser.userId;
      const response = await axios.get(`${API_URL}/users/${cognitoSub}`);
      setUsuario(response.data.user);
    } catch (error) {
      console.log(error);
      mostrarFeedback("error", "Error", "No se pudo cargar el perfil");
    } finally {
      setLoading(false);
    }
  }

  const cfg = FEEDBACK_CONFIG[feedback.type];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* ========================================
          HEADER
      ======================================== */}
      <View style={styles.headerSection}>

        {/* Botón volver — igual que configurarPerfil */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>

        {usuario?.foto_url ? (
          <Image source={{ uri: usuario.foto_url }} style={styles.profileImage} />
        ) : (
          <View style={styles.iconCircle}>
            <Text style={styles.profileLetter}>
              {usuario?.nombre?.charAt(0)?.toUpperCase() || "A"}
            </Text>
          </View>
        )}

        <Text style={styles.title}>
          {usuario?.nombre} {usuario?.apellidos}
        </Text>

        <View style={styles.roleBadge}>
          <Ionicons name="shield-checkmark-outline" size={13} color="#34d399" />
          <Text style={styles.roleText}>{usuario?.rol?.toUpperCase()}</Text>
        </View>

        <View style={[
          styles.statusBadge,
          { backgroundColor: usuario?.activo ? "rgba(5,150,105,0.2)" : "rgba(220,38,38,0.2)" },
        ]}>
          <Ionicons
            name={usuario?.activo ? "checkmark-circle-outline" : "close-circle-outline"}
            size={13}
            color={usuario?.activo ? "#34d399" : "#f87171"}
          />
          <Text style={[
            styles.statusText,
            { color: usuario?.activo ? "#34d399" : "#f87171" },
          ]}>
            {usuario?.activo ? "Cuenta activa" : "Cuenta inactiva"}
          </Text>
        </View>

      </View>

      {/* ========================================
          CARD
      ======================================== */}
      <View style={styles.card}>

        <Text style={styles.sectionTitle}>Información personal</Text>

        <InfoRow icon="mail-outline"    label="Correo institucional" value={usuario?.email} />
        <InfoRow icon="id-card-outline" label="Número de control"    value={usuario?.numero_control} />

        <Text style={styles.sectionTitle}>Datos académicos</Text>

        <InfoRow icon="school-outline" label="Carrera"  value={usuario?.carrera} />
        <InfoRow icon="layers-outline" label="Semestre" value={usuario?.semestre ? `${usuario.semestre}° semestre` : ""} />

      </View>

      {/* ========================================
          MODAL — FEEDBACK
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

// ── Fila de info reutilizable ──
function InfoRow({
  icon, label, value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBox}>
        <Ionicons name={icon} size={18} color="#059669" />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "—"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    justifyContent: "center",   // centra verticalmente en pantallas grandes
    padding: 24,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* ── HEADER ── */
  headerSection: {
    alignItems: "center",
    marginBottom: 26,
    paddingTop: 48,             // bajamos el contenido del header
  },

  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#34d399",
    marginBottom: 16,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
  },

  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#34d399",
    marginBottom: 16,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
  },

  profileLetter: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(22, 24, 23, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(22, 24, 23, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 8,
  },

  roleText: {
    color: "#34d399",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.5,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  statusText: {
    fontWeight: "600",
    fontSize: 12,
  },

  /* ── CARD ── */
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 14,
    marginTop: 16,
    marginLeft: 2,
  },

  /* ── FILAS DE INFO ── */
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },

  infoIconBox: {
    marginRight: 12,
  },

  infoText: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 3,
    fontWeight: "500",
  },

  infoValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
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