///<reference path="..\Libraries\jquery.d.ts" />
///<reference path="..\Libraries\knockout.d.ts" />
///<reference path="..\Libraries\perfect-scrollbar.d.ts" />
///<reference path="..\Helpers\bindingList.ts" />
///<reference path="..\Helpers\common.ts" />
///<reference path="event.ts" />
///<reference path="IView.ts" />
///<reference path="FilterGroup.ts" />

module Resco.UI {
	export class AdvancedList implements Resco.UI.IOrientationFilterListView {
		constructor() {
			this.rows = new Array<Row>();
			this.rowsActiveTemplateIndexSubs = new Array<KnockoutSubscription>();
			this.stretchRows = true;
			this.templates = new Array<RowTemplate>();
			this.templateIndex = ko.observable(0);
			this.selectedTemplateIndex = ko.observable(1);
			this.selectedIndex = -1;
			this.orientation = ListOrientation.Vertical;
			this.linesCount = 1;
			this.autoSelect = true;
			this.delayLoad = true;
			this.delayLoadCoeficient = 1;
			this.delayLoadBuffer = 0;
			this.fixedTemplateHeight = undefined;

			this.m_columnDefinitions = new Array<Resco.Rectangle>();

			this.bounds = new Resco.Rectangle(0, 0, -1, -1);

			//this.m_contentHeight = 0;
			this.m_contentWidth = 0;
			this.m_columnWidth = 0;

			this.m_useExternalScrollbar = false;
			this.m_bHasHorizontalScrollbar = ko.observable<boolean>(false);
			this.m_bHasHorizontalScrollbar.subscribe((visible) => {
				if (this.m_domRoot) {
					var scrollBarHeight = visible ? 17 : -17;   // TODO: get scrollbar Height
					var oldHeight = this.m_domRoot.height();
					var h = this.m_domRoot.height() + scrollBarHeight;
					this.m_domRoot.height(h);
					this.m_domListRows.height(h);

					//this.resized.raise(new Resco.ResizeEventArgs(-1, h, -1, oldHeight), this);
				}
			}, this);

			this.isSelected = ko.observable(true);
			this.isSelected.subscribe((nv: boolean) => {
				this._showHideView(nv);
			}, this);

			this.cellClick = new Event<CellClickEventArgs>(this);
			this.rowClick = new Event<RowClickedEventArgs>(this);
			this.rowDblClick = new Event<RowClickedEventArgs>(this);
			this.innerRowClick = new Event<InnerRowClickEventArgs>(this);
			this.buttonClick = new Event<ListButtonEventArgs>(this);
			this.filterChanged = new Event<FilterChangedEventArgs>(this);
			this.moreDataNeeded = new Event<EventArgs>(this);
			this.listScroll = new Event<ListScrolledEventArgs>(this);
			this.resized = new Event<ResizeEventArgs>(this);
			this.rowInserted = new Resco.Event<RowInsertedEventArgs>(this);
			this.delayLoadCompleted = new Event<EventArgs>(this);
			this.selectedIndexChanged = new Event<SelectedIndexChangedEventArgs>(this);

			this.loadComplete = ko.observable(true);
			this.loadComplete.subscribe((value) => {
				this._showLoading(!value);
			}, this);

			this.caption = ko.observable<string>();

			this.isVisible = ko.observable(true);
			this.isFilterVisible = ko.observable(true);
			this.isFilterVisible.subscribe((value) => {
				this._update();
			}, this);
			this.emptyFilterText = ko.observable("Search...");
			this.m_filterText = "";
			this.filterTextObs = ko.observable<string>("");
			this.filterTextObs.subscribe((text: string) => {
				this.m_filterText = text;
				this.filterChanged.raise(new FilterChangedEventArgs(FilterChangeKind.TextChanging));
			}, this);
			this.filterGroup = ko.observable<FilterGroup>();
		}

		public name: string;
		public imageName: string;
		public text: string;
		public caption: KnockoutObservable<string>;
		public delayLoad: boolean;
		// float number indicating the (coef * height) of the screen to be preloaded. default 1.0
		public delayLoadCoeficient: number;
		// minimal number of items to be loaded when next chunk is requested. default is 0
		public delayLoadBuffer: number;
		//public form: IForm;
		//public layout: FlexiViewLayout;
		public isSelected: KnockoutObservable<boolean>;
		public isVisible: KnockoutObservable<boolean>;
		public rows: Array<Row>;
		public rowsActiveTemplateIndexSubs: Array<KnockoutSubscription>;
		public stretchRows: boolean;
		public templates: Array<RowTemplate>;
		public templateIndex: KnockoutObservable<number>;
		public selectedTemplateIndex: KnockoutObservable<number>;
		public templateSelector: (object, bool) => number;
		public templateSelectorOwner: any;
		public fixedTemplateHeight: number;	// overides the heights of templates defined in woodford (or as html content)
		public autoSelect: boolean;
		public orientation: ListOrientation;
		public linesCount: number;
		public filterGroup: KnockoutObservable<FilterGroup>;
		public loadComplete: KnockoutObservable<boolean>;
		public emptyFilterText: KnockoutObservable<string>;
		public isFilterVisible: KnockoutObservable<boolean>;
		public getEmptyListText: (sender: any) => string;
		public getEmptyListTextOwner: any;
		public filterCellIndex: number;
		public filterTextObs: KnockoutObservable<string>;
		get filterText(): string {
			return this.m_filterText;
		}

		public filterChanged: Resco.Event<FilterChangedEventArgs>;

		public cellClick: Event<CellClickEventArgs>;
		public rowClick: Event<RowClickedEventArgs>;
		public rowDblClick: Event<RowClickedEventArgs>;
		public innerRowClick: Event<InnerRowClickEventArgs>;
		public buttonClick: Event<ListButtonEventArgs>;
		public moreDataNeeded: Event<EventArgs>;
		public resized: Event<ResizeEventArgs>;
		public rowInserted: Resco.Event<RowInsertedEventArgs>;
		public listScroll: Event<ListScrolledEventArgs>;
		public delayLoadCompleted: Event<DelayLoadEventArgs>;
		public selectedIndexChanged: Event<SelectedIndexChangedEventArgs>;

		public bounds: Resco.Rectangle;

		private m_minHeight: number;
		public set minHeigth(value: number) {
			if (this.m_minHeight !== value) {
				this.m_minHeight = value;
				this._setMinHeight();
			}
		}
		public get minHeigth(): number {
			return this.m_minHeight;
		}

		private m_perfectScrollbar: PerfectScrollbar;
		private m_useExternalScrollbar: boolean;
		private m_dataSource: Resco.IEnumerable<any>;
		private m_internalData: Array<any>;
		//private m_contentHeight: number;
		private m_contentWidth: number;
		private m_columnWidth: number;
		private m_bHasHorizontalScrollbar: KnockoutObservable<boolean>;
		private m_domRoot: JQuery;
		private m_domListRows: JQuery;
		private m_domFilter: JQuery;
		private m_domSearchInput: JQuery;
		private m_selectedRow: Row;
		private m_selectedIndex: number;
		private m_dontRaiseFilterChanged: boolean;
		private m_filterText: string;
		private m_handleTouch: boolean;
		private m_bLoadingAreaAttached: boolean;
		private $loadingArea: JQuery;
		private $loadingIndicator: JQuery;
		private $noDataText: JQuery;

		get htmlRoot(): JQuery {
			return this.m_domRoot ? this.m_domRoot : null;
		}

		get selectedIndex(): number {
			return this.m_selectedIndex;
		}

		private m_bIsSearchBoxVisible: boolean;
		get isSearchBoxVisible(): boolean {
			if (this.m_bIsSearchBoxVisible === undefined) {
				return this.isFilterVisible() && this.orientation == ListOrientation.Vertical;
			}
			return this.m_bIsSearchBoxVisible;
		}
		set isSearchBoxVisible(value: boolean) {
			this.m_bIsSearchBoxVisible = value;
		}

