import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  Pressable,
  FlatList,
} from "react-native";

import { router } from "expo-router";
import axios from "axios";
import { getCurrentUser } from "aws-amplify/auth";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../constants/api";

const CARRERAS = [
  "Ingeniería Bioquímica",
  "Ingeniería Civil",
  "Ingeniería Electrónica",
  "Ingeniería en Gestión Empresarial",
  "Ingeniería Industrial",
  "Ingeniería en Logística",
  "Ingeniería Mecatrónica",
  "Ingeniería en Sistemas Computacionales",
  "Licenciatura en Administración",
  "Contaduría Pública",
];

const SEMESTRES = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

// ─────────────────────────────────────────────
//  Tipos para el modal de feedback
// ─────────────────────────────────────────────
type FeedbackType = "success" | "error" | "warning";

interface FeedbackModal {
  visible: boolean;
  type: FeedbackType;
  title: string;
  message: string;
  onClose?: () => void; // acción extra al cerrar (ej: router.back)
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

export default function ConfigurarPerfilScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [carrera, setCarrera] = useState("");
  const [semestre, setSemestre] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [carreraModalVisible, setCarreraModalVisible] = useState(false);
  const [semestreModalVisible, setSemestreModalVisible] = useState(false);

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

  useEffect(() => {
    obtenerUsuario();
  }, []);

  async function obtenerUsuario() {
    try {
      const currentUser = await getCurrentUser();
      const cognitoSub = currentUser.userId;
      const response = await axios.get(`${API_URL}/users/${cognitoSub}`);
      const usuario = response.data.user;
      setUsuarioId(usuario.id);
      setNombre(usuario.nombre || "");
      setApellidos(usuario.apellidos || "");
      setCarrera(usuario.carrera || "");
      setSemestre(usuario.semestre?.toString() || "");
      setFotoUrl(usuario.foto_url || "");
    } catch (error) {
      console.log(error);
      mostrarFeedback("error", "Error", "No se pudo cargar el perfil");
    } finally {
      setLoading(false);
    }
  }

  async function guardarCambios() {
    try {
      if (!usuarioId) return;
      if (!nombre || !apellidos || !carrera || !semestre) {
        mostrarFeedback(
          "warning",
          "Campos incompletos",
          "Por favor completa todos los campos antes de continuar"
        );
        return;
      }
      setSaving(true);
      await axios.put(`${API_URL}/users/${usuarioId}`, {
        nombre,
        apellidos,
        carrera,
        semestre,
        foto_url: fotoUrl,
      });
      mostrarFeedback(
        "success",
        "¡Perfil actualizado!",
        "Tus datos se guardaron correctamente",
        () => router.back()
      );
    } catch (error) {
      console.log(error);
      mostrarFeedback("error", "Error", "No se pudo actualizar el perfil");
    } finally {
      setSaving(false);
    }
  }

