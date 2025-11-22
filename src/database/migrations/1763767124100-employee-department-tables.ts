import { MigrationInterface, QueryRunner } from 'typeorm';

export class EmployeeDepartmentTables1763767124100
  implements MigrationInterface
{
  name = 'EmployeeDepartmentTables1763767124100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."employees_position_enum" AS ENUM('Manager', 'Senior', 'Mid-Level', 'Junior', 'Intern')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."employees_status_enum" AS ENUM('active', 'on-leave', 'terminated')`,
    );
    await queryRunner.query(
      `CREATE TABLE "employees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "phone" character varying(50) NOT NULL, "position" "public"."employees_position_enum" NOT NULL, "role" character varying(100) NOT NULL, "status" "public"."employees_status_enum" NOT NULL DEFAULT 'active', "joinDate" TIMESTAMP NOT NULL, "salary" numeric(10,2) NOT NULL, "departmentId" uuid, "avatar" character varying(500), CONSTRAINT "UQ_765bc1ac8967533a04c74a9f6af" UNIQUE ("email"), CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "departments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text NOT NULL, "managerId" uuid, CONSTRAINT "UQ_a23b1fdc69006219d8acc76c04f" UNIQUE ("slug"), CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "FK_4edfe103ebf2fcb98dbb582554b" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" ADD CONSTRAINT "FK_f6414ec030ca08823b25e03cd9d" FOREIGN KEY ("managerId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT "FK_f6414ec030ca08823b25e03cd9d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "FK_4edfe103ebf2fcb98dbb582554b"`,
    );
    await queryRunner.query(`DROP TABLE "departments"`);
    await queryRunner.query(`DROP TABLE "employees"`);
    await queryRunner.query(`DROP TYPE "public"."employees_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."employees_position_enum"`);
  }
}