		set selectedIndex(index: number) {
			if (index >= this.rows.length) {
				this._loadData(this._toIndexPredicate, index);
			}
			let oldIndex = this.m_selectedIndex;
			this.m_selectedIndex = index;
			if (this.m_selectedIndex < this.rows.length) {
				this._selectRow(index < 0 ? null : this.rows[index]);
			}
			if (this.selectedIndexChanged) {
				this.selectedIndexChanged.raise(new SelectedIndexChangedEventArgs(index, oldIndex), this);
			}
		}

		get dataSource(): Resco.IEnumerable<any> {
			return this.m_dataSource;
		}

		set dataSource(ds: Resco.IEnumerable<any>) {
			if (ds != this.m_dataSource) {
				this.reset();

				if (this.m_dataSource != null) {
					this._removeHandlers();
				}
				this.m_dataSource = ds;
				this._addHandlers();

				this._loadData(this._sizePredicate, this.delayLoadBuffer);
			}
		}

		private _addHandlers(): void {
			var ds = this.m_dataSource;
			// unable to check if ds is instanceof interface => check if it is instance of all classes, that implemets it
			if (Resco.isINotifyListChanged(ds)) {
				(<Resco.INotifyListChanged<any>>(<any>ds)).listChanged.add(this, this._dataSourceListChanged, true);
			}
			if (Resco.isIAsyncEnumerable(ds)) {
				var asyncds = <Resco.IAsyncEnumerable<any>>ds;
				asyncds.canMoveNext.add(this, this._dataSourceCanMoveNext);
				asyncds.queryCompleted.add(this, this._dataSourceQueryCompleted);
			}
		}

		private _removeHandlers(): void {
			var ds = this.m_dataSource;
			// unable to check if ds is instanceof interface => check if it is instance of all classes, that implemets it
			if (Resco.isINotifyListChanged(ds)) {
				(<Resco.INotifyListChanged<any>>(<any>ds)).listChanged.remove(this, this._dataSourceListChanged);
			}
			if (Resco.isIAsyncEnumerable(ds)) {
				var asyncds = <Resco.IAsyncEnumerable<any>>ds;
				asyncds.canMoveNext.remove(this, this._dataSourceCanMoveNext);
				asyncds.queryCompleted.remove(this, this._dataSourceQueryCompleted);
			}
		}

		private _dataSourceCanMoveNext(sender: any, args: Resco.EventArgs) {
			//if (this.m_enumerator.moveNext()) {//this.m_enumerator.current) {
			//    this._addRow(this.m_enumerator.current, this.rows.length);
			//}
			// request next item
			this._loadData(this._sizePredicate, this.delayLoadBuffer);
		}

		private _dataSourceQueryCompleted(sender: any, args: Resco.EventArgs) {
			this.loadComplete(true);
		}

		private _dataSourceListChanged(sender: any, e: Resco.ListChangedEventArgs) {
			if (e.listChangedType == ListChangedType.Reset) {
				this.reset();
				this._loadData(this._sizePredicate, this.delayLoadBuffer);
			}
			else if (e.listChangedType == ListChangedType.ItemDeleted) {
				if (this.m_domListRows && e.oldIndex < this.rows.length) {
					this._removeRow(e.oldIndex);
					this._loadData(this._sizePredicate, this.delayLoadBuffer);    // always have more items than the Height of content area, so it is possible to scroll if necessary
				}
			}
			else if (e.listChangedType == ListChangedType.ItemAdded) {
				if (this.m_domListRows && e.newIndex <= this.rows.length && this.m_dataSource) {
					var row = this._addRow(e.item, e.newIndex);
					if (this.m_enumerator) {
						this.m_enumerator.moveNext();
					}
				}
			}
			if (this._verticalPredicate(null)) {
				this.moreDataNeeded.raise(EventArgs.Empty, this);
			}
		}

		private m_enumerator: Resco.IEnumerator<any>;

		private _addRow(data: any, index: number): Row {
			var row = new Row(data);

			// create and append DOM elements representing curent row
			this._updateTemplateIndexes(row);

			// add row to collection of rows
			this.rows.splice(index, 0, row);

			// if selected index is set and equal to this rows and we added this row to the end of the list index select that row, otherwise move the selected index
			if (this.selectedIndex >= 0) {
				if (this.selectedIndex == index && this.selectedIndex == this.rows.length - 1) {
					this._selectRow(row);
				}
				else if (this.selectedIndex >= index) {
					this.m_selectedIndex++;
				}
			}   
			this._insertRowToDOM(row, index);

			if (this.orientation == ListOrientation.Vertical) {
				this._updateContentHeight(this._getRowHeight(row));
			}
			else {
				// find column for new row
				var prevRow = index > 0 ? this.rows[index - 1] : null;
				var column = prevRow ? prevRow.column : 0;
				this._updateColumns(row.column);
			}
			// if templateIndex of the row changes, update the DOM (change template)
			var subscription = row.activeTemplateIndex.subscribe((value) => {
				this._updateTemplate(row);
			});

			// store subscription to index changed handler, so it can be disposed, when te row is removed from the list
			this.rowsActiveTemplateIndexSubs.splice(index, 0, subscription);
			return row;
		}

		private _removeRow(index: number) {
			// remove row from DOM
			var row = this.rows[index];
			row.$root.detach();
			row.$root = null;

			// unsubscribe
			var subscription = this.rowsActiveTemplateIndexSubs[index];
			subscription.dispose();

			// remove from data
			this.rows.splice(index, 1);
			this.rowsActiveTemplateIndexSubs.splice(index, 1);

			if (this.selectedIndex == index) {
				this.selectedIndex = -1;
			}
			else if (this.selectedIndex > index) {
				this.m_selectedIndex--;
			} 

			// update rows
			if (this.orientation == ListOrientation.Vertical) {
				this._updateContentHeight(-this._getRowHeight(row));
			}
			else {
				// find column for new row
				this._updateColumns(row.column - 1);
			}

			if (Resco.isINotifyPropertyChanged(row.data)) {
				(<Resco.INotifyPropertyChanged>row.data).propertyChanged.remove(this, this._onRowPropertyChanged);
			}
		}

		public loadUntilEnd() {
			this._loadData((data) => true, null);
		}

		private _loadData(predicate: (any) => boolean, context?: any): boolean {
			var result = false;
			// TODO: why is the check for empty rows collection here?
			if (this.rows.length == 0) {
				this.loadComplete(false);
			}
			else if (this.loadComplete()) {
				return result;
			}

			if (this.dataSource) {
				if (!this.m_enumerator) {
					this.m_enumerator = this.dataSource.getEnumerator();
				}
				result = true;

				let raiseDelayLoadComplete = false;
				let oldRowsLength = this.rows.length;
				var predicateResult = predicate.call(this, context);
				while (predicateResult) {
					if (this.m_enumerator.moveNext()) {
						if (this.m_enumerator.current) {
							this._addRow(this.m_enumerator.current, this.rows.length);
							raiseDelayLoadComplete = true;
						}
						else {
							result = true;  // there is another item, but it is not available at this moment. wait for MoveNextCompleted event and then continue loading 
							break;
						}
					}
					else {
						result = false;
						raiseDelayLoadComplete = true;
						this.loadComplete(true);
						break;
					}
					predicateResult = predicate.call(this, context);
				}
				// remove the laoding indicator and wait while user scrolls the list
				// loading is not finished yet, but it is delayed, so remove the indicator
				let hasMoreData = result && !predicateResult;
				if (hasMoreData) {
					this._showLoading(false);
				}
				if (raiseDelayLoadComplete) {
					this.delayLoadCompleted.raise(new DelayLoadEventArgs(!hasMoreData, oldRowsLength, this.rows.length), this);
				}
			}
			else {
				this.loadComplete(true);
			}
			return result;
		}

