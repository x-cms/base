!function (e) {
    "use strict";
    $(document).ready(function () {
        Xcms.isIE(function () {
        }), $.ajaxSetup({headers: {"X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")}}), Xcms.handleSelectMediaBox(), Xcms.tabChangeUrl(), Xcms.initAjax(), Xcms.fixedTopFormActions()
    }), $(window).on('load', function () {
        Xcms.hideLoading()
    })
}(this.LaravelElixirBundle = this.LaravelElixirBundle || {});
//# sourceMappingURL=script.js.map
