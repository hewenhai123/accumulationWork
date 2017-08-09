/**
 * Created by User on 2017/7/27.
 */
    //商品导入--wenhai

var commodity_import = {
        ajaxUrl: "",//ajaxUrl
        upFileBtn: "",//上传按钮
        prompt_box: "",//信息提示框、可显示进度条等信息
        table_data: "",//报错时table
        file_module: "",//隐藏的上传文件
        progressWidth: "",//进度条span的宽度
        progressBoxWidth: "",//进度条父级盒子的宽度用于模拟进度条，计算百分比
        report_title: "",// 错误报告标题
        report_message: "",//错误报告盒子
        report_data: "",// 错误报告table
        nav_fixedList: "",// 浮动导航
        init: function () {
            var that = this;
            this.upFileBtn = $(".up_file_btn");
            this.prompt_box = $(".prompt");
            this.table_data = $(".table_data");
            this.file_import_fixed_title = $(".file_import .nav_fixed");
            this.report_message = $(".report_message");
            this.report_data = $(".report_data");
            this.report_title = $(".error_report");
            this.nav_fixedList = $(".nav_fixed");
            this.file_module = $(".file_module");
            this.ajaxUrl = this.file_module.attr("data_url");
            this.bindEvent(that, "click", [that.upFileBtn, that.prompt_box], "upFile");
            this.fileModuleChange(that);
        },
        bindEvent: function (that, event, bindList, state) {//绑定事件方法
            for (var i = 0; i < bindList.length; i++) {
                bindList[i].on(event, function (e) {
                    if (state == "upFile") {
                        that.file_module.click();
                    }
                    if (state == "checkReport") {
                        that.report_title.fadeIn();
                        that.report_message.fadeIn();
                        that.upFileState("uploadAgain");
                    }
                    if (state == "uploadAgain") {
                        that.reload();
                    }
                    if (state == "save") {

                    }
                })
            }
        },
        reload: function () { //重载页面
            window.location.reload();
        },
        fileModuleChange: function (that) {//input模块数据变化时执行的代码
            this.file_module.change(function () {
                var fileName = this.files[0];
                if (that.fileType(fileName)) {
                    that.prompt_box.html('<p>' + setLanguage("click_upload_file") + '</br>' + fileName["name"] + '</p>');//点击上传文件
                    that.upFileAjax(fileName, that);
                } else {
                    that.prompt_box.html('<p  class="file_type_error">' + setLanguage("click_upload_file") + '</br>' + fileName["name"] + '</br><i>' + setLanguage("file_selection_error") + '</p>');//点击上传文件\文件类型选择错误，请重新选择
                }
            })
        },
        fileType: function (fileName) {
            var fileTypeState = false;
            var filetypes = [".xls", ".xlsx"], curFileType = "";
            if (fileName) {
                fileName = fileName.name;
                curFileType = fileName.substring(fileName.indexOf("."));
                for (var i = 0, fileLength = filetypes.length; i < fileLength; i++) {
                    if (filetypes[i] == curFileType) {
                        return fileTypeState = true
                    }
                }
            }
            return fileTypeState
        },
        upFileAjax: function (fileName, that) { //上传文件的ajax
            var formEle = $("#up_file_form")[0];
            var form = new FormData(formEle);
            that.removeBindEvent([that.prompt_box, that.upFileBtn], "click");
            that.prompt_box.removeClass("box_hover");
            that.progressSet(that);
            $.ajax({
                url: that.ajaxUrl,
                type: "post",
                data: form,
                dataType: "json",
                processData: false,
                contentType: false,
                success: function (res) {
                    window.setTimeout(function () {
                        window.clearInterval(timer);
                        that.progressWidth.css("width", 100 + "%");
                        that.progressWidth[0].addEventListener("webkitTransitionEnd", function () {
                            that.upFileSuccess(that, res);
                        });
                        that.progressWidth[0].addEventListener("transitionend", function () {
                            that.upFileSuccess(that, res);
                        })
                    }, 1000)
                },
                error: function (err) {
                    that.upFileState("uploadAgain");
                    //     数据有误请重新上传/页面即将刷新/您可以点击左下方继续上传文件
                    that.prompt_box.html('<p>' + setLanguage("upload_again_error_message") + '</br></br>' + setLanguage("page_will_refresh") + '<i class="countdown">8</i></br>' + setLanguage("upload_files_bottom") + '</p>');
                    that.countdown(8)
                }
            });
        },
        upFileSuccess: function (that, res) { //上传成功后的状态处理  报错/成功
            var total = res.total;
            if (res.queryList[0].errInfo.length > 0) {
                that.prompt_box.css("display", "none");
                that.table_data.css("display", "block");
                that.upFileState("report");
                that.bindEvent(that, "click", [that.upFileBtn], "checkReport");
                that.dataBinding(res);
            } else {
                that.upFileState("continueToUpload");
                //     数据上传成功 / 共上传成功：/页面即将刷新/您可以点击左下方继续上传文件
                that.prompt_box.html('<p>' + setLanguage("data_upload_success") + '</br>' + setLanguage("total_upload_success") + '<span class="success_total">' + total + '</span></br>' + setLanguage("page_will_refresh") + '<i class="countdown">5</i></br>' + setLanguage("upload_files_bottom") + '</p>');
                that.countdown(5)
            }
        },
        removeBindEvent: function (optionsList, event) {//删除绑定事件
            for (var i = 0; i < optionsList.length; i++) {
                optionsList[i].off(event)
            }
        },
        progressSet: function (that) {//进度条宽度设置
            var proHtml = that.prompt_box.html();
            that.prompt_box.append("<div><i class='loading_text'>loading...</i></div><div class='progress'><span></span></div>");
            that.progressBoxWidth = $(".progress").width();
            that.progressWidth = $(".progress span");
            window.timer = setInterval(function () {
                var curProgressWidth = that.progressWidth.width() / that.progressBoxWidth * 100 + that.random(5);
                that.progressWidth.css("width", curProgressWidth + "%");
                if (curProgressWidth > 70) {
                    window.clearInterval(timer);
                }
            }, 1500)
        },
        random: function (n) {//获取随机数
            return Math.round(Math.random() * n);
        },
        dataBinding: function (res) {//数据绑定 报错数据table + 错误报告行数
            var dataList = res.queryList, dataStr = "<tr>", reportStr = "", warTd = "";
            for (var i = 0, curLength = dataList.length; i < curLength; i++) {
                for (var x = 0, curDataLength = dataList[i].data.length; x < curDataLength; x++) {
                    for (var y = 0; y < dataList[i].index.length; y++) {
                        if (x + 1 == dataList[i].index[y]) {
                            warTd = "<td class='war'>";
                            break;
                        } else {
                            warTd = "<td>";
                        }
                    }
                    dataStr += warTd + dataList[i].data[x] + "</td>";
                }
                dataStr += "</tr>";
                reportStr += "<tr><td>" + setLanguage("excel_row") + "：" + dataList[i].line + "</td><td>" + dataList[i].errInfo.join("</td><td>") + "</td></tr>";//excel对应行：

            }
            this.table_data.find("tbody").html(dataStr);
            this.report_message.find("tbody").html(reportStr);
            this.navFixed();
        },
        upFileState: function (state) {//上传状态切换
            if (state == "upFile") {
                this.upFileBtn.text(setLanguage("click_upload_file"));//点击上传文件
            }
            if (state == "report") {
                this.upFileBtn.text(setLanguage("view_error_report"));//点击查看错误报告
            }
            if (state == "uploadAgain") {
                this.upFileBtn.text(setLanguage("new_upload_file"));//重新上传文件
                this.removeBindEvent([this.upFileBtn], "click");
                this.bindEvent(this, "click", [this.upFileBtn, this.prompt_box], "uploadAgain");
            }
            if (state == "continueToUpload") {
                this.upFileBtn.text(setLanguage("upload_file_please"));//继续上传文件
                this.removeBindEvent([this.upFileBtn], "click");
                this.bindEvent(this, "click", [this.upFileBtn, this.prompt_box], "uploadAgain");
            }
        },
        navFixed: function () { //浮动导航
            var navEleList = [this.table_data, this.report_data], that = this;
            for (var y = 0; y < that.nav_fixedList.length; y++) {
                var curNav = that.nav_fixedList[y];
                var liListStr = "";
                $(curNav).next(".jumbotron").find("thead th").each(function (index, ele) {
                    var curEleWidth = ele.clientWidth;
                    liListStr += "<li style='width:" + curEleWidth + "px'>" + $(ele).text() + "</li>";
                });
                $(curNav).find("ul").html(liListStr);
            }
            for (var i = 0; i < navEleList.length; i++) {
                navEleList[i].scroll(function (e) {
                    var scrollTop = $(this).scrollTop(), scrollLeft = $(this).scrollLeft();
                    var curNavFixed = $(this).parents(".jumbotron").prev(".nav_fixed");
                    if (scrollTop > 30) {
                        curNavFixed.css("visibility", "visible");
                        curNavFixed.children(".nav_fixed_inner").css("left", scrollLeft * -1)
                    } else {
                        curNavFixed.css("visibility", "hidden");
                    }
                })
            }
        },
        countdown: function (n) { //倒计时刷新
            var that = this;
            var countDown = that.prompt_box.find(".countdown");
            setInterval(function () {
                n == 0 ? that.reload() : n--;
                countDown.text(n);
            }, 1000)
        }
    };
commodity_import.init();