		private _setMinHeight() {
			if (this.m_minHeight > 0) {
				if (this.m_domRoot)
					this.m_domRoot.css("minHeight", this.m_minHeight + "px");

				if (this.$loadingArea)
					this.$loadingArea.css("minHeight", this.m_minHeight + "px");
			}
		}

		//private _isDesktop(): boolean {
		//	var check = true;
		//	(function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = false; })(navigator.userAgent || navigator.vendor || (<any>window).opera);
		//	return check;
		//}

		get useExternalScrollbar(): boolean {
			return this.m_useExternalScrollbar;
		}

		set useExternalScrollbar(value: boolean) {
			this.m_useExternalScrollbar = value;
		}

		// activate perfect scrollbar + set z-index to 1
		private _activatePerfectScrollbar(): void {
			if (this.m_domListRows && (this.m_domListRows.length > 0)) {
				this.m_perfectScrollbar = new PerfectScrollbar(this.m_domListRows[0], { suppressScrollX: (this.orientation == ListOrientation.Vertical) });
				$(".ps__rail-y", this.m_domListRows).css("zIndex", 1);
				$(".ps__rail-x", this.m_domListRows).css("zIndex", 1);
			}
		}

		private _deactivatePerfectScrollbar(): void {
			if (this.m_perfectScrollbar) {
				this.m_perfectScrollbar.destroy();
				this.m_perfectScrollbar = undefined;
			}
		}

		public onAppended(domRoot: HTMLElement) {
			this.m_domRoot = $(domRoot);
			this.m_domListRows = $(".listRows", domRoot);
			this.m_domFilter = $(".searchBoxContainer", domRoot);
			this.m_domSearchInput = $(".searchBox", domRoot);
			this._setMinHeight();
			if (this.useExternalScrollbar) {
				this._activatePerfectScrollbar();
			}
			this._showHideView(this.isSelected());
		}

		// for appending list to html document without using the Knockout library
		public create(domParent?: HTMLElement) {
			var htmlDefinition = "<div class=\"view advancedList\"><div class=\"listRows\" />";
			if (this.isSearchBoxVisible) {
				htmlDefinition += "<div class=\"searchBoxContainer\"><input class=\"searchBox\" type=\"text\" placeholder=\"" + this.emptyFilterText() + "\" style=\"background-color: " + Resco.UI.AdvancedList.SearchBarColor + ", color: " + Resco.UI.AdvancedList.SearchBarTextColor + "\" /></div>";
			}
			htmlDefinition += "</div>";

			var jqAdvancedList = $(htmlDefinition);
			if (domParent) {
				jqAdvancedList.appendTo(domParent);
			}
			this.onAppended(jqAdvancedList[0]);

			this.m_domListRows.scroll(eventObject => this.listScrolled(eventObject, eventObject));

			this.m_domSearchInput.on('change keyup paste', element => {
				var value = this.m_domSearchInput.val();
				if (this.m_filterText !== value) {
					this.m_filterText = value;
					this.filterChanged.raise(new FilterChangedEventArgs(FilterChangeKind.TextChanging));
				}
			});
		}

		public onResize(size: Resco.Size) {
			this.bounds.width(size.width());
			this.bounds.height(size.height());
			this._update();
		}

		private _update() {
			var filterSize = this.isSearchBoxVisible ? 45 : 0;
			var heightSpecified = this.bounds.height() > 0;
			var height = this.bounds.height() + (this.m_bHasHorizontalScrollbar() ? 17 : 0);
			if (this.m_domRoot) {
				this.m_domRoot.css({ height: heightSpecified ? (height + 'px') : '100%' });
				if (this.bounds.width() >= 0) {
					this.m_domRoot.css({ width: this.bounds.width() + 'px' });
				}
			}
			if (this.m_domListRows) {
				this.m_domListRows.css({ top: filterSize + 'px', height: heightSpecified ? ((height - filterSize) + 'px') : 'calc(100% - ' + filterSize + 'px)' });
				//this.resized.raise(new Resco.ResizeEventArgs(-1, height, -1, height), this);
				if (this.isFilterVisible()) {
					this.m_domFilter.css({ height: filterSize + 'px', visibility: filterSize > 0 ? 'visible' : 'hidden' });
				}

				if (this.useExternalScrollbar) {
					// Force PerfectScrollbar to recalculate scrollbar position when AdvancedList was appended to DOM tree.
					this._deactivatePerfectScrollbar();
					this._activatePerfectScrollbar();
				}
			}
			if (this.$loadingArea) {
				this.$loadingArea.css({ top: filterSize + 'px', height: heightSpecified ? ((height - filterSize) + 'px') : 'calc(100% - ' + filterSize + 'px)' });
			}
			if (this.orientation == ListOrientation.Horizontal) {
				this._updateColumns(0);
			}
			this._loadData(this._sizePredicate, this.delayLoadBuffer);
			this._checkNeedScrollbar();
		}

		public getDesiredSize(): Resco.Size {
			if (this.m_domRoot) {
				var $dr = $(this.m_domRoot);
				return new Resco.Size($dr.width(), $dr.height());
			}
			return null;
		}

		public reset(bKeepSelection?: boolean) {
			while (this.rows.length > 0) {
				this._removeRow(0);
			}

			if (!bKeepSelection) {
				this.m_selectedIndex = -1;
			}
			this.m_enumerator = null;
			this.m_contentWidth = 0;
			//this.m_contentHeight = 0;
			this.m_bHasHorizontalScrollbar(false);
			this.m_columnWidth = 0;
			this.m_actualBufferSize = undefined;
			this.m_columnDefinitions.splice(0);
			this._toggleLoadingAreaVisible(false);
			if (!this.loadComplete()) {
				this._showLoading(true);
			}
			else {
				this.loadComplete(false);
			}
		}

		public updateList() {
			var asbl = AsyncBindingList.as(this.m_enumerator);
			if (asbl) {
				asbl.update();
			}
			else {
				this.reset(true);
			}
			this._loadData(this._sizePredicate, this.delayLoadBuffer);
		}

		public addTemplate(template: RowTemplate, cloneIndex: number): number {
			if (cloneIndex >= 0 && cloneIndex < this.templates.length) {
				template = this.templates[cloneIndex].clone();
			}
			this.templates.push(template);
			return this.templates.length - 1;
		}

		public clearTemplates() {
			this.templates.splice(0);
		}

		private _showHideView(show: boolean) {
			if (this.m_domRoot) {
				if (show) {
					//$(this.m_domRoot).css("height", "100%");
					this.m_domRoot.removeClass("hidden");
					this._loadData(this._sizePredicate, this.delayLoadBuffer);
				}
				else {
					this.m_domRoot.addClass("hidden");
				}
			}
		}

		private _updateContentHeight(value: number) {
			//this.m_contentHeight += value;
			this._checkNeedScrollbar();
		}

		private _updateContentWidth(value: number) {
			this.m_contentWidth += value;
			this._checkNeedScrollbar();
		}

		private _checkNeedScrollbar() {
			var w = 0;
			if (this.bounds.width() >= 0) {
				w = this.bounds.width();
			}
			else if (this.m_domRoot) {
				w = this.m_domRoot.innerWidth();
			}
			this.m_bHasHorizontalScrollbar(this.m_contentWidth + this.m_columnWidth > w);
		}

		private _updateTemplateIndexes(row: Row) {
			// if there is a templateSelector defined, get tempalte indexes for row from that selector
			if (this.templateSelector) {
				var templateIndex = this.templateSelector.call(this.templateSelectorOwner ? this.templateSelectorOwner : this, row.data, false);
				if (templateIndex < 0 || templateIndex >= this.templates.length) {
					templateIndex = 0;
				}
				row.templateIndex(templateIndex);
				var templateIndex = this.templateSelector.call(this.templateSelectorOwner ? this.templateSelectorOwner : this, row.data, true);
				if (templateIndex < 0 || templateIndex >= this.templates.length) {
					templateIndex = 0;
				}
				row.selectedTemplateIndex(templateIndex);
			}
			// otherwise use template indexes of the list
			else {  
				row.templateIndex(this.templateIndex());

				var selectedTemplateIndex = this.selectedTemplateIndex();
				if (selectedTemplateIndex >= this.templates.length) {
					selectedTemplateIndex = this.templates.length - 1;
				}
				row.selectedTemplateIndex(selectedTemplateIndex);
			}
		}

