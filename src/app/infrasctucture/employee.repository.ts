import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Option, Some, None } from 'oxide.ts';
import { EmployeeRepositoryPort } from '@/app/domain/employee.repository.port';
import { RepositoryBase } from '@/libs/db/reposiroty.base';
import {
  EmployeeEntity,
  EmployeeStatus,
  EmployeePosition,
} from '@/app/domain/employee';
import { EmployeeEntityDb } from './employee.entity.db';
import { EmployeeMapper } from '@/app/mappers/employee.mapper';

@Injectable()
export class EmployeeRepository
  extends RepositoryBase<EmployeeEntity, EmployeeEntityDb>
  implements EmployeeRepositoryPort
{
  protected readonly tableName = EmployeeEntityDb.name;

  constructor(
    readonly mapper: EmployeeMapper,
    @InjectRepository(EmployeeEntityDb)
    readonly employeeRepository: Repository<EmployeeEntityDb>,
  ) {
    super(employeeRepository, mapper, new Logger(EmployeeRepository.name));
  }

  async findByEmail(email: string): Promise<Option<EmployeeEntity>> {
    const employeeDb = await this.employeeRepository.findOne({
      where: { email },
    });

    if (!employeeDb) {
      return None;
    }

    return Some(this.mapper.toDomain(employeeDb));
  }

  async findByDepartmentId(departmentId: string): Promise<EmployeeEntity[]> {
    const employees = await this.employeeRepository.find({
      where: { departmentId },
    });

    return employees.map((emp) => this.mapper.toDomain(emp));
  }

  async findByStatus(status: EmployeeStatus): Promise<EmployeeEntity[]> {
    const employees = await this.employeeRepository.find({
      where: { status },
    });

    return employees.map((emp) => this.mapper.toDomain(emp));
  }

  async findByPosition(position: EmployeePosition): Promise<EmployeeEntity[]> {
    const employees = await this.employeeRepository.find({
      where: { position },
    });

    return employees.map((emp) => this.mapper.toDomain(emp));
  }

  async findManagers(): Promise<EmployeeEntity[]> {
    const employees = await this.employeeRepository.find({
      where: { position: EmployeePosition.MANAGER },
    });

    return employees.map((emp) => this.mapper.toDomain(emp));
  }
}
