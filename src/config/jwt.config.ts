import {ConfigService} from "@nestjs/config";
import {EnvVars} from "./env.type";
import {JwtSignOptions} from "@nestjs/jwt";


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