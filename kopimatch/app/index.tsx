import { Link } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function Home() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        <Text style={styles.brand}>KopiMatch</Text>
        <Text style={styles.tagline}>Temukan barista & kafe yang cocok untukmu.</Text>
        <Link href="/jobs" asChild>
          <Pressable style={styles.cta}>
            <Text style={styles.ctaText}>Lihat Loker</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#faf6ee" },
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  brand: { fontSize: 36, fontWeight: "900", color: "#2b1a10" },
  tagline: { fontSize: 15, color: "#6b5d4f", textAlign: "center" },
  cta: { marginTop: 12, backgroundColor: "#2b1a10", borderRadius: 999, paddingVertical: 14, paddingHorizontal: 36 },
  ctaText: { color: "#f5ead6", fontSize: 16, fontWeight: "800" },
});
