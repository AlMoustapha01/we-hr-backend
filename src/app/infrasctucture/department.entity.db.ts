import { BaseEntityDb } from '@/libs/db/base-entity-db';
import { Column, Entity, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { EmployeeEntityDb } from './employee.entity.db';
import { EmployeeAssignmentEntityDb } from './employee-assignment.entity.db';

@Entity('departments')
export class DepartmentEntityDb extends BaseEntityDb {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  managerId: string | null;

  @ManyToOne(
    () => EmployeeEntityDb,
    (employee) => employee.managedDepartments,
    { nullable: true, onDelete: 'SET NULL' },
  )
  @JoinColumn({ name: 'managerId' })
  manager: EmployeeEntityDb | null;

  @OneToMany(() => EmployeeEntityDb, (employee) => employee.department)
  employees: EmployeeEntityDb[];

  @OneToMany(
    () => EmployeeAssignmentEntityDb,
    (assignment) => assignment.department,
  )
  assignments: EmployeeAssignmentEntityDb[];
}
