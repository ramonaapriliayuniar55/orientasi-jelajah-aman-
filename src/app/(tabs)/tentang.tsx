// src/app/(tabs)/tentang.tsx
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typeScale, spacing } from "../../constants/styles";
import { useTheme } from "../../context/ThemeContext";

export default function TabTentang() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, padding: spacing.sedang, backgroundColor: colors.background }}>
      <Text 
        style={{ 
          fontSize: typeScale.judul, 
          fontWeight: "bold", 
          marginBottom: spacing.sedang,
          color: colors.text 
        }}
        accessibilityLabel="Judul Halaman Tentang Aplikasi"
      >
        Tentang Aplikasi
      </Text>

      <View 
        style={{ 
          backgroundColor: colors.cardBg, 
          padding: spacing.sedang, 
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border
        }}
      >
        <Text style={{ fontSize: typeScale.subjudul, color: colors.subText }}>Nama Aplikasi</Text>
        <Text style={{ fontSize: typeScale.isi, color: colors.text, marginBottom: spacing.sedang }}>
          Aplikasi Informasi Cuaca (Jelajah Aman)
        </Text>

        <Text style={{ fontSize: typeScale.subjudul, color: colors.subText }}>Versi</Text>
        <Text style={{ fontSize: typeScale.isi, color: colors.text, marginBottom: spacing.sedang }}>
          1.0.0
        </Text>

        <Text style={{ fontSize: typeScale.subjudul, color: colors.subText }}>Pembuat</Text>
        <Text style={{ fontSize: typeScale.isi, color: colors.text }}>
          Ramona Aprilia Yuniar
        </Text>
      </View>
    </SafeAreaView>
  );
}
