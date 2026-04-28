import NetInfo from '@react-native-community/netinfo';

type ConnectivityListener = (isConnected: boolean) => void;

const isReachable = (
  isConnected: boolean | null,
  isInternetReachable: boolean | null,
) => {
  return Boolean(isConnected) && isInternetReachable !== false;
};

class NetworkManager {
  private isConnected = true;

  private readonly listeners = new Set<ConnectivityListener>();

  public constructor() {
    void NetInfo.fetch().then((state) => {
      this.updateStatus(
        isReachable(state.isConnected, state.isInternetReachable),
      );
    });

    NetInfo.addEventListener((state) => {
      this.updateStatus(
        isReachable(state.isConnected, state.isInternetReachable),
      );
    });
  }

  public getConnectionStatus() {
    return this.isConnected;
  }

  public subscribe(listener: ConnectivityListener) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateStatus(nextStatus: boolean) {
    if (this.isConnected === nextStatus) {
      return;
    }

    this.isConnected = nextStatus;

    for (const listener of this.listeners) {
      listener(nextStatus);
    }
  }
}

export const networkManager = new NetworkManager();
