import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { useState, useEffect } from 'react';

export default function Avatar() {
  const [name, setName] = useState('そこら辺のマッチョ');
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleEdit = () => {
    setTempName(name);
    setIsEditing(true);
  };

  const handleSave = () => {
    setName(tempName);
    setIsEditing(false);
    // TODO: 保存処理（AsyncStorageやAPIなど）
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {isEditing && <View style={styles.overlay} />}

      <Image
        source={{
          uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHOBhlQucrIRXOnEl3ZB8e5-vi69gz7l5wfKxxx2NWujGBlKL5OYo6hhj8xQxsbjxV5QPanK4HV2dm0GvMq1t9vyLbXEiO1PIZaKrma-yVXjYhXtFFLmHggyPgicQGP38j-MYyth-zd4BM1gFNc33b8LO3UnIcwq6VA75zU6G1Kw0bJLr9Hzb5oHzzR6bRx2CJYjSaz-92ok_u0SrYAwImputsay9GyQI1wgOt6NY2kkNk0NVd1NL1CNe34nVhO_IELkAaX7WXkY8',
        }}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.nameRow}>
        <Text style={styles.name}>{name}</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editIcon}>✎</Text>
        </TouchableOpacity>
      </View>

      {isEditing && (
        <View style={[styles.inputWrapper, { bottom: keyboardHeight }]}>
          <TextInput
            value={tempName}
            onChangeText={setTempName}
            style={styles.input}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 48,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 5,
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
  inputWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    alignItems: 'center',
    zIndex: 10,
  },
  input: {
    backgroundColor: '#3C4A5A',
    color: '#FFD900',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFD900',
    shadowColor: '#FFD900',
    shadowOffset: { width: 0, height: 4 },
    width: '100%',
    textAlign: 'center',
  },
});