		private _rowClick(row: Row) {
			var index = this.rows.indexOf(row);
			if (this.autoSelect) {
				this._selectRow(row);
				this.m_selectedIndex = index;
			}
			this.rowClick.raise(new RowClickedEventArgs(index, row.data), this);
			this._rowDblClick(index, row);
		}

		private _timeoutID = null;

		private _rowDblClick(index: number, row: Row): void {
			if (!this._timeoutID) {
				this._timeoutID = setTimeout(() => {
					this._timeoutID = null;
				}, 300);
			}
			else {
				clearTimeout(this._timeoutID);
				this._timeoutID = null;
				this.rowDblClick.raise(new RowClickedEventArgs(index, row.data), this);
			}
		}

		private _innerRowClick(rowIndex: number, innerRowIndex: number) {
			var e = new InnerRowClickEventArgs();
			e.innerRow = innerRowIndex;
			e.row = rowIndex;
			this.innerRowClick.raise(e, this);
		}

		private _cellClick(row: Row, cellIndex: number): boolean {
			var rowIndex = this.rows.indexOf(row);
			var args = new CellClickEventArgs(row, cellIndex, rowIndex, this.templates[row.activeTemplateIndex()].cellTemplates[cellIndex].dataMember);
			this.cellClick.raise(args, this);
			return args.cancelRowSelect;
		}

		private _buttonClick(row: Row, name: string) {
			this.buttonClick.raise(new ListButtonEventArgs(this.rows.indexOf(row), name), this);
		}

		private _selectRow(row: Row) {
			if (this.m_selectedRow != null) {
				this.m_selectedRow.selected(false);
			}
			if (row) {
				row.selected(true);
			}
			this.m_selectedRow = row;
		}

		private _getRowHeight(row: Row): number {
			var templateIndex = row.activeTemplateIndex();
			if (templateIndex >= 0 && templateIndex < this.templates.length) {
				return this.fixedTemplateHeight ? this.fixedTemplateHeight : this.templates[templateIndex].size.height();
			}
			return 0;
		}


		public imageLoader: (row: Resco.UI.Row, imageData: string, isImageQuery: boolean, cellElement: HTMLElement) => string;
		public imageLoaderOwner: any;

		private _getCellTextValue(item: any, cellTemplate: CellTemplate): string {
			var result = "";

			if (cellTemplate.constant) {
				result = cellTemplate.dataMember;
			}
			else if (Resco.UI.isIListBindingItem(item)) {
				var bindingItem = <IListBindingItem>item;
				result = bindingItem.getTextValue(cellTemplate.dataMember, true);
			}
			else {
				result = item[cellTemplate.dataMember];
			}

			var style = cellTemplate.style;
			if (style && style.formatString) {
				result = Resco.formatString(style.formatString, [result]);
			}

			return result;
		}

		private _loadImage(row: Row, cellTemplate: CellTemplate, cellElement: HTMLElement): string {
			if (this.imageLoader) {
				var style = cellTemplate.style;
				var isImageQuery = false;
				if (style.imageQuery) {
					isImageQuery = true;
				}
				var imageValue = { imageData: "", placeHolder: "" };
				if (!cellTemplate.constant && Resco.UI.isIListBindingItem(row.data)) {
					var bindingItem = <IListBindingItem>row.data;
					imageValue = bindingItem.getImageValue(cellTemplate.dataMember);
					if (style && style.formatString) {
						imageValue.imageData = Resco.formatString(style.formatString, [imageValue.imageData]);
					}
				}
				else if (cellTemplate.constant) {
					imageValue.imageData = cellTemplate.dataMember;
				}
				var imageData = isImageQuery ? style.imageQuery : imageValue.imageData;
				return this.imageLoader.call(this.imageLoaderOwner ? this.imageLoaderOwner : this, row, imageData, isImageQuery, cellElement, imageValue.placeHolder);
			}
			return "";
		}

		public updateRowTemplate(index: number, row?: Row) {
			if (!row) {
				row = index >= 0 && index < this.rows.length ? this.rows[index] : null;
			}

			if (row) {
				this._updateTemplateIndexes(row);
				this._updateTemplate(row);
			}
		}

		private _updateTemplate(row: Row) {
			var index = this.rows.indexOf(row);

			// only do this if row was created and added to list of rows
			if (index >= 0) {
				// remove old template
				row.$root.detach();

				// create and append new template
				this._insertRowToDOM(row, index, RowInsertedType.updated);

				if (this.orientation == ListOrientation.Vertical) {
					// TODONOW: update contentHeight
					//this._updateContentHeight(this._getRowHeight(row));
				}
				else {
					this._updateColumns(row.column - 1);
				}
			}
		}

		private _insertRowToDOM(row: Row, index: number, insertType: RowInsertedType = RowInsertedType.created) {
			var $row = this._createRow(row, index);
			// clear loading message, if we are inserting first row
			this._toggleLoadingAreaVisible(false);
			// if there is more than one row ater this row, insert new template for this row before the next row in list
			if (this.rows.length > index + 1) {
				// the row on the 'index' is now the next row in list (we detached current row template, now we are inserting it back)
				$row.insertBefore(this.m_domListRows.children(".rowsContainer").slice(index, index + 1));
			}
			// add just this one row otherwise
			else {
				this.m_domListRows.append($row);
			}
			if (this.useExternalScrollbar) {
				if (this.m_perfectScrollbar) {
					this.m_perfectScrollbar.update();
				}
			}
			this.rowInserted.raise(new RowInsertedEventArgs(row, insertType), this);
		}

		private m_columnDefinitions: Resco.Rectangle[]; // Width = column Width, Height = Height of the cells in that column

		private _updateColumns(column: number) {
			if (column < 0) {
				column = 0;
			}
			var height = 0;
			var oldCol = column;
			var affectedRows = this.rows.filter(r => r.column >= column);
			var boundsHeight = 0;
			if (this.bounds.height() >= 0) {
				boundsHeight = this.bounds.height();
			}
			else if (this.m_domRoot) {
				boundsHeight = this.m_domRoot.innerHeight();
			}

			for (var i = 0; i < affectedRows.length; i++) {
				var row = affectedRows[i];
				var template = this._getRowTemplate(row);
				var templateHeight = this.fixedTemplateHeight ? this.fixedTemplateHeight : template.size.height();

				if (height + templateHeight > boundsHeight) {
					column += 1;
					height = 0;
				}
				row.$root.css({ top: height + "px" });
				row.column = column;
				height += templateHeight;
			}

			if (this.rows.length > 0) {
				if (this.rows[this.rows.length - 1].column >= this.m_columnDefinitions.length) {
					this.m_columnDefinitions.push(new Resco.Rectangle(0, 0, 0, 0));
				}
				else {
					this.m_columnDefinitions.splice(this.rows[this.rows.length - 1].column + 1);
				}
			}

			// update column Widths and left positions
			for (var i = oldCol; i < this.m_columnDefinitions.length; i++) {
				var colDef = this.m_columnDefinitions[i];
				var colRows = this.rows.filter(row => row.column == i);
				var maxWidth = 0;

				colRows.forEach((row) => {
					var template = this._getRowTemplate(row);
					if (template.size.width() > maxWidth) {
						maxWidth = template.size.width();
					}    
				}, this);

				colDef.left(i > 0 ? this.m_columnDefinitions[i - 1].left() + this.m_columnDefinitions[i - 1].width() : 0);
				colDef.width(maxWidth);
				colRows.forEach(r => r.$root.css({ left: colDef.left() + "px", width: colDef.width() }));
			}
			if (this.useExternalScrollbar) {
				if (this.m_perfectScrollbar) {
					this.m_perfectScrollbar.update();
				}
			}
		}

