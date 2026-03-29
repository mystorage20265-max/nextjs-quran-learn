import { View, Text, StyleSheet } from "react-native";

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quran Learn</Text>
      <Text style={styles.subtitle}>Your companion for learning the Quran</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a6b3c",
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
  },
});
