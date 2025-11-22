import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Option, Some, None } from 'oxide.ts';
import { DepartmentRepositoryPort } from '@/app/domain/department.repository.port';
import { RepositoryBase } from '@/libs/db/reposiroty.base';
import { DepartmentEntity } from '@/app/domain/department';
import { DepartmentEntityDb } from './department.entity.db';
import { DepartmentMapper } from '@/app/mappers/department.mapper';

@Injectable()
export class DepartmentRepository
  extends RepositoryBase<DepartmentEntity, DepartmentEntityDb>
  implements DepartmentRepositoryPort
{
  protected readonly tableName = DepartmentEntityDb.name;

  constructor(
    readonly mapper: DepartmentMapper,
    @InjectRepository(DepartmentEntityDb)
    readonly departmentRepository: Repository<DepartmentEntityDb>,
  ) {
    super(departmentRepository, mapper, new Logger(DepartmentRepository.name));
  }

  async findBySlug(slug: string): Promise<Option<DepartmentEntity>> {
    const departmentDb = await this.departmentRepository.findOne({
      where: { slug },
    });

    if (!departmentDb) {
      return None;
    }

    return Some(this.mapper.toDomain(departmentDb));
  }

  async findByManagerId(managerId: string): Promise<DepartmentEntity[]> {
    const departments = await this.departmentRepository.find({
      where: { managerId },
    });

    return departments.map((dept) => this.mapper.toDomain(dept));
  }

  async findByName(name: string): Promise<Option<DepartmentEntity>> {
    const departmentDb = await this.departmentRepository.findOne({
      where: { name },
    });

    if (!departmentDb) {
      return None;
    }

    return Some(this.mapper.toDomain(departmentDb));
  }
}
