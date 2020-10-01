import * as jwt from "jsonwebtoken";
import GetUserByIdUseCase from "../../domain/users/usecases/GetUserByIdUseCase";
import { Id } from "karate-stars-core";
import { JwtAuthenticator, TokenData } from "../../server";

class JwtDefaultAuthenticator implements JwtAuthenticator {
    public readonly name = "jwt Authentication";

    constructor(public secretKey: string, private getUserByIdUseCase: GetUserByIdUseCase) {
        if (!secretKey) {
            throw new Error("Does not exists environment variable for secretKey");
        }
    }

    async validateTokenData(tokenData: TokenData): Promise<{ isValid: boolean }> {
        const user = await this.getUserByIdUseCase.execute(tokenData.userId);

        if (user) {
            return { isValid: true };
        } else {
            return { isValid: false };
        }
    }

    generateToken(userId: Id): string {
        const tokenData: TokenData = {
            userId: userId.value,
        };

        return jwt.sign(tokenData, this.secretKey, { expiresIn: "24h" });
    }

    decodeToken(token: string): TokenData {
        return jwt.verify(token, this.secretKey) as TokenData;
    }
}

export default JwtDefaultAuthenticator;