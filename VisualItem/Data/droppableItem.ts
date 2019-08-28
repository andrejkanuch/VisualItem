module VisualItem.Data {

	export class DropItem implements IDraggableItem {
		public canDrag: boolean;
		public dragGhostTemplateName: string;
		public ratio: KnockoutObservable<number>;
		public position: Resco.Position;
		public displayPositionLeft: KnockoutComputed<number>;
		public displayPositionTop: KnockoutComputed<number>;
		public dragged: KnockoutObservable<boolean>;
		public dragStarted: Resco.Event<DropItemEventArgs>;
		public dragStopped: Resco.Event<DragStoppedEventArgs>;

		public get name(): string {
			return this.m_data.properties.resco_label;
		}
		public displayName: KnockoutObservable<string>;
		public imageUrl: string;

		public get id(): string {
			return this.m_data.id;
		}

		constructor(data: MobileCRM.DynamicEntity, bReadOnly: boolean) {
			this.m_data = data;
			this.ratio = ko.observable<number>(1);
			this.position = new Resco.Position(0, 0);
			this.displayPositionLeft = ko.computed<number>(() => {
				return this.position.left() * this.ratio();
			});
			this.displayPositionTop = ko.computed<number>(() => {
				return this.position.top() * this.ratio();
			});

			this.canDrag = !bReadOnly;
			this.dragged = ko.observable<boolean>(false);

			if (this.name)
				this.imageUrl = `url("Images/${this.name.toLowerCase()}.png")`;

			this.dragGhostTemplateName = "tmplDraggedItem";

			this.dragStarted = new Resco.Event<DropItemEventArgs>(this);
			this.dragStopped = new Resco.Event<DragStoppedEventArgs>(this);
			this.displayName = ko.observable<string>(this.name);
		}

		public onDragStarted(): void {
			this.dragged(true);
			this.dragStarted.raise(new DropItemEventArgs(this), this);
		}

		public onDragStopped(dropped: boolean): void {
			this.dragged(false);
			this.dragStopped.raise(new DragStoppedEventArgs(this, dropped), this);
			//this._onDragStopped(dropped);
		}

		public showDetails(): void {
			// open the native form			
			MobileCRM.bridge.command("editItem", JSON.stringify({ id: this.id, left: Math.floor(this.m_domRoot.offsetLeft + (<HTMLElement>this.m_domRoot.parentNode).offsetLeft), top: Math.floor(this.m_domRoot.offsetTop + (<HTMLElement>this.m_domRoot.parentNode).offsetTop) }), (response: any) => {
				this.displayName(response);
			}, MobileCRM.bridge.alert);
		}

		public appended(elements: HTMLElement[]): void {
			this.m_domRoot = elements.firstOrDefault(el => el.className && el.className.indexOf("answerItem") >= 0);
		}

		protected m_data: MobileCRM.DynamicEntity;
		private m_domRoot: HTMLElement;
	}

	export class GroupTemplateItem extends DropItem {
		public repeatable: boolean;
		public minRepeat: number;
		public maxRepeat: number;

		constructor(data: MobileCRM.DynamicEntity, bReadOnly: boolean) {
			super(data, bReadOnly);

			if (data.properties.resco_repeatconfig) {
				var repeatConfig = JSON.parse(data.properties.resco_repeatconfig);
				this.repeatable = true;
				this.minRepeat = repeatConfig.minCount === undefined ? 0 : repeatConfig.minCount;
				this.maxRepeat = repeatConfig.maxCount === undefined ? 1000000000 : repeatConfig.maxCount;
			}
			else {
				this.repeatable = false;
			}
			this.dragGhostTemplateName = "tmplDraggedGroupTemplate";

			this.displayName("New " + this.name);
		}
	}

	export class GroupItem extends DropItem {
		public groupTemplate: GroupTemplateItem;

		public get templateId(): string {
			if (this.m_data)
				return this.m_data.properties.resco_templategroupid.id;
			return null;
		}

		constructor(data: MobileCRM.DynamicEntity, bReadOnly: boolean, displayName?: string) {
			super(data, bReadOnly);
			this.dragGhostTemplateName = "tmplDraggedGroup";

			if (displayName)
				this.displayName(displayName);
		}
	}

	export class DropItemEventArgs extends Resco.EventArgs {
		public item: DropItem;

		constructor(item: DropItem) {
			super();
			this.item = item;
		}

	}

	export class DragStoppedEventArgs extends DropItemEventArgs {
		public dropped: boolean;

		constructor(item: DropItem, dropped: boolean) {
			super(item);
			this.dropped = dropped;
		}
	}

}