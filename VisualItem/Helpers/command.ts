/// <reference path="../Libraries/knockout.d.ts" />

module Resco.UI {
    export interface ICommand {
        name: string;
        label: string;
        image: KnockoutObservable<string>;
        imageInv: KnockoutObservable<string>;
        execute: () => void;
    }

    export interface IMultiCommand extends ICommand {
        labels: string[];
        defaultText: string;
        selection: number;
    }

    export class Command<T> implements ICommand {
        public name: string;
        public label: string;
        public image: KnockoutObservable<string>;
        public imageInv: KnockoutObservable<string>;

        private m_action: (arg: T) => void;
        private m_arg: T;
        private m_actOwner: any;

        constructor(obj: T, n: string, l: string, i: string, act: (arg: T) => void, actOwner: any) {
            this.name = n;
            this.label = l;
            this.image = ko.observable(i);
            this.imageInv = ko.observable(i);
            this.m_arg = obj;
            this.m_action = act;
            this.m_actOwner = actOwner;
        }

        public execute() {
            if (this.m_action) {
                if (this.m_actOwner) {
                    this.m_action.call(this.m_actOwner, this.m_arg);
                }
                else {
                    this.m_action(this.m_arg);
                }
            }
        }
    }
}
