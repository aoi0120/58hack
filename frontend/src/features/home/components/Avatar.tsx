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

export default function Avatar() {
  const { steps } = useHealthData();

  const [name, setName] = useState('そこら辺のマッチョ');
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [manualLevel, setManualLevel] = useState<number | null>(null);


  const getStepLevel = (steps: number): number => {
    if (steps >= 10000) return 4;
    if (steps >= 6000) return 3;
    if (steps >= 3000) return 2;
    if (steps >= 1000) return 1;
    return 0;
  };
  const level = manualLevel ?? getStepLevel(steps);
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

  const handleEdit = () => {
    setTempName(name);
    setIsEditing(true);
  };

  const handleSave = () => {
    setName(tempName);
    setIsEditing(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {isEditing && <View style={styles.overlay} />}

      {/* 👟 靴画像 */}
      <Image
        source={require('../../../../assets/images/shoe1.png')}
        style={styles.image}
        resizeMode="contain"
      />

      {/* 🌟 エフェクト */}
      {level >= 1 && <Aura intensity={level} />}
      {level >= 2 && <PulseGlow centerX={200} centerY={180} delay={level * 100} intensity={level} />}
      {level >= 1 && <Sparkle count={sparkleCount} maxSize={sparkleSize} />}

      {/* 📝 名前と編集 */}
      <View style={styles.nameRow}>
        <Text style={styles.name}>{name}</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editIcon}>✎</Text>
        </TouchableOpacity>
      </View>

      {/* ✏️ 名前編集入力 */}
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

      {/* 🔘 段階切り替えボタン */}
      <View style={styles.levelControl}>
        {[0, 1, 2, 3, 4].map((lvl) => (
          <TouchableOpacity
            key={lvl}
            style={[
              styles.levelButton,
              level === lvl && styles.levelButtonActive,
            ]}
            onPress={() => setManualLevel(lvl)}
          >
            <Text style={styles.levelButtonText}>{lvl}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  levelControl: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    zIndex: 20,
  },
  levelButton: {
    backgroundColor: '#2D3748',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000',
  },
  levelButtonActive: {
    backgroundColor: '#FFD900',
  },
  levelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});