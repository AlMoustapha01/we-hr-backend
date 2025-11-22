import { Injectable } from '@nestjs/common';
import { Mapper } from '@/libs/domain';
import { DepartmentEntity } from '@/app/domain/department';
import { DepartmentEntityDb } from '@/app/infrasctucture/department.entity.db';
import { z } from 'zod';

export const departmentSchema = z.object({
  id: z.string(),
  createdAt: z.preprocess(
    (val: string | Date | number) => new Date(val),
    z.date(),
  ),
  updatedAt: z.preprocess(
    (val: string | Date | number) => new Date(val),
    z.date(),
  ),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  managerId: z.string().nullable(),
});

export type DepartmentModel = z.infer<typeof departmentSchema>;

@Injectable()
export class DepartmentMapper
  implements Mapper<DepartmentEntity, DepartmentModel>
{
  toPersistence(entity: DepartmentEntity): DepartmentEntityDb {
    const copy = entity.getProps();
    const record: DepartmentModel = {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      name: copy.name,
      slug: copy.slug,
      description: copy.description,
      managerId: copy.managerId,
    };
    departmentSchema.parse(record);

    const dbEntity = new DepartmentEntityDb();
    Object.assign(dbEntity, record);

    return dbEntity;
  }

  toDomain(record: DepartmentEntityDb): DepartmentEntity {
    const { id, createdAt, updatedAt, ...props } = record;
    const entity = new DepartmentEntity({
      id,
      createdAt,
      updatedAt,
      props: {
        name: props.name,
        slug: props.slug,
        description: props.description,
        managerId: props.managerId,
      },
    });
    return entity;
  }
}
