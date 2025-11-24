import { Injectable, Logger, Inject } from '@nestjs/common';
import { UpdateEmployeeCommand } from './update-employee.command';
import { EmployeeRepositoryPort } from '@/app/domain/employee.repository.port';
import { DepartmentRepositoryPort } from '@/app/domain/department.repository.port';
import { Err, Ok, Result } from 'oxide.ts';
import { AggregateID } from '@/libs/domain';
import {
  EmployeeAlreadyExistsError,
  EmployeeNotFoundError,
  EmployeeDepartmentNotFoundError,
} from '@/app/domain/employee.errors';
import {
  DEPARTMENT_REPOSITORY,
  EMPLOYEE_REPOSITORY,
} from '@/app/app.di-tokens';
import { ConflictException } from '@/libs/exceptions';

@Injectable()
export class UpdateEmployeeHandler {
  private readonly logger = new Logger(UpdateEmployeeHandler.name);

  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepositoryPort,
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: DepartmentRepositoryPort,
  ) {}

  async execute(
    command: UpdateEmployeeCommand,
  ): Promise<Result<AggregateID, Error>> {
    this.logger.log(`Updating employee: ${command.employeeId}`);

    // Check if employee exists
    const employeeOption = await this.employeeRepository.findOneById(
      command.employeeId,
    );
    if (employeeOption.isNone()) {
      return Err(new EmployeeNotFoundError());
    }

    const employee = employeeOption.unwrap();
    const employeeProps = employee.getProps();

    // Update name if provided
    if (command.name !== undefined) {
      employee.updateName(command.name);
    }

    // Update email if provided and different
    if (command.email !== undefined && command.email !== employeeProps.email) {
      // Check if new email already exists
      const existingEmployee = await this.employeeRepository.findByEmail(
        command.email,
      );
      if (
        existingEmployee.isSome() &&
        existingEmployee.unwrap().id !== employee.id
      ) {
        return Err(new EmployeeAlreadyExistsError());
      }
    }

    // Update contact info if email or phone provided
    if (command.email !== undefined || command.phone !== undefined) {
      employee.updateContactInfo(
        command.email ?? employeeProps.email,
        command.phone ?? employeeProps.phone,
      );
    }

    // Update position if provided
    if (command.position !== undefined) {
      employee.updatePosition(command.position);
    }

    // Update role if provided
    if (command.role !== undefined) {
      employee.updateRole(command.role);
    }

    // Update salary if provided
    if (command.salary !== undefined) {
      employee.updateSalary(command.salary);
    }

    // Update department if provided
    if (command.departmentId !== undefined) {
      if (command.departmentId === null) {
        // Remove department
        employee.removeDepartment();
      } else {
        // Assign new department - validate department exists
        const departmentOption = await this.departmentRepository.findOneById(
          command.departmentId,
        );
        if (departmentOption.isNone()) {
          return Err(new EmployeeDepartmentNotFoundError());
        }
        employee.assignToDepartment(command.departmentId);
      }
    }

    // Update avatar if provided
    if (command.avatar !== undefined) {
      employee.updateAvatar(command.avatar);
    }

    try {
      // Persist to database
      await this.employeeRepository.transaction(async () =>
        this.employeeRepository.save(employee),
      );

      this.logger.log(`Employee updated successfully: ${employee.id}`);

      return Ok(employee.id);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new EmployeeAlreadyExistsError(error));
      }
      this.logger.error(
        `Failed to update employee: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
