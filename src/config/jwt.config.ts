import {ConfigService} from "@nestjs/config";
import {JwtSignOptions} from "@nestjs/jwt";
import {EnvVars} from "./env.validation";


export const getJwtConfig =  (config: ConfigService<EnvVars>) : Record<"accessToken" | "refreshToken", JwtSignOptions> => {
    return {
        accessToken : {
            secret: config.get('JWT_ACCESS_SECRET', {infer: true}),
            expiresIn: config.get('JWT_ACCESS_EXPIRES_IN', {infer: true}),
        },
        refreshToken : {
            secret: config.get('JWT_REFRESH_SECRET', {infer: true}),
            expiresIn: config.get('JWT_REFRESH_EXPIRES_IN', {infer: true}),
        }

    }

}