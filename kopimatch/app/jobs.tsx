import { memo, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

type Job = {
  id: string;
  title: string;
  location: string;
  salary_text: string | null;
  employment_types: string[] | null;
  cafes: { name: string }[] | null;
};

const cafeName = (job: Job) => job.cafes?.[0]?.name ?? "";

const JobCard = memo(({ job }: { job: Job }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{job.title}</Text>
    <Text style={styles.sub}>
      {[cafeName(job), job.location].filter(Boolean).join(" · ")}
    </Text>
    <View style={styles.row}>
      {(job.employment_types ?? []).map((t) => (
        <View key={t} style={styles.chip}>
          <Text style={styles.chipText}>{t}</Text>
        </View>
      ))}
      {job.salary_text ? <Text style={styles.salary}>{job.salary_text}</Text> : null}
    </View>
  </View>
));

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("job_posts")
      .select("id,title,location,salary_text,employment_types,cafes(name)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) setError(error.message);
    else setJobs((data as unknown as Job[]) ?? []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = useCallback(({ item }: { item: Job }) => <JobCard job={item} />, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2b1a10" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={jobs}
        keyExtractor={(j) => j.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={!error ? <Text style={styles.empty}>Belum ada loker aktif.</Text> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#faf6ee" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 4, elevation: 2 },
  title: { fontSize: 16, fontWeight: "800", color: "#2b1a10" },
  sub: { fontSize: 13, color: "#6b5d4f" },
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 6 },
  chip: { backgroundColor: "#efe6d4", borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  chipText: { fontSize: 12, fontWeight: "700", color: "#2b1a10" },
  salary: { fontSize: 13, fontWeight: "700", color: "#1f6b4a", marginLeft: "auto" },
  error: { color: "#b3261e", padding: 16, textAlign: "center" },
  empty: { textAlign: "center", color: "#6b5d4f", marginTop: 32 },
});
