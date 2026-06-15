import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function EnValidacion() {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* ========================================
          HEADER
      ======================================== */}
      <View style={styles.headerSection}>

        <View style={styles.iconCircle}>
          <Ionicons name="time-outline" size={48} color="#fff" />
        </View>

        <Text style={styles.title}>Cuenta en validación</Text>

        <View style={styles.statusBadge}>
          <Ionicons name="ellipse" size={8} color="#fbbf24" />
          <Text style={styles.statusText}>PENDIENTE DE REVISIÓN</Text>
        </View>

      </View>

      {/* ========================================
          CARD
      ======================================== */}
      <View style={styles.card}>

        <Text style={styles.sectionTitle}>¿Qué sigue?</Text>

        <InfoRow
          icon="shield-checkmark-outline"
          title="Revisión en proceso"
          description="Un administrador está revisando tu información para verificar que eres parte del TecNM."
        />

        <InfoRow
          icon="notifications-outline"
          title="Te avisaremos"
          description="Recibirás una notificación en cuanto tu cuenta sea aprobada."
        />

        <InfoRow
          icon="log-in-outline"
          title="Acceso completo"
          description="Una vez aprobada, podrás explorar cursos, avisos y todo el contenido de AvisaTec."
        />

      </View>

    </ScrollView>
  );
}

function InfoRow({
  icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBox}>
        <Ionicons name={icon} size={18} color="#059669" />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{title}</Text>
        <Text style={styles.infoValue}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingBottom: 40,
  },

  /* ── HEADER ── */
  headerSection: {
    alignItems: "center",
    marginBottom: 26,
    paddingTop: 48,
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

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(251,191,36,0.15)",
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.3)",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
  },

  statusText: {
    color: "#fbbf24",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.5,
  },

  /* ── CARD ── */
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
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
    marginTop: 4,
    marginLeft: 2,
  },

  /* ── FILAS ── */
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    marginTop: 2,
  },

  infoText: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 19,
  },

});