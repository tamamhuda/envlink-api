import {APP_FILTER} from "@nestjs/core";
import CatchEverythingFilter from "../filters/catch-everything.filter";
import {HttpExceptionFilter} from "../http-exception.filter";


export const GlobalProviders = [
    {
        provide: APP_FILTER,
        useClass: CatchEverythingFilter,

    },
    {
        provide: APP_FILTER,
        useClass: HttpExceptionFilter
    }
]