import { ObjectLiteral, Repository } from 'typeorm'
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions'
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult'
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere'

export abstract class BaseRepository<T extends ObjectLiteral> {
  abstract get(): Repository<T>

  async find(options?: FindManyOptions<T>): Promise<T[]> {
    return this.get().find(options)
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.get().findOne(options)
  }

  async findOneBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T | null> {
    return this.get().findOneBy(where)
  }

  async save(entity: T): Promise<T> {
    return this.get().save(entity)
  }

  async saveAll(entities: T[]): Promise<T[]> {
    return this.get().save(entities)
  }

  async update(
    criteria: FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    return this.get().update(criteria, partialEntity)
  }

  async softDelete(criteria: FindOptionsWhere<T>): Promise<UpdateResult> {
    return this.get().softDelete(criteria)
  }

  async delete(entity: T): Promise<T> {
    return this.get().remove(entity)
  }
}