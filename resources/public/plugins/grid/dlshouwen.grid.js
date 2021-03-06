(function ($) {
    $.fn.dtGrid = {
        //初始化方法
        init: function (options, name) {
            let gridObject;
            for (let i = 0; i < options.columns.length; i++) {
                //初始化列参数
                options.columns[i] = $.extend({}, $.fn.dtGrid.defaultOptions.column, options.columns[i]);
            }
            //初始化表格参数
            options = $.extend({}, $.fn.dtGrid.defaultOptions.grid, options);
            //如果没有定义编号则设置默认GUID编号
            if (!options.id) {
                options.id = $.fn.dtGrid.tools.guid();
            }
            //如果语言错误则默认为英文
            if (!$.fn.dtGrid.lang[options.lang]) {
                options.lang = 'en';
            }
            gridObject = {
                //初始化参数
                init: {
                    //工具条是否初始化加载
                    toolsIsInit: false,
                    //打印窗体是否初始化
                    printWindowIsInit: false,
                    //导出窗体是否初始化
                    exportWindowIsInit: {},
                    //快速查询窗体是否初始化
                    fastQueryWindowIsInit: false,
                    //高级查询窗体是否初始化
                    advanceQueryWindowIsInit: false
                },
                //页面参数对象
                pager: {
                    //每页显示条数
                    pageSize: 0,
                    //开始记录数
                    startRecord: 0,
                    //当前页数
                    nowPage: 0,
                    //总记录数
                    recordCount: 0,
                    //总页数
                    pageCount: 0
                },
                //表格参数对象
                option: options,
                //原始数据集
                originalData: null,
                //基础数据集
                baseData: null,
                //展现数据集
                exhibitData: null,
                //排序参数
                sortParameter: {
                    //排序列编号
                    columnId: '',
                    //排序类型：0-不排序；1-正序；2-倒序
                    sortType: 0
                },
                //排序缓存的原生数据
                sortOriginalData: null,
                //参数列表
                parameters: null,
                //快速查询的参数列表
                fastQueryParameters: null,
                //快速查询缓存的原生数据
                fastQueryOriginalData: null,
                //高级查询的参数列表
                advanceQueryParameter: {
                    //高级查询条件信息
                    advanceQueryConditions: null,
                    //高级查询排序信息
                    advanceQuerySorts: null
                },
                //打印列
                printColumns: null,
                //导出列
                exportColumns: null,
                //导出数据
                exportData: null,
                /**
                 * 构件表格相关
                 */
                //构建表格方法
                load: function () {
                    //定义表格对象映像
                    let grid = this;
                    //显示工具条
                    grid.showProcessBar();
                    //首次加载
                    if (grid.init.toolsIsInit === false) {
                        //设置初始化完成
                        grid.init.toolsIsInit = true;
                        //加载工具按钮
                        grid.constructGridToolBar();
                        //设置初始分页属性：每页显示数量、开始记录、当前页号
                        grid.pager.pageSize = grid.option.pageSize;
                        grid.pager.startRecord = 0;
                        grid.pager.nowPage = 1;
                        //如果不是ajax加载，则处理所有数据
                        if (!grid.option.ajaxLoad) {
                            grid.hideProcessBar(function () {
                                //处理原始数据集
                                grid.originalData = grid.option.datas;
                                grid.originalData = grid.originalData ? grid.originalData : [];
                                //处理基础数据集
                                grid.baseData = grid.originalData.slice(0, grid.originalData.length);
                                //处理分页属性
                                grid.pager.recordCount = grid.baseData.length;
                                grid.pager.pageCount = Math.floor((grid.pager.recordCount - 1) / grid.pager.pageSize) + 1;
                                //获取展现数据集
                                grid.exhibitData = grid.baseData.slice(grid.pager.startRecord, grid.pager.startRecord + grid.pager.pageSize);
                                //获取排序数据集备份
                                grid.sortOriginalData = grid.exhibitData.slice(0, grid.exhibitData.length);
                                //构建表格、工具条
                                grid.constructGrid();
                                grid.constructGridPageBar();
                            });
                            return;
                        } else {
                            //如果是一次加载，则加载所有数据到原始数据
                            if (grid.option.loadAll) {
                                let url = grid.option.loadURL;
                                $.ajax({
                                    type: 'post',
                                    url: url,
                                    data: null,
                                    headers: {
                                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                                    },
                                    contentType: "application/x-www-form-urlencoded; charset=utf-8",
                                    beforeSend: function (xhr) {
                                        xhr.setRequestHeader("__REQUEST_TYPE", "AJAX_REQUEST");
                                    },
                                    success: function (datas) {
                                        grid.hideProcessBar(function () {
                                            //处理原始数据集
                                            grid.originalData = $.parseJSON(datas);
                                            grid.originalData = grid.originalData ? grid.originalData : [];
                                            //处理基础数据集
                                            grid.baseData = grid.originalData.slice(0, grid.originalData.length);
                                            //处理分页属性
                                            grid.pager.recordCount = grid.baseData.length;
                                            grid.pager.pageCount = Math.floor((grid.pager.recordCount - 1) / grid.pager.pageSize) + 1;
                                            //获取展现数据集
                                            grid.exhibitData = grid.baseData.slice(grid.pager.startRecord, grid.pager.startRecord + grid.pager.pageSize);
                                            //获取排序数据集备份
                                            grid.sortOriginalData = grid.exhibitData.slice(0, grid.exhibitData.length);
                                            //构建表格、工具条
                                            grid.constructGrid();
                                            grid.constructGridPageBar();
                                        });
                                    },
                                    error: function () {
                                        grid.hideProcessBar(function () {
                                            $.fn.dtGrid.tools.toast($.fn.dtGrid.lang[grid.option.lang].errors.ajaxLoadError, 'error', 5000);
                                            //构建表格、工具条
                                            grid.constructGrid();
                                            grid.constructGridPageBar();
                                        });
                                    }
                                });
                                return;
                            }
                        }
                    }
                    //非初始化运行
                    if (!grid.option.ajaxLoad || grid.option.loadAll) {
                        grid.hideProcessBar(function () {
                            //处理快速查询及高级查询
                            if (grid.fastQueryParameters || grid.advanceQueryParameter) {
                                //传递所有数据
                                grid.baseData = grid.originalData;
                                //处理快速查询
                                if (grid.fastQueryParameters) {
                                    grid.baseData = grid.doFastQueryDatasFilter(grid.baseData, grid.fastQueryParameters);
                                }
                                //处理高级查询
                                if (grid.advanceQueryParameter) {
                                    grid.baseData = grid.doAdvanceQueryDatasFilter(grid.baseData, grid.advanceQueryParameter);
                                }
                            }
                            //记录数、页数重算
                            grid.pager.recordCount = grid.baseData.length;
                            grid.pager.pageCount = grid.pager.recordCount === 0 ? 0 : (Math.floor((grid.pager.recordCount - 1) / grid.pager.pageSize) + 1);
                            //如果当前页数大于现在的总页数，则显示最后一页
                            if (grid.pager.nowPage > grid.pager.pageCount) {
                                grid.pager.nowPage = grid.pager.pageCount;
                                grid.pager.startRecord = grid.pager.pageSize * (grid.pager.nowPage - 1);
                            }
                            //重新计算开始记录
                            grid.pager.startRecord = grid.pager.pageSize * (grid.pager.nowPage - 1);
                            //如果没有数据，则重设开始记录、当前页
                            if (grid.baseData.length === 0) {
                                grid.pager.nowPage = 1;
                                grid.pager.startRecord = 0;
                            }
                            //获取展现数据集
                            grid.exhibitData = grid.baseData.slice(grid.pager.startRecord, grid.pager.startRecord + grid.pager.pageSize);
                            //获取排序数据集备份
                            grid.sortOriginalData = grid.exhibitData.slice(0, grid.exhibitData.length);
                            //构建表格、工具条
                            grid.constructGrid();
                            grid.constructGridPageBar();
                        });
                    } else {
                        //将参数传递后台AJAX获取数据
                        let url = grid.option.loadURL;
                        let pager = {};
                        pager.isExport = false;
                        pager.pageSize = grid.pager.pageSize;
                        pager.startRecord = grid.pager.startRecord;
                        pager.nowPage = grid.pager.nowPage;
                        pager.recordCount = grid.pager.recordCount ? grid.pager.recordCount : -1;
                        pager.pageCount = grid.pager.pageCount ? grid.pager.pageCount : -1;
                        pager.parameters = grid.parameters ? grid.parameters : {};
                        pager.fastQueryParameters = grid.fastQueryParameters ? grid.fastQueryParameters : {};
                        pager.advanceQueryConditions = (grid.advanceQueryParameter && grid.advanceQueryParameter.advanceQueryConditions) ? grid.advanceQueryParameter.advanceQueryConditions : [];
                        pager.advanceQuerySorts = (grid.advanceQueryParameter && grid.advanceQueryParameter.advanceQuerySorts) ? grid.advanceQueryParameter.advanceQuerySorts : [];
                        let params = {};
                        params.gridPager = JSON.stringify(pager);
                        $.ajax({
                            type: 'post',
                            url: url,
                            data: params,
                            headers: {
                                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                            },
                            contentType: "application/x-www-form-urlencoded; charset=utf-8",
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader("__REQUEST_TYPE", "AJAX_REQUEST");
                            },
                            success: function (pager) {
                                pager = $.parseJSON(pager);
                                //如果出错表示有可能是程序问题或高级查询方案配置有误
                                if (!pager) {
                                    $.fn.dtGrid.tools.toast($.fn.dtGrid.lang[grid.option.lang].errors.ajaxLoadError, 'error', 5000);
                                    grid.hideProcessBar();
                                    return;
                                }
                                grid.hideProcessBar(function () {
                                    //处理展示数据和分页相关信息
                                    grid.exhibitData = pager.exhibitData;
                                    //获取排序数据集备份
                                    grid.sortOriginalData = grid.exhibitData.slice(0, grid.exhibitData.length);
                                    //处理分页信息
                                    grid.pager.pageSize = pager.pageSize;
                                    grid.pager.startRecord = pager.startRecord;
                                    grid.pager.nowPage = pager.nowPage;
                                    grid.pager.recordCount = pager.recordCount;
                                    grid.pager.pageCount = pager.pageCount;
                                    //构建表格、工具条
                                    grid.constructGrid();
                                    grid.constructGridPageBar();
                                });
                            },
                            error: function () {
                                grid.hideProcessBar(function () {
                                    $.fn.dtGrid.tools.toast($.fn.dtGrid.lang[grid.option.lang].errors.ajaxLoadError, 'error', 5000);
                                    //构建表格、工具条
                                    grid.constructGrid();
                                    grid.constructGridPageBar();
                                });
                            }
                        });
                    }
                },
                //构建主体内容
                constructGrid: function () {
                    //定义表格对象映像
                    let grid = this;
                    //获取扩展列列头
                    let extraColumnClass = grid.getExtraColumnClass();
                    //构件表头
                    let gridContent = '';
                    gridContent += '<table class="grid ' + grid.option.tableClass + '" id="grid_' + grid.option.id + '" style="' + grid.option.tableStyle + '">';
                    if (grid.option.showHeader !== false) {
                        let columns = grid.option.columns;
                        gridContent += '<thead>';
                        gridContent += '	<tr class="grid-headers">';
                        if (grid.option.extraWidth !== null) {
                            gridContent += '	<th class="extra-column ' + extraColumnClass + '" width="' + grid.option.extraWidth + '"></th>';
                        } else {
                            gridContent += '	<th class="extra-column ' + extraColumnClass + '"></th>';
                        }
                        if (grid.option.check) {
                            if (grid.option.checkWidth !== null) {
                                gridContent += '	<th class="check-column" width="' + grid.option.checkWidth + '"><input type="checkbox" id="grid_' + grid.option.id + '_check" value="check"></th>';
                            } else {
                                gridContent += '	<th class="check-column"><input type="checkbox" id="grid_' + grid.option.id + '_check" value="check"></th>';
                            }
                        }
                        for (let i = 0; i < columns.length; i++) {
                            if (columns[i].width !== null) {
                                gridContent += '	<th width="' + columns[i].width + '" columnNo="' + i + '" columnId="' + columns[i].id + '" class="grid-header ' + grid.getColumnClassForHide(columns[i]) + ' ' + columns[i].headerClass + ' can-sort" style="' + columns[i].headerStyle + '">';
                            } else {
                                gridContent += '	<th columnNo="' + i + '" columnId="' + columns[i].id + '" class="grid-header ' + grid.getColumnClassForHide(columns[i]) + ' ' + columns[i].headerClass + ' can-sort" style="' + columns[i].headerStyle + '">';
                            }
                            if (grid.sortParameter && grid.sortParameter.columnId && grid.sortParameter.columnId === columns[i].id) {
                                if (grid.sortParameter.sortType === 1) {
                                    gridContent += '<span class="grid-sort">' + $.fn.dtGrid.lang[grid.option.lang].sortColumn.asc + '</span>';
                                }
                                if (grid.sortParameter.sortType === 2) {
                                    gridContent += '<span class="grid-sort grid-sort-desc">' + $.fn.dtGrid.lang[grid.option.lang].sortColumn.desc + '</span>';
                                }
                            }
                            gridContent += '		' + columns[i].title;
                            gridContent += '	</th>';
                        }
                        gridContent += '	</tr>';
                        gridContent += '</thead>';
                    }
                    //构建表格
                    gridContent += '	<tbody>';
                    if (grid.exhibitData !== null) {
                        if (grid.sortParameter && grid.sortParameter.columnId) {
                            if (grid.sortParameter.sortType !== 0) {
                                grid.exhibitData = grid.exhibitData.sort(function (record1, record2) {
                                    let value1 = record1[grid.sortParameter.columnId];
                                    let value2 = record2[grid.sortParameter.columnId];
                                    //数值比较
                                    if (!isNaN(value1) && !isNaN(value2)) {
                                        if (grid.sortParameter.sortType === 1) {
                                            return value1 - value2;
                                        }
                                        if (grid.sortParameter.sortType === 2) {
                                            return value2 - value1;
                                        }
                                    }
                                    //日期比较
                                    if (value1 instanceof Date && value2 instanceof Date) {
                                        if (grid.sortParameter.sortType === 1) {
                                            return value1.getTime() - value2.getTime();
                                        }
                                        if (grid.sortParameter.sortType === 2) {
                                            return value2.getTime() - value1.getTime();
                                        }
                                    }
                                    //普通比较
                                    if (value1 !== null && grid.sortParameter.sortType === 1) {
                                        return value1.localeCompare(value2);
                                    }
                                    if (value2 !== null && grid.sortParameter.sortType === 2) {
                                        return value2.localeCompare(value1);
                                    }
                                    return 0;
                                });
                            } else {
                                grid.exhibitData = grid.sortOriginalData.slice(0, grid.sortOriginalData.length);
                            }
                        }
                        gridContent += grid.loop(grid.exhibitData)
                    }
                    gridContent += '</tbody>';
                    gridContent += '</table>';
                    $('#grid_' + grid.option.id).remove();
                    $('#' + grid.option.gridContainer).append(gridContent);
                    //备份gridId
                    let gridId = grid.option.id;
                    //绑定单元格单击方法
                    if (grid.option.onCellClick) {
                        $('#grid_' + gridId + ' .grid-cell').click(function (e) {
                            grid.bindCellEvent(grid.option.onCellClick, this, e);
                        });
                    }
                    //绑定单元格双击方法
                    if (grid.option.onCellDblClick) {
                        $('#grid_' + gridId + ' .grid-cell').dblclick(function (e) {
                            grid.bindCellEvent(grid.option.onCellDblClick, this, e);
                        });
                    }
                    //绑定单元格鼠标滑过方法
                    if (grid.option.onCellMouseOver) {
                        $('#grid_' + gridId + ' .grid-cell').mouseover(function (e) {
                            grid.bindCellEvent(grid.option.onCellMouseOver, this, e);
                        });
                    }
                    //绑定单元格鼠标移动方法
                    if (grid.option.onCellMouseMove) {
                        $('#grid_' + gridId + ' .grid-cell').mousemove(function (e) {
                            grid.bindCellEvent(grid.option.onCellMouseMove, this, e);
                        });
                    }
                    //绑定单元格鼠标滑出方法
                    if (grid.option.onCellMouseOut) {
                        $('#grid_' + gridId + ' .grid-cell').mouseout(function (e) {
                            grid.bindCellEvent(grid.option.onCellMouseOut, this, e);
                        });
                    }
                    //绑定单元格鼠标按下方法
                    if (grid.option.onCellMouseDown) {
                        $('#grid_' + gridId + ' .grid-cell').mousedown(function (e) {
                            grid.bindCellEvent(grid.option.onCellMouseDown, this, e);
                        });
                    }
                    //绑定单元格鼠标释放方法
                    if (grid.option.onCellMouseUp) {
                        $('#grid_' + gridId + ' .grid-cell').mouseup(function (e) {
                            grid.bindCellEvent(grid.option.onCellMouseUp, this, e);
                        });
                    }
                    //绑定行单击方法
                    if (grid.option.onRowClick) {
                        $('#grid_' + gridId + ' .grid-cell').click(function (e) {
                            grid.bindRowEvent(grid.option.onRowClick, this, e);
                        });
                    }
                    //绑定行双击方法
                    if (grid.option.onRowDblClick) {
                        $('#grid_' + gridId + ' .grid-cell').dblclick(function (e) {
                            grid.bindRowEvent(grid.option.onRowDblClick, this, e);
                        });
                    }
                    //绑定行鼠标滑过方法
                    if (grid.option.onRowMouseOver) {
                        $('#grid_' + gridId + ' .grid-cell').mouseover(function (e) {
                            grid.bindRowEvent(grid.option.onRowMouseOver, this, e);
                        });
                    }
                    //绑定行鼠标移动方法
                    if (grid.option.onRowMouseMove) {
                        $('#grid_' + gridId + ' .grid-cell').mousemove(function (e) {
                            grid.bindRowEvent(grid.option.onRowMouseMove, this, e);
                        });
                    }
                    //绑定行鼠标滑出方法
                    if (grid.option.onRowMouseOut) {
                        $('#grid_' + gridId + ' .grid-cell').mouseout(function (e) {
                            grid.bindRowEvent(grid.option.onRowMouseOut, this, e);
                        });
                    }
                    //绑定行鼠标按下方法
                    if (grid.option.onRowMouseDown) {
                        $('#grid_' + gridId + ' .grid-cell').mousedown(function (e) {
                            grid.bindRowEvent(grid.option.onRowMouseDown, this, e);
                        });
                    }
                    //绑定行鼠标释放方法
                    if (grid.option.onRowMouseUp) {
                        $('#grid_' + gridId + ' .grid-cell').mouseup(function (e) {
                            grid.bindRowEvent(grid.option.onRowMouseUp, this, e);
                        });
                    }
                    //绑定表头单击方法
                    if (grid.option.onHeaderClick) {
                        $('#grid_' + gridId + ' .grid-header').click(function (e) {
                            grid.bindHeaderEvent(grid.option.onHeaderClick, this, e);
                        });
                    }
                    //绑定表头鼠标滑过方法
                    if (grid.option.onHeaderMouseOver) {
                        $('#grid_' + gridId + ' .grid-header').mouseover(function (e) {
                            grid.bindHeaderEvent(grid.option.onHeaderMouseOver, this, e);
                        });
                    }
                    //绑定表头鼠标移动方法
                    if (grid.option.onHeaderMouseMove) {
                        $('#grid_' + gridId + ' .grid-header').mousemove(function (e) {
                            grid.bindHeaderEvent(grid.option.onHeaderMouseMove, this, e);
                        });
                    }
                    //绑定表头鼠标滑出方法
                    if (grid.option.onHeaderMouseOut) {
                        $('#grid_' + gridId + ' .grid-header').mouseout(function (e) {
                            grid.bindHeaderEvent(grid.option.onHeaderMouseOut, this, e);
                        });
                    }
                    //绑定表头鼠标按下方法
                    if (grid.option.onHeaderMouseDown) {
                        $('#grid_' + gridId + ' .grid-header').mousedown(function (e) {
                            grid.bindHeaderEvent(grid.option.onHeaderMouseDown, this, e);
                        });
                    }
                    //绑定表头鼠标释放方法
                    if (grid.option.onHeaderMouseUp) {
                        $('#grid_' + gridId + ' .grid-header').mouseup(function (e) {
                            grid.bindHeaderEvent(grid.option.onHeaderMouseUp, this, e);
                        });
                    }
                    //绑定表格单击方法
                    if (grid.option.onGridClick) {
                        $('#grid_' + gridId).click(function (e) {
                            grid.bindGridEvent(grid.option.onGridClick, e);
                        });
                    }
                    //绑定表格双击方法
                    if (grid.option.onGridDblClick) {
                        $('#grid_' + gridId).dblclick(function (e) {
                            grid.bindGridEvent(grid.option.onGridDblClick, e);
                        });
                    }
                    //绑定表格鼠标滑过方法
                    if (grid.option.onGridMouseOver) {
                        $('#grid_' + gridId).mouseover(function (e) {
                            grid.bindGridEvent(grid.option.onGridMouseOver, e);
                        });
                    }
                    //绑定表格鼠标移动方法
                    if (grid.option.onGridMouseMove) {
                        $('#grid_' + gridId).mousemove(function (e) {
                            grid.bindGridEvent(grid.option.onGridMouseMove, e);
                        });
                    }
                    //绑定表格鼠标滑出方法
                    if (grid.option.onGridMouseOut) {
                        $('#grid_' + gridId).mouseout(function (e) {
                            grid.bindGridEvent(grid.option.onGridMouseOut, e);
                        });
                    }
                    //绑定表格鼠标按下方法
                    if (grid.option.onGridMouseDown) {
                        $('#grid_' + gridId).mousedown(function (e) {
                            grid.bindGridEvent(grid.option.onGridMouseDown, e);
                        });
                    }
                    //绑定表格鼠标释放方法
                    if (grid.option.onGridMouseUp) {
                        $('#grid_' + gridId).mouseup(function (e) {
                            grid.bindGridEvent(grid.option.onGridMouseUp, e);
                        });
                    }
                    //绑定表格加载完成方法
                    if (grid.option.onGridComplete) {
                        grid.bindGridEvent(grid.option.onGridComplete);
                    }
                    //绑定显隐方法
                    $('#grid_' + gridId + ' .extra-column-event').click(function (e) {
                        let dataNo = $(this).attr('dataNo');
                        let selector = $(`#grid_${gridId}_extra_columns_${dataNo}`);
                        if (selector.hasClass('hidden')) {
                            selector.removeClass('hidden');
                            $(this).html($.fn.dtGrid.lang[grid.option.lang].extraColumn.close);
                            //绑定扩展行展开方法
                            if (grid.option.onExtraOpen) {
                                let row = $('#grid_' + gridId + ' tr[dataNo="' + dataNo + '"]');
                                grid.bindExtraEvent(grid.option.onExtraOpen, row, e);
                            }
                        } else {
                            selector.addClass('hidden');
                            $(this).html($.fn.dtGrid.lang[grid.option.lang].extraColumn.open);
                            //绑定扩展行关闭方法
                            if (grid.option.onExtraClose) {
                                let row = $('#grid_' + gridId + ' tr[dataNo="' + dataNo + '"]');
                                grid.bindExtraEvent(grid.option.onExtraClose, row, e);
                            }
                        }
                    });
                    //绑定下级数据显隐方法
                    $('#grid_' + gridId + ' .extra-tree').click(function () {
                        let id = $(this).parents().attr('dataNo');
                        if ($(this).parents('.grid-row').nextAll().filter("[data-parent-id='" + id + "']").hasClass('hidden')) {
                            $(this).parents('.grid-row').nextAll().filter("[data-parent-id='" + id + "']").removeClass('hidden');
                            $(this).html($.fn.dtGrid.lang[grid.option.lang].treeColumn.close);
                        } else {
                            $(this).parents('.grid-row').nextAll().filter("[data-parent-id='" + id + "']").addClass('hidden');
                            $(this).html($.fn.dtGrid.lang[grid.option.lang].treeColumn.open);
                        }
                    });
                    //绑定排序方法
                    $('#grid_' + gridId + ' .can-sort').click(function () {
                        //获取列编号
                        let columnId = $(this).attr('columnId');
                        //根据当前的排序参数设置显示的排序图标
                        if (grid.sortParameter === null) {
                            grid.sortParameter = {};
                        }
                        if (!grid.sortParameter.columnId || grid.sortParameter.columnId !== columnId) {
                            grid.sortParameter.columnId = columnId;
                            grid.sortParameter.sortType = 1;
                        } else {
                            let sortType = grid.sortParameter.sortType;
                            if (sortType === 0) {
                                grid.sortParameter.sortType = 1;
                            } else if (sortType === 1) {
                                grid.sortParameter.sortType = 2;
                            } else if (sortType === 2) {
                                grid.sortParameter.sortType = 0;
                            }
                        }
                        //重新加载数据
                        grid.reload();
                    });
                    //绑定复选方法
                    if (grid.option.onCheck) {
                        $('input[id*=grid_' + gridId + '_check_]').click(function (e) {
                            grid.bindCheckEvent(grid.option.onCheck, this, e);
                        });
                    }
                    //绑定复选方法（全选反选）
                    if (grid.option.check) {
                        $('#grid_' + gridId + '_check').click(function (e) {
                            $(`input[id*=grid_${gridId}_check_]`).prop('checked', this.checked);
                            if (grid.option.onCheck) {
                                $('input[id*=grid_' + gridId + '_check_]').each(function () {
                                    grid.bindCheckEvent(grid.option.onCheck, this, e);
                                });
                            }
                        });
                    }
                },
                //绑定单元格事件
                bindCellEvent: function (func, cellObject, e) {
                    //定义表格对象映像
                    let grid = this;
                    //备份gridId
                    let gridId = grid.option.id;
                    //获取数据号、列号
                    let dataNo = $(cellObject).attr('dataNo');
                    let columnNo = $(cellObject).attr('columnNo');
                    //获取当前Column对象
                    let column = grid.option.columns[columnNo];
                    //获取当前记录
                    let record = grid.exhibitData[dataNo];
                    //获取当前值（处理后的）
                    let value;
                    if (column.resolution) {
                        value = column.resolution(record[column.id], record, column, grid, dataNo, columnNo);
                    } else {
                        value = grid.formatContent(column, record[column.id]);
                    }
                    //获取当前单元格jQuery对象
                    let cell = $(cellObject);
                    //获取当前行jQuery对象
                    let row = $('#grid_' + gridId + ' tr[dataNo="' + dataNo + '"]');
                    //获取扩展行jQuery对象
                    let extraCell = $('#grid_' + gridId + ' .grid-extra-columns>td[dataNo="' + dataNo + '"]');
                    func(value, record, column, grid, dataNo, columnNo, cell, row, extraCell, e);
                },
                //绑定行事件
                bindRowEvent: function (func, cellObject, e) {
                    //定义表格对象映像
                    let grid = this;
                    //备份gridId
                    let gridId = grid.option.id;
                    //获取数据号、列号
                    let dataNo = $(cellObject).attr('dataNo');
                    let columnNo = $(cellObject).attr('columnNo');
                    //获取当前Column对象
                    let column = grid.option.columns[columnNo];
                    //获取当前记录
                    let record = grid.exhibitData[dataNo];
                    //获取当前值（处理后的）
                    let value;
                    if (column.resolution) {
                        value = column.resolution(record[column.id], record, column, grid, dataNo, columnNo);
                    } else {
                        value = grid.formatContent(column, record[column.id]);
                    }
                    //获取当前单元格jQuery对象
                    let cell = $(cellObject);
                    //获取当前行jQuery对象
                    let row = $('#grid_' + gridId + ' tr[dataNo="' + dataNo + '"]');
                    //获取扩展行jQuery对象
                    let extraCell = $('#grid_' + gridId + ' .grid-extra-columns>td[dataNo="' + dataNo + '"]');
                    func(value, record, column, grid, dataNo, columnNo, cell, row, extraCell, e);
                },
                //绑定表头事件
                bindHeaderEvent: function (func, headerObject, e) {
                    //定义表格对象映像
                    let grid = this;
                    //备份gridId
                    let gridId = grid.option.id;
                    //获取列号
                    let columnNo = $(headerObject).attr('columnNo');
                    //获取当前Column对象
                    let column = grid.option.columns[columnNo];
                    //获取当前表头名称
                    let title = column.title;
                    //获取当前单元格jQuery对象
                    let header = $(headerObject);
                    //获取当前行jQuery对象
                    let headerRow = $('#grid_' + gridId + ' tr.grid-headers');
                    func(title, column, grid, columnNo, header, headerRow, e);
                },
                //绑定表头事件
                bindGridEvent: function (func, e) {
                    //定义表格对象映像
                    let grid = this;
                    func(grid, e);
                },
                //绑定扩展行事件
                bindExtraEvent: function (func, rowObject, e) {
                    //定义表格对象映像
                    let grid = this;
                    //备份gridId
                    let gridId = grid.option.id;
                    //获取数据号
                    let dataNo = $(rowObject).attr('dataNo');
                    //获取当前记录
                    let record = grid.exhibitData[dataNo];
                    //获取当前行jQuery对象
                    let row = $('#grid_' + gridId + ' tr[dataNo="' + dataNo + '"]');
                    //获取扩展行jQuery对象
                    let extraCell = $('#grid_' + gridId + ' .grid-extra-columns>td[dataNo="' + dataNo + '"]');
                    func(record, grid, dataNo, row, extraCell, e);
                },
                //绑定复选事件
                bindCheckEvent: function (func, checkInput, e) {
                    //定义表格对象映像
                    let grid = this;
                    //备份gridId
                    let gridId = grid.option.id;
                    //获取数据号、列号
                    let dataNo = $(checkInput).attr('dataNo');
                    //获取当前记录
                    let record = grid.exhibitData[dataNo];
                    //获取当前行jQuery对象
                    let row = $('#grid_' + gridId + ' tr[dataNo="' + dataNo + '"]');
                    //获取扩展行jQuery对象
                    let extraCell = $('#grid_' + gridId + ' .grid-extra-columns>td[dataNo="' + dataNo + '"]');
                    func(checkInput.checked, record, grid, dataNo, row, extraCell, e);
                },
                //构建分页内容
                constructGridPageBar: function () {
                    //定义表格对象映像
                    let grid = this;
                    //清空工具条
                    $('#' + grid.option.toolbarContainer + ' .grid-pager').html('');
                    //获取当前页、每页条数、总页数
                    let nowPage = grid.pager.nowPage;
                    let pageCount = grid.pager.pageCount;
                    //设置工具条初始内容
                    let gridStatus = document.createElement('span');
                    if (grid.exhibitData === null || grid.exhibitData.length <= 0) {
                        gridStatus.className = 'grid-pager-status text-primary';
                        gridStatus.innerHTML = $.fn.dtGrid.lang[grid.option.lang].pageInfo.nothing;
                    } else {
                        gridStatus.className = 'grid-pager-status text-primary';
                        let info = $.fn.dtGrid.lang[grid.option.lang].pageInfo.info;
                        info = $.fn.dtGrid.tools.replaceAll(info, '{startRecord}', grid.pager.startRecord);
                        info = $.fn.dtGrid.tools.replaceAll(info, '{nowPage}', grid.pager.nowPage);
                        info = $.fn.dtGrid.tools.replaceAll(info, '{recordCount}', grid.pager.recordCount);
                        info = $.fn.dtGrid.tools.replaceAll(info, '{pageCount}', grid.pager.pageCount);
                        //设置每页数量的DOM对象
                        let pageSizeElement = '';
                        let pageSize = grid.pager.pageSize;
                        //数组类型
                        if (typeof grid.option.pageSizeLimit === 'object') {
                            pageSizeElement += '<select id="grid_change_page_size_' + grid.option.id + '" name="grid_change_page_size_' + grid.option.id + '" class="form-control change-page-size">';
                            //整合可用页码
                            let isHasNowPageSize = false;
                            let pageSizeLimit = [];
                            for (let i = 0; i < grid.option.pageSizeLimit.length; i++) {
                                let loopPageSize = grid.option.pageSizeLimit[i];
                                pageSizeLimit.push(parseFloat(loopPageSize));
                                if (pageSize === loopPageSize) {
                                    isHasNowPageSize = true;
                                }
                            }
                            if (!isHasNowPageSize) {
                                pageSizeLimit.push(pageSize);
                            }
                            //对当前页码内容排序
                            pageSizeLimit.sort(function (s1, s2) {
                                return s1 > s2;
                            });
                            //写入代码
                            for (let i = 0; i < pageSizeLimit.length; i++) {
                                let loopPageSize = pageSizeLimit[i];
                                pageSizeElement += '	<option ' + (pageSize === loopPageSize ? 'selected="selected"' : '') + ' value="' + loopPageSize + '">' + loopPageSize + '</option>';
                            }
                            pageSizeElement += '</select>';
                            info = $.fn.dtGrid.tools.replaceAll(info, '{pageSize}', pageSizeElement);
                        } else if (typeof grid.option.pageSizeLimit === 'number') {
                            //如果是数值类型则为文本框
                            pageSizeElement += '<input id="grid_change_page_size_' + grid.option.id + '" name="grid_change_page_size_' + grid.option.id + '" type="text" class="form-control change-page-size" value="' + grid.pager.pageSize + '" />';
                            info = $.fn.dtGrid.tools.replaceAll(info, '{pageSize}', pageSizeElement);
                        } else {
                            info = $.fn.dtGrid.tools.replaceAll(info, '{pageSize}', pageSize);
                        }
                        gridStatus.innerHTML = info;
                    }
                    let operations = document.createElement('ul');
                    operations.id = grid.option.id + '_dlshouwenGridOperations';
                    operations.className = 'pagination pagination-sm grid-pager-button';
                    let gridPager;
                    gridPager = $(`#${grid.option.toolbarContainer}`).find(`.grid-pager`);
                    gridPager.append(operations);
                    gridPager.append(gridStatus);
                    //绑定修改每页显示条数的事件
                    $('#grid_change_page_size_' + grid.option.id).change(function () {
                        let changePageSize = parseFloat(this.value);
                        if (isNaN(changePageSize)) {
                            $.fn.dtGrid.tools.toast($.fn.dtGrid.lang[grid.option.lang].pageInfo.errors.notANumber, 'warning', 3000);
                            $('#grid_change_page_size_' + grid.option.id).val(grid.pager.pageSize);
                            return;
                        }
                        if (typeof grid.option.pageSizeLimit === 'number') {
                            if (changePageSize > grid.option.pageSizeLimit) {
                                $.fn.dtGrid.tools.toast($.fn.dtGrid.tools.replaceAll($.fn.dtGrid.lang[grid.option.lang].pageInfo.errors.maxPageSize, '{pageSizeLimit}', grid.option.pageSizeLimit), 'warning', 3000);
                                $('#grid_change_page_size_' + grid.option.id).val(grid.pager.pageSize);
                                return;
                            }
                        }
                        grid.pager.pageSize = changePageSize;
                        grid.reload(true);
                    });
                    //处理分页按钮
                    if (grid.exhibitData !== null && grid.exhibitData.length > 0) {
                        //第一页按钮
                        let goFirstBtn = document.createElement('li');
                        goFirstBtn.id = 'grid_' + grid.option.id + '_page_first';
                        goFirstBtn.title = $.fn.dtGrid.lang[grid.option.lang].pageInfo.firstPageTitle;
                        if (nowPage <= 1) {
                            goFirstBtn.className = 'disabled';
                            goFirstBtn.title = $.fn.dtGrid.lang[grid.option.lang].pageInfo.alreadyFirstPage;
                        }
                        goFirstBtn.innerHTML = '<a href="javascript:void(0);">' + $.fn.dtGrid.lang[grid.option.lang].pageInfo.firstPage + '</a>';
                        $(`#${grid.option.id}_dlshouwenGridOperations`).append(goFirstBtn);
                        $('#grid_' + grid.option.id + '_page_first').click(function () {
                            grid.loadByPage('first');
                        });
                        //上一页按钮
                        let goPrevBtn = document.createElement('li');
                        goPrevBtn.id = 'grid_' + grid.option.id + '_page_prev';
                        goPrevBtn.title = $.fn.dtGrid.lang[grid.option.lang].pageInfo.prevPageTitle;
                        if (nowPage <= 1) {
                            goPrevBtn.className = 'disabled';
                            goPrevBtn.title = $.fn.dtGrid.lang[grid.option.lang].pageInfo.alreadyFirstPage;
                        }
                        goPrevBtn.innerHTML = '<a href="javascript:void(0);">' + $.fn.dtGrid.lang[grid.option.lang].pageInfo.prevPage + '</a>';
                        $(`#${grid.option.id}_dlshouwenGridOperations`).append(goPrevBtn);
                        $('#grid_' + grid.option.id + '_page_prev').click(function () {
                            grid.loadByPage('prev');
                        });
                        //页面列表
                        if (pageCount <= 5) {
                            for (let i = 1; i <= pageCount; i++) {
                                let goPageBtn = document.createElement('li');
                                goPageBtn.id = 'grid_' + grid.option.id + '_page_' + i;
                                goPageBtn.setAttribute('page', i);
                                goPageBtn.title = $.fn.dtGrid.tools.replaceAll($.fn.dtGrid.lang[grid.option.lang].pageInfo.nowPageTitle, '{nowPage}', i);
                                goPageBtn.className = i === nowPage ? 'active' : '';
                                goPageBtn.innerHTML = '<a href="javascript:void(0);">' + $.fn.dtGrid.tools.replaceAll($.fn.dtGrid.lang[grid.option.lang].pageInfo.nowPage, '{nowPage}', i) + '</a>';
                                $('#' + grid.option.id + '_dlshouwenGridOperations').append(goPageBtn);
                                if (i !== nowPage) {
                                    $('#grid_' + grid.option.id + '_page_' + i).click(function () {
                                        grid.goPage($(this).attr('page'));
                                    });
                                }
                            }
                        } else {
                            //获取开始、结束号
                            let before = 2;
                            let after = 2;
                            let start = (nowPage - before) < 1 ? 1 : (nowPage - before);
                            let end = (nowPage + after) > pageCount ? pageCount : (nowPage + after);
                            if ((end - start + 1) < (before + after + 1)) {
                                if (start === 1) {
                                    end = end + ((before + after + 1) - (end - start + 1));
                                    end = end > pageCount ? pageCount : end;
                                }
                                if (end === pageCount) {
                                    start = start - ((before + after + 1) - (end - start + 1));
                                    start = start < 1 ? 1 : start;
                                }
                            }
                            for (let i = start; i <= end; i++) {
                                let goPageBtn = document.createElement('li');
                                goPageBtn.id = 'grid_' + grid.option.id + '_page_' + i;
                                goPageBtn.setAttribute('page', i);
                                goPageBtn.title = $.fn.dtGrid.tools.replaceAll($.fn.dtGrid.lang[grid.option.lang].pageInfo.nowPageTitle, '{nowPage}', i);
                                goPageBtn.className = i === nowPage ? 'active' : '';
                                goPageBtn.innerHTML = '<a href="javascript:void(0);">' + $.fn.dtGrid.tools.replaceAll($.fn.dtGrid.lang[grid.option.lang].pageInfo.nowPage, '{nowPage}', i) + '</a>';
                                $('#' + grid.option.id + '_dlshouwenGridOperations').append(goPageBtn);
                                if (i !== nowPage) {
                                    $('#grid_' + grid.option.id + '_page_' + i).click(function () {
                                        grid.goPage($(this).attr('page'));
                                    });
                                }
                            }
                        }
                        let showPageText = document.createElement('li');
                        showPageText.className = 'active';
                        showPageText.innerHTML = '<a href="javascript:void(0);">' + grid.pager.nowPage + '</a>';
                        //下一页按钮
                        let goNextBtn = document.createElement('li');
                        goNextBtn.id = 'grid_' + grid.option.id + '_page_next';
                        goNextBtn.title = $.fn.dtGrid.lang[grid.option.lang].pageInfo.nextPageTitle;
                        if (nowPage >= pageCount) {
                            goNextBtn.className = 'disabled';
                            goNextBtn.title = $.fn.dtGrid.lang[grid.option.lang].pageInfo.alreadyLastPage;
                        }
                        goNextBtn.innerHTML = '<a href="javascript:void(0);">' + $.fn.dtGrid.lang[grid.option.lang].pageInfo.nextPage + '</a>';
                        $(`#${grid.option.id}_dlshouwenGridOperations`).append(goNextBtn);
                        $('#grid_' + grid.option.id + '_page_next').click(function () {
                            grid.loadByPage('next');
                        });
                        //最后一页按钮
                        let goLastBtn = document.createElement('li');
                        goLastBtn.id = 'grid_' + grid.option.id + '_page_last';
                        goLastBtn.title = $.fn.dtGrid.lang[grid.option.lang].pageInfo.lastPageTitle;
                        if (nowPage >= pageCount) {
                            goLastBtn.className = 'disabled';
                            goLastBtn.title = $.fn.dtGrid.lang[grid.option.lang].pageInfo.alreadyLastPage;
                        }
                        goLastBtn.innerHTML = '<a href="javascript:void(0);">' + $.fn.dtGrid.lang[grid.option.lang].pageInfo.lastPage + '</a>';
                        $(`#${grid.option.id}_dlshouwenGridOperations`).append(goLastBtn);
                        $('#grid_' + grid.option.id + '_page_last').click(function () {
                            grid.loadByPage('last');
                        });
                    }
                    //清除浮动
                    $(`#${grid.option.toolbarContainer}`).find(`.grid-pager`).append('<div class="clearfix"></div>');
                    $('#' + grid.option.toolbarContainer).append('<div class="clearfix"></div>');
                },
                //工具条基础内容
                toolbar: function (type) {
                    //映射表格对象
                    let grid = this;
                    //定义工具条内容
                    let toolbars = {
                        refresh: '<li title="' + $.fn.dtGrid.lang[grid.option.lang].toolbar.refreshTitle + '"><a href="javascript:void(0);" id="refreshGrid_replaceId">' + $.fn.dtGrid.lang[grid.option.lang].toolbar.refresh + '</a></li>',
                        fastQuery: '<li title="' + $.fn.dtGrid.lang[grid.option.lang].toolbar.fastQueryTitle + '"><a href="javascript:void(0);" id="fastQuery_replaceId">' + $.fn.dtGrid.lang[grid.option.lang].toolbar.fastQuery + '</a></li>',
                        advanceQuery: '<li title="' + $.fn.dtGrid.lang[grid.option.lang].toolbar.advanceQueryTitle + '"><a href="javascript:void(0);" id="advanceQuery_replaceId">' + $.fn.dtGrid.lang[grid.option.lang].toolbar.advanceQuery + '</a></li>',
                        exportExcel: '<li title="' + $.fn.dtGrid.lang[grid.option.lang].toolbar.exportExcelTitle + '"><a href="javascript:void(0);" id="exportExcelGrid_replaceId">' + $.fn.dtGrid.lang[grid.option.lang].toolbar.exportExcel + '</a></li>',
                        exportCsv: '<li title="' + $.fn.dtGrid.lang[grid.option.lang].toolbar.exportCsvTitle + '"><a href="javascript:void(0);" id="exportCsvGrid_replaceId">' + $.fn.dtGrid.lang[grid.option.lang].toolbar.exportCsv + '</a></li>',
                        exportPdf: '<li title="' + $.fn.dtGrid.lang[grid.option.lang].toolbar.exportPdfTitle + '"><a href="javascript:void(0);" id="exportPdfGrid_replaceId">' + $.fn.dtGrid.lang[grid.option.lang].toolbar.exportPdf + '</a></li>',
                        exportTxt: '<li title="' + $.fn.dtGrid.lang[grid.option.lang].toolbar.exportTxtTitle + '"><a href="javascript:void(0);" id="exportTxtGrid_replaceId">' + $.fn.dtGrid.lang[grid.option.lang].toolbar.exportTxt + '</a></li>',
                        print: '<li title="' + $.fn.dtGrid.lang[grid.option.lang].toolbar.printTitle + '"><a href="javascript:void(0);" id="printGrid_replaceId">' + $.fn.dtGrid.lang[grid.option.lang].toolbar.print + '</a></li>'
                    };
                    return toolbars[type];
                },
                //构建工具条
                constructGridToolBar: function () {
                    //映射表格对象
                    let grid = this;
                    //清空工具条
                    $('#' + grid.option.toolbarContainer).html('<span class="pagination pagination-sm grid-tools"></span><span class="grid-pager"></span>');
                    //如果为空则不做任何操作
                    if (grid.option.tools === undefined || grid.option.tools === null || grid.option.tools === '') {
                        return;
                    }
                    //遍历工具条定义列表
                    let tools = grid.option.tools;
                    for (let i = 0; i < tools.split('|').length; i++) {
                        let tool = tools.split('|')[i];
                        //处理刷新
                        if (tool === 'refresh') {
                            let content = $.fn.dtGrid.tools.replaceAll(grid.toolbar('refresh'), 'replaceId', grid.option.id);
                            $('#' + grid.option.toolbarContainer + ' .grid-tools').append(content);
                            //绑定方法
                            $('#refreshGrid_' + grid.option.id).click(function () {
                                grid.reload(true);
                            });
                        }
                        //处理快速查询
                        if (tool === 'fastQuery') {
                            let content = $.fn.dtGrid.tools.replaceAll(grid.toolbar('fastQuery'), 'replaceId', grid.option.id);
                            $('#' + grid.option.toolbarContainer + ' .grid-tools').append(content);
                            //绑定方法
                            $('#fastQuery_' + grid.option.id).click(function () {
                                grid.fastQuery();
                            });
                        }
                        //处理高级查询
                        if (tool === 'advanceQuery') {
                            let content = $.fn.dtGrid.tools.replaceAll(grid.toolbar('advanceQuery'), 'replaceId', grid.option.id);
                            $('#' + grid.option.toolbarContainer + ' .grid-tools').append(content);
                            //绑定方法
                            $('#advanceQuery_' + grid.option.id).click(function () {
                                grid.advanceQuery();
                            });
                        }
                        //处理导出
                        if (tool.indexOf('export') !== -1) {
                            tool = $.fn.dtGrid.tools.replaceAll(tool, 'export', '');
                            tool = $.fn.dtGrid.tools.replaceAll(tool, '\\[', '');
                            tool = $.fn.dtGrid.tools.replaceAll(tool, '\\]', '');
                            let content = '';
                            for (let j = 0; j < tool.split(',').length; j++) {
                                let exportTool = tool.split(',')[j];
                                if (exportTool === 'excel') {
                                    content += $.fn.dtGrid.tools.replaceAll(grid.toolbar('exportExcel'), 'replaceId', grid.option.id);
                                }
                                if (exportTool === 'csv') {
                                    content += $.fn.dtGrid.tools.replaceAll(grid.toolbar('exportCsv'), 'replaceId', grid.option.id);
                                }
                                if (exportTool === 'pdf') {
                                    content += $.fn.dtGrid.tools.replaceAll(grid.toolbar('exportPdf'), 'replaceId', grid.option.id);
                                }
                                if (exportTool === 'txt') {
                                    content += $.fn.dtGrid.tools.replaceAll(grid.toolbar('exportTxt'), 'replaceId', grid.option.id);
                                }
                            }
                            $('#' + grid.option.toolbarContainer + ' .grid-tools').append(content);
                            //绑定方法
                            for (let j = 0; j < tool.split(',').length; j++) {
                                let exportTool = tool.split(',')[j];
                                if (exportTool === 'excel') {
                                    $('#exportExcelGrid_' + grid.option.id).click(function () {
                                        grid.exportFile('excel');
                                    });
                                }
                                if (exportTool === 'csv') {
                                    $('#exportCsvGrid_' + grid.option.id).click(function () {
                                        grid.exportFile('csv');
                                    });
                                }
                                if (exportTool === 'pdf') {
                                    $('#exportPdfGrid_' + grid.option.id).click(function () {
                                        grid.exportFile('pdf');
                                    });
                                }
                                if (exportTool === 'txt') {
                                    $('#exportTxtGrid_' + grid.option.id).click(function () {
                                        grid.exportFile('txt');
                                    });
                                }
                            }
                        }
                        //处理打印
                        if (tool === 'print') {
                            let content = $.fn.dtGrid.tools.replaceAll(grid.toolbar('print'), 'replaceId', grid.option.id);
                            $('#' + grid.option.toolbarContainer + ' .grid-tools').append(content);
                            //绑定方法
                            $('#printGrid_' + grid.option.id).click(function () {
                                grid.print();
                            });
                        }
                    }
                },
                /**
                 * 构件表格内部使用方法
                 */
                //创建滚动条
                processBarThread: null,
                processWidth: null,
                showProcessBar: function () {
                    let grid = this;
                    clearInterval(grid.processBarThread);
                    $(`#grid_process_bar_top_${grid.option.id}`).remove();
                    $(`#grid_process_bar_bottom_${grid.option.id}`).remove();
                    grid.processWidth = 0;
                    grid.processBarThread = null;
                    let content = '';
                    content += '<div class="grid-process-bar-top bg-primary" id="grid_process_bar_top_' + grid.option.id + '"></div>';
                    content += '<div class="grid-process-bar-bottom bg-primary" id="grid_process_bar_bottom_' + grid.option.id + '"></div>';
                    $('#' + grid.option.gridContainer).append(content);
                    grid.processWidth += Math.random() * (100 - grid.processWidth) * 0.1;
                    $('#grid_process_bar_top_' + grid.option.id).animate({width: grid.processWidth + '%'}, 200);
                    $('#grid_process_bar_bottom_' + grid.option.id).animate({width: grid.processWidth + '%'}, 200);
                    grid.processBarThread = setInterval(function () {
                        grid.processWidth += Math.random() * (100 - grid.processWidth) * 0.1;
                        $('#grid_process_bar_top_' + grid.option.id).animate({width: grid.processWidth + '%'}, 200);
                        $('#grid_process_bar_bottom_' + grid.option.id).animate({width: grid.processWidth + '%'}, 200);
                    }, 200);
                },
                hideProcessBar: function (callback) {
                    let grid = this;
                    clearInterval(grid.processBarThread);
                    $('#grid_process_bar_top_' + grid.option.id).animate({width: '100%'}, 100, function () {
                        $('#grid_process_bar_top_' + grid.option.id).remove();
                        callback();
                    });
                    $('#grid_process_bar_bottom_' + grid.option.id).animate({width: '100%'}, 100, function () {
                        $('#grid_process_bar_bottom_' + grid.option.id).remove();
                    });
                },
                //格式化内容
                formatContent: function (column, value) {
                    try {
                        //如果是codeTable
                        if (column.codeTable) {
                            let codeTableValue = column.codeTable[value];
                            return codeTableValue ? codeTableValue : value;
                        }
                        //如果是number或date，则需要考虑格式化内容
                        if (column.type === 'number' && column.format) {
                            return $.fn.dtGrid.tools.numberFormat(value, column.format);
                        }
                        if (column.type === 'date' && column.format) {
                            if (column.otype) {
                                if (column.otype === 'time_stamp_s') {
                                    value = new Date(parseFloat(value) * 1000);
                                    return $.fn.dtGrid.tools.dateFormat(value, column.format);
                                } else if (column.otype === 'time_stamp_ms') {
                                    value = new Date(parseFloat(value));
                                    return $.fn.dtGrid.tools.dateFormat(value, column.format);
                                } else if (column.otype === 'string') {
                                    if (column.oformat) {
                                        value = $.fn.dtGrid.tools.toDate(value, column.oformat);
                                        return $.fn.dtGrid.tools.dateFormat(value, column.format);
                                    }
                                }
                            } else {
                                return $.fn.dtGrid.tools.dateFormat(value, column.format);
                            }
                        }
                    } catch (e) {
                    }
                    return value;
                },
                //判断列首的下拉按钮列是否显示
                getExtraColumnClass: function () {
                    //定义表格对象映像
                    let grid = this;
                    let extraColumnClass = '';
                    let temp = [true, true, true, true];
                    let columns = grid.option.columns;
                    for (let i = 0; i < columns.length; i++) {
                        let column = columns[i];
                        if (column.hide !== true && column.hideType !== undefined) {
                            let hideTypeArr = column.hideType.split('|');
                            for (let j = 0; j < hideTypeArr.length; j++) {
                                let type = hideTypeArr[j];
                                if (type === 'lg') temp[0] = 'visible-lg';
                                if (type === 'md') temp[1] = 'visible-md';
                                if (type === 'sm') temp[2] = 'visible-sm';
                                if (type === 'xs') temp[3] = 'visible-xs';
                            }
                        }
                    }
                    for (let i = 0; i < temp.length; i++) {
                        if (temp[i] !== true) extraColumnClass += temp[i] + ' ';
                    }
                    if (extraColumnClass === '')
                        extraColumnClass = 'hidden ';
                    return extraColumnClass;
                },
                //获取显隐的列样式表
                getColumnClassForHide: function (column) {
                    let showClass = '';
                    if (column.hide === true) {
                        showClass += 'hidden ';
                        return showClass;
                    }
                    if (column.hideType !== undefined) {
                        let hideTypeArr = column.hideType.split('|');
                        for (let i = 0; i < hideTypeArr.length; i++) {
                            let type = hideTypeArr[i];
                            if (type === 'lg') showClass += 'hidden-lg ';
                            if (type === 'md') showClass += 'hidden-md ';
                            if (type === 'sm') showClass += 'hidden-sm ';
                            if (type === 'xs') showClass += 'hidden-xs ';
                        }
                    }
                    return showClass;
                },
                //是否显示parent_id
                getParentId: function (value) {
                    let html = '';
                    let grid = this;
                    if (grid.option.isTreeGrid && value !== null) {
                        html = 'data-parent-id="' + value + '"';
                    }
                    return html;
                },
                getTreeColumnClassForHide: function (value) {
                    let grid = this;
                    if (grid.option.isTreeGrid && value !== 0) {
                        return 'hidden'
                    }
                },
                //js嵌套循环
                loop: function (data) {
                    let grid = this;
                    let html = '';
                    let extraColumnClass = grid.getExtraColumnClass();
                    for (let i = 0; i < data.length; i++) {
                        html += '<tr class="grid-row ' + grid.getTreeColumnClassForHide(data[i]['parent_id']) + '" dataNo="' + data[i]['id'] + '" ' + grid.getParentId(data[i]['parent_id']) + '>';
                        if (grid.option.extraWidth !== null) {
                            html += '<td class="extra-column extra-column-event ' + extraColumnClass + '" width="' + grid.option.extraWidth + '" dataNo="' + data[i]['id'] + '">' + $.fn.dtGrid.lang[grid.option.lang].extraColumn.open + '</td>';
                        } else {
                            html += '<td class="extra-column extra-column-event ' + extraColumnClass + '" dataNo="' + data[i]['id'] + '">' + $.fn.dtGrid.lang[grid.option.lang].extraColumn.open + '</td>';
                        }
                        if (grid.option.check) {
                            if (grid.option.checkWidth !== null) {
                                html += '<td class="check-column text-center" width="' + grid.option.checkWidth + '"><input type="checkbox" dataNo="' + data[i]['id'] + '" id="grid_' + grid.option.id + '_check_' + data[i]['id'] + '" class="grid-check" value="' + data[i]['id'] + '"></td>';
                            } else {
                                html += '<td class="check-column text-center"><input type="checkbox" dataNo="' + data[i]['id'] + '" id="grid_' + grid.option.id + '_check_' + data[i]['id'] + '" class="grid-check" value="' + data[i]['id'] + '"></td>';
                            }
                        }
                        let columns = grid.option.columns;
                        for (let j = 0; j < columns.length; j++) {
                            if (columns[j].width !== null) {
                                html += '<td width="' + columns[j].width + '" dataNo="' + data[i]['id'] + '" columnNo="' + j + '" class="grid-cell text-center ' + grid.getColumnClassForHide(columns[j]) + ' ' + columns[j].columnClass + '" style="' + columns[j].columnStyle + '">';
                                if (grid.option.isTreeGrid && data[i]['child'].length !== 0 && j === 0) {
                                    html += '<a class="extra-tree extra-tree-column" href="javascript:;">' + $.fn.dtGrid.lang[grid.option.lang].treeColumn.open + '</a> '
                                }
                                if (grid.option.isTreeGrid && data[i]['child'].length === 0 && j === 0) {
                                    html += '<a class="extra-tree extra-tree-column" href="javascript:;">' + $.fn.dtGrid.lang[grid.option.lang].treeColumn.noChild + '</a> '
                                }
                            } else {
                                html += '<td dataNo="' + data[i]['id'] + '" columnNo="' + j + '" class="grid-cell text-center ' + grid.getColumnClassForHide(columns[j]) + ' ' + columns[j].columnClass + '" style="' + columns[j].columnStyle + '">';
                                if (grid.option.isTreeGrid && data[i]['child'].length !== 0 && j === 0) {
                                    html += '<a class="extra-tree extra-tree-column" href="javascript:;">' + $.fn.dtGrid.lang[grid.option.lang].treeColumn.open + '</a> '
                                }
                                if (grid.option.isTreeGrid && data[i]['child'].length === 0 && j === 0) {
                                    html += '<a  class="extra-tree-column" href="javascript:;">' + $.fn.dtGrid.lang[grid.option.lang].treeColumn.noChild + '</a> '
                                }
                            }
                            let value = data[i][columns[j].id];
                            value = value === null ? '' : value;
                            if (columns[j].resolution) {
                                html += columns[j].resolution(value, data[i], columns[j], grid, i, j);
                            } else {
                                html += grid.formatContent(columns[j], value);
                            }
                            html += '</td>';
                        }
                        html += '</tr>';
                        html += '<tr id="grid_' + grid.option.id + '_extra_columns_' + data[i]['id'] + '" class="grid-extra-columns hidden">';
                        html += '<td dataNo="' + data[i]['id'] + '" colspan="' + (columns.length + 1 + (grid.option.check ? 1 : 0)) + '">';
                        for (let j = 0; j < columns.length; j++) {
                            if (columns[j].extra === false) {
                                continue;
                            }
                            html += '<p dataNo="' + data[i]['id'] + '" columnNo="' + j + '" class="grid-cell ' + grid.getExtraColumnClassForHide(columns[j]) + '">';
                            html += ' ' + columns[j].title + ' : ';
                            let value = data[i][columns[j].id];
                            value = value === null ? '' : value;
                            if (columns[j].resolution) {
                                html += columns[j].resolution(value, data[i], columns[j], grid, i, j);
                            } else {
                                html += grid.formatContent(columns[j], value);
                            }
                            html += '</p>';
                        }
                        html += '</td>';
                        html += '</tr>';
                        if (grid.option.isTreeGrid && data[i]['child'].length !== 0) {
                            html += grid.loop(data[i]['child'])
                        }
                    }
                    return html;
                },
                //获取扩展显隐的列样式表
                getExtraColumnClassForHide: function (column) {
                    let showClass = '';
                    if (column.hide === true) {
                        showClass += 'hidden ';
                        return showClass;
                    }
                    if (column.hideType !== undefined) {
                        let hideTypeArr = column.hideType.split('|');
                        for (let i = 0; i < hideTypeArr.length; i++) {
                            let type = hideTypeArr[i];
                            if (type === 'lg') showClass += 'visible-lg ';
                            if (type === 'md') showClass += 'visible-md ';
                            if (type === 'sm') showClass += 'visible-sm ';
                            if (type === 'xs') showClass += 'visible-xs ';
                        }
                        if (showClass === '')
                            showClass = 'hidden ';
                    } else {
                        showClass = 'hidden ';
                    }
                    return showClass;
                },
                //跳转页面
                goPage: function (_page) {
                    //定义表格对象映像
                    let grid = this;
                    let pageSize = grid.pager.pageSize;
                    let pageCount = grid.pager.pageCount;
                    let page = parseFloat(_page);
                    if (!isNaN(page)) {
                        if (0 < page && page <= pageCount) {
                            grid.pager.nowPage = page;
                            grid.pager.startRecord = pageSize * (page - 1);
                            grid.load();
                        }
                        if (page <= 0) {
                            grid.loadByPage('first');
                        }
                        if (page > pageCount) {
                            grid.loadByPage('last');
                        }
                    }
                },
                //根据页码重新加载，可配置参数：first、prev、next、last
                loadByPage: function (type) {
                    //定义表格对象映像
                    let grid = this;
                    type = type ? type : '';
                    if (type === 'first') {
                        let nowPage = grid.pager.nowPage;
                        if (nowPage > 1) {
                            grid.pager.startRecord = 0;
                            grid.pager.nowPage = 1;
                            grid.load();
                        }
                    } else if (type === 'prev') {
                        let nowPage = grid.pager.nowPage;
                        let pageSize = grid.pager.pageSize;
                        if (nowPage > 1) {
                            nowPage--;
                            grid.pager.nowPage = nowPage;
                            grid.pager.startRecord = pageSize * (nowPage - 1);
                            grid.load();
                        }
                    } else if (type === 'next') {
                        let nowPage;
                        nowPage = grid.pager.nowPage;
                        let pageSize = grid.pager.pageSize;
                        let pageCount = grid.pager.pageCount;
                        if (nowPage < pageCount) {
                            nowPage++;
                            grid.pager.nowPage = nowPage;
                            grid.pager.startRecord = pageSize * (nowPage - 1);
                            grid.load();
                        }
                    } else if (type === 'last') {
                        let nowPage = grid.pager.nowPage;
                        let pageCount = grid.pager.pageCount;
                        if (nowPage < pageCount) {
                            let pageSize = grid.pager.pageSize;
                            let pageCount = grid.pager.pageCount;
                            grid.pager.nowPage = pageCount === 0 ? 1 : pageCount;
                            grid.pager.startRecord = pageSize * (pageCount - 1);
                            if (grid.pager.startRecord < 0)
                                grid.pager.startRecord = 0;
                            grid.load();
                        }
                    } else {
                        grid.load();
                    }
                },
                /**
                 * 快速查询相关
                 */
                //执行快速查询
                fastQuery: function () {
                    //定义表格对象映像
                    let grid = this;
                    //如果已经初始化，则调用显示
                    if (grid.init.fastQueryWindowIsInit) {
                        $('#fast_query_' + grid.option.id + '_modal').modal('show');
                        return;
                    }
                    let content = '';
                    content += $.fn.dtGrid.tools.getWindowStart('fast_query_' + grid.option.id, $.fn.dtGrid.lang[grid.option.lang].fastQuery.title);
                    content += '<form id="fastQueryForm_' + grid.option.id + '">';
                    content += '	<div class="modal-body form-horizontal">';
                    for (let j = 0; j < grid.option.columns.length; j++) {
                        let column = grid.option.columns[j];
                        if (column.fastQuery === true) {
                            content += '<div class="form-group">';
                            content += '	<label class="col-sm-3 control-label text-right">' + column.title + '：</label>';
                            if (column.fastQueryType === 'range') {
                                content += '<div class="col-sm-4">';
                                if (column.type === 'date') {
                                    content += '<div class="input-group">';
                                    content += '	<input type="text" class="form-control" id="ge_' + column.id + '" name="ge_' + column.id + '" format="' + column.format + '" placeholder="' + $.fn.dtGrid.lang[grid.option.lang].fastQuery.selectStart + column.title + '" onclick="WdatePicker({dateFmt:\'' + $.fn.dtGrid.tools.replaceAll(column.format, 'h', 'H') + '\'});" />';
                                    content += '	<div class="input-group-addon"><i class="fa fa-calendar"></i></div>';
                                    content += '</div>';
                                } else {
                                    content += '<input type="text" class="form-control" id="ge_' + column.id + '" name="ge_' + column.id + '" placeholder="' + $.fn.dtGrid.lang[grid.option.lang].fastQuery.inputStart + column.title + '" />';
                                }
                                content += '</div>';
                                content += '<div class="col-sm-4">';
                                if (column.type === 'date') {
                                    content += '<div class="input-group">';
                                    content += '	<input type="text" class="form-control" id="le_' + column.id + '" name="le_' + column.id + '" format="' + column.format + '" placeholder="' + $.fn.dtGrid.lang[grid.option.lang].fastQuery.selectEnd + column.title + '" onclick="WdatePicker({dateFmt:\'' + $.fn.dtGrid.tools.replaceAll(column.format, 'h', 'H') + '\'});" />';
                                    content += '	<div class="input-group-addon"><i class="fa fa-calendar"></i></div>';
                                    content += '</div>';
                                } else {
                                    content += '<input type="text" class="form-control" id="le_' + column.id + '" name="le_' + column.id + '" placeholder="' + $.fn.dtGrid.lang[grid.option.lang].fastQuery.inputEnd + column.title + '" />';
                                }
                                content += '</div>';
                            } else if (column.codeTable) {
                                content += '<div class="col-sm-4">';
                                content += '	<select class="form-control" id="' + column.fastQueryType + '_' + column.id + '" name="' + column.fastQueryType + '_' + column.id + '">';
                                content += '		<option value="">' + $.fn.dtGrid.lang[grid.option.lang].fastQuery.codeTableSelectAll + '</option>';
                                for (let key in column.codeTable) {
                                    //noinspection JSUnfilteredForInLoop
                                    content += '	<option value="' + key + '">' + column.codeTable[key] + '</option>';
                                }
                                content += '	</select>';
                                content += '</div>';
                            } else {
                                content += '<div class="col-sm-4">';
                                if (column.type === 'date') {
                                    content += '<div class="input-group">';
                                    let hoderName = $.fn.dtGrid.lang[grid.option.lang].fastQuery.selectStart;
                                    if (column.fastQueryType === 'lt' || column.fastQueryType === 'le') {
                                        hoderName = $.fn.dtGrid.lang[grid.option.lang].fastQuery.selectEnd;
                                    }
                                    content += '	<input type="text" class="form-control" id="' + column.fastQueryType + '_' + column.id + '" name="' + column.fastQueryType + '_' + column.id + '" format="' + column.format + '" placeholder="' + hoderName + column.title + '" onclick="WdatePicker({dateFmt:\'' + $.fn.dtGrid.tools.replaceAll(column.format, 'h', 'H') + '\'});" />';
                                    content += '	<div class="input-group-addon"><i class="fa fa-calendar"></i></div>';
                                    content += '</div>';
                                } else {
                                    content += '<input type="text" class="form-control" id="' + column.fastQueryType + '_' + column.id + '" name="' + column.fastQueryType + '_' + column.id + '" placeholder="' + $.fn.dtGrid.lang[grid.option.lang].fastQuery.input + column.title + '" />';
                                }
                                content += '</div>';
                            }
                            content += '</div>';
                        }
                    }
                    content += '	</div>';
                    content += '</form>';
                    let buttons = '';
                    buttons += '<button type="button" class="btn btn-warning" id="resetFastQuery_' + grid.option.id + '">' + $.fn.dtGrid.lang[grid.option.lang].fastQuery.buttons.reset + '</button>';
                    buttons += '<button type="button" class="btn btn-primary" id="doFastQuery_' + grid.option.id + '">' + $.fn.dtGrid.lang[grid.option.lang].fastQuery.buttons.query + '</button>';
                    content += $.fn.dtGrid.tools.getWindowEnd($.fn.dtGrid.lang[grid.option.lang].buttons.close, buttons);
                    $('body').append(content);
                    //绑定方法
                    $('#resetFastQuery_' + grid.option.id).click(function () {
                        document.forms['fastQueryForm_' + grid.option.id].reset();
                    });
                    $('#doFastQuery_' + grid.option.id).click(function () {
                        grid.doFastQuery(document.forms['fastQueryForm_' + grid.option.id]);
                        $('#fast_query_' + grid.option.id + '_modal').modal('hide');
                    });
                    //显示快速查询
                    $(`#fast_query_${grid.option.id}_modal`).modal('show');
                    //标识初始化完成
                    grid.init.fastQueryWindowIsInit = true;
                },
                //快速查询方法
                doFastQuery: function (form) {
                    //定义表格对象映像
                    let grid = this;
                    //清空快速查询中的参数
                    grid.fastQueryParameters = {};
                    //遍历获取快速查询参数
                    let elements = form.elements;
                    for (let i = 0; i < elements.length; i++) {
                        let element = elements[i];
                        if ($.fn.dtGrid.tools.equalsIgnoreCase(element.type, 'text')
                            || $.fn.dtGrid.tools.equalsIgnoreCase(element.type, 'hidden')
                            || $.fn.dtGrid.tools.equalsIgnoreCase(element.type, 'textarea')
                            || $.fn.dtGrid.tools.equalsIgnoreCase(element.type, 'select-one')
                            || $.fn.dtGrid.tools.equalsIgnoreCase(element.type, 'password')) {
                            if (element.name !== "") {
                                grid.fastQueryParameters[element.name] = element.value;
                                grid.fastQueryParameters[element.name + '_format'] = element.getAttribute('format');
                            }
                        } else if (($.fn.dtGrid.tools.equalsIgnoreCase(element.type, 'checkbox') || $.fn.dtGrid.tools.equalsIgnoreCase(element.type, 'radio')) && element.checked) {
                            if (element.name !== "") {
                                grid.fastQueryParameters[element.name] = element.value;
                                grid.fastQueryParameters[element.name + '_format'] = element.getAttribute('format');
                            }
                        }
                    }
                    grid.load();
                },
                //快速查询数据过滤（仅限非ajax分页加载模式）
                doFastQueryDatasFilter: function (originalData, fastQueryParameters) {
                    let returnDatas = [];
                    for (let i = 0; i < originalData.length; i++) {
                        let record = originalData[i];
                        let isShow = true;
                        for (let key in fastQueryParameters) {
                            //noinspection JSUnfilteredForInLoop,JSUnfilteredForInLoop,JSUnfilteredForInLoop
                            if (fastQueryParameters[key] && fastQueryParameters[key] !== null && fastQueryParameters[key] !== '') {
                                //noinspection JSUnfilteredForInLoop
                                if ($.fn.dtGrid.tools.startsWith(key, 'eq_')) {
                                    //noinspection JSUnfilteredForInLoop
                                    let value = record[key.replace('eq_', '')];
                                    value = value ? value : '';
                                    //noinspection JSUnfilteredForInLoop
                                    if (value !== fastQueryParameters[key]) {
                                        isShow = false;
                                        continue;
                                    }
                                }
                                //noinspection JSUnfilteredForInLoop
                                if ($.fn.dtGrid.tools.startsWith(key, 'ne_')) {
                                    //noinspection JSUnfilteredForInLoop
                                    let value = record[key.replace('ne_', '')];
                                    value = value ? value : '';
                                    //noinspection JSUnfilteredForInLoop
                                    if (value === fastQueryParameters[key]) {
                                        isShow = false;
                                        continue;
                                    }
                                }
                                //noinspection JSUnfilteredForInLoop
                                if ($.fn.dtGrid.tools.startsWith(key, 'lk_')) {
                                    //noinspection JSUnfilteredForInLoop
                                    let value = record[key.replace('lk_', '')];
                                    value = value ? value : '';
                                    //noinspection JSUnfilteredForInLoop
                                    if (value.indexOf(fastQueryParameters[key]) === -1) {
                                        isShow = false;
                                        continue;
                                    }
                                }
                                //noinspection JSUnfilteredForInLoop
                                if ($.fn.dtGrid.tools.startsWith(key, 'll_')) {
                                    //noinspection JSUnfilteredForInLoop
                                    let value = record[key.replace('ll_', '')];
                                    value = value ? value : '';
                                    //noinspection JSUnfilteredForInLoop
                                    if (!$.fn.dtGrid.tools.startsWith(value, fastQueryParameters[key])) {
                                        isShow = false;
                                        continue;
                                    }
                                }
                                //noinspection JSUnfilteredForInLoop
                                if ($.fn.dtGrid.tools.startsWith(key, 'rl_')) {
                                    //noinspection JSUnfilteredForInLoop
                                    let value = record[key.replace('rl_', '')];
                                    value = value ? value : '';
                                    //noinspection JSUnfilteredForInLoop
                                    if (!$.fn.dtGrid.tools.endsWith(value, fastQueryParameters[key])) {
                                        isShow = false;
                                        continue;
                                    }
                                }
                                //noinspection JSUnfilteredForInLoop
                                if ($.fn.dtGrid.tools.startsWith(key, 'gt_')) {
                                    //noinspection JSUnfilteredForInLoop
                                    let value = record[key.replace('gt_', '')];
                                    value = value ? value : '';
                                    //日期比较
                                    if (value instanceof Date) {
                                        //noinspection JSUnfilteredForInLoop
                                        if ((value.getTime() - $.fn.dtGrid.tools.toDate(fastQueryParameters[key], fastQueryParameters[key + '_format']).getTime()) <= 0) {
                                            isShow = false;
                                            continue;
                                        }
                                    }
                                    //数值比较
                                    if (!(value instanceof Date) && !isNaN(value)) {
                                        //noinspection JSUnfilteredForInLoop
                                        if ((parseFloat(value) - parseFloat(fastQueryParameters[key])) <= 0) {
                                            isShow = false;
                                            continue;
                                        }
                                    }
                                    //普通比较
                                    if (!(value instanceof Date) && isNaN(value)) {
                                        //noinspection JSUnfilteredForInLoop
                                        if (value.localeCompare(fastQueryParameters[key]) <= 0) {
                                            isShow = false;
                                            continue;
                                        }
                                    }
                                }
                                //noinspection JSUnfilteredForInLoop
                                if ($.fn.dtGrid.tools.startsWith(key, 'ge_')) {
                                    //noinspection JSUnfilteredForInLoop
                                    let value = record[key.replace('ge_', '')];
                                    value = value ? value : '';
                                    //日期比较
                                    if (value instanceof Date) {
                                        //noinspection JSUnfilteredForInLoop
                                        if ((value.getTime() - $.fn.dtGrid.tools.toDate(fastQueryParameters[key], fastQueryParameters[key + '_format']).getTime()) < 0) {
                                            isShow = false;
                                            continue;
                                        }
                                    }
                                    //数值比较
                                    if (!(value instanceof Date) && !isNaN(value)) {
                                        //noinspection JSUnfilteredForInLoop
                                        if ((parseFloat(value) - parseFloat(fastQueryParameters[key])) < 0) {
                                            isShow = false;
                                            continue;
                                        }
                                    }
                                    //普通比较
                                    if (!(value instanceof Date) && isNaN(value)) {
                                        //noinspection JSUnfilteredForInLoop
                                        if (value.localeCompare(fastQueryParameters[key]) < 0) {
                                            isShow = false;
                                            continue;
                                        }
                                    }
                                }
                                //noinspection JSUnfilteredForInLoop
                                if ($.fn.dtGrid.tools.startsWith(key, 'lt_')) {
                                    //noinspection JSUnfilteredForInLoop
                                    let value = record[key.replace('lt_', '')];
                                    value = value ? value : '';
                                    //日期比较
                                    if (value instanceof Date) {
                                        //noinspection JSUnfilteredForInLoop
                                        if ((value.getTime() - $.fn.dtGrid.tools.toDate(fastQueryParameters[key], fastQueryParameters[key + '_format']).getTime()) >= 0) {
                                            isShow = false;
                                            continue;
                                        }
                                    }
                                    //数值比较
                                    if (!(value instanceof Date) && !isNaN(value)) {
                                        //noinspection JSUnfilteredForInLoop
                                        if ((parseFloat(value) - parseFloat(fastQueryParameters[key])) >= 0) {
                                            isShow = false;
                                            continue;
                                        }
                                    }
                                    //普通比较
                                    if (!(value instanceof Date) && isNaN(value)) {
                                        //noinspection JSUnfilteredForInLoop
                                        if (value.localeCompare(fastQueryParameters[key]) >= 0) {
                                            isShow = false;
                                            continue;
                                        }
                                    }
                                }
                                //noinspection JSUnfilteredForInLoop
                                if ($.fn.dtGrid.tools.startsWith(key, 'le_')) {
                                    //noinspection JSUnfilteredForInLoop
                                    let value = record[key.replace('le_', '')];
                                    value = value ? value : '';
                                    //日期比较
                                    if (value instanceof Date) {
                                        //noinspection JSUnfilteredForInLoop
                                        if ((value.getTime() - $.fn.dtGrid.tools.toDate(fastQueryParameters[key], fastQueryParameters[key + '_format']).getTime()) > 0) {
                                            isShow = false;
                                            continue;
                                        }
                                    }
                                    //数值比较
                                    if (!(value instanceof Date) && !isNaN(value)) {
                                        //noinspection JSUnfilteredForInLoop
                                        if ((parseFloat(value) - parseFloat(fastQueryParameters[key])) > 0) {
                                            isShow = false;
                                            continue;
                                        }
                                    }
                                    //普通比较
                                    if (!(value instanceof Date) && isNaN(value)) {
                                        //noinspection JSUnfilteredForInLoop
                                        if (value.localeCompare(fastQueryParameters[key]) > 0) {
                                            isShow = false;
                                        }
                                    }
                                }
                            }
                        }
                        if (isShow) {
                            returnDatas.push(record);
                        }
                    }
                    return returnDatas;
                },
                /**
                 * 高级查询相关
                 */
                //高级查询方法
                advanceQuery: function () {
                    //定义表格对象映像
                    let grid = this;
                    //如果已经初始化，则调用显示
                    if (grid.init.advanceQueryWindowIsInit) {
                        $('#advance_query_' + grid.option.id + '_modal').modal('show');
                        return;
                    }
                    //加载查询内容
                    let content = '';
                    content += $.fn.dtGrid.tools.getWindowStart('advance_query_' + grid.option.id, $.fn.dtGrid.lang[grid.option.lang].advanceQuery.title);
                    content += '<div class="modal-body advance-query">';
                    content += '	<ul class="nav nav-tabs" role="tablist">';
//					content += '		<li><a href="#advance_query_plan_'+grid.option.id+'" role="tab" data-toggle="tab">'+$.fn.dtGrid.lang[grid.option.lang].advanceQuery.plan.title+'</a></li>';
                    content += '		<li class="active"><a href="#advance_query_condition_' + grid.option.id + '" role="tab" data-toggle="tab">' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.title + '</a></li>';
                    content += '		<li><a href="#advance_query_sort_' + grid.option.id + '" role="tab" data-toggle="tab">' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.sort.title + '</a></li>';
                    content += '	</ul>';
                    content += '	<div class="tab-content">';
//					content += '		<div class="tab-pane" id="advance_query_plan_'+grid.option.id+'">';
//					content += '			<div class="panel panel-default">';
//					content += '				<input type="hidden" id="advanceQueryId_'+grid.option.id+'" name="advanceQueryId_'+grid.option.id+'" />';
//					content += '				<div class="form-horizontal" style="padding-top:15px;">';
//					content += '					<div class="form-group">';
//					content += '						<label class="col-sm-3 control-label text-right">'+$.fn.dtGrid.lang[grid.option.lang].advanceQuery.plan.advanceQueryName+'</label>';
//					content += '						<div class="col-sm-6">';
//					content += '							<input type="text" class="form-control" id="advanceQueryName_'+grid.option.id+'" name="advanceQueryName_'+grid.option.id+'" placeholder="'+$.fn.dtGrid.lang[grid.option.lang].advanceQuery.plan.advanceQueryNamePlaceHoder+'">';
//					content += '						</div>';
//					content += '					</div>';
//					content += '					<div class="form-group">';
//					content += '						<label class="col-sm-3 control-label text-right">'+$.fn.dtGrid.lang[grid.option.lang].advanceQuery.plan.remark+'</label>';
//					content += '						<div class="col-sm-6">';
//					content += '							<textarea id="remark_'+grid.option.id+'" name="remark_'+grid.option.id+'" class="form-control" placeholder="'+$.fn.dtGrid.lang[grid.option.lang].advanceQuery.plan.remarkPlaceHoder+'"></textarea>';
//					content += '						</div>';
//					content += '					</div>';
//					content += '					<div class="form-group">';
//					content += '						<div class="col-sm-offset-3 col-sm-12">';
//					content += '							<button id="addAdvanceQuery_'+grid.option.id+'" title="'+$.fn.dtGrid.lang[grid.option.lang].advanceQuery.plan.buttons.addAdvanceQueryTitle+'" class="btn btn-xs btn-primary">';
//					content += '								'+$.fn.dtGrid.lang[grid.option.lang].advanceQuery.plan.buttons.addAdvanceQuery;
//					content += '							</button>';
//					content += '							<button id="editAdvanceQuery_'+grid.option.id+'" title="'+$.fn.dtGrid.lang[grid.option.lang].advanceQuery.plan.buttons.editAdvanceQueryTitle+'" class="btn btn-xs btn-primary">';
//					content += '								'+$.fn.dtGrid.lang[grid.option.lang].advanceQuery.plan.buttons.editAdvanceQuery;
//					content += '							</button>';
//					content += '							<button id="copyAdvanceQuery_'+grid.option.id+'" title="'+$.fn.dtGrid.lang[grid.option.lang].advanceQuery.plan.buttons.copyAdvanceQueryTitle+'" class="btn btn-xs btn-warning">';
//					content += '								'+$.fn.dtGrid.lang[grid.option.lang].advanceQuery.plan.buttons.copyAdvanceQuery;
//					content += '							</button>';
//					content += '							<button id="deleteAdvanceQuery_'+grid.option.id+'" title="'+$.fn.dtGrid.lang[grid.option.lang].advanceQuery.plan.buttons.deleteAdvanceQueryTitle+'" class="btn btn-xs btn-danger">';
//					content += '								'+$.fn.dtGrid.lang[grid.option.lang].advanceQuery.plan.buttons.deleteAdvanceQuery;
//					content += '							</button>';
//					content += '						</div>';
//					content += '					</div>';
//					content += '				</div>';
//					content += '			</div>';
//					content += '		</div>';
                    content += '		<div class="tab-pane active" id="advance_query_condition_' + grid.option.id + '">';
                    content += '			<div class="panel panel-default">';
                    content += '				<div class="form-horizontal text-right advance-query-buttons">';
                    content += '					<button id="insertConditionTr_' + grid.option.id + '" title="' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.buttons.insertTitle + '" class="btn btn-xs btn-primary">';
                    content += '						' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.buttons.insert;
                    content += '					</button>';
                    content += '					<button id="clearConditionTr_' + grid.option.id + '" title="' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.buttons.clearTitle + '" class="btn btn-xs btn-danger">';
                    content += '						' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.buttons.clear;
                    content += '					</button>';
                    content += '				</div>';
                    content += '				<div class="advance-query-table-container">';
                    content += '					<table id="conditionTable_' + grid.option.id + '" class="table table-bordered table-striped table-hover table-condition table-center" style="width:860px;">';
                    content += '						<tr>';
                    content += '							<th style="width:50px;">' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.table.sequence + '</th>';
                    content += '							<th style="width:100px;">' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.table.operation + '</th>';
                    content += '							<th style="width:80px;">' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.table.leftParentheses + '</th>';
                    content += '							<th style="width:140px;">' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.table.field + '</th>';
                    content += '							<th style="width:120px;">' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.table.condition + '</th>';
                    content += '							<th>' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.table.value + '</th>';
                    content += '							<th style="width:80px;">' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.table.rightParentheses + '</th>';
                    content += '							<th style="width:90px;">' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.table.logic + '</th>';
                    content += '						</tr>';
                    content += '					</table>';
                    content += '				</div>';
                    content += '				<div class="clearfix"></div>';
                    content += '			</div>';
                    content += '		</div>';
                    content += '		<div class="tab-pane" id="advance_query_sort_' + grid.option.id + '">';
                    content += '			<div class="panel panel-default">';
                    content += '				<div class="form-horizontal text-right advance-query-buttons">';
                    content += '					<button id="insertSortTr_' + grid.option.id + '" title="' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.sort.buttons.insertTitle + '" class="btn btn-xs btn-primary">';
                    content += '						' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.sort.buttons.insert;
                    content += '					</button>';
                    content += '					<button id="clearSortTr_' + grid.option.id + '" title="' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.sort.buttons.clearTitle + '" class="btn btn-xs btn-danger">';
                    content += '						' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.sort.buttons.clear;
                    content += '					</button>';
                    content += '				</div>';
                    content += '				<div class="advance-query-table-container">';
                    content += '					<table id="sortTable_' + grid.option.id + '" class="table table-bordered table-striped table-hover table-condition table-center">';
                    content += '						<tr>';
                    content += '							<th>' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.sort.table.sequence + '</th>';
                    content += '							<th>' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.sort.table.operation + '</th>';
                    content += '							<th>' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.sort.table.field + '</th>';
                    content += '							<th>' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.sort.table.logic + '</th>';
                    content += '						</tr>';
                    content += '					</table>';
                    content += '				</div>';
                    content += '				<div class="clearfix"></div>';
                    content += '			</div>';
                    content += '		</div>';
                    content += '	</div>';
                    content += '</div>';
                    let buttons = '';
                    buttons += '<button type="button" class="btn btn-primary" id="doAdvanceQuery_' + grid.option.id + '">';
                    buttons += '	' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.buttons.query;
                    buttons += '</button>';
                    content += $.fn.dtGrid.tools.getWindowEnd($.fn.dtGrid.lang[grid.option.lang].buttons.close, buttons);
                    $('body').append(content);
//					//新增高级查询方案
//					$('#insertConditionTr_'+grid.option.id).click(function(){
//					});
//					//编辑高级查询方案
//					$('#editConditionTr_'+grid.option.id).click(function(){
//					});
//					//赋值高级查询方案
//					$('#copyConditionTr_'+grid.option.id).click(function(){
//					});
//					//删除高级查询方案
//					$('#deleteConditionTr_'+grid.option.id).click(function(){
//					});
                    //新增一行查询条件
                    $('#insertConditionTr_' + grid.option.id).click(function () {
                        grid.insertConditionTr();
                    });
                    //清空查询条件
                    $('#clearConditionTr_' + grid.option.id).click(function () {
                        grid.clearConditionTr();
                    });
                    //新增一行排序条件
                    $('#insertSortTr_' + grid.option.id).click(function () {
                        grid.insertSortTr();
                    });
                    //清空排序条件
                    $('#clearSortTr_' + grid.option.id).click(function () {
                        grid.clearSortTr();
                    });
                    //绑定方法：执行高级查询
                    $('#doAdvanceQuery_' + grid.option.id).click(function () {
                        grid.doAdvanceQuery();
                    });
                    //显示高级查询
                    $(`#advance_query_${grid.option.id}_modal`).modal('show');
                    //标识初始化完成
                    grid.init.advanceQueryWindowIsInit = true;
                },
                //高级查询执行
                doAdvanceQuery: function () {
                    //定义表格对象映像
                    let grid = this;
                    //校验
                    let pass = true;
                    let advanceQueryConditionList = [];
                    $('#conditionTable_' + grid.option.id + ' tr[id*=tr_' + grid.option.id + '_]').each(function () {
                        let id = this.id.split('_')[2];
                        let seq = $('#conditionTable_' + grid.option.id + ' #seqTd_' + grid.option.id + '_' + id).html();
                        let leftParentheses = $('#conditionTable_' + grid.option.id + ' #leftParentheses_' + grid.option.id + '_' + id).val();
                        let field = $('#conditionTable_' + grid.option.id + ' #field_' + grid.option.id + '_' + id).val();
                        let format = $('#conditionTable_' + grid.option.id + ' #format_' + grid.option.id + '_' + id).val();
                        let condition = $('#conditionTable_' + grid.option.id + ' #condition_' + grid.option.id + '_' + id).val();
                        let value = $('#conditionTable_' + grid.option.id + ' #value_' + grid.option.id + '_' + id).val();
                        let rightParentheses = $('#conditionTable_' + grid.option.id + ' #rightParentheses_' + grid.option.id + '_' + id).val();
                        let logic = $('#conditionTable_' + grid.option.id + ' #logic_' + grid.option.id + '_' + id).val();
                        if (field === '') {
                            $.fn.dtGrid.tools.toast($.fn.dtGrid.tools.replaceAll($.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.errors.fieldMustSelect, '{sequence}', seq), 'warning', 3000);
                            pass = false;
                            return false;
                        }
                        if (condition === '') {
                            $.fn.dtGrid.tools.toast($.fn.dtGrid.tools.replaceAll($.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.errors.conditionMustSelect, '{sequence}', seq), 'warning', 3000);
                            pass = false;
                            return false;
                        }
                        let advanceQueryCondition = {};
                        advanceQueryCondition.id = id;
                        advanceQueryCondition.seq = seq;
                        advanceQueryCondition.leftParentheses = leftParentheses;
                        advanceQueryCondition.field = field;
                        advanceQueryCondition.format = format;
                        advanceQueryCondition.condition = condition;
                        advanceQueryCondition.value = value;
                        advanceQueryCondition.rightParentheses = rightParentheses;
                        advanceQueryCondition.logic = logic;
                        advanceQueryConditionList.push(advanceQueryCondition);
                    });
                    let advanceQuerySortList = [];
                    $('#sortTable_' + grid.option.id + ' tr[id*=tr_' + grid.option.id + '_]').each(function () {
                        let id = this.id.split('_')[2];
                        let seq = $('#sortTable_' + grid.option.id + ' #seqTd_' + grid.option.id + '_' + id).html();
                        let sortField = $('#sortTable_' + grid.option.id + ' #sortField_' + grid.option.id + '_' + id).val();
                        let sortLogic = $('#sortTable_' + grid.option.id + ' #sortLogic_' + grid.option.id + '_' + id).val();
                        if (sortField === '') {
                            $.fn.dtGrid.tools.toast($.fn.dtGrid.tools.replaceAll($.fn.dtGrid.lang[grid.option.lang].advanceQuery.sort.errors.fieldMustSelect, '{sequence}', seq), 'warning', 3000);
                            pass = false;
                            return false;
                        }
                        if (sortLogic === '') {
                            $.fn.dtGrid.tools.toast($.fn.dtGrid.tools.replaceAll($.fn.dtGrid.lang[grid.option.lang].advanceQuery.sort.errors.logicMustSelect, '{sequence}', seq), 'warning', 3000);
                            pass = false;
                            return false;
                        }
                        let advanceQuerySort = {};
                        advanceQuerySort.field = sortField;
                        advanceQuerySort.logic = sortLogic;
                        advanceQuerySortList.push(advanceQuerySort);
                    });
                    if (pass) {
                        grid.advanceQueryParameter = {};
                        grid.advanceQueryParameter.advanceQueryConditions = advanceQueryConditionList;
                        grid.advanceQueryParameter.advanceQuerySorts = advanceQuerySortList;
                        grid.load();
                        $('#advance_query_' + grid.option.id + '_modal').modal('hide');
                    }
                },
                //高级查询数据过滤（仅限非ajax及全部加载模式）
                doAdvanceQueryDatasFilter: function (originalData, advanceQueryParameter) {
                    let returnDatas = [];
                    for (let i = 0; i < originalData.length; i++) {
                        let record = originalData[i];
                        if (advanceQueryParameter.advanceQueryConditions && advanceQueryParameter.advanceQueryConditions.length > 0) {
                            let condition = '';
                            for (let j = 0; j < advanceQueryParameter.advanceQueryConditions.length; j++) {
                                let advanceQueryCondition = advanceQueryParameter.advanceQueryConditions[j];
                                condition += advanceQueryCondition.leftParentheses;
                                if (advanceQueryCondition.condition === '0') {
                                    condition += 'record["' + advanceQueryCondition.field + '"]=="' + advanceQueryCondition.value + '"';
                                }
                                if (advanceQueryCondition.condition === '1') {
                                    condition += 'record["' + advanceQueryCondition.field + '"]!="' + advanceQueryCondition.value + '"';
                                }
                                if (advanceQueryCondition.condition === '2') {
                                    condition += 'record["' + advanceQueryCondition.field + '"].indexOf("' + advanceQueryCondition.value + '")!=-1';
                                }
                                if (advanceQueryCondition.condition === '3') {
                                    condition += '$.fn.dtGrid.tools.startsWith(record["' + advanceQueryCondition.field + '"], "' + advanceQueryCondition.value + '")';
                                }
                                if (advanceQueryCondition.condition === '4') {
                                    condition += '$.fn.dtGrid.tools.endsWith(record["' + advanceQueryCondition.field + '"], "' + advanceQueryCondition.value + '")';
                                }
                                if (advanceQueryCondition.condition === '5') {
                                    let value = record[advanceQueryCondition.field];
                                    //日期比较
                                    if (value instanceof Date) {
                                        condition += '(record["' + advanceQueryCondition.field + '"].getTime()-$.fn.dtGrid.tools.toDate("' + advanceQueryCondition.value + '", "' + advanceQueryCondition.format + '").getTime())>0';
                                    }
                                    //数值比较
                                    if (!(value instanceof Date) && !isNaN(value)) {
                                        condition += '(parseFloat(record["' + advanceQueryCondition.field + '"]) - parseFloat("' + advanceQueryCondition.value + '"))>0';
                                    }
                                    //普通比较
                                    if (!(value instanceof Date) && isNaN(value)) {
                                        condition += 'record["' + advanceQueryCondition.field + '"].localeCompare("' + advanceQueryCondition.value + '")>0';
                                    }
                                }
                                if (advanceQueryCondition.condition === '6') {
                                    let value = record[advanceQueryCondition.field];
                                    //日期比较
                                    if (value instanceof Date) {
                                        condition += '(record["' + advanceQueryCondition.field + '"].getTime()-$.fn.dtGrid.tools.toDate("' + advanceQueryCondition.value + '", "' + advanceQueryCondition.format + '").getTime())>=0';
                                    }
                                    //数值比较
                                    if (!(value instanceof Date) && !isNaN(value)) {
                                        condition += '(parseFloat(record["' + advanceQueryCondition.field + '"]) - parseFloat("' + advanceQueryCondition.value + '"))>=0';
                                    }
                                    //普通比较
                                    if (!(value instanceof Date) && isNaN(value)) {
                                        condition += 'record["' + advanceQueryCondition.field + '"].localeCompare("' + advanceQueryCondition.value + '")>=0';
                                    }
                                }
                                if (advanceQueryCondition.condition === '7') {
                                    let value = record[advanceQueryCondition.field];
                                    //日期比较
                                    if (value instanceof Date) {
                                        condition += '(record["' + advanceQueryCondition.field + '"].getTime()-$.fn.dtGrid.tools.toDate("' + advanceQueryCondition.value + '", "' + advanceQueryCondition.format + '").getTime())<0';
                                    }
                                    //数值比较
                                    if (!(value instanceof Date) && !isNaN(value)) {
                                        condition += '(parseFloat(record["' + advanceQueryCondition.field + '"]) - parseFloat("' + advanceQueryCondition.value + '"))<0';
                                    }
                                    //普通比较
                                    if (!(value instanceof Date) && isNaN(value)) {
                                        condition += 'record["' + advanceQueryCondition.field + '"].localeCompare("' + advanceQueryCondition.value + '")<0';
                                    }
                                }
                                if (advanceQueryCondition.condition === '8') {
                                    let value = record[advanceQueryCondition.field];
                                    //日期比较
                                    if (value instanceof Date) {
                                        condition += '(record["' + advanceQueryCondition.field + '"].getTime()-$.fn.dtGrid.tools.toDate("' + advanceQueryCondition.value + '", "' + advanceQueryCondition.format + '").getTime())<=0';
                                    }
                                    //数值比较
                                    if (!(value instanceof Date) && !isNaN(value)) {
                                        condition += '(parseFloat(record["' + advanceQueryCondition.field + '"]) - parseFloat("' + advanceQueryCondition.value + '"))<=0';
                                    }
                                    //普通比较
                                    if (!(value instanceof Date) && isNaN(value)) {
                                        condition += 'record["' + advanceQueryCondition.field + '"].localeCompare("' + advanceQueryCondition.value + '")<=0';
                                    }
                                }
                                if (advanceQueryCondition.condition === '9') {
                                    condition += '!record["' + advanceQueryCondition.field + '"]';
                                }
                                if (advanceQueryCondition.condition === '10') {
                                    condition += 'record["' + advanceQueryCondition.field + '"]';
                                }
                                condition += advanceQueryCondition.rightParentheses;
                                if (advanceQueryCondition.logic === '0') {
                                    condition += '&&';
                                }
                                if (advanceQueryCondition.logic === '1') {
                                    condition += '||';
                                }
                            }
                            try {
                                if (eval(condition)) {
                                    returnDatas.push(record);
                                }
                            } catch (e) {
                                $.fn.dtGrid.tools.toast($.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.errors.conditionError, 'error', 3000);
                                return originalData;
                            }
                        } else {
                            returnDatas.push(record);
                        }
                    }
                    //处理排序
                    if (advanceQueryParameter.advanceQuerySorts && advanceQueryParameter.advanceQuerySorts.length > 0) {
                        returnDatas = returnDatas.sort(function (record1, record2) {
                            for (let i = 0; i < advanceQueryParameter.advanceQuerySorts.length; i++) {
                                let advanceQuerySort = advanceQueryParameter.advanceQuerySorts[i];
                                let value1 = record1[advanceQuerySort.field];
                                let value2 = record2[advanceQuerySort.field];
                                //如果相同则比较下一个
                                if (value1 === value2) {
                                    continue;
                                }
                                //数值比较
                                if (!isNaN(value1) && !isNaN(value2)) {
                                    if (advanceQuerySort.logic === '0') {
                                        return value1 - value2;
                                    }
                                    if (advanceQuerySort.logic === '1') {
                                        return value2 - value1;
                                    }
                                }
                                //日期比较
                                if (value1 instanceof Date && value2 instanceof Date) {
                                    if (advanceQuerySort.logic === '0') {
                                        return value1.getTime() - value2.getTime();
                                    }
                                    if (advanceQuerySort.logic === '1') {
                                        return value2.getTime() - value1.getTime();
                                    }
                                }
                                //普通比较
                                if (value1 !== null && advanceQuerySort.logic === '0') {
                                    return value1.localeCompare(value2);
                                }
                                if (value2 !== null && advanceQuerySort.logic === '1') {
                                    return value2.localeCompare(value1);
                                }
                            }
                            return 0;
                        });
                    }
                    return returnDatas;
                },
                //查询条件序列号
                sequenceCondition: 0,
                //新增一行查询条件
                insertConditionTr: function () {
                    //定义表格对象映像
                    let grid = this;
                    //处理内容
                    let content = '';
                    content += '<tr id="tr_' + grid.option.id + '_' + grid.sequenceCondition + '">';
                    content += '	<td id="seqTd_' + grid.option.id + '_' + grid.sequenceCondition + '"></td>';
                    content += '	<td>';
                    content += '		<button type="button" id="moveUpConditionTr_' + grid.option.id + '_' + grid.sequenceCondition + '" class="btn btn-primary btn-xs" title="' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.table.buttons.upTitle + '">' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.table.buttons.up + '</button>';
                    content += '		<button type="button" id="moveDownConditionTr_' + grid.option.id + '_' + grid.sequenceCondition + '" class="btn btn-primary btn-xs" title="' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.table.buttons.downTitle + '">' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.table.buttons.down + '</button>';
                    content += '		<button type="button" id="deleteConditionTr_' + grid.option.id + '_' + grid.sequenceCondition + '" class="btn btn-danger btn-xs" title="' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.table.buttons.deleteTitle + '">' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.condition.table.buttons['delete'] + '</button>';
                    content += '	</td>';
                    content += '	<td>';
                    content += '		<input type="text" id="leftParentheses_' + grid.option.id + '_' + grid.sequenceCondition + '" name="leftParentheses_' + grid.option.id + '_' + grid.sequenceCondition + '" class="form-control" />';
                    content += '	</td>';
                    content += '	<td>';
                    content += '		<select id="field_' + grid.option.id + '_' + grid.sequenceCondition + '" name="field_' + grid.option.id + '_' + grid.sequenceCondition + '" class="form-control">';
                    content += '			<option value=""></option>';
                    for (let i = 0; i < grid.option.columns.length; i++) {
                        let column = grid.option.columns[i];
                        if (column.advanceQuery !== false) {
                            content += '	<option value="' + column.id + '">' + column.title + '</option>';
                        }
                    }
                    content += '		</select>';
                    content += '		<input type="hidden" id="format_' + grid.option.id + '_' + grid.sequenceCondition + '" name="format_' + grid.option.id + '_' + grid.sequenceCondition + '" />';
                    content += '	</td>';
                    content += '	<td>';
                    content += '		<select id="condition_' + grid.option.id + '_' + grid.sequenceCondition + '" name="condition_' + grid.option.id + '_' + grid.sequenceCondition + '" class="form-control">';
                    content += '			<option value=""></option>';
                    content += '			<option value="0">=</option>';
                    content += '			<option value="1">!=</option>';
                    content += '			<option value="2">like</option>';
                    content += '			<option value="3">start with</option>';
                    content += '			<option value="4">end with</option>';
                    content += '			<option value="5">&gt;</option>';
                    content += '			<option value="6">&gt;=</option>';
                    content += '			<option value="7">&lt;</option>';
                    content += '			<option value="8">&lt;=</option>';
                    content += '			<option value="9">is null</option>';
                    content += '			<option value="10">is not null</option>';
                    content += '		</select>';
                    content += '	</td>';
                    content += '	<td id="valueTd_' + grid.option.id + '_' + grid.sequenceCondition + '"></td>';
                    content += '	<td>';
                    content += '		<input type="text" id="rightParentheses_' + grid.option.id + '_' + grid.sequenceCondition + '" name="rightParentheses_' + grid.option.id + '_' + grid.sequenceCondition + '" class="form-control" />';
                    content += '	</td>';
                    content += '	<td>';
                    content += '		<select id="logic_' + grid.option.id + '_' + grid.sequenceCondition + '" name="logic_' + grid.option.id + '_' + grid.sequenceCondition + '" class="form-control">';
                    content += '			<option value=""></option>';
                    content += '			<option value="0">and</option>';
                    content += '			<option value="1">or</option>';
                    content += '		</select>';
                    content += '	</td>';
                    content += '</tr>';
                    $('#conditionTable_' + grid.option.id).append(content);
                    //绑定方法-上移
                    $('#moveUpConditionTr_' + grid.option.id + '_' + grid.sequenceCondition).click(function () {
                        let sequenceCondition = this.id.split('_')[2];
                        grid.moveUpConditionTr(sequenceCondition);
                    });
                    //绑定方法-下移
                    $('#moveDownConditionTr_' + grid.option.id + '_' + grid.sequenceCondition).click(function () {
                        let sequenceCondition = this.id.split('_')[2];
                        grid.moveDownConditionTr(sequenceCondition);
                    });
                    //绑定方法-删除
                    $('#deleteConditionTr_' + grid.option.id + '_' + grid.sequenceCondition).click(function () {
                        let sequenceCondition = this.id.split('_')[2];
                        grid.deleteConditionTr(sequenceCondition);
                    });
                    //绑定方法-左括号
                    $('#leftParentheses_' + grid.option.id + '_' + grid.sequenceCondition).keyup(function () {
                        let sequenceCondition = this.id.split('_')[2];
                        grid.validLeftParentheses(sequenceCondition);
                    });
                    //绑定方法-字段变更
                    $('#field_' + grid.option.id + '_' + grid.sequenceCondition).change(function () {
                        let sequenceCondition = this.id.split('_')[2];
                        grid.fieldChange(sequenceCondition);
                    });
                    //绑定方法-条件变更
                    $('#condition_' + grid.option.id + '_' + grid.sequenceCondition).change(function () {
                        let sequenceCondition = this.id.split('_')[2];
                        grid.conditionChange(sequenceCondition);
                    });
                    //绑定方法-右括号
                    $('#rightParentheses_' + grid.option.id + '_' + grid.sequenceCondition).keyup(function () {
                        let sequenceCondition = this.id.split('_')[2];
                        grid.validRightParentheses(sequenceCondition);
                    });
                    grid.sequenceCondition++;
                    grid.resetConditionSeq();
                },
                //清除所有行
                clearConditionTr: function () {
                    //定义表格对象映像
                    let grid = this;
                    $('#conditionTable_' + grid.option.id + ' tr[id*=tr_' + grid.option.id + '_]').remove();
                },
                //序列号重置
                resetConditionSeq: function () {
                    //定义表格对象映像
                    let grid = this;
                    let seq = 1;
                    $('#conditionTable_' + grid.option.id + ' tr[id*=tr_' + grid.option.id + '_]').each(function () {
                        let id = this.id.split('_')[2];
                        $('#conditionTable_' + grid.option.id + ' #seqTd_' + grid.option.id + '_' + id).html(seq);
                        seq++;
                    });
                },
                //上移
                moveUpConditionTr: function (id) {
                    //定义表格对象映像
                    let grid = this;
                    $(`#conditionTable_${grid.option.id}`).find(`#tr_${grid.option.id}_${id}`).prev('#conditionTable_' + grid.option.id + ' tr[id*=tr_' + grid.option.id + '_]').before($('#conditionTable_' + grid.option.id + ' #tr_' + grid.option.id + '_' + id));
                    grid.resetConditionSeq();
                },
                //下移
                moveDownConditionTr: function (id) {
                    //定义表格对象映像
                    let grid = this;
                    $(`#conditionTable_${grid.option.id}`).find(`#tr_${grid.option.id}_${id}`).next('#conditionTable_' + grid.option.id + ' tr[id*=tr_' + grid.option.id + '_]').after($('#conditionTable_' + grid.option.id + ' #tr_' + grid.option.id + '_' + id));
                    grid.resetConditionSeq();
                },
                //删除当前行
                deleteConditionTr: function (id) {
                    //定义表格对象映像
                    let grid = this;
                    $('#conditionTable_' + grid.option.id + ' #tr_' + grid.option.id + '_' + id).remove();
                    grid.resetConditionSeq();
                },
                //左括号的验证函数
                validLeftParentheses: function (id) {
                    //定义表格对象映像
                    let grid = this;
                    //执行验证
                    let value = $(`#leftParentheses_${grid.option.id}_${id}`).val();
                    if (!value.match(/^[(]*$/g)) {
                        value = $.fn.dtGrid.tools.replaceAll(value, '（', '(');
                        value = value.replace(/[^(]/g, '');
                        $('#leftParentheses_' + grid.option.id + '_' + id).val(value);
                    }
                },
                //列变更触发
                fieldChange: function (id) {
                    //定义表格对象映像
                    let grid = this;
                    //获取当前的值
                    let field = $('#field_' + grid.option.id + '_' + id).val();
                    //如果为空或条件一栏为9-10则滞空值栏
                    let condition = $('#condition_' + grid.option.id + '_' + id).val();
                    if (field === '' || condition === '9' || condition === '10') {
                        $('#valueTd_' + grid.option.id + '_' + id).html('');
                        return;
                    }
                    //获取列对象
                    let column = {};
                    for (let i = 0; i < grid.option.columns.length; i++) {
                        if (grid.option.columns[i].id === field && grid.option.columns[i].advanceQuery !== false) {
                            column = grid.option.columns[i];
                            break;
                        }
                    }
                    //处理日期类型
                    if (column.type === 'date') {
                        let content = '';
                        content += '<div class="input-group">';
                        content += '	<input id="value_' + grid.option.id + '_' + id + '" name="value_' + grid.option.id + '_' + id + '" class="form-control" onclick="WdatePicker({dateFmt:\'' + $.fn.dtGrid.tools.replaceAll(column.format, 'h', 'H') + '\'})" />';
                        content += '	<div class="input-group-addon"><i class="fa fa-calendar"></i></div>';
                        content += '</div>';
                        $('#valueTd_' + grid.option.id + '_' + id).html(content);
                        $('#format_' + grid.option.id + '_' + id).val(column.format);
                        return;
                    }
                    //处理codeTable内容
                    if (column.codeTable) {
                        let content = '';
                        content += '<select id="value_' + grid.option.id + '_' + id + '" name="value_' + grid.option.id + '_' + id + '" class="form-control">';
                        content += '	<option value=""></option>';
                        for (let key in column.codeTable) {
                            //noinspection JSUnfilteredForInLoop
                            content += '<option value="' + key + '">' + column.codeTable[key] + '</option>';
                        }
                        content += '</select>';
                        $('#valueTd_' + grid.option.id + '_' + id).html(content);
                        return;
                    }
                    //其他则为默认文本
                    let content = '<input id="value_' + grid.option.id + '_' + id + '" name="value_' + grid.option.id + '_' + id + '" class="form-control" />';
                    $(`#valueTd_${grid.option.id}_${id}`).html(content);
                },
                //条件触发
                conditionChange: function (id) {
                    //定义表格对象映像
                    let grid = this;
                    let condition = $('#condition_' + grid.option.id + '_' + id).val();
                    if (condition === '9' || condition === '10') {
                        $('#valueTd_' + grid.option.id + '_' + id).html('');
                    } else {
                        let valueHtml = $('#valueTd_' + grid.option.id + '_' + id).html();
                        if (valueHtml === '') {
                            grid.fieldChange(id);
                        }
                    }
                },
                //右括号的验证函数
                validRightParentheses: function (id) {
                    //定义表格对象映像
                    let grid = this;
                    let value = $(`#rightParentheses_${grid.option.id}_${id}`).val();
                    if (!value.match(/^[(]*$/g)) {
                        value = $.fn.dtGrid.tools.replaceAll(value, '）', ')');
                        value = value.replace(/[^)]/g, '');
                        $('#rightParentheses_' + grid.option.id + '_' + id).val(value);
                    }
                },
                //排序条件序列号
                sequenceSort: 0,
                //插入一行排序条件
                insertSortTr: function () {
                    //定义表格对象映像
                    let grid = this;
                    //处理内容
                    let content = '';
                    content += '<tr id="tr_' + grid.option.id + '_' + grid.sequenceSort + '">';
                    content += '	<td id="seqTd_' + grid.option.id + '_' + grid.sequenceSort + '"></td>';
                    content += '	<td>';
                    content += '		<button type="button" id="moveUpSortTr_' + grid.option.id + '_' + grid.sequenceSort + '" class="btn btn-primary btn-xs" title="' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.sort.table.buttons.upTitle + '">' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.sort.table.buttons.up + '</button>';
                    content += '		<button type="button" id="moveDownSortTr_' + grid.option.id + '_' + grid.sequenceSort + '" class="btn btn-primary btn-xs" title="' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.sort.table.buttons.downTitle + '">' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.sort.table.buttons.down + '</button>';
                    content += '		<button type="button" id="deleteSortTr_' + grid.option.id + '_' + grid.sequenceSort + '" class="btn btn-danger btn-xs" title="' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.sort.table.buttons.deleteTitle + '">' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.sort.table.buttons['delete'] + '</button>';
                    content += '	</td>';
                    content += '	<td>';
                    content += '		<select id="sortField_' + grid.option.id + '_' + grid.sequenceSort + '" name="sortField_' + grid.option.id + '_' + grid.sequenceSort + '" class="form-control">';
                    content += '			<option value=""></option>';
                    for (let i = 0; i < grid.option.columns.length; i++) {
                        let column = grid.option.columns[i];
                        if (column.advanceQuery !== false) {
                            content += '	<option value="' + column.id + '">' + column.title + '</option>';
                        }
                    }
                    content += '		</select>';
                    content += '	</td>';
                    content += '	<td>';
                    content += '		<select id="sortLogic_' + grid.option.id + '_' + grid.sequenceSort + '" name="sortLogic_' + grid.option.id + '_' + grid.sequenceSort + '" class="form-control">';
                    content += '			<option value=""></option>';
                    content += '			<option value="0">' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.sort.logic.asc + '</option>';
                    content += '			<option value="1">' + $.fn.dtGrid.lang[grid.option.lang].advanceQuery.sort.logic.desc + '</option>';
                    content += '		</select>';
                    content += '	</td>';
                    content += '</tr>';
                    $('#sortTable_' + grid.option.id).append(content);
                    //绑定方法-上移
                    $('#moveUpSortTr_' + grid.option.id + '_' + grid.sequenceSort).click(function () {
                        let sequenceSort = this.id.split('_')[2];
                        grid.moveUpSortTr(sequenceSort);
                    });
                    //绑定方法-下移
                    $('#moveDownSortTr_' + grid.option.id + '_' + grid.sequenceSort).click(function () {
                        let sequenceSort = this.id.split('_')[2];
                        grid.moveDownSortTr(sequenceSort);
                    });
                    //绑定方法-删除
                    $('#deleteSortTr_' + grid.option.id + '_' + grid.sequenceSort).click(function () {
                        let sequenceSort = this.id.split('_')[2];
                        grid.deleteSortTr(sequenceSort);
                    });
                    grid.sequenceSort++;
                    grid.resetSortSeq();
                },
                //清除所有排序条件
                clearSortTr: function () {
                    //定义表格对象映像
                    let grid = this;
                    $('#sortTable_' + grid.option.id + ' tr[id*=tr_' + grid.option.id + '_]').remove();
                },
                //序列号重置
                resetSortSeq: function () {
                    //定义表格对象映像
                    let grid = this;
                    let seq = 1;
                    $('#sortTable_' + grid.option.id + ' tr[id*=tr_' + grid.option.id + '_]').each(function () {
                        let id = this.id.split('_')[2];
                        $('#sortTable_' + grid.option.id + ' #seqTd_' + grid.option.id + '_' + id).html(seq);
                        seq++;
                    });
                },
                //上移
                moveUpSortTr: function (id) {
                    //定义表格对象映像
                    let grid = this;
                    $(`#sortTable_${grid.option.id}`).find(`#tr_${grid.option.id}_${id}`).prev('#sortTable_' + grid.option.id + ' tr[id*=tr_' + grid.option.id + '_]').before($('#sortTable_' + grid.option.id + ' #tr_' + grid.option.id + '_' + id));
                    grid.resetSortSeq();
                },
                //下移
                moveDownSortTr: function (id) {
                    //定义表格对象映像
                    let grid = this;
                    $(`#sortTable_${grid.option.id}`).find(`#tr_${grid.option.id}_${id}`).next('#sortTable_' + grid.option.id + ' tr[id*=tr_' + grid.option.id + '_]').after($('#sortTable_' + grid.option.id + ' #tr_' + grid.option.id + '_' + id));
                    grid.resetSortSeq();
                },
                //删除当前行
                deleteSortTr: function (id) {
                    //定义表格对象映像
                    let grid = this;
                    $('#sortTable_' + grid.option.id + ' #tr_' + grid.option.id + '_' + id).remove();
                    grid.resetSortSeq();
                },
                /**
                 * 打印相关
                 */
                //打印
                print: function () {
                    //映射参数
                    let grid = this;
                    //如果已经初始化，则调用显示
                    if (grid.init.printWindowIsInit) {
                        $('#grid_print_' + grid.option.id + '_modal').modal('show');
                        return;
                    }
                    //放置新的打印选项
                    let content = '';
                    content += $.fn.dtGrid.tools.getWindowStart('grid_print_' + grid.option.id, $.fn.dtGrid.lang[grid.option.lang].print.title);
                    content += '				<table class="table table-bordered table-print">';
                    content += '					<thead>';
                    content += '						<tr>';
                    content += '							<th><input type="checkbox" id="grid_print_check_' + grid.option.id + '" checked="checked" /></th>';
                    content += '							<th>' + $.fn.dtGrid.lang[grid.option.lang].print.table.column + '</th>';
                    content += '							<th>' + $.fn.dtGrid.lang[grid.option.lang].print.table.operation + '</th>';
                    content += '						</tr>';
                    content += '					</thead>';
                    content += '					<tbody>';
                    //遍历列信息
                    for (let i = 0; i < grid.option.columns.length; i++) {
                        let column = grid.option.columns[i];
                        if (column.print === false) {
                            continue;
                        }
                        //获取记录号
                        content += '					<tr id="grid_print_tr_' + grid.option.id + '_' + i + '">';
                        content += '						<td><input type="checkbox" id="grid_print_check_' + grid.option.id + '_' + i + '" checked="checked" value="' + i + '" /></td>';
                        content += '						<td>' + column.title + '</td>';
                        content += '						<td>';
                        content += '							<button type="button" class="btn btn-primary btn-xs" dataId="' + i + '" id="grid_print_up_' + grid.option.id + '_' + i + '" title="' + $.fn.dtGrid.lang[grid.option.lang].print.table.buttons.upTitle + '">' + $.fn.dtGrid.lang[grid.option.lang].print.table.buttons.up + '</button>';
                        content += '							<button type="button" class="btn btn-primary btn-xs" dataId="' + i + '" id="grid_print_down_' + grid.option.id + '_' + i + '" title="' + $.fn.dtGrid.lang[grid.option.lang].print.table.buttons.downTitle + '">' + $.fn.dtGrid.lang[grid.option.lang].print.table.buttons.down + '</button>';
                        content += '						</td>';
                        content += '					</tr>';
                    }
                    content += '					</tbody>';
                    content += '				</table>';
                    let buttons = '';
                    buttons += '<button type="button" class="btn btn-primary" id="grid_print_execute_' + grid.option.id + '">';
                    buttons += '	' + $.fn.dtGrid.lang[grid.option.lang].print.buttons.print;
                    buttons += '</button>';
                    content += $.fn.dtGrid.tools.getWindowEnd($.fn.dtGrid.lang[grid.option.lang].buttons.close, buttons);
                    $('body').append(content);
                    //绑定复选全选反选方法
                    $('#grid_print_check_' + grid.option.id).click(function () {
                        $('input[id*=grid_print_check_' + grid.option.id + '_]').prop('checked', this.checked);
                    });
                    //绑定上移方法
                    $('button[id*=grid_print_up_' + grid.option.id + '_]').click(function () {
                        let dataId = $(this).attr('dataId');
                        let gridId = grid.option.id;
                        $(`#grid_print_tr_${gridId}_${dataId}`).prev('#grid_print_' + gridId + '_modal tr[id*=grid_print_tr_' + gridId + ']').before($('#grid_print_tr_' + gridId + '_' + dataId));
                    });
                    //绑定下移方法
                    $('button[id*=grid_print_down_' + grid.option.id + '_]').click(function () {
                        let dataId = $(this).attr('dataId');
                        let gridId = grid.option.id;
                        $(`#grid_print_tr_${gridId}_${dataId}`).next('#grid_print_' + gridId + '_modal tr[id*=grid_print_tr_' + gridId + ']').after($('#grid_print_tr_' + gridId + '_' + dataId));
                    });
                    //绑定打印方法
                    $('#grid_print_execute_' + grid.option.id).click(function () {
                        //画表格
                        let content = '';
                        content += '<table class="grid ' + grid.option.tableClass + '" id="grid_print_' + grid.option.id + '" style="' + grid.option.tableStyle + '">';
                        if (grid.option.showHeader !== false) {
                            content += '<thead>';
                            content += '	<tr>';
                            $('input[id*=grid_print_check_' + grid.option.id + '_]:checked').each(function () {
                                let columnNo = this.value;
                                content += '<th class="' + grid.option.columns[columnNo].headerClass + '" style="' + grid.option.columns[columnNo].headerStyle + '">' + grid.option.columns[columnNo].title + '</th>';
                            });
                            content += '	</tr>';
                            content += '</thead>';
                        }
                        //构建表格
                        content += '	<tbody>';
                        if (grid.exhibitData !== null) {
                            for (let i = 0; i < grid.exhibitData.length; i++) {
                                content += '	<tr>';
                                $('input[id*=grid_print_check_' + grid.option.id + '_]:checked').each(function () {
                                    let columnNo = this.value;
                                    content += '	<td class="' + grid.option.columns[columnNo].columnClass + '" style="' + grid.option.columns[columnNo].columnStyle + '">';
                                    if (grid.option.columns[columnNo].resolution) {
                                        content += grid.option.columns[columnNo].resolution(grid.exhibitData[i][grid.option.columns[columnNo].id], grid.exhibitData[i], grid.option.columns[columnNo], grid, i, columnNo);
                                    } else {
                                        content += grid.formatContent(grid.option.columns[columnNo], grid.exhibitData[i][grid.option.columns[columnNo].id]);
                                    }
                                    content += '	</td>';
                                });
                                content += '	</tr>';
                            }
                        }
                        content += '	</tbody>';
                        content += '</table>';
                        //隐藏body，放置打印对象
                        let scrollTop;
                        let body = $('body');
                        scrollTop = body.scrollTop();
                        body.hide();
                        $('html').append(content);
                        window.print();
                        $('#grid_print_' + grid.option.id).remove();
                        body.show();
                        $('#grid_print_' + grid.option.id + '_modal').modal('hide');
                        body.scrollTop(scrollTop);
                    });
                    //显示打印选项
                    $(`#grid_print_${grid.option.id}_modal`).modal('show');
                    //标识初始化完成
                    grid.init.printWindowIsInit = true;
                },
                /**
                 * 导出相关
                 */
                //导出
                exportFile: function (exportType) {
                    //映射参数
                    let grid = this;
                    //如果已经初始化，则显示导出选项
                    if (grid.init.exportWindowIsInit[exportType]) {
                        //显示导出选项
                        $('#grid_export_' + exportType + '_' + grid.option.id + '_modal').modal('show');
                        return;
                    }
                    //放置新的导出选项
                    let content = '';
                    content += $.fn.dtGrid.tools.getWindowStart('grid_export_' + exportType + '_' + grid.option.id, $.fn.dtGrid.lang[grid.option.lang]['export'][exportType].title);
                    content += '				<div class="form-export modal-body form-horizontal form-export">';
                    content += '					<div class="form-group">';
                    content += '						<label class="col-sm-3 control-label">' + $.fn.dtGrid.lang[grid.option.lang]['export'][exportType].exportType.title + '</label>';
                    content += '						<div class="col-sm-9">';
                    content += '							<div class="checkbox">';
                    content += '								<label><input type="radio" name="grid_export_export_all_data_' + exportType + '_' + grid.option.id + '" value="0" checked="checked" /> ' + $.fn.dtGrid.lang[grid.option.lang]['export'][exportType].exportType.now + '</label>';
                    content += '								<label><input type="radio" name="grid_export_export_all_data_' + exportType + '_' + grid.option.id + '" value="1" /> ' + $.fn.dtGrid.lang[grid.option.lang]['export'][exportType].exportType.all + '</label>';
                    content += '							</div>';
                    content += '						</div>';
                    content += '					</div>';
                    content += '				</div>';
                    content += '				<table class="table table-bordered table-export">';
                    content += '					<thead>';
                    content += '						<tr>';
                    content += '							<th><input type="checkbox" id="grid_export_check_' + exportType + '_' + grid.option.id + '" checked="checked" /></th>';
                    content += '							<th>' + $.fn.dtGrid.lang[grid.option.lang]['export'][exportType].table.column + '</th>';
                    content += '							<th>' + $.fn.dtGrid.lang[grid.option.lang]['export'][exportType].table.operation + '</th>';
                    content += '						</tr>';
                    content += '					</thead>';
                    content += '					<tbody>';
                    //遍历列信息
                    for (let i = 0; i < grid.option.columns.length; i++) {
                        let column = grid.option.columns[i];
                        if (column['export'] === false) {
                            continue;
                        }
                        content += '					<tr id="grid_export_tr_' + exportType + '_' + grid.option.id + '_' + i + '">';
                        content += '						<td><input type="checkbox" id="grid_export_check_' + exportType + '_' + grid.option.id + '_' + i + '" checked="checked" value="' + i + '" /></td>';
                        content += '						<td>' + column.title + '</td>';
                        content += '						<td>';
                        content += '							<button type="button" class="btn btn-primary btn-xs" dataId="' + i + '" id="grid_export_up_' + exportType + '_' + grid.option.id + '_' + i + '" title="' + $.fn.dtGrid.lang[grid.option.lang]['export'][exportType].table.buttons.upTitle + '">' + $.fn.dtGrid.lang[grid.option.lang]['export'][exportType].table.buttons.up + '</button>';
                        content += '							<button type="button" class="btn btn-primary btn-xs" dataId="' + i + '" id="grid_export_down_' + exportType + '_' + grid.option.id + '_' + i + '" title="' + $.fn.dtGrid.lang[grid.option.lang]['export'][exportType].table.buttons.downTitle + '">' + $.fn.dtGrid.lang[grid.option.lang]['export'][exportType].table.buttons.down + '</button>';
                        content += '						</td>';
                        content += '					</tr>';
                    }
                    content += '					</tbody>';
                    content += '				</table>';
                    let buttons = '';
                    buttons += '<button type="button" class="btn btn-primary" id="grid_export_execute_' + exportType + '_' + grid.option.id + '">';
                    buttons += '	' + $.fn.dtGrid.lang[grid.option.lang]['export'][exportType].buttons['export'];
                    buttons += '</button>';
                    content += $.fn.dtGrid.tools.getWindowEnd($.fn.dtGrid.lang[grid.option.lang].buttons.close, buttons);
                    $('body').append(content);
                    //绑定复选方法
                    $('#grid_export_check_' + exportType + '_' + grid.option.id).click(function () {
                        $('input[id*=grid_export_check_' + exportType + '_' + grid.option.id + '_]').prop('checked', this.checked);
                    });
                    //绑定上移方法
                    $('button[id*=grid_export_up_' + exportType + '_' + grid.option.id + '_]').click(function () {
                        let dataId = $(this).attr('dataId');
                        let gridId = grid.option.id;
                        $(`#grid_export_tr_${exportType}_${gridId}_${dataId}`).prev('#grid_export_' + exportType + '_' + gridId + '_modal tr[id*=grid_export_tr_' + exportType + '_' + gridId + ']').before($('#grid_export_tr_' + exportType + '_' + gridId + '_' + dataId));
                    });
                    //绑定下移方法
                    $('button[id*=grid_export_down_' + exportType + '_' + grid.option.id + '_]').click(function () {
                        let dataId = $(this).attr('dataId');
                        let gridId = grid.option.id;
                        $(`#grid_export_tr_${exportType}_${gridId}_${dataId}`).next('#grid_export_' + exportType + '_' + gridId + '_modal tr[id*=grid_export_tr_' + exportType + '_' + gridId + ']').after($('#grid_export_tr_' + exportType + '_' + gridId + '_' + dataId));
                    });
                    //绑定导出方法
                    $('#grid_export_execute_' + exportType + '_' + grid.option.id).click(function () {
                        //删除原表单
                        $('#grid_export_form_container_' + exportType + '_' + grid.option.id).remove();
                        //将参数传递后台使用伪表单进行导出
                        let exportFormContainer = document.createElement('div');
                        exportFormContainer.id = 'grid_export_form_container_' + exportType + '_' + grid.option.id;
                        exportFormContainer.className = 'hidden';
                        let exportIframe = document.createElement('iframe');
                        exportIframe.name = 'grid_export_iframe_' + exportType + '_' + grid.option.id;
                        exportFormContainer.appendChild(exportIframe);
                        let exportForm = document.createElement('form');
                        exportForm.id = 'grid_export_form_' + exportType + '_' + grid.option.id;
                        exportForm.method = 'post';
                        exportForm.target = 'grid_export_iframe_' + exportType + '_' + grid.option.id;
                        if (grid.option.ajaxLoad === false || grid.option.loadAll === true) {
                            exportForm.action = grid.option.exportURL;
                        } else {
                            exportForm.action = grid.option.loadURL;
                        }
                        let gridPager = {};
                        gridPager.pageSize = grid.pager.pageSize;
                        gridPager.startRecord = grid.pager.startRecord;
                        gridPager.nowPage = grid.pager.nowPage;
                        gridPager.recordCount = grid.pager.recordCount;
                        gridPager.pageCount = grid.pager.pageCount;
                        gridPager.isExport = true;
                        gridPager.exportFileName = grid.option.exportFileName;
                        gridPager.exportType = exportType;
                        gridPager.exportAllData = $('input[name*=grid_export_export_all_data_' + exportType + '_' + grid.option.id + ']:checked').val() === '1';
                        gridPager.parameters = {};
                        gridPager.fastQueryParameters = {};
                        gridPager.advanceQueryConditions = [];
                        gridPager.advanceQuerySorts = [];
                        if (grid.parameters) {
                            gridPager.parameters = grid.parameters;
                        }
                        if (grid.fastQueryParameters) {
                            gridPager.fastQueryParameters = grid.fastQueryParameters;
                        }
                        if (grid.advanceQuery && grid.advanceQuery.advanceQueryConditions) {
                            gridPager.advanceQueryConditions = grid.advanceQuery.advanceQueryConditions;
                        }
                        if (grid.advanceQuery && grid.advanceQuery.advanceQuerySorts) {
                            gridPager.advanceQuerySorts = grid.advanceQuery.advanceQuerySorts;
                        }
                        let exportColumns = [];
                        $(`input[id*=grid_export_check_${exportType}_${grid.option.id}_]:checked`).each(function () {
                            exportColumns.push(grid.option.columns[this.value]);
                        });
                        gridPager.exportColumns = exportColumns;
                        //获取原生数据
                        let originalData = [];
                        let exportDataIsProcessed = false;
                        if (!gridPager.exportAllData) {
                            originalData = grid.exhibitData;
                            exportDataIsProcessed = true;
                        } else {
                            if (grid.option.ajaxLoad === false || grid.option.loadAll === true) {
                                originalData = grid.originalData;
                                exportDataIsProcessed = true;
                            }
                        }
                        gridPager.exportDataIsProcessed = exportDataIsProcessed;
                        //拼接导出数据
                        let exportData = [];
                        for (let i = 0; i < originalData.length; i++) {
                            let data = originalData[i];
                            let exportData = {};
                            $('input[id*=grid_export_check_' + exportType + '_' + grid.option.id + '_]:checked').each(function () {
                                let column = grid.option.columns[this.value];
                                let fieldContent;
                                fieldContent = grid.formatContent(column, data[column.id]);
                                exportData[column.id] = fieldContent;
                            });
                            exportData.push(exportData);
                        }
                        gridPager.exportData = exportData;
                        let gridPagerInput = document.createElement('input');
                        gridPagerInput.type = 'hidden';
                        gridPagerInput.id = 'gridPager';
                        gridPagerInput.name = 'gridPager';
                        gridPagerInput.value = JSON.stringify(gridPager);
                        exportForm.appendChild(gridPagerInput);
                        exportFormContainer.appendChild(exportForm);
                        $('body').append(exportFormContainer);
                        $('#grid_export_form_' + exportType + '_' + grid.option.id).submit();
                        $('#grid_export_' + exportType + '_' + grid.option.id + '_modal').modal('hide');
                    });
                    //设置初始化完成
                    grid.init.exportWindowIsInit[exportType] = true;
                    //显示导出选项
                    $(`#grid_export_${exportType}_${grid.option.id}_modal`).modal('show');
                },
                /**
                 * 对外开放工具方法
                 */
                //获取选中内容
                getCheckedRecords: function () {
                    //设置本体映射
                    let grid = this;
                    //获取数据
                    let records = [];
                    $('input[id*=grid_' + grid.option.id + '_check_]:checked').each(function () {
                        records.push(grid.exhibitData[this.value]);
                    });
                    return records;
                },
                //重新加载，true为重新从数据库中获取数据
                reload: function (allReload) {
                    //定义表格对象映像
                    let grid = this;
                    if (allReload) {
                        grid.load();
                    } else {
                        //重新加载数据
                        grid.constructGrid();
                        grid.constructGridPageBar();
                    }
                },
                //重新加载重载方法
                refresh: function (allReload) {
                    //定义表格对象映像
                    let grid = this;
                    grid.reload(allReload);
                }
            };
            return gridObject;
        },
        //工具方法
        tools: {
            //生成guid
            guid: function () {
                return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            },
            //创建一个模态窗口（开始）
            getWindowStart: function (id, title) {
                let content = '';
                content += '<div class="modal fade" id="' + id + '_modal" tabindex="-1" role="dialog" aria-labelledby="' + id + 'ModalLabel" aria-hidden="true">';
                content += '	<div class="modal-dialog">';
                content += '		<div class="modal-content">';
                content += '			<div class="modal-header">';
                content += '				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
                content += '				<h4 class="modal-title" id="' + id + 'ModalLabel">' + title + '</h4>';
                content += '			</div>';
                return content;
            },
            //创建一个模态窗口（结束）
            getWindowEnd: function (closeButtonTitle, buttons) {
                let content = '';
                content += '			<div class="modal-footer">';
                content += '				<button type="button" class="btn btn-default" data-dismiss="modal">';
                content += '					' + closeButtonTitle;
                content += '				</button>';
                content += '				' + buttons;
                content += '			</div>';
                content += '		</div>';
                content += '	</div>';
                content += '</div>';
                return content;
            },
            /**
             * 提示框
             */
            toastZIndex: 1090,
            toastThread: null,
            toastFadeInAnimateTime: 500,
            toastFadeOutAnimateTime: 500,
            openToast: function (content, level, time) {
                // default level、time
                level = level ? level : 'info';
                time = time ? time : 3000;
                // get the level class
                let levelClass = '';
                if (level === 'info') levelClass = 'text-primary';
                if (level === 'warning') levelClass = 'text-warning';
                if (level === 'error') levelClass = 'text-danger';
                if (level === 'success') levelClass = 'text-success';
                // close other toast div
                clearTimeout($.fn.dtGrid.tools.toastThread);
                $('.toast').remove();
                // constructs the html content
                let toastContent = '<div class="toast ' + levelClass + '" style="z-index:' + $.fn.dtGrid.tools.toastZIndex + '">' + content + '</div>';
                // append to the ducoment
                $('body').append(toastContent);
                // set the offset
                let x = $(window).width() / 2 - $('.toast').width() / 2 - 20;
                //toast(x);
                $('.toast').css("left", x);
                // show the div
                $('.toast').fadeIn($.fn.dtGrid.tools.toastFadeInAnimateTime, function () {
                    // callback close
                    if (time) {
                        $.fn.dtGrid.tools.toastThread = setTimeout($.fn.dtGrid.tools.removeToast, time);
                    }
                });
            },
            //close an toast
            removeToast: function () {
                $('.toast').fadeOut($.fn.dtGrid.tools.toastFadeOutAnimateTime, function () {
                    $('.toast').remove();
                });
            },
            //整理Toast方法
            toast: function (content, level, time) {
                $.fn.dtGrid.tools.openToast(content, level, time);
            },
            //将字符串转换成日期时间，有默认格式
            toDate: function (date, pattern) {
                if (!pattern || pattern === null)
                    pattern = 'yyyy-MM-dd hh:mm:ss';
                let compare = {
                    'y+': 'y',
                    'M+': 'M',
                    'd+': 'd',
                    'h+': 'h',
                    'm+': 'm',
                    's+': 's'
                };
                let result = {
                    'y': '',
                    'M': '',
                    'd': '',
                    'h': '00',
                    'm': '00',
                    's': '00'
                };
                let tmp = pattern;
                for (let k in compare) {
                    if (new RegExp('(' + k + ')').test(pattern)) {
                        result[compare[k]] = date.substring(tmp.indexOf(RegExp.$1), tmp.indexOf(RegExp.$1) + RegExp.$1.length);
                    }
                }
                return new Date(result['y'], result['M'] - 1, result['d'], result['h'], result['m'], result['s']);
            },
            // 格式化时间
            dateFormat: function (value, format) {
                if (value === '') {
                    return '';
                }
                if (value.time) {
                    value = new Date(value.time);
                }
                let o;
                o = {
                    "M+": value.getMonth() + 1, //month
                    "d+": value.getDate(),    //day
                    "h+": value.getHours(),   //hour
                    "m+": value.getMinutes(), //minute
                    "s+": value.getSeconds(), //second
                    "q+": Math.floor((value.getMonth() + 3) / 3), //quarter
                    "S": value.getMilliseconds() //millisecond
                };
                if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (value.getFullYear() + "").substr(4 - RegExp.$1.length));
                for (let k in o)if (new RegExp("(" + k + ")").test(format)) { //noinspection JSUnfilteredForInLoop
                    format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
                }
                return format;
            },
            //字符串全局替换
            replaceAll: function (s, s1, s2) {
                return s.replace(new RegExp(s1, "gm"), s2);
            },
            //判断字符串开始内容
            startsWith: function (str, prefix) {
                if (prefix === undefined)
                    return false;
                return str.indexOf(prefix) === 0;

            },
            //判断字符串结束内容
            endsWith: function (str, suffix) {
                if (suffix === undefined)
                    return false;
                return str.lastIndexOf(suffix) === str.length - suffix.length;

            },
            //字符串不区分大小写的比较
            equalsIgnoreCase: function (str1, str2) {
                return (String(str1.toLowerCase()) === (String(str2)).toLowerCase());
            },
            //数字格式化函数[#,0格式]
            numberFormat: function (number, pattern) {
                let negFlag = "false";
                let str = Number(number).toString();
                if (str.indexOf("-") === 0) {
                    negFlag = "true";
                    str = str.replace("-", "");
                    number = -number;
                }
                let strInt;
                let strFloat;
                let formatInt;
                let formatFloat;
                if ($.trim(str) === "")
                    return "";
                //判断模式串是否有小数格式
                if (/\./g.test(pattern)) {
                    formatInt = pattern.split('.')[0];
                    formatFloat = pattern.split('.')[1];
                } else {
                    formatInt = pattern;
                    formatFloat = null;
                }
                if (/\./g.test(str)) {
                    //如果字符串有小数
                    if (formatFloat !== null) {
                        let tempFloat = Math.round(parseFloat('0.' + str.split('.')[1]) * Math.pow(10, formatFloat.length)) / Math.pow(10, formatFloat.length);
                        strInt = (Math.floor(number) + Math.floor(tempFloat)).toString();
                        strFloat = /\./g.test(tempFloat.toString()) ? tempFloat.toString().split('.')[1] : '0';
                    } else {
                        strInt = Math.round(number).toString();
                        strFloat = '0';
                    }
                } else {
                    strInt = str;
                    strFloat = '0';
                }
                //处理整数数位的格式化
                if (formatInt !== null) {
                    let outputInt = '';
                    let zero = formatInt.match(/0*$/)[0].length;
                    let comma = null;
                    if (/,/g.test(formatInt)) {
                        comma = formatInt.match(/,[^,]*/)[0].length - 1;
                    }
                    let newReg = new RegExp('(\\d{' + comma + '})', 'g');
                    if (strInt.length < zero) {
                        outputInt = new Array(zero + 1).join('0') + strInt;
                        outputInt = outputInt.substr(outputInt.length - zero, zero);
                    } else {
                        outputInt = strInt;
                    }
                    outputInt = outputInt.substr(0, outputInt.length % comma) + outputInt.substring(outputInt.length % comma).replace(newReg, (comma !== null ? ',' : '') + '$1');
                    outputInt = outputInt.replace(/^,/, '');
                    strInt = outputInt;
                }
                //处理小数位的格式化
                if (formatFloat !== null) {
                    let outputFloat = '';
                    let zero = formatFloat.match(/^0*/)[0].length;
                    if (strFloat.length < zero) {
                        outputFloat = strFloat + new Array(zero + 1).join('0');
                        let outputFloat1 = outputFloat.substring(0, zero);
                        let outputFloat2 = outputFloat.substring(zero, formatFloat.length);
                        outputFloat = outputFloat1 + outputFloat2.replace(/0*$/, '');
                    } else {
                        //如果小数是0，而且模式串的小数格式中也不包含0，则只保留整数部分。
                        if (strFloat === 0 && zero === 0)
                            outputFloat = '';
                        else
                            outputFloat = strFloat.substring(0, formatFloat.length);
                    }
                    strFloat = outputFloat;
                } else {
                    if (pattern !== '' || (pattern === '' && strFloat === '0'))
                        strFloat = '';
                }
                if (negFlag === "true")
                    return "-" + strInt + (strFloat === '' ? '' : '.' + strFloat);
                else
                    return strInt + (strFloat === '' ? '' : '.' + strFloat);
            }
        }
    };
})(jQuery);

//默认属性
(function ($) {
    $.fn.dtGrid.defaultOptions = {
        grid: {
            lang: 'zh-cn',
            ajaxLoad: true,
            loadAll: false,
            loadURL: '',
            datas: null,
            isTreeGrid: false,
            extraWidth: null,
            check: false,
            checkWidth: null,
            exportFileName: 'datas',
            tableStyle: '',
            tableClass: 'table table-hover table-responsive',
            showHeader: true,
            gridContainer: 'gridContainer',
            toolbarContainer: 'gridToolBarContainer',
            tools: 'refresh|fastQuery|advanceQuery|export[excel,csv,pdf,txt]|print',
            exportURL: '/grid/export',
            pageSize: 20,
            pageSizeLimit: [20, 50, 100]
        },
        column: {
            id: 'field',
            title: 'field',
            width: null,
            type: 'string',
            format: null,
            otype: null,
            oformat: null,
            columnStyle: '',
            columnClass: '',
            headerStyle: '',
            headerClass: '',
            hide: false,
            hideType: '',
            extra: true,
            codeTable: null,
            fastQuery: false,
            fastQueryType: '',
            advanceQuery: true,
            'export': true,
            print: true,
            resolution: null
        }
    };
})(jQuery);