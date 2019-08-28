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
        function isIListBindingItem(obj) {
            // unable to check if object is instance of interface in typescript
            // hack. check if obj has function getTextValue ( -> assume it is IListBindingItem)
            if ((typeof obj.getTextValue === "function")) {
                return true;
            }
            return false;
        }
        UI.isIListBindingItem = isIListBindingItem;
        //export class CellClickEventArgs extends EventArgs {
        //	constructor(row: Row, cellIndex: number, rowIndex: number, binding?: any) {
        //		super();
        //		this.row = row;
        //		this.cellIndex = cellIndex;
        //		this.rowIndex = rowIndex;
        //		this.binding = binding;
        //		this.cancelRowSelect = false;
        //	}
        //	public cellIndex: number;
        //	public rowIndex: number;
        //	public row: Row;
        //	public binding: any;
        //	public cancelRowSelect: boolean;
        //}
        var ListOrientation;
        (function (ListOrientation) {
            ListOrientation[ListOrientation["Vertical"] = 0] = "Vertical";
            ListOrientation[ListOrientation["Horizontal"] = 1] = "Horizontal";
        })(ListOrientation = UI.ListOrientation || (UI.ListOrientation = {}));
        var ViewType;
        (function (ViewType) {
            ViewType[ViewType["FilterList"] = 0] = "FilterList";
            ViewType[ViewType["Detail"] = 1] = "Detail";
            ViewType[ViewType["GridView"] = 2] = "GridView";
            ViewType[ViewType["Map"] = 3] = "Map";
            ViewType[ViewType["Chart"] = 4] = "Chart";
            ViewType[ViewType["Flip"] = 5] = "Flip";
            ViewType[ViewType["Document"] = 6] = "Document";
            ViewType[ViewType["Calendar"] = 7] = "Calendar";
            ViewType[ViewType["Custom"] = 8] = "Custom";
            ViewType[ViewType["Email"] = 9] = "Email";
            ViewType[ViewType["Route"] = 10] = "Route";
            ViewType[ViewType["Itinerary"] = 11] = "Itinerary";
            ViewType[ViewType["LocationTrackOverview"] = 12] = "LocationTrackOverview";
            ViewType[ViewType["FlexiGrid"] = 13] = "FlexiGrid";
            ViewType[ViewType["Splitter"] = 14] = "Splitter";
            ViewType[ViewType["NonFlexiGrid"] = 15] = "NonFlexiGrid";
        })(ViewType = UI.ViewType || (UI.ViewType = {}));
        UI.ViewTemplateNames = ["tmplAdvancedList", "tmplDetailView", "tmplFlexiGridView", "tmplMapView", "tmplChartView", "tmplFlipView", "tmplDocumentView", "tmplCalendarView", "tmplCustomView", "tmplEmailView", "tmplRoutePlanView", "tmplItineraryView", "tmplLocTrackView", "tmplFlexiGridView", "tmplSplitterView", "tmplNonFlexiGrid"];
        var FilterChangedEventArgs = /** @class */ (function (_super) {
            __extends(FilterChangedEventArgs, _super);
            function FilterChangedEventArgs(kind) {
                var _this = _super.call(this) || this;
                _this.kind = kind;
                return _this;
            }
            FilterChangedEventArgs.All = new FilterChangedEventArgs(2 /* TextChanged */ | 4 /* GroupChanged */);
            return FilterChangedEventArgs;
        }(Resco.EventArgs));
        UI.FilterChangedEventArgs = FilterChangedEventArgs;
        //export interface IFilterListView extends IListView, IFilterView {
        //	filterCellIndex: number;
        //}
        //export interface IOrientationFilterListView extends IFilterListView {
        //	orientation: ListOrientation;
        //	linesCount: number;
        //	innerRowClick: Resco.Event<InnerRowClickEventArgs>;
        //}
        var InnerRowClickEventArgs = /** @class */ (function (_super) {
            __extends(InnerRowClickEventArgs, _super);
            function InnerRowClickEventArgs() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return InnerRowClickEventArgs;
        }(Resco.EventArgs));
        UI.InnerRowClickEventArgs = InnerRowClickEventArgs;
        function asIListSearchButtons(obj) {
            if (obj && (typeof obj.searchButtonClick === "object") && (typeof obj.searchButtonClick.raise === "function") && (typeof obj.searchButtonClick.add === "function") && (typeof obj.searchButtonClick.remove === "function")) {
                return obj;
            }
            return null;
        }
        UI.asIListSearchButtons = asIListSearchButtons;
        var SearchButtonClickEventArgs = /** @class */ (function (_super) {
            __extends(SearchButtonClickEventArgs, _super);
            function SearchButtonClickEventArgs() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return SearchButtonClickEventArgs;
        }(Resco.EventArgs));
        UI.SearchButtonClickEventArgs = SearchButtonClickEventArgs;
        var DetailItemType;
        (function (DetailItemType) {
            DetailItemType[DetailItemType["Base"] = 0] = "Base";
            DetailItemType[DetailItemType["Text"] = 1] = "Text";
            DetailItemType[DetailItemType["Numeric"] = 2] = "Numeric";
            DetailItemType[DetailItemType["Link"] = 3] = "Link";
            DetailItemType[DetailItemType["Combo"] = 4] = "Combo";
            DetailItemType[DetailItemType["CheckBox"] = 5] = "CheckBox";
            DetailItemType[DetailItemType["DateTime"] = 6] = "DateTime";
            DetailItemType[DetailItemType["Image"] = 7] = "Image";
            DetailItemType[DetailItemType["Separator"] = 255] = "Separator";
        })(DetailItemType = UI.DetailItemType || (UI.DetailItemType = {}));
        var ItemTextBoxKind;
        (function (ItemTextBoxKind) {
            /// <summary>Free text.</summary>
            ItemTextBoxKind[ItemTextBoxKind["Text"] = 0] = "Text";
            /// <summary>Email.</summary>
            ItemTextBoxKind[ItemTextBoxKind["Email"] = 1] = "Email";
            /// <summary>URL.</summary>
            ItemTextBoxKind[ItemTextBoxKind["Url"] = 2] = "Url";
            /// <summary>Phone.</summary>
            ItemTextBoxKind[ItemTextBoxKind["Phone"] = 3] = "Phone";
            /// <summary>Barcode.</summary>
            ItemTextBoxKind[ItemTextBoxKind["Barcode"] = 4] = "Barcode";
        })(ItemTextBoxKind = UI.ItemTextBoxKind || (UI.ItemTextBoxKind = {}));
        var ItemDateTimeParts;
        (function (ItemDateTimeParts) {
            /// <summary>
            /// Displays and allows to edit both date and time.
            /// </summary>
            ItemDateTimeParts[ItemDateTimeParts["DateTime"] = 0] = "DateTime";
            /// <summary>
            /// Displays and edits only the date part.
            /// </summary>
            ItemDateTimeParts[ItemDateTimeParts["Date"] = 1] = "Date";
            /// <summary>
            /// Displays and edits only the time part.
            /// </summary>
            ItemDateTimeParts[ItemDateTimeParts["Time"] = 2] = "Time";
        })(ItemDateTimeParts = UI.ItemDateTimeParts || (UI.ItemDateTimeParts = {}));
        var DetailViewItemArgs = /** @class */ (function (_super) {
            __extends(DetailViewItemArgs, _super);
            function DetailViewItemArgs(item) {
                var _this = _super.call(this) || this;
                _this.m_item = item;
                return _this;
            }
            Object.defineProperty(DetailViewItemArgs.prototype, "item", {
                get: function () {
                    return this.m_item;
                },
                enumerable: true,
                configurable: true
            });
            return DetailViewItemArgs;
        }(Resco.EventArgs));
        UI.DetailViewItemArgs = DetailViewItemArgs;
        var DetailViewItemTextClickArgs = /** @class */ (function (_super) {
            __extends(DetailViewItemTextClickArgs, _super);
            function DetailViewItemTextClickArgs(item) {
                return _super.call(this, item) || this;
            }
            return DetailViewItemTextClickArgs;
        }(DetailViewItemArgs));
        UI.DetailViewItemTextClickArgs = DetailViewItemTextClickArgs;
        var DetailViewItemValidatingArgs = /** @class */ (function (_super) {
            __extends(DetailViewItemValidatingArgs, _super);
            function DetailViewItemValidatingArgs(item, newValue, oldValue) {
                var _this = _super.call(this, item) || this;
                _this.m_newValue = newValue;
                _this.m_oldValue = oldValue;
                return _this;
            }
            DetailViewItemValidatingArgs.prototype.newValue = function () {
                return this.m_newValue;
            };
            DetailViewItemValidatingArgs.prototype.oldValue = function () {
                return this.m_oldValue;
            };
            return DetailViewItemValidatingArgs;
        }(DetailViewItemArgs));
        UI.DetailViewItemValidatingArgs = DetailViewItemValidatingArgs;
        var LinkItemPopupArgs = /** @class */ (function (_super) {
            __extends(LinkItemPopupArgs, _super);
            function LinkItemPopupArgs(/*lv: IListView,*/ isOpen) {
                var _this = _super.call(this) || this;
                //this.listView = lv;
                _this.isOpen = isOpen;
                return _this;
            }
            return LinkItemPopupArgs;
        }(Resco.EventArgs));
        UI.LinkItemPopupArgs = LinkItemPopupArgs;
        var LinkItemTextChangedArgs = /** @class */ (function (_super) {
            __extends(LinkItemTextChangedArgs, _super);
            function LinkItemTextChangedArgs() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return LinkItemTextChangedArgs;
        }(Resco.EventArgs));
        UI.LinkItemTextChangedArgs = LinkItemTextChangedArgs;
        //export interface IWebDocumentView extends IView {
        //	load: (fileName: string, mimeType: string, base64input?: string) => void;
        //	createJavascriptBridge: (id?: number) => IJavascriptBridge;
        //	getJavascriptBridgeInstanceId: () => number;
        //	dispose: () => void;
        //}
        //export interface IDocumentView extends IWebDocumentView, IFilterView {
        //	fileName: string;
        //	mimeType: string;
        //	documentInfo: DocumentInfo;
        //	isDirty: KnockoutObservable<boolean>;
        //	isReadOnly: boolean;
        //	isEmpty: boolean;
        //	saveSignatureAsImage: boolean;
        //	strokeWidth: number;
        //	inkTitle: string;
        //	contentChanged: Resco.Event<Resco.EventArgs>;
        //	save: () => string;
        //	clear: () => void;
        //	executeAction: (action: DocumentAction) => void;
        //	queryActions: () => DocumentAction;
        //	resizeImage: (width: number, height: number) => boolean;
        //	canSelectFile: KnockoutObservable<boolean>;
        //}
        //export interface IJavascriptBridge {
        //	isDocumentLoaded: boolean;
        //	documentLoaded: Resco.Event<Resco.EventArgs>;
        //	registerCallback: (command: string, callback: (a: string, b: (response: string) => void, c: (err: string) => void, d?: any) => void, scope?: any) => void;
        //	exposeObject: (jsObject: string, obj: any, stringify?: (data: any) => string, parse?: (json: string, data: any) => void, scope?: any) => void;
        //	getExposedObject: (jsObject: string) => JSExposedObject;
        //	invokeScript: (jsScript: string, resultCallback: (data: any) => void, scope?: any) => void;
        //	makeContentUrl: (contentPath: string, ...dependencies: string[]) => string;
        //	dispose: () => void;
        //	instanceId: number;
        //}
        var DocumentInfo = /** @class */ (function () {
            function DocumentInfo() {
                this.exif = new Resco.Dictionary();
            }
            return DocumentInfo;
        }());
        UI.DocumentInfo = DocumentInfo;
        var DocumentKind;
        (function (DocumentKind) {
            /// <summary>No file content.</summary>
            DocumentKind[DocumentKind["None"] = 0] = "None";
            /// <summary>SVG signature.</summary>
            DocumentKind[DocumentKind["Signature"] = 1] = "Signature";
            /// <summary>HTML file or web page URL.</summary>
            DocumentKind[DocumentKind["WebPage"] = 2] = "WebPage";
            /// <summary>Image file or image data.</summary>
            DocumentKind[DocumentKind["Image"] = 3] = "Image";
            /// <summary>Generic document or another file type.</summary>
            DocumentKind[DocumentKind["File"] = 4] = "File";
        })(DocumentKind = UI.DocumentKind || (UI.DocumentKind = {}));
        //export interface IFlexiGridView extends IGridView {
        //	isFlexible: boolean;
        //	maxColumns: KnockoutObservable<number>;
        //	minColumnWidth: KnockoutObservable<number>;
        //	fillHeight: boolean;
        //	insertAt: (index: number, view: IView, showHeader: number, columnSpan: boolean, height: GridUnit) => void;
        //	removeView: (view: IView) => void;
        //	isParentOf: (view: IView) => boolean;
        //	maximizedView: KnockoutObservable<IView>;
        //	updateCommands: (view: IView, primary: ICommand, secondary: ICommand) => void;
        //	backgroundColor: string;
        //	viewBorderColor: string;
        //	viewMargin: number;
        //	// IFlexiGridView2
        //	setVerticalScrollPosition: (offset: number) => void;
        //	expandView: (view: IView, expand: boolean) => void;
        //	isViewExpanded: (view: IView) => boolean;
        //	setViewHeaderImage: (view: IView, image: string) => void;
        //	isViewHeaderVisible: (view: IView) => number;
        //	showViewHeader: (view: IView, visible: number) => void;
        //	viewExpanded: Event<ViewExpandedEventArgs>;
        //	clear: () => void;
        //	updateView: () => void;
        //}
        var ViewExpandedEventArgs = /** @class */ (function (_super) {
            __extends(ViewExpandedEventArgs, _super);
            function ViewExpandedEventArgs(expanded, view) {
                var _this = _super.call(this) || this;
                _this.isExpanded = expanded;
                _this.view = view;
                return _this;
            }
            return ViewExpandedEventArgs;
        }(Resco.EventArgs));
        UI.ViewExpandedEventArgs = ViewExpandedEventArgs;
        var HeaderClickEventArgs = /** @class */ (function (_super) {
            __extends(HeaderClickEventArgs, _super);
            function HeaderClickEventArgs(view) {
                var _this = _super.call(this) || this;
                _this.view = view;
                return _this;
            }
            return HeaderClickEventArgs;
        }(Resco.EventArgs));
        UI.HeaderClickEventArgs = HeaderClickEventArgs;
        var PolylineRenderMode;
        (function (PolylineRenderMode) {
            PolylineRenderMode[PolylineRenderMode["None"] = 0] = "None";
            PolylineRenderMode[PolylineRenderMode["BSpline"] = 1] = "BSpline";
            PolylineRenderMode[PolylineRenderMode["DirectionsService"] = 2] = "DirectionsService";
        })(PolylineRenderMode = UI.PolylineRenderMode || (UI.PolylineRenderMode = {}));
        //export interface IMapAnnotationCollection extends Resco.ICollection<MapAnnotation> {
        //	addRange: (items: MapAnnotation[]) => void;
        //}
        //export interface IMapView extends IView, IFilterView {
        //	annotations: IMapAnnotationCollection;
        //	selectedAnnotation: MapAnnotation;
        //	zoomLevel: number;
        //	regionChanged: Resco.Event<Resco.EventArgs>;
        //	annotationSelected: Resco.Event<MapAnnotationEventArgs>;
        //	annotationCallout: Resco.Event<MapAnnotationEventArgs>;
        //	currentLocationChanged: Resco.Event<LocationChangedEventArgs>;
        //	directionsFound: Resco.Event<MapDirectionsFoundArgs>;
        //	getCenter: () => Resco.Position;  // if null, current localtion is not available
        //	setCenter: (latitude: number, longitude: number, zoomLevel: number, animate: boolean) => void;
        //	getRegion: () => Resco.Rectangle;   // if null, current region was not found
        //	setRegion: (minLat: number, minLon: number, maxLat: number, maxLon: number, animate: boolean) => void;
        //	markCurrentLocation: (markerTitle: string, markerSubtitle: string) => void;
        //	showNoDataMessage: (text: string) => void;
        //	hideAnnotations: (filter: string) => void;
        //	showDirections: (showRegion: boolean, coordinates: Resco.Location[], polylineOptions?: any) => void;
        //	appendPolyline(coordinates: Location[], lineOptions: object, renderMode: PolylineRenderMode): number;
        //	removePolyline(id?: number);
        //	showPolyline(show: boolean, id?: number);
        //	grabTouch: (callback: (lat: number, lon: number) => void, callbackScope?: any) => void
        //	clear: () => void;
        //}
        var MapAnnotation = /** @class */ (function () {
            function MapAnnotation(lat, lon, title, subt, mimg, hasCallout, zIndex) {
                this.bounces = ko.observable(false);
                this.zIndex = 1;
                this.m_latitude = lat;
                this.m_longitude = lon;
                this.m_title = title;
                this.m_subtitle = subt;
                this.m_markerImage = mimg;
                this.m_hasCallout = hasCallout;
                this.m_hashCode = ((lat && lon) ? ((lat.hashCode() * 21 + lon.hashCode()) * 21) : 0) + (title ? title.hashCode() : 0);
                if (zIndex)
                    this.zIndex = zIndex;
            }
            Object.defineProperty(MapAnnotation.prototype, "latitude", {
                get: function () {
                    return this.m_latitude;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(MapAnnotation.prototype, "longitude", {
                get: function () {
                    return this.m_longitude;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(MapAnnotation.prototype, "title", {
                get: function () {
                    return this.m_title;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(MapAnnotation.prototype, "subtitle", {
                get: function () {
                    return this.m_subtitle;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(MapAnnotation.prototype, "markerImage", {
                get: function () {
                    return this.m_markerImage;
                },
                set: function (img) {
                    this.m_markerImage = img;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(MapAnnotation.prototype, "hasCallout", {
                get: function () {
                    return this.m_hasCallout;
                },
                enumerable: true,
                configurable: true
            });
            MapAnnotation.prototype.matches = function (filterText) {
                if (filterText.indexOf("%") >= 0) {
                    // TODO: regexp match
                }
                return this.title.toLowerCase().startsWith(filterText.toLowerCase());
            };
            MapAnnotation.prototype.equals = function (obj) {
                if (obj instanceof MapAnnotation) {
                    var ann = obj;
                    return ann.hashCode() == this.m_hashCode && ann.title.localeCompare(this.m_title) == 0 && ann.latitude == this.m_latitude && ann.longitude == this.m_longitude;
                }
                return false;
            };
            MapAnnotation.prototype.hashCode = function () {
                return this.m_hashCode;
            };
            return MapAnnotation;
        }());
        UI.MapAnnotation = MapAnnotation;
        var MapAnnotationEventArgs = /** @class */ (function (_super) {
            __extends(MapAnnotationEventArgs, _super);
            function MapAnnotationEventArgs(ann) {
                var _this = _super.call(this) || this;
                _this.annotation = ann;
                return _this;
            }
            return MapAnnotationEventArgs;
        }(Resco.EventArgs));
        UI.MapAnnotationEventArgs = MapAnnotationEventArgs;
        var MapDirectionsFoundArgs = /** @class */ (function (_super) {
            __extends(MapDirectionsFoundArgs, _super);
            function MapDirectionsFoundArgs() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.totalTime = 0;
                _this.totalDistance = 0;
                return _this;
            }
            return MapDirectionsFoundArgs;
        }(Resco.EventArgs));
        UI.MapDirectionsFoundArgs = MapDirectionsFoundArgs;
        var MapRouteStep = /** @class */ (function () {
            function MapRouteStep() {
            }
            return MapRouteStep;
        }());
        UI.MapRouteStep = MapRouteStep;
        var LocationChangedEventArgs = /** @class */ (function (_super) {
            __extends(LocationChangedEventArgs, _super);
            function LocationChangedEventArgs(lat, lon) {
                var _this = _super.call(this) || this;
                _this.latitude = lat;
                _this.longitude = lon;
                return _this;
            }
            return LocationChangedEventArgs;
        }(Resco.EventArgs));
        UI.LocationChangedEventArgs = LocationChangedEventArgs;
        //export interface IChartView extends IView, IFilterView {
        //	chartType: ChartType;
        //	title: string;
        //	valueAxisTitle: string;
        //	labelAxisTitle: string;
        //	noDataText: string;
        //	dataSource: Array<any>;
        //	bindings: string[];
        //	seriesColors: string[];
        //	seriesTitles: string[];
        //	settings: ChartSettings;
        //	seriesClick: Resco.Event<ChartViewClickEvent>;
        //	currency: string;
        //	currencySymbol: string;
        //	valuePrecision: number;
        //	show: () => void;
        //	init: (localization: UI.ILocalizationProvider) => void;
        //	unload: () => void;
        //}
        var ChartViewClickEvent = /** @class */ (function (_super) {
            __extends(ChartViewClickEvent, _super);
            function ChartViewClickEvent(seriesIndex, dataIndex) {
                var _this = _super.call(this) || this;
                _this.seriesIndex = seriesIndex;
                _this.dataPointIndex = dataIndex;
                return _this;
            }
            return ChartViewClickEvent;
        }(Resco.EventArgs));
        UI.ChartViewClickEvent = ChartViewClickEvent;
        var FlexiViewLayout = /** @class */ (function () {
            function FlexiViewLayout(view, layoutConfig) {
                this.view = view;
                this.isHeaderVisible = 2;
                this.height = GridUnit.logical(2);
                if (layoutConfig) {
                    this.parse(layoutConfig);
                }
            }
            FlexiViewLayout.prototype.parse = function (config) {
                if (config) {
                    this.leftPanel = (config[0] === "0");
                    this.isHeaderVisible = Resco.strictParseInt(config[1]);
                    if (isNaN(this.isHeaderVisible))
                        this.isHeaderVisible = 1;
                    this.isVertical = config[2] === "1";
                    this.width = config[3] === "1";
                    var pp = config.split(";");
                    if (pp.length > 1) {
                        var length = GridUnit.logical(2);
                        var z = pp[1];
                        if (pp.length > 2) {
                            z = pp[2];
                        }
                        if (z.endsWith("px")) {
                            z = z.substr(0, z.length - 2);
                            length.kind = GridUnitKind.Pixel;
                        }
                        length.value = Resco.strictParseInt(z);
                        if (isNaN(length.value))
                            length.value = 2;
                        this.height = length;
                    }
                }
            };
            return FlexiViewLayout;
        }());
        UI.FlexiViewLayout = FlexiViewLayout;
        var GridUnit = /** @class */ (function () {
            function GridUnit(value, kind) {
                this.value = value;
                this.kind = kind;
            }
            GridUnit.logical = function (value) {
                return new GridUnit(value, GridUnitKind.Logical);
            };
            GridUnit.pixel = function (value) {
                return new GridUnit(value, GridUnitKind.Pixel);
            };
            return GridUnit;
        }());
        UI.GridUnit = GridUnit;
        var GridUnitKind;
        (function (GridUnitKind) {
            GridUnitKind[GridUnitKind["Logical"] = 0] = "Logical";
            GridUnitKind[GridUnitKind["Pixel"] = 1] = "Pixel";
        })(GridUnitKind = UI.GridUnitKind || (UI.GridUnitKind = {}));
        var AppointmentProperty;
        (function (AppointmentProperty) {
            /// <summary>Start date (DateTime).</summary>
            AppointmentProperty[AppointmentProperty["StartDate"] = 0] = "StartDate";
            /// <summary>End date (DateTime).</summary>
            AppointmentProperty[AppointmentProperty["EndDate"] = 1] = "EndDate";
            /// <summary>Title, subject (string).</summary>
            AppointmentProperty[AppointmentProperty["Title"] = 2] = "Title";
            /// <summary>Undertitle (string).</summary>
            AppointmentProperty[AppointmentProperty["SubTitle"] = 3] = "SubTitle";
            /// <summary>Identifier of the appointment group (Guid).</summary>
            AppointmentProperty[AppointmentProperty["GroupId"] = 4] = "GroupId";
            /// <summary>Image identifier (string).</summary>
            AppointmentProperty[AppointmentProperty["Icon"] = 5] = "Icon";
            /// <summary>Calendar item color.</summary>
            AppointmentProperty[AppointmentProperty["Color"] = 6] = "Color";
            /// <sumary>
            AppointmentProperty[AppointmentProperty["Activitypecode"] = 7] = "Activitypecode";
            /// <sumary>
            AppointmentProperty[AppointmentProperty["ActualDurationMinutes"] = 8] = "ActualDurationMinutes";
            /// <sumary>
            AppointmentProperty[AppointmentProperty["IsReadOnly"] = 9] = "IsReadOnly";
        })(AppointmentProperty = UI.AppointmentProperty || (UI.AppointmentProperty = {}));
        //export interface IAppointmentDataSource {
        //	//getRange(from: Date, to: Date): IEnumerable<any>;
        //	getRange(from: Date, to: Date): Array<MobileCrm.Model.ActivityListItem>;
        //	getBindingValue(appointment: any, part: AppointmentProperty);
        //	refresh: () => void;
        //	makeLocalizedDateString(date: Date): string;
        //	getModeLocalizedString(mode: AppointmentViewMode): string;
        //}
        //export interface IAppointmentView extends IView, IFilterView {
        //	//toggleNextMode: () => void;
        //	//setCalendarParameters: () => void;
        //	title: string;
        //	agendaView: IFilterListView;
        //	mode: AppointmentViewMode;
        //	currentDate: Moment;
        //	appointmentCreate: Resco.Event<AppointmentCreateArgs>;
        //	appointmentsLoadInRange: Resco.Event<AppointmentsLoadInRangeArgs>;
        //	appointmentClick: Resco.Event<AppointmentClickArgs>;
        //	appointmentBeginDrag: Resco.Event<AppointmentBeginDragArgs>;
        //	appointmentDragEnded: Resco.Event<AppointmentDragEndedArgs>;
        //	viewModeChanged: Resco.Event<Resco.EventArgs>;
        //	refresh: () => void;
        //}
        var AppointmentCreateArgs = /** @class */ (function (_super) {
            __extends(AppointmentCreateArgs, _super);
            function AppointmentCreateArgs(from, to) {
                var _this = _super.call(this) || this;
                _this.startDate = from;
                _this.endDate = to;
                return _this;
            }
            return AppointmentCreateArgs;
        }(Resco.EventArgs));
        UI.AppointmentCreateArgs = AppointmentCreateArgs;
        var AppointmentsLoadInRangeArgs = /** @class */ (function (_super) {
            __extends(AppointmentsLoadInRangeArgs, _super);
            function AppointmentsLoadInRangeArgs(from, to) {
                var _this = _super.call(this) || this;
                _this.startDate = from;
                _this.endDate = to;
                return _this;
            }
            return AppointmentsLoadInRangeArgs;
        }(Resco.EventArgs));
        UI.AppointmentsLoadInRangeArgs = AppointmentsLoadInRangeArgs;
        var AppointmentClickArgs = /** @class */ (function (_super) {
            __extends(AppointmentClickArgs, _super);
            function AppointmentClickArgs(index) {
                var _this = _super.call(this) || this;
                _this.id = index;
                return _this;
            }
            return AppointmentClickArgs;
        }(Resco.EventArgs));
        UI.AppointmentClickArgs = AppointmentClickArgs;
        var AppointmentBeginDragArgs = /** @class */ (function (_super) {
            __extends(AppointmentBeginDragArgs, _super);
            function AppointmentBeginDragArgs(index) {
                var _this = _super.call(this) || this;
                _this.id = index;
                return _this;
            }
            return AppointmentBeginDragArgs;
        }(Resco.EventArgs));
        UI.AppointmentBeginDragArgs = AppointmentBeginDragArgs;
        var AppointmentDragEndedArgs = /** @class */ (function (_super) {
            __extends(AppointmentDragEndedArgs, _super);
            function AppointmentDragEndedArgs(index, from, to) {
                var _this = _super.call(this) || this;
                _this.id = index;
                _this.startDate = from;
                _this.endDate = to;
                return _this;
            }
            return AppointmentDragEndedArgs;
        }(Resco.EventArgs));
        UI.AppointmentDragEndedArgs = AppointmentDragEndedArgs;
        var AppointmentViewMode;
        (function (AppointmentViewMode) {
            /// <summary>ListView of a appointments for a specific date.</summary>
            AppointmentViewMode[AppointmentViewMode["Agenda"] = 0] = "Agenda";
            /// <summary>Single day view mode.</summary>
            AppointmentViewMode[AppointmentViewMode["Day"] = 1] = "Day";
            /// <summary>Single week view mode.</summary>
            AppointmentViewMode[AppointmentViewMode["Week"] = 2] = "Week";
            /// <summary>Single month view mode.</summary>
            AppointmentViewMode[AppointmentViewMode["Month"] = 3] = "Month";
        })(AppointmentViewMode = UI.AppointmentViewMode || (UI.AppointmentViewMode = {}));
        var MimeTypeResolver = /** @class */ (function () {
            function MimeTypeResolver() {
            }
            MimeTypeResolver.tryGetMimeType = function (fileName, mimeType) {
                if (mimeType) {
                    return mimeType;
                }
                var ext = fileName.split(".").pop();
                if (ext) {
                    ext = ext.substring(1).toLowerCase();
                    switch (ext) {
                        case "jpg":
                        case "jpeg":
                        case "jpe": return "image/jpeg";
                        case "png": return "image/png";
                        case "svg": return "image/svg+xml";
                        case "pdf": return "application/pdf";
                        case "aac": return "audio/x-aac";
                        case "mov": return "video/quicktime";
                        case "gif": return "image/gif";
                    }
                }
                return null;
            };
            return MimeTypeResolver;
        }());
        UI.MimeTypeResolver = MimeTypeResolver;
        var DocumentAction;
        (function (DocumentAction) {
            /// <summary>No action.</summary>
            DocumentAction[DocumentAction["None"] = 0] = "None";
            // Actions for empty IDocumentView
            /// <summary>Configures the view for ink input.</summary>
            DocumentAction[DocumentAction["CaptureInk"] = 1] = "CaptureInk";
            /// <summary>Asks the user to capture a photo and loads the choosen media into the view.</summary>
            DocumentAction[DocumentAction["CapturePhoto"] = 2] = "CapturePhoto";
            /// <summary>Asks the user to choose a media (image, video, depending on what the platform supports) and loads the choosen media into the view.</summary>
            DocumentAction[DocumentAction["SelectPhoto"] = 4] = "SelectPhoto";
            /// <summary>Asks the user to choose a file and loads it into the view.</summary>
            DocumentAction[DocumentAction["SelectFile"] = 8] = "SelectFile";
            /// <summary>Asks the user to record an audio note and loads it into the view.</summary>
            DocumentAction[DocumentAction["RecordAudio"] = 16] = "RecordAudio";
            /// <summary>Asks the user to record a video and loads it into the view.</summary>
            DocumentAction[DocumentAction["RecordVideo"] = 32] = "RecordVideo";
            /// <summary>Gets last photo taken and loads it into the view.</summary>
            DocumentAction[DocumentAction["UseLastPhotoTaken"] = 64] = "UseLastPhotoTaken";
            // Actions for non-empty IDocumentView
            /// <summary>Clears the view and marks it as empty.</summary>
            DocumentAction[DocumentAction["Clear"] = 4096] = "Clear";
            /// <summary>Shows a preview of the loaded document (fullscreen, etc.).</summary>
            DocumentAction[DocumentAction["View"] = 8192] = "View";
            /// <summary>Opens the loaded document in a external application. Which application is platform specific.</summary>
            DocumentAction[DocumentAction["OpenExternal"] = 16384] = "OpenExternal";
            /// <summary>Find external application for opening specific document. Find method is platform specific (i.e. find on Android Market)</summary>
            DocumentAction[DocumentAction["SendTo"] = 32768] = "SendTo";
            /// <summary>Virtual action handled in common code.</summary>
            DocumentAction[DocumentAction["Download"] = 65536] = "Download";
            // TODO: copy, paste, print, send, properties.
            /// <summary>Copy image to clipboard.</summary>
            DocumentAction[DocumentAction["Copy"] = 131072] = "Copy";
            /// <summary>Paste image from clipboard.</summary>
            DocumentAction[DocumentAction["Paste"] = 262144] = "Paste";
            /// <summary>Prints the document.</summary>
            DocumentAction[DocumentAction["Print"] = 524288] = "Print";
            /// <summary>Let user to choose smaller image resolution.</summary>
            DocumentAction[DocumentAction["ResizeImage"] = 1048576] = "ResizeImage";
            /// <summary>Let user import VCard attachment (handled in common code).</summary>
            DocumentAction[DocumentAction["Import"] = 2097152] = "Import";
            /// <summary>Pass document to edit in external app (Microsoft office so far[15.6.2015]).</summary>
            DocumentAction[DocumentAction["Edit"] = 4194304] = "Edit";
            /// <summary>Send document as attachment.</summary>
            DocumentAction[DocumentAction["Email"] = 8388608] = "Email";
            /// <summary>Ask the user to choose multiple images.</summary>
            DocumentAction[DocumentAction["SelectMultiplePhotos"] = 16777216] = "SelectMultiplePhotos";
            /// <summary>Asks the user to choose multiple files from either online or offline location and loads it into the view.</summary>
            DocumentAction[DocumentAction["LoadFromMultiple"] = 33554432] = "LoadFromMultiple";
            /// <summary>Opens image in the image editor.</summary>
            DocumentAction[DocumentAction["EditImage"] = 67108864] = "EditImage";
            /// <summary>Actions that are non-destructive.</summary>
            DocumentAction[DocumentAction["ReadOnlyMask"] = 9101312] = "ReadOnlyMask";
        })(DocumentAction = UI.DocumentAction || (UI.DocumentAction = {}));
    })(UI = Resco.UI || (Resco.UI = {}));
})(Resco || (Resco = {}));
//# sourceMappingURL=IView.js.map