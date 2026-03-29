import { View, Text, StyleSheet } from 'react-native';

export default function QuranTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Quran</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 24, fontWeight: 'bold', color: '#1a6b3c' },
});
