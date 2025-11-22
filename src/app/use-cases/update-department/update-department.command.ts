import { Command, CommandProps } from '@/libs/domain';

export class UpdateDepartmentCommand extends Command {
  readonly departmentId: string;
  readonly name?: string;
  readonly description?: string;
  readonly managerId?: string | null;

  constructor(props: CommandProps<UpdateDepartmentCommand>) {
    super(props);
    this.departmentId = props.departmentId;
    this.name = props.name;
    this.description = props.description;
    this.managerId = props.managerId;
  }
}