  async function seleccionarImagen() {
    try {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        mostrarFeedback(
          "warning",
          "Permiso requerido",
          "Debes permitir el acceso a tus fotos desde la configuración de tu dispositivo"
        );
        return;
      }
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (resultado.canceled) return;
      subirImagenCloudinary(resultado.assets[0].uri);
    } catch (error) {
      console.log(error);
      mostrarFeedback("error", "Error", "No se pudo seleccionar la imagen");
    }
  }

  async function subirImagenCloudinary(imageUri: string) {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "profile.jpg",
      } as any);
      formData.append("upload_preset", "avisaTec");
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dutmnanhe/image/upload",
        { method: "POST", body: formData }
      );
      const data = await response.json();
      if (!data.secure_url) throw new Error("No se pudo subir la imagen");
      setFotoUrl(data.secure_url);
      mostrarFeedback("success", "¡Foto actualizada!", "Tu imagen de perfil se subió correctamente");
    } catch (error) {
      console.log(error);
      mostrarFeedback("error", "Error", "No se pudo subir la imagen");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  // ── Configuración visual del modal activo ──
  const cfg = FEEDBACK_CONFIG[feedback.type];

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

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={seleccionarImagen} activeOpacity={0.85} style={styles.avatarTouchable}>
          {fotoUrl ? (
            <Image source={{ uri: fotoUrl }} style={styles.profileImage} />
          ) : (
            <View style={styles.iconCircle}>
              <Text style={styles.profileLetter}>
                {nombre?.charAt(0)?.toUpperCase() || "A"}
              </Text>
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={15} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={styles.title}>Editar perfil</Text>
        <Text style={styles.subtitle}>Toca la foto para cambiarla</Text>

      </View>

      {/* ========================================
          CARD
      ======================================== */}
      <View style={styles.card}>

        <Text style={styles.sectionTitle}>Información personal</Text>

        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={18} color="#059669" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor="#9ca3af"
            value={nombre}
            onChangeText={setNombre}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={18} color="#059669" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Apellidos"
            placeholderTextColor="#9ca3af"
            value={apellidos}
            onChangeText={setApellidos}
          />
        </View>

        <Text style={styles.sectionTitle}>Datos académicos</Text>

        <TouchableOpacity
          style={styles.selectorWrapper}
          onPress={() => setCarreraModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="school-outline" size={18} color="#059669" style={styles.inputIcon} />
          <Text style={[styles.selectorText, !carrera && styles.selectorPlaceholder]} numberOfLines={1}>
            {carrera || "Selecciona tu carrera"}
          </Text>
          <Ionicons name="chevron-down" size={18} color={carrera ? "#059669" : "#9ca3af"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.selectorWrapper}
          onPress={() => setSemestreModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={18} color="#059669" style={styles.inputIcon} />
          <Text style={[styles.selectorText, !semestre && styles.selectorPlaceholder]}>
            {semestre ? `${semestre}° semestre` : "Selecciona tu semestre"}
          </Text>
          <Ionicons name="chevron-down" size={18} color={semestre ? "#059669" : "#9ca3af"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={guardarCambios}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Guardar cambios</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.passwordButton}
          onPress={() => router.push("/cambiarPassword")}
          activeOpacity={0.8}
        >
          <Ionicons name="lock-closed-outline" size={18} color="#059669" />
          <Text style={styles.passwordButtonText}>Cambiar contraseña</Text>
        </TouchableOpacity>

      </View>

      {/* ========================================
          MODAL — CARRERA
      ======================================== */}
      <Modal visible={carreraModalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setCarreraModalVisible(false)}>
          <Pressable style={styles.modalSheet}>

            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.modalIconCircle}>
                <Ionicons name="school-outline" size={20} color="#059669" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Selecciona tu carrera</Text>
                <Text style={styles.modalSubtitle}>Elige una opción de la lista</Text>
              </View>
            </View>

            <FlatList
              data={CARRERAS}
              keyExtractor={(item) => item}
              ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
              renderItem={({ item }) => {
                const selected = carrera === item;
                return (
                  <TouchableOpacity
                    style={[styles.optionItem, selected && styles.optionItemSelected]}
                    onPress={() => { setCarrera(item); setCarreraModalVisible(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {item}
                    </Text>
                    {selected && <Ionicons name="checkmark-circle" size={20} color="#059669" />}
                  </TouchableOpacity>
                );
              }}
            />

          </Pressable>
        </Pressable>
      </Modal>

      {/* ========================================
          MODAL — SEMESTRE
      ======================================== */}
      <Modal visible={semestreModalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setSemestreModalVisible(false)}>
          <Pressable style={[styles.modalSheet, styles.modalSheetSmall]}>

            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.modalIconCircle}>
                <Ionicons name="calendar-outline" size={20} color="#059669" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Selecciona tu semestre</Text>
                <Text style={styles.modalSubtitle}>¿En qué semestre estás?</Text>
              </View>
            </View>

            <View style={styles.semestreGrid}>
              {SEMESTRES.map((s) => {
                const selected = semestre === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.semestreItem, selected && styles.semestreItemSelected]}
                    onPress={() => { setSemestre(s); setSemestreModalVisible(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.semestreNumber, selected && styles.semestreNumberSelected]}>
                      {s}
                    </Text>
                    <Text style={[styles.semestreLabel, selected && styles.semestreLabelSelected]}>
                      semestre
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

          </Pressable>
        </Pressable>
      </Modal>

      {/* ========================================
          MODAL — FEEDBACK (éxito / error / aviso)
      ======================================== */}
      <Modal visible={feedback.visible} transparent animationType="fade">
        <Pressable style={styles.feedbackOverlay} onPress={cerrarFeedback}>
          <Pressable style={styles.feedbackCard}>

            {/* Icono central */}
            <View style={[styles.feedbackIconCircle, { backgroundColor: cfg.iconBg, borderColor: cfg.border }]}>
              <Ionicons name={cfg.icon as any} size={38} color={cfg.color} />
            </View>

            {/* Textos */}
            <Text style={[styles.feedbackTitle, { color: cfg.color }]}>{feedback.title}</Text>
            <Text style={styles.feedbackMessage}>{feedback.message}</Text>

            {/* Botón confirmar */}
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

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarTouchable: {
    position: "relative",
    marginBottom: 16,
  },

  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: "#34d399",
  },

  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#34d399",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
  },

  profileLetter: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
  },

  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: "#fff",
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
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
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
    marginBottom: 12,
    marginTop: 16,
    marginLeft: 2,
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
    marginBottom: 10,
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

  /* ── SELECTORES ── */
  selectorWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 15,
    marginBottom: 10,
  },

  selectorText: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },

  selectorPlaceholder: {
    color: "#9ca3af",
  },

  /* ── BOTÓN GUARDAR ── */
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
    gap: 8,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },

  /* ── CAMBIAR CONTRASEÑA ── */
  passwordButton: {
    marginTop: 14,
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: "#a7f3d0",
    backgroundColor: "#ecfdf5",
    gap: 10,
  },

  passwordButtonText: {
    color: "#059669",
    fontSize: 16,
    fontWeight: "700",
  },

  /* ── MODALES CARRERA / SEMESTRE ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: "80%",
  },

  modalSheetSmall: {
    maxHeight: "60%",
  },

  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#d1fae5",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  modalIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#a7f3d0",
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  modalSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },

  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 4,
  },

  optionItemSelected: {
    backgroundColor: "#ecfdf5",
    borderRadius: 12,
    paddingHorizontal: 12,
  },

  optionText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },

  optionTextSelected: {
    color: "#059669",
    fontWeight: "700",
  },

  itemSeparator: {
    height: 1,
    backgroundColor: "#f3f4f6",
  },

  semestreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingBottom: 10,
  },

  semestreItem: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: "#f9fafb",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },

  semestreItemSelected: {
    backgroundColor: "#059669",
    borderColor: "#047857",
  },

  semestreNumber: {
    fontSize: 26,
    fontWeight: "800",
    color: "#374151",
  },

  semestreNumberSelected: {
    color: "#fff",
  },

  semestreLabel: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: "500",
    marginTop: 2,
  },

  semestreLabelSelected: {
    color: "#d1fae5",
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