import { Injectable, Logger, Inject } from '@nestjs/common';
import { CreateEmployeeCommand } from './create-employee.command';
import { EmployeeRepositoryPort } from '@/app/domain/employee.repository.port';
import { EmployeeEntity } from '@/app/domain/employee';
import { DepartmentRepositoryPort } from '@/app/domain/department.repository.port';
import { Err, Ok, Result } from 'oxide.ts';
import { AggregateID } from '@/libs/domain';
import {
  EmployeeAlreadyExistsError,
  EmployeeDepartmentNotFoundError,
} from '@/app/domain/employee.errors';
import { ConflictException } from '@/libs/exceptions';
import {
  DEPARTMENT_REPOSITORY,
  EMPLOYEE_REPOSITORY,
} from '@/app/app.di-tokens';

@Injectable()
export class CreateEmployeeHandler {
  private readonly logger = new Logger(CreateEmployeeHandler.name);

  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepositoryPort,
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: DepartmentRepositoryPort,
  ) {}

  async execute(
    command: CreateEmployeeCommand,
  ): Promise<Result<AggregateID, Error>> {
    this.logger.log(
      `Creating employee: ${command.name} (${command.email}) with position: ${command.position}`,
    );

    // Check if department exists (if provided)
    if (command.departmentId) {
      const department = await this.departmentRepository.findOneById(
        command.departmentId,
      );
      if (department.isNone()) {
        return Err(new EmployeeDepartmentNotFoundError());
      }
    }

    // Check if employee with same email already exists
    const existingEmployee = await this.employeeRepository.findByEmail(
      command.email,
    );

    if (existingEmployee.isSome()) {
      return Err(new EmployeeAlreadyExistsError());
    }

    // Create employee entity
    const employee = EmployeeEntity.create({
      name: command.name,
      email: command.email,
      phone: command.phone,
      position: command.position,
      role: command.role,
      joinDate: command.joinDate,
      salary: command.salary,
      departmentId: command.departmentId,
      avatar: command.avatar,
    });

    try {
      // Persist to database
      await this.employeeRepository.transaction(async () =>
        this.employeeRepository.insert(employee),
      );

      this.logger.log(`Employee created successfully with ID: ${employee.id}`);

      return Ok(employee.id);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new EmployeeAlreadyExistsError(error));
      }

      throw error;
    }
  }
}
