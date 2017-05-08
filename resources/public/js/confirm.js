/**
 * Bootstrap:Confirm插件
 */
(function($) {
    'use strict';
    var Confirm = function(option) {
        this.options = $.extend({}, Confirm.setting, option);
        this.$button = {};
        //将设置合并到this
        //$.extend(this, this.options);
        this._init();
    };
    Confirm.prototype = {
        _init: function() {
            //生成对话框id
            this.elId = 'modal-confirm-' + Math.round(Math.random() * 99999);
            //构建html
            this._buildHTML();
            //绑定事件
            this._bindEvents();
        },
        _buildHTML: function() {
            //添加到指定位置
            this.$el = $(this.options.template)
                .attr('id', this.elId)
                .appendTo(this.options.container);
            //写入内容
            this.$el.find(".modal-body p").html(this.options.content)
            this.$el.find(".modal-title").html(this.options.title)
            this.$el.find(".modal-body h4").append(this.options.alertTitle)
            this._show()
        },
        /**
         * 绑定事件
         * @private
         */
        _bindEvents: function() {
            var that = this;
            $('#' + this.elId).on('hidden.bs.modal', function(e) {
                $(this).remove();
            })
            $('#' + this.elId).on("click", ".btn-danger", function() {
                that.$button = $(this).button('loading')
                that._ajax();
            })
        },
        _getModel: function() {
            return $("#" + this.elId);
        },
        /**
         * 显示生成的model
         * @private
         */
        _show: function() {
            $("#" + this.elId).modal()
        },
        /**
         * 关闭dialog
         * @private
         */
        _hidden: function() {
            $("#" + this.elId).modal('hide')
        },
        /**
         * ajax请求数据
         * @private
         */
        _ajax: function() {
            var options = this.options,
                that = this,
                $error = $(that.options.error_element),
                clearAlert = function () {
                    var $errorDanger = that.$el.find("div[data-alert-error]");
                    $errorDanger.length && ($errorDanger.hide("fast",function(){
                        $errorDanger.remove();
                    }))
                    _hidden();
                }
                ;
            if (options.url == '' && options.isOk == 'function') {
                that.button('reset');
                options.isOk();
                return
            }
            //清除出错信息,删除 div.alert-danger
            //var $errorDanger = that.$el.find("div[data-alert-error]");
            //$errorDanger.length && ($errorDanger.remove())
            $.ajax({
                url: options.url,
                dataType: "json",
                data: options.data,
                type: options.method,
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(req) {
                    var errorList = '';
                    if ('200' == req.code) {
                        that._hidden();
                        if ('function' === typeof options.callBack) {
                            // options.callBack(req);
                            window.location.reload();
                        }
                    } else {
                        $error.find('strong').html(req.message ? req.message:"操作失败")
                        $error.prependTo(that.$el.find(".modal-body"));
                        setTimeout(clearAlert,2000);
                        that.$button.button('reset');
                    }
                },
                error: function() {
                    //请求出错处理
                    that.$button.button('reset');
                    $error.find('strong').html("连接超时");
                    $error.prependTo(that.$el.find(".modal-body"));
                    setTimeout(clearAlert,2000);
                }
            })
        }
    };
    Confirm.VERSION = '0.0.1';
    /**
     * 配置
     */
    Confirm.setting = {
        //dialog 样式
        template: '<div class="modal fade">' +
        '<div class="modal-dialog">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
        '<h4 class="modal-title"></h4>' +
        '</div>' +
        '<div class="modal-body">' +
        '<div class="alert alert-danger m-b-0">' +
        '<h4><i class="fa fa-info-circle m-r-10"></i>' +
        '</h4>' +
        '<p></p>' +
        '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<a href="javascript:;" class="btn btn-default" data-dismiss="modal">放弃操作</a>' +
        '<a href="javascript:;" class="btn btn-danger">确认提交</a>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>',
        error_element: '<div data-alert-error class="alert alert-danger" role="alert"><strong></strong><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button></div>',
        //标题
        title: '操作提醒',
        //内容
        content: '是否确定删除',
        //dialog 添加的位置
        container: 'body',
        //alert 提示
        alertTitle: '删除操作',
        //请求地址
        url: '',
        //请求类型
        method: 'POST',
        data: {},
        //回调
        callBack: function() {
            table.ajax.reload();
        },
        isOk: function() {
        }
    };
    function Plugin(option) {
        return new Confirm(option);
    }
    $.Confirm = Plugin;
})
(jQuery);