import { RepositoryPort } from '@/libs/domain/repository.port';
import { EmployeeAssignmentEntity } from './employee-assignment';
import { Option } from 'oxide.ts';

export interface EmployeeAssignmentRepositoryPort
  extends RepositoryPort<EmployeeAssignmentEntity> {
  findByEmployeeId(employeeId: string): Promise<EmployeeAssignmentEntity[]>;
  findByDepartmentId(departmentId: string): Promise<EmployeeAssignmentEntity[]>;
  findActiveByEmployeeId(
    employeeId: string,
  ): Promise<EmployeeAssignmentEntity[]>;
  findActiveByDepartmentId(
    departmentId: string,
  ): Promise<EmployeeAssignmentEntity[]>;
  findActiveAssignment(
    employeeId: string,
    departmentId: string,
  ): Promise<Option<EmployeeAssignmentEntity>>;
}
