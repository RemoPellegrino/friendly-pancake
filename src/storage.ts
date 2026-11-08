// Keep the original AsyncStorage web key so existing progress on this origin survives.
export const browserStorage = {
  async getItem(key: string): Promise<string | null> { return localStorage.getItem(key); },
  async setItem(key: string, value: string): Promise<void> { localStorage.setItem(key, value); },
};
