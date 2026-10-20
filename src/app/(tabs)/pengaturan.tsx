// src/app/(tabs)/pengaturan.tsx
import React, { useState } from "react";
import { View, Text, Button, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { hapusSemuaCache } from "../../services/cacheRepository";
import { useTheme, ModeTema } from "../../context/ThemeContext";

export default function TabPengaturan() {
  const [pesan, setPesan] = useState<string | null>(null);
  const { mode, setMode, colors } = useTheme();

  async function hapusDataTersimpan() {
    await hapusSemuaCache();
    setPesan("Data cuaca tersimpan sudah dihapus.");
  }

  const pilihanTema: { label: string; value: ModeTema }[] = [
    { label: "Terang (Light Mode)", value: "light" },
    { label: "Gelap (Dark Mode)", value: "dark" },
    { label: "Ikuti Sistem", value: "system" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 16, gap: 16 }}>
      {/* INFORMASI APLIKASI */}
      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}>Jelajah Aman</Text>
        <Text style={{ color: colors.subText }}>Versi 1.0.0</Text>
      </View>

      <View style={{ height: 1, backgroundColor: colors.border }} />

      {/* SEKSI PILIHAN TEMA (TUGAS NO 4) */}
      <View style={{ gap: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.text }}>
          Pilihan Mode Tampilan
        </Text>
        {pilihanTema.map((item) => {
          const terpilih = mode === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              onPress={() => setMode(item.value)}
              style={{
                padding: 12,
                borderRadius: 8,
                backgroundColor: terpilih ? colors.primary : colors.cardBg,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: terpilih ? "bold" : "normal",
                  color: terpilih ? "#FFFFFF" : colors.text,
                }}
              >
                {item.label}
              </Text>
              {terpilih && (
                <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>✓</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ height: 1, backgroundColor: colors.border }} />

      {/* SEKSI HAPUS CACHE GLOBAL (BAWAAN SIKLUS SEBELUMNYA) */}
      <View style={{ gap: 8 }}>
        <Button title="Hapus Data Cuaca Tersimpan" onPress={hapusDataTersimpan} color="#EF4444" />
        {pesan && (
          <Text style={{ color: colors.primary }} accessibilityLabel={pesan}>
            {pesan}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
