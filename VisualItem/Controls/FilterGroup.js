/// <reference path="../Libraries/knockout.d.ts" />
/// <reference path="../Helpers/common.ts" />
/// <reference path="event.ts" />
var Resco;
(function (Resco) {
    var UI;
    (function (UI) {
        var FilterItem = /** @class */ (function () {
            function FilterItem(name, label, values) {
                this.name = name;
                this.label = label;
                this.m_values = values ? values : new Array();
                this.changed = new Resco.Event(this);
                this.selectedIndex = ko.observable(0);
                this.isMultiSelect = ko.observable(false);
            }
            Object.defineProperty(FilterItem.prototype, "values", {
                get: function () {
                    return this.m_values;
                },
                set: function (v) {
                    this.m_values = v;
                    this.selectedIndex(0);
                    this.m_selectedItems = null;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FilterItem.prototype, "selectedItems", {
                get: function () {
                    if (this.m_selectedItems == null) {
                        this.m_selectedItems = ko.observableArray();
                    }
                    return this.m_selectedItems;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FilterItem.prototype, "selection", {
                get: function () {
                    var selIndex = this.selectedIndex();
                    if (this.m_values && selIndex >= 0 && selIndex < this.m_values.length) {
                        return this.m_values[selIndex];
                    }
                    return new Resco.KeyValuePair("", null);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FilterItem.prototype, "selectedValue", {
                get: function () {
                    return this.selection.value;
                },
                set: function (value) {
                    this.setSelection(value, true);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FilterItem.prototype, "selectedText", {
                get: function () {
                    if (this.isMultiSelect()) {
                        var result = "";
                        if (this.m_values && this.m_selectedItems && this.m_selectedItems.length > 0) {
                            for (var i = 0; i < this.m_values.length; i++) {
                                if (this.m_selectedItems.indexOf(i) >= 0) {
                                    if (result.length > 0) {
                                        result += ", ";
                                    }
                                    result += this.m_values[i].key;
                                }
                            }
                        }
                        return result;
                    }
                    return this.selection.key;
                },
                set: function (text) {
                    this.setSelection(text, false);
                },
                enumerable: true,
                configurable: true
            });
            FilterItem.prototype.addOption = function (label, value) {
                this.m_values.push(new Resco.KeyValuePair(label, value));
            };
            FilterItem.prototype.addOptions = function (options) {
                if (options && (options.length % 2) == 0) {
                    for (var i = 0; i < options.length;) {
                        this.addOption(options[i++], options[i++]);
                    }
                }
            };
            FilterItem.prototype.setSelection = function (value, byValue) {
                if (this.m_values) {
                    var text = !byValue ? value : null;
                    for (var i = 0; i < this.m_values.length; i++) {
                        if ((byValue && this.m_values[i].value === value) || (!byValue && this.m_values[i].key == text)) {
                            this.selectedIndex(i);
                            break;
                        }
                    }
                }
            };
            FilterItem.prototype.onChanged = function () {
                this.changed.raise(Resco.EventArgs.Empty, this);
            };
            return FilterItem;
        }());
        UI.FilterItem = FilterItem;
        var FilterGroup = /** @class */ (function () {
            function FilterGroup() {
                this.filters = new Array();
            }
            FilterGroup.prototype.getFilterAtIndex = function (index) {
                if (index >= 0 && index < this.filters.length) {
                    return this.filters[index];
                }
                return null;
            };
            FilterGroup.prototype.getFilter = function (name) {
                for (var i = 0; i < this.filters.length; i++) {
                    if (this.filters[i].name == name) {
                        return this.filters[i];
                    }
                }
                return null;
            };
            return FilterGroup;
        }());
        UI.FilterGroup = FilterGroup;
    })(UI = Resco.UI || (Resco.UI = {}));
})(Resco || (Resco = {}));
//# sourceMappingURL=filterGroup.js.map