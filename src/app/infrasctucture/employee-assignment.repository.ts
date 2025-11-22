import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepositoryBase } from '@/libs/db/reposiroty.base';
import { EmployeeAssignmentEntity } from '@/app/domain/employee-assignment';
import { EmployeeAssignmentRepositoryPort } from '@/app/domain/employee-assignment.repository.port';
import { EmployeeAssignmentEntityDb } from './employee-assignment.entity.db';
import { EmployeeAssignmentMapper } from '@/app/mappers/employee-assignment.mapper';
import { Option, None, Some } from 'oxide.ts';

@Injectable()
export class EmployeeAssignmentRepository
  extends RepositoryBase<EmployeeAssignmentEntity, EmployeeAssignmentEntityDb>
  implements EmployeeAssignmentRepositoryPort
{
  protected tableName = 'employee_assignments';

  constructor(
    @InjectRepository(EmployeeAssignmentEntityDb)
    private readonly assignmentRepository: Repository<EmployeeAssignmentEntityDb>,
    protected readonly assignmentMapper: EmployeeAssignmentMapper,
  ) {
    const logger = new Logger(EmployeeAssignmentRepository.name);
    super(assignmentRepository, assignmentMapper, logger);
  }

  async findByEmployeeId(
    employeeId: string,
  ): Promise<EmployeeAssignmentEntity[]> {
    const assignments = await this.assignmentRepository.find({
      where: { employeeId },
      order: { assignedAt: 'DESC' },
    });
    return assignments.map((assignment) =>
      this.assignmentMapper.toDomain(assignment),
    );
  }

  async findByDepartmentId(
    departmentId: string,
  ): Promise<EmployeeAssignmentEntity[]> {
    const assignments = await this.assignmentRepository.find({
      where: { departmentId },
      order: { assignedAt: 'DESC' },
    });
    return assignments.map((assignment) =>
      this.assignmentMapper.toDomain(assignment),
    );
  }

  async findActiveByEmployeeId(
    employeeId: string,
  ): Promise<EmployeeAssignmentEntity[]> {
    const assignments = await this.assignmentRepository.find({
      where: { employeeId, isActive: true },
      order: { assignedAt: 'DESC' },
    });
    return assignments.map((assignment) =>
      this.assignmentMapper.toDomain(assignment),
    );
  }

  async findActiveByDepartmentId(
    departmentId: string,
  ): Promise<EmployeeAssignmentEntity[]> {
    const assignments = await this.assignmentRepository.find({
      where: { departmentId, isActive: true },
      order: { assignedAt: 'DESC' },
    });
    return assignments.map((assignment) =>
      this.assignmentMapper.toDomain(assignment),
    );
  }

  async findActiveAssignment(
    employeeId: string,
    departmentId: string,
  ): Promise<Option<EmployeeAssignmentEntity>> {
    const assignment = await this.assignmentRepository.findOne({
      where: { employeeId, departmentId, isActive: true },
    });

    if (!assignment) {
      return None;
    }

    return Some(this.assignmentMapper.toDomain(assignment));
  }
}