		private _getRowTemplate(row: Row): RowTemplate {
			return this.templates[row.activeTemplateIndex()];
		}

		private _createRow(row: Row, index: number): JQuery {
			var template = this.templates[row.activeTemplateIndex()];

			var $root = $("<div />").addClass("rowsContainer alHasSeparator").css("borderBottomColor", AdvancedList.SeparatorColor);

			// set the flex properties
			if (this.stretchRows) {
				$root.css("flex", "1 1 100%");
			}
			else {
				$root.css("flex", "0 1 " + template.size.width() + "px");
			}

			if (template instanceof ListRowTemplate) {
				var $row = this._createListRowDOMObject(row, <ListRowTemplate>template);
			}
			else {
				var $row = this._createRowDOMObject(row, template); 
			}

			$root.append($row);
			var h = this.fixedTemplateHeight ? this.fixedTemplateHeight : template.size.height();
			$root.height(h + template.margin.top() + template.margin.height());

			// absolute positioning
			if (this.orientation == ListOrientation.Horizontal) {
				$root.css({ position: "absolute" }).addClass("horizontal");
			}

			$(".alRow", $root).not(".alListRow, .alInnerRow").click((event: JQueryEventObject) => {
				if (!this.m_handleTouch) {
					this._rowClick(row);
				}
			});
			$(".alListRow .alInnerRow", $root).click((event: JQueryEventObject) => {
				if (!this.m_handleTouch) {
					var listRow = $(event.target).closest(".alListRow");
					var innerRow = $(event.target).closest(".alInnerRow");
					var innerIndex = listRow.children().index(innerRow);
					this._innerRowClick(this.rows.indexOf(row), innerIndex);
				}
			});
			// TODO: optimize this. let advancedlist handle this in single handler (instead of handling it for each row, touch end can be turned of only if touchstart was fired, etc.)
			$(".alRow", $root).on({
				"touchstart": (event) => {
					var targetedALRow = $(event.currentTarget);

					targetedALRow.on({
						"touchend": (event) => {
							//var x = event.originalEvent.changedTouches[0].pageX - window.pageXOffset;
							//var y = event.originalEvent.changedTouches[0].pageY - window.pageYOffset;
							//var target = document.elementFromPoint(x, y);

							//if (!this.m_scrolled && ($(target).is(event.currentTarget) || $(target).parents().is(event.currentTarget))) {
								this._rowClick(row);
								this.m_handleTouch = true;
								targetedALRow.off("touchmove");
								targetedALRow.off("touchend");
							//}
						}
					});

					targetedALRow.on({
						"touchmove": (event) => {
							targetedALRow.off("touchend");
							targetedALRow.off("touchmove");
						}
					});
				}
			});

			//$(".alRow", $root).on({
			//	"touchend": (event) => {
			//		var x = event.originalEvent.changedTouches[0].pageX - window.pageXOffset;
			//		var y = event.originalEvent.changedTouches[0].pageY - window.pageYOffset;
			//		var target = document.elementFromPoint(x, y);

   //                 if (!this.m_scrolled && ($(target).is(event.currentTarget) || $(target).parents().is(event.currentTarget))) {
   //                     this._rowClick(row);
   //                     this.m_handleTouch = true;
   //                 }
   //             }
   //         });
			$(".alCell", $root).not(".alListRow .alCell").click((event: JQueryEventObject) => {
				var cell = $(event.target).closest(".alCell");

				if (this._cellClick(row, cell.index())) {
					// cancel rowclick event
					event.stopPropagation();
				}
			});
			$(".buttonCell", $root).click((event: JQueryEventObject) => {
				this._buttonClick(row, <any>$(event.target).data("buttonName"))
			});

			if (Resco.isINotifyPropertyChanged(row.data)) {
				(<Resco.INotifyPropertyChanged>row.data).propertyChanged.add(this, this._onRowPropertyChanged, true);
			}

			row.$root = $root;
			return $root;
		}

		private _createRowDOMObject(row: Row, template: RowTemplate, bForceWidth?: boolean): JQuery {
			var h = this.fixedTemplateHeight ? this.fixedTemplateHeight : template.size.height();

			var $row = $("<div />").addClass("alRow").css("height", h + "px");

			if (this.orientation == ListOrientation.Horizontal || bForceWidth) {
				$row.css({ width: template.size.width() + "px" });
			}
			if (template.backgroundColor) {
				$row.css({ background: template.backgroundColor });
			}
			$row.css({ marginLeft: template.margin.left() + "px", marginTop: template.margin.top() + "px", marginRight: template.margin.width() + "px", marginBottom: template.margin.height() + "px"});

			if (template.cellTemplates && template.cellTemplates.length > 0) {
				template.cellTemplates.forEach(cellTemplate => $row.append(this._createCellDOMObject(row, template, cellTemplate)));
			}
			else if (template.htmlContent) {
				var rowHtml = $(template.htmlContent);

				$("*", rowHtml).not("img").each((index, element) => {
					var prop = $(element).data("bind");
					if (row.data && prop && row.data[prop]) {
						$(element).text(row.data[prop]);
					}
				});
				$("img", rowHtml).each((index, element) => {
					var prop = $(element).data("bind");
					if (row.data && prop) {
						var imgData = row.data[prop];
						if (!imgData) {
							imgData = $(element).data("placeholder");
						}
						if (imgData) {
							$(element).attr("src", imgData);
						}
					}
				});
				$row.append(rowHtml);
			}
			return $row;
		}

		private _createListRowDOMObject(row: Row, template: ListRowTemplate): JQuery {
			var templateHeight = this.fixedTemplateHeight ? this.fixedTemplateHeight : template.size.height();
			var $root = $("<div />").addClass("alRow alListRow").css("height", templateHeight + "px");
			var innerTemplate = this.templates[template.templateIndex];
			var left = 0;

			var list = row.data[template.dataMember];
			if (list) {
				list.forEach((item, index) => {
					var innerRow = new Row(item);
					var $innerRowDOM = this._createRowDOMObject(innerRow, innerTemplate, true);
					$innerRowDOM.addClass("alInnerRow");

					$innerRowDOM.css({ left: left + "px", position: "absolute" });
					left += innerTemplate.size.width();
					$root.append($innerRowDOM);
				}, this);
			}
			$root.css({ marginLeft: template.margin.left() + "px", marginTop: template.margin.top() + "px", marginRight: template.margin.width() + "px", marginBotton: template.margin.height() + "px" });

			return $root;
		}


