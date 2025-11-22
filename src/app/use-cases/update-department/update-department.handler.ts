import { Injectable, Logger, Inject } from '@nestjs/common';
import { UpdateDepartmentCommand } from './update-department.command';
import { DepartmentRepositoryPort } from '@/app/domain/department.repository.port';
import { EmployeeRepositoryPort } from '@/app/domain/employee.repository.port';
import { DepartmentDomainService } from '@/app/domain/department.domain-service';
import { Err, Ok, Result } from 'oxide.ts';
import { AggregateID } from '@/libs/domain';
import {
  DepartmentNotFoundError,
  DepartmentAlreadyExistsError,
  EmployeeNotEligibleForManagerError,
} from '@/app/domain/department.errors';
import { EmployeeNotFoundError } from '@/app/domain/employee.errors';
import {
  DEPARTMENT_REPOSITORY,
  EMPLOYEE_REPOSITORY,
} from '@/app/app.di-tokens';
import { ConflictException } from '@/libs/exceptions';

@Injectable()
export class UpdateDepartmentHandler {
  private readonly logger = new Logger(UpdateDepartmentHandler.name);

  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: DepartmentRepositoryPort,
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepositoryPort,
    private readonly departmentDomainService: DepartmentDomainService,
  ) {}

  async execute(
    command: UpdateDepartmentCommand,
  ): Promise<Result<AggregateID, Error>> {
    this.logger.log(`Updating department: ${command.departmentId}`);

    // Check if department exists
    const departmentOption = await this.departmentRepository.findOneById(
      command.departmentId,
    );
    if (departmentOption.isNone()) {
      return Err(new DepartmentNotFoundError());
    }

    const department = departmentOption.unwrap();

    // Update name if provided
    if (
      command.name !== undefined &&
      command.name !== department.getProps().name
    ) {
      // Check if new name already exists
      const existingDepartment = await this.departmentRepository.findByName(
        command.name,
      );
      if (
        existingDepartment.isSome() &&
        existingDepartment.unwrap().id !== department.id
      ) {
        return Err(new DepartmentAlreadyExistsError());
      }
      department.updateName(command.name);
    }

    // Update description if provided
    if (command.description !== undefined) {
      department.updateDescription(command.description);
    }

    // Update manager if provided
    if (command.managerId !== undefined) {
      if (command.managerId === null) {
        // Remove manager
        department.removeManager();
      } else {
        // Assign new manager - validate employee exists and is eligible
        const employeeOption = await this.employeeRepository.findOneById(
          command.managerId,
        );
        if (employeeOption.isNone()) {
          return Err(new EmployeeNotFoundError());
        }

        const employee = employeeOption.unwrap();

        // Validate manager eligibility using domain service
        try {
          this.departmentDomainService.validateManagerEligibility(employee);
        } catch (error) {
          if (error instanceof EmployeeNotEligibleForManagerError) {
            return Err(error);
          }
          throw error;
        }

        department.assignManager(command.managerId);
      }
    }

    try {
      // Persist to database
      await this.departmentRepository.transaction(async () =>
        this.departmentRepository.save(department),
      );

      this.logger.log(`Department updated successfully: ${department.id}`);

      return Ok(department.id);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new DepartmentAlreadyExistsError(error));
      }
      this.logger.error(
        `Failed to update department: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
