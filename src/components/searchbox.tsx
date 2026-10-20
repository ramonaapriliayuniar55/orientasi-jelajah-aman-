// src/components/SearchBox.tsx
import { useState } from "react";
import { View, TextInput } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface SearchBoxProps {
  onCari: (teks: string) => void;
}

export default function SearchBox({ onCari }: SearchBoxProps) {
  const { colors } = useTheme();
  const [teks, setTeks] = useState("");

  function handleChange(nilaiBaru: string) {
    setTeks(nilaiBaru);
    onCari(nilaiBaru); // kirim setiap perubahan, debounce diatur di pemanggilnya
  }

  return (
    <View>
      <TextInput
        placeholder="Cari nama kota..."
        placeholderTextColor={colors.subText}
        value={teks}
        onChangeText={handleChange}
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.cardBg,
          color: colors.text,
          padding: 8,
          borderRadius: 8,
        }}
      />
    </View>
  );
}
