import {
  useState,
  useCallback,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { getCurrentUser } from "aws-amplify/auth";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/api";

export default function PreregistrosScreen() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const scheme = useColorScheme();
  const dark = scheme === "dark";

  // ── Paleta adaptativa — igual que home.tsx ──
  const bg             = dark ? "rgba(15,15,15,0.40)"  : "rgba(243,244,246,0.40)";
  const surfaceRaised  = dark ? "#252528"              : "rgba(255,255,255,0.95)";
  const textPrimary    = dark ? "#f3f4f6"              : "#111827";
  const textSecondary  = dark ? "#9ca3af"              : "#6b7280";
  const textTertiary   = dark ? "#6b7280"              : "#9ca3af";
  const border         = dark ? "#ffffff12"            : "transparent";
  const imgPlaceholder = dark ? "#27272a"              : "#f1f5f9";
  const emptyCircle    = dark ? "#431407"              : "#fff7ed";

  /*
  ========================================
  OBTENER USUARIO
  ========================================
  */
  async function getUsuarioId() {
    try {
      const user = await getCurrentUser();
      const cognitoSub = user.userId;
      const response = await axios.get(`${API_URL}/users/${cognitoSub}`);
      return response.data.user.id;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /*
  ========================================
  OBTENER PREREGISTROS
  ========================================
  */
  const fetchPreregistros = useCallback(async () => {
    try {
      const usuarioId = await getUsuarioId();
      if (!usuarioId) return;
      const response = await axios.get(`${API_URL}/preregistro/usuario/${usuarioId}`);
      setCourses(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPreregistros();
    }, [fetchPreregistros])
  );

  /*
  ========================================
  LOADING
  ========================================
  */
  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color="#ea580c" />
        <Text style={[styles.loadingText, { color: textSecondary }]}>
          Cargando preregistros...
        </Text>
      </View>
    );
  }

  /*
  ========================================
  UI
  ========================================
  */
  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* ── HEADER ── */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="flame" size={22} color="#fff" />
          </View>
          <View>
            <Text style={[styles.header, { color: textPrimary }]}>Mis preregistros</Text>
            <Text style={[styles.subheader, { color: textSecondary }]}>
              Cursos en los que te anotaste
            </Text>
          </View>
        </View>

        {courses.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{courses.length}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={courses}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}

        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: emptyCircle }]}>
              <Ionicons name="flame-outline" size={44} color="#ea580c" />
            </View>
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>
              Sin preregistros aún
            </Text>
            <Text style={[styles.emptyText, { color: textSecondary }]}>
              Cuando te preregistres en un curso aparecerá aquí
            </Text>
          </View>
        }

        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              {
                backgroundColor: surfaceRaised,
                borderColor: border,
                borderWidth: dark ? 1 : 0,
              },
            ]}
            onPress={() => router.push(`/curso/${item.id}`)}
            activeOpacity={0.85}
          >
            {/* ── IMAGEN ── */}
            {item.imagen_url ? (
              <Image source={{ uri: item.imagen_url }} style={styles.image} />
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: imgPlaceholder }]}>
                <View style={styles.imagePlaceholderInner}>
                  <Ionicons name="image-outline" size={32} color={textTertiary} />
                </View>
              </View>
            )}

            {/* ── INFO ── */}
            <View style={styles.cardContent}>
              <Text style={[styles.title, { color: textPrimary }]} numberOfLines={2}>
                {item.titulo}
              </Text>

              {/* ── STATUS + FLECHA ── */}
              <View style={styles.statusRow}>
                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>
                    {item.estado || "Próximamente"}
                  </Text>
                </View>

                <View style={[styles.arrowCircle, { backgroundColor: dark ? "#ffffff0d" : "#fff7ed" }]}>
                  <Ionicons name="arrow-forward" size={14} color="#ea580c" />
                </View>
              </View>
            </View>

          </TouchableOpacity>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 55,
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

  /* ── HEADER ── */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 18,
    marginBottom: 20,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#ea580c",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ea580c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 28,
  },

  subheader: {
    fontSize: 13,
    marginTop: 1,
  },

  badge: {
    backgroundColor: "#ea580c",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 4,
    shadowColor: "#ea580c",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },

  badgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  /* ── LISTA ── */
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  /* ── CARD ── */
  card: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 4,
  },

  image: {
    width: "100%",
    height: 190,
  },

  imagePlaceholder: {
    width: "100%",
    height: 140,
    justifyContent: "center",
    alignItems: "center",
  },

  imagePlaceholderInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },

  cardContent: {
    padding: 16,
    gap: 12,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 24,
  },

  /* ── STATUS ── */
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff7ed",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#ea580c",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ea580c",
  },

  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  /* ── EMPTY ── */
  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
    gap: 14,
    paddingHorizontal: 40,
  },

  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
});