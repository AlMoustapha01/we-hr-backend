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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CreateDepartmentDto } from '../dtos/create-department.dto';
import { UpdateDepartmentDto } from '../dtos/update-department.dto';
import { DepartmentResponseDto } from '../dtos/department-response.dto';
import { AssignManagerDto } from '../dtos/assign-manager.dto';
import { AssignEmployeeToDepartmentDto } from '../dtos/assign-employee-to-department.dto';
import {
  DepartmentPaginatedQueryDto,
  DepartmentPaginatedResponseDto,
} from '../dtos/department-paginated.dto';
import { CreateDepartmentHandler } from '@/app/use-cases/create-department';
import { CreateDepartmentCommand } from '@/app/use-cases/create-department';
import {
  UpdateDepartmentHandler,
  UpdateDepartmentCommand,
} from '@/app/use-cases/update-department';
import {
  DeleteDepartmentHandler,
  DeleteDepartmentCommand,
  DepartmentHasEmployeesError,
} from '@/app/use-cases/delete-department';
import {
  AssignDepartmentManagerHandler,
  AssignDepartmentManagerCommand,
} from '@/app/use-cases/assign-department-manager';
import {
  AssignEmployeeToDepartmentHandler,
  AssignEmployeeToDepartmentCommand,
  EmployeeAlreadyAssignedError,
} from '@/app/use-cases/assign-employee-to-department';
import {
  RetireEmployeeFromDepartmentHandler,
  RetireEmployeeFromDepartmentCommand,
  AssignmentNotFoundError,
} from '@/app/use-cases/retire-employee-from-department';
import { DepartmentRepositoryPort } from '@/app/domain/department.repository.port';
import { IdResponse } from '@/libs/api/id.response.dto';
import { match, Result } from 'oxide.ts';
import { AggregateID } from '@/libs/domain';
import {
  DepartmentAlreadyExistsError,
  ManagerNotFoundError,
  EmployeeNotEligibleForManagerError,
  DepartmentNotFoundError,
} from '@/app/domain/department.errors';
import { EmployeeNotFoundError } from '@/app/domain/employee.errors';
import { DEPARTMENT_REPOSITORY } from '@/app/app.di-tokens';

