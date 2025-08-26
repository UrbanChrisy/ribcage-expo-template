import * as Haptics from 'expo-haptics';

export class HapticsClient {

  constructor() {}

  async light(): Promise<void> {
    return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async medium(): Promise<void> {
    return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  async heavy(): Promise<void> {
    return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }

  async success(): Promise<void> {
    return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async warning(): Promise<void> {
    return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }

  async error(): Promise<void> {
    return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  async selection(): Promise<void> {
    return Haptics.selectionAsync();
  }
}