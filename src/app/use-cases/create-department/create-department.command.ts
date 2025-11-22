import { Command, CommandProps } from '@/libs/domain';

export class CreateDepartmentCommand extends Command {
  readonly name: string;
  readonly description: string;
  readonly managerId?: string;

  constructor(props: CommandProps<CreateDepartmentCommand>) {
    super(props);
    this.name = props.name;
    this.description = props.description;
    this.managerId = props.managerId;
  }
}
