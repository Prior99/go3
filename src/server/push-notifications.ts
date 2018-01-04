import { setVapidDetails, sendNotification } from "web-push";
import { inject, component } from "tsdi";
import { Connection } from "typeorm";

import { publicKey, privateKey } from "../vapid-keys";
import { Token } from "../common";

setVapidDetails("https://github.com/Prior99/go3", publicKey, privateKey);

@component
export class PushNotifications {
    @inject public db: Connection;

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
