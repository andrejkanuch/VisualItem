var Resco;
(function (Resco) {
    var Controls;
    (function (Controls) {
        var KOEngine = /** @class */ (function () {
            function KOEngine() {
                this.m_templates = new Resco.Dictionary();
                this.m_customBindings = new Resco.Dictionary();
            }
            Object.defineProperty(KOEngine, "instance", {
                get: function () {
                    if (!KOEngine.m_instance)
                        KOEngine.m_instance = new KOEngine();
                    return KOEngine.m_instance;
                },
                enumerable: true,
                configurable: true
            });
            KOEngine.prototype.addTemplate = function (name, markup) {
                if (this.m_templates.containsKey(name))
                    throw new Resco.Exception("Knockout template with name '" + name + "' already exists.");
                this.m_templates.set(name, markup);
            };
            KOEngine.prototype.addCustomBinding = function (bindingName, initFn, updateFn) {
                if (this.m_customBindings.containsKey(bindingName))
                    throw new Resco.Exception("Knockout custom binding with name '" + bindingName + "' already exists.");
                var bindingHandler = {};
                if (initFn)
                    bindingHandler.init = initFn;
                if (updateFn)
                    bindingHandler.update = updateFn;
                this.m_customBindings.set(bindingName, bindingHandler);
            };
            KOEngine.prototype.render = function (model, rootNode) {
                var _this = this;
                // write templates to document
                this.m_templates.getKeys().forEach(function (key) { return document.write("<script type='text/html' id='" + key + "'>" + _this.m_templates.getValue(key) + "</script>"); });
                // register custom bindings
                this.m_customBindings.getKeys().forEach(function (key) { return ko.bindingHandlers[key] = _this.m_customBindings.getValue(key); });
                // render the model
                ko.applyBindings(model, rootNode);
            };
            return KOEngine;
        }());
        Controls.KOEngine = KOEngine;
    })(Controls = Resco.Controls || (Resco.Controls = {}));
})(Resco || (Resco = {}));
//# sourceMappingURL=koEngine.js.map