		private _createCellDOMObject(row: Row, template: RowTemplate, cellTemplate: CellTemplate): JQuery {
			var $cell = $("<div />").addClass("alCell");

			if (cellTemplate.kind == ListCellKind.Button) {
				$cell.addClass("buttonCell");
			}

			// Create and set bounds of the cell
			var bSkipWidth = false;
			var bSkipHeight = false;

			var anchLeft = (cellTemplate.anchor & Resco.ListCellAnchor.Left) > 0;
			var anchRight = (cellTemplate.anchor & Resco.ListCellAnchor.Right) > 0;
			var anchTop = (cellTemplate.anchor & Resco.ListCellAnchor.Top) > 0;
			var anchBottom = (cellTemplate.anchor & Resco.ListCellAnchor.Bottom) > 0;

			if (anchLeft || !anchRight) {
				$cell.css({ left: cellTemplate.position.left() + "px" });
			}
			if (anchTop || !anchBottom) {
				$cell.css({ top: cellTemplate.position.top() + "px" });
			}
			if (anchRight) {
				var right = template.size.width() - (cellTemplate.position.left() + cellTemplate.size.width());
				$cell.css({ right: right + "px" });
				if (anchLeft) {
					bSkipWidth = true;
				}
			}
			if (anchBottom) {
				var h = 0;
				if (this.bounds.height() >= 0) {
					h = this.bounds.height();
				}
				else if (this.m_domRoot) {
					h = this.m_domRoot.innerHeight();
				}
				
				var templateHeight = this.orientation == ListOrientation.Vertical ? (this.fixedTemplateHeight ? this.fixedTemplateHeight : template.size.height()) : Math.floor(h / this.linesCount);
				var bottom = templateHeight - (cellTemplate.position.top() + cellTemplate.size.height());
				$cell.css({ bottom: bottom + "px" });
				if (anchTop) {
					bSkipHeight = true;
				}
			}

			if (!bSkipWidth) {
				$cell.css({ width: cellTemplate.size.width() + "px" });
			}
			if (!bSkipHeight) {
				$cell.css({ height: cellTemplate.size.height() + "px" });
			}
			// End create bounds

			// TextCell
			if (cellTemplate.kind == ListCellKind.Text) {
				// Set style
				var style = cellTemplate.style;
				if (style) {
					if (style.fontSize) {
						$cell.css({ fontSize: style.fontSize + "px" });
					}
					if (style.fontWeight === 1) {
						$cell.css({ fontWeight: "bold" });
					}
					if (style.foreColor) {
						$cell.css({ color: style.foreColor });
					}
					if (style.backColor) {
						$cell.css({ backgroundColor: style.backColor });
					}
					if (style.horizontalAlignment == ContentAlignment.Far) {
						$cell.css({ textAlign: "right" });
					}
					else if (style.horizontalAlignment == ContentAlignment.Center) {
						$cell.css({ textAlign: "center" });
					}
					if (style.verticalAlignment == ContentAlignment.Far) {
						$cell.css({ paddingTop: (cellTemplate.size.height() - style.fontSize) + "px" });
					}
					else if (style.verticalAlignment == ContentAlignment.Center) {
						$cell.css({ paddingTop: ((cellTemplate.size.height() - style.fontSize) / 2) + "px" });
					}
				}
				// Set Content
				$cell.text(this._getCellTextValue(row.data, cellTemplate));
			}
			// ImageCell
			else if (cellTemplate.kind == ListCellKind.Image) {
				var $img = $("<img />").addClass("imageCell").appendTo($cell);
				var imgData = this._loadImage(row, cellTemplate, <HTMLElement>$cell[0].children[0]);
				if (imgData) {
					$img.attr("src", imgData);
				}
				if (cellTemplate.style.backColor) {
					$img.css({ backgroundColor: cellTemplate.style.backColor });
				}
			}
			// ButtonCell
			else if (cellTemplate.kind == ListCellKind.Button) {
				var col = AdvancedList.ListForeColor;
				if (cellTemplate.style/* && (i % 2) == 0*/) {
					col = style.foreColor;// ? style.foreColor : "black";
				}
				$cell.css({ border: "solid 2px " + col, color: col }).data("buttonName", cellTemplate.name).text(cellTemplate.dataMember);
			}
			return $cell;
		}

		public getItemValue(index: number): any {
			var rows = this.rows;

			if (index >= rows.length) {
				this._loadData(this._toIndexPredicate, index);
			}
			if (index >= rows.length) {
				return null;
			}
			return index >= 0 ? rows[index].data : null;
		}

		private _onRowPropertyChanged(sender: any, e: PropertyChangedEventArgs) {
			var affectedRows = this.rows.filter(r => r.data === sender);        // note: usually and in most cvases this is exactly one row

			affectedRows.forEach((row) => {
				/*var template = this.templates[row.activeTemplateIndex()];
				template.cellTemplates.forEach((cellTemplate, index) => {
					if (cellTemplate.dataMember === e.propertyName) {
						var $cell = $($(".alCell", row.$root)[index]);
						if (cellTemplate.kind === ListCellKind.Text) {
							$cell.text(this._getCellTextValue(row.data, cellTemplate));
						}
						else if (cellTemplate.kind === ListCellKind.Image) {
							$cell.attr("src", this._loadImage(row, cellTemplate, <HTMLElement>$cell[0].children[0]));
						}
					}
				}, this);*/
				this.updateRowTemplate(-1, row);
			}, this);
		}

		private m_lastScroll: number = 0;
		public listScrolled(data, event) {

			var st: number;
			if (this.orientation == ListOrientation.Vertical)
				st = event.currentTarget.scrollTop;
			else
				st = event.currentTarget.scrollLeft;
			if (this.m_lastScroll !== st) {
				this._toggleFilterVisible(this.m_lastScroll < st);
				this.moreDataNeeded.raise(EventArgs.Empty, this);
				this._loadData(this._sizePredicate, this.delayLoadBuffer);
				this.m_lastScroll = st;
			}
			this.listScroll.raise(new ListScrolledEventArgs(this.m_lastScroll), this);
			return true;
		}

		public getScrollPosition(): number {
			if (this.m_domListRows) {
				if (this.orientation == ListOrientation.Horizontal) {
					return this.m_domListRows.scrollLeft();
				}
				else {
					return this.m_domListRows.scrollTop();
				}
			}

			return null;
		}

		public setScrollPosition(pos: number) {
			if (this.m_domListRows) {
				if (this.orientation == ListOrientation.Horizontal) {
					this.m_domListRows.scrollLeft(pos);
				}
				else {
					this.m_domListRows.scrollTop(pos);
				}
			}
		}

		private m_touchStartPosX: number;
		private m_touchStartPosY: number;
		private m_scrolled: boolean;
		public listTouchStart(data, event) {
			this.m_scrolled = false;
			this.m_touchStartPosY = event.originalEvent.touches[0].clientY;
			this.m_touchStartPosX = event.originalEvent.touches[0].clientY;

			return true;
		}

		public listTouchEnd(data, event) {
			this.m_touchDeltaX = 0;
			this.m_touchDeltaY = 0;
			this.m_touchStartPosX = 0;
			this.m_touchStartPosY = 0;
			return true;
		}

		private m_touchDeltaX: number;
		private m_touchDeltaY: number;
		public listTouchMove(data, event) {
			this.m_touchDeltaX = this.m_touchStartPosX - event.originalEvent.touches[0].clientX;
			this.m_touchDeltaY = this.m_touchStartPosY - event.originalEvent.touches[0].clientY;

			if (!this.m_scrolled && ((this.orientation == ListOrientation.Vertical && Math.abs(this.m_touchDeltaY) > 5) || (this.orientation == ListOrientation.Horizontal && Math.abs(this.m_touchDeltaX) > 5))) {
				this.m_scrolled = true;
			}
			
			this.m_touchStartPosX = event.originalEvent.touches[0].clientX;
			this.m_touchStartPosY = event.originalEvent.touches[0].clientY;

			var allowDown = (this.orientation == ListOrientation.Vertical) && (event.currentTarget.scrollTop > 0);
			var allowUp = (this.orientation == ListOrientation.Vertical) && (event.currentTarget.scrollTop <= event.currentTarget.scrollHeight - event.currentTarget.clientHeight && event.currentTarget.scrollHeight - event.currentTarget.clientHeight > 0);
			var allowLeft = (this.orientation == ListOrientation.Horizontal) && (event.currentTarget.scrollLeft > 0);
			var allowRight = (this.orientation == ListOrientation.Horizontal) && (event.currentTarget.scrollLeft <= event.currentTarget.scrollWidth - event.currentTarget.clientWidth && event.currentTarget.scrollWidth - event.currentTarget.clientWidth > 0);

			if ((this.m_touchDeltaY < 0 && allowDown) || (this.m_touchDeltaY > 0 && allowUp) || (this.m_touchDeltaX < 0 && allowLeft) || (this.m_touchDeltaX > 0 && allowRight)) {
				event.stopPropagation();
			}
			return true;
		}


