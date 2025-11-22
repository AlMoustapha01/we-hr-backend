import { Command, CommandProps } from '@/libs/domain';
import { EmployeeStatus } from '@/app/domain/employee';

export class ChangeEmployeeStatusCommand extends Command {
  readonly employeeId: string;
  readonly status: EmployeeStatus;

  constructor(props: CommandProps<ChangeEmployeeStatusCommand>) {
    super(props);
    this.employeeId = props.employeeId;
    this.status = props.status;
  }
}
