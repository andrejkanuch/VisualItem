/// <reference path="../Libraries/knockout.d.ts" />
var Resco;
(function (Resco) {
    var UI;
    (function (UI) {
        var Command = /** @class */ (function () {
            function Command(obj, n, l, i, act, actOwner) {
                this.name = n;
                this.label = l;
                this.image = ko.observable(i);
                this.imageInv = ko.observable(i);
                this.m_arg = obj;
                this.m_action = act;
                this.m_actOwner = actOwner;
            }
            Command.prototype.execute = function () {
                if (this.m_action) {
                    if (this.m_actOwner) {
                        this.m_action.call(this.m_actOwner, this.m_arg);
                    }
                    else {
                        this.m_action(this.m_arg);
                    }
                }
            };
            return Command;
        }());
        UI.Command = Command;
    })(UI = Resco.UI || (Resco.UI = {}));
})(Resco || (Resco = {}));
//# sourceMappingURL=command.js.map