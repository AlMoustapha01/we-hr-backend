import { Injectable, Logger, Inject } from '@nestjs/common';
import { ChangeEmployeeStatusCommand } from './change-employee-status.command';
import { EmployeeRepositoryPort } from '@/app/domain/employee.repository.port';
import { EmployeeStatus } from '@/app/domain/employee';
import { Err, Ok, Result } from 'oxide.ts';
import { AggregateID } from '@/libs/domain';
import { EmployeeNotFoundError } from '@/app/domain/employee.errors';
import { EMPLOYEE_REPOSITORY } from '@/app/app.di-tokens';

@Injectable()
export class ChangeEmployeeStatusHandler {
  private readonly logger = new Logger(ChangeEmployeeStatusHandler.name);

  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepositoryPort,
  ) {}

  async execute(
    command: ChangeEmployeeStatusCommand,
  ): Promise<Result<AggregateID, Error>> {
    this.logger.log(
      `Changing employee ${command.employeeId} status to ${command.status}`,
    );

    // Check if employee exists
    const employeeOption = await this.employeeRepository.findOneById(
      command.employeeId,
    );
    if (employeeOption.isNone()) {
      return Err(new EmployeeNotFoundError());
    }

    const employee = employeeOption.unwrap();

    // Change status based on command
    switch (command.status) {
      case EmployeeStatus.ACTIVE:
        employee.activate();
        break;
      case EmployeeStatus.ON_LEAVE:
        employee.putOnLeave();
        break;
      case EmployeeStatus.TERMINATED:
        employee.terminate();
        break;
    }

    try {
      // Persist to database
      await this.employeeRepository.transaction(async () =>
        this.employeeRepository.save(employee),
      );

      this.logger.log(
        `Employee status changed successfully: ${employee.id} -> ${command.status}`,
      );

      return Ok(employee.id);
    } catch (error: any) {
      this.logger.error(
        `Failed to change employee status: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
