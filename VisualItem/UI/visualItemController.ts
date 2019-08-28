module VisualItem.UI {
	export class VisualItemController implements IDropZone {
		public itemList: ItemList;
		public question: MobileCRM.DynamicEntity;

		public size: Resco.Size;
		public imageSize: Resco.Size;
		public containerPosition: Resco.Position;
		public containerSize: Resco.Size;
		public imageDataB64: KnockoutObservable<string>;
		public isDropActive: KnockoutObservable<boolean>;

		public answers: KnockoutObservableArray<Data.DropItem>;

		constructor() {
			this.size = new Resco.Size(0, 0);
			this.imageSize = new Resco.Size(0, 0);
			this.containerPosition = new Resco.Position(0, 0);
			this.containerSize = new Resco.Size(0, 0);
			this.imageDataB64 = ko.observable<string>();
			this.isDropActive = ko.observable<boolean>(false);

			this.answers = ko.observableArray<Data.DropItem>();
			this.itemList = new ItemList();

			this.m_imageChanged = false;
		}

		public load(cfg: any): void {
			var groupTemplates = new Resco.Dictionary<string, Data.GroupTemplateItem>();
			var itemPositions = [];

			this.question = cfg.visualQuestion;
			if (this.question.properties.resco_value)
				itemPositions = JSON.parse(this.question.properties.resco_value);

			for (var index = 0; index < cfg.droppableGroups.length; index++) {
				var dropGroup = cfg.droppableGroups[index];
				var groupItem = new Data.GroupItem(dropGroup, cfg.readOnly, cfg.displayNames[index]);
				var grTemplate = groupTemplates.getValue(groupItem.templateId);
				if (!grTemplate) {
					var data = new MobileCRM.DynamicEntity("resco_questiongroup", groupItem.templateId);
					data.properties.resco_label = groupItem.name;
					data.properties.resco_repeatconfig = dropGroup.properties.resco_repeatconfig;
					grTemplate = new Data.GroupTemplateItem(data, cfg.readOnly);
					groupTemplates.set(grTemplate.id, grTemplate);					
				}
				groupItem.groupTemplate = grTemplate;

				if (groupItem.groupTemplate.repeatable) {
					// Check if there is already a item for 'repeating' the group, if not, add one to the item list
					this._updateRepeatableGroupItem(groupItem);
				}

				// Check if the question is positioned. If not, add it to list of postionable items.
				var itemPosition = itemPositions.firstOrDefault(ip => ip.id === groupItem.id);
				if (itemPosition) {
					groupItem.position.left(itemPosition.x);
					groupItem.position.top(itemPosition.y);
					this.addAnswer(groupItem);
				}
				else {
					this.itemList.addItem(groupItem);
				}
			}

			if (!cfg.image) {
				if (MobileCRM.bridge)
					this._capturePhoto();
			}
			else
				this._setImageSource(cfg.image);
		}

		public save(): string {
			var imgBase64 = this.imageDataB64();

			var result = "";

			if (this.m_imageChanged)
				result += (imgBase64 ? imgBase64 : "") + ";";

			var serializedPositions = "";
			for (var answer of this.answers()) {
				serializedPositions += `{"id": "${answer.id}", "x": ${answer.position.left()}, "y": ${answer.position.top()}},`;
			}

			if (serializedPositions)
				result += `[${serializedPositions.substr(0, serializedPositions.length - 1)}]`;
			
			return result;
		}

		public updateDisplayName(grId: string, newDisplayName: string): void {
			var gr = this.answers().firstOrDefault(a => a.id === grId);
			if (!gr)
				gr = this.itemList.items().firstOrDefault(i => i.id === grId);

			if (gr)
				gr.displayName(newDisplayName);
		}

		public canDrop(): boolean {
			return true;
		}

		public drop(draggedItem: any, l: number, t: number): void {
			var answRatio = this.containerSize.width() / this.imageSize.width();
			
			if (draggedItem instanceof Data.GroupTemplateItem) {
				// TODO: show please wait
				if (MobileCRM.bridge) {
					MobileCRM.bridge.command("initNewGroup", draggedItem.id, data => {
						var newGroup = new Data.GroupItem(data, false);
						newGroup.groupTemplate = draggedItem;
						this.addAnswer(newGroup);
						newGroup.ratio(answRatio);
						newGroup.position.left(Math.floor(l / answRatio));
						newGroup.position.top(Math.floor(t / answRatio));

					}, MobileCRM.bridge.alert);
				}
				else {
					var newGroup = new Data.GroupItem(new MobileCRM.DynamicEntity("resco_questiongroup", "1234", "", { resco_templategroupid: draggedItem.id }), false);
					newGroup.groupTemplate = draggedItem;
					this.addAnswer(newGroup);
					newGroup.ratio(answRatio);
					newGroup.position.left(Math.floor(l / answRatio));
					newGroup.position.top(Math.floor(t / answRatio));
				}
				return;
			}

			var answerItem = <Data.DropItem>draggedItem;
			answerItem.ratio(answRatio);
			answerItem.position.left(Math.floor(l / answRatio));
			answerItem.position.top(Math.floor(t / answRatio));
			if (this.answers().indexOf(answerItem) < 0)
				this.addAnswer(answerItem);
		}

		public addAnswer(ans: Data.DropItem): void {
			ans.dragStopped.add(this, this._answerDragStopped);
			this.answers.push(ans);
			this._updateRepeatableGroupItem(ans);
		}

		public removeAnswer(ans: Data.DropItem): void {
			var index = this.answers.indexOf(ans);
			if (index >= 0) {
				var answer = this.answers()[index];
				answer.dragStopped.remove(this, this._answerDragStopped);
				this.answers.splice(index, 1);

				this.itemList.addItem(answer);
				this._updateRepeatableGroupItem(answer);
			}
		}

		private _answerDragStopped(sender: any, e: Data.DragStoppedEventArgs): void {
			if (!e.dropped) {
				// answer was dragged out of the answer area remove it from answser area and add it to item list (it can be positioned later)
				this.removeAnswer(e.item);
			}
		}

		private _updateRepeatableGroupItem(item: Data.DropItem): void {
			if (item instanceof Data.GroupItem) {
				var instancesLength = 1;
				instancesLength += this.answers().filter(answer => answer !== item && answer instanceof Data.GroupItem && answer.templateId === item.templateId).length;
				instancesLength += this.itemList.items().filter(listItem => listItem !== item && listItem instanceof Data.GroupItem && listItem.templateId === item.templateId).length;
				// if there is not yet the item for a repeatable group template and it can be added (maxCount), add it now
				var existingItemIndex = this.itemList.items().findIndex(item => item instanceof Data.GroupTemplateItem && item.id === item.id);
				if (existingItemIndex < 0 && instancesLength < item.groupTemplate.maxRepeat)
					this.itemList.addItem(item.groupTemplate);
				else if (existingItemIndex >= 0 && instancesLength >= item.groupTemplate.maxRepeat)
					this.itemList.removeItemAt(existingItemIndex);
			}
		}

		public appended(elements: HTMLElement[]): void {
			this.m_domRoot = elements.firstOrDefault(el => el.className && el.className.indexOf("visualItem") >= 0);
			this.onResize();
		}

		public onResize(): void {
			this.size.width(this.m_domRoot.clientWidth);
			this.size.height(this.m_domRoot.clientHeight);
			this._recalculatePositions();
		}

		public toggleList(): void {
			this.itemList.visible(!this.itemList.visible());
		}

		public close(): void {
			MobileCRM.bridge.closeForm();
		}

		private _capturePhoto(): void {
			var service = new MobileCRM.Services.DocumentService();
			service.capturePhoto(fileInfo => {
				MobileCRM.Application.fileExists(fileInfo.filePath, function (exists) {
					if (exists)
						MobileCRM.Application.readFileAsBase64(fileInfo.filePath, b64Data => {
							this._setImageSource(b64Data);
							this.m_imageChanged = true;
						}, MobileCRM.bridge.alert, this);
				}, MobileCRM.bridge.alert, this);
			}, MobileCRM.bridge.alert, this);
		}

		private _setImageSource(b64Data: string): void {
			var img = new Image();
			// get the image dimensions
			img.onload = () => {
				this.imageSize.width(img.width);
				this.imageSize.height(img.height);
				this.imageDataB64(b64Data);
				this._recalculatePositions();
			}
			img.src = /*"data:image/png;base64," +*/ b64Data;
		}

		public retakePhoto(): void {
			this._capturePhoto();
		}

		private _recalculatePositions(): void {
			if (this.imageSize.width() === 0 || this.imageSize.height() === 0)
				return;

			var ctrlRatio = this.size.width() / this.size.height();
			var imgRatio = this.imageSize.width() / this.imageSize.height();

			if (ctrlRatio > imgRatio) {
				this.containerPosition.top(0);
				this.containerSize.height(this.size.height());
				this.containerSize.width(this.imageSize.width() * (this.size.height() / this.imageSize.height()))
				this.containerPosition.left((this.size.width() - this.containerSize.width()) / 2);
			}
			else {
				this.containerPosition.left(0);
				this.containerSize.width(this.size.width());
				this.containerSize.height(this.imageSize.height() * (this.size.width() / this.imageSize.width()));
				this.containerPosition.top((this.size.height() - this.containerSize.height()) / 2);
			}

			var answers = this.answers();
			var answRatio = this.containerSize.width() / this.imageSize.width();
			for (var answer of answers) {
				answer.ratio(answRatio);
			}
		}

		private m_imageChanged: boolean;
		private m_domRoot: HTMLElement;
	}
}