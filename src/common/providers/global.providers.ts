import {APP_FILTER, APP_INTERCEPTOR} from "@nestjs/core";
import {HttpExceptionFilter} from "../filters/http-exception.filter";
import CatchEverythingFilter from "../filters/catch-everything.filter";
import LoggingInterceptor from "../interceptors/logging.interceptor";
import {CacheInterceptor} from "../interceptors/cache.interceptor";

export const GlobalProviders = [
    {
        provide: APP_FILTER,
        useClass: CatchEverythingFilter,

    },
    {
        provide: APP_FILTER,
        useClass: HttpExceptionFilter
    },
    {
        provide: APP_INTERCEPTOR,
        useClass: LoggingInterceptor
    },
    {
        provide: APP_INTERCEPTOR,
        useClass: CacheInterceptor
    }

]