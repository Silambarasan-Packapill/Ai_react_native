import { instance } from '@/services/instance';

import { userSchema } from './schema';

export const UserServices = {
  fetchOne: async (id: number) => {
    const response = await instance.get(`users/${id}`);
    return userSchema.parse(response.data);
  },
};
