import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  Image,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const API_URL = "http://163.192.134.248/api/publicaciones?fuente=manual";

export default function AvisosScreen() {
  const [loading, setLoading] = useState(true);
  const [avisos, setAvisos] = useState<any[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todos");

  const scheme = useColorScheme();
  const dark = scheme === "dark";

  // ── Paleta adaptativa — igual que [id].tsx ──
  const bg            = dark ? "rgba(15,15,15,0.50)"  : "rgba(243,244,246,0.50)";
  const surfaceRaised = dark ? "#252528"              : "rgba(255,255,255,0.95)";
  const textPrimary   = dark ? "#f3f4f6"              : "#111827";
  const textSecondary = dark ? "#9ca3af"              : "#6b7280";
  const textTertiary  = dark ? "#6b7280"              : "#9ca3af";
  const border        = dark ? "#ffffff12"            : "transparent";

  // Chips de categoría
  const chipBg        = dark ? "#1c1c1e" : "#e5e7eb";
  const chipBgActive  = "#059669";
  const chipText      = dark ? "#d1d5db" : "#374151";
  const chipTextActive = "#fff";

  const categorias = [
    "todos",
    "concurso",
    "conferencia",
    "taller",
    "beca",
    "otro",
  ];

  useEffect(() => {
    cargarAvisos();
  }, []);

  const cargarAvisos = async () => {
    try {
      const response = await fetch(API_URL);
      const json = await response.json();
      setAvisos(json.publicaciones || []);
    } catch (error) {
      console.log("ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const avisosFiltrados =
    categoriaSeleccionada === "todos"
      ? avisos
      : avisos.filter((item) => item.tipo === categoriaSeleccionada);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={[styles.loadingText, { color: textSecondary }]}>
          Cargando avisos...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* ── ENCABEZADO ── */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>
          📢 Avisos
        </Text>
        <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
          Categorías
        </Text>
      </View>

      {/* ── FILTROS ── */}
      <View style={styles.chipsRow}>
        {categorias.map((categoria) => {
          const activo = categoriaSeleccionada === categoria;
          return (
            <Pressable
              key={categoria}
              onPress={() => setCategoriaSeleccionada(categoria)}
              style={[
                styles.chip,
                {
                  backgroundColor: activo ? chipBgActive : chipBg,
                  shadowColor: activo ? "#059669" : "transparent",
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: activo ? chipTextActive : chipText },
                ]}
              >
                {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── LISTA / VACÍO ── */}
      {avisosFiltrados.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="file-tray-outline" size={40} color={textTertiary} />
          <Text style={[styles.emptyText, { color: textSecondary }]}>
            No hay avisos en esta categoría
          </Text>
        </View>
      ) : (
        <FlatList
          data={avisosFiltrados}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/aviso/${item.id}`)}
              style={[
                styles.card,
                {
                  backgroundColor: surfaceRaised,
                  borderColor: border,
                  borderWidth: dark ? 1 : 0,
                },
              ]}
            >
              {item.imagen_url ? (
                <Image
                  source={{ uri: item.imagen_url }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.cardImagePlaceholder,
                    { backgroundColor: dark ? "#27272a" : "#f1f5f9" },
                  ]}
                >
                  <Ionicons
                    name="image-outline"
                    size={32}
                    color={textTertiary}
                  />
                </View>
              )}

              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: textPrimary }]}>
                  {item.titulo}
                </Text>

                <View style={styles.tagRow}>
                  <View style={styles.tagDot} />
                  <Text style={styles.cardTipo}>{item.tipo}</Text>
                </View>

                <View style={styles.dateRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color={textTertiary}
                  />
                  <Text style={[styles.cardFecha, { color: textSecondary }]}>
                    {item.fecha_inicio
                      ? new Date(item.fecha_inicio).toLocaleDateString("es-MX", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Fecha no disponible"}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
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

  /* ── ENCABEZADO ── */
  header: {
    marginBottom: 18,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 14,
    fontWeight: "500",
  },

  /* ── FILTROS ── */
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },

  chipText: {
    fontWeight: "600",
    fontSize: 13,
  },

  /* ── VACÍO ── */
  emptyState: {
    alignItems: "center",
    marginTop: 60,
    gap: 10,
  },

  emptyText: {
    fontSize: 15,
    fontWeight: "500",
  },

  /* ── TARJETA ── */
  card: {
    borderRadius: 18,
    marginBottom: 14,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },

  cardImage: {
    width: "100%",
    height: 170,
  },

  cardImagePlaceholder: {
    width: "100%",
    height: 140,
    justifyContent: "center",
    alignItems: "center",
  },

  cardBody: {
    padding: 16,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    lineHeight: 22,
  },

  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },

  tagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#059669",
  },

  cardTipo: {
    color: "#059669",
    fontWeight: "600",
    fontSize: 13,
    textTransform: "capitalize",
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  cardFecha: {
    fontSize: 12,
  },
});