import { BaseEntityDb } from '@/libs/db/base-entity-db';
import { EmployeeStatus, EmployeePosition } from '@/app/domain/employee';
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { DepartmentEntityDb } from './department.entity.db';
import { EmployeeAssignmentEntityDb } from './employee-assignment.entity.db';

@Entity('employees')
export class EmployeeEntityDb extends BaseEntityDb {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  phone: string;

  @Column({ type: 'enum', enum: EmployeePosition })
  position: EmployeePosition;

  @Column({ type: 'varchar', length: 100 })
  role: string;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
  })
  status: EmployeeStatus;

  @Column({ type: 'timestamp' })
  joinDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salary: number;

  @Column({ type: 'uuid', nullable: true })
  departmentId: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string | null;

  @ManyToOne(() => DepartmentEntityDb, (department) => department.employees, {
    nullable: true,
  })
  @JoinColumn({ name: 'departmentId' })
  department: DepartmentEntityDb | null;

  @OneToMany(() => DepartmentEntityDb, (department) => department.manager)
  managedDepartments: DepartmentEntityDb[];

  @OneToMany(
    () => EmployeeAssignmentEntityDb,
    (assignment) => assignment.employee,
  )
  assignments: EmployeeAssignmentEntityDb[];
}
