import { Injectable, Logger, Inject } from '@nestjs/common';
import { DeleteDepartmentCommand } from './delete-department.command';
import { DepartmentRepositoryPort } from '@/app/domain/department.repository.port';
import { EmployeeRepositoryPort } from '@/app/domain/employee.repository.port';
import { Err, Ok, Result } from 'oxide.ts';
import { DepartmentNotFoundError } from '@/app/domain/department.errors';
import {
  DEPARTMENT_REPOSITORY,
  EMPLOYEE_REPOSITORY,
} from '@/app/app.di-tokens';
import { ConflictException } from '@/libs/exceptions';

export class DepartmentHasEmployeesError extends Error {
  constructor(public readonly employeeCount: number) {
    super(
      `Cannot delete department with ${employeeCount} employees. Please reassign or remove employees first.`,
    );
    this.name = 'DepartmentHasEmployeesError';
  }
}

@Injectable()
export class DeleteDepartmentHandler {
  private readonly logger = new Logger(DeleteDepartmentHandler.name);

  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: DepartmentRepositoryPort,
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepositoryPort,
  ) {}

  async execute(
    command: DeleteDepartmentCommand,
  ): Promise<Result<boolean, Error>> {
    this.logger.log(`Deleting department: ${command.departmentId}`);

    // Check if department exists
    const departmentOption = await this.departmentRepository.findOneById(
      command.departmentId,
    );
    if (departmentOption.isNone()) {
      return Err(new DepartmentNotFoundError());
    }

    const department = departmentOption.unwrap();

    // Check if department has employees
    const employees = await this.employeeRepository.findByDepartmentId(
      command.departmentId,
    );

    if (employees.length > 0) {
      return Err(new DepartmentHasEmployeesError(employees.length));
    }

    try {
      // Delete department
      await this.departmentRepository.transaction(async () =>
        this.departmentRepository.delete(department),
      );

      this.logger.log(`Department deleted successfully: ${department.id}`);

      return Ok(true);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new DepartmentHasEmployeesError(0));
      }
      this.logger.error(
        `Failed to delete department: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
