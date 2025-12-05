import { Component } from '@angular/core';
import { TalentList } from '../../component/talent-container/talent-list/talent-list';
import { PortalBurgerComponent } from '../../../../defis-national/component/portal-burger/portal-burger.component';

@Component({
  selector: 'app-talent-page',
  imports: [TalentList, PortalBurgerComponent],
  templateUrl: './talent-page.html',
  styleUrl: './talent-page.css',
})
export class TalentPage {

}
