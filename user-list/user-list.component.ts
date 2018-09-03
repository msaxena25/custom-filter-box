import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';

import { SharedService } from '../../../shared/services/shared.service';
import { Util } from '../../../shared/services/util';
import { UserService } from '../user.service';
import { AppMessage } from '../../../shared/config/app-message.enum';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  paginationInfo: any = "";
  displayedColumns: string[] = ['name', 'email', 'roles', 'status', 'link'];
  dataSource = new MatTableDataSource();

  filterCat: any = [{ categories: ['role', 'status'], queryParams: ['roleIds', 'status'] }];
  filterValues: any = [];
  tempFilterValues: any = [];
  noRecords: boolean = false;
  totalRecords: number = 0;
  pageNumber: number = 1; // save current page number and increase it by 1 in case of lazy loading.

  constructor(private userService: UserService, private route: Router, private util: Util, private sharedService: SharedService) { }
  sortParams: any = '';
  filterParams: any = '';

  ngOnInit() {
    this.getRoles();
    this.getUser();
    this.util.isClone = false;
    this.sort.sortChange.subscribe((value) => {
      this.sortParams = { orderBy: value.direction, sortedOnField: value.active };
      this.getUser();
    });
  }

  getRoles() {
    this.userService.getRoles().subscribe(response => {
      this.tempFilterValues['role'] = response.response.results;
      this.tempFilterValues['status'] = [{ id: 1, name: 'Active', checked: false }, { id: 0, name: 'InActive', checked: false }];
      this.filterValues = this.tempFilterValues;
    });
  }

  /**
   * IF sorted params applied then we have to send that params on each next request while we are on this page.
   * @param pageNumber to save current page number and increase at scroll
   * @param loadMore: optional - if scrolled down page and lazy load then true
   */
  getUser(pageNumber = 1, loadMore?) {
    let param: any = {
      pathVariable: pageNumber,
      pageSize: 50
    }
    if (this.sortParams && this.sortParams.orderBy) {
      Object.assign(param, this.sortParams);
    }

    if (this.filterParams) {
      Object.assign(param, this.filterParams);
    }

    this.userService.getUserList(param).subscribe(response => {
      this.sharedService.onSuccess(response, null, () => {
        this.paginationInfo = response.response.paginationInfo;
        this.pageNumber = response.response.paginationInfo.curPage; // save current page value
        this.totalRecords = response.response.paginationInfo.totalRecords;
        let data = this.dataSource.data;
        if (loadMore) {
          data.push.apply(data, response.response.results);
        } else {
          data = [];
          data.push.apply(data, response.response.results);
        }
        this.dataSource.data = data;
        this.noRecords = this.dataSource.data.length > 0 ? false : true;
      });

    });
  }  

  onChangeFilter(data: any) {
    this.filterParams = data;
    this.getUser();
  } 

}