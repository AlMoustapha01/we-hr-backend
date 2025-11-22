import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ConflictException as ConflictHttpException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateEmployeeDto } from '../dtos/create-employee.dto';
import { UpdateEmployeeDto } from '../dtos/update-employee.dto';
import { EmployeeResponseDto } from '../dtos/employee-response.dto';
import {
  EmployeePaginatedQueryDto,
  EmployeePaginatedResponseDto,
} from '../dtos/employee-paginated.dto';
import { CreateEmployeeHandler } from '@/app/use-cases/create-employee';
import { CreateEmployeeCommand } from '@/app/use-cases/create-employee';
import {
  UpdateEmployeeHandler,
  UpdateEmployeeCommand,
} from '@/app/use-cases/update-employee';
import {
  DeleteEmployeeHandler,
  DeleteEmployeeCommand,
  EmployeeIsManagerError,
} from '@/app/use-cases/delete-employee';
import {
  ChangeEmployeeStatusHandler,
  ChangeEmployeeStatusCommand,
} from '@/app/use-cases/change-employee-status';
import { EmployeeRepositoryPort } from '@/app/domain/employee.repository.port';
import { EmployeeStatus, EmployeePosition } from '@/app/domain/employee';
import { IdResponse } from '@/libs/api/id.response.dto';
import { match, Result } from 'oxide.ts';
import { AggregateID } from '@/libs/domain';
import {
  EmployeeAlreadyExistsError,
  EmployeeDepartmentNotFoundError,
} from '@/app/domain/employee.errors';
import { EMPLOYEE_REPOSITORY } from '@/app/app.di-tokens';

