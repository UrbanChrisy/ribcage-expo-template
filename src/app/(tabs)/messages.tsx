import { ScrollView, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

const conversations = [
  {
    id: 1,
    name: 'Sarah Johnson',
    lastMessage: 'Hey! How are you doing?',
    time: '2:30 PM',
    unread: 2,
    avatar: 'SJ',
    online: true,
  },
  {
    id: 2,
    name: 'Team Dev',
    lastMessage: 'The new feature is ready for testing',
    time: '1:45 PM',
    unread: 0,
    avatar: 'TD',
    online: false,
  },
  {
    id: 3,
    name: 'Mike Chen',
    lastMessage: 'Thanks for the help!',
    time: '12:20 PM',
    unread: 1,
    avatar: 'MC',
    online: true,
  },
  {
    id: 4,
    name: 'Project Alpha',
    lastMessage: 'Meeting scheduled for tomorrow',
    time: '11:15 AM',
    unread: 0,
    avatar: 'PA',
    online: false,
  },
  {
    id: 5,
    name: 'Lisa Park',
    lastMessage: 'Can you review the design?',
    time: 'Yesterday',
    unread: 3,
    avatar: 'LP',
    online: false,
  },
];

export default function Messages() {
  const [searchQuery, setSearchQuery] = useState('');
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread, 0);

  return (
    <View className="flex-1 bg-gray-900">
      <View className="p-4 border-b border-gray-700">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-3xl font-bold text-white">Messages</Text>
          {totalUnread > 0 && (
            <View className="bg-red-500 rounded-full px-3 py-1">
              <Text className="text-white text-sm font-semibold">{totalUnread}</Text>
            </View>
          )}
        </View>

        {/* Search Bar */}
        <View className="bg-gray-800 rounded-lg flex-row items-center px-3">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="text-white p-3 flex-1 ml-2"
            placeholder="Search conversations..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Quick Actions */}
        <View className="flex-row gap-3 p-4">
          <TouchableOpacity className="bg-blue-600 p-3 rounded-lg flex-1 flex-row items-center justify-center">
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">New Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-gray-700 p-3 rounded-lg flex-1 flex-row items-center justify-center">
            <Ionicons name="people" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Groups</Text>
          </TouchableOpacity>
        </View>

        {/* Conversations */}
        <View className="flex-1">
          {conversations
            .filter(conv => 
              conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((conversation) => (
              <TouchableOpacity
                key={conversation.id}
                className="bg-gray-800 mx-4 mb-2 rounded-lg p-4"
              >
                <View className="flex-row items-center">
                  {/* Avatar */}
                  <View className="relative">
                    <View className="bg-blue-600 w-12 h-12 rounded-full items-center justify-center mr-3">
                      <Text className="text-white font-bold">{conversation.avatar}</Text>
                    </View>
                    {conversation.online && (
                      <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800" />
                    )}
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className="text-white font-semibold text-lg">
                        {conversation.name}
                      </Text>
                      <Text className="text-gray-400 text-sm">{conversation.time}</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-gray-400 flex-1 mr-2" numberOfLines={1}>
                        {conversation.lastMessage}
                      </Text>
                      {conversation.unread > 0 && (
                        <View className="bg-blue-500 rounded-full min-w-[20px] h-5 items-center justify-center">
                          <Text className="text-white text-xs font-bold px-1">
                            {conversation.unread > 9 ? '9+' : conversation.unread}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg">
        <Ionicons name="chatbubble" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}