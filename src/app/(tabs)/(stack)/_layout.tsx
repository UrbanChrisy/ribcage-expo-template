import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1f2937',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'More Options',
        }}
      />
      <Stack.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="tools"
        options={{
          title: 'Tools',
        }}
      />
      <Stack.Screen
        name="help"
        options={{
          title: 'Help & Support',
        }}
      />
      <Stack.Screen
        name="detail/[id]"
        options={{
          title: 'Details',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}