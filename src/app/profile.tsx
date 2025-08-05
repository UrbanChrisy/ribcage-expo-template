import { ScrollView, Text, View, TouchableOpacity, TextInput, Image } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

const userStats = [
  { label: 'Posts', value: '247' },
  { label: 'Followers', value: '1.2k' },
  { label: 'Following', value: '892' },
  { label: 'Likes', value: '5.4k' },
];

const recentActivity = [
  {
    id: 1,
    type: 'post',
    title: 'Shared a photo',
    description: 'Beautiful sunset from my vacation',
    time: '2 hours ago',
    icon: 'image',
    color: 'text-blue-400',
  },
  {
    id: 2,
    type: 'comment',
    title: 'Commented on a post',
    description: 'Great work on the new design!',
    time: '5 hours ago',
    icon: 'chatbubble',
    color: 'text-green-400',
  },
  {
    id: 3,
    type: 'follow',
    title: 'Started following Sarah Johnson',
    description: 'UX Designer at Tech Corp',
    time: '1 day ago',
    icon: 'person-add',
    color: 'text-purple-400',
  },
  {
    id: 4,
    type: 'achievement',
    title: 'Earned a badge',
    description: 'Active Community Member',
    time: '2 days ago',
    icon: 'trophy',
    color: 'text-yellow-400',
  },
];

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    username: '@johndoe',
    bio: 'Software Developer | Tech Enthusiast | Coffee Lover ☕',
    location: 'San Francisco, CA',
    website: 'johndoe.dev',
  });

  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="p-4">
        {/* Profile Header */}
        <View className="items-center mb-6">
          <View className="relative mb-4">
            <View className="w-24 h-24 bg-blue-600 rounded-full items-center justify-center">
              <Text className="text-white text-2xl font-bold">JD</Text>
            </View>
            <TouchableOpacity className="absolute -bottom-1 -right-1 bg-gray-800 p-2 rounded-full border-2 border-gray-900">
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          {isEditing ? (
            <View className="w-full space-y-3">
              <TextInput
                className="bg-gray-800 text-white p-3 rounded-lg text-center text-xl font-bold"
                value={profile.name}
                onChangeText={(text) => setProfile({ ...profile, name: text })}
              />
              <TextInput
                className="bg-gray-800 text-gray-400 p-3 rounded-lg text-center"
                value={profile.username}
                onChangeText={(text) => setProfile({ ...profile, username: text })}
              />
              <TextInput
                className="bg-gray-800 text-gray-400 p-3 rounded-lg text-center"
                value={profile.bio}
                onChangeText={(text) => setProfile({ ...profile, bio: text })}
                multiline
              />
            </View>
          ) : (
            <View className="items-center">
              <Text className="text-white text-2xl font-bold">{profile.name}</Text>
              <Text className="text-gray-400 mb-2">{profile.username}</Text>
              <Text className="text-gray-300 text-center mb-3">{profile.bio}</Text>
            </View>
          )}

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              className={`px-6 py-2 rounded-lg ${isEditing ? 'bg-green-600' : 'bg-blue-600'}`}
            >
              <Text className="text-white font-semibold">
                {isEditing ? 'Save' : 'Edit Profile'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-700 px-6 py-2 rounded-lg">
              <Text className="text-white font-semibold">Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row bg-gray-800 rounded-lg p-4 mb-6">
          {userStats.map((stat, index) => (
            <View key={index} className="flex-1 items-center">
              <Text className="text-white text-xl font-bold">{stat.value}</Text>
              <Text className="text-gray-400 text-sm">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Profile Details */}
        <Text className="text-xl font-semibold text-white mb-4">Details</Text>
        <View className="bg-gray-800 rounded-lg overflow-hidden mb-6">
          {[
            { icon: 'location', label: 'Location', value: profile.location },
            { icon: 'globe', label: 'Website', value: profile.website },
            { icon: 'calendar', label: 'Joined', value: 'January 2023' },
            { icon: 'mail', label: 'Email', value: 'john@example.com' },
          ].map((detail, index) => (
            <View
              key={index}
              className={`p-4 flex-row items-center ${
                index !== 3 ? 'border-b border-gray-700' : ''
              }`}
            >
              <Ionicons name={detail.icon as any} size={20} color="#9ca3af" />
              <View className="ml-3">
                <Text className="text-gray-400 text-sm">{detail.label}</Text>
                <Text className="text-white">{detail.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text className="text-xl font-semibold text-white mb-4">Quick Actions</Text>
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity className="bg-blue-600 p-3 rounded-lg flex-1 flex-row items-center justify-center">
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">New Post</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-purple-600 p-3 rounded-lg flex-1 flex-row items-center justify-center">
            <Ionicons name="images" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <Text className="text-xl font-semibold text-white mb-4">Recent Activity</Text>
        <View className="space-y-3">
          {recentActivity.map((activity) => (
            <View key={activity.id} className="bg-gray-800 rounded-lg p-4">
              <View className="flex-row items-start">
                <View className="mr-3 mt-1">
                  <Ionicons 
                    name={activity.icon as any} 
                    size={20} 
                    color={
                      activity.color.includes('blue') ? '#60a5fa' :
                      activity.color.includes('green') ? '#4ade80' :
                      activity.color.includes('purple') ? '#a855f7' :
                      '#facc15'
                    }
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold">{activity.title}</Text>
                  <Text className="text-gray-400 text-sm mb-1">{activity.description}</Text>
                  <Text className="text-gray-500 text-xs">{activity.time}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Privacy Settings */}
        <Text className="text-xl font-semibold text-white mb-4 mt-6">Privacy</Text>
        <View className="bg-gray-800 rounded-lg overflow-hidden">
          {[
            { title: 'Private Account', description: 'Only followers can see your posts' },
            { title: 'Hide Activity Status', description: 'Others won\'t see when you\'re active' },
            { title: 'Block Data Usage', description: 'Restrict data collection for ads' },
          ].map((item, index) => (
            <View
              key={index}
              className={`p-4 flex-row items-center justify-between ${
                index !== 2 ? 'border-b border-gray-700' : ''
              }`}
            >
              <View className="flex-1">
                <Text className="text-white font-semibold">{item.title}</Text>
                <Text className="text-gray-400 text-sm">{item.description}</Text>
              </View>
              <View className="w-12 h-6 bg-gray-600 rounded-full p-1">
                <View className="w-4 h-4 bg-white rounded-full" />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}