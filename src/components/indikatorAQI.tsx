import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 1. Memanggil kembali atau membuat ulang interface LaporanUdara
interface LaporanUdara {
  kota: string;
  indeksAQI: number;
  tingkat: "BAIK" | "SEDANG" | "TIDAK_SEHAT" | "BERBAHAYA";
  diperbaruiPada?: string;
}

// 2. Fungsi pembantu untuk menentukan warna teks berdasarkan tingkat kualitas udara
const dapatkanWarnaStatus = (tingkat: LaporanUdara['tingkat']): string => {
  switch (tingkat) {
    case "BAIK":
      return "#2ecc71"; // Hijau
    case "SEDANG":
      return "#f1c40f"; // Kuning
    case "TIDAK_SEHAT":
      return "#e67e22"; // Jingga / Oranye
    case "BERBAHAYA":
      return "#e74c3c"; // Merah
    default:
      return "#7f8c8d"; // Abu-abu jika tidak cocok
  }
};

// 3. Komponen Utama IndikatorAQI
export const IndikatorAQI: React.FC<LaporanUdara> = ({ kota, indeksAQI, tingkat, diperbaruiPada }) => {
  // Mengambil warna yang sesuai dengan status tingkat saat ini
  const warnaTeksStatus = dapatkanWarnaStatus(tingkat);

  return (
    <View style={styles.card}>
      <Text style={styles.namaKota}>{kota}</Text>
      
      <View style={styles.kontainerSkor}>
        <Text style={styles.labelAQI}>Indeks AQI</Text>
        <Text style={styles.angkaAQI}>{indeksAQI}</Text>
      </View>

      {/* Teks status yang warnanya berubah secara dinamis */}
      <Text style={[styles.teksStatus, { color: warnaTeksStatus }]}>
        Status: {tingkat}
      </Text>

      {/* Menampilkan waktu diperbarui hanya jika datanya ada (opsional) */}
      {diperbaruiPada && (
        <Text style={styles.teksWaktu}>Diperbarui pada: {diperbaruiPada}</Text>
      )}
    </View>
  );
};

// 4. Pengaturan Gaya Tampilan (Styling)
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Bayangan untuk perangkat Android
  },
  namaKota: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  kontainerSkor: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  labelAQI: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 6,
  },
  angkaAQI: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#34495e',
  },
  teksStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  teksWaktu: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 10,
    fontStyle: 'italic',
  },
}); 