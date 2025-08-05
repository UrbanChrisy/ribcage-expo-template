import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Page() {
  return (
    <View className="flex-1 items-center justify-center bg-black">
      <Link href="/">
        <Text className="text-white">Go back home</Text>
      </Link>
    </View>
  );
}
