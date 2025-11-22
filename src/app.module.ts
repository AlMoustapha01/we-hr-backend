import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';
import {
  addTransactionalDataSource,
  getDataSourceByName,
} from 'typeorm-transactional';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database/config/database.config';
import appConfig from './config/app-config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RequestContextModule } from 'nestjs-request-context';

// Controllers
import {
  DepartmentController,
  EmployeeController,
} from './app/presentation/controllers';

// Entities
import {
  DepartmentEntityDb,
  EmployeeEntityDb,
  EmployeeAssignmentEntityDb,
} from './app/infrasctucture';

// Repositories
import {
  DepartmentRepository,
  EmployeeRepository,
  EmployeeAssignmentRepository,
} from './app/infrasctucture';

// DI Tokens
import {
  DEPARTMENT_REPOSITORY,
  EMPLOYEE_REPOSITORY,
  EMPLOYEE_ASSIGNMENT_REPOSITORY,
} from './app/app.di-tokens';

// Mappers
import {
  DepartmentMapper,
  EmployeeMapper,
  EmployeeAssignmentMapper,
} from './app/mappers';

// Domain Services
import { DepartmentDomainService } from './app/domain/department.domain-service';

// Use Cases / Handlers
import {
  CreateDepartmentHandler,
  CreateEmployeeHandler,
  AssignDepartmentManagerHandler,
  UpdateDepartmentHandler,
  DeleteDepartmentHandler,
  UpdateEmployeeHandler,
  DeleteEmployeeHandler,
  ChangeEmployeeStatusHandler,
  AssignEmployeeToDepartmentHandler,
  RetireEmployeeFromDepartmentHandler,
} from './app/use-cases';

const infrastructureDatabaseModule = [
  TypeOrmModule.forRootAsync({
    useClass: TypeOrmConfigService,
    dataSourceFactory: async (options: DataSourceOptions) => {
      return (
        getDataSourceByName('default') ||
        addTransactionalDataSource(new DataSource(options)).initialize()
      );
    },
  }),
  TypeOrmModule.forFeature([
    DepartmentEntityDb,
    EmployeeEntityDb,
    EmployeeAssignmentEntityDb,
  ]),
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: [
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : process.env.NODE_ENV === 'test'
            ? '.env.test'
            : '.env',
      ],
    }),
    ...infrastructureDatabaseModule,
    RequestContextModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController, DepartmentController, EmployeeController],
  providers: [
    AppService,
    // Mappers
    DepartmentMapper,
    EmployeeMapper,
    EmployeeAssignmentMapper,
    // Domain Services
    DepartmentDomainService,
    // Repositories
    {
      provide: DEPARTMENT_REPOSITORY,
      useClass: DepartmentRepository,
    },
    {
      provide: EMPLOYEE_REPOSITORY,
      useClass: EmployeeRepository,
    },
    {
      provide: EMPLOYEE_ASSIGNMENT_REPOSITORY,
      useClass: EmployeeAssignmentRepository,
    },
    // Use Case Handlers
    CreateDepartmentHandler,
    CreateEmployeeHandler,
    AssignDepartmentManagerHandler,
    UpdateDepartmentHandler,
    DeleteDepartmentHandler,
    UpdateEmployeeHandler,
    DeleteEmployeeHandler,
    ChangeEmployeeStatusHandler,
    AssignEmployeeToDepartmentHandler,
    RetireEmployeeFromDepartmentHandler,
  ],
})
export class AppModule {}
