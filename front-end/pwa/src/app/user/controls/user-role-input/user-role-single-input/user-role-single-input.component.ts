import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { UserRole } from 'src/app/core/models/enums/user-roles.enum';


interface Role {
  id: number;
  name: string;
}

@Component({
  selector: 'app-user-role-single-input',
  templateUrl: './user-role-single-input.component.html',
  styleUrls: ['./user-role-single-input.component.scss']
})
export class UserRoleSingleInputComponent {
  @Input() public label: string = 'User Role';
  @Input() public errorMessage: string = '';
  @Input() public includeOnlyIds!: number[];
  @Input() public selectedId!: number | null;
  @Output() public selectedIdChange = new EventEmitter<number | null>();

  protected options!: Role[];
  protected selectedOption!: Role | null;

  constructor() {

  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {

    //console.log('period selectedId', this.selectedId, 'existing: ', this.selectedOption, '  ', changes)

    //load options once
    if (!this.options) {
      this.options = this.getRoles();
    }

    if (this.includeOnlyIds && this.includeOnlyIds.length > 0) {
      this.options = this.getRoles().filter(data => this.includeOnlyIds.includes(data.id));
    }

    // Only react to changes if selectedId actually changes and is not the first change
    if (this.selectedId) {
      const found = this.options.find(period => period.id === this.selectedId);
      if (found && found !== this.selectedOption) {
        //console.log('setting found: ', found)
        this.selectedOption = found;
      }

    }

  }

  private getRoles(): Role[] {
    const roles: Role[] = [];
    roles.push({ id: UserRole.Administrator, name: 'Administrator' });
    roles.push({ id: UserRole.Approver, name: 'Approver' });
    roles.push({ id: UserRole.EntryClerk, name: 'Entry Clerk' });
    roles.push({ id: UserRole.Viewer, name: 'Viewer' }); 
    return roles;
  }

  protected optionDisplayFunction(option: Role): string {
    return option.name;
  }

  protected onSelectedOptionChange(selectedOption: Role | null) {
    //console.log('period selection',' this.selectedOption: ', this.selectedOption, ' selectedOption', selectedOption);
    if (selectedOption) {
      //this.selectedId = selectedOption.id;
      this.selectedIdChange.emit(selectedOption.id);
    } else {
      //this.selectedId = null;
      this.selectedIdChange.emit(null);
    }

  }
}
