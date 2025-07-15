

export interface IHealthz {
    status: string,
    timestamp: string,
    db: string,
    redis:  'UP' | 'DOWN',
    cache:  'UP' | 'DOWN',
    uptime: string,
    memory: {
        rss: number,
        heapUsed: number,
        heapTotal:number,
    },
}