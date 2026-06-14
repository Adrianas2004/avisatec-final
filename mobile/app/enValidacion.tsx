import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function EnValidacion() {

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Cuenta en validación
      </Text>

      <Text style={styles.text}>
        Tu cuenta está siendo revisada
        por un administrador.
      </Text>

      <Text style={styles.text}>
        Una vez aprobada podrás
        acceder a la plataforma.
      </Text>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#111827",
  },

  text: {
    textAlign: "center",
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 10,
  },

});