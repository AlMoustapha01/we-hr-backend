import { BaseEntityDb } from '@/libs/db/base-entity-db';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { EmployeeEntityDb } from './employee.entity.db';
import { DepartmentEntityDb } from './department.entity.db';

@Entity('employee_assignments')
export class EmployeeAssignmentEntityDb extends BaseEntityDb {
  @Column({ type: 'uuid' })
  employeeId: string;

  @Column({ type: 'uuid' })
  departmentId: string;

  @Column({ type: 'timestamp' })
  assignedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  unassignedAt: Date | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ManyToOne(() => EmployeeEntityDb, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: EmployeeEntityDb;

  @ManyToOne(() => DepartmentEntityDb, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'departmentId' })
  department: DepartmentEntityDb;
}
