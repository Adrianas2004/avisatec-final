import { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";

import { router } from "expo-router";
import { API_URL } from "../constants/api";
import { getCurrentUser } from "aws-amplify/auth";
import { Ionicons } from "@expo/vector-icons";

type Categoria = {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
};

const CARD_SIZES = ["small", "medium", "large", "small", "large", "medium"];

export default function EditarInteresesScreen() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const currentUser = await getCurrentUser();
      const cognitoSub = currentUser.userId;

      const userResponse = await fetch(`${API_URL}/users/${cognitoSub}`);
      const userData = await userResponse.json();
      const usuario = userData.user;
      setUsuarioId(usuario.id);

      const categoriasResponse = await fetch(`${API_URL}/categorias`);
      const categoriasData = await categoriasResponse.json();
      setCategorias(categoriasData);

      const interesesResponse = await fetch(
        `${API_URL}/users/intereses/${usuario.id}`
      );
      const interesesData = await interesesResponse.json();

      console.log("INTERESES ACTUALES:");
      console.log(interesesData);

      let idsSeleccionados: number[] = [];
      if (Array.isArray(interesesData) && typeof interesesData[0] === "object") {
        idsSeleccionados = interesesData.map((item: any) => item.categoria_id);
      } else {
        idsSeleccionados = interesesData;
      }

      setSeleccionadas(idsSeleccionados);
    } catch (error) {
      console.log(error);
      showAlert("Error", "No se pudieron cargar tus intereses", "error");
    } finally {
      setLoading(false);
    }
  }

  function toggleCategoria(id: number) {
    if (seleccionadas.includes(id)) {
      setSeleccionadas(seleccionadas.filter((item) => item !== id));
    } else {
      setSeleccionadas([...seleccionadas, id]);
    }
  }

  function toggleTodas() {
    if (seleccionadas.length === categorias.length) {
      setSeleccionadas([]);
    } else {
      setSeleccionadas(categorias.map((c) => c.id));
    }
  }

  const todasSeleccionadas =
    seleccionadas.length === categorias.length && categorias.length > 0;

  async function guardarCambios() {
    try {
      if (!usuarioId) {
        showAlert("Error", "Usuario no válido", "error");
        return;
      }
      if (seleccionadas.length === 0) {
        showAlert("Error", "Selecciona al menos un interés", "error");
        return;
      }

      setSaving(true);

      const response = await fetch(`${API_URL}/users/intereses/actualizar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuarioId,
          categorias: seleccionadas,
        }),
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data?.error || "No se pudieron actualizar");
      }

      showAlert(
        "Éxito",
        "Tus intereses fueron actualizados",
        "success",
        () => {
          setModalVisible(false);
          router.back();
        }
      );
    } catch (error: any) {
      console.log(error);
      showAlert("Error", error?.message || "No se pudieron actualizar los intereses", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Cargando tus intereses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* ── HEADER ── */}
      <View style={styles.headerSection}>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#e5e7eb" />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <Ionicons name="options" size={26} color="#fff" />
        </View>

        <Text style={styles.title}>Editar intereses</Text>
        <Text style={styles.subtitle}>
          Personaliza las categorías que deseas ver
        </Text>

        <View style={styles.headerActions}>
          {seleccionadas.length > 0 && (
            <View style={styles.counterBadge}>
              <Ionicons name="checkmark-circle" size={13} color="#fff" />
              <Text style={styles.counterText}>
                {seleccionadas.length} seleccionada{seleccionadas.length !== 1 ? "s" : ""}
              </Text>
            </View>
          )}

          {categorias.length > 0 && (
            <TouchableOpacity
              style={[
                styles.toggleAllBtn,
                todasSeleccionadas && styles.toggleAllBtnActive,
              ]}
              onPress={toggleTodas}
              activeOpacity={0.8}
            >
              <Ionicons
                name={todasSeleccionadas ? "close-circle-outline" : "checkmark-done-outline"}
                size={15}
                color={todasSeleccionadas ? "#ef4444" : "#34d399"}
              />
              <Text
                style={[
                  styles.toggleAllText,
                  todasSeleccionadas && styles.toggleAllTextActive,
                ]}
              >
                {todasSeleccionadas ? "Desmarcar todos" : "Seleccionar todos"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── GRID ── */}
      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {categorias.map((categoria, index) => {
          const selected = seleccionadas.includes(categoria.id);
          const sizeKey = CARD_SIZES[index % CARD_SIZES.length] as "small" | "medium" | "large";

          return (
            <TouchableOpacity
              key={categoria.id}
              style={[
                styles.card,
                styles[`card_${sizeKey}`],
                selected && styles.cardSelected,
              ]}
              onPress={() => toggleCategoria(categoria.id)}
              activeOpacity={0.75}
            >
              {selected && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={11} color="#fff" />
                </View>
              )}

              <Text style={styles.icon}>{categoria.icono}</Text>

              <Text
                style={[styles.cardTitle, selected && styles.cardTitleSelected]}
                numberOfLines={2}
              >
                {categoria.nombre}
              </Text>

              {sizeKey !== "small" && (
                <Text
                  style={[
                    styles.cardDescription,
                    selected && styles.cardDescriptionSelected,
                  ]}
                  numberOfLines={sizeKey === "large" ? 2 : 1}
                >
                  {categoria.descripcion}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 110, width: "100%" }} />
      </ScrollView>

      {/* ── BOTÓN FLOTANTE ── */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={[
            styles.button,
            saving && styles.buttonDisabled,
            seleccionadas.length === 0 && styles.buttonInactive,
          ]}
          onPress={guardarCambios}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>
                {seleccionadas.length === 0
                  ? "Elige al menos uno"
                  : "Guardar cambios"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ========================================
          MODAL PERSONALIZADO — ALERTAS
      ======================================== */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertCard}>

            <View
              style={[
                styles.alertIconCircle,
                modalConfig.type === "success"
                  ? styles.alertIconSuccess
                  : styles.alertIconError,
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

            <Text style={styles.alertTitle}>{modalConfig.title}</Text>
            <Text style={styles.alertMessage}>{modalConfig.message}</Text>

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

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    paddingTop: 60,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    gap: 16,
  },

  loadingText: {
    fontSize: 15,
    color: "#6b7280",
    fontWeight: "500",
  },

  /* ── HEADER ── */
  headerSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },

  backButton: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1c1c1e",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffffff12",
  },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 6,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 20,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  },

  counterBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 5,
  },

  counterText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  toggleAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#34d399",
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: "transparent",
  },

  toggleAllBtnActive: {
    borderColor: "#ef4444",
  },

  toggleAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#34d399",
  },

  toggleAllTextActive: {
    color: "#ef4444",
  },

  /* ── GRID ── */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 14,
    gap: 10,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  /* ── CARD BASE ── */
  card: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#ffffff12",
    backgroundColor: "#1c1c1e",
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  cardSelected: {
    backgroundColor: "#064e3b",
    borderColor: "#059669",
  },

  card_small: {
    width: "28%",
    minHeight: 90,
  },

  card_medium: {
    width: "38%",
    minHeight: 110,
  },

  card_large: {
    width: "54%",
    minHeight: 120,
  },

  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    fontSize: 30,
    marginBottom: 8,
    textAlign: "center",
  },

  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#f3f4f6",
    textAlign: "center",
    lineHeight: 17,
  },

  cardTitleSelected: {
    color: "#ffffff",
  },

  cardDescription: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 15,
    marginTop: 4,
  },

  cardDescriptionSelected: {
    color: "#6ee7b7",
  },

  /* ── BOTÓN FLOTANTE ── */
  buttonWrapper: {
    position: "absolute",
    bottom: 28,
    left: 20,
    right: 20,
  },

  button: {
    backgroundColor: "#059669",
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
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

  buttonInactive: {
    backgroundColor: "#064e3b",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  /* ── MODAL ALERTA ── */
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },

  alertCard: {
    backgroundColor: "#1c1c1e",
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#ffffff12",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
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

  alertTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
    textAlign: "center",
  },

  alertMessage: {
    fontSize: 15,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 23,
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
});