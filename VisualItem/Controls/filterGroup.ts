/// <reference path="../Libraries/knockout.d.ts" />
/// <reference path="../Helpers/common.ts" />
/// <reference path="event.ts" />

module Resco.UI {
    export class FilterItem {
        public name: string;
        public label: string;
        public selectedIndex: KnockoutObservable<number>;
        public isMultiSelect: KnockoutObservable<boolean>;
        public changed: Resco.Event<Resco.EventArgs>;

        private m_selectedItems: KnockoutObservableArray<number>;
        private m_values: Array<Resco.KeyValuePair<string, any>>;

        get values(): Array<Resco.KeyValuePair<string, any>> {
            return this.m_values;
        }

        set values(v: Array<Resco.KeyValuePair<string, any>>) {
            this.m_values = v;
            this.selectedIndex(0);
            this.m_selectedItems = null;
        }

        get selectedItems(): KnockoutObservableArray<number> {
            if (this.m_selectedItems == null) {
                this.m_selectedItems = ko.observableArray<number>();
            }
            return this.m_selectedItems;
        }

        get selection(): Resco.KeyValuePair<string, any> {
            var selIndex = this.selectedIndex();
            if (this.m_values && selIndex >= 0 && selIndex < this.m_values.length) {
                return this.m_values[selIndex];
            }
            return new Resco.KeyValuePair<string, any>("", null);
        }

        set selectedValue(value: any) {
            this.setSelection(value, true);
        }

        get selectedValue(): any {
            return this.selection.value;
        }

        set selectedText(text: string) {
            this.setSelection(text, false);
        }

        get selectedText(): string {
            if (this.isMultiSelect()) {
                var result: string = "";
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
        }

        constructor(name: string, label: string, values: Array<Resco.KeyValuePair<string, any>>) {
            this.name = name;
            this.label = label;
            this.m_values = values ? values : new Array<Resco.KeyValuePair<string, any>>();
            this.changed = new Resco.Event<Resco.EventArgs>(this);
            this.selectedIndex = ko.observable(0);
            this.isMultiSelect = ko.observable(false);
        }

        public addOption(label: string, value: any) {
            this.m_values.push(new Resco.KeyValuePair<string, any>(label, value));
        }

        public addOptions(options: any[]) {
            if (options && (options.length % 2) == 0) {
                for (var i = 0; i < options.length;) {
                    this.addOption(options[i++], options[i++]);
                }
            }
        }

        public setSelection(value: any, byValue: boolean) {
            if (this.m_values) {
                var text: string = !byValue ? <string>value : null;

                for (var i = 0; i < this.m_values.length; i++) {
                    if ((byValue && this.m_values[i].value === value) || (!byValue && this.m_values[i].key == text)) {
                        this.selectedIndex(i);
                        break;
                    }
                }
            }
        }

        public onChanged() {
            this.changed.raise(Resco.EventArgs.Empty, this);
        }
    }

    export class FilterGroup {
        constructor() {
            this.filters = new Array<FilterItem>();
        }

        public filters: Array<FilterItem>;

        public getFilterAtIndex(index: number): FilterItem {
            if (index >= 0 && index < this.filters.length) {
                return this.filters[index];
            }
            return null;
        }

        public getFilter(name: string): FilterItem {
            for (var i = 0; i < this.filters.length; i++) {
                if (this.filters[i].name == name) {
                    return this.filters[i];
                }
            }
            return null;
        }
    }
}
