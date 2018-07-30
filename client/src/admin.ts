import * as api from './api';
import { IPushMessage, IUserDetails } from './api';
import * as auth from './auth';
import * as user from './user';

export const sendPush = async (target: number, data: IPushMessage) => {
    if (!user.getUser().isAdmin || !auth.isAuthenticated()) {
        return;
    }

    await api.sendPush(target, data, auth.getToken()!);
}