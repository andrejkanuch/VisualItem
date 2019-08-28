module Resco.UI {
	export interface IView {
		name: string;
		imageName: string;
		text: string;
		type: ViewType;
		form: any;
		isVisible: KnockoutObservable<boolean>;
		isSelected: KnockoutObservable<boolean>
		onAppended: (domRoot: HTMLElement) => void;
		onResize: (size: Resco.Size) => void;
		resized: Resco.Event<ResizeEventArgs>;
	}

	//export interface IListView extends IView {
	//	dataSource: IEnumerable<any>;
	//	templates: Array<RowTemplate>;
	//	templateIndex: KnockoutObservable<number>;
	//	selectedTemplateIndex: KnockoutObservable<number>;
	//	addTemplate: (row: Resco.UI.RowTemplate, cloneIndex: number) => number;
	//	addCell: (templateIndex: number, kind: ListCellKind, name: string, isDataConstant: boolean, data: any, bounds: number[], anchor: ListCellAnchor, style: ListCellStyle) => number;
	//	clearTemplates: () => void;
	//	getEmptyListText: (sender: any) => string;
	//	getEmptyListTextOwner: any;
	//	isSearchBoxVisible: boolean;
	//	//rowCreated: Resco.Event<RowCreatedEventArgs>;
	//	rowClick: Resco.Event<RowClickedEventArgs>;
	//	cellClick: Resco.Event<CellClickEventArgs>;
	//	buttonClick: Resco.Event<ListButtonEventArgs>;
	//	moreDataNeeded: Resco.Event<EventArgs>;
	//	emptyListClick: Resco.Event<EventArgs>;

	//	setSeparatorColors: (topColor: any, bottomColor: any) => void;

	//	//editingStart: Resco.Event<EditingStartEventArgs>;
	//	//editingFinish: Resco.Event<EditingFinishEventArgs>;
	//	startTextEdit: (rowIndex: number, cellIndex: number, value: string, maxLength: number) => void;
	//	//startNumericEdit: (rowIndex: number, cellIndex: number, value: Decimal, minimum: Decimal, maximum: Decimal, decimalPlaces: number) => void;
	//	startDateTimeEdit: (rowIndex: number, cellIndex: number, value: Date, parts: ItemDateTimeParts, nullable: boolean) => void;
	//	startComboEdit: (rowIndex: number, cellIndex: number, value: any, dataSource: any[], displayMember: string, valueMember: string) => void;
	//	multiSelectChanged: Resco.Event<EventArgs>;

	//	logicalWidth: number;
	//	isVertical: boolean;
	//	maxColumns: number;

	//	updateRowTemplate: (index: number, row?: Row) => void;
	//	updateAllTemplates: () => void;

	//	getItemOffset: (index: number) => { top: number, bottom: number };
	//	scrollOffset: number;
	//	scrollPage: number;
	//	setSelectedIndex: (index: number, ensureVisible: boolean) => void;

	//	templateSelector: (s: any, o: any, b: boolean, l: ListCellStyle[]) => number;
	//	templateSelectorOwner: any;
	//	autoSelect: boolean;
	//	selectedIndex: number;
	//	getItemValue: (index: number) => any;
	//	imageLoader: (row: Resco.UI.Row, imageData: string, isImageQuery: boolean, cellElement: HTMLElement) => string;
	//	imageLoaderOwner: any;
	//	focusFilter: () => void;
	//	loadComplete: KnockoutObservable<boolean>;
	//	updateList: () => void;

	//	headerTemplateIndex: number;
	//	headerData: any;

	//	footerTemplateIndex: number;
	//	footerData: any;

	//	loadingIndicator: any;
	//}

	export interface IListBindingItem {
		getTextValue: (binding: string, formatted: boolean) => string;
		getImageValue: (binding: string) => IImageValueResult;
	}

	export interface IImageValueResult {
		imageData: string;
		placeHolder: string;
	}

	export function isIListBindingItem(obj: any): boolean {
		// unable to check if object is instance of interface in typescript
		// hack. check if obj has function getTextValue ( -> assume it is IListBindingItem)
		if ((typeof obj.getTextValue === "function")) {
			return true;
		}
		return false;
	}


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

	export enum ListOrientation {
		Vertical = 0,
		Horizontal,
	}

	export enum ViewType {
		FilterList = 0,
		Detail = 1,
		GridView = 2,
		Map = 3,
		Chart = 4,
		Flip = 5,
		Document = 6,
		Calendar = 7,
		Custom = 8,
		Email = 9,
		Route = 10,
		Itinerary = 11,
		LocationTrackOverview = 12,
		FlexiGrid = 13,
		Splitter = 14,
		NonFlexiGrid = 15
	}

	export var ViewTemplateNames = ["tmplAdvancedList", "tmplDetailView", "tmplFlexiGridView", "tmplMapView", "tmplChartView", "tmplFlipView", "tmplDocumentView", "tmplCalendarView", "tmplCustomView", "tmplEmailView", "tmplRoutePlanView", "tmplItineraryView", "tmplLocTrackView", "tmplFlexiGridView", "tmplSplitterView", "tmplNonFlexiGrid"];

	export interface IFilterView {
		caption: KnockoutObservable<string>;
		filterGroup: KnockoutObservable<Resco.UI.FilterGroup>;
		emptyFilterText: KnockoutObservable<string>;
		isFilterVisible: KnockoutObservable<boolean>;
		filterText: string;
		setFilterText: (text: string, raiseChangeEvent: boolean) => void;
		filterChanged: Resco.Event<FilterChangedEventArgs>;
	}

	//export function isFilterView(obj: any): boolean {
	//	return ((obj instanceof ListView) || (obj instanceof ChartView) || (obj instanceof MapView) || (obj instanceof Calendar));
	//}

	//export function asFilterView(obj: any): IFilterView {
	//	return isFilterView(obj) ? <IFilterView>obj : null;
	//}

	//export function isIInternalFilterView(obj: any): boolean {
	//	return ((obj instanceof RoutePlanner.RoutePlanView) || (obj instanceof FlipView));
	//}

	//export function asIInternalFilterView(obj: any): IInternalFilterView {
	//	return isIInternalFilterView(obj) ? <IInternalFilterView>obj : null;
	//}

	export const enum FilterChangeKind {
		/// <summary>Nothing changed (not used).</summary>
		None = 0,
		/// <summary>Filter text has changed.</summary>
		TextChanging = 1,
		/// <summary>Filter text editing has finished.</summary>
		TextChanged = 2,
		/// <summary>Users has chosen new filter group.</summary>
		GroupChanged = 4,
	}

	export class FilterChangedEventArgs extends EventArgs {
		public kind: FilterChangeKind;

		constructor(kind: FilterChangeKind) {
			super();
			this.kind = kind;
		}

		static All = new FilterChangedEventArgs(FilterChangeKind.TextChanged | FilterChangeKind.GroupChanged);
	}

	//export interface IFilterListView extends IListView, IFilterView {
	//	filterCellIndex: number;
	//}

	//export interface IOrientationFilterListView extends IFilterListView {
	//	orientation: ListOrientation;
	//	linesCount: number;
	//	innerRowClick: Resco.Event<InnerRowClickEventArgs>;
	//}

	export class InnerRowClickEventArgs extends EventArgs {
		public row: number;
		public innerRow: number;
	}

	export interface IInternalFilterView {
		view: IFilterView;
		captionChanged: Resco.Event<EventArgs>
		onFilterChanged: (sender: any, args: FilterChangedEventArgs) => void;
	}

	export interface IListSearchButtons {
		searchButtons: KnockoutObservableArray<IListSearchButton>;
		searchButtonClick: Event<SearchButtonClickEventArgs>;
	}

	export function asIListSearchButtons(obj: any): IListSearchButtons {
		if (obj && (typeof obj.searchButtonClick === "object") && (typeof obj.searchButtonClick.raise === "function") && (typeof obj.searchButtonClick.add === "function") && (typeof obj.searchButtonClick.remove === "function")) {
			return <IListSearchButtons>obj;
		}
		return null;
	}

	export class SearchButtonClickEventArgs extends EventArgs {
		public index: number;
		public button: IListSearchButton;
	}

	export interface IListSearchButton {
		hasValue: boolean;
		image: KnockoutComputed<string>;
		label: KnockoutComputed<string>;
		autoWidth: boolean;
		changed: Event<EventArgs>;
		color: string;
	}

	export interface IDetailView extends IView {
		dataSource: any;
		isDirty: boolean;
		isEnabled: KnockoutObservable<boolean>;
		count: number;

		itemChanged: Resco.Event<DetailViewItemArgs>;
		itemValidating: Resco.Event<DetailViewItemValidatingArgs>;
		textButtonClick: Resco.Event<DetailViewItemTextClickArgs>;

		items: Array<IDetailItem>;

		inUpdate: boolean;
		domRoot: HTMLElement;

		createItem: (type: DetailItemType) => IDetailItem;
		insertItem: (index: number, item: IDetailItem, style: DetailViewItemStyle) => number;
		removeItem: (index: number) => void;
		startEditItem: (index: number) => void;
		clearContents: () => void;
		setupGroups: (groups: number[]) => void;
		getItem: (index: number) => IDetailItem;
		findItem: (name: string) => IDetailItem;
		beginUpdate: () => void;
		endUpdate: () => void;
		update: () => void;
	}

	export enum DetailItemType {
		Base = 0,
		Text = 1,
		Numeric = 2,
		Link = 3,
		Combo = 4,
		CheckBox = 5,
		DateTime = 6,
		Image = 7,
		Separator = 255
	}

	export interface IDetailItem {
		name: string;
		dataMember: string;
		label: KnockoutObservable<string>;
		placeholderText: KnockoutObservable<string>;
		errorMessage: KnockoutObservable<string>;
		itemStyle: KnockoutObservable<DetailViewItemStyle>;
		itemIsEnabled: KnockoutObservable<boolean>;
		isEnabled: KnockoutComputed<boolean>;
		isVisible: KnockoutObservable<boolean>;
		value: KnockoutObservable<any>;
		isNullable: boolean
		validate: boolean;
		itemType: DetailItemType;
		hasFocus: KnockoutObservable<boolean>;
	}

	export interface IDetailItemTextBox extends IDetailItem {
		numberOfLines: number;
		isPassword: boolean;
		maxLength: number;
		kind: ItemTextBoxKind;
	}

	export enum ItemTextBoxKind {
		/// <summary>Free text.</summary>
		Text,
		/// <summary>Email.</summary>
		Email,
		/// <summary>URL.</summary>
		Url,
		/// <summary>Phone.</summary>
		Phone,
		/// <summary>Barcode.</summary>
		Barcode
	}

	export interface IDetailItemNumeric extends IDetailItem {
		minimum: number;
		maximum: number;
		increment: number;
		decimalPlaces: KnockoutObservable<number>;
		displayFormat: KnockoutObservable<string>;
	}

	export interface IDetailItemCheckBox extends IDetailItem {
		textChecked: string;
		textUnchecked: string;
	}

	export interface IDetailItemDateTime extends IDetailItem {
		minimum: Date;
		maximum: Date;
		dateParts: ItemDateTimeParts;
	}

	export interface IDetailItemIFrame extends IDetailItem {
	}

	export interface IDetailItemSeparator extends IDetailItem {
	}

	export enum ItemDateTimeParts {
		/// <summary>
		/// Displays and allows to edit both date and time.
		/// </summary>
		DateTime = 0,
		/// <summary>
		/// Displays and edits only the date part.
		/// </summary>
		Date = 1,
		/// <summary>
		/// Displays and edits only the time part.
		/// </summary>
		Time = 2,
	}

	export interface IDetailItemComboBox extends IDetailItem {
		displayMember: string;
		valueMember: string;
		listDataSource: KnockoutObservableArray<any>;
	}

	export interface IDetailItemLink extends IDetailItem {
		isMultiline: boolean;
		showDropDownIcon: boolean;
		handler: IDetailViewItemDelegate;
		updateLabel: () => void;
	}

	export interface IDetailItemInlineLink extends IDetailItemLink {
		popupOpened: Resco.Event<LinkItemPopupArgs>;
		textChanged: Resco.Event<LinkItemTextChangedArgs>;
		closePopup: () => void;
	}

	export interface IDetailItemImage extends IDetailItem {
		imageQuery: string;
		refresh: () => void;
		imageClick: Resco.Event<Resco.EventArgs>;
	}

	export interface IDetailViewItemDelegate {
		onClick: (value: any, textClick: boolean) => void;
		formatValue: (value: any) => string;
		linkItem: IDetailItemLink;
	}

	export class DetailViewItemArgs extends Resco.EventArgs {
		private m_item: IDetailItem;
		get item(): IDetailItem {
			return this.m_item;
		}

		constructor(item: IDetailItem) {
			super();
			this.m_item = item;
		}
	}

	export class DetailViewItemTextClickArgs extends DetailViewItemArgs {
		public longPress: boolean;

		public constructor(item: IDetailItem) {
			super(item);
		}
	}

	export class DetailViewItemValidatingArgs extends DetailViewItemArgs {
		private m_newValue: any;
		public newValue(): any {
			return this.m_newValue;
		}

		private m_oldValue: any;
		public oldValue(): any {
			return this.m_oldValue;
		}

		constructor(item: IDetailItem, newValue: any, oldValue: any) {
			super(item);
			this.m_newValue = newValue;
			this.m_oldValue = oldValue;
		}
	}

	export class LinkItemPopupArgs extends Resco.EventArgs {
		constructor(/*lv: IListView,*/ isOpen: boolean) {
			super();
			//this.listView = lv;
			this.isOpen = isOpen;
		}

		//public listView: IListView;
		public isOpen: boolean;
	}

	export class LinkItemTextChangedArgs extends Resco.EventArgs {
		//public listView: IListView;
		public text: string;
		public enterPressed: boolean;
	}

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

	export class DocumentInfo {
		public documentKind: DocumentKind;
		public imageWidth: number;
		public imageHeight: number;
		public exif: Resco.Dictionary<string, any>;
		public fileSize: number;

		constructor() {
			this.exif = new Resco.Dictionary<string, any>();
		}
	}

	export enum DocumentKind {
		/// <summary>No file content.</summary>
		None,
		/// <summary>SVG signature.</summary>
		Signature,
		/// <summary>HTML file or web page URL.</summary>
		WebPage,
		/// <summary>Image file or image data.</summary>
		Image,
		/// <summary>Generic document or another file type.</summary>
		File,
	}

	export interface IGridView extends IView {
		columns: number;
		rows: number;
		insertView: (col: number, row: number, cs: number, rs: number, view: any) => void;
		showHeader: (view: IView, show: boolean) => void;
		headerClick: Resco.Event<HeaderClickEventArgs>;
	}

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

	export class ViewExpandedEventArgs extends EventArgs {
		public isExpanded: boolean;
		public view: IView;

		constructor(expanded: boolean, view: IView) {
			super();
			this.isExpanded = expanded;
			this.view = view;
		}
	}

	export interface ISplitterView extends IView {
		isVertical: boolean;
		isFirstCollapsed: KnockoutObservable<boolean>;
		isSecondCollapsed: KnockoutObservable<boolean>;
		relativeSplitPosition: number;

		insertView: (first: boolean, view: IView) => void;
		getView: (index: number) => IView;
	}

	export class HeaderClickEventArgs extends EventArgs {
		public view: IView;

		constructor(view: IView) {
			super();
			this.view = view;
		}
	}

	export enum PolylineRenderMode {
		None, BSpline, DirectionsService
	}

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

	export class MapAnnotation {
		protected m_latitude: number;
		get latitude(): number {
			return this.m_latitude;
		}
		protected m_longitude: number;
		get longitude(): number {
			return this.m_longitude;
		}
		protected m_title: string;
		get title(): string {
			return this.m_title;
		}
		protected m_subtitle: string;
		get subtitle(): string {
			return this.m_subtitle;
		}
		protected m_markerImage: string | object;
		get markerImage(): string | object {
			return this.m_markerImage;
		}
		set markerImage(img: string | object) {
			this.m_markerImage = img;
		}

		bounces: KnockoutObservable<boolean> = ko.observable(false);

		public markerLabel: string | object;
		public zIndex: number = 1;

		protected m_hasCallout: boolean;
		get hasCallout(): boolean {
			return this.m_hasCallout;
		}

		public calloutCommand;

		protected m_hashCode: number;
		public uiElement: any;

		public matches(filterText: string): boolean {
			if (filterText.indexOf("%") >= 0) {
				// TODO: regexp match
			}
			return this.title.toLowerCase().startsWith(filterText.toLowerCase());
		}

		public equals(obj: any): boolean {
			if (obj instanceof MapAnnotation) {
				var ann = <MapAnnotation>obj;
				return ann.hashCode() == this.m_hashCode && ann.title.localeCompare(this.m_title) == 0 && ann.latitude == this.m_latitude && ann.longitude == this.m_longitude;
			}
			return false;
		}

		public hashCode(): number {
			return this.m_hashCode;
		}

		constructor(lat: number, lon: number, title: string, subt: string, mimg: string | object, hasCallout: boolean, zIndex?: number) {
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
	}

	export class MapAnnotationEventArgs extends EventArgs {
		public annotation: MapAnnotation;

		constructor(ann: MapAnnotation) {
			super();
			this.annotation = ann;
		}
	}

	export class MapDirectionsFoundArgs extends EventArgs {
		public totalTime: number = 0;
		public totalDistance: number = 0;
		public steps: MapRouteStep[];
	}

	export class MapRouteStep {
		public travelTime: number;
		public distance: number;
	}

	export class LocationChangedEventArgs extends EventArgs {
		public latitude: number;
		public longitude: number;

		constructor(lat: number, lon: number) {
			super();
			this.latitude = lat;
			this.longitude = lon;
		}
	}

	export interface IFlipView extends IView {
		insertView: (index: number, view: IView) => void;
		selectView: (vieIndex: number, animate: boolean) => void;
		selectedViewIndex: KnockoutObservable<number>;
		selectedView: KnockoutObservable<IView>;
	}

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

	export class ChartViewClickEvent extends Resco.EventArgs {
		/// <summary>Gets the clicked series index.</summary>
		public seriesIndex: number;
		/// <summary>Gets the clicked data point.</summary>
		public dataPointIndex: number;

		constructor(seriesIndex: number, dataIndex: number) {
			super();
			this.seriesIndex = seriesIndex;
			this.dataPointIndex = dataIndex;
		}
	}

	export class FlexiViewLayout {
		constructor(view: Resco.UI.IView, layoutConfig?: string) {
			this.view = view;
			this.isHeaderVisible = 2;
			this.height = GridUnit.logical(2);

			if (layoutConfig) {
				this.parse(layoutConfig);
			}
		}

		public parse(config: string) {
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
		}

		public view: IView;
		public leftPanel: boolean;
		public isHeaderVisible: number;
		public isVertical: boolean;
		public width: boolean;
		public height: GridUnit;
	}

	export class GridUnit {
		public kind: GridUnitKind;
		public value: number;

		public constructor(value: number, kind: GridUnitKind) {
			this.value = value;
			this.kind = kind;
		}

		static logical(value: number): GridUnit {
			return new GridUnit(value, GridUnitKind.Logical);
		}

		static pixel(value: number): GridUnit {
			return new GridUnit(value, GridUnitKind.Pixel);
		}
	}

	export enum GridUnitKind {
		Logical,
		Pixel
	}

	export enum AppointmentProperty {
		/// <summary>Start date (DateTime).</summary>
		StartDate,
		/// <summary>End date (DateTime).</summary>
		EndDate,
		/// <summary>Title, subject (string).</summary>
		Title,
		/// <summary>Undertitle (string).</summary>
		SubTitle,
		/// <summary>Identifier of the appointment group (Guid).</summary>
		GroupId,
		/// <summary>Image identifier (string).</summary>
		Icon,
		/// <summary>Calendar item color.</summary>
		Color,
		/// <sumary>
		Activitypecode,
		/// <sumary>
		ActualDurationMinutes,
		/// <sumary>
		IsReadOnly
	}

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

	export class AppointmentCreateArgs extends Resco.EventArgs {
		public startDate: Date;
		public endDate: Date;

		constructor(from: Date, to: Date) {
			super();
			this.startDate = from;
			this.endDate = to;
		}
	}

	export class AppointmentsLoadInRangeArgs extends Resco.EventArgs {
		public startDate: Date;
		public endDate: Date;

		constructor(from: Date, to: Date) {
			super();
			this.startDate = from;
			this.endDate = to;
		}
	}

	export class AppointmentClickArgs extends Resco.EventArgs {
		/// <summary>
		/// Gets or sets the clicked appointemnt instance.
		/// </summary>
		public id: number;

		constructor(index: any) {
			super();
			this.id = index;
		}
	}

	export class AppointmentBeginDragArgs extends Resco.EventArgs {
		public id: number;

		constructor(index: any) {
			super();
			this.id = index;
		}
	}

	export class AppointmentDragEndedArgs extends Resco.EventArgs {
		public id: number;
		public startDate: Date;
		public endDate: Date;

		constructor(index: number, from: Date, to: Date) {
			super();
			this.id = index;
			this.startDate = from;
			this.endDate = to;
		}
	}

	export enum AppointmentViewMode {
		/// <summary>ListView of a appointments for a specific date.</summary>
		Agenda,
		/// <summary>Single day view mode.</summary>
		Day,
		/// <summary>Single week view mode.</summary>
		Week,
		/// <summary>Single month view mode.</summary>
		Month,
	}

	export interface IEmailView extends IView {
		editable: KnockoutObservable<boolean>;
		editorVisible: KnockoutObservable<boolean>;
		allowAddAttachments: boolean;
		detailHeader: KnockoutObservable<IDetailView>;
		body: string;
		isDirty: boolean;
	}

	export class MimeTypeResolver {
		public static tryGetMimeType(fileName: string, mimeType: string): string {
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
		}
	}

	export enum DocumentAction {
		/// <summary>No action.</summary>
		None = 0x0000,
		// Actions for empty IDocumentView
		/// <summary>Configures the view for ink input.</summary>
		CaptureInk = 0x0001,
		/// <summary>Asks the user to capture a photo and loads the choosen media into the view.</summary>
		CapturePhoto = 0x0002,
		/// <summary>Asks the user to choose a media (image, video, depending on what the platform supports) and loads the choosen media into the view.</summary>
		SelectPhoto = 0x0004,
		/// <summary>Asks the user to choose a file and loads it into the view.</summary>
		SelectFile = 0x0008,
		/// <summary>Asks the user to record an audio note and loads it into the view.</summary>
		RecordAudio = 0x0010,
		/// <summary>Asks the user to record a video and loads it into the view.</summary>
		RecordVideo = 0x0020,
		/// <summary>Gets last photo taken and loads it into the view.</summary>
		UseLastPhotoTaken = 0x0040,

		// Actions for non-empty IDocumentView
		/// <summary>Clears the view and marks it as empty.</summary>
		Clear = 0x1000,
		/// <summary>Shows a preview of the loaded document (fullscreen, etc.).</summary>
		View = 0x2000,
		/// <summary>Opens the loaded document in a external application. Which application is platform specific.</summary>
		OpenExternal = 0x4000,
		/// <summary>Find external application for opening specific document. Find method is platform specific (i.e. find on Android Market)</summary>
		SendTo = 0x8000,
		/// <summary>Virtual action handled in common code.</summary>
		Download = 0x10000,
		// TODO: copy, paste, print, send, properties.
		/// <summary>Copy image to clipboard.</summary>
		Copy = 0x20000,
		/// <summary>Paste image from clipboard.</summary>
		Paste = 0x40000,
		/// <summary>Prints the document.</summary>
		Print = 0x80000,
		/// <summary>Let user to choose smaller image resolution.</summary>
		ResizeImage = 0x100000,
		/// <summary>Let user import VCard attachment (handled in common code).</summary>
		Import = 0x200000,
		/// <summary>Pass document to edit in external app (Microsoft office so far[15.6.2015]).</summary>
		Edit = 0x400000,
		/// <summary>Send document as attachment.</summary>
		Email = 0x800000,
		/// <summary>Ask the user to choose multiple images.</summary>
		SelectMultiplePhotos = 0x1000000,
		/// <summary>Asks the user to choose multiple files from either online or offline location and loads it into the view.</summary>
		LoadFromMultiple = 0x2000000,
		/// <summary>Opens image in the image editor.</summary>
		EditImage = 0x4000000,
		/// <summary>Actions that are non-destructive.</summary>
		ReadOnlyMask = SendTo | View | OpenExternal | Print | Email | Copy
	}

	//export interface IRoutePlanIFrame extends IView {
	//	useMetricUnits: boolean;
	//	timeDesignators: string[];
	//	init(localization: UI.ILocalizationProvider);
	//}

	//export interface IRouteView extends IRoutePlanIFrame {
	//	resetDirtyFlags: () => void;
	//	startTime: KnockoutObservable<Date>;
	//	editEntity: (id: string) => void;
	//	updateItinerary: (args: Resco.UI.MapDirectionsFoundArgs, start: number) => void;
	//	updateTimeField: (pos: number, start: boolean, time: Date) => void;
	//	updateNameField: (pos: number, name: string) => void;
	//	reload: (data: RoutePlanner.RouteItineraryItem[], routeDay: Date, selectedItemId?: string) => void;

	//	routeEntityName: string;
	//	routeEntityPlural: string;
	//	startField: string;
	//	endField: string;
	//	startTimeMinutes: number;
	//	startType: number;
	//	endType: number;
	//	completionStatuses: Resco.Dictionary<number, string>
	//	viewingMode: boolean;

	//	startTimeChanged: Resco.Event<RoutePlanner.RouteTimeChangedArgs>;
	//	routeItemSelected: Resco.Event<RoutePlanner.RouteItemSelectedArgs>;
	//	fixItemClicked: Resco.Event<RoutePlanner.FixItemEventArgs>;
	//	fixAllItemsClicked: Resco.Event<RoutePlanner.FixAllItemsEventArgs>;
	//	routeItemDragged: Resco.Event<RoutePlanner.ItemDraggedEventArgs>;
	//	routeItemUpdated: Resco.Event<RoutePlanner.RouteItemUpdateEventArgs>;
	//	routeItemLocationChanged: Resco.Event<RoutePlanner.RouteLocationChangedArgs>;
	//	menuAction: Resco.Event<RoutePlanner.RouteMenuActionArgs>;
	//	grabLocation: Resco.Event<RoutePlanner.RouteGrabLocationArgs>;
	//}

	//export interface IPlannedStop {
	//	start: Date;
	//	end: Date;
	//	subject: KnockoutObservable<string>;
	//	location: Resco.Location;
	//	timeRange: KnockoutObservable<string>;
	//	actualTimeRange: KnockoutObservable<string>;
	//	routePoint: Resco.UI.LocationTracking.RoutePoint;
	//}

	//export interface IUser {
	//	userId: string;
	//	name: KnockoutObservable<string>;
	//	userTitle: KnockoutObservable<string>;
	//	email: KnockoutObservable<string>;
	//	phoneNumber: KnockoutObservable<string>;
	//	imageData: KnockoutObservable<string>;
	//	selected?: KnockoutObservable<boolean>;
	//}

	//export interface IUserLoader {
	//	loadUsers(reset?: boolean): Promise<IUser[]>;
	//	resolveUsers(users: IUser[]): IAuditUser[];
	//}

	//export interface IAuditUser extends IUser {
	//	startPoint?: Resco.UI.LocationTracking.RoutePoint;
	//	endPoint?: Resco.UI.LocationTracking.RoutePoint;
	//	plannedStops?: KnockoutObservableArray<IPlannedStop>;
	//	boundingRect?: number[];
	//}

	//export interface ILocTrackOverview extends IRoutePlanIFrame {
	//	selectedDay: KnockoutObservable<Date>;
	//	selectedTime: KnockoutObservable<Date>;
	//	users: KnockoutObservableArray<IAuditUser>;
	//	selectedUser: KnockoutObservable<IAuditUser>;
	//	selectedPoint: KnockoutObservable<LocationTracking.RoutePoint>;
	//	managingUserList: KnockoutObservable<boolean>;
	//	userLoader: IUserLoader;
	//	liveMode: KnockoutObservable<boolean>;

	//	setMinuteRange(startMin: number, endMin: number);
	//}

	//export interface IRoutePlanView extends IView {
	//	mapView: IMapView;
	//	routeView: IRoutePlanIFrame;
	//	viewType: ViewType;
	//	viewTemplate: string;
	//	overViewText: string;
	//	isTabletMode: boolean;
	//	editMode: boolean;
	//	routeViewCollapsed: boolean;
	//	init: (localization: UI.ILocalizationProvider) => void;
	//	reset: () => void;
	//	setEditMode: (editMode: boolean, editorHeight: number) => void;
	//	tabletModeChanged: Resco.Event<EventArgs>;

	//	headerView: KnockoutObservable<UI.IView>;
	//	form: IForm;	// TODO: move to IView
	//}

	export interface ILocalizationProvider {
		get: (id: string) => string;
		stringTable: Resco.Dictionary<string, string>;
	}
}
