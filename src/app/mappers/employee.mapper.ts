import { Injectable } from '@nestjs/common';
import { Mapper } from '@/libs/domain';
import {
  EmployeeEntity,
  EmployeeStatus,
  EmployeePosition,
} from '@/app/domain/employee';
import { EmployeeEntityDb } from '@/app/infrasctucture/employee.entity.db';
import { z } from 'zod';

export const employeeSchema = z.object({
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
  email: z.string().email(),
  phone: z.string(),
  position: z.nativeEnum(EmployeePosition),
  role: z.string(),
  status: z.nativeEnum(EmployeeStatus),
  joinDate: z.preprocess(
    (val: string | Date | number) => new Date(val),
    z.date(),
  ),
  salary: z.number().positive(),
  departmentId: z.string().nullable(),
  avatar: z.string().nullable(),
});

export type EmployeeModel = z.infer<typeof employeeSchema>;

@Injectable()
export class EmployeeMapper implements Mapper<EmployeeEntity, EmployeeModel> {
  toPersistence(entity: EmployeeEntity): EmployeeEntityDb {
    const copy = entity.getProps();
    const record: EmployeeModel = {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      name: copy.name,
      email: copy.email,
      phone: copy.phone,
      position: copy.position,
      role: copy.role,
      status: copy.status,
      joinDate: copy.joinDate,
      salary: copy.salary,
      departmentId: copy.departmentId ?? null,
      avatar: copy.avatar ?? null,
    };
    employeeSchema.parse(record);

    const dbEntity = new EmployeeEntityDb();
    Object.assign(dbEntity, record);

    return dbEntity;
  }

  toDomain(record: EmployeeEntityDb): EmployeeEntity {
    const { id, createdAt, updatedAt, ...props } = record;
    const entity = new EmployeeEntity({
      id,
      createdAt,
      updatedAt,
      props: {
        name: props.name,
        email: props.email,
        phone: props.phone,
        position: props.position,
        role: props.role,
        status: props.status,
        joinDate: props.joinDate,
        salary: Number(props.salary),
        departmentId: props.departmentId ?? undefined,
        avatar: props.avatar ?? undefined,
      },
    });
    return entity;
  }
}