		//private m_filterOpened: boolean;
		//private m_bScrollDirectionIsDown: boolean;
		private _toggleFilterVisible(bScrollDown: boolean) {
			/*if (this.m_bScrollDirectionIsDown !== bScrollDown && this.isFilterVisible()) {
				this.m_bScrollDirectionIsDown = bScrollDown;

				if (this.m_bScrollDirectionIsDown) {
					this.m_filterOpened = false;
					this.m_domListRows.css({ top: '0px', height: this.bounds.Height() + 'px' });
					//this.m_domListRows.animate({ top: 0, height: this.bounds.Height() }, 350);
					this.m_domFilter.css({ visibility: 'hidden', height: '0px' });
					//this.m_domFilter.animate({ height: 0 }, 500);
				}
				else {
					this.m_filterOpened = true;
					this.m_domListRows.css({ top: '45px', height: (this.bounds.Height() - 45) + 'px' });
					//this.m_domListRows.animate({ top: 45, height: (this.bounds.Height() - 45) }, 350);
					this.m_domFilter.css({ visibility: 'visible', height: '45px' });
					//this.m_domFilter.animate({ height: 45 }, 500);
				}
			}*/
		}

		private _horizontalPredicate(data?: any): boolean {
			var lastTemplateWidth: number = 100;

			if (this.rows && this.rows.length > 0)
				lastTemplateWidth = this.templates[this.rows[this.rows.length - 1].activeTemplateIndex()].size.width();

			if (this.m_domListRows && this.m_domListRows.width() > 0) {
				var box = this.m_domListRows;
				var coef = this.delayLoadCoeficient;
				if (!coef || coef < 1) {
					coef = 1;
				}
				return (box[0].scrollWidth - box.scrollLeft() <= (box[0].clientWidth * coef) + lastTemplateWidth);
			}
			return false;
		}

		private _verticalPredicate(data?: any): boolean {
			var lastTemplateHeight:number = 10;

			if (this.fixedTemplateHeight)
				lastTemplateHeight = this.fixedTemplateHeight;
			else if (this.rows && this.rows.length > 0)
				lastTemplateHeight = this.templates[this.rows[this.rows.length - 1].activeTemplateIndex()].size.height();

			if (this.m_domListRows && this.m_domListRows.height() > 0) {
				var box = this.m_domListRows;
				var coef = this.delayLoadCoeficient;
				if (!coef || coef < 1) {
					coef = 1;
				}
				return (box[0].scrollHeight - box.scrollTop() <= (box[0].clientHeight * coef) + lastTemplateHeight);
			}
			return false;
		}

		private _sizePredicate(data?: any): boolean {
			var result = true;
			if (this.delayLoad) {
				// we have to load at least the minimum amount 
				if (this.m_actualBufferSize !== undefined && this.m_actualBufferSize-- > 0) {
					return true;
				}
				// if we exceeded the minimum amount, or the amount is not set yet, check if we need to load more data
				result = this.orientation === ListOrientation.Vertical ? this._verticalPredicate(data) : this._horizontalPredicate(data);

				// if size predicate returned true, set the minimum limit
				if (result && this.m_actualBufferSize === undefined) {
					// we are returning true, so we need one less item to be loaded next time we enter this predicate
					this.m_actualBufferSize = data - 1;
				}
				else if (!result) {
					// reset the limit counter for now
					this.m_actualBufferSize = undefined;
				}
			}
			// if not delay loading, load all data at once
			return result;
		}

		private m_actualBufferSize: number;
		private _delayLoadBufferPredicate(data?: any): boolean {
			return (this.m_actualBufferSize !== undefined && this.m_actualBufferSize-- > 0);
		}

		private _toIndexPredicate(data?: any): boolean {
			return this.m_domListRows && this.rows.length <= <number>data;
		}

		public setFilterText(text: string, RaiseChangeEvent: boolean) {
			this.m_filterText = text;
			if (this.m_domFilter && this.m_domFilter.length > 0) {
				$(this.m_domFilter[0].children[0]).val(text);
			}

			if (RaiseChangeEvent) {
				this.filterChanged.raise(new FilterChangedEventArgs(FilterChangeKind.TextChanged));
			}
		}

		public enterPressed(): void {
			this.filterChanged.raise(new FilterChangedEventArgs(FilterChangeKind.TextChanged));
		}

		public focusFilter(): void {
			if (this.m_domFilter && this.m_domFilter.length > 0) {
				$(this.m_domFilter[0].children[0]).focus();
			}
		}

		public onGetEmptyListText(): string {
			if (this.getEmptyListText) {
				return this.getEmptyListText.call(this.getEmptyListTextOwner ? this.getEmptyListTextOwner : this, this);
			}
			return "List is Empty";
		}

		public emptyListClicked() {
			if (this.m_filterText.length > 0) {
				this.filterTextObs("");
			}
		}

		private m_loadingIndicatorTimeout: number;
		private m_noDataIndicatorTimeout: number;

		private _showLoading(show: boolean) {
			if (!this.$loadingIndicator) {
				this.$loadingArea = $("<table class=\"emptyListTextTable\"><tr><td>\
		</td></tr></table>");

				if (this.m_minHeight > 0)
					this.$loadingArea.css("minHeight", this.m_minHeight + "px");
				
				this.$loadingIndicator = $("<span class=\"pleaseWaitText\">Loading...</span>"); // TODO: loading image enable by setting: <img src=\"images/loading.gif\" /><br /><span class=\"pleaseWaitText\">Loading...</span>

				this.$noDataText = $("<div class=\"emptyListText\" />");
			}

			if (this.m_domRoot) {
				if (show) {
					// if loading takes small amount of time, do not show the indicator (prevent flashing of the loading image and data)
					if (!this.m_loadingIndicatorTimeout) {
						this.m_loadingIndicatorTimeout = window.setTimeout(() => {
							var $td = $("td", this.$loadingArea);
							$td.children().detach();
							$td.append(this.$loadingIndicator);
							this._toggleLoadingAreaVisible(true);
						}, 150);
						window.clearTimeout(this.m_noDataIndicatorTimeout);
						this.m_noDataIndicatorTimeout = 0;
					}
				}
				else {
					this.$loadingIndicator.detach();
					window.clearTimeout(this.m_loadingIndicatorTimeout);
					this.m_loadingIndicatorTimeout = 0;
					if (this.rows.length == 0) {
						this._toggleLoadingAreaVisible(true);
					}
					
					// when the list was reset and imediately after it, it will be reloaded, do not show the 'no data' message
					// wait a little while, if the loading will start or not (the text 'no data' was flashing for very small amount of time when reloading the list)
					if (!this.m_noDataIndicatorTimeout) {
						this.m_noDataIndicatorTimeout = window.setTimeout(() => {
							if (this.rows.length == 0) {
								this.$noDataText.text(this.onGetEmptyListText());
								$("td", this.$loadingArea).append(this.$noDataText);
								$(".emptyListText", this.$loadingArea).click((event: JQueryEventObject) => {
									this.emptyListClicked();
								});
							}
							else {
								this._toggleLoadingAreaVisible(false);
							}
						}, 150);
					}
				}
			}
		}

		private _toggleLoadingAreaVisible(bVisible: boolean): void {
			if (this.m_domRoot && this.$loadingArea) {
				if (bVisible && !this.m_bLoadingAreaAttached) {
					this.m_domRoot.append(this.$loadingArea);
				}
				else if (!bVisible && this.m_bLoadingAreaAttached) {
					this.$loadingArea.detach();
				}
				this.m_bLoadingAreaAttached = bVisible;
			}
		}
		
		static ListForeColor: string;
		static ListBackgroundColor: string;
		static SeparatorColor: string = "transparent";
		static SearchBarColor: string;
		static SearchBarTextColor: string;
	}

	export class ListScrolledEventArgs extends EventArgs {
		constructor(scrollPosition: number) {
			super();
			this.scrollPosition = scrollPosition;
		}

		public scrollPosition: number;
	}

