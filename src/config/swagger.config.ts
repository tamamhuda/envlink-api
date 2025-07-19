import {ConfigService} from "@nestjs/config";
import {EnvVars} from "./env.validation";
import {DocumentBuilder, OpenAPIObject, SwaggerCustomOptions} from "@nestjs/swagger";


export const getSwaggerDocumentConfig = async (config: ConfigService<EnvVars>): Promise<Omit<OpenAPIObject, "paths">> => {
    return new DocumentBuilder()
        .setTitle(config.get("APP_NAME", { infer: true }) ?? "nest-app")
        .setDescription(config.get("APP_DESCRIPTION", { infer: true }) ?? "nest-js application")
        .setVersion(config.get("APP_VERSION", { infer: true }) ?? "v1.0.0")
        .build()
}

