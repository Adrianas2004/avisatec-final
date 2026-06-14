import { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
  FlatList,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";
import { API_URL } from "../constants/api";
import { Ionicons } from "@expo/vector-icons";

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

export default function CompletarPerfilScreen() {
  const { cognito_sub, email, soy_maestro } = useLocalSearchParams();

  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [carrera, setCarrera] = useState("");
  const [semestre, setSemestre] = useState("");
  const [loading, setLoading] = useState(false);

  const [carreraModalVisible, setCarreraModalVisible] = useState(false);
  const [semestreModalVisible, setSemestreModalVisible] = useState(false);

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
  DETECTAR SI ES MAESTRO
  ========================================
  */
  const esMaestro = soy_maestro === "true";

  /*
  ========================================
  GUARDAR PERFIL
  ========================================
  */
  async function handleGuardarPerfil() {
    try {
      if (!nombre.trim() || !apellidos.trim() || !carrera.trim()) {
        showAlert("Error", "Completa todos los campos");
        return;
      }

      if (!esMaestro && !semestre.trim()) {
        showAlert("Error", "Ingresa tu semestre");
        return;
      }

      setLoading(true);

      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          apellidos: apellidos.trim(),
          email,
          carrera: carrera.trim(),
          semestre: esMaestro ? null : parseInt(semestre),
          cognito_sub,
          soy_maestro: esMaestro,
        }),
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data?.error || "Error guardando perfil");
      }

      if (data.user.rol === "pendiente") {
        showAlert(
          "Cuenta en validación",
          "Tu cuenta de maestro está en proceso de validación por un administrador.",
          "success"
        );
        return;
      }

      showAlert(
        "Perfil completado",
        "Ahora selecciona tus intereses",
        "success",
        () => {
          setModalVisible(false);
          router.replace({
            pathname: "/seleccionarIntereses",
            params: { usuario_id: data.user.id },
          });
        }
      );
    } catch (error: any) {
      console.log(error);
      showAlert("Error", error?.message || "No se pudo guardar el perfil", "error");
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
          <Ionicons
            name={esMaestro ? "school" : "person-add"}
            size={30}
            color="#fff"
          />
        </View>
        <Text style={styles.title}>Completa tu perfil</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      {/* ========================================
          CARD
      ======================================== */}
      <View style={styles.card}>

        {/* INFO MAESTRO */}
        {esMaestro && (
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color="#92400e" />
              <Text style={styles.infoText}>Cuenta sujeta a validación</Text>
            </View>
            <Text style={styles.infoSubtext}>
              Tu cuenta será revisada por un administrador antes de activarse.
            </Text>
          </View>
        )}

        {/* ── SECCIÓN PERSONAL ── */}
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

        {/* ── SECCIÓN ACADÉMICA ── */}
        <Text style={styles.sectionTitle}>
          {esMaestro ? "Datos del docente" : "Datos académicos"}
        </Text>

        {/* SELECTOR CARRERA */}
        <TouchableOpacity
          style={styles.selectorWrapper}
          onPress={() => esMaestro ? null : setCarreraModalVisible(true)}
          activeOpacity={esMaestro ? 1 : 0.7}
        >
          <Ionicons name="school-outline" size={18} color="#059669" style={styles.inputIcon} />
          {esMaestro ? (
            <TextInput
              style={styles.input}
              placeholder="Departamento o área"
              placeholderTextColor="#9ca3af"
              value={carrera}
              onChangeText={setCarrera}
            />
          ) : (
            <Text style={[styles.selectorText, !carrera && styles.selectorPlaceholder]}>
              {carrera || "Selecciona tu carrera"}
            </Text>
          )}
          {!esMaestro && (
            <Ionicons
              name="chevron-down"
              size={18}
              color={carrera ? "#059669" : "#9ca3af"}
            />
          )}
        </TouchableOpacity>

        {/* SELECTOR SEMESTRE — solo alumnos */}
        {!esMaestro && (
          <TouchableOpacity
            style={styles.selectorWrapper}
            onPress={() => setSemestreModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={18} color="#059669" style={styles.inputIcon} />
            <Text style={[styles.selectorText, !semestre && styles.selectorPlaceholder]}>
              {semestre ? `${semestre}° semestre` : "Selecciona tu semestre"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={18}
              color={semestre ? "#059669" : "#9ca3af"}
            />
          </TouchableOpacity>
        )}

        {/* INFO NÚMERO DE CONTROL */}
        {!esMaestro && (
          <View style={styles.numberBox}>
            <Ionicons name="information-circle-outline" size={16} color="#059669" />
            <Text style={styles.numberText}>
              Tu número de control se detectará automáticamente desde tu correo institucional.
            </Text>
          </View>
        )}

        {/* ========================================
            BOTÓN CONTINUAR
        ======================================== */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleGuardarPerfil}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="arrow-forward-circle-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Continuar</Text>
            </>
          )}
        </TouchableOpacity>

      </View>

      {/* ========================================
          MODAL — CARRERA
      ======================================== */}
      <Modal visible={carreraModalVisible} transparent animationType="slide">
        <Pressable
          style={styles.sheetOverlay}
          onPress={() => setCarreraModalVisible(false)}
        >
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
                    onPress={() => {
                      setCarrera(item);
                      setCarreraModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {item}
                    </Text>
                    {selected && (
                      <Ionicons name="checkmark-circle" size={20} color="#059669" />
                    )}
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
        <Pressable
          style={styles.sheetOverlay}
          onPress={() => setSemestreModalVisible(false)}
        >
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
                    onPress={() => {
                      setSemestre(s);
                      setSemestreModalVisible(false);
                    }}
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

  email: {
    fontSize: 15,
    fontWeight: "700",
    color: "#34d399",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },

  /* ── AVISO MAESTRO ── */
  infoBox: {
    backgroundColor: "#fef3c7",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "#fde68a",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },

  infoText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400e",
  },

  infoSubtext: {
    fontSize: 13,
    color: "#78350f",
    lineHeight: 20,
  },

  /* ── SECCIÓN TITLE ── */
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

  /* ── SELECTOR ── */
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

  /* ── INFO NÚMERO CONTROL ── */
  numberBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ecfdf5",
    borderRadius: 14,
    padding: 12,
    marginTop: 6,
    marginBottom: 4,
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#a7f3d0",
  },

  numberText: {
    color: "#065f46",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    lineHeight: 20,
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

  /* ── SHEET OVERLAY (carrera / semestre) ── */
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  /* ── MODAL SHEET ── */
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

  /* ── OPCIONES CARRERA ── */
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

  /* ── GRID SEMESTRE ── */
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

  /* ── MODAL ALERTA (fade, centrado) ── */
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },

  alertCard: {
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
    color: "#111827",
    marginBottom: 10,
    textAlign: "center",
  },

  alertMessage: {
    fontSize: 15,
    color: "#6b7280",
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