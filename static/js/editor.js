(function(global, variable) {
	//使用严格模式
	'use strict';
	
	var Selector, Upload, Editor, tools, color, Dialog;
	
	Selector = function(selector, context) {
		return new Selector.prototype.__init__(selector, context);
	};
	
	Selector.prototype = {
		//修正构造函数
		constructor : Selector,
		
		//初始化选择器
		__init__ : function(selector, context) {
			if (Selector.type(selector) === 'string') {
				selector = (context || global.document).querySelectorAll(selector);
			} else if (selector.nodeType) {
                selector = [selector];
            } else {
                return this;
            }
            return Selector.extend(this, {
                '0' : selector.length > 1 ? selector : selector[0],
                length : selector.length,
                context : context
            });
		},

        //遍历节点数组
        each : function(fn) {
            return Selector.each(this.length > 1 ? this[0] : [this[0]], fn);
        },

        //获取指定序列的节点
        eq : function(index) {
            return (index == 0 || this.length < 2) ? this : Selector(this[0][index]);
        },

        //显示元素 delay:动画时间
        show : function() {
            if (this.length == 1) {
                this[0].style.display = '';
            } else {
                Selector.eachCall('show', this[0]);
            }
            return this;
        },

        //隐藏元素
        hide : function() {
            if (this.length == 1) {
                this[0].style.display = 'none';
            } else {
                Selector.eachCall('hide', this[0]);
            }
            return this;
        },

        //设置或获取attribute属性
        attr : function(name, value) {
            return typeof value !== 'string' ? this[0].getAttribute(name) : function(obj) {
                if (typeof name === 'string') {
                    obj[0].setAttribute(name, value);
                } else {
                    Selector.each(name, function(item, key) {
                        obj[0].setAttribute(key, item);
                    });
                }
                return obj;
            }(this);
        },

        //节点设置或获取css属性
        css : function(name, value) {
            return (typeof value === 'undefined' && typeof name === 'string') ? this[0].style[name] : function(obj) {
                if (typeof name === 'string') {
                    obj[0].style[name] = value;
                } else {
                    Selector.each(name, function(item, key) {
                        obj[0].style[key] = item;
                    });
                }
                return obj;
            }(this);
        },

        //设置或获取节点html内容
        html : function(html) {
            return typeof html !== 'string' ? this[0].innerHTML : function(obj) {
                obj[0].innerHTML = html;
                return obj;
            }(this);
        },

        //添加子节点
        append : function() {
            var i, fragment, div;
            for (i = 0; i < arguments.length; i ++) {
                if (typeof arguments[i] === 'string') {
                    fragment = Selector.htmlToFragment(arguments[i]);
                } else {
                    fragment = arguments.constructor ? arguments[i][0] : arguments[i];
                }
                this[0].appendChild(fragment);
            }
            return this;
        },

        //将元素插入到指定节点
        appendTo : function(selector) {
            (selector[0] || selector).appendChild(this[0]);
            return this;
        },

        //在指定节点前面插入节点
        before : function(node) {
            if (node && this[0].parentNode) {
                this[0].parentNode.insertBefore(node.constructor ? node[0] : node, this[0]);
            }
            return this;
        },

        //设置或获取宽
        width : function(width) {
            return typeof width === 'undefined' ? parseInt(this[0].style.width || this[0].offsetWidth) : function(obj) {
                obj[0].style.width = width + 'px';
                return obj;
            }(this);
        },

        //设置或获取高
        height : function(height) {
            return typeof height === 'undefined' ? parseInt(this[0].style.height || this[0].offsetHeight) : function(obj) {
                obj[0].style.height = height + 'px';
                return obj;
            }(this);
        },

        //获取元素偏移位置
        offset : function(offset) {
            offset = offset || {top : 0, left : 0};
            offset.top  += this[0].offsetTop;
            offset.left += this[0].offsetLeft;
            if (this[0].offsetParent.tagName != 'BODY') {
                offset = this.offset(this[0].offsetParent, offset);
            }
            return offset;
        },

        //绑定事件
        bind : function(type, fn) {
            Selector.addEvent(this[0], type, fn);
            return this;
        }
	};

    Selector.htmlToFragment = function(html) {
        var fragment = global.document.createDocumentFragment(),
        div = this.create('div', {
            innerHTML : html
        });
        while (div.firstChild) {
            fragment.appendChild(div.firstChild);
        }
        return fragment;
    };

    //绑定事件
    Selector.addEvent = function(element, type, fn) {
        element.addEventListener(type, fn, false);
    };
	
	//循环继承参数
	Selector.extend = function(target, source) {
		for (var key in source) {
			target[key] = source[key];
		}
		return target;
	};
	
	//检测参数类型
	Selector.type = function(args) {
		var type;
		if (args == null || args == 'undefined') {
			type = args;
		} else {
			type = Object.prototype.toString.call(args).split(' ')[1];
			type = type.replace(']', '').toLowerCase();
			if (type.indexOf('node') > -1) {
				type = 'node';
			}
		}
		return type;
	};

    //循环call自身
    Selector.eachCall = function(method, array) {
        Selector.each(array, function(item) {
            Selector.prototype[method].call([item]);
        });
    };

	//检测是否为数组
	Selector.isArray = function(args) {
		return this.type(args) === 'array';
	};

    //便利数组或对象
    Selector.each = function(data, fn) {
        for (var key in data) {
            fn.apply(data[key], [data[key], key]);
        }
    };

    //创建元素
    Selector.create = function(element, args) {
        element = global.document.createElement(element);
        if (typeof args !== 'undefined') {
            var fn, key;
            fn = function(ele, list) {
                for (key in list) {
                    //object
                    if (typeof list[key] != 'string' && !list[key].length) {
                        fn(ele[key], list[key]);
                    } else {
                        ele[key] = list[key];
                    }
                }
            };
            fn(element, args);
        }
        return element;
    };

    //判断元素是否是在指定数组中
    Selector.inArray = function(args, array) {
        var index = -1, i;
        if (Array.prototype.indexOf) {
            array.indexOf(args);
        } else {
            for (i = 0; i < array.length; i ++) {
                if (array[i] === args) {
                    index = i;
                    break;
                }
            }
        }
        return index;
    };

    //元素包含检测
    Selector.contains = function(parentNode, childNode)
    {
        if ('contains' in parentNode) {
            return parentNode.contains(childNode);
        } else if ('compareDocumentPosition' in parentNode) {
            return parentNode.compareDocumentPosition(childNode) % 16;
        } else {
            return false;
        }
    };

    //创建ajax执行方法
    Selector.extend(Selector, (function(Selector) {
        //创建Ajax请求
        function createXMLHttpRequest()
        {
            var request;
            try {
                request = new ActiveXObject("Msxml2.XMLHTTP");//IE高版本创建XMLHTTP
            } catch(e) {
                try {
                    request = new ActiveXObject("Microsoft.XMLHTTP");//IE低版本创建XMLHTTP
                } catch(e) {
                    request = new XMLHttpRequest();//兼容非IE浏览器，直接创建XMLHTTP对象
                }
            }
            return request;
        }

        //发送ajax请求
        function sendAjaxRequest(options, request)
        {
            options.data = analyzeAjaxData(options.method, options.data);
            if (options.method == 'get' && options.data) {
                options.url += (/\?/.test(options.url) ? '&' : '?') + options.data;
            }
            request.open(options.method, options.url, options.async);
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            request.onreadystatechange = function() {
                processResponse(options.success, options.error, options.type, request);
            };
            request.send(options.data);
        }

        //分析数据
        function analyzeAjaxData(method, data)
        {
            if (!data || data.length < 1) return null;
            var _data = [];
            for (var key in data) _data.push(key + '=' + encodeContent(data[key]));
            return _data.join('&');
        }

        //回调函数,判断请求执行成功还是失败,并调用对应的函数
        function processResponse(success, error, type, request)
        {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    var text = request.response || request.responseText;
                    //实现回调
                    if (type.toLowerCase() == 'json') {
                        try {
                            text = JSON.parse(text);
                        } catch (e) {}
                    }
                    success(text, 'success');
                } else {
                    error(request.readyState, request.status);
                }
            }
        }

        //特殊字符转义
        function encodeContent(data){
            if (/^data:image\/\w+;base64/i.test(data)) {
                return data.replace(/\+/g, "%2B").replace(/\&/g, "%26");
            }
            return encodeURI(data).replace(/&/g,'%26').replace(/\+/g,'%2B').replace(/\s/g,'%20').replace(/#/g,'%23');
        }

        return {
            ajax : function(options) {
                sendAjaxRequest(Selector.extend({
                    method  : 'get',
                    url     : null,
                    async   : true,
                    data    : null,
                    type    : 'json',
                    success : function() {},
                    error   : function() {}
                }, options), createXMLHttpRequest());
            },

            post : function(_url, _data, _fn, _type) {
                this.ajax({method : 'post', url : _url, data : _data, success : _fn, type : _type || 'json'});
            },

            get : function(_url, _data, _fn, _type) {
                if (_data instanceof Function) {
                    _type = _fn;
                    _fn   = _data;
                    _data = null;
                }
                this.ajax({method : 'get', url : _url, data : _data, success : _fn, type : _type || 'json'});
            }
        };
    }(Selector)));
	
	Selector.prototype.__init__.prototype = Selector.prototype;


    /****************************图片上传*************************/

    Upload = function(options) {
        this.options = Selector.extend({
            //允许图片的格式
            allow_ext    : ['jpeg', 'jpg', 'png', 'gif'],
            //图片最大尺寸
            maxsize      : 2048,
            //上传图片的地址(post)
            upload_url   : 'upload.php',
            //抓取远程图片的地址
            fetch_url    : 'fetch.php',
            //开始上传前事件
            uploadBefore : function(file, index){},
            //回调函数data为json格式
            callback     : function(data, index){}
        }, options);
    };

    Upload.prototype = {
        //修正构造函数
        constructor : Upload,

        count : 1,

        //检测图片后缀
        checkSubfix : function(filename) {
            return Selector.inArray(
                filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(),
                this.options.allow_ext
            );
        },

        //检测图片地址是否合法
        checkHost : function(url) {
            return /^(https?:)?\/\/\w+\.(feidee|cardniu)\.(com|net)/i.test(url);
        },

        //上传图片主要方法
        startUpload : function(file) {
            var reader = new FileReader(), _this = this;
            reader.readAsDataURL(file);
            reader.onload = function() {
                Selector.post(_this.options.upload_url, {'file' : this.result}, function(data) {
                    if (data.code == 1) {
                        _this.options.callback(data.items, file.index);
                    }
                });
                reader = null;
            }
        },

        reader : function(file) {
            var reader = new FileReader(), _this = this;
            reader.readAsDataURL(file);
            reader.onload = function() {
                _this.options.uploadBefore(this.result, file.index);
                reader = null;
            }
        },

        //开始上传图片
        upload : function(files) {
            var i;
            for (i = 0; i < files.length; i ++) {
                if (this.checkSubfix(files[i].name)) {
                    files[i].index = this.count;
                    this.count++;
                    this.reader(files[i]);
                }
            }
            for (i = 0; i < files.length; i ++) {
                if (this.checkSubfix(files[i].name)) {
                    this.startUpload(files[i]);
                }
            }
        },

        //获取站外图片
        fetch : function(url) {
            if (this.checkSubfix(url) && this.checkHost(url)) {
                this.options.callback({code : 1, url : url});
            }
        }
    };

    /****************************弹出框部分************************/

    Dialog = function(options) {
        return new Dialog.prototype.__init__(options);
    };

    Dialog.prototype = {
        //修正构造函数
        constructor : Dialog,
        //初始化本类
        __init__ : function(options) {
            this.options = Selector.extend({
                width   : 200,
                height  : 0,
                title   : '通知',
                content : '',
                confirm : null
            }, options);
            this.create();
        },
        //创建弹出框
        create : function() {
            var _this = this;
            Selector.extend(this, {
                dialog  : Selector.create('div', {
                    className : 'dialog',
                    innerHTML : '<div class="title"><span></span><i class="iconfont">&#xe609;</i></div>'
                }),
                content : Selector.create('div', {
                    className : 'content'
                })
            });
            this.dialog.appendChild(this.content);
            this.title = this.dialog.querySelector('.title span');
            Selector.addEvent(this.dialog.querySelector('.title i'), 'click', function() {
                _this.hide();
            });
            this.setContent(this.options.content).setTitle(this.options.title);
            if (this.options.confirm) {
                this.confirm(this.options.confirm);
            }
            return this;
        },
        //设置标题
        setTitle : function(title) {
            this.title.innerHTML = title;
            return this;
        },
        //设置内容
        setContent : function(content) {
            if (typeof content === 'string') {
                this.content.innerHTML = content;
            } else {
                this.content.innerHTML = '';
                this.content.appendChild(content);
            }
            return this;
        },
        //添加确认按钮
        confirm : function(callback) {
            var wrapper;
            wrapper = Selector.create('div', {
                className : 'confirm'
            });
            this.confirm = Selector.create('input', {
                type  : 'button',
                value : '确定'
            });
            wrapper.appendChild(this.confirm);
            this.dialog.appendChild(wrapper);
            Selector.addEvent(this.confirm, 'click', function() {
                callback();
            });
            return this;
        },
        //设置属性
        setAttribute : function() {
            if (this.options.height > 50) {
                this.content.style.height = this.options.height + 'px';
            }
            Selector.extend(this.dialog.style, {
                width : this.options.width + 'px',
                top   : '100px',
                left  : (global.screen.availWidth - this.options.width) / 2 + 'px'
            });
            global.document.body.appendChild(this.dialog);
            return true;
        },
        //显示弹出层
        show : function() {
            if (!this.exist) {
                this.exist = this.setAttribute();
            }
            this.dialog.style.display = '';
            return this;
        },
        //隐藏弹出层
        hide : function() {
            this.dialog.style.display = 'none';
            return this;
        }
    };

    Dialog.prototype.__init__.prototype = Dialog.prototype;

    //遮罩效果
    Dialog.cover = function() {
        function createCover() {
            return Selector.create('div', {
                className  : 'cover',
                style      : {
                    height : global.screen.availHeight + 'px'
                }
            });
        }
        return {
            //显示遮罩
            show : function() {
                if (!createCover.cover) {
                    createCover.cover = Selector(createCover()).appendTo(global.document.body);
                }
                createCover.cover.show();
            },
            //隐藏遮罩
            hide : function() {
                createCover.cover.hide();
            }
        }
    }();

    Dialog.tip = function() {
        function createTip() {
            return Selector.create('div', {className  : 'tip'});
        }
        return function(message) {
            if (!createTip.tip) {
                createTip.tip = Selector(createTip()).appendTo(global.document.body);
            }
            createTip.tip.html(message).show().css({
                top  : '100px',
                left : (global.document.body.offsetWidth - createTip.tip.width()) / 2 + 'px'
            });
            setTimeout(function() {
                createTip.tip.hide();
            }, 2500);
        };
    }();

    /****************************编辑器部分************************/

    //可选颜色列表
    color = [
        '#000000', '#fff', '#000066', '#000099', '#0000CC', '#0000FF',
        '#0033CC', '#0033FF', '#006600', '#006633', '#006666', '#006699',
        '#009966', '#009999', '#0099CC', '#0099FF', '#00CC00', '#00CC33',
        '#666600', '#666666', '#6666CC', '#669900', '#669966', '#6699CC',
        '#66CCCC', '#66CCFF', '#66FF00', '#66FF99', '#66FFFF', '#990000',
        '#996600', '#996666', '#9966CC', '#9966FF', '#999900', '#999966',
        'red', '#CC3366', '#CC9966', '#CC9999', '#CCCC00', '#F78B00'
    ];

    //可选工具列表
    tools = [
        {name : 'cleanFormat', icon : '&#xe60b;', tip : '清除格式'},
        {name : 'justifyLeft', icon : '&#xe60d;', tip : '左对齐'},
        {name : 'justifyCenter', icon : '&#xe60f;', tip : '居中对齐'},
        {name : 'justifyRight', icon : '&#xe60e;', tip : '右对齐'},
        {name : 'bold', icon : '&#xe608;', tip : '加粗'},
        {name : 'table', icon : '&#xe607;', tip : '表格'},
        {name : 'insertUnorderedList', icon : '&#xe606;', tip : '无序列表'},
        {name : 'insertOrderedList', icon : '&#xe601;', tip : '有序列表'},
        {name : 'insertImage', icon : '&#xe605;', tip : '图片'},
        {name : 'color', icon : '&#xe604;', tip : '文字颜色'},
        {name : 'createLink', icon : '&#xe603;', tip : '超链接'},
        {name : 'unLink', icon : '&#xe602;', tip : '取消超链接'},
        {name : 'video', icon : '&#xe600;', tip : '视频'},
        {name : 'emotion', icon : '&#xe612;', tip : '表情'},
        {name : 'undo', icon : '&#xe610;', tip : '撤销操作'}
    ];

    Editor = function(options) {
        this.options = Selector.extend({
            //存放内容的文本域
            textarea         : null,
            //编辑器宽，默认为textarea的宽度
            width            : null,
            //编辑器高，默认为textarea的高度
            height           : null,
            //是否允许插入图片
            allowImage       : true,
            //是否允许上传图片
            allowUploadImage : true,
            //上传图片地址
            uploadImageUrl   : null,
            //显示的组件列表,默认显示全部
            tools            : null
        }, options);

        //存储零散数据
        this.data = {};

        if (typeof this.options.textarea === 'string') {
            this.options.textarea = Selector(this.options.textarea);
        }
        Selector.extend(this, initialization(this.options));
        //绑定工具栏事件
        bindToolsEvent(this.tools, this);
        //绑定内容事件
        bindContentEvent(this.content, this);
    };

    //初始化编辑器
    function initialization(options)
    {
        var editor = {
            editor  : Selector(Selector.create('div', {
                className       : 'editor'
            })),
            tools   : Selector(Selector.create('div', {
                className       : 'tools',
                unSelectable    : 'on',
                innerHTML       : createTools(options.tools)
            })),
            content : Selector(Selector.create('div', {
                className       : 'content',
                contentEditable : 'true'
            }))
        };
        editor.editor.append(editor.tools, editor.content);
        //修复编辑器高
        editor.content.css('minHeight', 300 + 'px');
        options.textarea.before(editor.editor);
        options.textarea.hide();
        return editor;
    }

    //初始化工具栏
    function createTools(items)
    {
        var key, html = '';
        for (key in tools) {
            if (!items || !items.length || Selector.inArray(tools[key].name, items) > -1) {
                html += '<button title="' + tools[key].tip + '" name="' + tools[key].name + '">' + tools[key].icon + '</button>';
            }
        }
        return html;
    }

    //绑定工具栏事件
    function bindToolsEvent(tools, editor)
    {
        tools.bind('click', function(e) {
            if (e.target.tagName == 'BUTTON') {
                (e.target.name in editor) && editor[e.target.name]();
            }
            editor.saveRange();
        });
    }

    //绑定内容事件
    function bindContentEvent(content, editor)
    {
        var selection, abort, target;
        content.bind('click', function(e) {
            selection = global.getSelection();
            abort = false;
            target = e.target;
            while (target != editor.content[0] && !abort) {
                switch (target.tagName) {
                    case 'A':
                        selection.selectAllChildren(target);
                        editor.createLink(target.href, target.target == '_blank');
                        e.preventDefault();
                        abort = true;
                        break;
                }
                target = target.parentNode;
            }
            editor.saveRange(selection.getRangeAt(0));
        });
    }

    //创建链接操作弹层
    function createLinkDialog()
    {
        return {
            link     : Selector.create('div', {
                className   : 'link'
            }),
            input    : Selector.create('input', {
                type        : 'text',
                placeholder : '请输入链接'
            }),
            checkbox : Selector.create('input', {
                type        : 'checkbox'
            }),
            label    : Selector.create('label', {
                innerHTML   : '新窗口打开'
            })
        };
    }

    //创建表情
    function createEmotionDialog()
    {
        var html = '', i;
        for (i = 1; i < 31; i ++) {
            html += '<img src="emotion/' + (i < 10 ? '0' + i : i) + '.gif">';
        }
        return html;
    }

    //创建上传弹出框
    function createUploadDialog()
    {
        var html = '';
        html += '<div class="tab"><span class="active" rel="local">上传图片</span><span rel="net">网络图片</span></div>';
        html += '<div class="queue"></div>';
        html += '<div class="upload_local">';
        html += '<input type="file" accept="image/gif, image/jpeg, image/x-png" class="upload_file" multiple="true" />';
        html += '<input type="button" class="upload_btn" value="选择图片" />';
        html += '</div>';
        html += '<div class="upload_net" style="display:none">';
        html += '<input type="text" class="fetch_url" value="http://" />';
        html += '<input type="button" class="fetch_btn" value="获取图片" />';
        html += '</div>';
        return html;
    }

    Editor.prototype = {
        //修正构造函数
        constructor : Editor,

        //给当前输入域聚焦
        focus : function() {
            this.editor[0].focus();
            return this;
        },

        //获取selection
        getSelection : function() {
            return global.getSelection();
        },

        //保存选择内容
        saveRange : function(range) {
            this.data.range = range ? range.cloneRange() : function(selection, obj) {
                return selection.rangeCount ? selection.getRangeAt(0).cloneRange() : (obj.data.range || null);
            }(this.getSelection(), this);
            return this;
        },

        //恢复选择内容
        recoveryRange : function() {
            //如果存在range，则恢复
            this.focus();
            if (this.data.range) {
                this.data.selection = this.getSelection();
                this.data.selection.removeAllRanges();
                this.data.selection.addRange(this.data.range);
                this.data.range = this.data.selection.getRangeAt(0);
            }
            return this;
        },

        //执行execCommand相关命令
        execCommand : function(command, bool, value) {
            return global.document.execCommand(command, bool || false, value || null);
        },

        //在range处插入
        insertAtRange : function(source, selection) {
            var range;
            if (typeof source === 'string') {
                source = Selector.htmlToFragment(source);
            }
            selection = selection || this.getSelection();
            range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(source);
            selection.addRange(range);
            return this;
        },

        //寻找父节点
        searchParent : function(node, father) {
            if (typeof father === 'string') {
                if (node && !node.tagName || node.tagName != father && node.parentNode) {
                    node = this.searchParent(node.parentNode, father);
                }
            } else {
                if (node != father && node.parentNode) {
                    node = this.searchParent(node.parentNode, father);
                }
            }
            return (typeof father === 'string' ? node.tagName : node) == father ? node : null;
        },

        //是否包含指定子节点
        isContains : function(node, child) {
            if (typeof child === 'string') {
                if (node.tagName != child && node.firstChild) {
                    node = node.querySelector(child);
                } else if (node.tagName != child) {
                    node = null;
                }
            } else if (node != child) {
                node = Selector.contains(node, child);
            }
            return node ? true : false;
        },

        //获取编辑器内容
        getContent : function() {
            return this.content.html();
        },

        //设置编辑器内容
        setContent : function(content) {
            this.content.html(content);
            return this;
        },

        //清除格式
        cleanFormat : function() {
            var selection, range, fragment;
            selection = this.getSelection();
            fragment = Selector.htmlToFragment(selection.toString());
            range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(fragment);
            selection.addRange(range);
            return this.execCommand('RemoveFormat');
        },

        //左对齐
        justifyLeft : function() {
            this.execCommand('justifyLeft');
            return this;
        },

        //居中对齐
        justifyCenter : function() {
            this.execCommand('justifyCenter');
            return this;
        },

        //右对其
        justifyRight : function() {
            this.execCommand('justifyRight');
            return this;
        },

        //加粗
        bold : function() {
            this.execCommand('bold', false, []);
            return this;
        },

        //添加表格
        table : function() {
            if (!this.data.tableDialog) {
                var _this = this, row, col, html = '', r, c;
                this.data.tableDialog = Dialog({
                    title   : '表格',
                    width   : 150,
                    height  : 60,
                    content : '<div class="table-num"><input type="text" class="row" placeholder="行" /><input type="text" class="col" placeholder="列" /></div>'
                });
                this.data.tableDialog.confirm(function() {
                    row = _this.data.tableDialog.content.querySelector('.row').value;
                    col = _this.data.tableDialog.content.querySelector('.col').value;
                    if (row < 1 || col < 1 || col > 5) {
                        Dialog.tip('行和列必须大于0,且列数不得大于5');
                    } else {
                        html = '<table class="table">';
                        for (r = 0; r < row; r ++) {
                            html += '<tr>';
                            for (c = 0; c < col; c ++) {
                                html += '<td></td>';
                            }
                            html += '</tr>';
                        }
                        html += '</table>';
                        _this.recoveryRange();
                        _this.insertAtRange(html);
                    }
                });
            }
            this.data.tableDialog.show();
        },

        //添加无序列表
        insertUnorderedList : function() {
            this.execCommand('insertUnorderedList', false, null);
        },

        //添加有序列表
        insertOrderedList : function() {
            this.execCommand('insertOrderedList', false, null);
        },

        //添加图片
        insertImage : function() {
            if (!this.data.upload) {
                var upload = Selector.create('div', {
                    className : 'upload',
                    innerHTML : createUploadDialog()
                }), _this = this;
                this.data.upload = Dialog({
                    title   : '添加图片',
                    width   : 500,
                    height  : 500,
                    content : upload
                });
                this.data.uploadDialog = {
                    queue        : upload.querySelector('.queue'),
                    upload_local : upload.querySelector('.upload_local'),
                    upload_net   : upload.querySelector('.upload_net'),
                    fetch_url    : upload.querySelector('.fetch_url')
                };
                Selector.addEvent(upload.querySelector('.tab'), 'click', function(e) {
                    var brother;
                    if (e.target.tagName == 'SPAN') {
                        brother = e.target.nextSibling || e.target.previousSibling;
                        e.target.className = 'active';
                        brother.className = '';
                        _this.data.uploadDialog['upload_' + brother.getAttribute('rel')].style.display = 'none';
                        _this.data.uploadDialog['upload_' + e.target.getAttribute('rel')].style.display = '';
                    }
                });
                //选中了文件
                Selector.addEvent(upload.querySelector('.upload_file'), 'change', function() {
                    var img;
                    if (!_this.data.uploadContext) {
                        _this.data.uploadContext = new Upload({
                            uploadBefore : function(file, index) {
                                _this.data.uploadDialog.queue.innerHTML += '<div class="upload_img"><img data-index="' + index + '" src="' + file + '"><div class="upload_cover">加载中...</div></div>'
                            },
                            callback : function(file, index) {
                                img = _this.data.uploadDialog.queue.querySelector('img[data-index="' + index + '"]');
                                img.dataset.src = file;
                                img.nextSibling.style.display = 'none';
                            }
                        });
                    }
                    _this.data.uploadContext.upload(this.files);
                });
                //获取图片事件
                Selector.addEvent(upload.querySelector('.fetch_btn'), 'click', function() {
                    if (_this.data.uploadDialog.fetch_url.value) {
                        _this.data.uploadDialog.queue.innerHTML += '<div><img data-src="' + _this.data.uploadDialog.fetch_url.value + '" src="' + _this.data.uploadDialog.fetch_url.value + '"></div>';
                    } else {
                        Dialog.tip('请输入正确的图片地址');
                    }
                });
                //图片点击事件
                Selector.addEvent(this.data.uploadDialog.queue, 'click', function(e) {
                    if (e.target.tagName == 'IMG') {
                        _this.insertAtRange('<img src="' + e.target.dataset.src + '">');
                    }
                });
            }
            this.data.upload.show();
        },

        //上传图片实现方法
        uploadImage : function() {
            if (!this.data.upload) {
                this.data.upload = Dialog({
                    title   : '添加图片',
                    width   : 500,
                    height  : 300,
                    content : ''
                });
            }
            this.data.show();
        },

        //设置文字颜色
        color : function() {
            if (!this.data.colorDialog) {
                var html = '<div class="color">', _this = this;
                Selector.each(color, function(item) {
                    html += '<input type="button" style="background:' + item + '" />';
                });
                this.data.colorDialog = Dialog({
                    title   : '调色板',
                    width   : 200,
                    content : html
                });
                Selector.addEvent(this.data.colorDialog.content.querySelector('.color'), 'click', function(e) {
                    _this.execCommand('foreColor', false, e.target.style.background);
                });
            }
            this.data.colorDialog.show();
        },

        //链接操作框
        createLinkCommand : function(url, target) {
            var selection;
            this.recoveryRange();
            this.execCommand('createLink', false, url);
            selection = this.getSelection();
            if (target && selection.anchorNode.parentNode.tagName == 'A') {
                selection.anchorNode.parentNode.setAttribute('target', '_blank');
            }
            this.data.link.hide();
        },

        //添加链接
        createLink : function(url, checked) {
            if (!this.data.link) {
                var _this = this, data = {};
                Selector.extend(data, createLinkDialog());
                data.link.appendChild(data.input);
                data.link.appendChild(data.checkbox);
                data.link.appendChild(data.label);
                this.data.link = Dialog({
                    title   : '添加链接',
                    width   : 250,
                    height  : 80,
                    content : data.link,
                    confirm : function() {
                        if (/\/\//.test(data.input.value)) {
                            _this.createLinkCommand(data.input.value, data.checkbox.checked);
                        } else {
                            Dialog.tip('链接格式错误');
                        }
                    }
                });
                this.data.linkvar = data;
            }
            url && (this.data.linkvar.input.value = url);
            checked && (this.data.linkvar.checkbox.checked = true);
            this.data.link.show();
        },

        //移除链接
        unLink : function() {
            this.execCommand('unLink', false, null);
            return this;
        },

        //插入视频
        video : function() {
            if (!this.data.videoDialog) {
                var _this = this, url, id, video;
                this.data.videoDialog = Dialog({
                    title   : '添加视频',
                    width   : 400,
                    height  : 80,
                    content : '<div class="video"><label>填写视频网址即可，暂时只支持优酷和腾讯视频</label><input class="url" type="text" value="http://"></div>'
                });
                this.data.videoDialog.confirm(function() {
                    url = _this.data.videoDialog.content.querySelector('.url').value;
                    video = '';
                    if (url.length < 20) {
                        Dialog.tip('链接格式错误');
                    } else if (/(https?:\/\/)?\w+\.youku\.com/i.test(url) && (id = url.match(/id_(\w+)/i)) && id[1]) {
                        video = 'http://player.youku.com/embed/' + id[1];
                    } else if (/(https?:\/\/)?\w+\.qq\.com/i.test(url) && (id = url.match(/vid=(\w+)/i)) && id[1]) {
                        video = 'http://v.qq.com/iframe/player.html?vid=' + id[1] + '&tiny=0&auto=0';
                    } else {
                        Dialog.tip('暂时只支持优酷和腾讯视频');
                    }
                    if (video) {
                        _this.recoveryRange();
                        _this.insertAtRange('<iframe src="' + video + '" frameborder=0 allowfullscreen="true"></iframe>');
                    }
                });
            }
            this.data.videoDialog.show();
        },

        //插入表情
        emotion : function() {
            if (!this.data.emotion) {
                var emotion = Selector.create('div', {
                    className : 'emotion',
                    innerHTML : createEmotionDialog()
                }), _this = this;
                this.data.emotion = Dialog({
                    title   : '添加表情',
                    width   : 240,
                    content : emotion
                });
                Selector.addEvent(emotion, 'click', function(e) {
                    _this.saveRange();
                    if (e.target.tagName == 'IMG') {
                        _this.recoveryRange();
                        _this.execCommand('insertImage', false, e.target.src);
                    }
                });
            }
            this.data.emotion.show();
        },

        //撤销操作
        undo : function() {
            //待定功能
            this.execCommand('undo');
        }
    };

    global[variable] = function(options) {
        return new Editor(options).focus();
    }

}(window, 'Editor'));
