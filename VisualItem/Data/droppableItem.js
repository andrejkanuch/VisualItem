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
var VisualItem;
(function (VisualItem) {
    var Data;
    (function (Data) {
        var DropItem = /** @class */ (function () {
            function DropItem(data, bReadOnly) {
                var _this = this;
                this.m_data = data;
                this.ratio = ko.observable(1);
                this.position = new Resco.Position(0, 0);
                this.displayPositionLeft = ko.computed(function () {
                    return _this.position.left() * _this.ratio();
                });
                this.displayPositionTop = ko.computed(function () {
                    return _this.position.top() * _this.ratio();
                });
                this.canDrag = !bReadOnly;
                this.dragged = ko.observable(false);
                if (this.name)
                    this.imageUrl = "url(\"Images/" + this.name.toLowerCase() + ".png\")";
                this.dragGhostTemplateName = "tmplDraggedItem";
                this.dragStarted = new Resco.Event(this);
                this.dragStopped = new Resco.Event(this);
                this.displayName = ko.observable(this.name);
            }
            Object.defineProperty(DropItem.prototype, "name", {
                get: function () {
                    return this.m_data.properties.resco_label;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DropItem.prototype, "id", {
                get: function () {
                    return this.m_data.id;
                },
                enumerable: true,
                configurable: true
            });
            DropItem.prototype.onDragStarted = function () {
                this.dragged(true);
                this.dragStarted.raise(new DropItemEventArgs(this), this);
            };
            DropItem.prototype.onDragStopped = function (dropped) {
                this.dragged(false);
                this.dragStopped.raise(new DragStoppedEventArgs(this, dropped), this);
                //this._onDragStopped(dropped);
            };
            DropItem.prototype.showDetails = function () {
                var _this = this;
                // open the native form			
                MobileCRM.bridge.command("editItem", JSON.stringify({ id: this.id, left: Math.floor(this.m_domRoot.offsetLeft + this.m_domRoot.parentNode.offsetLeft), top: Math.floor(this.m_domRoot.offsetTop + this.m_domRoot.parentNode.offsetTop) }), function (response) {
                    _this.displayName(response);
                }, MobileCRM.bridge.alert);
            };
            DropItem.prototype.appended = function (elements) {
                this.m_domRoot = elements.firstOrDefault(function (el) { return el.className && el.className.indexOf("answerItem") >= 0; });
            };
            return DropItem;
        }());
        Data.DropItem = DropItem;
        var GroupTemplateItem = /** @class */ (function (_super) {
            __extends(GroupTemplateItem, _super);
            function GroupTemplateItem(data, bReadOnly) {
                var _this = _super.call(this, data, bReadOnly) || this;
                if (data.properties.resco_repeatconfig) {
                    var repeatConfig = JSON.parse(data.properties.resco_repeatconfig);
                    _this.repeatable = true;
                    _this.minRepeat = repeatConfig.minCount === undefined ? 0 : repeatConfig.minCount;
                    _this.maxRepeat = repeatConfig.maxCount === undefined ? 1000000000 : repeatConfig.maxCount;
                }
                else {
                    _this.repeatable = false;
                }
                _this.dragGhostTemplateName = "tmplDraggedGroupTemplate";
                _this.displayName("New " + _this.name);
                return _this;
            }
            return GroupTemplateItem;
        }(DropItem));
        Data.GroupTemplateItem = GroupTemplateItem;
        var GroupItem = /** @class */ (function (_super) {
            __extends(GroupItem, _super);
            function GroupItem(data, bReadOnly, displayName) {
                var _this = _super.call(this, data, bReadOnly) || this;
                _this.dragGhostTemplateName = "tmplDraggedGroup";
                if (displayName)
                    _this.displayName(displayName);
                return _this;
            }
            Object.defineProperty(GroupItem.prototype, "templateId", {
                get: function () {
                    if (this.m_data)
                        return this.m_data.properties.resco_templategroupid.id;
                    return null;
                },
                enumerable: true,
                configurable: true
            });
            return GroupItem;
        }(DropItem));
        Data.GroupItem = GroupItem;
        var DropItemEventArgs = /** @class */ (function (_super) {
            __extends(DropItemEventArgs, _super);
            function DropItemEventArgs(item) {
                var _this = _super.call(this) || this;
                _this.item = item;
                return _this;
            }
            return DropItemEventArgs;
        }(Resco.EventArgs));
        Data.DropItemEventArgs = DropItemEventArgs;
        var DragStoppedEventArgs = /** @class */ (function (_super) {
            __extends(DragStoppedEventArgs, _super);
            function DragStoppedEventArgs(item, dropped) {
                var _this = _super.call(this, item) || this;
                _this.dropped = dropped;
                return _this;
            }
            return DragStoppedEventArgs;
        }(DropItemEventArgs));
        Data.DragStoppedEventArgs = DragStoppedEventArgs;
    })(Data = VisualItem.Data || (VisualItem.Data = {}));
})(VisualItem || (VisualItem = {}));
//# sourceMappingURL=droppableItem.js.map