import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const toolCategories = [
  {
    title: 'Development Tools',
    tools: [
      { name: 'Code Inspector', description: 'Inspect and debug code', icon: 'code-slash', color: 'bg-blue-600' },
      { name: 'Performance Monitor', description: 'Monitor app performance', icon: 'speedometer', color: 'bg-green-600' },
      { name: 'Network Debugger', description: 'Debug network requests', icon: 'globe', color: 'bg-purple-600' },
    ],
  },
  {
    title: 'Design Tools',
    tools: [
      { name: 'Color Picker', description: 'Pick and manage colors', icon: 'color-palette', color: 'bg-pink-600' },
      { name: 'Layout Inspector', description: 'Inspect UI layouts', icon: 'grid', color: 'bg-orange-600' },
      { name: 'Typography Helper', description: 'Manage fonts and text', icon: 'text', color: 'bg-indigo-600' },
    ],
  },
  {
    title: 'Data Tools',
    tools: [
      { name: 'Database Browser', description: 'Browse local database', icon: 'server', color: 'bg-teal-600' },
      { name: 'JSON Formatter', description: 'Format and validate JSON', icon: 'document-text', color: 'bg-yellow-600' },
      { name: 'API Tester', description: 'Test API endpoints', icon: 'flash', color: 'bg-red-600' },
    ],
  },
];

export default function Tools() {
  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="p-4">
        <Text className="text-gray-400 mb-6">
          Access powerful development and debugging tools to enhance your workflow.
        </Text>

        {toolCategories.map((category, categoryIndex) => (
          <View key={categoryIndex} className="mb-6">
            <Text className="text-xl font-semibold text-white mb-4">{category.title}</Text>
            <View className="space-y-3">
              {category.tools.map((tool, toolIndex) => (
                <TouchableOpacity
                  key={toolIndex}
                  className="bg-gray-800 rounded-lg p-4 flex-row items-center"
                >
                  <View className={`${tool.color} p-3 rounded-full mr-4`}>
                    <Ionicons name={tool.icon as any} size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-lg">{tool.name}</Text>
                    <Text className="text-gray-400 text-sm">{tool.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* System Info */}
        <Text className="text-xl font-semibold text-white mb-4">System Information</Text>
        <View className="bg-gray-800 rounded-lg p-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-400">Platform</Text>
            <Text className="text-white">iOS 17.2</Text>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-400">Device</Text>
            <Text className="text-white">iPhone 15 Pro</Text>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-400">Memory Usage</Text>
            <Text className="text-white">245.8 MB</Text>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-400">Storage Available</Text>
            <Text className="text-white">128.4 GB</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-400">Battery Level</Text>
            <Text className="text-green-400">87%</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text className="text-xl font-semibold text-white mb-4 mt-6">Quick Actions</Text>
        <View className="flex-row gap-3">
          <TouchableOpacity className="bg-red-600 p-3 rounded-lg flex-1 flex-row items-center justify-center">
            <Ionicons name="trash" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Clear Cache</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-blue-600 p-3 rounded-lg flex-1 flex-row items-center justify-center">
            <Ionicons name="refresh" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Restart App</Text>
          </TouchableOpacity>
        </View>

        {/* Developer Options */}
        <View className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mt-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="warning" size={20} color="#f59e0b" />
            <Text className="text-yellow-800 font-semibold ml-2">Developer Mode</Text>
          </View>
          <Text className="text-yellow-700 text-sm mb-3">
            These tools are intended for development purposes only. Use with caution in production environments.
          </Text>
          <TouchableOpacity className="bg-yellow-600 p-2 rounded-lg">
            <Text className="text-white text-center font-semibold">Enable Debug Mode</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}