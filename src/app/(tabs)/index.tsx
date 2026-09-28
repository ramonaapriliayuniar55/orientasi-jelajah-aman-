// src/app/(tabs)/index.tsx
import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBox from "../../components/searchbox";
import WeatherCard from "../../components/weathercard";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingservice";
import { HasilGeocoding } from "../../../types/geocoding";

export default function HalamanUtama() {
  const [teksCari, setTeksCari] = useState("");
  const [hasil, setHasil] = useState<HasilGeocoding[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  // 1. Debounce delay 800ms
  const teksTertunda = useDebounce(teksCari, 800);

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasil([]);
      setPesanError(null);
      return;
    }
    ambilData(teksTertunda);
  }, [teksTertunda]);

  async function ambilData(nama: string) {
    setSedangMemuat(true);
    setPesanError(null);
    try {
      const data = await cariKota(nama);
      setHasil(data);
    } catch (err) {
      setPesanError("Gagal mengambil data. Periksa koneksi internet Anda.");
    } finally {
      setSedangMemuat(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 16 }}>
      <SearchBox onCari={setTeksCari} />
      
      {sedangMemuat && <ActivityIndicator />}

      {/* 2. Pesan Error dengan accessibilityLabel */}
      {pesanError && (
        <View>
          <Text accessibilityLabel={`Pesan error: ${pesanError}`}>
            {pesanError}
          </Text>
          <Button title="Coba Lagi" onPress={() => ambilData(teksTertunda)} />
        </View>
      )}

      {/* 3. Pesan Kosong dengan accessibilityLabel */}
      {!sedangMemuat && !pesanError && teksTertunda.trim().length > 0 && hasil.length === 0 && (
        <Text accessibilityLabel="Pesan: Kota tidak ditemukan">
          Kota tidak ditemukan
        </Text>
      )}

      {/* 4. Indikator Jumlah Hasil (Ditemukan X kota) */}
      {!sedangMemuat && !pesanError && hasil.length > 0 && (
        <Text style={{ fontWeight: "bold" }}>
          Ditemukan {hasil.length} kota
        </Text>
      )}

      {/* Daftar WeatherCard */}
      {hasil.map((kota) => (
        <WeatherCard key={kota.id} kota={kota.name} suhu={29} tingkatAQI="BAIK" />
      ))}
    </SafeAreaView>
  );
}