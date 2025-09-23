export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
export type StoredEntity<T> = T & BaseEntity;
type Entity<T> = StoredEntity<T>;
export declare class BaseInMemoryService<T extends Record<string, any>> {
    protected readonly items: Map<string, Entity<T>>;
    findAll(): Entity<T>[];
    findOne(id: string): Entity<T>;
    create(payload: T): Entity<T>;
    update(id: string, payload: Partial<T>): Entity<T>;
    remove(id: string): Entity<T>;
}
export {};
