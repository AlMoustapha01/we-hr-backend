import { DepartmentEntity } from './department';
import { RepositoryPort } from '@/libs/domain';
import { Option } from 'oxide.ts';

export interface DepartmentRepositoryPort
  extends RepositoryPort<DepartmentEntity> {
  findBySlug(slug: string): Promise<Option<DepartmentEntity>>;
  findByManagerId(managerId: string): Promise<DepartmentEntity[]>;
  findByName(name: string): Promise<Option<DepartmentEntity>>;
}
