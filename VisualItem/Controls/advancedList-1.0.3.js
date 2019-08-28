///<reference path="..\Libraries\jquery.d.ts" />
///<reference path="..\Libraries\knockout.d.ts" />
///<reference path="..\Libraries\perfect-scrollbar.d.ts" />
///<reference path="..\Helpers\bindingList.ts" />
///<reference path="..\Helpers\common.ts" />
///<reference path="event.ts" />
///<reference path="IView.ts" />
///<reference path="FilterGroup.ts" />
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
        var AdvancedList = /** @class */ (function () {
            function AdvancedList() {
                var _this = this;
                this._timeoutID = null;
                this.m_lastScroll = 0;
                this.rows = new Array();
                this.rowsActiveTemplateIndexSubs = new Array();
                this.stretchRows = true;
                this.templates = new Array();
                this.templateIndex = ko.observable(0);
                this.selectedTemplateIndex = ko.observable(1);
                this.selectedIndex = -1;
                this.orientation = UI.ListOrientation.Vertical;
                this.linesCount = 1;
                this.autoSelect = true;
                this.delayLoad = true;
                this.delayLoadCoeficient = 1;
                this.delayLoadBuffer = 0;
                this.fixedTemplateHeight = undefined;
                this.m_columnDefinitions = new Array();
                this.bounds = new Resco.Rectangle(0, 0, -1, -1);
                //this.m_contentHeight = 0;
                this.m_contentWidth = 0;
                this.m_columnWidth = 0;
                this.m_useExternalScrollbar = false;
                this.m_bHasHorizontalScrollbar = ko.observable(false);
                this.m_bHasHorizontalScrollbar.subscribe(function (visible) {
                    if (_this.m_domRoot) {
                        var scrollBarHeight = visible ? 17 : -17; // TODO: get scrollbar Height
                        var oldHeight = _this.m_domRoot.height();
                        var h = _this.m_domRoot.height() + scrollBarHeight;
                        _this.m_domRoot.height(h);
                        _this.m_domListRows.height(h);
                        //this.resized.raise(new Resco.ResizeEventArgs(-1, h, -1, oldHeight), this);
                    }
                }, this);
                this.isSelected = ko.observable(true);
                this.isSelected.subscribe(function (nv) {
                    _this._showHideView(nv);
                }, this);
                this.cellClick = new Resco.Event(this);
                this.rowClick = new Resco.Event(this);
                this.rowDblClick = new Resco.Event(this);
                this.innerRowClick = new Resco.Event(this);
                this.buttonClick = new Resco.Event(this);
                this.filterChanged = new Resco.Event(this);
                this.moreDataNeeded = new Resco.Event(this);
                this.listScroll = new Resco.Event(this);
                this.resized = new Resco.Event(this);
                this.rowInserted = new Resco.Event(this);
                this.delayLoadCompleted = new Resco.Event(this);
                this.selectedIndexChanged = new Resco.Event(this);
                this.loadComplete = ko.observable(true);
                this.loadComplete.subscribe(function (value) {
                    _this._showLoading(!value);
                }, this);
                this.caption = ko.observable();
                this.isVisible = ko.observable(true);
                this.isFilterVisible = ko.observable(true);
                this.isFilterVisible.subscribe(function (value) {
                    _this._update();
                }, this);
                this.emptyFilterText = ko.observable("Search...");
                this.m_filterText = "";
                this.filterTextObs = ko.observable("");
                this.filterTextObs.subscribe(function (text) {
                    _this.m_filterText = text;
                    _this.filterChanged.raise(new UI.FilterChangedEventArgs(1 /* TextChanging */));
                }, this);
                this.filterGroup = ko.observable();
            }
            Object.defineProperty(AdvancedList.prototype, "filterText", {
                get: function () {
                    return this.m_filterText;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AdvancedList.prototype, "minHeigth", {
                get: function () {
                    return this.m_minHeight;
                },
                set: function (value) {
                    if (this.m_minHeight !== value) {
                        this.m_minHeight = value;
                        this._setMinHeight();
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AdvancedList.prototype, "htmlRoot", {
                get: function () {
                    return this.m_domRoot ? this.m_domRoot : null;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AdvancedList.prototype, "selectedIndex", {
                get: function () {
                    return this.m_selectedIndex;
                },
                set: function (index) {
                    if (index >= this.rows.length) {
                        this._loadData(this._toIndexPredicate, index);
                    }
                    var oldIndex = this.m_selectedIndex;
                    this.m_selectedIndex = index;
                    if (this.m_selectedIndex < this.rows.length) {
                        this._selectRow(index < 0 ? null : this.rows[index]);
                    }
                    if (this.selectedIndexChanged) {
                        this.selectedIndexChanged.raise(new SelectedIndexChangedEventArgs(index, oldIndex), this);
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AdvancedList.prototype, "isSearchBoxVisible", {
                get: function () {
                    if (this.m_bIsSearchBoxVisible === undefined) {
                        return this.isFilterVisible() && this.orientation == UI.ListOrientation.Vertical;
                    }
                    return this.m_bIsSearchBoxVisible;
                },
                set: function (value) {
                    this.m_bIsSearchBoxVisible = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AdvancedList.prototype, "dataSource", {
                get: function () {
                    return this.m_dataSource;
                },
                set: function (ds) {
                    if (ds != this.m_dataSource) {
                        this.reset();
                        if (this.m_dataSource != null) {
                            this._removeHandlers();
                        }
                        this.m_dataSource = ds;
                        this._addHandlers();
                        this._loadData(this._sizePredicate, this.delayLoadBuffer);
                    }
                },
                enumerable: true,
                configurable: true
            });
            AdvancedList.prototype._addHandlers = function () {
                var ds = this.m_dataSource;
                // unable to check if ds is instanceof interface => check if it is instance of all classes, that implemets it
                if (Resco.isINotifyListChanged(ds)) {
                    ds.listChanged.add(this, this._dataSourceListChanged, true);
                }
                if (Resco.isIAsyncEnumerable(ds)) {
                    var asyncds = ds;
                    asyncds.canMoveNext.add(this, this._dataSourceCanMoveNext);
                    asyncds.queryCompleted.add(this, this._dataSourceQueryCompleted);
                }
            };
            AdvancedList.prototype._removeHandlers = function () {
                var ds = this.m_dataSource;
                // unable to check if ds is instanceof interface => check if it is instance of all classes, that implemets it
                if (Resco.isINotifyListChanged(ds)) {
                    ds.listChanged.remove(this, this._dataSourceListChanged);
                }
                if (Resco.isIAsyncEnumerable(ds)) {
                    var asyncds = ds;
                    asyncds.canMoveNext.remove(this, this._dataSourceCanMoveNext);
                    asyncds.queryCompleted.remove(this, this._dataSourceQueryCompleted);
                }
            };
            AdvancedList.prototype._dataSourceCanMoveNext = function (sender, args) {
                //if (this.m_enumerator.moveNext()) {//this.m_enumerator.current) {
                //    this._addRow(this.m_enumerator.current, this.rows.length);
                //}
                // request next item
                this._loadData(this._sizePredicate, this.delayLoadBuffer);
            };
            AdvancedList.prototype._dataSourceQueryCompleted = function (sender, args) {
                this.loadComplete(true);
            };
            AdvancedList.prototype._dataSourceListChanged = function (sender, e) {
                if (e.listChangedType == Resco.ListChangedType.Reset) {
                    this.reset();
                    this._loadData(this._sizePredicate, this.delayLoadBuffer);
                }
                else if (e.listChangedType == Resco.ListChangedType.ItemDeleted) {
                    if (this.m_domListRows && e.oldIndex < this.rows.length) {
                        this._removeRow(e.oldIndex);
                        this._loadData(this._sizePredicate, this.delayLoadBuffer); // always have more items than the Height of content area, so it is possible to scroll if necessary
                    }
                }
                else if (e.listChangedType == Resco.ListChangedType.ItemAdded) {
                    if (this.m_domListRows && e.newIndex <= this.rows.length && this.m_dataSource) {
                        var row = this._addRow(e.item, e.newIndex);
                        if (this.m_enumerator) {
                            this.m_enumerator.moveNext();
                        }
                    }
                }
                if (this._verticalPredicate(null)) {
                    this.moreDataNeeded.raise(Resco.EventArgs.Empty, this);
                }
            };
            AdvancedList.prototype._addRow = function (data, index) {
                var _this = this;
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
                if (this.orientation == UI.ListOrientation.Vertical) {
                    this._updateContentHeight(this._getRowHeight(row));
                }
                else {
                    // find column for new row
                    var prevRow = index > 0 ? this.rows[index - 1] : null;
                    var column = prevRow ? prevRow.column : 0;
                    this._updateColumns(row.column);
                }
                // if templateIndex of the row changes, update the DOM (change template)
                var subscription = row.activeTemplateIndex.subscribe(function (value) {
                    _this._updateTemplate(row);
                });
                // store subscription to index changed handler, so it can be disposed, when te row is removed from the list
                this.rowsActiveTemplateIndexSubs.splice(index, 0, subscription);
                return row;
            };
            AdvancedList.prototype._removeRow = function (index) {
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
                if (this.orientation == UI.ListOrientation.Vertical) {
                    this._updateContentHeight(-this._getRowHeight(row));
                }
                else {
                    // find column for new row
                    this._updateColumns(row.column - 1);
                }
                if (Resco.isINotifyPropertyChanged(row.data)) {
                    row.data.propertyChanged.remove(this, this._onRowPropertyChanged);
                }
            };
            AdvancedList.prototype.loadUntilEnd = function () {
                this._loadData(function (data) { return true; }, null);
            };
            AdvancedList.prototype._loadData = function (predicate, context) {
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
                    var raiseDelayLoadComplete = false;
                    var oldRowsLength = this.rows.length;
                    var predicateResult = predicate.call(this, context);
                    while (predicateResult) {
                        if (this.m_enumerator.moveNext()) {
                            if (this.m_enumerator.current) {
                                this._addRow(this.m_enumerator.current, this.rows.length);
                                raiseDelayLoadComplete = true;
                            }
                            else {
                                result = true; // there is another item, but it is not available at this moment. wait for MoveNextCompleted event and then continue loading 
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
                    var hasMoreData = result && !predicateResult;
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
            };
            AdvancedList.prototype._setMinHeight = function () {
                if (this.m_minHeight > 0) {
                    if (this.m_domRoot)
                        this.m_domRoot.css("minHeight", this.m_minHeight + "px");
                    if (this.$loadingArea)
                        this.$loadingArea.css("minHeight", this.m_minHeight + "px");
                }
            };
            Object.defineProperty(AdvancedList.prototype, "useExternalScrollbar", {
                //private _isDesktop(): boolean {
                //	var check = true;
                //	(function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = false; })(navigator.userAgent || navigator.vendor || (<any>window).opera);
                //	return check;
                //}
                get: function () {
                    return this.m_useExternalScrollbar;
                },
                set: function (value) {
                    this.m_useExternalScrollbar = value;
                },
                enumerable: true,
                configurable: true
            });
            // activate perfect scrollbar + set z-index to 1
            AdvancedList.prototype._activatePerfectScrollbar = function () {
                if (this.m_domListRows && (this.m_domListRows.length > 0)) {
                    this.m_perfectScrollbar = new PerfectScrollbar(this.m_domListRows[0], { suppressScrollX: (this.orientation == UI.ListOrientation.Vertical) });
                    $(".ps__rail-y", this.m_domListRows).css("zIndex", 1);
                    $(".ps__rail-x", this.m_domListRows).css("zIndex", 1);
                }
            };
            AdvancedList.prototype._deactivatePerfectScrollbar = function () {
                if (this.m_perfectScrollbar) {
                    this.m_perfectScrollbar.destroy();
                    this.m_perfectScrollbar = undefined;
                }
            };
            AdvancedList.prototype.onAppended = function (domRoot) {
                this.m_domRoot = $(domRoot);
                this.m_domListRows = $(".listRows", domRoot);
                this.m_domFilter = $(".searchBoxContainer", domRoot);
                this.m_domSearchInput = $(".searchBox", domRoot);
                this._setMinHeight();
                if (this.useExternalScrollbar) {
                    this._activatePerfectScrollbar();
                }
                this._showHideView(this.isSelected());
            };
            // for appending list to html document without using the Knockout library
            AdvancedList.prototype.create = function (domParent) {
                var _this = this;
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
                this.m_domListRows.scroll(function (eventObject) { return _this.listScrolled(eventObject, eventObject); });
                this.m_domSearchInput.on('change keyup paste', function (element) {
                    var value = _this.m_domSearchInput.val();
                    if (_this.m_filterText !== value) {
                        _this.m_filterText = value;
                        _this.filterChanged.raise(new UI.FilterChangedEventArgs(1 /* TextChanging */));
                    }
                });
            };
            AdvancedList.prototype.onResize = function (size) {
                this.bounds.width(size.width());
                this.bounds.height(size.height());
                this._update();
            };
            AdvancedList.prototype._update = function () {
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
                if (this.orientation == UI.ListOrientation.Horizontal) {
                    this._updateColumns(0);
                }
                this._loadData(this._sizePredicate, this.delayLoadBuffer);
                this._checkNeedScrollbar();
            };
            AdvancedList.prototype.getDesiredSize = function () {
                if (this.m_domRoot) {
                    var $dr = $(this.m_domRoot);
                    return new Resco.Size($dr.width(), $dr.height());
                }
                return null;
            };
            AdvancedList.prototype.reset = function (bKeepSelection) {
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
            };
            AdvancedList.prototype.updateList = function () {
                var asbl = Resco.AsyncBindingList.as(this.m_enumerator);
                if (asbl) {
                    asbl.update();
                }
                else {
                    this.reset(true);
                }
                this._loadData(this._sizePredicate, this.delayLoadBuffer);
            };
            AdvancedList.prototype.addTemplate = function (template, cloneIndex) {
                if (cloneIndex >= 0 && cloneIndex < this.templates.length) {
                    template = this.templates[cloneIndex].clone();
                }
                this.templates.push(template);
                return this.templates.length - 1;
            };
            AdvancedList.prototype.clearTemplates = function () {
                this.templates.splice(0);
            };
            AdvancedList.prototype._showHideView = function (show) {
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
            };
            AdvancedList.prototype._updateContentHeight = function (value) {
                //this.m_contentHeight += value;
                this._checkNeedScrollbar();
            };
            AdvancedList.prototype._updateContentWidth = function (value) {
                this.m_contentWidth += value;
                this._checkNeedScrollbar();
            };
            AdvancedList.prototype._checkNeedScrollbar = function () {
                var w = 0;
                if (this.bounds.width() >= 0) {
                    w = this.bounds.width();
                }
                else if (this.m_domRoot) {
                    w = this.m_domRoot.innerWidth();
                }
                this.m_bHasHorizontalScrollbar(this.m_contentWidth + this.m_columnWidth > w);
            };
            AdvancedList.prototype._updateTemplateIndexes = function (row) {
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
            };
            AdvancedList.prototype._rowClick = function (row) {
                var index = this.rows.indexOf(row);
                if (this.autoSelect) {
                    this._selectRow(row);
                    this.m_selectedIndex = index;
                }
                this.rowClick.raise(new RowClickedEventArgs(index, row.data), this);
                this._rowDblClick(index, row);
            };
            AdvancedList.prototype._rowDblClick = function (index, row) {
                var _this = this;
                if (!this._timeoutID) {
                    this._timeoutID = setTimeout(function () {
                        _this._timeoutID = null;
                    }, 300);
                }
                else {
                    clearTimeout(this._timeoutID);
                    this._timeoutID = null;
                    this.rowDblClick.raise(new RowClickedEventArgs(index, row.data), this);
                }
            };
            AdvancedList.prototype._innerRowClick = function (rowIndex, innerRowIndex) {
                var e = new UI.InnerRowClickEventArgs();
                e.innerRow = innerRowIndex;
                e.row = rowIndex;
                this.innerRowClick.raise(e, this);
            };
            AdvancedList.prototype._cellClick = function (row, cellIndex) {
                var rowIndex = this.rows.indexOf(row);
                var args = new UI.CellClickEventArgs(row, cellIndex, rowIndex, this.templates[row.activeTemplateIndex()].cellTemplates[cellIndex].dataMember);
                this.cellClick.raise(args, this);
                return args.cancelRowSelect;
            };
            AdvancedList.prototype._buttonClick = function (row, name) {
                this.buttonClick.raise(new ListButtonEventArgs(this.rows.indexOf(row), name), this);
            };
            AdvancedList.prototype._selectRow = function (row) {
                if (this.m_selectedRow != null) {
                    this.m_selectedRow.selected(false);
                }
                if (row) {
                    row.selected(true);
                }
                this.m_selectedRow = row;
            };
            AdvancedList.prototype._getRowHeight = function (row) {
                var templateIndex = row.activeTemplateIndex();
                if (templateIndex >= 0 && templateIndex < this.templates.length) {
                    return this.fixedTemplateHeight ? this.fixedTemplateHeight : this.templates[templateIndex].size.height();
                }
                return 0;
            };
            AdvancedList.prototype._getCellTextValue = function (item, cellTemplate) {
                var result = "";
                if (cellTemplate.constant) {
                    result = cellTemplate.dataMember;
                }
                else if (Resco.UI.isIListBindingItem(item)) {
                    var bindingItem = item;
                    result = bindingItem.getTextValue(cellTemplate.dataMember);
                }
                else {
                    result = item[cellTemplate.dataMember];
                }
                var style = cellTemplate.style;
                if (style && style.formatString) {
                    result = Resco.formatString(style.formatString, [result]);
                }
                return result;
            };
            AdvancedList.prototype._loadImage = function (row, cellTemplate, cellElement) {
                if (this.imageLoader) {
                    var style = cellTemplate.style;
                    var isImageQuery = false;
                    if (style.imageQuery) {
                        isImageQuery = true;
                    }
                    var imageValue = { imageData: "", placeHolder: "" };
                    if (!cellTemplate.constant && Resco.UI.isIListBindingItem(row.data)) {
                        var bindingItem = row.data;
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
            };
            AdvancedList.prototype.updateRowTemplate = function (index, row) {
                if (!row) {
                    row = index >= 0 && index < this.rows.length ? this.rows[index] : null;
                }
                if (row) {
                    this._updateTemplateIndexes(row);
                    this._updateTemplate(row);
                }
            };
            AdvancedList.prototype._updateTemplate = function (row) {
                var index = this.rows.indexOf(row);
                // only do this if row was created and added to list of rows
                if (index >= 0) {
                    // remove old template
                    row.$root.detach();
                    // create and append new template
                    this._insertRowToDOM(row, index, RowInsertedType.updated);
                    if (this.orientation == UI.ListOrientation.Vertical) {
                        // TODONOW: update contentHeight
                        //this._updateContentHeight(this._getRowHeight(row));
                    }
                    else {
                        this._updateColumns(row.column - 1);
                    }
                }
            };
            AdvancedList.prototype._insertRowToDOM = function (row, index, insertType) {
                if (insertType === void 0) { insertType = RowInsertedType.created; }
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
            };
            AdvancedList.prototype._updateColumns = function (column) {
                var _this = this;
                if (column < 0) {
                    column = 0;
                }
                var height = 0;
                var oldCol = column;
                var affectedRows = this.rows.filter(function (r) { return r.column >= column; });
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
                    var colRows = this.rows.filter(function (row) { return row.column == i; });
                    var maxWidth = 0;
                    colRows.forEach(function (row) {
                        var template = _this._getRowTemplate(row);
                        if (template.size.width() > maxWidth) {
                            maxWidth = template.size.width();
                        }
                    }, this);
                    colDef.left(i > 0 ? this.m_columnDefinitions[i - 1].left() + this.m_columnDefinitions[i - 1].width() : 0);
                    colDef.width(maxWidth);
                    colRows.forEach(function (r) { return r.$root.css({ left: colDef.left() + "px", width: colDef.width() }); });
                }
                if (this.useExternalScrollbar) {
                    if (this.m_perfectScrollbar) {
                        this.m_perfectScrollbar.update();
                    }
                }
            };
            AdvancedList.prototype._getRowTemplate = function (row) {
                return this.templates[row.activeTemplateIndex()];
            };
            AdvancedList.prototype._createRow = function (row, index) {
                var _this = this;
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
                    var $row = this._createListRowDOMObject(row, template);
                }
                else {
                    var $row = this._createRowDOMObject(row, template);
                }
                $root.append($row);
                var h = this.fixedTemplateHeight ? this.fixedTemplateHeight : template.size.height();
                $root.height(h + template.margin.top() + template.margin.height());
                // absolute positioning
                if (this.orientation == UI.ListOrientation.Horizontal) {
                    $root.css({ position: "absolute" }).addClass("horizontal");
                }
                $(".alRow", $root).not(".alListRow, .alInnerRow").click(function (event) {
                    if (!_this.m_handleTouch) {
                        _this._rowClick(row);
                    }
                });
                $(".alListRow .alInnerRow", $root).click(function (event) {
                    if (!_this.m_handleTouch) {
                        var listRow = $(event.target).closest(".alListRow");
                        var innerRow = $(event.target).closest(".alInnerRow");
                        var innerIndex = listRow.children().index(innerRow);
                        _this._innerRowClick(_this.rows.indexOf(row), innerIndex);
                    }
                });
                // TODO: optimize this. let advancedlist handle this in single handler (instead of handling it for each row, touch end can be turned of only if touchstart was fired, etc.)
                $(".alRow", $root).on({
                    "touchstart": function (event) {
                        var targetedALRow = $(event.currentTarget);
                        targetedALRow.on({
                            "touchend": function (event) {
                                //var x = event.originalEvent.changedTouches[0].pageX - window.pageXOffset;
                                //var y = event.originalEvent.changedTouches[0].pageY - window.pageYOffset;
                                //var target = document.elementFromPoint(x, y);
                                //if (!this.m_scrolled && ($(target).is(event.currentTarget) || $(target).parents().is(event.currentTarget))) {
                                _this._rowClick(row);
                                _this.m_handleTouch = true;
                                targetedALRow.off("touchmove");
                                targetedALRow.off("touchend");
                                //}
                            }
                        });
                        targetedALRow.on({
                            "touchmove": function (event) {
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
                $(".alCell", $root).not(".alListRow .alCell").click(function (event) {
                    var cell = $(event.target).closest(".alCell");
                    if (_this._cellClick(row, cell.index())) {
                        // cancel rowclick event
                        event.stopPropagation();
                    }
                });
                $(".buttonCell", $root).click(function (event) {
                    _this._buttonClick(row, $(event.target).data("buttonName"));
                });
                if (Resco.isINotifyPropertyChanged(row.data)) {
                    row.data.propertyChanged.add(this, this._onRowPropertyChanged, true);
                }
                row.$root = $root;
                return $root;
            };
            AdvancedList.prototype._createRowDOMObject = function (row, template, bForceWidth) {
                var _this = this;
                var h = this.fixedTemplateHeight ? this.fixedTemplateHeight : template.size.height();
                var $row = $("<div />").addClass("alRow").css("height", h + "px");
                if (this.orientation == UI.ListOrientation.Horizontal || bForceWidth) {
                    $row.css({ width: template.size.width() + "px" });
                }
                if (template.backgroundColor) {
                    $row.css({ background: template.backgroundColor });
                }
                $row.css({ marginLeft: template.margin.left() + "px", marginTop: template.margin.top() + "px", marginRight: template.margin.width() + "px", marginBottom: template.margin.height() + "px" });
                if (template.cellTemplates && template.cellTemplates.length > 0) {
                    template.cellTemplates.forEach(function (cellTemplate) { return $row.append(_this._createCellDOMObject(row, template, cellTemplate)); });
                }
                else if (template.htmlContent) {
                    var rowHtml = $(template.htmlContent);
                    $("*", rowHtml).not("img").each(function (index, element) {
                        var prop = $(element).data("bind");
                        if (row.data && prop && row.data[prop]) {
                            $(element).text(row.data[prop]);
                        }
                    });
                    $("img", rowHtml).each(function (index, element) {
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
            };
            AdvancedList.prototype._createListRowDOMObject = function (row, template) {
                var _this = this;
                var templateHeight = this.fixedTemplateHeight ? this.fixedTemplateHeight : template.size.height();
                var $root = $("<div />").addClass("alRow alListRow").css("height", templateHeight + "px");
                var innerTemplate = this.templates[template.templateIndex];
                var left = 0;
                var list = row.data[template.dataMember];
                if (list) {
                    list.forEach(function (item, index) {
                        var innerRow = new Row(item);
                        var $innerRowDOM = _this._createRowDOMObject(innerRow, innerTemplate, true);
                        $innerRowDOM.addClass("alInnerRow");
                        $innerRowDOM.css({ left: left + "px", position: "absolute" });
                        left += innerTemplate.size.width();
                        $root.append($innerRowDOM);
                    }, this);
                }
                $root.css({ marginLeft: template.margin.left() + "px", marginTop: template.margin.top() + "px", marginRight: template.margin.width() + "px", marginBotton: template.margin.height() + "px" });
                return $root;
            };
            AdvancedList.prototype._createCellDOMObject = function (row, template, cellTemplate) {
                var $cell = $("<div />").addClass("alCell");
                if (cellTemplate.kind == Resco.ListCellKind.Button) {
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
                    var templateHeight = this.orientation == UI.ListOrientation.Vertical ? (this.fixedTemplateHeight ? this.fixedTemplateHeight : template.size.height()) : Math.floor(h / this.linesCount);
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
                if (cellTemplate.kind == Resco.ListCellKind.Text) {
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
                        if (style.horizontalAlignment == Resco.ContentAlignment.Far) {
                            $cell.css({ textAlign: "right" });
                        }
                        else if (style.horizontalAlignment == Resco.ContentAlignment.Center) {
                            $cell.css({ textAlign: "center" });
                        }
                        if (style.verticalAlignment == Resco.ContentAlignment.Far) {
                            $cell.css({ paddingTop: (cellTemplate.size.height() - style.fontSize) + "px" });
                        }
                        else if (style.verticalAlignment == Resco.ContentAlignment.Center) {
                            $cell.css({ paddingTop: ((cellTemplate.size.height() - style.fontSize) / 2) + "px" });
                        }
                    }
                    // Set Content
                    $cell.text(this._getCellTextValue(row.data, cellTemplate));
                }
                // ImageCell
                else if (cellTemplate.kind == Resco.ListCellKind.Image) {
                    var $img = $("<img />").addClass("imageCell").appendTo($cell);
                    var imgData = this._loadImage(row, cellTemplate, $cell[0].children[0]);
                    if (imgData) {
                        $img.attr("src", imgData);
                    }
                    if (cellTemplate.style.backColor) {
                        $img.css({ backgroundColor: cellTemplate.style.backColor });
                    }
                }
                // ButtonCell
                else if (cellTemplate.kind == Resco.ListCellKind.Button) {
                    var col = AdvancedList.ListForeColor;
                    if (cellTemplate.style /* && (i % 2) == 0*/) {
                        col = style.foreColor; // ? style.foreColor : "black";
                    }
                    $cell.css({ border: "solid 2px " + col, color: col }).data("buttonName", cellTemplate.name).text(cellTemplate.dataMember);
                }
                return $cell;
            };
            AdvancedList.prototype.getItemValue = function (index) {
                var rows = this.rows;
                if (index >= rows.length) {
                    this._loadData(this._toIndexPredicate, index);
                }
                if (index >= rows.length) {
                    return null;
                }
                return index >= 0 ? rows[index].data : null;
            };
            AdvancedList.prototype._onRowPropertyChanged = function (sender, e) {
                var _this = this;
                var affectedRows = this.rows.filter(function (r) { return r.data === sender; }); // note: usually and in most cvases this is exactly one row
                affectedRows.forEach(function (row) {
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
                    _this.updateRowTemplate(-1, row);
                }, this);
            };
            AdvancedList.prototype.listScrolled = function (data, event) {
                var st;
                if (this.orientation == UI.ListOrientation.Vertical)
                    st = event.currentTarget.scrollTop;
                else
                    st = event.currentTarget.scrollLeft;
                if (this.m_lastScroll !== st) {
                    this._toggleFilterVisible(this.m_lastScroll < st);
                    this.moreDataNeeded.raise(Resco.EventArgs.Empty, this);
                    this._loadData(this._sizePredicate, this.delayLoadBuffer);
                    this.m_lastScroll = st;
                }
                this.listScroll.raise(new ListScrolledEventArgs(this.m_lastScroll), this);
                return true;
            };
            AdvancedList.prototype.getScrollPosition = function () {
                if (this.m_domListRows) {
                    if (this.orientation == UI.ListOrientation.Horizontal) {
                        return this.m_domListRows.scrollLeft();
                    }
                    else {
                        return this.m_domListRows.scrollTop();
                    }
                }
                return null;
            };
            AdvancedList.prototype.setScrollPosition = function (pos) {
                if (this.m_domListRows) {
                    if (this.orientation == UI.ListOrientation.Horizontal) {
                        this.m_domListRows.scrollLeft(pos);
                    }
                    else {
                        this.m_domListRows.scrollTop(pos);
                    }
                }
            };
            AdvancedList.prototype.listTouchStart = function (data, event) {
                this.m_scrolled = false;
                this.m_touchStartPosY = event.originalEvent.touches[0].clientY;
                this.m_touchStartPosX = event.originalEvent.touches[0].clientY;
                return true;
            };
            AdvancedList.prototype.listTouchEnd = function (data, event) {
                this.m_touchDeltaX = 0;
                this.m_touchDeltaY = 0;
                this.m_touchStartPosX = 0;
                this.m_touchStartPosY = 0;
                return true;
            };
            AdvancedList.prototype.listTouchMove = function (data, event) {
                this.m_touchDeltaX = this.m_touchStartPosX - event.originalEvent.touches[0].clientX;
                this.m_touchDeltaY = this.m_touchStartPosY - event.originalEvent.touches[0].clientY;
                if (!this.m_scrolled && ((this.orientation == UI.ListOrientation.Vertical && Math.abs(this.m_touchDeltaY) > 5) || (this.orientation == UI.ListOrientation.Horizontal && Math.abs(this.m_touchDeltaX) > 5))) {
                    this.m_scrolled = true;
                }
                this.m_touchStartPosX = event.originalEvent.touches[0].clientX;
                this.m_touchStartPosY = event.originalEvent.touches[0].clientY;
                var allowDown = (this.orientation == UI.ListOrientation.Vertical) && (event.currentTarget.scrollTop > 0);
                var allowUp = (this.orientation == UI.ListOrientation.Vertical) && (event.currentTarget.scrollTop <= event.currentTarget.scrollHeight - event.currentTarget.clientHeight && event.currentTarget.scrollHeight - event.currentTarget.clientHeight > 0);
                var allowLeft = (this.orientation == UI.ListOrientation.Horizontal) && (event.currentTarget.scrollLeft > 0);
                var allowRight = (this.orientation == UI.ListOrientation.Horizontal) && (event.currentTarget.scrollLeft <= event.currentTarget.scrollWidth - event.currentTarget.clientWidth && event.currentTarget.scrollWidth - event.currentTarget.clientWidth > 0);
                if ((this.m_touchDeltaY < 0 && allowDown) || (this.m_touchDeltaY > 0 && allowUp) || (this.m_touchDeltaX < 0 && allowLeft) || (this.m_touchDeltaX > 0 && allowRight)) {
                    event.stopPropagation();
                }
                return true;
            };
            //private m_filterOpened: boolean;
            //private m_bScrollDirectionIsDown: boolean;
            AdvancedList.prototype._toggleFilterVisible = function (bScrollDown) {
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
            };
            AdvancedList.prototype._horizontalPredicate = function (data) {
                var lastTemplateWidth = 100;
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
            };
            AdvancedList.prototype._verticalPredicate = function (data) {
                var lastTemplateHeight = 10;
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
            };
            AdvancedList.prototype._sizePredicate = function (data) {
                var result = true;
                if (this.delayLoad) {
                    // we have to load at least the minimum amount 
                    if (this.m_actualBufferSize !== undefined && this.m_actualBufferSize-- > 0) {
                        return true;
                    }
                    // if we exceeded the minimum amount, or the amount is not set yet, check if we need to load more data
                    result = this.orientation === UI.ListOrientation.Vertical ? this._verticalPredicate(data) : this._horizontalPredicate(data);
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
            };
            AdvancedList.prototype._delayLoadBufferPredicate = function (data) {
                return (this.m_actualBufferSize !== undefined && this.m_actualBufferSize-- > 0);
            };
            AdvancedList.prototype._toIndexPredicate = function (data) {
                return this.m_domListRows && this.rows.length <= data;
            };
            AdvancedList.prototype.setFilterText = function (text, RaiseChangeEvent) {
                this.m_filterText = text;
                if (this.m_domFilter && this.m_domFilter.length > 0) {
                    $(this.m_domFilter[0].children[0]).val(text);
                }
                if (RaiseChangeEvent) {
                    this.filterChanged.raise(new UI.FilterChangedEventArgs(2 /* TextChanged */));
                }
            };
            AdvancedList.prototype.enterPressed = function () {
                this.filterChanged.raise(new UI.FilterChangedEventArgs(2 /* TextChanged */));
            };
            AdvancedList.prototype.focusFilter = function () {
                if (this.m_domFilter && this.m_domFilter.length > 0) {
                    $(this.m_domFilter[0].children[0]).focus();
                }
            };
            AdvancedList.prototype.onGetEmptyListText = function () {
                if (this.getEmptyListText) {
                    return this.getEmptyListText.call(this.getEmptyListTextOwner ? this.getEmptyListTextOwner : this, this);
                }
                return "List is Empty";
            };
            AdvancedList.prototype.emptyListClicked = function () {
                if (this.m_filterText.length > 0) {
                    this.filterTextObs("");
                }
            };
            AdvancedList.prototype._showLoading = function (show) {
                var _this = this;
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
                            this.m_loadingIndicatorTimeout = window.setTimeout(function () {
                                var $td = $("td", _this.$loadingArea);
                                $td.children().detach();
                                $td.append(_this.$loadingIndicator);
                                _this._toggleLoadingAreaVisible(true);
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
                            this.m_noDataIndicatorTimeout = window.setTimeout(function () {
                                if (_this.rows.length == 0) {
                                    _this.$noDataText.text(_this.onGetEmptyListText());
                                    $("td", _this.$loadingArea).append(_this.$noDataText);
                                    $(".emptyListText", _this.$loadingArea).click(function (event) {
                                        _this.emptyListClicked();
                                    });
                                }
                                else {
                                    _this._toggleLoadingAreaVisible(false);
                                }
                            }, 150);
                        }
                    }
                }
            };
            AdvancedList.prototype._toggleLoadingAreaVisible = function (bVisible) {
                if (this.m_domRoot && this.$loadingArea) {
                    if (bVisible && !this.m_bLoadingAreaAttached) {
                        this.m_domRoot.append(this.$loadingArea);
                    }
                    else if (!bVisible && this.m_bLoadingAreaAttached) {
                        this.$loadingArea.detach();
                    }
                    this.m_bLoadingAreaAttached = bVisible;
                }
            };
            AdvancedList.SeparatorColor = "transparent";
            return AdvancedList;
        }());
        UI.AdvancedList = AdvancedList;
        var ListScrolledEventArgs = /** @class */ (function (_super) {
            __extends(ListScrolledEventArgs, _super);
            function ListScrolledEventArgs(scrollPosition) {
                var _this = _super.call(this) || this;
                _this.scrollPosition = scrollPosition;
                return _this;
            }
            return ListScrolledEventArgs;
        }(Resco.EventArgs));
        UI.ListScrolledEventArgs = ListScrolledEventArgs;
        var DelayLoadEventArgs = /** @class */ (function (_super) {
            __extends(DelayLoadEventArgs, _super);
            function DelayLoadEventArgs(completed, s, e) {
                var _this = _super.call(this) || this;
                _this.completed = completed;
                _this.startIndex = s;
                _this.endIndex = e;
                return _this;
            }
            return DelayLoadEventArgs;
        }(Resco.EventArgs));
        UI.DelayLoadEventArgs = DelayLoadEventArgs;
        var Row = /** @class */ (function () {
            function Row(data, separatorBinding) {
                var _this = this;
                this.data = data;
                this.selected = ko.observable(false);
                this.templateIndex = ko.observable(0);
                this.selectedTemplateIndex = ko.observable(0);
                this.activeTemplateIndex = ko.computed(function () {
                    return _this.selected() ? _this.selectedTemplateIndex() : _this.templateIndex();
                });
                this.column = 0;
            }
            Object.defineProperty(Row.prototype, "hasSeparator", {
                get: function () {
                    // either the binding is not specified (in that case, asume separator exists) or separatorBinding() is true
                    return !this.separatorBinding || this.separatorBinding();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Row.prototype, "separatorBinding", {
                get: function () {
                    return this.m_separatorBinding;
                },
                set: function (value) {
                    var _this = this;
                    // dispose previous subscriptions
                    if (this.m_separatorBindingSubsc) {
                        this.m_separatorBindingSubsc.dispose();
                    }
                    this.m_separatorBinding = value;
                    if (this.m_separatorBinding) {
                        this.m_separatorBindingSubsc = this.m_separatorBinding.subscribe(function (value) {
                            if (_this.$root) {
                                if (_this.m_separatorBinding()) {
                                    _this.$root.addClass("alHasSeparator");
                                }
                                else {
                                    _this.$root.removeClass("alHasSeparator");
                                }
                            }
                        }, this);
                    }
                    else {
                        this.$root.addClass("alHasSeparator");
                    }
                },
                enumerable: true,
                configurable: true
            });
            Row.prototype.dispose = function () {
                if (this.m_separatorBindingSubsc) {
                    this.m_separatorBindingSubsc.dispose();
                }
            };
            return Row;
        }());
        UI.Row = Row;
        var RowInsertedType;
        (function (RowInsertedType) {
            RowInsertedType[RowInsertedType["created"] = 0] = "created";
            RowInsertedType[RowInsertedType["updated"] = 1] = "updated";
        })(RowInsertedType = UI.RowInsertedType || (UI.RowInsertedType = {}));
        var RowInsertedEventArgs = /** @class */ (function (_super) {
            __extends(RowInsertedEventArgs, _super);
            function RowInsertedEventArgs(row, createdType) {
                var _this = _super.call(this) || this;
                _this.row = row;
                _this.type = createdType;
                return _this;
            }
            return RowInsertedEventArgs;
        }(Resco.EventArgs));
        UI.RowInsertedEventArgs = RowInsertedEventArgs;
        var RowTemplate = /** @class */ (function () {
            function RowTemplate() {
                this.cellTemplates = new Array();
                this.size = new Resco.Size(320, 48);
                this.margin = new Resco.Rectangle(0, 0, 0, 0);
            }
            RowTemplate.prototype.clone = function () {
                var row = new RowTemplate();
                row.name = this.name + "-clone";
                row.size = new Resco.Size(this.size.width(), this.size.height());
                row.margin = new Resco.Rectangle(this.margin.left(), this.margin.top(), this.margin.width(), this.margin.height());
                row.backgroundColor = this.backgroundColor;
                row.selectedBackground = this.selectedBackground;
                row.isStatic = this.isStatic;
                row.htmlContent = this.htmlContent;
                row.cellTemplates = new Array();
                this.cellTemplates.forEach(function (cell) {
                    row.cellTemplates.push(cell.clone());
                }, this);
                //row.mapCell = this.mapCell.clone(); // TODO: set the cell from cloned celltemplates
                return row;
            };
            return RowTemplate;
        }());
        UI.RowTemplate = RowTemplate;
        var ListRowTemplate = /** @class */ (function (_super) {
            __extends(ListRowTemplate, _super);
            function ListRowTemplate(dataMember) {
                var _this = _super.call(this) || this;
                _this.dataMember = dataMember;
                return _this;
            }
            ListRowTemplate.prototype.clone = function () {
                var row = new ListRowTemplate(this.dataMember);
                row.name = this.name + "-clone";
                row.size = new Resco.Size(this.size.width(), this.size.height());
                row.backgroundColor = this.backgroundColor;
                row.selectedBackground = this.selectedBackground;
                row.isStatic = this.isStatic;
                row.templateIndex = this.templateIndex;
                row.dataMember = this.dataMember;
                row.cellTemplates = new Array();
                this.cellTemplates.forEach(function (cell) {
                    row.cellTemplates.push(cell.clone());
                }, this);
                return row;
            };
            return ListRowTemplate;
        }(RowTemplate));
        UI.ListRowTemplate = ListRowTemplate;
        var CellTemplate = /** @class */ (function () {
            function CellTemplate() {
            }
            CellTemplate.prototype.clone = function () {
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
            };
            return CellTemplate;
        }());
        UI.CellTemplate = CellTemplate;
        var AdvancedListEnumerator = /** @class */ (function () {
            function AdvancedListEnumerator(data) {
                this.m_data = data;
                this.m_position = -1;
            }
            Object.defineProperty(AdvancedListEnumerator.prototype, "current", {
                get: function () {
                    if (this.m_data && this.m_position >= 0 && this.m_position < this.m_data.length) {
                        return this.m_data[this.m_position];
                    }
                    return null;
                },
                enumerable: true,
                configurable: true
            });
            AdvancedListEnumerator.prototype.moveNext = function () {
                return this.m_data && (++this.m_position < this.m_data.length);
            };
            AdvancedListEnumerator.prototype.reset = function () {
                this.m_position = -1;
            };
            AdvancedListEnumerator.prototype.getEnumerator = function () {
                return this;
            };
            return AdvancedListEnumerator;
        }());
        UI.AdvancedListEnumerator = AdvancedListEnumerator;
        var SelectedIndexChangedEventArgs = /** @class */ (function (_super) {
            __extends(SelectedIndexChangedEventArgs, _super);
            function SelectedIndexChangedEventArgs(index, oldIndex) {
                var _this = _super.call(this) || this;
                _this.index = index;
                _this.oldIndex = oldIndex;
                return _this;
            }
            return SelectedIndexChangedEventArgs;
        }(Resco.EventArgs));
        UI.SelectedIndexChangedEventArgs = SelectedIndexChangedEventArgs;
        var RowClickedEventArgs = /** @class */ (function (_super) {
            __extends(RowClickedEventArgs, _super);
            function RowClickedEventArgs(i, d) {
                var _this = _super.call(this) || this;
                _this.index = i;
                _this.data = d;
                return _this;
            }
            return RowClickedEventArgs;
        }(Resco.EventArgs));
        UI.RowClickedEventArgs = RowClickedEventArgs;
        var ListButtonEventArgs = /** @class */ (function (_super) {
            __extends(ListButtonEventArgs, _super);
            function ListButtonEventArgs(ri, n) {
                var _this = _super.call(this) || this;
                _this.rowIndex = ri;
                _this.name = n;
                return _this;
            }
            return ListButtonEventArgs;
        }(Resco.EventArgs));
        UI.ListButtonEventArgs = ListButtonEventArgs;
        var ListCellStyle = /** @class */ (function () {
            function ListCellStyle() {
            }
            ListCellStyle.prototype.clone = function () {
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
            };
            return ListCellStyle;
        }());
        UI.ListCellStyle = ListCellStyle;
    })(UI = Resco.UI || (Resco.UI = {}));
})(Resco || (Resco = {}));
//# sourceMappingURL=advancedList-1.0.3.js.map