import { Command, CommandProps } from '@/libs/domain';

export class AssignEmployeeToDepartmentCommand extends Command {
  readonly employeeId: string;
  readonly departmentId: string;
  readonly notes?: string;

  constructor(props: CommandProps<AssignEmployeeToDepartmentCommand>) {
    super(props);
    this.employeeId = props.employeeId;
    this.departmentId = props.departmentId;
    this.notes = props.notes;
  }
}
