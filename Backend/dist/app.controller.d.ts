import { AppService } from "./app.service";
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getServerStatus(): {
        message: string;
        status: string;
        timestamp: string;
    };
    checkHealth(): {
        status: string;
        service: string;
        timestamp: string;
    };
}
