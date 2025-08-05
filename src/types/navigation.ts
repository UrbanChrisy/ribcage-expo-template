export type RootDrawerParamList = {
  '(tabs)': undefined;
  settings: undefined;
  profile: undefined;
};

export type TabsParamList = {
  index: undefined;
  explore: undefined;
  notifications: undefined;
  messages: undefined;
  '(stack)': undefined;
};

export type StackParamList = {
  index: undefined;
  analytics: undefined;
  tools: undefined;
  help: undefined;
  'detail/[id]': { id: string };
};

export type DetailParams = {
  docs: undefined;
  api: undefined;
  changelog: undefined;
  community: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootDrawerParamList {}
  }
}