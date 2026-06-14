import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  Linking,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ── Helper: formatear fecha bonita ──
function formatearFecha(fechaStr: string) {
  if (!fechaStr) return "No disponible";
  try {
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return fechaStr;
    return fecha.toLocaleString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return fechaStr;
  }
}

export default function AvisoDetalleScreen() {
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [aviso, setAviso] = useState<any>(null);

  const scheme = useColorScheme();
  const dark = scheme === "dark";

  // ── Paleta adaptativa — igual que [id].tsx ──
  const bg              = dark ? "rgba(15,15,15,0.50)"  : "rgba(243,244,246,0.50)";
  const surfaceRaised   = dark ? "#252528"              : "rgba(255,255,255,0.95)";
  const textPrimary     = dark ? "#f3f4f6"              : "#111827";
  const textSecondary   = dark ? "#9ca3af"              : "#6b7280";
  const textTertiary    = dark ? "#6b7280"              : "#9ca3af";
  const border          = dark ? "#ffffff12"            : "transparent";
  const dividerColor    = dark ? "#ffffff0d"            : "#f3f4f6";
  const imgPlaceholder  = dark ? "#27272a"              : "#f1f5f9";

  const descBg     = dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.65)";
  const descBorder = dark ? "#ffffff14"               : "#e5e7eb";

  useEffect(() => {
    cargarAviso();
  }, []);

  const cargarAviso = async () => {
    try {
      const response = await fetch(
        `http://163.192.134.248/api/publicaciones/${id}`
      );
      const json = await response.json();
      setAviso(json.publicacion);
    } catch (error) {
      console.log("ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={[styles.loadingText, { color: textSecondary }]}>
          Cargando aviso...
        </Text>
      </View>
    );
  }

  if (!aviso) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <Ionicons name="alert-circle-outline" size={48} color={textSecondary} />
        <Text style={[styles.notFoundText, { color: textSecondary }]}>
          No se encontró el aviso
        </Text>
      </View>
    );
  }

  return (
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
        {aviso.imagen_url ? (
          <Image source={{ uri: aviso.imagen_url }} style={styles.image} />
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
        <Text style={[styles.title, { color: textPrimary }]}>{aviso.titulo}</Text>

        {/* Tipo */}
        <View style={styles.tagRow}>
          <View style={styles.tagDot} />
          <Text style={styles.tagText}>{aviso.tipo}</Text>
        </View>

        {/* Descripción */}
        <View style={[styles.descBox, { backgroundColor: descBg, borderColor: descBorder }]}>
          <Text style={[styles.description, { color: textPrimary }]}>
            {aviso.descripcion || "Sin descripción"}
          </Text>
        </View>

        {/* ── INFO CARD ── */}
        <View style={[styles.infoCard, { backgroundColor: surfaceRaised, borderColor: border, borderWidth: dark ? 1 : 0 }]}>

          <InfoRow
            icon="calendar-outline"
            label="Inicio"
            value={formatearFecha(aviso.fecha_inicio)}
            textPrimary={textPrimary}
            textMuted={textSecondary}
            divider={dividerColor}
            showDivider
          />
          <InfoRow
            icon="calendar-clear-outline"
            label="Fin"
            value={formatearFecha(aviso.fecha_fin)}
            textPrimary={textPrimary}
            textMuted={textSecondary}
            divider={dividerColor}
          />

        </View>

        {/* ── BOTÓN ABRIR ENLACE ── */}
        {aviso.link ? (
          <Pressable
            onPress={() => Linking.openURL(aviso.link)}
            style={styles.openButton}
          >
            <Ionicons name="open-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Abrir enlace</Text>
          </Pressable>
        ) : null}

        <View style={{ height: 30 }} />
      </View>

    </ScrollView>
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

  /* ── TIPO ── */
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 18,
  },

  tagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#059669",
  },

  tagText: {
    color: "#059669",
    fontWeight: "700",
    fontSize: 14,
    textTransform: "capitalize",
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
    marginBottom: 24,
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

  /* ── BOTÓN ── */
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
});