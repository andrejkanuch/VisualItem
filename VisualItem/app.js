var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var VisualItem;
(function (VisualItem) {
    var Application = /** @class */ (function () {
        function Application() {
        }
        Application.run = function () {
            return __awaiter(this, void 0, void 0, function () {
                var dummyQ, g1, g2, cfg;
                return __generator(this, function (_a) {
                    $(window).resize(function () {
                        Application.visualItemControl.onResize();
                    });
                    $(window).on({
                        "orientationchange": function () {
                            Application.visualItemControl.onResize();
                        }
                    });
                    if (MobileCRM.bridge && MobileCRM.bridge.platform == "iOS") {
                        MobileCRM.bridge.command("dataDetectorTypes", "None");
                        MobileCRM.bridge.command("setScrollBounce", false);
                    }
                    Application.visualItemControl = new VisualItem.UI.VisualItemController();
                    if (MobileCRM.bridge) {
                        MobileCRM.bridge.command("getConfig", null, function (config) {
                            Application.visualItemControl.load(config);
                        }, MobileCRM.bridge.alert);
                    }
                    else {
                        dummyQ = new MobileCRM.DynamicEntity("resco_question", "");
                        dummyQ.properties.resco_value = "[{\"id\": \"1\", \"x\": 90, \"y\": 90}]";
                        g1 = new MobileCRM.DynamicEntity("resco_questiongroup", "1");
                        g1.properties.resco_repeatconfig = "{\"version\": \"1\"}";
                        g1.properties.resco_label = "employee";
                        g1.properties.resco_templategroupid = new MobileCRM.Reference('resco_questiongroup', 'b21a2578-1d89-414c-93e2-86509ff30936', "Repeatable Group");
                        g2 = new MobileCRM.DynamicEntity("resco_questiongroup", "2");
                        g2.properties.resco_repeatconfig = "";
                        g2.properties.resco_label = "boss";
                        g2.properties.resco_templategroupid = new MobileCRM.Reference('resco_questiongroup', 'e21a2578-1d89-414c-93e2-86509ff30936', "Standard Group");
                        ;
                        cfg = {
                            visualQuestion: dummyQ,
                            droppableGroups: [g1, g2],
                            displayNames: ["grupa 1", "grupa 2"],
                            image: "Images/Edvard-Munch-The-Scream-detail1.jpg"
                            //					image: "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\
                            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\
                            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"
                        };
                        Application.visualItemControl.load(cfg);
                    }
                    Resco.Controls.KOEngine.instance.render(Application.visualItemControl);
                    return [2 /*return*/];
                });
            });
        };
        Application.save = function () {
            return Application.visualItemControl.save();
        };
        Application.updateDisplayName = function (grId, newDisplayName) {
            Application.visualItemControl.updateDisplayName(grId, newDisplayName);
        };
        return Application;
    }());
    VisualItem.Application = Application;
    Application.run();
})(VisualItem || (VisualItem = {}));
//# sourceMappingURL=app.js.map