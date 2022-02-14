export class Eviction {
    id: number;
    name: string;
    maxEvictedProducts: number;
    keepPeriod: number;
    keepPeriodUnit: string;
    filter: string;
    orderBy: string;
    status: string;
    targetCollection: any;
    isSoftEviction: string;
    schedule: string;
    isActive: string;
}