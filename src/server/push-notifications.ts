import { setVapidDetails, sendNotification } from "web-push";
import { initialize, inject, component } from "tsdi";
import { Connection } from "typeorm";

import { publicKey, privateKey } from "../vapid-keys";
import { Token, isBrowser } from "../common";

@component
export class PushNotifications {
    @inject public db: Connection;

    @initialize
    private init() {
        setVapidDetails("https://github.com/Prior99/go3", publicKey, privateKey);
    }

    public async notifyUser(userId: string) {
        const tokens = await this.db.getRepository(Token).createQueryBuilder("token")
            .leftJoin("token.user", "user")
            .where("user.id=:userId", { userId })
            .andWhere("token.pushEndpoint is not null")
            .getMany();
        await Promise.all(tokens.map(async token => {
            await sendNotification({
                endpoint: token.pushEndpoint,
            });
        }));
    }
}