@ApiTags('Employees')
@Controller('employees')
export class EmployeeController {
  constructor(
    private readonly createEmployeeHandler: CreateEmployeeHandler,
    private readonly updateEmployeeHandler: UpdateEmployeeHandler,
    private readonly deleteEmployeeHandler: DeleteEmployeeHandler,
    private readonly changeEmployeeStatusHandler: ChangeEmployeeStatusHandler,
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepositoryPort,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiCreatedResponse({
    description: 'Employee created successfully',
    type: IdResponse,
  })
  @ApiResponse({ status: 409, description: 'Employee already exists' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async create(@Body() dto: CreateEmployeeDto): Promise<IdResponse> {
    const command = new CreateEmployeeCommand({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      position: dto.position,
      role: dto.role,
      joinDate: new Date(dto.joinDate),
      salary: dto.salary,
      departmentId: dto.departmentId,
      avatar: dto.avatar,
    });

    const result: Result<AggregateID, Error> =
      await this.createEmployeeHandler.execute(command);

    return match(result, {
      Ok: (id: AggregateID) => {
        return new IdResponse(id);
      },
      Err: (error: Error) => {
        if (error instanceof EmployeeAlreadyExistsError)
          throw new ConflictHttpException({
            message: error.message,
            error: error.code,
          });
        if (error instanceof EmployeeDepartmentNotFoundError)
          throw new NotFoundException({
            message: error.message,
            error: error.code,
          });
        throw error;
      },
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiOkResponse({
    description: 'Employee found',
    type: EmployeeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EmployeeResponseDto> {
    const employeeOption = await this.employeeRepository.findOneById(id);

    if (employeeOption.isNone()) {
      throw new NotFoundException({
        message: 'Employee not found',
        error: 'EMPLOYEE.NOT_FOUND',
      });
    }

    return EmployeeResponseDto.fromEntity(employeeOption.unwrap());
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get employees with pagination, filtering and ordering',
  })
  @ApiOkResponse({
    description: 'Paginated list of employees',
    type: EmployeePaginatedResponseDto,
  })
  async findPaginated(
    @Query() query: EmployeePaginatedQueryDto,
  ): Promise<EmployeePaginatedResponseDto> {
    const {
      limit,
      page,
      orderBy,
      orderDirection,
      name,
      status,
      position,
      departmentId,
    } = query;

    const filterBy: any[] = [];

    if (name) {
      filterBy.push({
        field: 'name',
        operator: 'EQUALS',
        value: name,
      });
    }

    if (status) {
      filterBy.push({
        field: 'status',
        operator: 'EQUALS',
        value: status,
      });
    }

    if (position) {
      filterBy.push({
        field: 'position',
        operator: 'EQUALS',
        value: position,
      });
    }

    if (departmentId) {
      filterBy.push({
        field: 'departmentId',
        operator: 'EQUALS',
        value: departmentId,
      });
    }

    const params = {
      limit: limit || 10,
      page: page || 1,
      orderBy: {
        field: orderBy || 'createdAt',
        param: orderDirection || 'ASC',
      },
      filterBy: filterBy.length > 0 ? filterBy : undefined,
    };

    const paginated = await this.employeeRepository.findAllPaginated(params);

    return {
      count: paginated.count,
      limit: paginated.limit,
      page: paginated.page,
      data: paginated.data.map((emp) => EmployeeResponseDto.fromEntity(emp)),
    };
  }

  @Get('email/:email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get employee by email' })
  @ApiOkResponse({
    description: 'Employee found',
    type: EmployeeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async findByEmail(
    @Param('email') email: string,
  ): Promise<EmployeeResponseDto> {
    const employeeOption = await this.employeeRepository.findByEmail(email);

    if (employeeOption.isNone()) {
      throw new NotFoundException({
        message: 'Employee not found',
        error: 'EMPLOYEE.NOT_FOUND',
      });
    }

    return EmployeeResponseDto.fromEntity(employeeOption.unwrap());
  }

  @Get('department/:departmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get employees by department ID' })
  @ApiOkResponse({
    description: 'List of employees in the department',
    type: [EmployeeResponseDto],
  })
  async findByDepartmentId(
    @Param('departmentId', ParseUUIDPipe) departmentId: string,
  ): Promise<EmployeeResponseDto[]> {
    const employees =
      await this.employeeRepository.findByDepartmentId(departmentId);
    return employees.map((emp) => EmployeeResponseDto.fromEntity(emp));
  }

  @Get('status/:status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get employees by status' })
  @ApiQuery({
    name: 'status',
    enum: EmployeeStatus,
    description: 'Employee status filter',
  })
  @ApiOkResponse({
    description: 'List of employees with the specified status',
    type: [EmployeeResponseDto],
  })
  async findByStatus(
    @Param('status') status: EmployeeStatus,
  ): Promise<EmployeeResponseDto[]> {
    const employees = await this.employeeRepository.findByStatus(status);
    return employees.map((emp) => EmployeeResponseDto.fromEntity(emp));
  }

  @Get('position/:position')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get employees by position' })
  @ApiQuery({
    name: 'position',
    enum: EmployeePosition,
    description: 'Employee position filter',
  })
  @ApiOkResponse({
    description: 'List of employees with the specified position',
    type: [EmployeeResponseDto],
  })
  async findByPosition(
    @Param('position') position: EmployeePosition,
  ): Promise<EmployeeResponseDto[]> {
    const employees = await this.employeeRepository.findByPosition(position);
    return employees.map((emp) => EmployeeResponseDto.fromEntity(emp));
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an employee' })
  @ApiOkResponse({
    description: 'Employee updated successfully',
    type: IdResponse,
  })
  @ApiResponse({ status: 404, description: 'Employee or Department not found' })
  @ApiResponse({ status: 409, description: 'Employee email already exists' })
  async update(
    @Param('id', ParseUUIDPipe) employeeId: string,
    @Body() dto: UpdateEmployeeDto,
  ): Promise<IdResponse> {
    const command = new UpdateEmployeeCommand({
      employeeId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      position: dto.position,
      role: dto.role,
      salary: dto.salary,
      departmentId: dto.departmentId,
      avatar: dto.avatar,
    });

    const result: Result<AggregateID, Error> =
      await this.updateEmployeeHandler.execute(command);

    return match(result, {
      Ok: (id: AggregateID) => {
        return new IdResponse(id);
      },
      Err: (error: Error) => {
        if (error instanceof EmployeeAlreadyExistsError)
          throw new ConflictHttpException({
            message: error.message,
            error: error.code,
          });
        if (error instanceof EmployeeDepartmentNotFoundError)
          throw new NotFoundException({
            message: error.message,
            error: error.code,
          });
        throw error;
      },
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an employee' })
  @ApiOkResponse({
    description: 'Employee deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 409, description: 'Employee is managing departments' })
  async delete(@Param('id', ParseUUIDPipe) employeeId: string): Promise<void> {
    const command = new DeleteEmployeeCommand({
      employeeId,
    });

    const result: Result<boolean, Error> =
      await this.deleteEmployeeHandler.execute(command);

    match(result, {
      Ok: () => {
        return;
      },
      Err: (error: Error) => {
        if (error instanceof EmployeeIsManagerError)
          throw new ConflictHttpException({
            message: error.message,
            error: 'EMPLOYEE.IS_MANAGER',
          });
        throw error;
      },
    });
  }

  @Put(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate an employee (set status to ACTIVE)' })
  @ApiOkResponse({
    description: 'Employee activated successfully',
    type: IdResponse,
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async activate(
    @Param('id', ParseUUIDPipe) employeeId: string,
  ): Promise<IdResponse> {
    const command = new ChangeEmployeeStatusCommand({
      employeeId,
      status: EmployeeStatus.ACTIVE,
    });

    const result: Result<AggregateID, Error> =
      await this.changeEmployeeStatusHandler.execute(command);

    return match(result, {
      Ok: (id: AggregateID) => {
        return new IdResponse(id);
      },
      Err: (error: Error) => {
        throw error;
      },
    });
  }

  @Put(':id/on-leave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Put an employee on leave (set status to ON_LEAVE)',
  })
  @ApiOkResponse({
    description: 'Employee put on leave successfully',
    type: IdResponse,
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async putOnLeave(
    @Param('id', ParseUUIDPipe) employeeId: string,
  ): Promise<IdResponse> {
    const command = new ChangeEmployeeStatusCommand({
      employeeId,
      status: EmployeeStatus.ON_LEAVE,
    });

    const result: Result<AggregateID, Error> =
      await this.changeEmployeeStatusHandler.execute(command);

    return match(result, {
      Ok: (id: AggregateID) => {
        return new IdResponse(id);
      },
      Err: (error: Error) => {
        throw error;
      },
    });
  }

  @Put(':id/terminate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Terminate an employee (set status to TERMINATED)' })
  @ApiOkResponse({
    description: 'Employee terminated successfully',
    type: IdResponse,
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async terminate(
    @Param('id', ParseUUIDPipe) employeeId: string,
  ): Promise<IdResponse> {
    const command = new ChangeEmployeeStatusCommand({
      employeeId,
      status: EmployeeStatus.TERMINATED,
    });

    const result: Result<AggregateID, Error> =
      await this.changeEmployeeStatusHandler.execute(command);

    return match(result, {
      Ok: (id: AggregateID) => {
        return new IdResponse(id);
      },
      Err: (error: Error) => {
        throw error;
      },
    });
  }
}
