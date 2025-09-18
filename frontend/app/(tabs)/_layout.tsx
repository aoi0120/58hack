import { Tabs } from "expo-router";
import { HomeIcon } from "@/src/components/ui/icons/homeicon";
import { RankingIcon } from "@/src/components/ui/icons/rankingicon";
import { BattleIcon } from "@/src/components/ui/icons/battleicon";


export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "ホーム",
          tabBarIcon: ({ size, color }) => <HomeIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="battle"
        options={{
          title: "バトル",
           tabBarIcon: ({ size, color }) => <BattleIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          title: "ランキング",
          tabBarIcon: ({ size, color }) => <RankingIcon size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