@ApiTags('Departments')
@Controller('departments')
export class DepartmentController {
  constructor(
    private readonly createDepartmentHandler: CreateDepartmentHandler,
    private readonly updateDepartmentHandler: UpdateDepartmentHandler,
    private readonly deleteDepartmentHandler: DeleteDepartmentHandler,
    private readonly assignDepartmentManagerHandler: AssignDepartmentManagerHandler,
    private readonly assignEmployeeToDepartmentHandler: AssignEmployeeToDepartmentHandler,
    private readonly retireEmployeeFromDepartmentHandler: RetireEmployeeFromDepartmentHandler,
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: DepartmentRepositoryPort,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new department' })
  @ApiCreatedResponse({
    description: 'Department created successfully',
    type: IdResponse,
  })
  @ApiResponse({ status: 409, description: 'Department already exists' })
  @ApiResponse({ status: 404, description: 'Manager not found' })
  async create(@Body() dto: CreateDepartmentDto): Promise<IdResponse> {
    const command = new CreateDepartmentCommand({
      name: dto.name,
      description: dto.description,
      managerId: dto.managerId,
    });

    const result: Result<AggregateID, Error> =
      await this.createDepartmentHandler.execute(command);

    return match(result, {
      Ok: (id: AggregateID) => {
        return new IdResponse(id);
      },
      Err: (error: Error) => {
        if (error instanceof DepartmentAlreadyExistsError)
          throw new ConflictHttpException({
            message: error.message,
            error: error.code,
          });
        if (error instanceof ManagerNotFoundError)
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
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiOkResponse({
    description: 'Department found',
    type: DepartmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DepartmentResponseDto> {
    const departmentOption = await this.departmentRepository.findOneById(id);

    if (departmentOption.isNone()) {
      throw new NotFoundException({
        message: 'Department not found',
        error: 'DEPARTMENT.NOT_FOUND',
      });
    }

    return DepartmentResponseDto.fromEntity(departmentOption.unwrap());
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all departments',
  })
  @ApiOkResponse({
    description: 'Paginated list of departments',
    type: DepartmentPaginatedResponseDto,
  })
  async findPaginated(
    @Query() query: DepartmentPaginatedQueryDto,
  ): Promise<DepartmentPaginatedResponseDto> {
    const { limit, page, orderBy, orderDirection, name, managerId } = query;

    const filterBy: any[] = [];

    if (name) {
      filterBy.push({
        field: 'name',
        operator: 'EQUALS',
        value: name,
      });
    }

    if (managerId) {
      filterBy.push({
        field: 'managerId',
        operator: 'EQUALS',
        value: managerId,
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

    const paginated = await this.departmentRepository.findAllPaginated(params);

    return {
      count: paginated.count,
      limit: paginated.limit,
      page: paginated.page,
      data: paginated.data.map((dept) =>
        DepartmentResponseDto.fromEntity(dept),
      ),
    };
  }

  @Get('manager/:managerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get departments by manager ID' })
  @ApiOkResponse({
    description: 'List of departments managed by the specified employee',
    type: [DepartmentResponseDto],
  })
  async findByManagerId(
    @Param('managerId', ParseUUIDPipe) managerId: string,
  ): Promise<DepartmentResponseDto[]> {
    const departments =
      await this.departmentRepository.findByManagerId(managerId);
    return departments.map((dept) => DepartmentResponseDto.fromEntity(dept));
  }

  @Get('slug/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get department by slug' })
  @ApiOkResponse({
    description: 'Department found',
    type: DepartmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async findBySlug(
    @Param('slug') slug: string,
  ): Promise<DepartmentResponseDto> {
    const departmentOption = await this.departmentRepository.findBySlug(slug);

    if (departmentOption.isNone()) {
      throw new NotFoundException({
        message: 'Department not found',
        error: 'DEPARTMENT.NOT_FOUND',
      });
    }

    return DepartmentResponseDto.fromEntity(departmentOption.unwrap());
  }

  @Put(':id/assign-manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign an employee as manager of a department' })
  @ApiOkResponse({
    description: 'Manager assigned successfully',
    type: IdResponse,
  })
  @ApiResponse({ status: 404, description: 'Department or Employee not found' })
  @ApiResponse({
    status: 400,
    description: 'Employee not eligible to be manager',
  })
  async assignManager(
    @Param('id', ParseUUIDPipe) departmentId: string,
    @Body() dto: AssignManagerDto,
  ): Promise<IdResponse> {
    const command = new AssignDepartmentManagerCommand({
      departmentId,
      employeeId: dto.employeeId,
    });

    const result: Result<AggregateID, Error> =
      await this.assignDepartmentManagerHandler.execute(command);

    return match(result, {
      Ok: (id: AggregateID) => {
        return new IdResponse(id);
      },
      Err: (error: Error) => {
        if (error instanceof DepartmentNotFoundError)
          throw new NotFoundException({
            message: error.message,
            error: error.code,
          });
        if (error instanceof EmployeeNotFoundError)
          throw new NotFoundException({
            message: error.message,
            error: error.code,
          });
        if (error instanceof EmployeeNotEligibleForManagerError)
          throw new BadRequestException({
            message: error.message,
            error: error.code,
          });
        throw error;
      },
    });
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a department' })
  @ApiOkResponse({
    description: 'Department updated successfully',
    type: IdResponse,
  })
  @ApiResponse({ status: 404, description: 'Department or Employee not found' })
  @ApiResponse({ status: 409, description: 'Department name already exists' })
  @ApiResponse({
    status: 400,
    description: 'Employee not eligible to be manager',
  })
  async update(
    @Param('id', ParseUUIDPipe) departmentId: string,
    @Body() dto: UpdateDepartmentDto,
  ): Promise<IdResponse> {
    const command = new UpdateDepartmentCommand({
      departmentId,
      name: dto.name,
      description: dto.description,
      managerId: dto.managerId,
    });

    const result: Result<AggregateID, Error> =
      await this.updateDepartmentHandler.execute(command);

    return match(result, {
      Ok: (id: AggregateID) => {
        return new IdResponse(id);
      },
      Err: (error: Error) => {
        if (error instanceof DepartmentNotFoundError)
          throw new NotFoundException({
            message: error.message,
            error: error.code,
          });
        if (error instanceof DepartmentAlreadyExistsError)
          throw new ConflictHttpException({
            message: error.message,
            error: error.code,
          });
        if (error instanceof EmployeeNotFoundError)
          throw new NotFoundException({
            message: error.message,
            error: error.code,
          });
        if (error instanceof EmployeeNotEligibleForManagerError)
          throw new BadRequestException({
            message: error.message,
            error: error.code,
          });
        throw error;
      },
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a department' })
  @ApiOkResponse({
    description: 'Department deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 409, description: 'Department has employees' })
  async delete(
    @Param('id', ParseUUIDPipe) departmentId: string,
  ): Promise<void> {
    const command = new DeleteDepartmentCommand({
      departmentId,
    });

    const result: Result<boolean, Error> =
      await this.deleteDepartmentHandler.execute(command);

    match(result, {
      Ok: () => {
        return;
      },
      Err: (error: Error) => {
        if (error instanceof DepartmentNotFoundError)
          throw new NotFoundException({
            message: error.message,
            error: error.code,
          });
        if (error instanceof DepartmentHasEmployeesError)
          throw new ConflictHttpException({
            message: error.message,
            error: 'DEPARTMENT.HAS_EMPLOYEES',
          });
        throw error;
      },
    });
  }

  @Post('assignments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign an employee to a department' })
  @ApiCreatedResponse({
    description: 'Employee assigned to department successfully',
    type: IdResponse,
  })
  @ApiResponse({ status: 404, description: 'Department or Employee not found' })
  @ApiResponse({
    status: 409,
    description: 'Employee already assigned to this department',
  })
  async assignEmployee(
    @Body() dto: AssignEmployeeToDepartmentDto,
  ): Promise<IdResponse> {
    const command = new AssignEmployeeToDepartmentCommand({
      employeeId: dto.employeeId,
      departmentId: dto.departmentId,
      notes: dto.notes,
    });

    const result: Result<AggregateID, Error> =
      await this.assignEmployeeToDepartmentHandler.execute(command);

    return match(result, {
      Ok: (id: AggregateID) => {
        return new IdResponse(id);
      },
      Err: (error: Error) => {
        if (error instanceof DepartmentNotFoundError)
          throw new NotFoundException({
            message: error.message,
            error: error.code,
          });
        if (error instanceof EmployeeNotFoundError)
          throw new NotFoundException({
            message: error.message,
            error: error.code,
          });
        if (error instanceof EmployeeAlreadyAssignedError)
          throw new ConflictHttpException({
            message: error.message,
            error: 'ASSIGNMENT.ALREADY_EXISTS',
          });
        throw error;
      },
    });
  }

  @Put('assignments/retire')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retire an employee from a department' })
  @ApiOkResponse({
    description: 'Employee retired from department successfully',
    type: IdResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Department or Assignment not found',
  })
  async retireEmployee(
    @Body() dto: AssignEmployeeToDepartmentDto,
  ): Promise<IdResponse> {
    const command = new RetireEmployeeFromDepartmentCommand({
      employeeId: dto.employeeId,
      departmentId: dto.departmentId,
    });

    const result: Result<AggregateID, Error> =
      await this.retireEmployeeFromDepartmentHandler.execute(command);

    return match(result, {
      Ok: (id: AggregateID) => {
        return new IdResponse(id);
      },
      Err: (error: Error) => {
        if (error instanceof DepartmentNotFoundError)
          throw new NotFoundException({
            message: error.message,
            error: error.code,
          });
        if (error instanceof AssignmentNotFoundError)
          throw new NotFoundException({
            message: error.message,
            error: 'ASSIGNMENT.NOT_FOUND',
          });
        throw error;
      },
    });
  }
}
