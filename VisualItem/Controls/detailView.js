var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Resco;
(function (Resco) {
    var UI;
    (function (UI) {
        var DetailView = /** @class */ (function () {
            function DetailView(form) {
                var _this = this;
                this.form = form;
                this.type = UI.ViewType.Detail;
                this.groups = ko.observableArray();
                this.items = new Array();
                this.itemChanged = new Resco.Event(this);
                this.itemValidating = new Resco.Event(this);
                this.resized = new Resco.Event(this);
                this.isSelected = ko.observable(false);
                this.isSelected.subscribe(function (nv) {
                    _this._showHideView(nv);
                }, this);
                this.isVisible = ko.observable(true);
                this.isEnabled = ko.observable(true);
                this.m_updateCounter = 0;
                this.m_size = new Resco.Size(-1, -1);
            }
            Object.defineProperty(DetailView.prototype, "layout", {
                get: function () {
                    if (!DetailView.s_layout) {
                        DetailView.s_layout = new UI.FlexiViewLayout(this);
                        DetailView.s_layout.height = UI.GridUnit.logical(-1);
                        DetailView.s_layout.isHeaderVisible = 2;
                    }
                    return DetailView.s_layout;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailView.prototype, "dataSource", {
                get: function () {
                    return this.m_dataSource;
                },
                set: function (value) {
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
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailView.prototype, "count", {
                get: function () {
                    return this.items ? this.items.length : 0;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailView.prototype, "domRoot", {
                get: function () {
                    return this.m_domRoot;
                },
                enumerable: true,
                configurable: true
            });
            DetailView.prototype.createItem = function (type) {
                var item;
                switch (type) {
                    case UI.DetailItemType.Text: {
                        item = new DetailItemTextBox(this);
                        break;
                    }
                    case UI.DetailItemType.Numeric: {
                        item = new DetailItemNumeric(this);
                        break;
                    }
                    case UI.DetailItemType.Link: {
                        item = new DetailItemLink(this);
                        break;
                    }
                    case UI.DetailItemType.Combo: {
                        item = new DetailItemComboBox(this);
                        break;
                    }
                    case UI.DetailItemType.CheckBox: {
                        item = new DetailItemCheckBox(this);
                        break;
                    }
                    case UI.DetailItemType.DateTime: {
                        item = new DetailItemDateTime(this);
                        break;
                    }
                    case UI.DetailItemType.Separator: {
                        item = new DetailItemSeparator(this);
                        break;
                    }
                    case UI.DetailItemType.Image:
                        item = new DetailItemImage(this);
                        break;
                    default: {
                        item = new DetailItem(this);
                        break;
                    }
                }
                return item;
            };
            DetailView.prototype.insertItem = function (index, item, itemStyle) {
                item.itemStyle(itemStyle);
                if (index < 0) {
                    this.items.push(item);
                }
                else {
                    this.items.splice(index, 0, item);
                }
                this.update();
                return index;
            };
            DetailView.prototype.removeItem = function (index) {
                if (index >= 0 && index < this.items.length) {
                    this.items.splice(index, 1);
                }
                this.update();
            };
            DetailView.prototype.startEditItem = function (index) {
                this.items.filter(function (item) { return item.hasFocus(); }).forEach(function (item) { return item.hasFocus(false); });
                var item = this.getItem(index);
                if (item)
                    item.hasFocus(true);
            };
            DetailView.prototype.clearContents = function () {
            };
            DetailView.prototype._clearDataSource = function () {
                if (this.m_dataSource) {
                    var notifySource = null;
                    if (Resco.isINotifyPropertyChanged(this.m_dataSource)) {
                        this.m_dataSource.propertyChanged.remove(this, this._dataSourcePropertyChanged);
                    }
                    this.m_dataSource = null;
                    this.clearContents();
                }
            };
            DetailView.prototype._dataSourcePropertyChanged = function (sender, e) {
                for (var i = 0; i < this.items.length; i++) {
                    var item = this.items[i];
                    if ((item.dataMember && item.dataMember === e.propertyName) || (item.name && item.name === e.propertyName)) {
                        this._updateItem(item);
                        break;
                    }
                }
            };
            DetailView.prototype._updateItem = function (item) {
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
            };
            DetailView.prototype._updateItems = function () {
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
            };
            DetailView.prototype.getItem = function (index) {
                if (index >= 0 && index < this.items.length) {
                    return this.items[index];
                }
                return null;
            };
            DetailView.prototype.findItem = function (name) {
                for (var i = 0; i < this.items.length; i++) {
                    if (this.items[i].name === name) {
                        return this.items[i];
                    }
                }
                return null;
            };
            DetailView.prototype.setupGroups = function (groupCounts) {
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
                        var item = this.createItem(UI.DetailItemType.Separator);
                        item.name = "-";
                        this.insertItem(index, item, null);
                        count++;
                        index++;
                    }
                }
                this.update(true);
            };
            DetailView.prototype.beginUpdate = function () {
                this.m_updateCounter++;
            };
            DetailView.prototype.endUpdate = function () {
                this.m_updateCounter--;
                this.update();
            };
            DetailView.prototype.update = function (force) {
                if (force || this.m_updateCounter == 0) {
                    var nextGroupAmount = 0;
                    var groups = this.groups();
                    var actualGroup = new Array();
                    groups.splice(0);
                    for (var i = 0; i < this.items.length; i++) {
                        if (this.items[i].itemType == UI.DetailItemType.Separator) {
                            if (actualGroup.length > 0) {
                                groups.push(actualGroup);
                                actualGroup = new Array();
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
            };
            DetailView.prototype._showHideView = function (show) {
                if (this.m_domRoot) {
                    if (show) {
                        $(this.m_domRoot).removeClass("hidden");
                    }
                    else {
                        $(this.m_domRoot).addClass("hidden");
                    }
                }
            };
            DetailView.prototype.onAppended = function (domRoot) {
                this.m_domRoot = domRoot;
                this.m_domContainer = $(".itemsContainer", this.m_domRoot)[0];
                //new ResizeSensor(this.m_domContainer, () => {
                //	this.onResize(new Resco.Size(this.m_domContainer.clientWidth, this.m_domContainer.clientHeight));
                //});
                this._showHideView(this.isSelected());
            };
            Object.defineProperty(DetailView.prototype, "documentSize", {
                get: function () {
                    return this.m_domContainer ? this.m_domContainer.scrollHeight : 100;
                },
                enumerable: true,
                configurable: true
            });
            DetailView.prototype.onResize = function (size) {
                var newW = size.width();
                var newH = size.height();
                var oldW = this.m_size.width();
                var oldH = this.m_size.height();
                if (oldW !== newW || oldH !== newH) {
                    this.m_size.width(newW);
                    this.m_size.height(newH);
                    this.resized.raise(new Resco.ResizeEventArgs(newW, newH, oldW, oldH));
                }
            };
            DetailView.prototype.getDesiredSize = function () {
                if (this.m_domRoot) {
                    var $dr = $(this.m_domRoot);
                    var h = 36 + this.items.length * 30; // just rough estimate
                    return new Resco.Size($dr.width(), h);
                }
                return null;
            };
            DetailView.as = function (obj) {
                if (obj instanceof DetailView) {
                    return obj;
                }
                return null;
            };
            //public JSBPropertyMap(): MobileCrm.UI.Web.JSBPropertyMapper[] {
            //	return [new MobileCrm.UI.Web.JSBPropertyMapper("isDirty"),
            //	new MobileCrm.UI.Web.JSBPropertyMapper("isEnabled"),
            //	new MobileCrm.UI.Web.JSBPropertyMapper("isVisible"),
            //	new MobileCrm.UI.Web.JSBPropertyMapper("name"),
            //	new MobileCrm.UI.Web.JSBPropertyMapper("items")];
            //}
            DetailView.prototype.JSBExplicitType = function () {
                return "MobileCRM.UI._DetailView";
            };
            return DetailView;
        }());
        UI.DetailView = DetailView;
        var DetailItem = /** @class */ (function () {
            function DetailItem(parent) {
                var _this = this;
                this.m_parent = parent;
                this.placeholderText = ko.observable();
                this.errorMessage = ko.observable();
                this.itemIsEnabled = ko.observable(true);
                this.isVisible = ko.observable(true);
                this.isVisible.subscribe(function (v) { return _this.m_parent.update(); });
                this.isEnabled = ko.computed(function () {
                    return _this.itemIsEnabled() && _this.m_parent.isEnabled();
                }, this);
                this.value = ko.observable();
                this.hasFocus = ko.observable(false);
                this.setValueChangeHandlers(true);
                this.name = "DetailItem";
                this.label = ko.observable("Label");
                this.itemType = UI.DetailItemType.Base;
                this.itemStyle = ko.observable();
                this.itemStyle.subscribe(function (style) {
                    _this.updateStyle(style);
                }, this);
                this.height = ko.observable(30);
                this.labelForeColor = ko.computed(function () {
                    var style = _this.itemStyle();
                    return style && (style.labelForeColor || style.labelForeColor === 0) ? style.labelForeColor.toRGBA() : DetailView.ItemLabelForeground;
                });
                this.backgroundColor = ko.computed(function () {
                    var style = _this.itemStyle();
                    return style && (style.backColor || style.backColor === 0) ? style.backColor.toRGBA() : DetailView.ItemBackground;
                });
            }
            DetailItem.prototype._valueChanging = function (oldValue) {
                this.m_oldValue = oldValue;
            };
            Object.defineProperty(DetailItem.prototype, "index", {
                get: function () {
                    if (this.m_parent) {
                        return this.m_parent.items.indexOf(this);
                    }
                    return -1;
                },
                enumerable: true,
                configurable: true
            });
            // virtual
            DetailItem.prototype._valueChanged = function (newValue) {
                var e = new UI.DetailViewItemValidatingArgs(this, newValue, this.m_oldValue);
                this.m_parent.itemValidating.raise(e);
                if (e.cancel) {
                    this.setValueChangeHandlers(false);
                    this.value(this.m_oldValue);
                    this.setValueChangeHandlers(true);
                }
                else if (newValue !== this.m_oldValue) {
                    this._setDataSourcePropertyValue(newValue);
                    this.m_parent.itemChanged.raise(new UI.DetailViewItemArgs(this));
                }
            };
            DetailItem.prototype._setDataSourcePropertyValue = function (value) {
                var ds = this.m_parent.dataSource;
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
            };
            DetailItem.prototype.setValueChangeHandlers = function (on) {
                var _this = this;
                if (on) {
                    if (!this.valueChangingSubscription) {
                        this.valueChangingSubscription = this.value.subscribe(function (oldValue) {
                            _this._valueChanging(oldValue);
                        }, this, "beforeChange");
                    }
                    if (!this.valueChangedSubscription) {
                        this.valueChangedSubscription = this.value.subscribe(function (newValue) {
                            _this._valueChanged(newValue);
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
            };
            DetailItem.prototype.updateStyle = function (style) {
                if (style) {
                    if (style.labelPosition == Resco.LabelPosition.Top) {
                        this.height(this.height() + 20);
                    }
                }
            };
            return DetailItem;
        }());
        UI.DetailItem = DetailItem;
        var DetailItemTextBox = /** @class */ (function (_super) {
            __extends(DetailItemTextBox, _super);
            function DetailItemTextBox(parent) {
                var _this = _super.call(this, parent) || this;
                _this.itemType = UI.DetailItemType.Text;
                _this.isPassword = false;
                _this.numberOfLines = 1;
                _this.maxLength = 100;
                return _this;
            }
            DetailItemTextBox.prototype.updateStyle = function (style) {
                if (style) {
                    this.height(style.isMultiLine ? 90 : 30);
                }
                _super.prototype.updateStyle.call(this, style);
            };
            return DetailItemTextBox;
        }(DetailItem));
        UI.DetailItemTextBox = DetailItemTextBox;
        var DetailItemNumeric = /** @class */ (function (_super) {
            __extends(DetailItemNumeric, _super);
            function DetailItemNumeric(parent) {
                var _this = _super.call(this, parent) || this;
                //this.m_displayValueSubscription = this.displayValue.subscribe(this._parseDisplayValue, this);
                _this.itemType = UI.DetailItemType.Numeric;
                _this.minimum = 0;
                _this.increment = 1;
                _this.decimalPlaces = ko.observable(2);
                _this.displayFormat = ko.observable();
                _this.isFocused = ko.observable(false);
                _this.displayValue = ko.computed(function () {
                    var val = _this.value();
                    if (!val && val !== 0) {
                        return "";
                    }
                    return _this.displayFormat() ? Resco.formatString(_this.displayFormat(), [_this.value()]) : _this.value();
                }, _this);
                _this.upDownVisible = true;
                return _this;
            }
            DetailItemNumeric.prototype._valueChanged = function (newValue) {
                newValue = this.validateNumber(newValue);
                if (newValue !== this.value()) { // two NaN values does not equal :D, so the first condition is not true if both are NaN
                    this.setValueChangeHandlers(false);
                    this.value(newValue);
                    this.setValueChangeHandlers(true);
                }
                _super.prototype._valueChanged.call(this, newValue);
            };
            DetailItemNumeric.prototype.validateNumber = function (strValue) {
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
            };
            DetailItemNumeric.prototype.focused = function () {
                if (!this.isFocused() && this.isEnabled()) {
                    this.isFocused(true);
                }
            };
            DetailItemNumeric.prototype.blured = function () {
                this.isFocused(false);
            };
            return DetailItemNumeric;
        }(DetailItem));
        UI.DetailItemNumeric = DetailItemNumeric;
        var DetailItemLink = /** @class */ (function (_super) {
            __extends(DetailItemLink, _super);
            //private m_dropDownDialog: DetailItemLinkPopup;
            function DetailItemLink(parent) {
                var _this = _super.call(this, parent) || this;
                _this.itemType = UI.DetailItemType.Link;
                _this.linkLabel = ko.observable();
                _this.popupOpened = new Resco.Event(_this);
                _this.textChanged = new Resco.Event(_this);
                _this.isPopupVisible = ko.observable(false);
                _this.showDropDownIcon = true;
                //this.m_dropDownDialog = new DetailItemLinkPopup(this, this.m_parent);
                _this.buttonLabel = ko.computed(function () {
                    return _this.isPopupVisible() ? "..." : "▾";
                }, _this);
                return _this;
            }
            Object.defineProperty(DetailItemLink.prototype, "handler", {
                get: function () {
                    return this.m_handler;
                },
                set: function (value) {
                    if (value != this.m_handler) {
                        this.m_handler = value;
                        this.m_handler.linkItem = this;
                        this.linkLabel(this.handler.formatValue(this.value()));
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DetailItemLink.prototype, "bindingList", {
                get: function () {
                    var val = this.value();
                    if (val && Resco.BindingList.as(val)) {
                        return val;
                    }
                    return null;
                },
                enumerable: true,
                configurable: true
            });
            DetailItemLink.prototype.linkClicked = function (textClicked) {
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
            };
            DetailItemLink.prototype.closeClicked = function () {
                this.endEdit();
            };
            DetailItemLink.prototype.beginEdit = function () {
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
            };
            //private m_listView: ListView;
            //get listView(): ListView {
            //	return this.m_listView;
            //}
            DetailItemLink.prototype.endEdit = function () {
                //if (this.m_listView) {
                //	this.popupOpened.raise(new Resco.UI.LinkItemPopupArgs(this.m_listView, false));
                //	this.m_listView.filterChanged.remove(this, this._listViewFitlerChanged);
                //	this.m_listView = null;
                //	$('html').off({ click: this.m_outsideClickHandler });
                //	this.isPopupVisible(false);
                //	this.m_dropDownDialog.close();
                //}
            };
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
            DetailItemLink.prototype._valueChanged = function (newValue) {
                this.updateLabel(newValue);
                _super.prototype._valueChanged.call(this, newValue);
            };
            DetailItemLink.prototype.updateLabel = function (value) {
                this.linkLabel(this.handler ? this.handler.formatValue(value !== undefined ? value : this.value()) : "");
            };
            DetailItemLink.prototype.removePart = function (index) {
                //this.m_bKeepPopupOpened = true;
                if (index < 0) {
                    this.value(null);
                    this.endEdit();
                }
                else if (this.bindingList) {
                    this.bindingList.removeAt(index);
                }
            };
            DetailItemLink.prototype.closePopup = function () {
                this.endEdit();
            };
            DetailItemLink.prototype.listViewAppended = function (domRoot) {
                //this.m_listView.onAppended(domRoot);
                //this.m_listView.onResize(new Resco.Size(-1, -1));
                //this.m_listView.focusFilter();
            };
            DetailItemLink.as = function (obj) {
                if (obj instanceof DetailItemLink) {
                    return obj;
                }
                return null;
            };
            return DetailItemLink;
        }(DetailItem));
        UI.DetailItemLink = DetailItemLink;
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
        var DetailItemComboBox = /** @class */ (function (_super) {
            __extends(DetailItemComboBox, _super);
            function DetailItemComboBox(parent) {
                var _this = _super.call(this, parent) || this;
                _this.listDataSource = ko.observableArray();
                _this.itemType = UI.DetailItemType.Combo;
                _this.displayMember = "";
                _this.valueMember = "";
                _this.isRadio = ko.computed(function () {
                    return _this.listDataSource() && _this.listDataSource().length > 0 && _this.itemStyle() && _this.itemStyle().radioButtonMaxCount >= _this.listDataSource().length;
                }, _this);
                _this.selectedRadioIndex = ko.observable(0);
                _this.value.subscribe(function (newValue) {
                    var index = _this.listDataSource().findIndex(function (item) { return _this.valueMember && item ? item[_this.valueMember] === newValue : item === newValue; });
                    _this.selectedRadioIndex(index);
                }, _this);
                return _this;
            }
            DetailItemComboBox.prototype.selectRadioItem = function (newValue) {
                this.value(this.valueMember ? newValue[this.valueMember] : newValue);
            };
            DetailItemComboBox.as = function (obj) {
                if (obj instanceof DetailItemComboBox) {
                    return obj;
                }
                return null;
            };
            return DetailItemComboBox;
        }(DetailItem));
        UI.DetailItemComboBox = DetailItemComboBox;
        var DetailItemCheckBox = /** @class */ (function (_super) {
            __extends(DetailItemCheckBox, _super);
            function DetailItemCheckBox(parent) {
                var _this = _super.call(this, parent) || this;
                _this.itemType = UI.DetailItemType.CheckBox;
                _this.textChecked = "";
                _this.textUnchecked = "";
                return _this;
            }
            return DetailItemCheckBox;
        }(DetailItem));
        UI.DetailItemCheckBox = DetailItemCheckBox;
        // TODO: consider using date.js sdk for date manipulation
        var DetailItemDateTime = /** @class */ (function (_super) {
            __extends(DetailItemDateTime, _super);
            function DetailItemDateTime(parent) {
                var _this = _super.call(this, parent) || this;
                _this.itemType = UI.DetailItemType.DateTime;
                return _this;
            }
            Object.defineProperty(DetailItemDateTime.prototype, "displayFormat", {
                /*get format(): string {
                    return this.dateParts && this.dateParts == ItemDateTimeParts.Date ? "yy-mm-dd" : "yy-mm-dd HH:II:ss";
                }*/
                get: function () {
                    return this.dateParts && this.dateParts == UI.ItemDateTimeParts.Date ? "m/d/yy" : "m/d/yy - H:II";
                },
                enumerable: true,
                configurable: true
            });
            DetailItemDateTime.prototype.init = function (element) {
                var _this = this;
                this.m_element = element;
                //this.m_altField = $(element).next()[0];
                $(element).datepicker({
                    onSelect: function (dateText, inst) { return _this._toDate(dateText); },
                    dateFormat: this.displayFormat,
                    //altField: $(this.m_altField),
                    //altFormat: this.format,
                    showButtonPanel: true,
                });
                $(element).datepicker("setDate", this.value());
            };
            DetailItemDateTime.prototype._toDate = function (dateText) {
                //dateText = $(this.m_altField).val();
                var date = $.datepicker.parseDate(this.displayFormat, dateText); // Somehow time is not set for altField, but it is set in dateText (??? bug in jquery.datepicker?). I FIXED THIS in jquery.ui.datepicker.js
                this.m_skipSettingControlValue = true;
                this._valueChanged(date);
                this.m_skipSettingControlValue = false;
            };
            DetailItemDateTime.prototype._valueChanged = function (newValue) {
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
                _super.prototype._valueChanged.call(this, newValue);
            };
            DetailItemDateTime.prototype.dateEquals = function (d1, d2) {
                return (d1 !== null && d1 !== undefined && d2 !== null && d2 !== undefined) && d1.getTime() == d2.getTime() || (!d1 && !d2);
            };
            DetailItemDateTime.prototype.validateDate = function (date) {
                // TODO: Advantage does not support minimum and maximum for date?
                return date;
            };
            return DetailItemDateTime;
        }(DetailItem));
        UI.DetailItemDateTime = DetailItemDateTime;
        var DetailItemImage = /** @class */ (function (_super) {
            __extends(DetailItemImage, _super);
            function DetailItemImage(parent) {
                var _this = _super.call(this, parent) || this;
                _this.itemType = UI.DetailItemType.Image;
                _this.imageClick = new Resco.Event(_this);
                _this.imgSource = ko.observable();
                return _this;
            }
            DetailItemImage.prototype._valueChanged = function (newValue) {
                var imgData = this._getData(newValue);
                if (imgData)
                    this.imgSource(imgData);
                _super.prototype._valueChanged.call(this, newValue);
            };
            DetailItemImage.prototype._getData = function (value) {
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
            };
            DetailItemImage.prototype.imageClicked = function () {
                this.imageClick.raise(Resco.EventArgs.Empty, this);
            };
            DetailItemImage.prototype.refresh = function () {
            };
            return DetailItemImage;
        }(DetailItem));
        UI.DetailItemImage = DetailItemImage;
        var DetailItemIFrame = /** @class */ (function (_super) {
            __extends(DetailItemIFrame, _super);
            function DetailItemIFrame() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return DetailItemIFrame;
        }(DetailItem));
        UI.DetailItemIFrame = DetailItemIFrame;
        var DetailItemSeparator = /** @class */ (function (_super) {
            __extends(DetailItemSeparator, _super);
            function DetailItemSeparator(parent) {
                var _this = _super.call(this, parent) || this;
                _this.itemType = UI.DetailItemType.Separator;
                _this.label("");
                return _this;
            }
            return DetailItemSeparator;
        }(DetailItem));
        UI.DetailItemSeparator = DetailItemSeparator;
        var DetailViewItemStyle = /** @class */ (function () {
            function DetailViewItemStyle() {
            }
            DetailViewItemStyle.prototype.clone = function () {
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
            };
            return DetailViewItemStyle;
        }());
        UI.DetailViewItemStyle = DetailViewItemStyle;
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
            var itemUnwrapped = ko.utils.unwrapObservable(valueAccessor());
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
    })(UI = Resco.UI || (Resco.UI = {}));
})(Resco || (Resco = {}));
//# sourceMappingURL=detailView.js.map