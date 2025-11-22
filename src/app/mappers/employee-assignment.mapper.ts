import { Injectable } from '@nestjs/common';
import { Mapper } from '@/libs/domain';
import { EmployeeAssignmentEntity } from '@/app/domain/employee-assignment';
import { EmployeeAssignmentEntityDb } from '@/app/infrasctucture/employee-assignment.entity.db';
import { z } from 'zod';

export const employeeAssignmentSchema = z.object({
  id: z.string(),
  createdAt: z.preprocess(
    (val: string | Date | number) => new Date(val),
    z.date(),
  ),
  updatedAt: z.preprocess(
    (val: string | Date | number) => new Date(val),
    z.date(),
  ),
  employeeId: z.string(),
  departmentId: z.string(),
  assignedAt: z.preprocess(
    (val: string | Date | number) => new Date(val),
    z.date(),
  ),
  unassignedAt: z.preprocess(
    (val: string | Date | number | null) => (val ? new Date(val) : null),
    z.date().nullable(),
  ),
  isActive: z.boolean(),
  notes: z.string().nullable(),
});

export type EmployeeAssignmentModel = z.infer<typeof employeeAssignmentSchema>;

@Injectable()
export class EmployeeAssignmentMapper
  implements Mapper<EmployeeAssignmentEntity, EmployeeAssignmentModel>
{
  toPersistence(entity: EmployeeAssignmentEntity): EmployeeAssignmentEntityDb {
    const copy = entity.getProps();
    const record: EmployeeAssignmentModel = {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      employeeId: copy.employeeId,
      departmentId: copy.departmentId,
      assignedAt: copy.assignedAt,
      unassignedAt: copy.unassignedAt,
      isActive: copy.isActive,
      notes: copy.notes,
    };
    employeeAssignmentSchema.parse(record);

    const dbEntity = new EmployeeAssignmentEntityDb();
    Object.assign(dbEntity, record);

    return dbEntity;
  }

  toDomain(record: EmployeeAssignmentEntityDb): EmployeeAssignmentEntity {
    const { id, createdAt, updatedAt, ...props } = record;
    const entity = new EmployeeAssignmentEntity({
      id,
      createdAt,
      updatedAt,
      props: {
        employeeId: props.employeeId,
        departmentId: props.departmentId,
        assignedAt: props.assignedAt,
        unassignedAt: props.unassignedAt,
        isActive: props.isActive,
        notes: props.notes,
      },
    });
    return entity;
  }
}
