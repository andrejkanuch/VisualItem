/// <reference path="../Controls/event.ts" />
/// <reference path="exception.ts" />
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
    function isINotifyListChanged(obj) {
        // hack. chcek if obj has function moveNextCompleted, queryCompleted and that it has add, remove and raise methods ( -> assume it has event moveNextCompleted, queryCompleted in that case)
        if (obj && (typeof obj.listChanged === "object") && (typeof obj.listChanged.raise === "function") && (typeof obj.listChanged.add === "function") && (typeof obj.listChanged.remove === "function")) {
            return true;
        }
        return false;
    }
    Resco.isINotifyListChanged = isINotifyListChanged;
    var ListChangedType;
    (function (ListChangedType) {
        ListChangedType[ListChangedType["Reset"] = 0] = "Reset";
        ListChangedType[ListChangedType["ItemAdded"] = 1] = "ItemAdded";
        ListChangedType[ListChangedType["ItemDeleted"] = 2] = "ItemDeleted";
        ListChangedType[ListChangedType["ItemMoved"] = 3] = "ItemMoved";
        ListChangedType[ListChangedType["ItemChanged"] = 4] = "ItemChanged";
    })(ListChangedType = Resco.ListChangedType || (Resco.ListChangedType = {}));
    var ListChangedEventArgs = /** @class */ (function (_super) {
        __extends(ListChangedEventArgs, _super);
        function ListChangedEventArgs(listChangedType, item, newIndex, oldIndex) {
            var _this = _super.call(this) || this;
            _this.listChangedType = listChangedType;
            _this.newIndex = newIndex;
            _this.oldIndex = oldIndex;
            _this.item = item;
            return _this;
        }
        return ListChangedEventArgs;
    }(Resco.EventArgs));
    Resco.ListChangedEventArgs = ListChangedEventArgs;
    var BindingList = /** @class */ (function () {
        function BindingList(source) {
            var _this = this;
            this.m_enumerPosition = -1;
            this.current = null;
            this.m_list = new Array();
            if (source) {
                source.forEach(function (s) { return _this.m_list.push(s); });
            }
            this.listChanged = new Resco.Event(this);
            this.raiseChangedEvents = true;
        }
        BindingList.prototype.add = function (value) {
            this._insertItem(-1, value);
            return this.m_list.length - 1;
        };
        BindingList.prototype.insert = function (index, value) {
            this._insertItem(index, value);
        };
        BindingList.prototype._removeItem = function (index, bDontRaiseEvent) {
            if (index >= 0 && index < this.m_list.length) {
                var item = this.m_list[index];
                this._removePropertyChangedHandler(item);
                this.m_list.splice(index, 1);
                this._onListChanged(ListChangedType.ItemDeleted, item, null, index, bDontRaiseEvent);
            }
        };
        BindingList.prototype._insertItem = function (index, value) {
            if (index < 0) {
                index = this.m_list.length;
                this.m_list.push(value);
            }
            else {
                if (index > this.m_list.length) {
                    index = this.m_list.length;
                }
                this.m_list.splice(index, 0, value);
            }
            this._onListChanged(ListChangedType.ItemAdded, value, index);
            this._addPropertyChangedHandler(value);
        };
        BindingList.prototype.remove = function (value) {
            var list = this.m_list;
            for (var i = 0; i < list.length; i++) {
                if (typeof value.equals === "function") { // try to use equals function if possible
                    if (value.equals(list[i])) {
                        this._removeItem(i);
                        break;
                    }
                }
                else if (list[i] === value) {
                    this._removeItem(i);
                    break;
                }
            }
        };
        BindingList.prototype.removeAt = function (index, bDontRaiseEvent) {
            this._removeItem(index, bDontRaiseEvent);
        };
        BindingList.prototype.clear = function () {
            var _this = this;
            this.m_list.forEach(function (item) { return _this._removePropertyChangedHandler(item); });
            this.m_list.splice(0);
            this._onListChanged(ListChangedType.Reset);
        };
        BindingList.prototype.contains = function (value) {
            return this.indexOf(value) >= 0;
        };
        BindingList.prototype.indexOf = function (value) {
            var list = this.m_list;
            var valueIsIComparable = Resco.isIComparable(value);
            for (var i = 0; i < list.length; i++) {
                if (valueIsIComparable && value.compareTo(list[i]) == 0) {
                    return i;
                }
                else if (list[i] === value) {
                    return i;
                }
            }
            return -1;
        };
        BindingList.prototype.get = function (index) {
            if (index >= 0 && index < this.m_list.length) {
                return this.m_list[index];
            }
            return null;
        };
        BindingList.prototype.set = function (index, value) {
            if (index >= 0 && index < this.m_list.length) {
                this.m_list[index] = value;
                this._onListChanged(ListChangedType.ItemChanged, value, index);
            }
        };
        BindingList.prototype.move = function (oldIndex, newIndex) {
            if (oldIndex >= 0 && oldIndex < this.m_list.length && newIndex >= 0 && newIndex < this.m_list.length && oldIndex != newIndex) {
                var item = this.m_list[oldIndex];
                this.m_list.splice(oldIndex, 1);
                this.m_list.splice(newIndex, 0, item);
                this._onListChanged(ListChangedType.ItemMoved, item, newIndex, oldIndex);
            }
        };
        Object.defineProperty(BindingList.prototype, "length", {
            get: function () {
                return this.m_list.length;
            },
            enumerable: true,
            configurable: true
        });
        BindingList.prototype.getEnumerator = function () {
            return this;
        };
        BindingList.prototype.moveNext = function () {
            if (this.m_enumerPosition++ < this.m_list.length - 1) {
                this.current = this.m_list[this.m_enumerPosition];
                return true;
            }
            this.current = null;
            return false;
        };
        BindingList.prototype.reset = function () {
            this.m_enumerPosition = -1;
            this.current = null;
        };
        BindingList.prototype._onListChanged = function (listChangedType, item, newIndex, oldIndex, bDontRaiseEvent) {
            if (listChangedType == ListChangedType.Reset) {
                this.reset();
            }
            else if (listChangedType == ListChangedType.ItemDeleted) {
                if (oldIndex <= this.m_enumerPosition) {
                    this.m_enumerPosition--;
                }
            }
            else if (listChangedType == ListChangedType.ItemAdded) {
                if (newIndex <= this.m_enumerPosition) {
                    this.m_enumerPosition++;
                }
            }
            else if (listChangedType == ListChangedType.ItemMoved) {
                if (oldIndex > this.m_enumerPosition && newIndex <= this.m_enumerPosition) {
                    this.m_enumerPosition++;
                }
                else if (oldIndex <= this.m_enumerPosition && newIndex > this.m_enumerPosition) {
                    this.m_enumerPosition--;
                }
            }
            if (this.raiseChangedEvents && !bDontRaiseEvent) {
                this.listChanged.raise(new ListChangedEventArgs(listChangedType, item, newIndex, oldIndex), this);
            }
        };
        BindingList.prototype._onItemPropertyChanged = function (sender, e) {
            var index = this.m_list.indexOf(sender);
            this._onListChanged(ListChangedType.ItemChanged, sender, index);
        };
        BindingList.prototype._addPropertyChangedHandler = function (item) {
            if (Resco.isINotifyPropertyChanged(item)) {
                item.propertyChanged.add(this, this._onItemPropertyChanged);
            }
        };
        BindingList.prototype._removePropertyChangedHandler = function (item) {
            if (Resco.isINotifyPropertyChanged(item)) {
                item.propertyChanged.remove(this, this._onItemPropertyChanged);
            }
        };
        Object.defineProperty(BindingList.prototype, "list", {
            get: function () {
                return this.m_list;
            },
            enumerable: true,
            configurable: true
        });
        BindingList.as = function (obj) {
            if (obj instanceof BindingList) {
                return obj;
            }
            return null;
        };
        return BindingList;
    }());
    Resco.BindingList = BindingList;
    var AsyncBindingList = /** @class */ (function () {
        function AsyncBindingList(loadSource, updateSource, onAsyncItemInserting, onAsyncItemInsertingSource) {
            var _this = this;
            this.m_loadSource = loadSource;
            this.m_loadEnumerator = this.m_loadSource.getEnumerator();
            this.m_updateEnumerator = updateSource.getEnumerator();
            this.m_position = -1;
            this.m_loadingFinished = false;
            this.m_list = new Array();
            this.listChanged = new Resco.Event(this);
            this.queryCompleted.add(this, function (sender, args) {
                _this.m_loadingFinished = true;
            });
            this.m_onAsyncItemInserting = onAsyncItemInserting;
            this.m_onAsyncItemInsertingSource = onAsyncItemInsertingSource;
        }
        Object.defineProperty(AsyncBindingList.prototype, "canMoveNext", {
            get: function () {
                return this.m_loadSource.canMoveNext;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AsyncBindingList.prototype, "queryCompleted", {
            get: function () {
                return this.m_loadSource.queryCompleted;
            },
            enumerable: true,
            configurable: true
        });
        AsyncBindingList.prototype.getEnumerator = function () {
            return this;
        };
        Object.defineProperty(AsyncBindingList.prototype, "current", {
            get: function () {
                return this.m_loadEnumerator.current;
            },
            enumerable: true,
            configurable: true
        });
        AsyncBindingList.prototype.moveNext = function () {
            var result = this.m_loadEnumerator.moveNext();
            if (result && this.current) {
                this.m_list.push(this.current);
            }
            return result;
        };
        AsyncBindingList.prototype.reset = function () {
            this.m_list.splice(0);
            this.m_position = -1;
            this.m_loadingFinished = false;
            this.m_loadEnumerator.reset();
        };
        AsyncBindingList.prototype.update = function () {
            var _this = this;
            if (this.m_updateInterval) {
                console.log("update postponed");
                return;
            }
            this.m_updateEnumerator.reset();
            var position = 0;
            var waitForAsyncResult = false;
            var oldListLength = this.m_list.length;
            this.m_updateInterval = window.setInterval(function () {
                // move until we reach end of previous enumeration
                while (!waitForAsyncResult) {
                    var moveNextResult = _this.m_updateEnumerator.moveNext();
                    // no more items or we checked all previous items and loadEnumerator still works 
                    // (if so, let the loading enumerator do the rest of the work and load the data, otherwise just update the list with current update enumerator)
                    if (!moveNextResult || (position >= oldListLength && !_this.m_loadingFinished)) {
                        // remove items that are on the end of the list
                        for (var i = position; i < oldListLength; i++) {
                            _this.m_list.splice(position, 1);
                            _this.listChanged.raise(new ListChangedEventArgs(ListChangedType.ItemDeleted, removedItem, -1, position), _this);
                        }
                        window.clearInterval(_this.m_updateInterval);
                        _this.m_updateInterval = null;
                        console.log("update interval cleared");
                        break;
                    }
                    var current = _this.m_updateEnumerator.current;
                    if (!current) {
                        // wait next 10ms and check again
                        break;
                    }
                    var positionInList = _this._getPositionInList(current);
                    if (positionInList >= 0) {
                        // remove all items between the current position and the old items position in list (we are sorted, so the items between are not in enumeration anymore)
                        for (var i = position; i < positionInList; i++) {
                            var removedItem = _this.m_list[position];
                            _this.m_list.splice(position, 1); // remove from same position (items will shit position)
                            _this.listChanged.raise(new ListChangedEventArgs(ListChangedType.ItemDeleted, removedItem, -1, position), _this);
                            oldListLength--;
                        }
                    }
                    else {
                        // this functionality is implemented because of the emails (the email update enumerator is downloading only email ids and we need to download full email when inserting it to list)
                        // for that there is an option to define a method that asynchronously obtains the item from any source (this method is optional and set in constructor)
                        if (_this.m_onAsyncItemInserting) {
                            waitForAsyncResult = true;
                            _this.m_onAsyncItemInserting.call(_this.m_onAsyncItemInsertingSource ? _this.m_onAsyncItemInsertingSource : _this, current, position, function (item, index) {
                                _this._insertItem(index, item);
                                waitForAsyncResult = false;
                                position++;
                            });
                            break;
                        }
                        else {
                            _this._insertItem(position, current);
                        }
                    }
                    position++;
                }
            }, 10);
            // Update the cached list (add new and remove deleted items from cache) until we reach the end of the list, then continue with enumeration as normal (wait for moveNext, etc...)
        };
        AsyncBindingList.prototype._insertItem = function (index, item) {
            this.m_list.splice(index, 0, item); // TODO: download email if it has only ID field set
            this.listChanged.raise(new ListChangedEventArgs(ListChangedType.ItemAdded, item, index, -1), this);
        };
        AsyncBindingList.prototype._getPositionInList = function (item) {
            for (var i = 0; i < this.m_list.length; i++) {
                if (item.compareTo(this.m_list[i]) == 0) {
                    return i;
                }
            }
            return -1;
        };
        AsyncBindingList.as = function (obj) {
            if (obj instanceof AsyncBindingList) {
                return obj;
            }
            return null;
        };
        return AsyncBindingList;
    }());
    Resco.AsyncBindingList = AsyncBindingList;
})(Resco || (Resco = {}));
//# sourceMappingURL=bindingList.js.map