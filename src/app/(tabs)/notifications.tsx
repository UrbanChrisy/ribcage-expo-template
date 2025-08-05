import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const notifications = [
  {
    id: 1,
    type: 'message',
    title: 'New Message',
    description: 'You have a new message from Sarah Johnson',
    time: '2 minutes ago',
    read: false,
    icon: 'chatbubble',
    color: 'text-blue-400',
  },
  {
    id: 2,
    type: 'system',
    title: 'System Update',
    description: 'Your app has been updated to version 2.1.0',
    time: '1 hour ago',
    read: false,
    icon: 'download',
    color: 'text-green-400',
  },
  {
    id: 3,
    type: 'reminder',
    title: 'Meeting Reminder',
    description: 'Team standup meeting in 30 minutes',
    time: '2 hours ago',
    read: true,
    icon: 'calendar',
    color: 'text-yellow-400',
  },
  {
    id: 4,
    type: 'achievement',
    title: 'Achievement Unlocked',
    description: 'You completed 10 tasks this week!',
    time: '1 day ago',
    read: true,
    icon: 'trophy',
    color: 'text-purple-400',
  },
  {
    id: 5,
    type: 'security',
    title: 'Security Alert',
    description: 'New device logged into your account',
    time: '2 days ago',
    read: true,
    icon: 'shield-checkmark',
    color: 'text-red-400',
  },
];

export default function Notifications() {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-white">Notifications</Text>
          {unreadCount > 0 && (
            <View className="bg-red-500 rounded-full px-3 py-1">
              <Text className="text-white text-sm font-semibold">{unreadCount} new</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-lg flex-1">
            <Text className="text-white text-center font-semibold">Mark All Read</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-gray-700 px-4 py-2 rounded-lg flex-1">
            <Text className="text-white text-center font-semibold">Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <View className="space-y-3">
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              className={`bg-gray-800 rounded-lg p-4 ${!notification.read ? 'border-l-4 border-blue-500' : ''}`}
            >
              <View className="flex-row items-start">
                <View className="mr-3 mt-1">
                  <Ionicons 
                    name={notification.icon as any} 
                    size={20} 
                    className={notification.color}
                    color={notification.color.includes('blue') ? '#60a5fa' :
                           notification.color.includes('green') ? '#4ade80' :
                           notification.color.includes('yellow') ? '#facc15' :
                           notification.color.includes('purple') ? '#a855f7' :
                           '#f87171'}
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className={`font-semibold ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                      {notification.title}
                    </Text>
                    {!notification.read && (
                      <View className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />
                    )}
                  </View>
                  <Text className="text-gray-400 mb-2">{notification.description}</Text>
                  <Text className="text-gray-500 text-sm">{notification.time}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings */}
        <TouchableOpacity className="bg-gray-800 rounded-lg p-4 mt-6 flex-row items-center justify-between">
          <View>
            <Text className="text-white font-semibold">Notification Settings</Text>
            <Text className="text-gray-400 text-sm">Manage your notification preferences</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}