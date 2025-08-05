import { ScrollView, Text, View, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

const settingsData = {
  account: [
    { title: 'Profile Information', icon: 'person', href: '/profile' },
    { title: 'Privacy & Security', icon: 'shield-checkmark' },
    { title: 'Billing & Subscriptions', icon: 'card' },
    { title: 'Connected Accounts', icon: 'link' },
  ],
  preferences: [
    { title: 'Language', icon: 'language', value: 'English' },
    { title: 'Time Zone', icon: 'time', value: 'UTC-8' },
    { title: 'Date Format', icon: 'calendar', value: 'MM/DD/YYYY' },
    { title: 'Currency', icon: 'cash', value: 'USD' },
  ],
  notifications: [
    { title: 'Push Notifications', key: 'push' },
    { title: 'Email Notifications', key: 'email' },
    { title: 'SMS Notifications', key: 'sms' },
    { title: 'Marketing Communications', key: 'marketing' },
  ],
  app: [
    { title: 'Theme', icon: 'color-palette', value: 'Dark' },
    { title: 'Font Size', icon: 'text', value: 'Medium' },
    { title: 'Auto-lock', icon: 'lock-closed', value: '5 minutes' },
    { title: 'Data Usage', icon: 'cellular' },
  ],
};

export default function Settings() {
  const [notificationSettings, setNotificationSettings] = useState({
    push: true,
    email: true,
    sms: false,
    marketing: false,
  });

  const toggleNotification = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="p-4">
        <Text className="text-3xl font-bold text-white mb-6">Settings</Text>

        {/* Account Section */}
        <Text className="text-xl font-semibold text-white mb-4">Account</Text>
        <View className="bg-gray-800 rounded-lg overflow-hidden mb-6">
          {settingsData.account.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`p-4 flex-row items-center justify-between ${
                index !== settingsData.account.length - 1 ? 'border-b border-gray-700' : ''
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons name={item.icon as any} size={20} color="#9ca3af" />
                <Text className="text-white ml-3">{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Preferences Section */}
        <Text className="text-xl font-semibold text-white mb-4">Preferences</Text>
        <View className="bg-gray-800 rounded-lg overflow-hidden mb-6">
          {settingsData.preferences.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`p-4 flex-row items-center justify-between ${
                index !== settingsData.preferences.length - 1 ? 'border-b border-gray-700' : ''
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons name={item.icon as any} size={20} color="#9ca3af" />
                <Text className="text-white ml-3">{item.title}</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-gray-400 mr-2">{item.value}</Text>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications Section */}
        <Text className="text-xl font-semibold text-white mb-4">Notifications</Text>
        <View className="bg-gray-800 rounded-lg overflow-hidden mb-6">
          {settingsData.notifications.map((item, index) => (
            <View
              key={index}
              className={`p-4 flex-row items-center justify-between ${
                index !== settingsData.notifications.length - 1 ? 'border-b border-gray-700' : ''
              }`}
            >
              <Text className="text-white">{item.title}</Text>
              <Switch
                value={notificationSettings[item.key as keyof typeof notificationSettings]}
                onValueChange={() => toggleNotification(item.key as keyof typeof notificationSettings)}
                trackColor={{ false: '#374151', true: '#3b82f6' }}
                thumbColor="#ffffff"
              />
            </View>
          ))}
        </View>

        {/* App Settings Section */}
        <Text className="text-xl font-semibold text-white mb-4">App Settings</Text>
        <View className="bg-gray-800 rounded-lg overflow-hidden mb-6">
          {settingsData.app.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`p-4 flex-row items-center justify-between ${
                index !== settingsData.app.length - 1 ? 'border-b border-gray-700' : ''
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons name={item.icon as any} size={20} color="#9ca3af" />
                <Text className="text-white ml-3">{item.title}</Text>
              </View>
              <View className="flex-row items-center">
                {item.value && (
                  <Text className="text-gray-400 mr-2">{item.value}</Text>
                )}
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Storage & Data */}
        <Text className="text-xl font-semibold text-white mb-4">Storage & Data</Text>
        <View className="bg-gray-800 rounded-lg p-4 mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-400">App Size</Text>
            <Text className="text-white">127.4 MB</Text>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-400">Documents & Data</Text>
            <Text className="text-white">45.2 MB</Text>
          </View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-400">Cache</Text>
            <Text className="text-white">12.8 MB</Text>
          </View>
          <TouchableOpacity className="bg-red-600 p-3 rounded-lg">
            <Text className="text-white text-center font-semibold">Clear Cache</Text>
          </TouchableOpacity>
        </View>

        {/* Support & Legal */}
        <Text className="text-xl font-semibold text-white mb-4">Support & Legal</Text>
        <View className="bg-gray-800 rounded-lg overflow-hidden mb-6">
          {[
            { title: 'Help Center', icon: 'help-circle' },
            { title: 'Contact Support', icon: 'mail' },
            { title: 'Privacy Policy', icon: 'shield-checkmark' },
            { title: 'Terms of Service', icon: 'document-text' },
            { title: 'About', icon: 'information-circle' },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`p-4 flex-row items-center justify-between ${
                index !== 4 ? 'border-b border-gray-700' : ''
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons name={item.icon as any} size={20} color="#9ca3af" />
                <Text className="text-white ml-3">{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Danger Zone */}
        <Text className="text-xl font-semibold text-red-400 mb-4">Danger Zone</Text>
        <View className="bg-red-900 border border-red-600 rounded-lg overflow-hidden">
          <TouchableOpacity className="p-4 flex-row items-center justify-between border-b border-red-600">
            <View className="flex-row items-center">
              <Ionicons name="log-out" size={20} color="#f87171" />
              <Text className="text-red-200 ml-3">Sign Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#f87171" />
          </TouchableOpacity>
          <TouchableOpacity className="p-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="trash" size={20} color="#f87171" />
              <Text className="text-red-200 ml-3">Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#f87171" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}