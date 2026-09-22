import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typeScale, spacing } from "../../constants/styles";

export default function TabTentang() {
  return (
    <SafeAreaView style={{ flex: 1, padding: spacing.sedang, backgroundColor: "#f4f5f7" }}>
      <Text 
        style={{ fontSize: typeScale.judul, fontWeight: "bold", marginBottom: spacing.sedang }}
        accessibilityLabel="Judul Halaman Tentang Aplikasi"
      >
        Tentang Aplikasi
      </Text>

      <View style={{ backgroundColor: "#fff", padding: spacing.sedang, borderRadius: 12 }}>
        <Text style={{ fontSize: typeScale.subjudul, color: "#666" }}>Nama Aplikasi</Text>
        <Text style={{ fontSize: typeScale.isi, marginBottom: spacing.sedang }}>Aplikasi Informasi Cuaca</Text>

        <Text style={{ fontSize: typeScale.subjudul, color: "#666" }}>Versi</Text>
        <Text style={{ fontSize: typeScale.isi, marginBottom: spacing.sedang }}>1.0.0</Text>

        <Text style={{ fontSize: typeScale.subjudul, color: "#666" }}>Pembuat</Text>
        <Text style={{ fontSize: typeScale.isi }}>Ramona Aprilia Yuniar</Text>
      </View>
    </SafeAreaView>
  );
}
