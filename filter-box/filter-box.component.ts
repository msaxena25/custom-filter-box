import { Component, OnInit, Input, SimpleChanges, HostListener, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Util } from '../../shared/services/util';

@Component({
  selector: 'app-filter-box',
  templateUrl: './filter-box.component.html',
  styleUrls: ['./filter-box.component.scss']
})

export class FilterBoxComponent implements OnInit {
  @Input() data: any;
  @Input() values: any;
  @Output()
  filterChange: EventEmitter<any> = new EventEmitter<any>();
  showFilter: boolean = false;
  filterCatories: any = [];
  filterValues: any = [];
  searchValue: any = {};
  queryParams: any = [];
  quickSearchText: string = "";
  hasfilter: boolean = false;
  countValue: any = [];
  isQuickSearchIconClicked: boolean = false;
  @ViewChild("search") searchfield: ElementRef;
  constructor(private util: Util, private el: ElementRef) {
    this.util.mergeObject();
  }


  // On Click on outside Filter box it should be closed
  @HostListener('document:click', ['$event'])
  handleWindowClick(event: Event) {
    let isElement = this.el.nativeElement.contains(event.target);
    if ((<any>event.target).id == 'filter') {
      this.showFilter = true;
    } else if (this.showFilter && isElement) {
      this.showFilter = true;
    }
    else {
      this.showFilter = false;
      // !this.hasfilter ? this.clearFilter() : '';
    }
  }


  /**
* 
* @param changes - If property binding changes occurred, this method will be called
*/
  ngOnChanges(changes: SimpleChanges) {
    if (changes.data.currentValue && changes.data.currentValue.values) {
      this.filterValues = changes.data.currentValue.values;
      let keys = Object.keys(this.filterValues);
      keys.forEach((element, index) => {
        this.filterValues[element].unshift({ id: -1, name: 'All', checked: false }); // added 'All' element in each category on first position
      });
    }
  }


  /**
   * Get Filter categories from filterCategories Input property
   * Get Filter params from filterCategories Input property
   */
  ngAfterViewInit() {
    let cat = this.data.categories[0];
    this.filterCatories = cat.categories;
    this.queryParams = cat.queryParams;

  }

  ngOnInit() {

  }

  onClearQuickSearch() {
    this.isQuickSearchIconClicked = false;
    this.quickSearchText = '';
    this.onKeyEnter("clearSearch");
  }

  onQuickSearchIconClicked() {
    this.searchfield.nativeElement.focus();
    this.isQuickSearchIconClicked = !this.isQuickSearchIconClicked;   // toggle the search input box
    this.onKeyEnter();
  }

  /**
   * IF All option is checked > checked all items, if any item unchecked then uncheck All option also
   * @param $event - value
   * @param id  - item id
   * @param category - category
   */
  onCheck($event, id, category) {
    let values = this.filterValues[category];
    if (id == -1) {  // 'All'
      values.forEach((element) => {
        element.checked = $event.checked;
      });
      if ($event.checked) {                           //for count of filter
        this.countValue[category] = values.length - 1;
      } else {
        this.countValue[category] = 0;
      }
    }
    else {
      !$event.checked ? values[0].checked = false : ''; // if any item is unchecked then deselect All

      // If all items are checked then select All option also
      let checkedValues = values.map(function (item) { return item.checked });  // get all item's checked property array
      if (checkedValues.lastIndexOf(false) == 0) { // if false last index is not 0 means more then 1 item are still unchecked
        values[0].checked = true;
      }
      let count = 0;
      checkedValues.forEach(x => {
        if (x) {
          count++;
        }
      });
      this.countValue[category] = count;
    }
  }

  applyFilter() {
    let arr = {};
    let keys = Object.keys(this.filterValues);

    keys.forEach((element, index) => {
      let ids = [];
      let values = this.filterValues[element];

      values.find(function (item) {
        if (item.checked && item.id > -1) {  // get all checked item of a category, -1 id is for 'All' value
          ids.push(item.id);
        }
      });
      if (ids.length > 0) {
        arr[this.queryParams[index]] = ids;
      }
    });

    if (Object.keys(arr).length > 0) {
      this.hasfilter = true;
      this.filterChange.emit(arr);
    }
    //this.onClearQuickSearch();
    this.isQuickSearchIconClicked = false;
    this.quickSearchText = '';
    this.showFilter = false;
  }

  /**
   * IF filter applied then only emit event to load default data
   */
  clearFilter() {
    if (this.hasfilter) {
      this.filterChange.emit(); // Emit event with no data
      this.hasfilter = false;
    }
    let keys = Object.keys(this.filterValues);
    keys.forEach((element, index) => {
      let values = this.filterValues[element];
      values.find(function (item) {
        if (item.checked) {
          item.checked = false;
        }
      }); // mark unchecked
      this.countValue[keys[index]] = 0;       //reset the count of each filter back to 0.
    });
    this.showFilter = false;
  }

  /**Perform search
   * @param type = optional only defined for search icon click
   * If no letter is typed then perform SEARCH only in case of clear search X button click
   */
  onKeyEnter(type?: string) {
    if (this.quickSearchText != '' || (type != undefined && type == "clearSearch")) {
      if(this.quickSearchText != ''){
        let param = {
          searchText: encodeURIComponent(this.quickSearchText),
        }
        this.filterChange.emit(param);
      }
      else{
        this.filterChange.emit();
      }
      //remove the filters before emitting search data
      this.hasfilter = false;
      let keys = Object.keys(this.filterValues);
      keys.forEach((element, index) => {
        let values = this.filterValues[element];
        values.find(function (item) {
          if (item.checked) {
            item.checked = false;
          }
        }); // mark unchecked
        this.countValue[keys[index]] = 0;
      });
      this.showFilter = false;
    }
  }



}



import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myfilter',
  pure: false
})
export class MyFilterPipe implements PipeTransform {
  transform(items: any[], filter: any): any {
    if (!items || !filter) {
      return items;
    }

    // filter items array, items which match
    return items.filter(function (item) {
      if ((item.description || item.name).toLowerCase().indexOf(filter.toLowerCase()) > -1) {
        return item;
      }
    });
  }
}