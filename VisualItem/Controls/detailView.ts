module Resco.UI {
	export class DetailView implements IDetailView {
		static s_layout: FlexiViewLayout;

		public name: string;
		public imageName: string;
		public text: string;
		public type: ViewType;
		public form: any;
		get layout(): FlexiViewLayout {
			if (!DetailView.s_layout) {
				DetailView.s_layout = new FlexiViewLayout(this);
				DetailView.s_layout.height = GridUnit.logical(-1);
				DetailView.s_layout.isHeaderVisible = 2;
			}
			return DetailView.s_layout;
		}
		public isSelected: KnockoutObservable<boolean>;
		public isEnabled: KnockoutObservable<boolean>;
		public isVisible: KnockoutObservable<boolean>;
		public isDirty: boolean;
		public groups: KnockoutObservableArray<Array<IDetailItem>>;
		public items: Array<IDetailItem>;

		public itemChanged: Resco.Event<DetailViewItemArgs>;
		public itemValidating: Resco.Event<DetailViewItemValidatingArgs>;
		public textButtonClick: Resco.Event<DetailViewItemTextClickArgs>;
		public resized: Resco.Event<ResizeEventArgs>;

		private m_dataSource: any;
		get dataSource(): any {
			return this.m_dataSource;
		}
		set dataSource(value: any) {
			try {
				this._clearDataSource();
				this.m_dataSource = value;
				if (this.m_dataSource) {
					if (Resco.isINotifyPropertyChanged(this.m_dataSource)) {
						this.m_dataSource.propertyChanged.add(this, this._dataSourcePropertyChanged);
					}
					this._updateItems();
				}
			}
			finally {
				this.isDirty = false;
			}
		}

		get count(): number {
			return this.items ? this.items.length : 0;
		}

		private m_domRoot: HTMLElement;
		get domRoot(): HTMLElement {
			return this.m_domRoot;
		}

		private m_domContainer: HTMLElement;


		constructor(form: any) {
			this.form = form;
			this.type = ViewType.Detail;
			this.groups = ko.observableArray<Array<IDetailItem>>();
			this.items = new Array<IDetailItem>();

			this.itemChanged = new Resco.Event<DetailViewItemArgs>(this);
			this.itemValidating = new Resco.Event<DetailViewItemValidatingArgs>(this);
			this.resized = new Resco.Event<ResizeEventArgs>(this);

			this.isSelected = ko.observable(false);
			this.isSelected.subscribe((nv: boolean) => {
				this._showHideView(nv);
			}, this);

			this.isVisible = ko.observable(true);
			this.isEnabled = ko.observable(true);

			this.m_updateCounter = 0;

			this.m_size = new Resco.Size(-1, -1);
		}

		public createItem(type: DetailItemType): IDetailItem {
			var item: DetailItem;

			switch (type) {
				case DetailItemType.Text: { item = new DetailItemTextBox(this); break; }
				case DetailItemType.Numeric: { item = new DetailItemNumeric(this); break; }
				case DetailItemType.Link: { item = new DetailItemLink(this); break; }
				case DetailItemType.Combo: { item = new DetailItemComboBox(this); break; }
				case DetailItemType.CheckBox: { item = new DetailItemCheckBox(this); break; }
				case DetailItemType.DateTime: { item = new DetailItemDateTime(this); break; }
				case DetailItemType.Separator: { item = new DetailItemSeparator(this); break; }
				case DetailItemType.Image: item = new DetailItemImage(this); break;
				default: { item = new DetailItem(this); break; }
			}

			return item;
		}

		public insertItem(index: number, item: IDetailItem, itemStyle: DetailViewItemStyle): number {
			item.itemStyle(itemStyle);
			if (index < 0) {
				this.items.push(item);
			}
			else {
				this.items.splice(index, 0, item);
			}
			this.update();
			return index;
		}

		public removeItem(index: number) {
			if (index >= 0 && index < this.items.length) {
				this.items.splice(index, 1);
			}
			this.update();
		}

		public startEditItem(index: number): void {
			this.items.filter(item => item.hasFocus()).forEach(item => item.hasFocus(false));
			var item = this.getItem(index);
			if (item)
				item.hasFocus(true);
		}

		public clearContents() {
		}

		private _clearDataSource() {
			if (this.m_dataSource) {
				var notifySource = null;
				if (Resco.isINotifyPropertyChanged(this.m_dataSource)) {
					this.m_dataSource.propertyChanged.remove(this, this._dataSourcePropertyChanged);
				}
				this.m_dataSource = null;
				this.clearContents();
			}
		}

		private _dataSourcePropertyChanged(sender: any, e: Resco.PropertyChangedEventArgs) {
			for (var i = 0; i < this.items.length; i++) {
				var item = this.items[i];
				if ((item.dataMember && item.dataMember === e.propertyName) || (item.name && item.name === e.propertyName)) {
					this._updateItem(item);
					break;
				}
			}
		}

		private _updateItem(item: IDetailItem) {
			var ds = this.dataSource;
			var member = item.dataMember || item.name;
			if (member && ds) {
				if (ds[member] !== undefined) {
					if (ko.isObservable(ds[member])) {
						item.value(ds[member]());
					}
					else {
						item.value(ds[member]);
					}
				}
			}
		}

		public inUpdate: boolean;
		private _updateItems() {
			if (!this.inUpdate) {
				this.inUpdate = true;
				try {
					for (var i = 0; i < this.items.length; i++) {
						this._updateItem(this.items[i]);
					}
				}
				finally {
					this.inUpdate = false;
				}
			}
		}

		public getItem(index: number): IDetailItem {
			if (index >= 0 && index < this.items.length) {
				return this.items[index];
			}
			return null;
		}

		public findItem(name: string): IDetailItem {
			for (var i = 0; i < this.items.length; i++) {
				if (this.items[i].name === name) {
					return this.items[i];
				}
			}
			return null;
		}

		public setupGroups(groupCounts: number[]) {
			if (groupCounts) {
				var count = this.items.length;
				var index = 0;

				for (var i = 0; i < count; i++) {
					var g = groupCounts[i];
					if (g === undefined) {
						break;
					}

					index += g;
					if (index >= count) {
						break;
					}

					var item = this.createItem(DetailItemType.Separator);
					item.name = "-";
					this.insertItem(index, item, null);
					count++;
					index++;
				}
			}
			this.update(true);
		}

		private m_updateCounter: number;

		public beginUpdate() {
			this.m_updateCounter++;
		}

		public endUpdate() {
			this.m_updateCounter--;
			this.update();
		}

		public update(force?: boolean) {
			if (force || this.m_updateCounter == 0) {
				var nextGroupAmount = 0;
				var groups = this.groups();
				var actualGroup = new Array<IDetailItem>();
				groups.splice(0);

				for (var i = 0; i < this.items.length; i++) {
					if (this.items[i].itemType == DetailItemType.Separator) {
						if (actualGroup.length > 0) {
							groups.push(actualGroup);
							actualGroup = new Array<IDetailItem>();
						}
					}
					if (this.items[i].isVisible()) {
						actualGroup.push(this.items[i]);
					}
				}
				if (actualGroup.length > 0) {
					groups.push(actualGroup);
				}
				this.groups.valueHasMutated();
			}
		}

		private _showHideView(show: boolean) {
			if (this.m_domRoot) {
				if (show) {
					$(this.m_domRoot).removeClass("hidden");
				}
				else {
					$(this.m_domRoot).addClass("hidden");
				}
			}
		}

		public onAppended(domRoot: HTMLElement) {
			this.m_domRoot = domRoot;
			this.m_domContainer = $(".itemsContainer", this.m_domRoot)[0];
			//new ResizeSensor(this.m_domContainer, () => {
			//	this.onResize(new Resco.Size(this.m_domContainer.clientWidth, this.m_domContainer.clientHeight));
			//});
			this._showHideView(this.isSelected());
		}

		public get documentSize(): number {
			return this.m_domContainer ? this.m_domContainer.scrollHeight : 100;
		}

		private m_size: Resco.Size;
		public onResize(size: Resco.Size) {
			var newW = size.width();
			var newH = size.height();
			var oldW = this.m_size.width();
			var oldH = this.m_size.height();
			if (oldW !== newW || oldH !== newH) {
				this.m_size.width(newW);
				this.m_size.height(newH);
				this.resized.raise(new ResizeEventArgs(newW, newH, oldW, oldH));
			}
		}

		public getDesiredSize(): Resco.Size {
			if (this.m_domRoot) {
				var $dr = $(this.m_domRoot);
				var h = 36 + this.items.length * 30;	// just rough estimate
				return new Resco.Size($dr.width(), h);
			}
			return null;
		}

		static as(obj: any): DetailView {
			if (obj instanceof DetailView) {
				return <DetailView>obj;
			}
			return null;
		}

		//public JSBPropertyMap(): MobileCrm.UI.Web.JSBPropertyMapper[] {
		//	return [new MobileCrm.UI.Web.JSBPropertyMapper("isDirty"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("isEnabled"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("isVisible"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("name"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("items")];
		//}

		public JSBExplicitType(): string {
			return "MobileCRM.UI._DetailView";
		}

		static Background: string;
		static ItemLabelForeground: string;
		static ItemForeground: string;
		static ItemBackground: string;
		static ItemDisabled: string;
		static ItemLink: string;
	}

	export class DetailItem implements IDetailItem {
		constructor(parent: IDetailView) {
			this.m_parent = parent;

			this.placeholderText = ko.observable<string>();
			this.errorMessage = ko.observable<string>();
			this.itemIsEnabled = ko.observable(true);
			this.isVisible = ko.observable(true);
			this.isVisible.subscribe(v => this.m_parent.update());

			this.isEnabled = ko.computed(() => {
				return this.itemIsEnabled() && this.m_parent.isEnabled();
			}, this);

			this.value = ko.observable();

			this.hasFocus = ko.observable(false);

			this.setValueChangeHandlers(true);

			this.name = "DetailItem";
			this.label = ko.observable<string>("Label");
			this.itemType = DetailItemType.Base;

			this.itemStyle = ko.observable<DetailViewItemStyle>();
			this.itemStyle.subscribe((style: DetailViewItemStyle) => {
				this.updateStyle(style);
			}, this);
			this.height = ko.observable(30);

			this.labelForeColor = ko.computed<string>(() => {
				var style = this.itemStyle();
				return style && (style.labelForeColor || style.labelForeColor === 0) ? style.labelForeColor.toRGBA() : DetailView.ItemLabelForeground;
			});

			this.backgroundColor = ko.computed<string>(() => {
				var style = this.itemStyle();
				return style && (style.backColor || style.backColor === 0) ? style.backColor.toRGBA() : DetailView.ItemBackground;
			});
		}

		protected m_parent: IDetailView;
		public m_oldValue: any;

		public name: string;
		public dataMember: string;
		public label: KnockoutObservable<string>;
		public placeholderText: KnockoutObservable<string>;
		public errorMessage: KnockoutObservable<string>;
		public itemStyle: KnockoutObservable<DetailViewItemStyle>;
		public itemIsEnabled: KnockoutObservable<boolean>;
		public isEnabled: KnockoutComputed<boolean>;
		public isVisible: KnockoutObservable<boolean>;
		public value: KnockoutObservable<any>;
		public isNullable: boolean
		public validate: boolean;
		public itemType: DetailItemType;
		public height: KnockoutObservable<number>;
		public hasFocus: KnockoutObservable<boolean>;

		public backgroundColor: KnockoutComputed<string>;
		public labelForeColor: KnockoutComputed<string>;

		public valueChangingSubscription: KnockoutSubscription;
		public valueChangedSubscription: KnockoutSubscription;

		private _valueChanging(oldValue: any) {
			this.m_oldValue = oldValue;
		}

		get index(): number {
			if (this.m_parent) {
				return this.m_parent.items.indexOf(this);
			}
			return -1;
		}

		// virtual
		public _valueChanged(newValue: any) {
			var e = new DetailViewItemValidatingArgs(this, newValue, this.m_oldValue);
			this.m_parent.itemValidating.raise(e);
			if (e.cancel) {
				this.setValueChangeHandlers(false);
				this.value(this.m_oldValue);
				this.setValueChangeHandlers(true);
			}
			else if (newValue !== this.m_oldValue) {
				this._setDataSourcePropertyValue(newValue);
				this.m_parent.itemChanged.raise(new DetailViewItemArgs(this));
			}
		}

		private _setDataSourcePropertyValue(value: any) {
			var ds = <Object>this.m_parent.dataSource;
			var member = this.dataMember;
			if (ds && member && !this.m_parent.inUpdate) {
				if (ds.hasOwnProperty(member) || ds[member] !== undefined) {
					if (ko.isObservable(ds[member])) {
						ds[member](value);
					}
					else {
						ds[member] = value;
					}
				}
			}
		}

		public setValueChangeHandlers(on: boolean) {
			if (on) {
				if (!this.valueChangingSubscription) {
					this.valueChangingSubscription = this.value.subscribe((oldValue: any) => {
						this._valueChanging(oldValue);
					}, this, "beforeChange");
				}
				if (!this.valueChangedSubscription) {
					this.valueChangedSubscription = this.value.subscribe((newValue: any) => {
						this._valueChanged(newValue);
					}, this);
				}
			}
			else {
				if (this.valueChangingSubscription) {
					this.valueChangingSubscription.dispose();
					this.valueChangingSubscription = null;
				}
				if (this.valueChangedSubscription) {
					this.valueChangedSubscription.dispose();
					this.valueChangedSubscription = null;
				}
			}
		}

		public updateStyle(style: DetailViewItemStyle) {
			if (style) {
				if (style.labelPosition == LabelPosition.Top) {
					this.height(this.height() + 20);
				}
			}
		}

		//public JSBPropertyMap(): MobileCrm.UI.Web.JSBPropertyMapper[] {
		//	return [new MobileCrm.UI.Web.JSBPropertyMapper("dataMember"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("errorMessage"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("itemIsEnabled", "isEnabled"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("isNullable"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("isVisible"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("label"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("name"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("value"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("validate")];
		//}
	}

	export class DetailItemTextBox extends DetailItem implements IDetailItemTextBox {
		public numberOfLines: number;
		public isPassword: boolean;
		public maxLength: number;
		public kind: ItemTextBoxKind;

		constructor(parent: DetailView) {
			super(parent);
			this.itemType = DetailItemType.Text;
			this.isPassword = false;
			this.numberOfLines = 1;
			this.maxLength = 100;
		}

		public updateStyle(style: DetailViewItemStyle) {
			if (style) {
				this.height(style.isMultiLine ? 90 : 30);
			}
			super.updateStyle(style);
		}

		//public JSBPropertyMap(): MobileCrm.UI.Web.JSBPropertyMapper[] {
		//	return super.JSBPropertyMap().concat([new MobileCrm.UI.Web.JSBPropertyMapper("isPassword"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("kind"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("maxLength"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("numberOfLines")]);
		//}
	}

	export class DetailItemNumeric extends DetailItem implements IDetailItemNumeric {
		public minimum: number;
		public maximum: number;
		public increment: number;
		public decimalPlaces: KnockoutObservable<number>;
		public displayFormat: KnockoutObservable<string>;
		public isFocused: KnockoutObservable<boolean>;
		public upDownVisible: boolean;

		public displayValue: KnockoutComputed<string>;

		constructor(parent: DetailView) {
			super(parent);
			//this.m_displayValueSubscription = this.displayValue.subscribe(this._parseDisplayValue, this);
			this.itemType = DetailItemType.Numeric;
			this.minimum = 0;
			this.increment = 1;
			this.decimalPlaces = ko.observable(2);
			this.displayFormat = ko.observable<string>()
			this.isFocused = ko.observable(false);
			this.displayValue = ko.computed(() => {
				var val = this.value();
				if (!val && val !== 0) {
					return "";
				}
				return this.displayFormat() ? Resco.formatString(this.displayFormat(), [this.value()]) : this.value();
			}, this);
			this.upDownVisible = true;
		}

		public _valueChanged(newValue: any) {
			newValue = this.validateNumber(newValue);
			if (newValue !== this.value()) { // two NaN values does not equal :D, so the first condition is not true if both are NaN
				this.setValueChangeHandlers(false);
				this.value(newValue);
				this.setValueChangeHandlers(true);
			}
			super._valueChanged(newValue);
		}

		public validateNumber(strValue: string): number {
			var numValue = Resco.strictParseFloat(strValue);
			if (!isNaN(numValue)) {
				if (numValue < this.minimum) {
					numValue = this.minimum;
				}
				else if (numValue > this.maximum) {
					numValue = this.maximum;
				}
				else if (this.decimalPlaces() >= 0) {
					numValue = Resco.round10(numValue, -this.decimalPlaces());
				}
			}
			else {
				return null;
			}
			return numValue;
		}

		public focused() {
			if (!this.isFocused() && this.isEnabled()) {
				this.isFocused(true);
			}
		}

		public blured() {
			this.isFocused(false);
		}

		//public JSBPropertyMap(): MobileCrm.UI.Web.JSBPropertyMapper[] {
		//	return super.JSBPropertyMap().concat([new MobileCrm.UI.Web.JSBPropertyMapper("decimalPlaces"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("displayFormat"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("increment"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("maximum"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("minimum"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("upDownVisible")]);
		//}
	}

	export class DetailItemLink extends DetailItem implements IDetailItemInlineLink {
		private m_handler: IDetailViewItemDelegate;
		get handler(): IDetailViewItemDelegate {
			return this.m_handler;
		}
		set handler(value: IDetailViewItemDelegate) {
			if (value != this.m_handler) {
				this.m_handler = value;
				this.m_handler.linkItem = this;
				this.linkLabel(this.handler.formatValue(this.value()));
			}
		}

		get bindingList(): Resco.BindingList<any> {
			var val = this.value();
			if (val && Resco.BindingList.as(val)) {
				return <Resco.BindingList<any>>val;
			}
			return null;
		}

		public isMultiline: boolean;
		public showDropDownIcon: boolean;
		public linkLabel: KnockoutObservable<string>;

		//private m_dropDownDialog: DetailItemLinkPopup;

		constructor(parent: DetailView) {
			super(parent);
			this.itemType = DetailItemType.Link;
			this.linkLabel = ko.observable<string>();
			this.popupOpened = new Resco.Event<Resco.UI.LinkItemPopupArgs>(this);
			this.textChanged = new Resco.Event<Resco.UI.LinkItemTextChangedArgs>(this);
			this.isPopupVisible = ko.observable(false);
			this.showDropDownIcon = true;
			//this.m_dropDownDialog = new DetailItemLinkPopup(this, this.m_parent);

			this.buttonLabel = ko.computed(() => {
				return this.isPopupVisible() ? "..." : "▾";
			}, this);

		}

		public linkClicked(textClicked: boolean) {
			if ((!textClicked || !this.value() || (this.bindingList && this.bindingList.length == 0)) && !this.popupOpened.empty) {
				//if (!this.m_listView) {
				//	this.beginEdit();
				//	return;
				//}
				//else {
				//	this.endEdit();
				//}
			}
			this.handler.onClick(this.value(), textClicked);
		}

		public closeClicked() {
			this.endEdit();
		}

		public beginEdit(): void {
			//if (this.m_listView != null) return;

			//this.m_listView = new ListView(this.m_parent.form);
			//this.m_listView.emptyFilterText("Search or insert...");
			//this.m_listView.filterChanged.add(this, this._listViewFitlerChanged);
			//this.m_listView.isSelected(true);
			//this.isPopupVisible(true);
			//this.m_dropDownDialog.show();
			////this.m_outsideClickHandler = this._onClickedOutside.bind(this);
			////$('html').on({ click: this.m_outsideClickHandler });
			//this.popupOpened.raise(new Resco.UI.LinkItemPopupArgs(this.m_listView, true), this);
		}

		private m_outsideClickHandler: any;
		//private m_listView: ListView;
		//get listView(): ListView {
		//	return this.m_listView;
		//}

		public endEdit(): void {
			//if (this.m_listView) {
			//	this.popupOpened.raise(new Resco.UI.LinkItemPopupArgs(this.m_listView, false));
			//	this.m_listView.filterChanged.remove(this, this._listViewFitlerChanged);
			//	this.m_listView = null;
			//	$('html').off({ click: this.m_outsideClickHandler });
			//	this.isPopupVisible(false);
			//	this.m_dropDownDialog.close();
			//}
		}

		//private _listViewFitlerChanged(sender: any, e: Resco.UI.FilterChangedEventArgs): void {
		//	if (!this.textChanged.empty) {
		//		var filterText = this.m_listView.filterText;
		//		var args = new Resco.UI.LinkItemTextChangedArgs();
		//		args.listView = this.m_listView;
		//		args.enterPressed = (e.kind == Resco.UI.FilterChangeKind.TextChanged);
		//		args.text = filterText;
		//		this.textChanged.raise(args, this);
		//		if (filterText != args.text && this.m_listView) {
		//			this.m_listView.setFilterText(args.text, false);
		//		}
		//	}
		//}

		//private m_bKeepPopupOpened: boolean = false;
		//private _onClickedOutside(event: JQueryEventObject) {
		//    var itemRoot = $("#detailItemId_" + this.index, this.m_parent.domRoot);
		//    if (!$(event.target).closest($(".editor", itemRoot)).length && !this.m_bKeepPopupOpened) {
		//        this.endEdit();
		//    }
		//    this.m_bKeepPopupOpened = false;
		//}

		//public popupClicked(): void {
		//    this.m_bKeepPopupOpened = true;
		//}

		public _valueChanged(newValue: any) {
			this.updateLabel(newValue);
			super._valueChanged(newValue);
		}

		public updateLabel(value?: string): void {
			this.linkLabel(this.handler ? this.handler.formatValue(value !== undefined ? value : this.value()) : "");
		}

		public removePart(index: number): void {
			//this.m_bKeepPopupOpened = true;
			if (index < 0) {
				this.value(null);
				this.endEdit();
			}
			else if (this.bindingList) {
				this.bindingList.removeAt(index);
			}
		}

		public closePopup(): void {
			this.endEdit();
		}

		public listViewAppended(domRoot: HTMLElement) {
			//this.m_listView.onAppended(domRoot);
			//this.m_listView.onResize(new Resco.Size(-1, -1));
			//this.m_listView.focusFilter();
		}

		public popupOpened: Resco.Event<LinkItemPopupArgs>;
		public textChanged: Resco.Event<LinkItemTextChangedArgs>;

		public isPopupVisible: KnockoutObservable<boolean>;
		public buttonLabel: KnockoutComputed<string>;

		static as(obj: any): DetailItemLink {
			if (obj instanceof DetailItemLink) {
				return <DetailItemLink>obj;
			}
			return null;
		}

		//public JSBPropertyMap(): MobileCrm.UI.Web.JSBPropertyMapper[] {
		//	return super.JSBPropertyMap().concat([new MobileCrm.UI.Web.JSBPropertyMapper("isMultiline")]);
		//}
	}

	//class DetailItemLinkPopup extends Dialog {
	//	private m_item: DetailItemLink;
	//	get item(): DetailItemLink {
	//		return this.m_item;
	//	}

	//	private m_detailView: IDetailView;
	//	get detailView(): IDetailView {
	//		return this.m_detailView;
	//	}


	//	constructor(item: DetailItemLink, detailView: IDetailView) {
	//		super();
	//		this.contentTemplateName = "tmplDetailItemLinkPopupContent";
	//		this.outerAreaBackgroundOpacity = 0;

	//		this.m_item = item;
	//		this.m_detailView = detailView;
	//	}

	//	public _updateDialogBounds(area: Resco.Size) {
	//		var item = $("#detailItemId_" + this.item.index, this.detailView.domRoot);
	//		var itemEditor = $(".editor", item)

	//		var w = itemEditor.width();
	//		if (w > area.width())
	//			w = area.width();
	//		var h = 400;
	//		if (h > area.height())
	//			h = area.height();

	//		var offset = itemEditor.offset();
	//		var left = offset.left;
	//		var top = offset.top;

	//		this.displayBounds.width(w);
	//		this.displayBounds.height(h);
	//		this.displayBounds.left(left);
	//		this.displayBounds.top(top);
	//	}

	//	public close(): void {
	//		this.item.endEdit();
	//		super.close();
	//	}
	//}

	export class DetailItemComboBox extends DetailItem implements IDetailItemComboBox {
		public displayMember: string;
		public valueMember: string;
		public listDataSource: KnockoutObservableArray<any>;

		public isRadio: KnockoutComputed<boolean>;
		public selectedRadioIndex: KnockoutObservable<number>;

		constructor(parent: DetailView) {
			super(parent);
			this.listDataSource = ko.observableArray<any>();
			this.itemType = DetailItemType.Combo;
			this.displayMember = "";
			this.valueMember = "";

			this.isRadio = ko.computed<boolean>(() => {
				return this.listDataSource() && this.listDataSource().length > 0 && this.itemStyle() && this.itemStyle().radioButtonMaxCount >= this.listDataSource().length;
			}, this);

			this.selectedRadioIndex = ko.observable<number>(0);

			this.value.subscribe(newValue => {
				var index = this.listDataSource().findIndex(item => this.valueMember && item ? item[this.valueMember] === newValue : item === newValue);
				this.selectedRadioIndex(index);
			}, this);
		}

		public selectRadioItem(newValue: any): void {
			this.value(this.valueMember ? newValue[this.valueMember] : newValue);
		}

		static as(obj: any): DetailItemComboBox {
			if (obj instanceof DetailItemComboBox) {
				return <DetailItemComboBox>obj;
			}
			return null;
		}

		//public JSBPropertyMap(): MobileCrm.UI.Web.JSBPropertyMapper[] {
		//	return super.JSBPropertyMap().concat([new MobileCrm.UI.Web.JSBPropertyMapper("displayMember"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("valueMember")]);
		//}
	}

	export class DetailItemCheckBox extends DetailItem implements IDetailItemCheckBox {
		public textChecked: string;
		public textUnchecked: string;

		constructor(parent: DetailView) {
			super(parent);
			this.itemType = DetailItemType.CheckBox;
			this.textChecked = "";
			this.textUnchecked = "";
		}

		//public JSBPropertyMap(): MobileCrm.UI.Web.JSBPropertyMapper[] {
		//	return super.JSBPropertyMap().concat([new MobileCrm.UI.Web.JSBPropertyMapper("textChecked"),
		//	new MobileCrm.UI.Web.JSBPropertyMapper("textUnchecked")]);
		//}
	}

	// TODO: consider using date.js sdk for date manipulation
	export class DetailItemDateTime extends DetailItem implements IDetailItemDateTime {
		public minimum: Date;
		public maximum: Date;
		public dateParts: ItemDateTimeParts;

		private m_element: HTMLElement;
		//private m_altField: HTMLElement;
		private m_skipSettingControlValue: boolean;

        /*get format(): string {
            return this.dateParts && this.dateParts == ItemDateTimeParts.Date ? "yy-mm-dd" : "yy-mm-dd HH:II:ss";
        }*/

		get displayFormat(): string {
			return this.dateParts && this.dateParts == ItemDateTimeParts.Date ? "m/d/yy" : "m/d/yy - H:II";
		}

		constructor(parent: DetailView) {
			super(parent);
			this.itemType = DetailItemType.DateTime;
		}

		public init(element: HTMLElement) {
			this.m_element = element;
			//this.m_altField = $(element).next()[0];
			$(element).datepicker({
				onSelect: (dateText, inst) => this._toDate(dateText),
				dateFormat: this.displayFormat,
				//altField: $(this.m_altField),
				//altFormat: this.format,
				showButtonPanel: true,
			});
			$(element).datepicker("setDate", this.value());
		}

		private _toDate(dateText: string) {
			//dateText = $(this.m_altField).val();
			var date = $.datepicker.parseDate(this.displayFormat, dateText);// Somehow time is not set for altField, but it is set in dateText (??? bug in jquery.datepicker?). I FIXED THIS in jquery.ui.datepicker.js
			this.m_skipSettingControlValue = true;
			this._valueChanged(date);
			this.m_skipSettingControlValue = false;
		}

		public _valueChanged(newValue: any) {
			newValue = this.validateDate(newValue);
			if (!this.m_skipSettingControlValue) {
				$(this.m_element).val($.datepicker.formatDate(this.displayFormat, this.value()));
				//$(this.m_altField).val($.datepicker.formatDate(this.format, this.value()));
			}
			if (!this.dateEquals(newValue, this.value())) {
				this.setValueChangeHandlers(false);
				this.value(newValue);
				this.setValueChangeHandlers(true);
			}
			super._valueChanged(newValue);
		}

		public dateEquals(d1: Date, d2: Date): boolean {
			return (d1 !== null && d1 !== undefined && d2 !== null && d2 !== undefined) && d1.getTime() == d2.getTime() || (!d1 && !d2);
		}

		public validateDate(date: Date): Date {
			// TODO: Advantage does not support minimum and maximum for date?
			return date;
		}

		//public JSBPropertyMap(): MobileCrm.UI.Web.JSBPropertyMapper[] {
		//	return super.JSBPropertyMap().concat([new MobileCrm.UI.Web.JSBPropertyMapper("dateParts", "parts")]);
		//}

		//public parseDate(strVal: string): Date {
		//    // parse date in yy-mm-dd format
		//    if (strVal) {
		//        var year = parseInt(strVal.substr(0, 4));
		//        var month = parseInt(strVal.substr(5, 2)) - 1;
		//        var date = parseInt(strVal.substr(8, 2));

		//        return new Date(year, month, date);
		//    }
		//    return null;
		//}
	}

	export class DetailItemImage extends DetailItem implements IDetailItemImage {
		public imageQuery: string;
		public imageClick: Resco.Event<Resco.EventArgs>;
		public imgSource: KnockoutObservable<string>;

		public constructor(parent: IDetailView) {
			super(parent);
			this.itemType = DetailItemType.Image;
			this.imageClick = new Resco.Event<Resco.EventArgs>(this);
			this.imgSource = ko.observable<string>();
		}

		public _valueChanged(newValue: any) {
			var imgData = this._getData(newValue);
			if (imgData)
				this.imgSource(imgData);
			super._valueChanged(newValue);
		}

		private _getData(value: string): string {
			var result = value;
			//if (this.imageQuery) {
			//	result = Platform.executeImageQuery(this.m_parent.dataSource, this.imageQuery, 0, 0).dataImage;
			//}
			//if (result.indexOf(".") >= 0) {
			//	result = result.makePathFromDottedNotation();
			//	BaseForm.imageProvider.getImage(result, null, (data) => this.imgSource(data));
			//	return null;
			//}
			return "data:image/png;base64, " + result;
		}

		public imageClicked(): void {
			this.imageClick.raise(Resco.EventArgs.Empty, this);
		}

		public refresh(): void {
		}
	}

	export class DetailItemIFrame extends DetailItem implements IDetailItemIFrame {
	}

	export class DetailItemSeparator extends DetailItem implements IDetailItemSeparator {
		constructor(parent: DetailView) {
			super(parent);
			this.itemType = DetailItemType.Separator;
			this.label("");
		}
	}


	export class DetailViewItemStyle {
		public name: string;
		public height: number;
		public textForeColor: number;
		public textFontHeight: number;
		public textFontWeight: FontWeight;
		public labelForeColor: number;
		public labelFontHeight: number;
		public labelFontWeight: FontWeight;
		public editorForeColor: number;
		public editorDisabledColor: number;
		public editorFontWeight: FontWeight;
		public backColor: number;
		public disabledColor: number;
		public relativeLabelFontSize: number;
		public relativeTextFontSize: number;
		public labelPosition: LabelPosition;
		public labelAutoWidth: boolean;
		public labelAutoHeight: boolean;
		public labelHorizontalAlignment: ContentAlignment;
		public labelVerticalAlignment: ContentAlignment;
		public editorHorizontalAlignment: ContentAlignment;
		public isMultiLine: boolean;
		public imageQuery: string;
		public linkColor: number;
		public errorColor: number;
		public separatorColor: number;
		public pickerImageStyle: Resco.ComboBoxImageAlignment;
		public imageBasePath: string;
		public radioButtonMaxCount: number;
		public wrapText: boolean;
		public minuteIncrement: number;

		public clone(): DetailViewItemStyle {
			var clone = new DetailViewItemStyle();
			clone.name = this.name;
			clone.height = this.height;
			clone.textForeColor = this.textForeColor;
			clone.textFontWeight = this.textFontWeight;
			clone.textFontHeight = this.textFontHeight;
			clone.labelForeColor = this.labelForeColor;
			clone.labelFontHeight = this.labelFontHeight;
			clone.labelFontWeight = this.labelFontWeight;
			clone.editorForeColor = this.editorForeColor;
			clone.editorDisabledColor = this.editorDisabledColor;
			clone.editorFontWeight = this.editorFontWeight;
			clone.backColor = this.backColor;
			clone.disabledColor = this.disabledColor;
			clone.relativeLabelFontSize = this.relativeLabelFontSize;
			clone.relativeTextFontSize = this.relativeTextFontSize;
			clone.labelPosition = this.labelPosition;
			clone.labelAutoWidth = this.labelAutoWidth;
			clone.labelAutoHeight = this.labelAutoHeight;
			clone.labelHorizontalAlignment = this.labelHorizontalAlignment;
			clone.labelVerticalAlignment = this.labelVerticalAlignment;
			clone.editorHorizontalAlignment = this.editorHorizontalAlignment;
			clone.isMultiLine = this.isMultiLine;
			clone.imageQuery = this.imageQuery;
			clone.errorColor = this.errorColor;
			clone.linkColor = this.linkColor;
			clone.separatorColor = this.separatorColor;
			clone.pickerImageStyle = this.pickerImageStyle;
			clone.imageBasePath = this.imageBasePath;
			clone.radioButtonMaxCount = this.radioButtonMaxCount;
			clone.wrapText = this.wrapText;
			clone.minuteIncrement = this.minuteIncrement;
			return clone;
		}
	}


	Resco.Controls.KOEngine.instance.addTemplate("tmplDetailView", "<div class=\"view detailView\">\
	<div class=\"itemsContainer\">\
	<!-- ko foreach: groups -->\
		<!-- ko if: $data[0].itemType == Resco.UI.DetailItemType.Separator && $data[0].label().length > 0 -->\
			<!-- ko if: !$data[0].itemStyle() || !$data[0].itemStyle().labelPosition || $data[0].itemStyle().labelPosition !== 3 -->\
				<div class=\"separator\" data-bind=\"text: $data[0].label, style: {color: $data[0].labelForeColor()}\"></div>\
			<!-- /ko -->\
		<!-- /ko -->\
		<div class=\"detailGroup\" data-bind=\"style: {backgroundColor: Resco.UI.DetailView.Background}\">\
		<!-- ko foreach: $data -->\
			<!-- ko if: $index() > 0 || itemType != Resco.UI.DetailItemType.Separator -->\
				<div class=\"detailItem\" data-bind=\"style: {backgroundColor: backgroundColor()}, attr: {id: 'detailItemId_' + $data.index }\">\
					<!-- ko if: !itemStyle() || !itemStyle().labelPosition || itemStyle().labelPosition == 1 -->\
						<div class=\"label\" data-bind=\"text: label, css: { top: itemStyle() && itemStyle().labelPosition == 1, left: itemStyle() && itemStyle().labelHorizontalAlignment === 0, center: itemStyle() && itemStyle().labelHorizontalAlignment == 2, right: !itemStyle() || itemStyle().labelHorizontalAlignment == 1 || itemStyle().labelHorizontalAlignment == null || itemStyle().labelHorizontalAlignment == undefined }, style: {color: labelForeColor()} \"></div>\
					<!-- /ko -->\
						<div data-bind=\"detailItemTemplateSelector: $data\"></div>\
					<!-- ko if: itemStyle() && itemStyle().labelPosition == 2 -->\
						<div class=\"label\" data-bind=\"text: label, css: { left: itemStyle() && itemStyle().labelHorizontalAlignment === 0, center: itemStyle() && itemStyle().labelHorizontalAlignment == 2, right: !itemStyle() || itemStyle().labelHorizontalAlignment == 1 || itemStyle().labelHorizontalAlignment == null || itemStyle().labelHorizontalAlignment == undefined }, style: {color:labelForeColor()} \"></div>\
					<!-- /ko -->\
				</div>\
			<!-- /ko -->\
		<!-- /ko -->\
		</div>\
	<!-- /ko -->\
	</div>\
</div>");

	Resco.Controls.KOEngine.instance.addTemplate("tmplDetailItemText", "<div class=\"editor\" data-bind=\"css: { invalid: errorMessage(), top: itemStyle() && itemStyle().labelPosition == 1 }\">\
	<!-- ko if: !itemStyle() || !itemStyle().isMultiLine -->\
		<input class=\"text\" data-bind=\"value: value, hasFocus: hasFocus(), attr: { disabled: !isEnabled(), maxlength: maxLength, type: isPassword ? 'password' : 'text', placeholder: placeholderText }, css: { left: !itemStyle() || itemStyle().editorHorizontalAlignment == 0, center: itemStyle() && itemStyle().editorHorizontalAlignment == 2, right: itemStyle() && itemStyle().editorHorizontalAlignment == 1}, style: {color: isEnabled() ? Resco.UI.DetailView.ItemForeground : Resco.UI.DetailView.ItemDisabled} \" />\
	<!-- /ko -->\
	<!-- ko if: itemStyle() && itemStyle().isMultiLine -->\
		<textarea class=\"text\" rows=\"5\" data-bind=\"value: value, attr: { disabled: !isEnabled(), maxlength: maxLength, placeholder: placeholderText }, css: { left: !itemStyle() || itemStyle().editorHorizontalAlignment == 0, center: itemStyle() && itemStyle().editorHorizontalAlignment == 2, right: itemStyle() && itemStyle().editorHorizontalAlignment == 1}, style: {color: isEnabled() ? Resco.UI.DetailView.ItemForeground : Resco.UI.DetailView.ItemDisabled}\"></textarea>\
	<!-- /ko -->\
	<!-- ko if: errorMessage() --><span class=\"exclamation\" data-bind=\"attr: { title: errorMessage() }\">!</span><!-- /ko -->\
</div>");


	Resco.Controls.KOEngine.instance.addTemplate("tmplDetailItemLink", "<div class=\"editor\" data-bind=\"css: { invalid: errorMessage(), top: itemStyle() && itemStyle().labelPosition == 1, hidden: itemStyle() && itemStyle().labelPosition == 3, left: !itemStyle() || itemStyle().editorHorizontalAlignment == 0, center: itemStyle() && itemStyle().editorHorizontalAlignment == 2, right: itemStyle() && itemStyle().editorHorizontalAlignment == 1 }\">\
	<!-- ko if: !isPopupVisible() || !value() || (bindingList && bindingList.length == 0) -->\
		<span class=\"link\" style=\"width: 90%\" data-bind=\"text: isEnabled() || value() ? linkLabel : '', click: linkClicked.bind($data, true), style: {color: isEnabled() ? Resco.UI.DetailView.ItemLink : Resco.UI.DetailView.itemDisabled}\" />\
	<!-- /ko -->\
	<!-- ko if: isEnabled() && showDropDownIcon -->\
		<span class=\"button popup\" style=\"right: 0px\" data-bind=\"text: buttonLabel, click: linkClicked.bind($data, false)\" ></span>\
	<!-- /ko -->\
	<!-- ko if: errorMessage() --><span class=\"exclamation\" data-bind=\"attr: { title: errorMessage() }\">!</span><!-- /ko -->\
</div>");


	Resco.Controls.KOEngine.instance.addTemplate("tmplDetailItemLinkPopupContent", "<div class=\"linkItemPopup\">\
	<div class=\"editor\">\
	<!-- ko if: (!item.bindingList || item.bindingList.length > 0) -->\
		<!-- ko if: item.bindingList -->\
			<div style=\"display: inline-block; width: 90%\">\
			<!-- ko foreach: item.bindingList.list -->\
				<div style=\"display: inline-block\"><span class=\"linkPart\" data-bind=\"text: $data\" /> <span class=\"removeLinkPart\" data-bind=\"click: $parent.item.removePart.bind($parent.item, $index())\" >X</span></div>\
			<!-- /ko -->\
			</div>\
		<!-- /ko -->\
		<!-- ko if: !item.bindingList -->\
			<div style=\"display: inline-block; width: 90%\"><span class=\"linkPart\" data-bind=\"text: item.value()\" />\
			<!-- ko if: item.value() && item.isNullable --><span class=\"removeLinkPart\" data-bind=\"click: item.removePart.bind(item, -1)\" >X</span><!-- /ko -->\
			</div>\
		<!-- /ko -->\
	<!-- /ko -->\
	<!-- ko if: item.showDropDownIcon -->\
		<span class=\"button popup\" data-bind=\"click: item.closeClicked.bind(item)\" style=\"right: 0px\" >▴</span>\
		<span class=\"button popup\" style=\"right: 15px\" data-bind=\"text: item.buttonLabel, click: item.linkClicked.bind(item, false)\" ></span>\
	<!-- /ko -->\
	</div>\
	<div class=\"list\">\
	<!-- ko template: { name: 'tmplAdvancedList', data: item.listView, afterRender: function(elements, form) { item.listViewAppended(elements[0]); } } --><!-- /ko -->\
	</div>\
</div>");


	Resco.Controls.KOEngine.instance.addTemplate("tmplDetailItemNumeric", "<div class=\"editor\" data-bind=\"css: { invalid: errorMessage(), top: itemStyle() && itemStyle().labelPosition == 1, hidden: itemStyle() && itemStyle().labelPosition == 3, left: !itemStyle() || itemStyle().editorHorizontalAlignment == 0, center: itemStyle() && itemStyle().editorHorizontalAlignment == 2, right: itemStyle() && itemStyle().editorHorizontalAlignment == 1 }, click: focused\">\
	<input type=\"number\" class=\"numeric\" data-bind=\"numericEditor: $data, value: value, hasFocus: hasFocus(), attr: { disabled: !isEnabled(), placeholder: placeholderText }, event: { blur: blured }, css: { left: !itemStyle() || itemStyle().editorHorizontalAlignment == 0, center: itemStyle() && itemStyle().editorHorizontalAlignment == 2, right: itemStyle() && itemStyle().editorHorizontalAlignment == 1}, style: {color: isEnabled() ? Resco.UI.DetailView.ItemForeground : Resco.UI.DetailView.ItemDisabled}\">\
	<!-- ko if: errorMessage() --><span class=\"exclamation\" data-bind=\"attr: { title: errorMessage() }\">!</span><!-- /ko -->\
</div>");

	Resco.Controls.KOEngine.instance.addTemplate("tmplDetailItemCombo", "<div class=\"editor\" data-bind=\"css: { invalid: errorMessage(), top: itemStyle() && itemStyle().labelPosition == 1, hidden: itemStyle() && itemStyle().labelPosition == 3 }\">\
	<!-- ko if: isRadio() -->\
		<div style=\"display: flex; flex-direction: row; width: 100%\">\
		<!-- ko foreach: listDataSource() -->\
			<div class=\"radioButton\" data-bind=\"text: $data && $parent.displayMember ? $data[$parent.displayMember] : $data, css: { selected: $index() === $parent.selectedRadioIndex() }, click: $parent.selectRadioItem.call($parent, $data) \"/>\
		<!-- /ko -->\
		</div>\
	<!-- /ko -->\
	<!-- ko if: !isRadio() -->\
		<!-- ko if: valueMember -->\
			<select class=\"combo\" data-bind=\"options: listDataSource, hasFocus: hasFocus(), optionsText: displayMember, optionsValue: valueMember, value: value, valueAllowUnset: true, attr: { disabled: !isEnabled() }, css: {left: !itemStyle() || itemStyle().editorHorizontalAlignment == 0, center: itemStyle() && itemStyle().editorHorizontalAlignment == 2, right: itemStyle() && itemStyle().editorHorizontalAlignment == 1}, style: {color: isEnabled() ? Resco.UI.DetailView.ItemForeground : Resco.UI.DetailView.ItemDisabled}\" />\
		<!-- /ko -->\
		<!-- ko if: !valueMember -->\
			<select class=\"combo\" data-bind=\"options: listDataSource, hasFocus: hasFocus(), optionsText: displayMember, value: value, valueAllowUnset: true, attr: { disabled: !isEnabled() }, css: {left: !itemStyle() || itemStyle().editorHorizontalAlignment == 0, center: itemStyle() && itemStyle().editorHorizontalAlignment == 2, right: itemStyle() && itemStyle().editorHorizontalAlignment == 1}, style: {color: isEnabled() ? Resco.UI.DetailView.ItemForeground : Resco.UI.DetailView.ItemDisabled}\" />\
		<!-- /ko -->\
		<!-- ko if: errorMessage() --><span class=\"exclamation\" data-bind=\"attr: { title: errorMessage() }\">!</span><!-- /ko -->\
	<!-- /ko -->\
</div>");

	Resco.Controls.KOEngine.instance.addTemplate("tmplDetailItemCheckBox", "<div class=\"editor\" data-bind=\"css: { invalid: errorMessage(), top: itemStyle() && itemStyle().labelPosition == 1, hidden: itemStyle() && itemStyle().labelPosition == 3, left: !itemStyle() || itemStyle().editorHorizontalAlignment == 0, center: itemStyle() && itemStyle().editorHorizontalAlignment == 2, right: itemStyle() && itemStyle().editorHorizontalAlignment == 1 }, style: {color: isEnabled() ? Resco.UI.DetailView.ItemForeground : Resco.UI.DetailView.ItemDisabled}\"><input class=\"checkbox\" type=\"checkbox\" data-bind=\"checked: value, hasFocus: hasFocus(), attr: { disabled: !isEnabled() }\" />\
	<!-- ko if: value() --><span data-bind=\"text: textChecked\" /><!-- /ko -->\
	<!-- ko if: value() != null && value() != undefined && !value() --><span data-bind=\"text: textUnchecked\" /><!-- /ko -->\
	<!-- ko if: errorMessage() --><span class=\"exclamation\" data-bind=\"attr: { title: errorMessage() }\">!</span><!-- /ko -->\
</div>");

	Resco.Controls.KOEngine.instance.addTemplate("tmplDetailItemDateTime", "<div class=\"editor\" data-bind=\"css: { invalid: errorMessage(), top: itemStyle() && itemStyle().labelPosition == 1, hidden: itemStyle() && itemStyle().labelPosition == 3 }\">\
	<input class=\"datetime\" type=\"text\" readonly=\"true\" data-bind=\"datetimepicker: $data, attr: { disabled: !isEnabled() }, css: { left: !itemStyle() || itemStyle().editorHorizontalAlignment == 0, center: itemStyle() && itemStyle().editorHorizontalAlignment == 2, right: itemStyle() && itemStyle().editorHorizontalAlignment == 1}, style: {color: isEnabled() ? Resco.UI.DetailView.ItemForeground : Resco.UI.DetailView.ItemDisabled}\" />\
	<input type=\"hidden\" />\
	<!-- ko if: errorMessage() --><span class=\"exclamation\" data-bind=\"attr: { title: errorMessage() }\">!</span><!-- /ko -->\
</div>");

	Resco.Controls.KOEngine.instance.addTemplate("tmplDetailItemImage", "<div class=\"editor\" data-bind=\"css: { invalid: errorMessage(), top: itemStyle() && itemStyle().labelPosition == 1, hidden: itemStyle() && itemStyle().labelPosition == 3, left: !itemStyle() || itemStyle().editorHorizontalAlignment == 0, center: itemStyle() && itemStyle().editorHorizontalAlignment == 2, right: itemStyle() && itemStyle().editorHorizontalAlignment == 1 }, style: {color: isEnabled() ? Resco.UI.DetailView.ItemForeground : Resco.UI.DetailView.ItemDisabled}\">\
	<!-- ko if: imgSource() --><img style=\"max-width: 100%\" data-bind=\"attr: { src: imgSource() }, click: imageClicked\" /><!-- /ko -->\
	<!-- ko if: errorMessage() --><span class=\"exclamation\" data-bind=\"attr: { title: errorMessage() }\">!</span><!-- /ko -->\
</div>");

	Resco.Controls.KOEngine.instance.addCustomBinding("detailItemTemplateSelector", function (element, valueAccessor, allBindings, viewModel, bindingContext) {
		var item = valueAccessor();
		var itemUnwrapped = ko.utils.unwrapObservable(valueAccessor())

		if (itemUnwrapped) {
			if (itemUnwrapped.itemType === Resco.UI.DetailItemType.Text) {
				ko.renderTemplate("tmplDetailItemText", item, { templateEngine: ko.nativeTemplateEngine.instance }, element, "replaceNode");
			}
			else if (itemUnwrapped.itemType === Resco.UI.DetailItemType.Numeric) {
				ko.renderTemplate("tmplDetailItemNumeric", item, { templateEngine: ko.nativeTemplateEngine.instance }, element, "replaceNode");
			}
			else if (itemUnwrapped.itemType === Resco.UI.DetailItemType.Link) {
				ko.renderTemplate("tmplDetailItemLink", item, { templateEngine: ko.nativeTemplateEngine.instance }, element, "replaceNode");
			}
			else if (itemUnwrapped.itemType === Resco.UI.DetailItemType.Combo) {
				ko.renderTemplate("tmplDetailItemCombo", item, { templateEngine: ko.nativeTemplateEngine.instance }, element, "replaceNode");
			}
			else if (itemUnwrapped.itemType === Resco.UI.DetailItemType.CheckBox) {
				ko.renderTemplate("tmplDetailItemCheckBox", item, { templateEngine: ko.nativeTemplateEngine.instance }, element, "replaceNode");
			}
			else if (itemUnwrapped.itemType === Resco.UI.DetailItemType.DateTime) {
				ko.renderTemplate("tmplDetailItemDateTime", item, { templateEngine: ko.nativeTemplateEngine.instance }, element, "replaceNode");
			}
			else if (itemUnwrapped.itemType === Resco.UI.DetailItemType.Image) {
				ko.renderTemplate("tmplDetailItemImage", item, { templateEngine: ko.nativeTemplateEngine.instance }, element, "replaceNode");
			}
		}
	});
}
