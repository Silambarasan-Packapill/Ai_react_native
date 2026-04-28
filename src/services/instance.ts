import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { networkManager } from '@/services/networkManager';

type QueuedRequest<T> = {
  readonly execute: () => Promise<T> | T;
  readonly reject: (error: Error) => void;
};

const queuedRequests: QueuedRequest<unknown>[] = [];

let isReplayingQueue = false;

const instance = axios.create({
  baseURL: process.env.API_URL ?? '',
  headers: {
    Accept: 'application/json',
  },
});

const isQueueEnabled = (config: InternalAxiosRequestConfig | undefined) => {
  return config?.queueWhenOffline !== false;
};

const isOfflineNetworkError = (error: AxiosError) => {
  return !networkManager.getConnectionStatus() && !error.response;
};

const enqueueRequest = <T>(execute: () => Promise<T> | T) => {
  return new Promise<T>((resolve, reject) => {
    queuedRequests.push({
      execute: () => Promise.resolve(execute()).then(resolve),
      reject,
    });
  });
};

const replayQueuedRequests = async () => {
  if (isReplayingQueue || !networkManager.getConnectionStatus()) {
    return;
  }

  isReplayingQueue = true;

  try {
    while (queuedRequests.length > 0 && networkManager.getConnectionStatus()) {
      const nextRequest = queuedRequests.shift();

      if (!nextRequest) {
        continue;
      }

      try {
        await nextRequest.execute();
      } catch (error) {
        nextRequest.reject(
          error instanceof Error
            ? error
            : new Error('Queued request failed while replaying.'),
        );
      }
    }
  } finally {
    isReplayingQueue = false;
  }
};

networkManager.subscribe((isConnected) => {
  if (isConnected) {
    void replayQueuedRequests();
  }
});

instance.interceptors.request.use((config) => {
  if (networkManager.getConnectionStatus() || !isQueueEnabled(config)) {
    return config;
  }

  return enqueueRequest(() => config);
});

instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config: InternalAxiosRequestConfig | undefined = error.config;

    if (!config || !isQueueEnabled(config) || !isOfflineNetworkError(error)) {
      throw error;
    }

    return enqueueRequest(() => instance.request(config));
  },
);

export { instance };
