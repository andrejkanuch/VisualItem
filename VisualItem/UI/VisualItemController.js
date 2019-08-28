var VisualItem;
(function (VisualItem) {
    var UI;
    (function (UI) {
        var VisualItemController = /** @class */ (function () {
            function VisualItemController() {
                this.size = new Resco.Size(0, 0);
                this.imageSize = new Resco.Size(0, 0);
                this.containerPosition = new Resco.Position(0, 0);
                this.containerSize = new Resco.Size(0, 0);
                this.imageDataB64 = ko.observable();
                this.isDropActive = ko.observable(false);
                this.answers = ko.observableArray();
                this.itemList = new UI.ItemList();
                this.m_imageChanged = false;
            }
            VisualItemController.prototype.load = function (cfg) {
                var groupTemplates = new Resco.Dictionary();
                var itemPositions = [];
                this.question = cfg.visualQuestion;
                if (this.question.properties.resco_value)
                    itemPositions = JSON.parse(this.question.properties.resco_value);
                for (var index = 0; index < cfg.droppableGroups.length; index++) {
                    var dropGroup = cfg.droppableGroups[index];
                    var groupItem = new VisualItem.Data.GroupItem(dropGroup, cfg.readOnly, cfg.displayNames[index]);
                    var grTemplate = groupTemplates.getValue(groupItem.templateId);
                    if (!grTemplate) {
                        var data = new MobileCRM.DynamicEntity("resco_questiongroup", groupItem.templateId);
                        data.properties.resco_label = groupItem.name;
                        data.properties.resco_repeatconfig = dropGroup.properties.resco_repeatconfig;
                        grTemplate = new VisualItem.Data.GroupTemplateItem(data, cfg.readOnly);
                        groupTemplates.set(grTemplate.id, grTemplate);
                    }
                    groupItem.groupTemplate = grTemplate;
                    if (groupItem.groupTemplate.repeatable) {
                        // Check if there is already a item for 'repeating' the group, if not, add one to the item list
                        this._updateRepeatableGroupItem(groupItem);
                    }
                    // Check if the question is positioned. If not, add it to list of postionable items.
                    var itemPosition = itemPositions.firstOrDefault(function (ip) { return ip.id === groupItem.id; });
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
            };
            VisualItemController.prototype.save = function () {
                var imgBase64 = this.imageDataB64();
                var result = "";
                if (this.m_imageChanged)
                    result += (imgBase64 ? imgBase64 : "") + ";";
                var serializedPositions = "";
                for (var _i = 0, _a = this.answers(); _i < _a.length; _i++) {
                    var answer = _a[_i];
                    serializedPositions += "{\"id\": \"" + answer.id + "\", \"x\": " + answer.position.left() + ", \"y\": " + answer.position.top() + "},";
                }
                if (serializedPositions)
                    result += "[" + serializedPositions.substr(0, serializedPositions.length - 1) + "]";
                return result;
            };
            VisualItemController.prototype.updateDisplayName = function (grId, newDisplayName) {
                var gr = this.answers().firstOrDefault(function (a) { return a.id === grId; });
                if (!gr)
                    gr = this.itemList.items().firstOrDefault(function (i) { return i.id === grId; });
                if (gr)
                    gr.displayName(newDisplayName);
            };
            VisualItemController.prototype.canDrop = function () {
                return true;
            };
            VisualItemController.prototype.drop = function (draggedItem, l, t) {
                var _this = this;
                var answRatio = this.containerSize.width() / this.imageSize.width();
                if (draggedItem instanceof VisualItem.Data.GroupTemplateItem) {
                    // TODO: show please wait
                    if (MobileCRM.bridge) {
                        MobileCRM.bridge.command("initNewGroup", draggedItem.id, function (data) {
                            var newGroup = new VisualItem.Data.GroupItem(data, false);
                            newGroup.groupTemplate = draggedItem;
                            _this.addAnswer(newGroup);
                            newGroup.ratio(answRatio);
                            newGroup.position.left(Math.floor(l / answRatio));
                            newGroup.position.top(Math.floor(t / answRatio));
                        }, MobileCRM.bridge.alert);
                    }
                    else {
                        var newGroup = new VisualItem.Data.GroupItem(new MobileCRM.DynamicEntity("resco_questiongroup", "1234", "", { resco_templategroupid: draggedItem.id }), false);
                        newGroup.groupTemplate = draggedItem;
                        this.addAnswer(newGroup);
                        newGroup.ratio(answRatio);
                        newGroup.position.left(Math.floor(l / answRatio));
                        newGroup.position.top(Math.floor(t / answRatio));
                    }
                    return;
                }
                var answerItem = draggedItem;
                answerItem.ratio(answRatio);
                answerItem.position.left(Math.floor(l / answRatio));
                answerItem.position.top(Math.floor(t / answRatio));
                if (this.answers().indexOf(answerItem) < 0)
                    this.addAnswer(answerItem);
            };
            VisualItemController.prototype.addAnswer = function (ans) {
                ans.dragStopped.add(this, this._answerDragStopped);
                this.answers.push(ans);
                this._updateRepeatableGroupItem(ans);
            };
            VisualItemController.prototype.removeAnswer = function (ans) {
                var index = this.answers.indexOf(ans);
                if (index >= 0) {
                    var answer = this.answers()[index];
                    answer.dragStopped.remove(this, this._answerDragStopped);
                    this.answers.splice(index, 1);
                    this.itemList.addItem(answer);
                    this._updateRepeatableGroupItem(answer);
                }
            };
            VisualItemController.prototype._answerDragStopped = function (sender, e) {
                if (!e.dropped) {
                    // answer was dragged out of the answer area remove it from answser area and add it to item list (it can be positioned later)
                    this.removeAnswer(e.item);
                }
            };
            VisualItemController.prototype._updateRepeatableGroupItem = function (item) {
                if (item instanceof VisualItem.Data.GroupItem) {
                    var instancesLength = 1;
                    instancesLength += this.answers().filter(function (answer) { return answer !== item && answer instanceof VisualItem.Data.GroupItem && answer.templateId === item.templateId; }).length;
                    instancesLength += this.itemList.items().filter(function (listItem) { return listItem !== item && listItem instanceof VisualItem.Data.GroupItem && listItem.templateId === item.templateId; }).length;
                    // if there is not yet the item for a repeatable group template and it can be added (maxCount), add it now
                    var existingItemIndex = this.itemList.items().findIndex(function (item) { return item instanceof VisualItem.Data.GroupTemplateItem && item.id === item.id; });
                    if (existingItemIndex < 0 && instancesLength < item.groupTemplate.maxRepeat)
                        this.itemList.addItem(item.groupTemplate);
                    else if (existingItemIndex >= 0 && instancesLength >= item.groupTemplate.maxRepeat)
                        this.itemList.removeItemAt(existingItemIndex);
                }
            };
            VisualItemController.prototype.appended = function (elements) {
                this.m_domRoot = elements.firstOrDefault(function (el) { return el.className && el.className.indexOf("visualItem") >= 0; });
                this.onResize();
            };
            VisualItemController.prototype.onResize = function () {
                this.size.width(this.m_domRoot.clientWidth);
                this.size.height(this.m_domRoot.clientHeight);
                this._recalculatePositions();
            };
            VisualItemController.prototype.toggleList = function () {
                this.itemList.visible(!this.itemList.visible());
            };
            VisualItemController.prototype.close = function () {
                MobileCRM.bridge.closeForm();
            };
            VisualItemController.prototype._capturePhoto = function () {
                var _this = this;
                var service = new MobileCRM.Services.DocumentService();
                service.capturePhoto(function (fileInfo) {
                    MobileCRM.Application.fileExists(fileInfo.filePath, function (exists) {
                        var _this = this;
                        if (exists)
                            MobileCRM.Application.readFileAsBase64(fileInfo.filePath, function (b64Data) {
                                _this._setImageSource(b64Data);
                                _this.m_imageChanged = true;
                            }, MobileCRM.bridge.alert, this);
                    }, MobileCRM.bridge.alert, _this);
                }, MobileCRM.bridge.alert, this);
            };
            VisualItemController.prototype._setImageSource = function (b64Data) {
                var _this = this;
                var img = new Image();
                // get the image dimensions
                img.onload = function () {
                    _this.imageSize.width(img.width);
                    _this.imageSize.height(img.height);
                    _this.imageDataB64(b64Data);
                    _this._recalculatePositions();
                };
                img.src = /*"data:image/png;base64," +*/ b64Data;
            };
            VisualItemController.prototype.retakePhoto = function () {
                this._capturePhoto();
            };
            VisualItemController.prototype._recalculatePositions = function () {
                if (this.imageSize.width() === 0 || this.imageSize.height() === 0)
                    return;
                var ctrlRatio = this.size.width() / this.size.height();
                var imgRatio = this.imageSize.width() / this.imageSize.height();
                if (ctrlRatio > imgRatio) {
                    this.containerPosition.top(0);
                    this.containerSize.height(this.size.height());
                    this.containerSize.width(this.imageSize.width() * (this.size.height() / this.imageSize.height()));
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
                for (var _i = 0, answers_1 = answers; _i < answers_1.length; _i++) {
                    var answer = answers_1[_i];
                    answer.ratio(answRatio);
                }
            };
            return VisualItemController;
        }());
        UI.VisualItemController = VisualItemController;
    })(UI = VisualItem.UI || (VisualItem.UI = {}));
})(VisualItem || (VisualItem = {}));
//# sourceMappingURL=visualItemController.js.map