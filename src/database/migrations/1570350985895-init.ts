import { MigrationInterface, QueryRunner } from 'typeorm'

export class Init1570350985895 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const sql = `
  create extension if not exists "uuid-ossp";
  drop type if exists status;
  create type status as enum ('draft', 'pending', 'active', 'inactive', 'approved', 'archived', 'published', 'deleted' );
  create table if not exists "user"
  (
    id                          uuid primary key          not null default uuid_generate_v4(),
    created_at                  timestamptz default now() not null,
    updated_at                  timestamptz default now() not null,
    deleted_at                  timestamptz,
    first_name                  varchar(200)              not null,
    last_name                   varchar(200)              not null,
    email                       varchar(200) unique       not null,
    status                      status default 'draft'
  );
  create table if not exists user_magic_link
  (
    id           uuid primary key          not null default uuid_generate_v4(),
    created_at   timestamptz default now() not null,
    updated_at   timestamptz default now() not null,
    deleted_at   timestamptz,
    user_id      uuid references "user" on delete cascade,
    token        varchar(255)       not null,
    validated_at timestamptz,
    expired_at   timestamptz
  );
  `
    await queryRunner.query(sql, undefined)
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    const sql = `
    drop table if exists user_magic_link;
    drop table if exists "user";
    drop type if exists status;
    `
    await queryRunner.query(sql, undefined)
  }
}