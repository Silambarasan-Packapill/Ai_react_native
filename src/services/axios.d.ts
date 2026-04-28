/* eslint-disable @typescript-eslint/consistent-type-definitions */
import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    queueWhenOffline?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    queueWhenOffline?: boolean;
  }
}
