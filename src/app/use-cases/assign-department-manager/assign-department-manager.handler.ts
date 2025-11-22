import { Injectable, Logger, Inject } from '@nestjs/common';
import { AssignDepartmentManagerCommand } from './assign-department-manager.command';
import { DepartmentRepositoryPort } from '@/app/domain/department.repository.port';
import { EmployeeRepositoryPort } from '@/app/domain/employee.repository.port';
import { DepartmentDomainService } from '@/app/domain/department.domain-service';
import { Err, Ok, Result } from 'oxide.ts';
import { AggregateID } from '@/libs/domain';
import {
  DepartmentNotFoundError,
  EmployeeNotEligibleForManagerError,
} from '@/app/domain/department.errors';
import { EmployeeNotFoundError } from '@/app/domain/employee.errors';
import {
  DEPARTMENT_REPOSITORY,
  EMPLOYEE_REPOSITORY,
} from '@/app/app.di-tokens';

@Injectable()
export class AssignDepartmentManagerHandler {
  private readonly logger = new Logger(AssignDepartmentManagerHandler.name);

  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: DepartmentRepositoryPort,
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepositoryPort,
    private readonly departmentDomainService: DepartmentDomainService,
  ) {}

  async execute(
    command: AssignDepartmentManagerCommand,
  ): Promise<Result<AggregateID, Error>> {
    this.logger.log(
      `Assigning employee ${command.employeeId} as manager of department ${command.departmentId}`,
    );

    // Check if department exists
    const departmentOption = await this.departmentRepository.findOneById(
      command.departmentId,
    );
    if (departmentOption.isNone()) {
      return Err(new DepartmentNotFoundError());
    }

    // Check if employee exists
    const employeeOption = await this.employeeRepository.findOneById(
      command.employeeId,
    );
    if (employeeOption.isNone()) {
      return Err(new EmployeeNotFoundError());
    }

    const employee = employeeOption.unwrap();

    // Validate employee eligibility using domain service
    try {
      this.departmentDomainService.validateManagerEligibility(employee);
    } catch (error) {
      if (error instanceof EmployeeNotEligibleForManagerError) {
        return Err(error);
      }
      throw error;
    }

    const department = departmentOption.unwrap();

    // Assign manager to department
    department.assignManager(employee.id);

    try {
      // Persist to database
      await this.departmentRepository.transaction(async () =>
        this.departmentRepository.save(department),
      );

      this.logger.log(
        `Employee ${employee.id} assigned as manager of department ${department.id}`,
      );

      return Ok(department.id);
    } catch (error: any) {
      this.logger.error(
        `Failed to assign manager to department: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
