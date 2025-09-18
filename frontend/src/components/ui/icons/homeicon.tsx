import Svg, { Path } from "react-native-svg";

type Props = { size?: number; color?: string };

export function HomeIcon({ size = 24, color = "#e3e3ef" }: Props) {
  return (
    <Svg viewBox="0 -960 960 960" width={size} height={size} fill={color}>
      <Path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/>
    </Svg>
  );
}
