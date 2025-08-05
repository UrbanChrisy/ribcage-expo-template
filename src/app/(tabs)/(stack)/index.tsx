import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const menuItems = [
  {
    title: 'Analytics',
    description: 'View detailed analytics and reports',
    icon: 'bar-chart',
    href: '/analytics',
    color: 'bg-blue-600',
  },
  {
    title: 'Tools',
    description: 'Access development tools and utilities',
    icon: 'build',
    href: '/tools',
    color: 'bg-green-600',
  },
  {
    title: 'Help & Support',
    description: 'Get help and contact support',
    icon: 'help-circle',
    href: '/help',
    color: 'bg-purple-600',
  },
];

const quickLinks = [
  { title: 'Documentation', href: '/detail/docs', icon: 'document-text' },
  { title: 'API Reference', href: '/detail/api', icon: 'code-slash' },
  { title: 'Changelog', href: '/detail/changelog', icon: 'git-branch' },
  { title: 'Community', href: '/detail/community', icon: 'people' },
];

export default function MoreOptions() {
  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="p-4">
        <Text className="text-3xl font-bold text-white mb-6">More Options</Text>

        {/* Main Menu Items */}
        <Text className="text-xl font-semibold text-white mb-4">Main Features</Text>
        <View className="space-y-3 mb-6">
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href} asChild>
              <TouchableOpacity className={`${item.color} rounded-lg p-4 flex-row items-center`}>
                <View className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
                  <Ionicons name={item.icon as any} size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-lg">{item.title}</Text>
                  <Text className="text-white opacity-80 text-sm">{item.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        {/* Quick Links */}
        <Text className="text-xl font-semibold text-white mb-4">Quick Links</Text>
        <View className="bg-gray-800 rounded-lg overflow-hidden">
          {quickLinks.map((link, index) => (
            <Link key={index} href={link.href} asChild>
              <TouchableOpacity 
                className={`p-4 flex-row items-center justify-between ${
                  index !== quickLinks.length - 1 ? 'border-b border-gray-700' : ''
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons name={link.icon as any} size={20} color="#9ca3af" />
                  <Text className="text-white ml-3">{link.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        {/* Statistics */}
        <Text className="text-xl font-semibold text-white mb-4 mt-6">Usage Statistics</Text>
        <View className="bg-gray-800 rounded-lg p-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-400">Daily Active Users</Text>
            <Text className="text-white font-semibold">1,234</Text>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-400">Sessions Today</Text>
            <Text className="text-white font-semibold">567</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-400">Average Session Duration</Text>
            <Text className="text-white font-semibold">4m 32s</Text>
          </View>
        </View>

        {/* App Info */}
        <View className="bg-gray-800 rounded-lg p-4 mt-4">
          <Text className="text-white font-semibold mb-2">App Information</Text>
          <Text className="text-gray-400 text-sm">Version 2.1.0</Text>
          <Text className="text-gray-400 text-sm">Build 142</Text>
          <Text className="text-gray-400 text-sm">Last Updated: January 15, 2024</Text>
        </View>
      </View>
    </ScrollView>
  );
}