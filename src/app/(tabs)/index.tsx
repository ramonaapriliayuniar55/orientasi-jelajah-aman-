// src/app/(tabs)/index.tsx
import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Button,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SearchBox from "../../components/searchbox";
import WeatherCard from "../../components/weathercard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import StatusData from "../../components/StatusData";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingservice";
import {
  ambilCuacaOfflineFirst,
  BATAS_CACHE_MS,
} from "../../services/cuacaRepository";
import {
  bersihkanCacheLama,
  daftarKotaTersimpan,
} from "../../services/cacheRepository";
import {
  mintaIzinLokasi,
  ambilKoordinatSaatIni,
} from "../../services/locationService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { HasilGeocoding } from "../../../types/geocoding";
import { HasilCuacaOffline, RingkasanKotaTersimpan } from "../../../types/cache";
import { useTheme } from "../../context/ThemeContext";

export default function HalamanUtama() {
  const { colors } = useTheme();

  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0);
  const params = useLocalSearchParams();

  // Menangkap pencarian ulang dari Tab Riwayat
  useEffect(() => {
    if (params.nama && params.lat && params.lon) {
      pilihKota({
        id: Math.floor(Math.random() * 10000),
        name: params.nama as string,
        latitude: parseFloat(params.lat as string),
        longitude: parseFloat(params.lon as string),
        country: "",
      });
      router.setParams({ nama: "", lat: "", lon: "" });
    }
  }, [params.nama, params.lat, params.lon]);

  const muatKotaTersimpan = async () => {
    try {
      const daftar = await daftarKotaTersimpan();
      setKotaTersimpan(daftar);
    } catch (e) {
      console.log("Gagal memuat kota tersimpan", e);
    }
  };

  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(muatKotaTersimpan)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }
    cariKota(teksTertunda)
      .then(setHasilPencarian)
      .catch(() => setHasilPencarian([]));
  }, [teksTertunda]);

  async function pilihKota(kota: HasilGeocoding, paksaPerbarui = false) {
    setKotaTerpilih(kota);

    // Simpan ke riwayat pencarian (maksimal 10)
    if (kota.id !== -1) {
      try {
        const KEY_RIWAYAT = "jelajah_aman_riwayat_pencarian";
        const dataLama = await AsyncStorage.getItem(KEY_RIWAYAT);
        const riwayatArray = dataLama ? JSON.parse(dataLama) : [];
        const filtered = riwayatArray.filter(
          (item: any) => item.nama.toLowerCase() !== kota.name.toLowerCase()
        );
        const itemBaru = {
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
          waktu: Date.now(),
        };
        const riwayatBaru = [itemBaru, ...filtered].slice(0, 10);
        await AsyncStorage.setItem(KEY_RIWAYAT, JSON.stringify(riwayatBaru));
      } catch (e) {}
    }

    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);

    try {
      const data = await ambilCuacaOfflineFirst(
        {
          id: kota.id,
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
        },
        { paksaPerbarui }
      );
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(data);
      muatKotaTersimpan();
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(null);
      setPesanError(
        "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi."
      );
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }

  async function gunakanLokasiSaatIni() {
    const status = await mintaIzinLokasi();
    if (status === "denied") {
      setPesanLokasi("Izin lokasi ditolak. Silakan cari kota secara manual di atas.");
      return;
    }
    if (status === "unavailable") {
      setPesanLokasi("Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual.");
      return;
    }
    setPesanLokasi(null);
    const koordinat = await ambilKoordinatSaatIni();
    pilihKota({
      id: -1,
      name: "Lokasi Saat Ini",
      latitude: koordinat.latitude,
      longitude: koordinat.longitude,
      country: "",
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBox onCari={setTeksCari} />
        
        <Button
          title="Gunakan Lokasi Saat Ini"
          color={colors.primary}
          onPress={gunakanLokasiSaatIni}
        />
        
        {pesanLokasi && (
          <Text style={{ color: colors.subText }} accessibilityLabel={pesanLokasi}>
            {pesanLokasi}
          </Text>
        )}

        {/* HASIL PENCARIAN */}
        {hasilPencarian.length > 0 && (
          <View
            style={{
              gap: 8,
              backgroundColor: colors.cardBg,
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontWeight: "bold", color: colors.text }}>
              Hasil Pencarian:
            </Text>
            {hasilPencarian.map((kota) => (
              <TouchableOpacity
                key={kota.id}
                onPress={() => pilihKota(kota)}
                style={{
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 16, color: colors.text }}>
                  {kota.name} {kota.country ? `(${kota.country})` : ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* KOTA TERSIMPAN DI CACHE OFFLINE */}
        {kotaTersimpan.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "bold", color: colors.text }}>
              Tersimpan di perangkat (bisa dibuka offline)
            </Text>
            {kotaTersimpan.map((k) => (
              <TouchableOpacity
                key={k.kunci}
                onPress={() =>
                  pilihKota({
                    id: k.id,
                    name: k.nama,
                    latitude: k.latitude,
                    longitude: k.longitude,
                    country: "",
                  })
                }
                style={{
                  padding: 10,
                  backgroundColor: colors.cardBg,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.text, fontWeight: "500" }}>{k.nama}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {sedangMemuat && <ActivityIndicator color={colors.primary} />}

        {pesanError && (
          <View style={{ gap: 8 }}>
            <Text style={{ color: "#EF4444" }} accessibilityLabel={pesanError}>
              {pesanError}
            </Text>
            <Button
              title="Coba Lagi"
              color={colors.primary}
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
            />
          </View>
        )}

        {hasil && kotaTerpilih && !sedangMemuat && (
          <>
            <StatusData sumber={hasil.sumber} disimpanPada={hasil.disimpanPada} />
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
            />
            <Text style={{ fontSize: 12, color: colors.subText }}>
              Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)} {"\u2022"} Angin{" "}
              {hasil.cuaca.saatIni.kecepatanAngin} km/j
            </Text>
            <Button
              title="Perbarui Sekarang"
              color={colors.primary}
              onPress={() => pilihKota(kotaTerpilih, true)}
            />
            <Button
              title="Tambahkan ke Favorit"
              color={colors.primary}
              onPress={() =>
                router.push({
                  pathname: "/tambah-favorit",
                  params: {
                    id: String(kotaTerpilih.id),
                    nama: kotaTerpilih.name,
                    lat: String(kotaTerpilih.latitude),
                    lon: String(kotaTerpilih.longitude),
                  },
                })
              }
            />
          </>
        )}

        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}
