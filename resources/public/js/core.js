!function (a) {
    "use strict";
    var e = function () {
    };
    e.isIE = function (a) {
        var e = !!navigator.userAgent.match(/MSIE 8.0/), t = !!navigator.userAgent.match(/MSIE 9.0/),
            i = !!navigator.userAgent.match(/MSIE 10.0/), n = !!navigator.userAgent.match(/rv:11.0/);
        i && $("html").addClass("ie10"), n && $("html").addClass("ie11"), t && $("html").addClass("ie9"), e && $("html").addClass("ie8"), (n || i || t || e) && ($("html").addClass("ie"), "function" == typeof a && a())
    }, e.handleSelectMediaBox = function () {
        var a = $("body");
        a.on("click", ".show-add-media-popup", function (a) {
            a.preventDefault();
            var e = "", t = "image";
            document.currentMediaBox = $(this).closest(".select-media-box"), document.mediaModal = $("#select_media_modal"), $(this).hasClass("select-file-box") && (e = "&type=file", t = "file"), "file" == t ? (document.mediaModal.find(".nav-tabs .external-image").hide(), document.mediaModal.find(".nav-tabs .external-file").show()) : (document.mediaModal.find(".nav-tabs .external-image").show(), document.mediaModal.find(".nav-tabs .external-file").hide()), $("#select_media_modal .modal-body .iframe-container").html('<iframe src="' + FILE_MANAGER_URL + "?method=standalone" + e + '"></iframe>'), document.mediaModal.modal("show")
        }), a.on("click", ".select-media-box .remove-image", function (a) {
            a.preventDefault(), document.currentMediaBox = $(this).closest(".select-media-box"), document.currentMediaBox.find("img.img-responsive").attr("src", "admin/images/no-image.png"), document.currentMediaBox.find(".input-file").val("")
        }), a.on("click", ".select-media-modal-external-asset .btn", function (a) {
            a.preventDefault();
            var e = $(this), t = e.closest(".select-media-modal-external-asset").find(".input-asset"),
                i = Helpers.asset(t.val()),
                n = "select_media_modal_external_file" == e.closest(".select-media-modal-external-asset").attr("id") ? "file" : "image",
                o = document.mediaModal, r = document.currentMediaBox;
            "file" == n ? r.find("a .title").html(i) : r.find(".img-responsive").attr("src", i), r.find(".input-file").val(i), o.find("iframe").remove(), o.modal("hide"), t.val("")
        })
    }, e.showNotification = function (a, e, t) {
        switch (t = t || {}, e) {
            case"success":
                e = "lime";
                break;
            case"info":
                e = "teal";
                break;
            case"warning":
                e = "tangerine";
                break;
            case"danger":
                e = "ruby";
                break;
            case"error":
                e = "ruby";
                break;
            default:
                e = "ebony"
        }
        $.notific8("zindex", 11500);
        var i = $.extend(!0, {theme: e, sticky: !1, horizontalEdge: "bottom", verticalEdge: "right", life: 1e4}, t);
        a instanceof Array ? a.forEach(function (a) {
            $.notific8($.trim(a), i)
        }) : $.notific8($.trim(a), i)
    }, e.slimScroll = function (a) {
        return $().slimScroll ? void a.each(function () {
            if ($(this).attr("data-initialized"))return null;
            var a;
            a = $(this).attr("data-height") ? $(this).attr("data-height") : $(this).css("height"), $(this).slimScroll({
                allowPageScroll: !0,
                size: "7px",
                color: $(this).attr("data-handle-color") ? $(this).attr("data-handle-color") : "#bbb",
                wrapperClass: $(this).attr("data-wrapper-class") ? $(this).attr("data-wrapper-class") : "slimScrollDiv",
                railColor: $(this).attr("data-rail-color") ? $(this).attr("data-rail-color") : "#eaeaea",
                position: "right",
                height: a,
                alwaysVisible: "1" == $(this).attr("data-always-visible"),
                railVisible: "1" == $(this).attr("data-rail-visible"),
                disableFadeOut: !0
            }), $(this).attr("data-initialized", "1")
        }) : null
    }, e.destroySlimScroll = function (a) {
        $().slimScroll && a.each(function () {
            if ("1" === $(this).attr("data-initialized")) {
                $(this).removeAttr("data-initialized"), $(this).removeAttr("style");
                var a = {};
                $(this).attr("data-handle-color") && (a["data-handle-color"] = $(this).attr("data-handle-color")), $(this).attr("data-wrapper-class") && (a["data-wrapper-class"] = $(this).attr("data-wrapper-class")), $(this).attr("data-rail-color") && (a["data-rail-color"] = $(this).attr("data-rail-color")), $(this).attr("data-always-visible") && (a["data-always-visible"] = $(this).attr("data-always-visible")), $(this).attr("data-rail-visible") && (a["data-rail-visible"] = $(this).attr("data-rail-visible")), $(this).slimScroll({
                    wrapperClass: $(this).attr("data-wrapper-class") ? $(this).attr("data-wrapper-class") : "slimScrollDiv",
                    destroy: !0
                });
                var e = $(this);
                $.each(a, function (a, t) {
                    e.attr(a, t)
                })
            }
        })
    }, e.blockUI = function (a) {
        a = $.extend(!0, {
            animate: !1,
            iconOnly: !0,
            textOnly: !0,
            boxed: !0,
            message: "Loading...",
            target: void 0,
            zIndex: 1e3,
            centerY: !1,
            overlayColor: "#555"
        }, a);
        var e = "";
        if (e = a.animate ? '<div class="loading-message ' + (a.boxed ? "loading-message-boxed" : "") + '"><div class="block-spinner-bar"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>' : a.iconOnly ? '<div class="loading-message ' + (a.boxed ? "loading-message-boxed" : "") + '"><img src="admin/images/global/loading-spinner-grey.gif" align=""></div>' : a.textOnly ? '<div class="loading-message ' + (a.boxed ? "loading-message-boxed" : "") + '"><span>&nbsp;&nbsp;' + (a.message ? a.message : "LOADING...") + "</span></div>" : '<div class="loading-message ' + (a.boxed ? "loading-message-boxed" : "") + '"><img src="admin/images/global/loading-spinner-grey.gif" align=""><span>&nbsp;&nbsp;' + (a.message ? a.message : "LOADING...") + "</span></div>", a.target) {
            var t = $(a.target);
            t.height() <= $(window).height() && (a.cenrerY = !0), t.block({
                message: e,
                baseZ: a.zIndex,
                centerY: a.cenrerY,
                css: {top: "10%", border: "0", padding: "0", backgroundColor: "none"},
                overlayCSS: {backgroundColor: a.overlayColor, opacity: a.boxed ? .05 : .1, cursor: "wait"}
            })
        } else $.blockUI({
            message: e,
            baseZ: a.zIndex,
            css: {border: "0", padding: "0", backgroundColor: "none"},
            overlayCSS: {backgroundColor: a.overlayColor, opacity: a.boxed ? .05 : .1, cursor: "wait"}
        })
    }, e.unblockUI = function (a) {
        !a instanceof jQuery && (a = $(a)), a.unblock({
            onUnblock: function () {
                a.css("position", ""), a.css("zoom", "")
            }
        }), $.unblockUI()
    }, e.wysiwyg = function (a, e) {
        e = $.extend(!0, {
            filebrowserBrowseUrl: FILE_MANAGER_URL + "?method=ckeditor",
            extraPlugins: "codeTag,insertpre",
            allowedContent: !0,
            height: "400px"
        }, e), a.each(function () {
            var a = $(this), t = a.data() || {};
            "basic" != a.data("toolbar") && "basic" != t.toolbar || (t.toolbar = [["mode", "Source", "Image", "TextColor", "BGColor", "Styles", "Format", "Font", "FontSize", "CreateDiv", "PageBreak", "Bold", "Italic", "Underline", "Strike", "Subscript", "Superscript", "RemoveFormat"]]), a.ckeditor($.noop, $.extend(!0, e, t))
        })
    }, e.confirmation = function () {
        $().confirmation && $("[data-toggle=confirmation]").confirmation({
            container: "body",
            btnOkClass: "btn btn-sm green",
            btnCancelClass: "btn btn-sm red-sunglo",
            btnOkLabel: "OK",
            btnCancelLabel: "Cancel",
            popout: !0,
            singleton: !0
        })
    }, e.stringToSlug = function (a, e) {
        return e = e || "-", a.toString().toLowerCase().replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, "a").replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, "e").replace(/i|í|ì|ỉ|ĩ|ị/gi, "i").replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, "o").replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, "u").replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, "y").replace(/đ/gi, "d").replace(/\s+/g, e).replace(/[^\w\-]+/g, "").replace(/\-\-+/g, e).replace(/^-+/, "").replace(/-+$/, "")
    }, e.tabChangeUrl = function () {
        $("body").on("click", '.tab-change-url a[data-toggle="tab"]', function (a) {
            window.history.pushState("", "", $(this).attr("href"))
        })
    }, e.tagsInput = function (a, e) {
        e = $.extend(!0, {tagClass: "label label-default"}, e), (!a || !a instanceof jQuery) && (a = $(".js-tags-input")), a.length && a.tagsinput(e)
    }, e.scrollToTop = function (a) {
        a && a.preventDefault(), $("html, body").stop().animate({scrollTop: 0}, 800)
    }, e.showLoading = function () {
        $("body").addClass("on-loading")
    }, e.hideLoading = function () {
        $("body").removeClass("on-loading")
    }, e.fixedTopFormActions = function () {
        $("#waypoint").length > 0 && new Waypoint({
            element: document.getElementById("waypoint"), handler: function (a) {
                "down" == a ? $(".form-actions-fixed-top").removeClass("hidden") : $(".form-actions-fixed-top").addClass("hidden")
            }
        })
    }, e.initAjax = function () {
        e.confirmation(), e.tagsInput(), e.slimScroll($(".scroller"))
    };
    var t = function () {
    };
    t.arrayGet = function (a, e, t) {
        void 0 === t && (t = null);
        var i;
        try {
            i = a[e]
        } catch (n) {
            return t
        }
        return null !== i && "undefined" != typeof i || (i = t), i
    }, t.jsonEncode = function (a) {
        return "undefined" == typeof a && (a = null), JSON.stringify(a)
    }, t.jsonDecode = function (a, e) {
        if ("string" == typeof a) {
            var t;
            try {
                t = $.parseJSON(a)
            } catch (i) {
                t = e
            }
            return t
        }
        return null
    }, t.asset = function (a) {
        return "//" == a.substring(0, 2) || "http://" == a.substring(0, 7) || "https://" == a.substring(0, 8) ? a : "/" == a.substring(0, 1) ? BASE_URL + a.substring(1) : BASE_URL + a
    }, window.Xcms = e, window.Helpers = t
}(this.LaravelElixirBundle = this.LaravelElixirBundle || {});
//# sourceMappingURL=Xcms-core.js.map
