import { Stack } from 'expo-router'

export default function New2Layout() {
  return (
    <Stack>
      <Stack.Protected guard={true}>
        {/* Protected content here */}
      </Stack.Protected>
    </Stack>
  )
}