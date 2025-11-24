import { Injectable, Logger, Inject } from '@nestjs/common';
import { CreateDepartmentCommand } from './create-department.command';
import { DepartmentRepositoryPort } from '@/app/domain/department.repository.port';
import { DepartmentEntity } from '@/app/domain/department';
import { EmployeeRepositoryPort } from '@/app/domain/employee.repository.port';
import { DepartmentDomainService } from '@/app/domain/department.domain-service';
import { Err, Ok, Result } from 'oxide.ts';
import { AggregateID } from '@/libs/domain';
import {
  DepartmentAlreadyExistsError,
  ManagerNotFoundError,
  EmployeeNotEligibleForManagerError,
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
    private readonly departmentDomainService: DepartmentDomainService,
  ) {}

  async execute(
    command: CreateDepartmentCommand,
  ): Promise<Result<AggregateID, Error>> {
    this.logger.log(
      `Creating department: ${command.name} with manager: ${command.managerId ?? 'none'}`,
    );

    // Check if manager exists and is eligible (only if managerId is provided)
    if (command.managerId) {
      const managerOption = await this.employeeRepository.findOneById(
        command.managerId,
      );
      if (managerOption.isNone()) {
        return Err(new ManagerNotFoundError());
      }

      // Validate manager eligibility
      const manager = managerOption.unwrap();
      try {
        this.departmentDomainService.validateManagerEligibility(manager);
      } catch (error) {
        if (error instanceof EmployeeNotEligibleForManagerError) {
          return Err(error);
        }
        throw error;
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
