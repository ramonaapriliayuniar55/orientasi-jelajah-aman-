import React, { useState, useCallback } from "react";
import { View, Text, Button, Alert, Platform, ScrollView, TouchableOpacity } from "react-native"; 
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoriteStorage";
import { KotaFavorit } from "../../../types/favorit";

const KEY_RIWAYAT = "jelajah_aman_riwayat_pencarian";

export default function TabRiwayat() {
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [daftarRiwayat, setDaftarRiwayat] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      ambilSemuaFavorit().then(setDaftarFavorit);
      
      AsyncStorage.getItem(KEY_RIWAYAT).then((data) => {
        if (data) {
          setDaftarRiwayat(JSON.parse(data));
        } else {
          setDaftarRiwayat([]);
        }
      });
    }, [])
  );

  async function hapus(id: number) {
    await hapusFavorit(id);
    setDaftarFavorit((prev) => prev.filter((k) => k.id !== id));
  }

  function konfirmasiHapus(id: number, nama: string) {
    if (Platform.OS === "web") {
      const setuju = window.confirm(`Yakin hapus ${nama}?`);
      if (setuju) hapus(id);
    } else {
      Alert.alert("Konfirmasi Hapus", `Yakin hapus ${nama}?`, [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: () => hapus(id) },
      ]);
    }
  }

  async function bersihkanRiwayat() {
    await AsyncStorage.removeItem(KEY_RIWAYAT);
    setDaftarRiwayat([]);
  }

  function klikRiwayat(item: any) {
    router.push({
      pathname: "/(tabs)",
      params: {
        nama: item.nama,
        lat: String(item.latitude),
        lon: String(item.longitude),
      },
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        
        {/* BAGIAN 1: KOTA FAVORIT */}
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>Kota Favorit</Text>
          <Text style={{ fontSize: 14, color: "#666" }}>Tersimpan {daftarFavorit.length} kota</Text>
          
          {daftarFavorit.length === 0 && (
            <Text style={{ color: "#888" }}>Belum ada kota favorit</Text>
          )}
          
          {daftarFavorit.map((kota) => (
            <View key={kota.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 16 }}>{kota.nama}</Text>
              <Button title="Hapus" onPress={() => konfirmasiHapus(kota.id, kota.nama)} />
            </View>
          ))}
        </View>

        <View style={{ height: 1, backgroundColor: "#E5E7EB" }} />

        {/* BAGIAN 2: RIWAYAT PENCARIAN TERAKHIR */}
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>Riwayat Pencarian</Text>
              <Text style={{ fontSize: 14, color: "#666" }}>Maksimal 10 pencarian terakhir</Text>
            </View>
            {daftarRiwayat.length > 0 && (
              <Button title="Bersihkan" onPress={bersihkanRiwayat} />
            )}
          </View>

          {daftarRiwayat.length === 0 ? (
            <Text style={{ color: "#888", fontStyle: "italic" }}>Belum ada riwayat pencarian</Text>
          ) : (
            daftarRiwayat.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => klikRiwayat(item)}
                style={{
                  padding: 12,
                  backgroundColor: "#F3F4F6",
                  borderRadius: 8,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.nama}</Text>
                <Text style={{ fontSize: 12, color: "#0D9488" }}>Cari lagi</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

