var VisualItem;
(function (VisualItem) {
    Resco.Controls.KOEngine.instance.addCustomBinding("cbDragItem", function (element, valueAccessor, allBindings, viewModel) {
        var draggedItem = ko.utils.unwrapObservable(valueAccessor());
        if (draggedItem.canDrag) {
            $(element).draggable({
                start: function (event, ui) {
                    ui.helper.data('dropped', false);
                    ui.helper.data('dragdata', draggedItem);
                    draggedItem.onDragStarted();
                },
                stop: function (event, ui) {
                    var dropped = ui.helper.data('dropped');
                    ui.helper.data('dragdata', null);
                    draggedItem.onDragStopped(dropped);
                },
                drag: function (event, ui) {
                    //var me = <MouseEvent>event;
                    //draggedItem.onDrag(me.clientX, me.clientY);
                },
                helper: function () {
                    var helper = $("<div class=\"draggableItemGhostContainer\" style=\"opacity: 0.75\" data-bind=\"template: { name: dragGhostTemplateName }\" />");
                    ko.applyBindings(draggedItem, helper[0]);
                    return helper[0];
                },
                appendTo: "body",
                cursor: "pointer",
                refreshPositions: true,
                scroll: false,
            });
        }
    });
    Resco.Controls.KOEngine.instance.addCustomBinding("cbDropZone", function (element, valueAccessor, allBindings, viewModel) {
        var dropZone = ko.utils.unwrapObservable(valueAccessor());
        $(element).droppable({
            accept: function (draggable) {
                return dropZone.canDrop();
            },
            over: function (event, ui) {
                dropZone.isDropActive(true);
            },
            out: function (event, ui) {
                dropZone.isDropActive(false);
            },
            drop: function (event, ui) {
                ui.helper.data('dropped', true);
                var draggedItem = ui.helper.data('dragdata');
                dropZone.drop(draggedItem, ui.offset.left - $(this).offset().left, ui.offset.top - $(this).offset().top);
            },
            tolerance: "pointer"
        });
    });
})(VisualItem || (VisualItem = {}));
//# sourceMappingURL=dragAndDrop.js.map