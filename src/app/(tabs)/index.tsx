import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

const dummyData = {
  stats: [
    { label: 'Total Users', value: '12,345', change: '+5.2%' },
    { label: 'Revenue', value: '$89,432', change: '+12.8%' },
    { label: 'Orders', value: '2,567', change: '+3.1%' },
    { label: 'Conversion', value: '3.24%', change: '+0.8%' },
  ],
  recentActivity: [
    { id: 1, action: 'New user registered', time: '2 minutes ago' },
    { id: 2, action: 'Order #1234 completed', time: '5 minutes ago' },
    { id: 3, action: 'Payment received', time: '10 minutes ago' },
    { id: 4, action: 'Product updated', time: '15 minutes ago' },
  ],
};

export default function Dashboard() {
  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="p-4">
        <Text className="text-3xl font-bold text-white mb-6">Dashboard</Text>
        
        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-4 mb-6">
          {dummyData.stats.map((stat, index) => (
            <View
              key={index}
              className="bg-gray-800 p-4 rounded-lg flex-1 min-w-[45%]"
            >
              <Text className="text-gray-400 text-sm">{stat.label}</Text>
              <Text className="text-white text-2xl font-bold">{stat.value}</Text>
              <Text className="text-green-400 text-xs">{stat.change}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text className="text-xl font-semibold text-white mb-4">Quick Actions</Text>
        <View className="flex-row gap-4 mb-6">
          <Link href="/settings" asChild>
            <TouchableOpacity className="bg-blue-600 p-4 rounded-lg flex-1">
              <Text className="text-white font-semibold text-center">Settings</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/profile" asChild>
            <TouchableOpacity className="bg-purple-600 p-4 rounded-lg flex-1">
              <Text className="text-white font-semibold text-center">Profile</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Recent Activity */}
        <Text className="text-xl font-semibold text-white mb-4">Recent Activity</Text>
        <View className="bg-gray-800 rounded-lg">
          {dummyData.recentActivity.map((activity, index) => (
            <View
              key={activity.id}
              className={`p-4 ${index !== dummyData.recentActivity.length - 1 ? 'border-b border-gray-700' : ''}`}
            >
              <Text className="text-white">{activity.action}</Text>
              <Text className="text-gray-400 text-sm">{activity.time}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}