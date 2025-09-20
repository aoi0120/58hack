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
import Aura from '../components/Aura';
import PulseGlow from '../components/PulseGlow';
import Sparkle from '../components/Sparkle';
import { useHealthData } from '../../../hooks/useHealthData';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { api } from '@/lib/api';

export default function Avatar() {
  const { steps } = useHealthData();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStepLevel = (v: number): number => {
    if (v >= 10000) return 4;
    if (v >= 6000) return 3;
    if (v >= 3000) return 2;
    if (v >= 1000) return 1;
    return 0;
  };
  const level = getStepLevel(steps);
  const sparkleCount = [0, 10, 20, 30, 40][level];
  const sparkleSize = [0, 4, 6, 8, 10][level];

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

  useEffect(() => {
    if (typeof user?.name === 'string') {
      setName(user.name);
    }
  }, [user?.name]);

  const handleEdit = () => {
    setTempName(name);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const next = tempName.trim();
    if (!next) return;

    setSaving(true);
    setError(null);

    try {
      const res = await api.post<{ name?: string }>(
        '/user/rename',
        { name: next },
        { validateStatus: () => true }
      );

      if (res.status >= 200 && res.status < 300) {
        const updated = res.data?.name ?? next;
        setName(updated);
        setIsEditing(false);
      } else if (res.status === 401) {
        setError('未ログインです');
      } else if (res.status === 404) {
        setError('名前更新APIが見つかりません');
      } else {
        setError(`名前更新エラー: ${res.status}`);
      }
    } catch (e) {
      console.warn(e);
      setError('名前の更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {isEditing && <View style={styles.overlay} />}

      <Image
        source={require('../../../../assets/images/shoe1.png')}
        style={styles.image}
        resizeMode="contain"
      />

      {level >= 1 && <Aura intensity={level} />}
      {level >= 2 && (
        <PulseGlow centerX={200} centerY={180} delay={level * 100} intensity={level} />
      )}
      {level >= 1 && <Sparkle count={sparkleCount} maxSize={sparkleSize} />}

      <View style={styles.nameRow}>
        <Text style={styles.name}>{name}</Text>
        <TouchableOpacity
          style={[styles.editButton, saving && { opacity: 0.6 }]}
          onPress={handleEdit}
          disabled={saving}
        >
          <Text style={styles.editIcon}>✎</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <Text style={{ color: '#E53E3E', marginTop: 8, fontWeight: 'bold' }}>{error}</Text>
      ) : null}

      {isEditing && (
        <View style={[styles.inputWrapper, { bottom: keyboardHeight }]}>
          <TextInput
            value={tempName}
            onChangeText={setTempName}
            style={styles.input}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
            editable={!saving}
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
    zIndex: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  name: {
    backgroundColor: '#2D3748',
    color: 'rgba(255, 217, 0, 1)',
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
    color: 'rgba(255, 217, 0, 1)',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 217, 0, 1)',
    shadowColor: 'rgba(255, 217, 0, 1)',
    shadowOffset: { width: 0, height: 4 },
    width: '100%',
    textAlign: 'center',
  },
});
