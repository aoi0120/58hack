import { Tabs } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

export default function TabLayout() {
//TODO: tabごとにiamgeを差し替える
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "ホーム",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="battle"
        options={{
          title: "バトル",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="rocket" size={size} color={color} /> 
          ),
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          title: "ランキング",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="trophy" size={size} color={color} /> 
          ),
        }}
      />
    </Tabs>
  );
}
