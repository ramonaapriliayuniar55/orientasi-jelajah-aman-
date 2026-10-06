// src/app/(tabs)/index.tsx
import { useState, useEffect, useRef } from "react";
import { View, Text, ActivityIndicator, Button, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBox from "../../components/searchbox";
import WeatherCard from "../../components/weathercard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingservice";
import { ambilCuaca } from "../../services/weatherService";
import { ambilKualitasUdara } from "../../services/airQualityService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { HasilGeocoding } from "../../../types/geocoding";
import { DataCuacaLengkap, DataKualitasUdara } from "../../../types/weather";
import { mintaIzinLokasi, ambilKoordinatSaatIni } from "../../services/locationService";
import { router } from "expo-router";


export default function HalamanUtama() {
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [cuaca, setCuaca] = useState<DataCuacaLengkap | null>(null);
  const [kualitasUdara, setKualitasUdara] = useState<DataKualitasUdara | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0); // pencegah race condition

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }
    cariKota(teksTertunda).then(setHasilPencarian).catch(() => setHasilPencarian([]));
  }, [teksTertunda]);

  async function pilihKota(kota: HasilGeocoding) {
    setKotaTerpilih(kota);
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);
    try {
      const [dataCuaca, dataAQI] = await Promise.all([
        ambilCuaca(kota.latitude, kota.longitude),
        ambilKualitasUdara(kota.latitude, kota.longitude),
      ]);
      if (idSaatIni !== requestIdRef.current) return; // hasil basi, abaikan
      setCuaca(dataCuaca);
      setKualitasUdara(dataAQI);
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;
      setPesanError("Gagal memuat data cuaca. Periksa koneksi internet Anda.");
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
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1, gap: 16 }}>
        <SearchBox onCari={setTeksCari} />
        <Button title="Gunakan Lokasi Saat Ini" onPress={gunakanLokasiSaatIni} />
        {pesanLokasi && <Text>{pesanLokasi}</Text>}

        {/* Hasil Pencarian Kota */}
        {hasilPencarian.map((kota) => (
          <TouchableOpacity key={kota.id} onPress={() => pilihKota(kota)}>
            <Text style={{ paddingVertical: 4 }}>{kota.name}</Text>
          </TouchableOpacity>
        ))}

        {sedangMemuat && <ActivityIndicator size="large" />}

        {pesanError && (
          <View style={{ alignItems: "center" }}>
            <Text>{pesanError}</Text>
            <Button
              title="Coba Lagi"
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih)}
            />
          </View>
        )}
          {/* Tampilan Kartu Utama & Info Harian */}
        {cuaca && kualitasUdara && kotaTerpilih && !sedangMemuat && (
 <>
 <WeatherCard
 kota={kotaTerpilih.name}
 suhu={cuaca.saatIni.suhu}
 tingkatAQI={konversiTingkatAQI(kualitasUdara.indeksAQI)}
 />
 <Button
 title="Tambahkan ke Favorit"
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

{/* 2. PM2.5, PM10, dan Atribusi di Paling Bawah */}
<View style={{ marginTop: "auto", paddingTop: 16, paddingBottom: 24, alignItems: "center" }}>
  {kualitasUdara && (
    <Text style={{ fontSize: 11, color: "#888", marginBottom: 6, textAlign: "center" }}>
      PM2.5: {kualitasUdara.pm25} µg/m³ | PM10: {kualitasUdara.pm10} µg/m³
    </Text>
  )}
  <AtribusiCuaca />
</View>
      </ScrollView>
    </SafeAreaView>
  );
}
