import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';

export default function Avatar() {
  const [name, setName] = useState('そこら辺のマッチョ');
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);

  const handleEdit = () => {
    setTempName(name);
    setIsEditing(true);
  };

  const handleSave = () => {
    setName(tempName);
    setIsEditing(false);
    // TODO: 保存処理（AsyncStorageやAPIなど）をここに追加可能
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHOBhlQucrIRXOnEl3ZB8e5-vi69gz7l5wfKxxx2NWujGBlKL5OYo6hhj8xQxsbjxV5QPanK4HV2dm0GvMq1t9vyLbXEiO1PIZaKrma-yVXjYhXtFFLmHggyPgicQGP38j-MYyth-zd4BM1gFNc33b8LO3UnIcwq6VA75zU6G1Kw0bJLr9Hzb5oHzzR6bRx2CJYjSaz-92ok_u0SrYAwImputsay9GyQI1wgOt6NY2kkNk0NVd1NL1CNe34nVhO_IELkAaX7WXkY8',
        }}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.nameRow}>
        {isEditing ? (
          <TextInput
            value={tempName}
            onChangeText={setTempName}
            style={[styles.name, { color: '#FFD900' }]}
          />
        ) : (
          <Text style={styles.name}>{name}</Text>
        )}
        <TouchableOpacity style={styles.editButton} onPress={isEditing ? handleSave : handleEdit}>
          <Text style={styles.editIcon}>{isEditing ? '✔' : '✎'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  name: {
    backgroundColor: '#2D3748',
    color: '#FFD900',
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#2D3748',
    padding: 12,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  editIcon: {
    color: '#fff',
    fontSize: 16,
  },
});