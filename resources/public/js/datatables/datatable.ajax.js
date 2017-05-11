!function (e) {
    "use strict";
    var a = function (e, a) {
        var t = this;
        e.each(function () {
            var o = $(this);
            o.closest(".table-container").hasClass("initialized") || t.initEachItem(e, a)
        })
    };
    a.prototype.initEachItem = function (e, a) {
        var t = new Xcms.DataTable(e, a);
        t.getTableWrapper().on("confirmed.bs.confirmation", ".table-group-action-submit", function (e) {
            e.preventDefault();
            var a = $(".table-group-action-input", t.getTableWrapper());
            "" != a.val() && t.getSelectedRowsCount() > 0 ? (t.setAjaxParam("customActionType", "group_action"), t.setAjaxParam("customActionValue", a.val()), t.setAjaxParam("id", t.getSelectedRows()), t.getDataTable().ajax.reload(), t.clearAjaxParams(), t.getTableWrapper().find("input[name=group_checkable]").prop("checked", !1), setTimeout(function () {
            }, 0)) : "" == a.val() ? Xcms.showNotification("Please select an action", "danger") : 0 === t.getSelectedRowsCount() && Xcms.showNotification("No record selected", "warning")
        }), t.getTableWrapper().on("confirmed.bs.confirmation", ".ajax-link", function (e) {
            e.preventDefault();
            var o = $(this);
            $.ajax({
                url: o.attr("data-ajax"),
                type: o.attr("data-method") || "POST",
                dataType: "json",
                beforeSend: function () {
                    Xcms.blockUI({target: t.getTableWrapper()})
                },
                success: function (e) {
                    a.ajaxActionsSuccess && a.ajaxActionsSuccess.call(void 0, o, e)
                },
                complete: function (e) {
                    t.getTableWrapper().find(".blockUI").remove(), "undefined" != typeof e.responseJSON ? e.responseJSON.error ? Xcms.showNotification(e.responseJSON.messages, "danger") : Xcms.showNotification(e.responseJSON.messages, "success") : Xcms.showNotification("Some error occurred. View console log for more information", "danger"), t.getDataTable().ajax.reload()
                }
            })
        }), t.getTableWrapper().on("keyup", ".filter input", function (e) {
            13 == e.which && t.getDataTableHelper().submitFilter()
        })
    }, window.Xcms.DataTableAjax = a
}(this.LaravelElixirBundle = this.LaravelElixirBundle || {});
//# sourceMappingURL=Xcms.datatable.ajax.js.map
