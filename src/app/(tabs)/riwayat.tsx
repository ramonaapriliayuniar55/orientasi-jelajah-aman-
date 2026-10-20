// src/app/(tabs)/riwayat.tsx
import React, { useState, useCallback } from "react";
import { View, Text, Button, Alert, Platform, ScrollView, TouchableOpacity } from "react-native"; 
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoriteStorage";
import { hapusCacheKota, buatKunci } from "../../services/cacheRepository";
import { KotaFavorit } from "../../../types/favorit";

const KEY_RIWAYAT = "jelajah_aman_riwayat_pencarian";

export default function TabRiwayat() {
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [daftarRiwayat, setDaftarRiwayat] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      // Load Favorit
      ambilSemuaFavorit().then(setDaftarFavorit);
      
      // Load Riwayat Pencarian
      AsyncStorage.getItem(KEY_RIWAYAT).then((data) => {
        if (data) setDaftarRiwayat(JSON.parse(data));
        else setDaftarRiwayat([]);
      });
    }, [])
  );

  //HAPUS FAVORIT 
  async function hapusFavo(id: number) {
    await hapusFavorit(id);
    setDaftarFavorit((prev) => prev.filter((k) => k.id !== id));
  }

  function konfirmasiHapusFavorit(id: number, nama: string) {
    if (Platform.OS === "web") {
      if (window.confirm(`Yakin hapus ${nama} dari favorit?`)) hapusFavo(id);
    } else {
      Alert.alert("Konfirmasi Hapus", `Yakin hapus ${nama} dari favorit?`, [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: () => hapusFavo(id) },
      ]);
    }
  }

  //HAPUS CACHE & RIWAYAT 
  async function prosesHapusRiwayatDanCache(item: any) {
    if (item.latitude && item.longitude) {
      const kunci = buatKunci(item.latitude, item.longitude);
      await hapusCacheKota(kunci);
    }

    const riwayatBaru = daftarRiwayat.filter((r) => r.nama !== item.nama);
    await AsyncStorage.setItem(KEY_RIWAYAT, JSON.stringify(riwayatBaru));
    setDaftarRiwayat(riwayatBaru);
  }

  function konfirmasiHapusCacheItem(item: any) {
    if (Platform.OS === "web") {
      if (window.confirm(`Hapus cache dan riwayat pencarian ${item.nama}?`)) {
        prosesHapusRiwayatDanCache(item);
      }
    } else {
      Alert.alert(
        "Konfirmasi Hapus Cache",
        `Yakin ingin menghapus cache data untuk kota ${item.nama}?`,
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Hapus",
            style: "destructive",
            onPress: () => prosesHapusRiwayatDanCache(item),
          },
        ]
      );
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
              <Button title="Hapus" onPress={() => konfirmasiHapusFavorit(kota.id, kota.nama)} />
            </View>
          ))}
        </View>

        <View style={{ height: 1, backgroundColor: "#E5E7EB" }} />

        {/* BAGIAN 2: RIWAYAT PENCARIAN & HAPUS CACHE (TUGAS 2 & 3 DISATUKAN) */}
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
              <View
                key={index}
                style={{
                  padding: 10,
                  backgroundColor: "#F3F4F6",
                  borderRadius: 8,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* Klik nama kota untuk mencari ulang */}
                <TouchableOpacity
                  onPress={() => klikRiwayat(item)}
                  style={{ flex: 1 }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.nama}</Text>
                  <Text style={{ fontSize: 12, color: "#0D9488" }}>Ketuk untuk cari ulang</Text>
                </TouchableOpacity>

                {/* Tombol Hapus Cache per item */}
                <Button
                  title="Hapus Cache"
                  color="#EF4444"
                  onPress={() => konfirmasiHapusCacheItem(item)}
                />
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

