export declare class AppService {
    getServerStatus(): {
        message: string;
        status: string;
        timestamp: string;
    };
    healthCheck(): {
        status: string;
        service: string;
        timestamp: string;
    };
}
