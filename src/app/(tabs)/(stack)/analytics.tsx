import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const chartData = [
  { label: 'Jan', value: 65, color: 'bg-blue-500' },
  { label: 'Feb', value: 78, color: 'bg-green-500' },
  { label: 'Mar', value: 52, color: 'bg-yellow-500' },
  { label: 'Apr', value: 85, color: 'bg-purple-500' },
  { label: 'May', value: 92, color: 'bg-red-500' },
  { label: 'Jun', value: 88, color: 'bg-indigo-500' },
];

const metrics = [
  {
    title: 'Total Revenue',
    value: '$124,567',
    change: '+12.5%',
    changeType: 'positive',
    icon: 'trending-up',
  },
  {
    title: 'Active Users',
    value: '8,432',
    change: '+8.2%',
    changeType: 'positive',
    icon: 'people',
  },
  {
    title: 'Conversion Rate',
    value: '3.24%',
    change: '-2.1%',
    changeType: 'negative',
    icon: 'funnel',
  },
  {
    title: 'Bounce Rate',
    value: '24.8%',
    change: '-5.3%',
    changeType: 'positive',
    icon: 'exit',
  },
];

export default function Analytics() {
  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="p-4">
        {/* Time Period Selector */}
        <View className="flex-row bg-gray-800 rounded-lg p-1 mb-6">
          {['7D', '30D', '90D', '1Y'].map((period, index) => (
            <TouchableOpacity 
              key={period}
              className={`flex-1 py-2 rounded-md ${index === 1 ? 'bg-blue-600' : ''}`}
            >
              <Text className={`text-center font-semibold ${index === 1 ? 'text-white' : 'text-gray-400'}`}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <Text className="text-xl font-semibold text-white mb-4">Key Metrics</Text>
        <View className="flex-row flex-wrap gap-3 mb-6">
          {metrics.map((metric, index) => (
            <View key={index} className="bg-gray-800 rounded-lg p-4 flex-1 min-w-[45%]">
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons 
                  name={metric.icon as any} 
                  size={20} 
                  color="#9ca3af" 
                />
                <Text className={`text-sm font-semibold ${
                  metric.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.change}
                </Text>
              </View>
              <Text className="text-gray-400 text-sm mb-1">{metric.title}</Text>
              <Text className="text-white text-xl font-bold">{metric.value}</Text>
            </View>
          ))}
        </View>

        {/* Chart */}
        <Text className="text-xl font-semibold text-white mb-4">Revenue Trend</Text>
        <View className="bg-gray-800 rounded-lg p-4 mb-6">
          <View className="flex-row items-end justify-between h-40">
            {chartData.map((data, index) => (
              <View key={index} className="items-center flex-1">
                <View className="w-8 bg-gray-700 rounded-t-sm mb-2" style={{ height: (data.value / maxValue) * 120 }}>
                  <View className={`${data.color} w-full rounded-t-sm`} style={{ height: '100%' }} />
                </View>
                <Text className="text-gray-400 text-xs">{data.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Performing Content */}
        <Text className="text-xl font-semibold text-white mb-4">Top Performing</Text>
        <View className="bg-gray-800 rounded-lg overflow-hidden">
          {[
            { name: 'Landing Page', views: '15.2k', conversion: '8.4%' },
            { name: 'Product Demo', views: '12.8k', conversion: '12.1%' },
            { name: 'Pricing Page', views: '9.3k', conversion: '15.7%' },
            { name: 'Blog Article', views: '7.1k', conversion: '3.2%' },
          ].map((item, index) => (
            <View 
              key={index} 
              className={`p-4 flex-row justify-between ${
                index !== 3 ? 'border-b border-gray-700' : ''
              }`}
            >
              <View>
                <Text className="text-white font-semibold">{item.name}</Text>
                <Text className="text-gray-400 text-sm">{item.views} views</Text>
              </View>
              <View className="items-end">
                <Text className="text-green-400 font-semibold">{item.conversion}</Text>
                <Text className="text-gray-400 text-sm">conversion</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Export Options */}
        <Text className="text-xl font-semibold text-white mb-4 mt-6">Export Data</Text>
        <View className="flex-row gap-3">
          <TouchableOpacity className="bg-blue-600 p-3 rounded-lg flex-1 flex-row items-center justify-center">
            <Ionicons name="download" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">PDF Report</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-green-600 p-3 rounded-lg flex-1 flex-row items-center justify-center">
            <Ionicons name="document-text" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">CSV Data</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}