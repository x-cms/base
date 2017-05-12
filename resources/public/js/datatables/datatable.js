!function (t) {
    "use strict";
    var e = function (t, e) {
        if (void 0 === e && (e = {}), t) {
            this.datatable = null, this.$table = t, this.ajaxParams = {};
            var a = this, o = {
                loadingMessage: "Loading...",
                onSuccess: function (t, e) {
                    Xcms.initAjax()
                },
                onError: function (t) {
                },
                onDataLoad: function (t) {
                    Xcms.initAjax()
                },
                dataTableParams: {
                    dom: "<'row'<'col-md-8 col-sm-12'pli><'col-md-4 col-sm-12'<'table-group-actions pull-right'>>r><'table-responsive't><'row'<'col-md-8 col-sm-12'pli><'col-md-4 col-sm-12'>>",
                    lengthMenu: [[10, 20, 50, 100, 150, -1], [10, 20, 50, 100, 150, "All"]],
                    pageLength: 10,
                    language: {
                        groupActionCount: "_TOTAL_ records selected:  ",
                        ajaxRequestGeneralError: "Could not complete request. Please check your internet connection",
                        lengthMenu: "<span class='seperator'>|</span>View _MENU_ records",
                        info: "<span class='seperator'>|</span>Found total _TOTAL_ records",
                        infoEmpty: "No records found to show",
                        emptyTable: "No data available in table",
                        zeroRecords: "No matching records found",
                        paginate: {
                            previous: "Prev",
                            next: "Next",
                            last: "Last",
                            first: "First",
                            page: "Page",
                            pageOf: "of"
                        }
                    },
                    orderCellsTop: !0,
                    columnDefs: [{orderable: !1, targets: 0}],
                    bStateSave: !0,
                    pagingType: "bootstrap_extended",
                    autoWidth: !1,
                    processing: !1,
                    serverSide: !0,
                    ajax: {
                        url: "", type: "POST", timeout: 2e4, data: function (t) {
                            $.each(a.ajaxParams, function (e, a) {
                                t[e] = a
                            }), Xcms.blockUI({
                                message: o.loadingMessage,
                                target: a.$tableContainer,
                                overlayColor: "none",
                                boxed: !0
                            })
                        }, dataSrc: function (e) {
                            return e.customActionMessage && Xcms.showNotification(e.customActionMessage, e.customActionStatus), e.customActionStatus && tableOptions.resetGroupActionInputOnSuccess && $(".table-group-action-input", a.$tableWrapper).val(""), 1 === $(".group-checkable", t).length && $(".group-checkable", t).attr("checked", !1), o.onSuccess.call(void 0, a, e), Xcms.unblockUI(a.$tableContainer), e.data
                        }, error: function () {
                            this.onError.call(void 0, a), Xcms.showNotification(this.dataTableParams.language.ajaxRequestGeneralError, "danger"), Xcms.unblockUI($tableContainer)
                        }
                    },
                    drawCallback: function (t) {
                        Xcms.initAjax()
                    }
                }
            };
            this.options = $.extend(!0, o, e), $.fn.dataTableExt.oStdClasses.sWrapper = $.fn.dataTableExt.oStdClasses.sWrapper + " dataTables_extended_wrapper", $.fn.dataTableExt.oStdClasses.sFilterInput = "form-control input-xs input-sm input-inline", $.fn.dataTableExt.oStdClasses.sLengthSelect = "form-control input-xs input-sm input-inline", this.datatable = this.$table.DataTable(this.options.dataTableParams), this.$tableContainer = this.$table.closest(".table-container"), this.$tableWrapper = this.$table.closest(".dataTables_wrapper"), this.$tableContainer.addClass("initialized"), 1 === $(".table-actions-wrapper", a.$tableContainer).length && ($(".table-group-actions", a.$tableWrapper).html($(".table-actions-wrapper", a.$tableContainer).html()), $(".table-actions-wrapper", a.$tableContainer).remove()), this.$table.on("click", ".filter-submit", function (t) {
                t.preventDefault(), a.submitFilter()
            }), this.$table.on("click", ".filter-cancel", function (t) {
                t.preventDefault(), a.resetFilter()
            }), $("[type=checkbox][name=group_checkable]", this.$table).change(function () {
                var t = a.$table.find('tbody > tr > td:nth-child(1) input[type="checkbox"]'),
                    e = $(this).prop("checked");
                $(t).each(function () {
                    $(this).prop("checked", e)
                }), a.countSelectedRows()
            }), this.$table.on("change", 'tbody > tr > td:nth-child(1) input[type="checkbox"]', function () {
                a.countSelectedRows()
            })
        }
    };
    e.prototype.countSelectedRows = function () {
        var t = $('tbody > tr > td:nth-child(1) input[type="checkbox"]:checked', this.$table).length,
            e = this.options.dataTableParams.language.groupActionCount;
        return t > 0 ? $(".table-group-actions > span", this.$tableWrapper).text(e.replace("_TOTAL_", t)) : $(".table-group-actions > span", this.$tableWrapper).text(""), t
    }, e.prototype.getColumnInputValue = function (t) {
        var e = "";
        return $('textarea.form-filter, select.form-filter, input.form-filter:not([type="radio"],[type="checkbox"])', t).each(function () {
            e = $(this).val()
        }), $('input.form-filter[type="checkbox"]:checked', t).each(function () {
            e = $(this).val()
        }), $('input.form-filter[type="radio"]:checked', t).each(function () {
            e = $(this).val()
        }), e
    }, e.prototype.getDataTableHelper = function () {
        return this
    }, e.prototype.getTable = function () {
        return this.$table
    }, e.prototype.getTableContainer = function () {
        return this.$tableContainer
    }, e.prototype.getTableWrapper = function () {
        return this.$tableWrapper
    }, e.prototype.getDataTable = function () {
        return this.datatable
    }, e.prototype.getSelectedRowsCount = function () {
        return $('tbody > tr > td:nth-child(1) input[type="checkbox"]:checked', this.$table).length
    }, e.prototype.getSelectedRows = function () {
        var t = [];
        return $('tbody > tr > td:nth-child(1) input[type="checkbox"]:checked', this.$table).each(function () {
            t.push($(this).val())
        }), t
    }, e.prototype.setAjaxParam = function (t, e) {
        this.ajaxParams[t] = e
    }, e.prototype.addAjaxParam = function (t, e) {
        var a = this;
        this.ajaxParams[t] || (this.ajaxParams[t] = []);
        for (var o = !1, n = 0; n < this.ajaxParams[t].length; n++)a.ajaxParams[t][n] === e && (o = !0);
        o === !1 && this.ajaxParams[t].push(e)
    }, e.prototype.clearAjaxParams = function () {
        this.ajaxParams = {}
    }, e.prototype.submitFilter = function () {
        for (var t = this, e = this.$table.find("thead tr.filter > *"), a = e.length - 1, o = 0; o < a; o++) {
            var n = t.getColumnInputValue($(e[o]));
            t.datatable.columns(o).search(n)
        }
        this.datatable.ajax.reload()
    }, e.prototype.resetFilter = function () {
        $("textarea.form-filter, select.form-filter, input.form-filter", this.$table).each(function () {
            $(this).val("")
        }), $('input.form-filter[type="checkbox"]', this.$table).each(function () {
            $(this).attr("checked", !1)
        }), this.submitFilter()
    }, window.Xcms.DataTable = e, t.DataTable = e
}(this.LaravelElixirBundle = this.LaravelElixirBundle || {});
//# sourceMappingURL=Xcms.datatable.js.map
