import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type StoredEntity<T> = T & BaseEntity;

type Entity<T> = StoredEntity<T>;

@Injectable()
export class BaseInMemoryService<T extends Record<string, any>> {
  protected readonly items = new Map<string, Entity<T>>();

  findAll(): Entity<T>[] {
    return Array.from(this.items.values());
  }

  findOne(id: string): Entity<T> {
    const entity = this.items.get(id);
    if (!entity) {
      throw new NotFoundException(`Resource with id '${id}' was not found.`);
    }
    return entity;
  }

  create(payload: T): Entity<T> {
    const now = new Date();
    const entity: Entity<T> = {
      ...payload,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.items.set(entity.id, entity);
    return entity;
  }

  update(id: string, payload: Partial<T>): Entity<T> {
    const existing = this.findOne(id);
    const updated: Entity<T> = {
      ...existing,
      ...payload,
      id,
      updatedAt: new Date(),
    };
    this.items.set(id, updated);
    return updated;
  }

  remove(id: string): Entity<T> {
    const existing = this.findOne(id);
    this.items.delete(id);
    return existing;
  }
}
