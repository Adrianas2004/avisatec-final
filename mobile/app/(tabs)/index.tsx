import {
  useState,
  useCallback,
  useEffect
} from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
  Pressable,
  useColorScheme,
  Animated,
  Alert
} from "react-native";

import { registerForPushNotificationsAsync } from "../../lib/notifications";

import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/api";

export default function HomeScreen() {
  const [courses, setCourses] = useState<any[]>([]);
  const [newCourses, setNewCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);

  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Animación del anillo pulsante de la campanita
  const pulseAnim = useState(new Animated.Value(1))[0];
  const insets = useSafeAreaInsets();

  function tiempoRelativo(fecha: string) {
    const ahora = new Date().getTime();
    const tiempo = new Date(fecha).getTime();
    const diferencia = Math.floor((ahora - tiempo) / 1000);
    if (diferencia < 60) return "Hace unos segundos";
    if (diferencia < 3600) return `Hace ${Math.floor(diferencia / 60)} min`;
    if (diferencia < 86400) return `Hace ${Math.floor(diferencia / 3600)} h`;
    if (diferencia < 172800) return "Ayer";
    return `Hace ${Math.floor(diferencia / 86400)} días`;
  }

  const scheme = useColorScheme();
  const dark = scheme === "dark";

  const bg             = dark ? "rgba(15,15,15,0.55)"  : "rgba(243,244,246,0.55)";
  const surfaceRaised  = dark ? "#252528"              : "rgba(255,255,255,0.95)";
  const textPrimary    = dark ? "#f3f4f6"              : "#111827";
  const textSecondary  = dark ? "#9ca3af"              : "#6b7280";
  const textTertiary   = dark ? "#6b7280"              : "#9ca3af";
  const border         = dark ? "#ffffff12"            : "transparent";
  const searchBg       = dark ? "rgba(28,28,30,0.92)"  : "rgba(255,255,255,0.92)";
  const searchText     = dark ? "#f3f4f6"              : "#111827";
  const placeholder    = dark ? "#6b7280"              : "#9ca3af";
  const badgeBg        = dark ? "#064e3b"              : "#ecfdf5";
  const badgeText      = dark ? "#6ee7b7"              : "#065f46";
  const dividerColor   = dark ? "#ffffff0d"            : "#f3f4f6";
  const menuBg         = dark ? "#1c1c1e"              : "#ffffff";
  const menuIconBg     = dark ? "#05966920"            : "#ecfdf5";
  const menuIconDanger = dark ? "#7f1d1d30"            : "#fef2f2";
  const separatorLine  = dark ? "#2d2d30"              : "#d1fae5";
  const separatorBadge = dark ? "rgba(28,28,30,0.92)"  : "rgba(255,255,255,0.92)";
  const imgPlaceholder = dark ? "#27272a"              : "#f1f5f9";
  const emptyCircle    = dark ? "#05966920"            : "#ecfdf5";
  const arrowCircle    = dark ? "#05966920"            : "#ecfdf5";
  const accentColor    = "#059669";
  const accentLight    = dark ? "#6ee7b7" : "#059669";

  // Animación pulsante cuando hay notificaciones sin leer
  useEffect(() => {
    const unread = notifications.filter(n => !n.leida).length;
    if (unread > 0) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [notifications]);

  async function getUsuarioId() {
    try {
      const user = await getCurrentUser();
      const cognitoSub = user.userId;
      const response = await axios.get(`${API_URL}/users/${cognitoSub}`);
      const usuario = response.data.user;
      setUsuarioId(usuario.id);
      setUsuario(usuario);
      return usuario.id;
    } catch (error) {
      console.log("ERROR OBTENIENDO USUARIO:");
      console.log(error);
      return null;
    }
  }

  const fetchCourses = useCallback(async () => {
    try {
      const currentUserId = await getUsuarioId();
      if (!currentUserId) return;
      const response = await axios.get(`${API_URL}/publicaciones/recomendadas/${currentUserId}`);
      console.log("Total cursos del backend:", response.data.length);
      let data = response.data;
      const hoy = new Date();
      data = data.filter((item: any) => {
        if (!item.fecha_fin) return true;
        const fechaFin = new Date(item.fecha_fin);
        return fechaFin >= hoy;
      });
      Alert.alert("Debug", `Backend: ${response.data.length} cursos, después filtro: ${data.length}`);
      if (search.trim()) {
        data = data.filter((item: any) =>
          item.titulo?.toLowerCase().includes(search.toLowerCase())
        );
      }
      setCourses(data);
    } catch (error) {
      console.log("ERROR API:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, usuarioId]);

  const fetchNewCourses = useCallback(async () => {
    try {
      const currentUserId = await getUsuarioId();
      if (!currentUserId) return;
      const response = await axios.get(`${API_URL}/publicaciones/new-for-you/${currentUserId}`);
      setNewCourses(response.data);
    } catch (error) {
      console.log("ERROR NUEVOS:", error);
    }
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await fetchCourses();
  }

  async function loadNotifications() {
    try {
      const userId = usuarioId || await getUsuarioId();
      if (!userId) return;
      const response = await axios.get(`${API_URL}/notificaciones/${userId}`);
      setNotifications(response.data);
    } catch (error) {
      console.log("ERROR CARGANDO NOTIFICACIONES");
      console.log(error);
    }
  }

  async function cerrarSesion() {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      console.log(error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchCourses();
      fetchNewCourses();
      loadNotifications();
    }, [fetchCourses, fetchNewCourses])
  );

  useEffect(() => {
    registrarPush();
    loadNotifications();
    const interval = setInterval(() => { loadNotifications(); }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color={accentColor} />
        <Text style={[styles.loadingText, { color: textSecondary }]}>Cargando cursos...</Text>
      </View>
    );
  }

  const unreadCount = notifications.filter(n => !n.leida).length;

  const renderNewCoursesGrid = () => {
    if (newCourses.length === 0) return null;
    const rows: any[][] = [];
    for (let i = 0; i < newCourses.length; i += 2) {
      rows.push(newCourses.slice(i, i + 2));
    }
    return (
      <View style={styles.newSection}>
        <View style={styles.newHeader}>
          <View style={styles.newHeaderLeft}>
            <View style={styles.newIconCircle}>
              <Ionicons name="flash" size={16} color="#fff" />
            </View>
            <View>
              <Text style={[styles.newTitle, { color: textPrimary }]}>Nuevo para ti</Text>
              <Text style={[styles.newSubtitle, { color: textSecondary }]}>Cursos recién agregados</Text>
            </View>
          </View>
        </View>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.newRow}>
            {row.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.newCard, { backgroundColor: surfaceRaised, borderColor: border, borderWidth: 1 }]}
                activeOpacity={0.88}
                onPress={() => router.push(`/curso/${item.id}`)}
              >
                {item.imagen_url ? (
                  <Image source={{ uri: item.imagen_url }} style={styles.newImage} />
                ) : (
                  <View style={[styles.newImagePlaceholder, { backgroundColor: imgPlaceholder }]}>
                    <Ionicons name="image-outline" size={26} color={textTertiary} />
                  </View>
                )}
                <View style={styles.newImageOverlay} />
                <View style={styles.newCardBody}>
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NUEVO</Text>
                  </View>
                  <Text style={[styles.newCardTitle, { color: textPrimary }]} numberOfLines={2}>
                    {item.titulo}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            {row.length === 1 && <View style={styles.newCardEmpty} />}
          </View>
        ))}
        <View style={styles.separator}>
          <View style={[styles.separatorLine, { backgroundColor: separatorLine }]} />
          <View style={[styles.separatorBadge, { backgroundColor: separatorBadge, borderColor: border, borderWidth: dark ? 1 : 0 }]}>
            <Ionicons name="time-outline" size={18} color={accentColor} />
            <Text style={[styles.separatorText, { color: textSecondary }]}>Todos los cursos</Text>
          </View>
          <View style={[styles.separatorLine, { backgroundColor: separatorLine }]} />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* ── HEADER ── */}
      <View style={styles.topBar}>
        <View style={styles.headerTextGroup}>
          <Text style={[styles.header, { color: textPrimary }]}>🔥 Cursos para ti</Text>
          <Text style={[styles.subheader, { color: textSecondary }]}>Basado en tus intereses</Text>
        </View>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={[styles.profileButton, { backgroundColor: accentColor }]}
          activeOpacity={0.85}
        >
          {usuario?.foto_url ? (
            <Image source={{ uri: usuario.foto_url }} style={styles.profileImage} />
          ) : (
            <Text style={styles.profileLetter}>
              {usuario?.nombre?.charAt(0)?.toUpperCase() || "A"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── SEARCH + EDITAR ── */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputWrapper, { backgroundColor: searchBg, borderColor: border, borderWidth: dark ? 1 : 0 }]}>
          <Ionicons name="search-outline" size={18} color={placeholder} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: searchText }]}
            placeholder="Buscar cursos..."
            placeholderTextColor={placeholder}
            value={search}
            onChangeText={(text) => setSearch(text)}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color={placeholder} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: accentColor }]}
          onPress={() => router.push("/editarIntereses")}
          activeOpacity={0.85}
        >
          <Ionicons name="sparkles" size={16} color="#fff" />
          <Text style={styles.editButtonText}>Intereses</Text>
        </TouchableOpacity>
      </View>

      {/* ── MODAL MENÚ PERFIL ── */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuContainer, { backgroundColor: menuBg, borderColor: border, borderWidth: dark ? 1 : 0 }]}>
            {usuario && (
              <View style={styles.menuHeader}>
                <View style={[styles.menuAvatar, { backgroundColor: accentColor }]}>
                  {usuario?.foto_url ? (
                    <Image source={{ uri: usuario.foto_url }} style={styles.menuAvatarImage} />
                  ) : (
                    <Text style={styles.menuAvatarLetter}>
                      {usuario?.nombre?.charAt(0)?.toUpperCase() || "A"}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuName, { color: textPrimary }]} numberOfLines={1}>
                    {usuario?.nombre} {usuario?.apellidos}
                  </Text>
                  <Text style={[styles.menuEmail, { color: textSecondary }]} numberOfLines={1}>
                    {usuario?.email || ""}
                  </Text>
                </View>
              </View>
            )}
            <View style={[styles.menuDivider, { backgroundColor: dividerColor }]} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); router.push("/perfil"); }}>
              <View style={[styles.menuIconBox, { backgroundColor: menuIconBg }]}>
                <Ionicons name="person-outline" size={17} color={accentColor} />
              </View>
              <Text style={[styles.menuText, { color: textPrimary }]}>Ver perfil</Text>
              <Ionicons name="chevron-forward" size={15} color={textTertiary} style={{ marginLeft: "auto" }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); router.push("/configurarPerfil"); }}>
              <View style={[styles.menuIconBox, { backgroundColor: menuIconBg }]}>
                <Ionicons name="settings-outline" size={17} color={accentColor} />
              </View>
              <Text style={[styles.menuText, { color: textPrimary }]}>Configurar perfil</Text>
              <Ionicons name="chevron-forward" size={15} color={textTertiary} style={{ marginLeft: "auto" }} />
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: dividerColor }]} />
            <TouchableOpacity style={styles.menuItem} onPress={cerrarSesion}>
              <View style={[styles.menuIconBox, { backgroundColor: menuIconDanger }]}>
                <Ionicons name="log-out-outline" size={17} color="#dc2626" />
              </View>
              <Text style={[styles.menuText, { color: "#dc2626" }]}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ── LISTA PRINCIPAL ── */}
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={accentColor}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110, paddingTop: 4 }}
        ListHeaderComponent={renderNewCoursesGrid()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: emptyCircle }]}>
              <Ionicons name="school-outline" size={40} color={accentLight} />
            </View>
            <Text style={[styles.emptyTitle, { color: dark ? "#e5e7eb" : "#374151" }]}>Sin resultados</Text>
            <Text style={[styles.emptyText, { color: textTertiary }]}>
              {search.trim()
                ? `No hay cursos que coincidan con "${search}"`
                : "No hay cursos disponibles por el momento"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: surfaceRaised, borderColor: border, borderWidth: dark ? 1 : 0 }]}
            activeOpacity={0.88}
            onPress={() => router.push(`/curso/${item.id}`)}
          >
            {item.imagen_url ? (
              <Image source={{ uri: item.imagen_url }} style={styles.image} />
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: imgPlaceholder }]}>
                <Ionicons name="image-outline" size={36} color={textTertiary} />
              </View>
            )}
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: textPrimary }]} numberOfLines={2}>
                {item.titulo}
              </Text>
              <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
                  <View style={[styles.statusDot, { backgroundColor: accentLight }]} />
                  <Text style={[styles.statusText, { color: badgeText }]}>
                    {item.estado || "Disponible"}
                  </Text>
                </View>
                <View style={[styles.cardArrow, { backgroundColor: arrowCircle }]}>
                  <Ionicons name="arrow-forward" size={14} color={accentLight} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* ========================================
          BOTÓN NOTIFICACIONES — con anillo pulsante
      ======================================== */}
      {/* ── bottom dinámico: altura del tab bar (60) + inset inferior + margen (16) ── */}
      <View
        style={[styles.notificationWrapper, { bottom: 60 + insets.bottom + 16 }]}
        pointerEvents="box-none"
      >
        {/* Anillo exterior pulsante — solo visible cuando hay no leídas */}
        {unreadCount > 0 && (
          <Animated.View
            style={[
              styles.notificationRing,
              { transform: [{ scale: pulseAnim }] },
            ]}
            pointerEvents="none"
          />
        )}
        <TouchableOpacity
          style={styles.notificationButton}
          activeOpacity={0.85}
          onPress={async () => {
            await loadNotifications();
            setNotificationsVisible(!notificationsVisible);
          }}
        >
          <Ionicons name="notifications" size={28} color="#fff" />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ========================================
          PANEL NOTIFICACIONES
      ======================================== */}
      <Modal visible={notificationsVisible} transparent animationType="slide">
        <Pressable
          style={styles.notificationsOverlay}
          onPress={() => setNotificationsVisible(false)}
        >
          <Pressable style={[styles.notificationsPanel, { backgroundColor: dark ? "#111827" : "#fff" }]}>

            {/* Handle */}
            <View style={styles.panelHandle} />

            {/* HEADER DEL PANEL */}
            <View style={styles.notificationsHeader}>
              <View style={styles.notificationsHeaderLeft}>
                <View style={styles.notifHeaderIcon}>
                  <Ionicons name="notifications" size={22} color="#fff" />
                </View>
                <View>
                  <Text style={[styles.notificationsTitle, { color: textPrimary }]}>
                    Notificaciones
                  </Text>
                  {unreadCount > 0 && (
                    <Text style={styles.notifSubtitle}>
                      {unreadCount} sin leer
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.notifCloseBtn}
                onPress={() => setNotificationsVisible(false)}
              >
                <Ionicons name="close" size={22} color={dark ? "#9ca3af" : "#6b7280"} />
              </TouchableOpacity>
            </View>

            {/* LISTA DE NOTIFICACIONES */}
            {notifications.length === 0 ? (
              <View style={styles.notificationsEmpty}>
                <View style={[styles.notifEmptyCircle, { backgroundColor: dark ? "#064e3b" : "#ecfdf5" }]}>
                  <Ionicons name="notifications-off-outline" size={42} color={accentColor} />
                </View>
                <Text style={[styles.notificationsEmptyTitle, { color: textPrimary }]}>
                  Todo al día
                </Text>
                <Text style={[styles.notificationsEmptyText, { color: textSecondary }]}>
                  No tienes notificaciones por ahora
                </Text>
              </View>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
                ItemSeparatorComponent={() => (
                  <View style={[styles.notifSeparator, { backgroundColor: dark ? "#1f2937" : "#f3f4f6" }]} />
                )}
                renderItem={({ item }) => {
                  const unread = !item.leida;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.notificationItem,
                        unread && { backgroundColor: dark ? "rgba(5,150,105,0.1)" : "rgba(5,150,105,0.06)" },
                      ]}
                      activeOpacity={0.8}
                      onPress={async () => {

                        console.log("NOTIFICACION");
                        console.log(item);

                        await axios.patch(`${API_URL}/notificaciones/${item.id}/read`);
                        await loadNotifications();

                        setNotificationsVisible(false);

                        if (item.course_id) {
                          router.push(`/curso/${item.course_id}`);
                          return;
                        }

                        if (item.aviso_id) {
                          router.push(`/aviso/${item.aviso_id}`);
                          return;
                        }
                      }}
                    >
                      {/* Ícono izquierdo */}
                      <View style={[styles.notificationIcon, { backgroundColor: unread ? accentColor : (dark ? "#374151" : "#e5e7eb") }]}>
                        <Ionicons name="school" size={20} color={unread ? "#fff" : (dark ? "#9ca3af" : "#6b7280")} />
                      </View>

                      {/* Contenido */}
                      <View style={{ flex: 1 }}>
                        <View style={styles.notifItemHeader}>
                          <Text style={[styles.notificationItemTitle, { color: textPrimary, flex: 1 }]} numberOfLines={1}>
                            {item.titulo}
                          </Text>
                          {unread && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={[styles.notificationItemBody, { color: textSecondary }]} numberOfLines={2}>
                          {item.mensaje}
                        </Text>
                        <Text style={[styles.notificationItemTime, { color: accentColor }]}>
                          {tiempoRelativo(item.created_at)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            )}

          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}

async function registrarPush() {
  try {
    const token = await registerForPushNotificationsAsync();
    console.log("TOKEN PUSH:", token);
  } catch (error) {
    console.log(error);
  }
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
    gap: 14,
  },

  loadingText: {
    fontSize: 15,
    fontWeight: "500",
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 18,
    marginBottom: 16,
  },

  headerTextGroup: {
    flex: 1,
    marginRight: 12,
  },

  header: {
    fontSize: 28,
    fontWeight: "bold",
  },

  subheader: {
    fontSize: 14,
    marginTop: 3,
  },

  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  profileLetter: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginBottom: 16,
    gap: 10,
  },

  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 12,
    elevation: 2,
  },

  searchIcon: { marginRight: 8 },

  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
  },

  clearButton: { padding: 4 },

  editButton: {
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: "row",
    paddingHorizontal: 14,
    gap: 6,
  },

  editButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },

  menuContainer: {
    marginTop: 88,
    marginRight: 15,
    borderRadius: 20,
    paddingVertical: 8,
    width: 250,
    elevation: 16,
    overflow: "hidden",
  },

  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },

  menuAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },

  menuAvatarImage: { width: 42, height: 42, borderRadius: 21 },

  menuAvatarLetter: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  menuName: { fontSize: 14, fontWeight: "700" },
  menuEmail: { fontSize: 12, marginTop: 2 },
  menuDivider: { height: 1, marginVertical: 4 },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },

  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  menuText: { fontSize: 15, fontWeight: "600" },

  newSection: { marginBottom: 4 },

  newHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 14,
  },

  newHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 12 },

  newIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
  },

  newTitle: { fontSize: 20, fontWeight: "800" },
  newSubtitle: { fontSize: 12, marginTop: 1 },

  newRow: {
    flexDirection: "row",
    paddingHorizontal: 18,
    gap: 12,
    marginBottom: 12,
  },

  newCard: { flex: 1, borderRadius: 16, overflow: "hidden", elevation: 4 },
  newCardEmpty: { flex: 1 },
  newImage: { width: "100%", height: 110 },

  newImageOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 110,
    backgroundColor: "rgba(0,0,0,0.08)",
  },

  newImagePlaceholder: {
    width: "100%",
    height: 110,
    justifyContent: "center",
    alignItems: "center",
  },

  newCardBody: { padding: 10 },

  newBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#dc2626",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 6,
  },

  newBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  newCardTitle: { fontSize: 13, fontWeight: "700", lineHeight: 18 },

  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginTop: 8,
    marginBottom: 20,
    gap: 10,
  },

  separatorLine: { flex: 2, height: 1.5, borderRadius: 1 },

  separatorBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 5,
    elevation: 2,
  },

  separatorText: { fontSize: 12, fontWeight: "600" },

  card: {
    marginHorizontal: 18,
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
  },

  image: { width: "100%", height: 200 },

  imagePlaceholder: {
    width: "100%",
    height: 140,
    justifyContent: "center",
    alignItems: "center",
  },

  cardBody: { padding: 16 },

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
    lineHeight: 24,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },

  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontWeight: "700", fontSize: 13 },

  cardArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 40,
  },

  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  emptyTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  emptyText: { fontSize: 15, textAlign: "center", lineHeight: 22 },

  /* ── WRAPPER NOTIFICACIONES (para el anillo + botón) ── */
  notificationWrapper: {
    position: "absolute",
    right: 22,
    // bottom se sobreescribe dinámicamente con insets en el JSX
    width: 68,
    height: 68,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Anillo exterior pulsante */
  notificationRing: {
    position: "absolute",
    width: 68,
    height: 68,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#000000",
    opacity: 0.70,
  },

  /* ── BOTÓN NOTIFICACIONES ── */
  notificationButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#030303",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.65,
    shadowRadius: 14,
    elevation: 12,
  },

  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#dc2626",
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
    borderWidth: 2.5,
    borderColor: "#059669",
  },

  notificationBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  /* ── PANEL NOTIFICACIONES ── */
  notificationsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  notificationsPanel: {
    height: "75%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 18,
    paddingBottom: 0,
  },

  /* Handle tipo sheet */
  panelHandle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#d1fae5",
    alignSelf: "center",
    marginBottom: 18,
  },

  notificationsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  notificationsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  /* Círculo verde en header del panel */
  notifHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },

  notificationsTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },

  notifSubtitle: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "600",
    marginTop: 1,
  },

  notifCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(107,114,128,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Empty state */
  notificationsEmpty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingBottom: 60,
  },

  notifEmptyCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },

  notificationsEmptyTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  notificationsEmptyText: {
    fontSize: 15,
    textAlign: "center",
  },

  notifSeparator: {
    height: 1,
    marginHorizontal: 4,
  },

  /* Item notificación */
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 6,
    borderRadius: 14,
  },

  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },

  notifItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 5,
  },

  /* Punto verde de no leída */
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#059669",
  },

  notificationItemTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  notificationItemBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },

  notificationItemTime: {
    fontSize: 13,
    fontWeight: "600",
  },
});