	export class DelayLoadEventArgs extends Resco.EventArgs {
		constructor(completed: boolean, s: number, e: number) {
			super();
			this.completed = completed;
			this.startIndex = s;
			this.endIndex = e;
		}
		public completed: boolean;
		public startIndex: number;
		public endIndex: number;
	}


	export class Row {
		constructor(data?: any, separatorBinding?: KnockoutObservable<boolean>) {
			this.data = data;
			this.selected = ko.observable(false);
			this.templateIndex = ko.observable(0);
			this.selectedTemplateIndex = ko.observable(0);
			this.activeTemplateIndex = ko.computed(() => {
				return this.selected() ? this.selectedTemplateIndex() : this.templateIndex();
			});
			this.column = 0;
		}

		public userData: any;
		public data: any;
		public templateIndex: KnockoutObservable<number>;
		public selectedTemplateIndex: KnockoutObservable<number>;
		public activeTemplateIndex: KnockoutComputed<number>;
		public selected: KnockoutObservable<boolean>;
		public column: number;
		public $root: JQuery;

		get hasSeparator(): boolean {
			// either the binding is not specified (in that case, asume separator exists) or separatorBinding() is true
			return !this.separatorBinding || this.separatorBinding();
		}

		private m_separatorBinding: KnockoutComputed<boolean>;
		private m_separatorBindingSubsc: KnockoutSubscription;

		set separatorBinding(value: KnockoutComputed<boolean>) {
			// dispose previous subscriptions
			if (this.m_separatorBindingSubsc) {
				this.m_separatorBindingSubsc.dispose();
			}

			this.m_separatorBinding = value;
			if (this.m_separatorBinding) {
				this.m_separatorBindingSubsc = this.m_separatorBinding.subscribe((value) => {
					if (this.$root) {
						if (this.m_separatorBinding()) {
							this.$root.addClass("alHasSeparator");
						}
						else {
							this.$root.removeClass("alHasSeparator");
						}
					}
				}, this);
			}
			else {
				this.$root.addClass("alHasSeparator");
			}
		}
		get separatorBinding(): KnockoutComputed<boolean> {
			return this.m_separatorBinding;
		}

		public dispose() {
			if (this.m_separatorBindingSubsc) {
				this.m_separatorBindingSubsc.dispose();
			}
		}
	}

	export enum RowInsertedType {
		created = 0,
		updated = 1
	}

	export class RowInsertedEventArgs extends Resco.EventArgs {
		constructor(row: Row, createdType?: RowInsertedType) {
			super();
			this.row = row;
			this.type = createdType;
		}

		public row: Row;
		public type: RowInsertedType;
	}

	export class RowTemplate {
		constructor() {
			this.cellTemplates = new Array<CellTemplate>();
			this.size = new Resco.Size(320, 48);
			this.margin = new Resco.Rectangle(0, 0, 0, 0);
		}

		public name: string;
		public size: Resco.Size;
		public backgroundColor: string;
		public selectedBackground: string;
		public isStatic: boolean;
		public cellTemplates: Array<CellTemplate>;
		public mapCell: CellTemplate;
		public margin: Resco.Rectangle;
		public htmlContent: string;

		public clone(): RowTemplate {
			var row = new RowTemplate();
			row.name = this.name + "-clone";
			row.size = new Resco.Size(this.size.width(), this.size.height());
			row.margin = new Resco.Rectangle(this.margin.left(), this.margin.top(), this.margin.width(), this.margin.height());
			row.backgroundColor = this.backgroundColor;
			row.selectedBackground = this.selectedBackground;
			row.isStatic = this.isStatic;
			row.htmlContent = this.htmlContent;

			row.cellTemplates = new Array<CellTemplate>();
			this.cellTemplates.forEach((cell) => {
				row.cellTemplates.push(cell.clone());
			}, this);

			//row.mapCell = this.mapCell.clone(); // TODO: set the cell from cloned celltemplates
			return row;
		}
	}

	export class ListRowTemplate extends RowTemplate {
		constructor(dataMember: string) {
			super();
			this.dataMember = dataMember;
		}
		// inner list template
		public templateIndex: number;
		public dataMember: string;

		public clone(): ListRowTemplate {
			var row = new ListRowTemplate(this.dataMember);
			row.name = this.name + "-clone";
			row.size = new Resco.Size(this.size.width(), this.size.height());
			row.backgroundColor = this.backgroundColor;
			row.selectedBackground = this.selectedBackground;
			row.isStatic = this.isStatic;
			row.templateIndex = this.templateIndex;
			row.dataMember = this.dataMember;

			row.cellTemplates = new Array<CellTemplate>();
			this.cellTemplates.forEach((cell) => {
				row.cellTemplates.push(cell.clone());
			}, this);

			return row;
		}
	}

	export class CellTemplate {
		public name: string;
		public position: Resco.Position;
		public size: Resco.Size;
		public kind: ListCellKind;
		public dataMember: string;
		public constant: boolean;
		public style: ListCellStyle;
		public styleName: string;
		public anchor: number;

		public clone(): CellTemplate {
			var cell = new CellTemplate();
			cell.name = this.name;
			cell.position = new Resco.Position(this.position.left(), this.position.top());
			cell.size = new Resco.Size(this.size.width(), this.size.height());
			cell.kind = this.kind;
			cell.dataMember = this.dataMember;
			cell.constant = this.constant;
			if (this.style) {
				cell.style = this.style.clone();
			}
			cell.styleName = this.styleName;
			cell.anchor = this.anchor;
			return cell;
		}
	}

	export class AdvancedListEnumerator<T> implements Resco.IEnumerator<any>, Resco.IEnumerable<any> {        
		private m_position: number;
		private m_data: Array<T>;

		constructor(data: Array<T>) {
			this.m_data = data;
			this.m_position = -1;
		} 

		get current(): T {
			if (this.m_data && this.m_position >= 0 && this.m_position < this.m_data.length) {
				return this.m_data[this.m_position];
			}
			return null;
		}

		public moveNext(): boolean {
			return this.m_data && (++this.m_position < this.m_data.length);
		}

		public reset() {
			this.m_position = -1;
		}

		public getEnumerator(): Resco.IEnumerator<any> {
			return this;
		}
	}

	export class SelectedIndexChangedEventArgs extends Resco.EventArgs {
		constructor(index: number, oldIndex: number) {
			super();
			this.index = index;
			this.oldIndex = oldIndex;
		}

		public index: number;
		public oldIndex: number;
	}

	export class RowClickedEventArgs extends Resco.EventArgs {
		constructor(i: number, d: any) {
			super();
			this.index = i;
			this.data = d;
		}

		public index: number;
		public data: any;
	}

	export class ListButtonEventArgs extends Resco.EventArgs {
		constructor(ri: number, n: string) {
			super();
			this.rowIndex = ri;
			this.name = n;
		}

		public rowIndex: number;
		public name: string;
	}

	export class ListCellStyle {
		public name: string;
		public fontSize: number;
		public fontWeight: FontWeight;
		public foreColor: string;
		public backColor: string;
		public horizontalAlignment: ContentAlignment;
		public verticalAlignment: ContentAlignment;
		public formatString: string;
		public valueConverter: (p1: any, p2: any) => any;
		public autoHeight: boolean;
		public border: ListCellBorder;
		public borderColor: string;
		public folder: string;
		public imageQuery: string;

		public clone(): ListCellStyle {
			var clone = new ListCellStyle();
			clone.name = this.name;
			clone.fontSize = this.fontSize;
			clone.fontWeight = this.fontWeight;
			clone.foreColor = this.foreColor;
			clone.backColor = this.backColor;
			clone.horizontalAlignment = this.horizontalAlignment;
			clone.verticalAlignment = this.verticalAlignment;
			clone.formatString = this.formatString;
			clone.valueConverter = this.valueConverter;
			clone.autoHeight = this.autoHeight;
			clone.border = this.border;
			clone.borderColor = this.borderColor;
			clone.folder = this.folder;
			clone.imageQuery = this.imageQuery;
			return clone;
		}
	}
}