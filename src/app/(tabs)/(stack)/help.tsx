import { ScrollView, Text, View, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const faqItems = [
  {
    question: 'How do I reset my password?',
    answer: 'Go to Settings > Account > Change Password to update your password.',
  },
  {
    question: 'How do I enable notifications?',
    answer: 'Navigate to Settings > Notifications and toggle on the notifications you want to receive.',
  },
  {
    question: 'Can I use this app offline?',
    answer: 'Yes, many features work offline. Your data will sync when you reconnect to the internet.',
  },
  {
    question: 'How do I export my data?',
    answer: 'Go to Settings > Data & Privacy > Export Data to download your information.',
  },
];

const supportChannels = [
  {
    title: 'Email Support',
    description: 'Get help via email within 24 hours',
    icon: 'mail',
    action: () => Linking.openURL('mailto:support@example.com'),
    color: 'bg-blue-600',
  },
  {
    title: 'Live Chat',
    description: 'Chat with our support team',
    icon: 'chatbubbles',
    action: () => console.log('Open live chat'),
    color: 'bg-green-600',
  },
  {
    title: 'Phone Support',
    description: 'Call us during business hours',
    icon: 'call',
    action: () => Linking.openURL('tel:+1234567890'),
    color: 'bg-purple-600',
  },
  {
    title: 'Community Forum',
    description: 'Connect with other users',
    icon: 'people',
    action: () => Linking.openURL('https://community.example.com'),
    color: 'bg-orange-600',
  },
];

export default function Help() {
  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="p-4">
        {/* Welcome Section */}
        <View className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6">
          <Text className="text-white text-2xl font-bold mb-2">How can we help?</Text>
          <Text className="text-white opacity-90">
            Find answers to common questions or get in touch with our support team.
          </Text>
        </View>

        {/* Quick Help Actions */}
        <Text className="text-xl font-semibold text-white mb-4">Get Support</Text>
        <View className="grid grid-cols-2 gap-3 mb-6">
          {supportChannels.map((channel, index) => (
            <TouchableOpacity
              key={index}
              onPress={channel.action}
              className={`${channel.color} rounded-lg p-4 flex-1`}
            >
              <View className="items-center">
                <Ionicons name={channel.icon as any} size={32} color="white" />
                <Text className="text-white font-semibold mt-2 text-center">{channel.title}</Text>
                <Text className="text-white opacity-80 text-xs text-center mt-1">
                  {channel.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ Section */}
        <Text className="text-xl font-semibold text-white mb-4">Frequently Asked Questions</Text>
        <View className="bg-gray-800 rounded-lg overflow-hidden mb-6">
          {faqItems.map((faq, index) => (
            <TouchableOpacity
              key={index}
              className={`p-4 ${index !== faqItems.length - 1 ? 'border-b border-gray-700' : ''}`}
            >
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-white font-semibold flex-1 pr-2">{faq.question}</Text>
                <Ionicons name="chevron-down" size={20} color="#9ca3af" />
              </View>
              <Text className="text-gray-400 text-sm">{faq.answer}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Useful Links */}
        <Text className="text-xl font-semibold text-white mb-4">Useful Links</Text>
        <View className="bg-gray-800 rounded-lg overflow-hidden mb-6">
          {[
            { title: 'User Guide', icon: 'book', url: 'https://docs.example.com' },
            { title: 'Video Tutorials', icon: 'play-circle', url: 'https://tutorials.example.com' },
            { title: 'Release Notes', icon: 'document-text', url: 'https://changelog.example.com' },
            { title: 'Privacy Policy', icon: 'shield-checkmark', url: 'https://privacy.example.com' },
            { title: 'Terms of Service', icon: 'document', url: 'https://terms.example.com' },
          ].map((link, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => Linking.openURL(link.url)}
              className={`p-4 flex-row items-center justify-between ${
                index !== 4 ? 'border-b border-gray-700' : ''
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons name={link.icon as any} size={20} color="#9ca3af" />
                <Text className="text-white ml-3">{link.title}</Text>
              </View>
              <Ionicons name="open" size={16} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <Text className="text-xl font-semibold text-white mb-4">App Information</Text>
        <View className="bg-gray-800 rounded-lg p-4 mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-400">Version</Text>
            <Text className="text-white">2.1.0 (142)</Text>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-400">Last Updated</Text>
            <Text className="text-white">January 15, 2024</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-400">Support ID</Text>
            <Text className="text-blue-400 font-mono">#RBC-2024-001</Text>
          </View>
        </View>

        {/* Emergency Contact */}
        <View className="bg-red-900 border border-red-600 rounded-lg p-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="warning" size={20} color="#f87171" />
            <Text className="text-red-200 font-semibold ml-2">Emergency Support</Text>
          </View>
          <Text className="text-red-200 text-sm mb-3">
            For critical issues that require immediate attention, contact our emergency support line.
          </Text>
          <TouchableOpacity 
            onPress={() => Linking.openURL('tel:+1-800-EMERGENCY')}
            className="bg-red-600 p-2 rounded-lg"
          >
            <Text className="text-white text-center font-semibold">Call Emergency Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}