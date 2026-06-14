import {
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Linking,
  TouchableOpacity,
  Modal,
  useColorScheme,
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";
import axios from "axios";
import { getCurrentUser } from "aws-amplify/auth";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/api";

// ── Helper: formatear fecha bonita ──
function formatearFecha(fechaStr: string) {
  if (!fechaStr) return "N/A";
  try {
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return fechaStr;
    return fecha.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return fechaStr;
  }
}

// ── Helper: formatear estado bonito ──
function formatearEstado(estado: string) {
  if (!estado) return "N/A";
  const mapa: Record<string, string> = {
    self: "Disponible",
    activo: "Activo",
    finalizado: "Finalizado",
    proximo: "Próximo",
  };
  const clave = estado.toLowerCase().trim();
  if (mapa[clave]) return mapa[clave];
  return estado.charAt(0).toUpperCase() + estado.slice(1);
}

export default function CursoDetalle() {
  const { id } = useLocalSearchParams();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [interested, setInterested] = useState(false);
  const [totalInterested, setTotalInterested] = useState(0);
  const [preregistered, setPreregistered] = useState(false);
  const [totalPreregistros, setTotalPreregistros] = useState(0);

  // ── Modal de alerta ──
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    type: "success" | "error" | "confirm";
    onClose: () => void;
    onConfirm?: () => void;
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

  function showConfirm(
    title: string,
    message: string,
    onConfirm: () => void
  ) {
    setModalConfig({
      title,
      message,
      type: "confirm",
      onClose: () => setModalVisible(false),
      onConfirm,
    });
    setModalVisible(true);
  }

  const scheme = useColorScheme();
  const dark = scheme === "dark";

  // ── Paleta adaptativa ──
  const bg              = dark ? "rgba(15,15,15,0.50)"  : "rgba(243,244,246,0.50)";
  const surfaceRaised   = dark ? "#252528"              : "rgba(255,255,255,0.95)";
  const surface2        = dark ? "#1c1c1e"              : "#f9fafb";
  const textPrimary     = dark ? "#f3f4f6"              : "#111827";
  const textSecondary   = dark ? "#9ca3af"              : "#6b7280";
  const textTertiary    = dark ? "#6b7280"              : "#9ca3af";
  const border          = dark ? "#ffffff12"            : "transparent";
  const dividerColor    = dark ? "#ffffff0d"            : "#f3f4f6";
  const imgPlaceholder  = dark ? "#27272a"              : "#f1f5f9";

  const descBg         = dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.65)";
  const descBorder     = dark ? "#ffffff14"               : "#e5e7eb";

  const interestBg     = interested
    ? (dark ? "#4c1d2a" : "#fce7f3")
    : surfaceRaised;
  const interestBorder = interested
    ? (dark ? "#be185d" : "#f9a8d4")
    : (dark ? "#ffffff20" : "#e5e7eb");
  const interestText   = interested
    ? (dark ? "#f9a8d4" : "#be185d")
    : textPrimary;

  // Colores del modal adaptados al tema
  const modalCardBg    = dark ? "#1c1c1e" : "#ffffff";
  const modalTitleColor = dark ? "#f3f4f6" : "#111827";
  const modalMsgColor  = dark ? "#9ca3af" : "#6b7280";
  const modalBorder    = dark ? "#ffffff12" : "transparent";

  /*
  ========================================
  LÓGICA
  ========================================
  */
  const fetchCourse = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/publicaciones/${id}`);
      setCourse(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  async function getUsuarioId() {
    try {
      const user = await getCurrentUser();
      const cognitoSub = user.userId;
      const response = await axios.get(`${API_URL}/users/${cognitoSub}`);
      const usuario = response.data.user;
      setUsuario(usuario);
      setUsuarioId(usuario.id);
      return usuario.id;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async function obtenerInteresados() {
    try {
      const response = await axios.get(`${API_URL}/intereses/${id}`);
      setTotalInterested(parseInt(response.data.total));
    } catch (error) {
      console.log(error);
    }
  }

  async function verificarInteres(currentUserId: number) {
    try {
      const response = await axios.post(`${API_URL}/intereses/verificar`, {
        usuario_id: currentUserId,
        publicacion_id: id,
      });
      setInterested(response.data.interested);
    } catch (error) {
      console.log(error);
    }
  }

  async function toggleInteres() {
    try {
      if (!usuarioId) return;
      const response = await axios.post(`${API_URL}/intereses`, {
        usuario_id: usuarioId,
        publicacion_id: id,
      });
      setInterested(response.data.interested);
      obtenerInteresados();
      if (!response.data.interested) router.back();
    } catch (error) {
      console.log(error);
    }
  }

  async function obtenerPreregistros() {
    try {
      const response = await axios.get(`${API_URL}/preregistro/${id}`);
      setTotalPreregistros(parseInt(response.data.total));
    } catch (error) {
      console.log(error);
    }
  }

  async function verificarPreregistro(currentUserId: number) {
    try {
      const response = await axios.post(`${API_URL}/preregistro/verificar`, {
        usuario_id: currentUserId,
        publicacion_id: id,
      });
      setPreregistered(response.data.preregistrado);
    } catch (error) {
      console.log(error);
    }
  }

  async function hacerPreregistro() {
    try {
      if (!usuarioId || !usuario) return;

      showConfirm(
        "Confirmar preregistro",
        `Se generará tu preregistro usando:\n\n👤 ${usuario.nombre} ${usuario.apellidos}\n\n🎓 ${usuario.carrera}\n\n🆔 ${usuario.numero_control}\n\n📧 L${usuario.numero_control}@tehuacan.tecnm.mx\n\n¿Deseas continuar?`,
        async () => {
          setModalVisible(false);
          try {
            await axios.post(`${API_URL}/preregistro`, {
              usuario_id: usuarioId,
              publicacion_id: id,
              numero_control: usuario.numero_control,
            });
            setPreregistered(true);
            obtenerPreregistros();
            showAlert(
              "Preregistro realizado",
              `Tu preregistro fue guardado correctamente.\n\n📧 Correo institucional:\nL${usuario.numero_control}@tehuacan.tecnm.mx\n\n⚠️ IMPORTANTE:\nEste preregistro NO completa tu inscripción oficial.\n\nPara registrarte completamente debes presionar "Abrir Curso" y finalizar el proceso en la plataforma oficial.`,
              "success"
            );
          } catch (error) {
            console.log(error);
            showAlert("Error", "No se pudo realizar el preregistro", "error");
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    async function init() {
      await fetchCourse();
      const currentUserId = await getUsuarioId();
      if (currentUserId) {
        await verificarInteres(currentUserId);
        await verificarPreregistro(currentUserId);
      }
      await obtenerInteresados();
      await obtenerPreregistros();
    }
    init();
  }, [fetchCourse]);

  /*
  ========================================
  LOADING
  ========================================
  */
  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={[styles.loadingText, { color: textSecondary }]}>Cargando curso...</Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <Ionicons name="alert-circle-outline" size={48} color={textSecondary} />
        <Text style={[styles.notFoundText, { color: textSecondary }]}>Curso no encontrado</Text>
      </View>
    );
  }

  /*
  ========================================
  UI
  ========================================
  */
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={[styles.container, { backgroundColor: bg }]}
        showsVerticalScrollIndicator={false}
      >

        {/* ── BOTÓN ATRÁS FLOTANTE ── */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>

        {/* ── IMAGEN / HERO ── */}
        <View style={styles.imageWrapper}>
          {course.imagen_url ? (
            <Image source={{ uri: course.imagen_url }} style={styles.image} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: imgPlaceholder }]}>
              <View style={styles.imagePlaceholderInner}>
                <Ionicons name="image-outline" size={40} color={textTertiary} />
              </View>
            </View>
          )}
        </View>

        {/* ── CONTENIDO ── */}
        <View style={styles.content}>

          {/* Título */}
          <Text style={[styles.title, { color: textPrimary }]}>{course.titulo}</Text>

          {/* Descripción */}
          <View style={[styles.descBox, { backgroundColor: descBg, borderColor: descBorder }]}>
            <Text style={[styles.description, { color: textPrimary }]}>
              {course.descripcion || "Sin descripción"}
            </Text>
          </View>

          {/* ── INFO CARD ── */}
          <View style={[styles.infoCard, { backgroundColor: surfaceRaised, borderColor: border, borderWidth: dark ? 1 : 0 }]}>
            <InfoRow
              icon="radio-button-on-outline"
              label="Estado"
              value={formatearEstado(course.estado)}
              textPrimary={textPrimary}
              textMuted={textSecondary}
              divider={dividerColor}
              showDivider
            />
            <InfoRow
              icon="calendar-outline"
              label="Inicio"
              value={formatearFecha(course.fecha_inicio)}
              textPrimary={textPrimary}
              textMuted={textSecondary}
              divider={dividerColor}
              showDivider
            />
            <InfoRow
              icon="calendar-clear-outline"
              label="Fin"
              value={formatearFecha(course.fecha_fin)}
              textPrimary={textPrimary}
              textMuted={textSecondary}
              divider={dividerColor}
            />
          </View>

          {/* ── CONTADORES ── */}
          <View style={styles.countersRow}>
            <View style={[styles.counterCard, { backgroundColor: surfaceRaised, borderColor: border, borderWidth: dark ? 1 : 0 }]}>
              <Text style={styles.counterEmoji}>❤️</Text>
              <Text style={[styles.counterNumber, { color: textPrimary }]}>{totalInterested}</Text>
              <Text style={[styles.counterLabel, { color: textSecondary }]}>interesados</Text>
            </View>
            <View style={[styles.counterCard, { backgroundColor: surfaceRaised, borderColor: border, borderWidth: dark ? 1 : 0 }]}>
              <Text style={styles.counterEmoji}>🔥</Text>
              <Text style={[styles.counterNumber, { color: textPrimary }]}>{totalPreregistros}</Text>
              <Text style={[styles.counterLabel, { color: textSecondary }]}>preregistros</Text>
            </View>
          </View>

          {/* ── BOTÓN ME INTERESA ── */}
          <TouchableOpacity
            style={[
              styles.interestButton,
              {
                backgroundColor: interestBg,
                borderColor: interestBorder,
                shadowColor: interested ? "#be185d" : "transparent",
              },
            ]}
            onPress={toggleInteres}
            activeOpacity={0.85}
          >
            <Text style={[styles.interestButtonText, { color: interestText }]}>
              {interested ? "❤️  Te interesa" : "🤍  Me interesa"}
            </Text>
          </TouchableOpacity>

          {/* ── BOTÓN PREREGISTRO ── */}
          <TouchableOpacity
            style={[
              styles.preregistroButton,
              preregistered && styles.preregistroDone,
            ]}
            onPress={hacerPreregistro}
            disabled={preregistered}
            activeOpacity={0.85}
          >
            <Ionicons
              name={preregistered ? "checkmark-circle-outline" : "flame-outline"}
              size={20}
              color="#fff"
            />
            <Text style={styles.buttonText}>
              {preregistered ? "Ya preregistrado" : "Pre registrarme"}
            </Text>
          </TouchableOpacity>

          {/* ── BOTÓN ABRIR CURSO ── */}
          <TouchableOpacity
            style={styles.openButton}
            onPress={() => Linking.openURL(course.link)}
            activeOpacity={0.85}
          >
            <Ionicons name="open-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Abrir Curso</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </View>

      </ScrollView>

      {/* ========================================
          MODAL PERSONALIZADO — ALERTAS Y CONFIRMACIÓN
      ======================================== */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.alertOverlay}>
          <View style={[
            styles.alertCard,
            { backgroundColor: modalCardBg, borderColor: modalBorder, borderWidth: dark ? 1.5 : 0 }
          ]}>

            {/* Ícono */}
            <View
              style={[
                styles.alertIconCircle,
                modalConfig.type === "success"
                  ? styles.alertIconSuccess
                  : modalConfig.type === "confirm"
                  ? styles.alertIconConfirm
                  : styles.alertIconError,
              ]}
            >
              <Ionicons
                name={
                  modalConfig.type === "success"
                    ? "checkmark-circle-outline"
                    : modalConfig.type === "confirm"
                    ? "help-circle-outline"
                    : "alert-circle-outline"
                }
                size={32}
                color="#fff"
              />
            </View>

            <Text style={[styles.alertTitle, { color: modalTitleColor }]}>
              {modalConfig.title}
            </Text>
            <Text style={[styles.alertMessage, { color: modalMsgColor }]}>
              {modalConfig.message}
            </Text>

            {/* Botones: uno para alertas, dos para confirmación */}
            {modalConfig.type === "confirm" ? (
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={modalConfig.onClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={modalConfig.onConfirm}
                  activeOpacity={0.85}
                >
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.alertButton,
                  modalConfig.type === "success"
                    ? styles.alertButtonSuccess
                    : styles.alertButtonError,
                ]}
                onPress={modalConfig.onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.alertButtonText}>OK</Text>
              </TouchableOpacity>
            )}

          </View>
        </View>
      </Modal>

    </View>
  );
}

// ── Fila de info reutilizable ──
function InfoRow({
  icon, label, value, textPrimary, textMuted, divider, showDivider,
}: {
  icon: any;
  label: string;
  value: string;
  textPrimary: string;
  textMuted: string;
  divider: string;
  showDivider?: boolean;
}) {
  return (
    <>
      <View style={styles.infoRow}>
        <View style={styles.infoIconCircle}>
          <Ionicons name={icon} size={16} color="#059669" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.infoLabel, { color: textMuted }]}>{label}</Text>
          <Text style={[styles.infoValue, { color: textPrimary }]}>{value}</Text>
        </View>
      </View>
      {showDivider && <View style={[styles.inlineDivider, { backgroundColor: divider }]} />}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  loadingText: {
    fontSize: 15,
    fontWeight: "500",
  },

  notFoundText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },

  /* ── BOTÓN ATRÁS FLOTANTE ── */
  backButton: {
    position: "absolute",
    top: 52,
    left: 18,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  /* ── HERO ── */
  imageWrapper: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 6,
  },

  image: {
    width: "100%",
    height: 240,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },

  imagePlaceholder: {
    width: "100%",
    height: 220,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },

  imagePlaceholderInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },

  /* ── CONTENIDO ── */
  content: {
    padding: 20,
    paddingTop: 22,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    lineHeight: 34,
  },

  /* ── DESCRIPCIÓN ── */
  descBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 22,
  },

  description: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: "500",
  },

  /* ── INFO CARD ── */
  infoCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    elevation: 4,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 12,
  },

  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
  },

  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: "600",
  },

  inlineDivider: {
    height: 1,
    marginVertical: 10,
  },

  /* ── CONTADORES ── */
  countersRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },

  counterCard: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    gap: 4,
    elevation: 4,
  },

  counterEmoji: {
    fontSize: 24,
  },

  counterNumber: {
    fontSize: 24,
    fontWeight: "800",
  },

  counterLabel: {
    fontSize: 12,
    fontWeight: "500",
  },

  /* ── BOTONES DE ACCIÓN ── */
  interestButton: {
    borderWidth: 1.5,
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: "center",
    marginBottom: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },

  interestButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },

  preregistroButton: {
    backgroundColor: "#ea580c",
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: "center",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#ea580c",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },

  preregistroDone: {
    backgroundColor: "#059669",
    shadowColor: "#059669",
  },

  openButton: {
    backgroundColor: "#059669",
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  /* ── MODAL ALERTA / CONFIRMACIÓN ── */
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },

  alertCard: {
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },

  alertIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  alertIconSuccess: {
    backgroundColor: "#059669",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  alertIconError: {
    backgroundColor: "#dc2626",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  alertIconConfirm: {
    backgroundColor: "#ea580c",
    shadowColor: "#ea580c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  alertTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },

  alertMessage: {
    fontSize: 17,
    textAlign: "center",
    lineHeight: 27,
    marginBottom: 28,
  },

  alertButton: {
    paddingVertical: 14,
    paddingHorizontal: 52,
    borderRadius: 14,
  },

  alertButtonSuccess: {
    backgroundColor: "#059669",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },

  alertButtonError: {
    backgroundColor: "#dc2626",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },

  alertButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.8,
  },

  /* ── BOTONES CONFIRMACIÓN (dos) ── */
  confirmButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
  },

  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },

  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#ea580c",
    shadowColor: "#ea580c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },

  confirmButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
  },
});