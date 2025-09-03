import { Environment } from "../environment";
import { type ExpoDevMenuItem, registerDevMenuItems } from "expo-dev-client";
import { colorScheme } from "nativewind";
import type { EnvironmentClient } from "../environment";

export class DevClient {

  constructor(private env: EnvironmentClient) {
    this.registerDevMenuItems();
  }

  registerDevMenuItems() {
    registerDevMenuItems([
      this.getEnvironmentSwitcherItem(),
      this.getThemeSwitcherItem()
    ]);
  }

  getEnvironmentSwitcherItem() {
    return {
      name: 'Toggle environment',
      shouldCollapse: true,
      callback: async () => {
        this.env.setEnvironment(this.env.environment === Environment.Production ? Environment.Staging : Environment.Production)
      },
    } as const satisfies ExpoDevMenuItem;
  }

  getThemeSwitcherItem() {
    return {
      name: 'Toggle theme',
      shouldCollapse: true,
      callback: () => {
        colorScheme.toggle()
      },
    } as const satisfies ExpoDevMenuItem;
  }
}