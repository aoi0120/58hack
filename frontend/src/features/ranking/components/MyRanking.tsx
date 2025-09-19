import { View, Text, Image, StyleSheet } from 'react-native';

export default function MyRankingFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.card}>
        <View style={styles.rankCircle}>
          <Text style={styles.rankText}>128</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>あなた</Text>
          <View style={styles.winRateRow}>
            <Text style={styles.label}>勝率</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>42%</Text>
          </View>
        </View>
        <Image
          source={{
            uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDnq7JgBAONPx-lY5BhQ7ljthaTLB_TjuNpP-JbcTpYwdjR7oia7_U00CGHZJ5yFXw1FJ7MfB-V3Uce3n7UdXaVefjVOYPIeLoEyXHApvvAbI9n2tqhVIJo0eXBTiM3ODdgT0aZKny5koh4Idb2uDP47yUcG1GPiIg4UN99mHZ85c-a6k8gKMr_8qDJJEAoaieyzOjgaYjI1asZ0UDtvudBGsMP9vHSowfUnIW3gPe_dxf0fIZPf9kuqfvkTA_jrcamQwOnGF4zyY',
          }}
          style={styles.avatar}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16, // 他のリストと同じ余白
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#3E8DFF',
    borderWidth: 4,
    borderColor: '#000',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    width: '100%', // 横幅を最大に
  },
  rankCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  winRateRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  colon: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  value: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#666',
  },
});