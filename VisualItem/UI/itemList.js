var VisualItem;
(function (VisualItem) {
    var UI;
    (function (UI) {
        var ItemList = /** @class */ (function () {
            function ItemList() {
                this.items = ko.observableArray();
                this.visible = ko.observable(false);
            }
            ItemList.prototype.addItem = function (item) {
                item.dragStarted.add(this, this._itemDragStarted);
                item.dragStopped.add(this, this._itemDragStopped);
                this.items.push(item);
            };
            ItemList.prototype.removeItem = function (q) {
                var index = this.items.indexOf(q);
                if (index >= 0)
                    this.removeItemAt(index);
            };
            ItemList.prototype.removeItemAt = function (index) {
                var item = this.items()[index];
                item.dragStarted.remove(this, this._itemDragStarted);
                item.dragStopped.remove(this, this._itemDragStopped);
                this.items.splice(index, 1);
            };
            ItemList.prototype._itemDragStarted = function (sender, e) {
                if (this.visible())
                    this.visible(false);
            };
            ItemList.prototype._itemDragStopped = function (sender, e) {
                if (e.dropped) {
                    // item was dropped -> remove it from list if it was not a template
                    if (!(e.item instanceof VisualItem.Data.GroupTemplateItem))
                        this.removeItem(e.item);
                }
            };
            return ItemList;
        }());
        UI.ItemList = ItemList;
    })(UI = VisualItem.UI || (VisualItem.UI = {}));
})(VisualItem || (VisualItem = {}));
//# sourceMappingURL=itemList.js.map