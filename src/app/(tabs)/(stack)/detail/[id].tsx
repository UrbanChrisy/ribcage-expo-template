import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const detailContent = {
  docs: {
    title: 'Documentation',
    icon: 'document-text',
    color: 'bg-blue-600',
    sections: [
      {
        title: 'Getting Started',
        content: 'Learn the basics of using this application effectively.',
      },
      {
        title: 'Advanced Features',
        content: 'Explore powerful features for advanced users.',
      },
      {
        title: 'Best Practices',
        content: 'Follow recommended practices for optimal performance.',
      },
    ],
  },
  api: {
    title: 'API Reference',
    icon: 'code-slash',
    color: 'bg-green-600',
    sections: [
      {
        title: 'Authentication',
        content: 'Learn how to authenticate with our API endpoints.',
      },
      {
        title: 'Endpoints',
        content: 'Complete list of available API endpoints and their usage.',
      },
      {
        title: 'Rate Limiting',
        content: 'Understand rate limits and how to handle them.',
      },
    ],
  },
  changelog: {
    title: 'Changelog',
    icon: 'git-branch',
    color: 'bg-purple-600',
    sections: [
      {
        title: 'Version 2.1.0',
        content: 'Added new navigation system and improved performance.',
      },
      {
        title: 'Version 2.0.0',
        content: 'Major update with redesigned UI and new features.',
      },
      {
        title: 'Version 1.9.5',
        content: 'Bug fixes and stability improvements.',
      },
    ],
  },
  community: {
    title: 'Community',
    icon: 'people',
    color: 'bg-orange-600',
    sections: [
      {
        title: 'Discord Server',
        content: 'Join our Discord community for real-time discussions.',
      },
      {
        title: 'GitHub Discussions',
        content: 'Participate in GitHub discussions and feature requests.',
      },
      {
        title: 'Community Guidelines',
        content: 'Read our community guidelines and code of conduct.',
      },
    ],
  },
};

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const content = detailContent[id as keyof typeof detailContent];

  if (!content) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center p-4">
        <Ionicons name="alert-circle" size={64} color="#f87171" />
        <Text className="text-white text-xl font-bold mt-4">Content Not Found</Text>
        <Text className="text-gray-400 text-center mt-2">
          The requested content could not be found.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="p-4">
        {/* Header */}
        <View className={`${content.color} rounded-lg p-6 mb-6`}>
          <View className="flex-row items-center mb-2">
            <Ionicons name={content.icon as any} size={32} color="white" />
            <Text className="text-white text-2xl font-bold ml-3">{content.title}</Text>
          </View>
          <Text className="text-white opacity-90">
            Detailed information about {content.title.toLowerCase()}.
          </Text>
        </View>

        {/* Content Sections */}
        <View className="space-y-4">
          {content.sections.map((section, index) => (
            <View key={index} className="bg-gray-800 rounded-lg p-4">
              <Text className="text-white text-lg font-semibold mb-2">{section.title}</Text>
              <Text className="text-gray-400 leading-6">{section.content}</Text>
              
              {/* Action Buttons */}
              <View className="flex-row gap-2 mt-4">
                <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-lg flex-1">
                  <Text className="text-white text-center font-semibold">Learn More</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-gray-700 px-4 py-2 rounded-lg">
                  <Ionicons name="bookmark" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity className="bg-gray-700 px-4 py-2 rounded-lg">
                  <Ionicons name="share" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Related Content */}
        <Text className="text-xl font-semibold text-white mt-6 mb-4">Related Content</Text>
        <View className="bg-gray-800 rounded-lg overflow-hidden">
          {[
            { title: 'Quick Start Guide', type: 'Tutorial' },
            { title: 'Video Walkthrough', type: 'Video' },
            { title: 'Example Projects', type: 'Code' },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`p-4 flex-row items-center justify-between ${
                index !== 2 ? 'border-b border-gray-700' : ''
              }`}
            >
              <View>
                <Text className="text-white font-semibold">{item.title}</Text>
                <Text className="text-gray-400 text-sm">{item.type}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Feedback Section */}
        <View className="bg-gray-800 rounded-lg p-4 mt-6">
          <Text className="text-white text-lg font-semibold mb-2">Was this helpful?</Text>
          <Text className="text-gray-400 mb-4">Let us know how we can improve this content.</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity className="bg-green-600 px-6 py-2 rounded-lg flex-row items-center">
              <Ionicons name="thumbs-up" size={16} color="white" />
              <Text className="text-white font-semibold ml-2">Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-red-600 px-6 py-2 rounded-lg flex-row items-center">
              <Ionicons name="thumbs-down" size={16} color="white" />
              <Text className="text-white font-semibold ml-2">No</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-blue-600 px-6 py-2 rounded-lg flex-row items-center">
              <Ionicons name="chatbubble" size={16} color="white" />
              <Text className="text-white font-semibold ml-2">Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}