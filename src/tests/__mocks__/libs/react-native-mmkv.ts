class MockMMKV {
  private readonly storage = new Map<string, boolean | number | string>();

  public clearAll() {
    this.storage.clear();
  }

  public delete(key: string) {
    this.storage.delete(key);
  }

  public getBoolean(key: string) {
    const value = this.storage.get(key);
    return typeof value === 'boolean' ? value : undefined;
  }

  public getNumber(key: string) {
    const value = this.storage.get(key);
    return typeof value === 'number' ? value : undefined;
  }

  public getString(key: string) {
    const value = this.storage.get(key);
    return typeof value === 'string' ? value : undefined;
  }

  public set(key: string, value: boolean | number | string) {
    this.storage.set(key, value);
  }
}

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => new MockMMKV()),
  MMKV: MockMMKV,
}));
