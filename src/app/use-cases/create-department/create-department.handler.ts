import { Injectable, Logger, Inject } from '@nestjs/common';
import { CreateDepartmentCommand } from './create-department.command';
import { DepartmentRepositoryPort } from '@/app/domain/department.repository.port';
import { DepartmentEntity } from '@/app/domain/department';
import { EmployeeRepositoryPort } from '@/app/domain/employee.repository.port';
import { Err, Ok, Result } from 'oxide.ts';
import { AggregateID } from '@/libs/domain';
import {
  DepartmentAlreadyExistsError,
  ManagerNotFoundError,
} from '@/app/domain/department.errors';
import { ConflictException } from '@/libs/exceptions';
import {
  DEPARTMENT_REPOSITORY,
  EMPLOYEE_REPOSITORY,
} from '@/app/app.di-tokens';

@Injectable()
export class CreateDepartmentHandler {
  private readonly logger = new Logger(CreateDepartmentHandler.name);

  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: DepartmentRepositoryPort,
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepositoryPort,
  ) {}

  async execute(
    command: CreateDepartmentCommand,
  ): Promise<Result<AggregateID, Error>> {
    this.logger.log(
      `Creating department: ${command.name} with manager: ${command.managerId ?? 'none'}`,
    );

    // Check if manager exists (only if managerId is provided)
    if (command.managerId) {
      const manager = await this.employeeRepository.findOneById(
        command.managerId,
      );
      if (manager.isNone()) {
        return Err(new ManagerNotFoundError());
      }
    }

    // Check if department with same name already exists
    const existingDepartment = await this.departmentRepository.findByName(
      command.name,
    );

    if (existingDepartment.isSome()) {
      return Err(new DepartmentAlreadyExistsError());
    }

    // Create department entity
    const department = DepartmentEntity.create({
      name: command.name,
      description: command.description,
      managerId: command.managerId,
    });

    try {
      // Persist to database
      await this.departmentRepository.transaction(async () =>
        this.departmentRepository.insert(department),
      );

      this.logger.log(
        `Department created successfully with ID: ${department.id}`,
      );

      return Ok(department.id);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new DepartmentAlreadyExistsError(error));
      }

      throw error;
    }
  }
}
