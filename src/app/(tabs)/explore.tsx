import { ScrollView, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';

const categories = [
  { id: 1, name: 'Technology', count: 245, color: 'bg-blue-600' },
  { id: 2, name: 'Design', count: 189, color: 'bg-purple-600' },
  { id: 3, name: 'Business', count: 167, color: 'bg-green-600' },
  { id: 4, name: 'Health', count: 134, color: 'bg-red-600' },
  { id: 5, name: 'Travel', count: 98, color: 'bg-yellow-600' },
  { id: 6, name: 'Food', count: 76, color: 'bg-orange-600' },
];

const trending = [
  { id: 1, title: 'AI Revolution in 2024', author: 'Tech Weekly', views: '12.3k' },
  { id: 2, title: 'Sustainable Design Trends', author: 'Design Hub', views: '8.7k' },
  { id: 3, title: 'Startup Success Stories', author: 'Business Today', views: '15.2k' },
  { id: 4, title: 'Mental Health at Work', author: 'Health Plus', views: '6.9k' },
];

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="p-4">
        <Text className="text-3xl font-bold text-white mb-6">Explore</Text>
        
        {/* Search Bar */}
        <View className="bg-gray-800 rounded-lg mb-6">
          <TextInput
            className="text-white p-4"
            placeholder="Search for topics, authors, or keywords..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <Text className="text-xl font-semibold text-white mb-4">Categories</Text>
        <View className="flex-row flex-wrap gap-3 mb-6">
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              className={`${category.color} p-3 rounded-lg flex-row items-center`}
            >
              <Text className="text-white font-semibold mr-2">{category.name}</Text>
              <Text className="text-white text-xs bg-black bg-opacity-20 px-2 py-1 rounded">
                {category.count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trending */}
        <Text className="text-xl font-semibold text-white mb-4">Trending Now</Text>
        <View className="bg-gray-800 rounded-lg">
          {trending.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              className={`p-4 ${index !== trending.length - 1 ? 'border-b border-gray-700' : ''}`}
            >
              <Text className="text-white font-semibold text-lg mb-1">{item.title}</Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-400">{item.author}</Text>
                <Text className="text-blue-400">{item.views} views</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured Content */}
        <Text className="text-xl font-semibold text-white mb-4 mt-6">Featured Content</Text>
        <View className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6">
          <Text className="text-white text-xl font-bold mb-2">Weekly Spotlight</Text>
          <Text className="text-white opacity-90 mb-4">
            Discover the most innovative projects and ideas from our community this week.
          </Text>
          <TouchableOpacity className="bg-white bg-opacity-20 p-3 rounded-lg self-start">
            <Text className="text-white font-semibold">Explore Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}