import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#34d399",
        tabBarInactiveTintColor: "#9ca3af",

        // ─── CLAVE: deja pasar el ImageBackground del _layout raíz ───
        sceneStyle: {
          backgroundColor: "transparent",
        },
        // ──────────────────────────────────────────────────────────────

        tabBarStyle: {
          position: "absolute",
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
          borderTopWidth: 0,
          backgroundColor: "#3f3b3b",
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
      }}
    >
      {/* ========================================
          PREREGISTROS
      ======================================== */}
      <Tabs.Screen
        name="preregistros"
        options={{
          title: "Preregistros",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" color={color} size={size} />
          ),
        }}
      />

      {/* ========================================
          INICIO
      ======================================== */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />

      {/* ========================================
          INTERESES
      ======================================== */}
      <Tabs.Screen
        name="intereses"
        options={{
          title: "Favoritos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" color={color} size={size} />
          ),
        }}
      />

      {/* ========================================
          AVISOS
      ======================================== */}


      <Tabs.Screen
        name="avisos"
        options={{
          title: "Avisos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" color={color} size={size} />
          ),
        }}
      />



    </Tabs>
  );
}