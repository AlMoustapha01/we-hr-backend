import { EmployeeEntity, EmployeeStatus, EmployeePosition } from './employee';
import { RepositoryPort } from '@/libs/domain';
import { Option } from 'oxide.ts';

export interface EmployeeRepositoryPort extends RepositoryPort<EmployeeEntity> {
  findByEmail(email: string): Promise<Option<EmployeeEntity>>;
  findByDepartmentId(departmentId: string): Promise<EmployeeEntity[]>;
  findByStatus(status: EmployeeStatus): Promise<EmployeeEntity[]>;
  findByPosition(position: EmployeePosition): Promise<EmployeeEntity[]>;
  findManagers(): Promise<EmployeeEntity[]>;
}
