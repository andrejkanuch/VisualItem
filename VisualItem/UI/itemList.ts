module VisualItem.UI {
	export class ItemList {
		public items: KnockoutObservableArray<Data.DropItem>;
		public visible: KnockoutObservable<boolean>;

		constructor() {
			this.items = ko.observableArray<Data.DropItem>();
			this.visible = ko.observable<boolean>(false);
		}

		public addItem(item: Data.DropItem): void {
			item.dragStarted.add(this, this._itemDragStarted);
			item.dragStopped.add(this, this._itemDragStopped);
			this.items.push(item);
		}

		public removeItem(q: Data.DropItem): void {
			var index = this.items.indexOf(q);
			if (index >= 0)
				this.removeItemAt(index);
		}

		public removeItemAt(index: number): void {
			var item = this.items()[index];
			item.dragStarted.remove(this, this._itemDragStarted);
			item.dragStopped.remove(this, this._itemDragStopped);
			this.items.splice(index, 1);
		}

		private _itemDragStarted(sender: any, e: Data.DropItemEventArgs): void {
			if (this.visible())
				this.visible(false);
		}

		private _itemDragStopped(sender: any, e: Data.DragStoppedEventArgs): void {
			if (e.dropped) {
				// item was dropped -> remove it from list if it was not a template
				if (!(e.item instanceof Data.GroupTemplateItem))
					this.removeItem(e.item);
			}
		}
	}
}