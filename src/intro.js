/**
 * intro.js
 * @author wuhuihao
 * @email huihaojz@hotmail.com
 * 
 */
window.intro = (function() {

    var commandList = [],
        wrap, c_index = 0;

    var Command = function(config) {
        this.config = config;
    };

    /**
     * 执行新一步的引导项展示，根据配置生成相应dom  
     * @param  {Object} container 用于挂载生成dom的节点，这里一般为wrap
     * @return {Object}           生成的dom
     */
    Command.prototype.exec = function(container) {
        var config = this.config,
            setting = this.config.setting,
            div = kit.ce("div", { "id": config.name }),
            targetEle = $(config.targetSelector),
            top = targetEle.offset().top,
            left = targetEle.offset().left,
            highest=top;

        kit.css(div, {
            "position": "absolute",
            top: top + "px",
            left: left + "px"
        });



        for (var ele in setting) {
            if (setting.hasOwnProperty(ele)) {

                var set = setting[ele],
                    dom = kit.ce("div");

                dom.className = "intro intro-" + set.cls;

                kit.css(dom, {
                    position: "absolute",
                    "zIndex": "99999999",
                    top: set.offset.top,
                    left: set.offset.left
                });

                if((top+parseInt(set.offset.top.replace("px",""))<highest)){
                    highest=top+parseInt(set.offset.top.replace("px",""));
                }

                div.appendChild(dom);
            }
        }

        container.appendChild(div);

        //window.scrollTo(0,highest);

        config.exec && config.exec();

        this.dom = div;
        return this.dom;
    };

    /**
     * 删除已经生成的引导展示项目
     * @param  {Object} container 挂载有dom的节点
     */
    Command.prototype.undo = function(container) {
        if (this.dom) {
            container.removeChild(this.dom);
            this.dom = null;

            this.config.undo && this.config.undo();
        }
    };

    var kit = {
        /**
         * 新建element
         * @param  {String} tagName  tagName
         * @param  {Array} attrList  需要设定的属性列表
         * @return {Object}          生成的dom节点
         */
        ce: function(tagName, attrList) {
            var dom = document.createElement(tagName);
            if (attrList) {
                for (var attr in attrList) {
                    if (attrList.hasOwnProperty(attr)) {
                        dom.setAttribute(attr, attrList[attr]);
                    }
                }
            }
            return dom;
        },
        getn: function(dom, tagName) {
            if (typeof dom === "string") {
                tagName = dom;
                dom = document;
            }
            return dom.getElementsByTagName(tagName);
        },
        append: function(dom, tags) {

            if (!(tags instanceof Array)) {
                tags = [tags];
            }
            for (var i = 0; i < tags.length; i++) {
                dom.appendChild(tags[o]);
            }

        },
        css: function(dom, config) {

            if (!(dom instanceof Array)) {
                dom = [dom];
            }
            for (var key in config) {
                if (config.hasOwnProperty(key)) {
                    for (var i = 0; i < dom.length; i++) {
                        dom[i].style[key] = config[key];
                    }
                }
            }
        }
    };


    /**
     * 开始新手引导操作
     * @param  {Object} config 配置
     */
    function start(config) {

        if (!navigator.cookieEnabled || docCookies.getItem("isShow") == "true") {

            return false;
        }

        wrap = kit.ce("div", { "id": "intro-bg" });
        var wrap_mask = kit.ce("div", { "id": "intro-bg-mask" }),
            close = kit.ce("div");

        close.className = "intro intro-close";

        kit.css(close, {
            "position": "absolute",
            "top": '20px',
            "right": "20px"
        })


        kit.css(wrap, {
            "width": "100%",
            "height": "1781px",
            "position": "absolute",
            "top": '0',
            "left": "0",
            "zIndex": "999999"
        });

        kit.css(wrap_mask, {
            "width": "100%",
            "height": "100%",
            "position": "absolute",
            "top": '0',
            "left": "0",
            "backgroundColor": "#000",
            "opacity": "0.5",
            filter: "alpha(opacity=55)"
        });

        wrap.appendChild(wrap_mask);

        //wrap.appendChild(close);

        kit.getn("body")[0].appendChild(wrap);

        setCommandList(config.commandList);

        next();

        eventBind();
    }

    /**
     * 设定引导项目列表
     * @param {Array} list 配置中设定好的需要引导展示的项目
     */
    function setCommandList(list) {
        for (var i = 0; i < list.length; i++) {
            commandList.push(new Command(list[i]));
        }
    }


    /**
     * 绑定响应事件
     */
    function eventBind() {
        $(document).on("click", ".intro-button-continue", function() {
            next();
        });

        $(document).on("click", ".intro-button-finish", function() {
            close();
        });

        $(document).on("click", ".intro-button-replay", function() {
            replay();
        });

        $(document).on("click", ".intro-close", function() {
            close();
        });

    }

    /**
     * 解除事件绑定
     */
    function eventUnBind() {
        $(document).off("click", ".intro-button-continue");
        $(document).off("click", ".intro-button-finsh");
        $(document).off("click", ".intro-button-replay");
        $(document).off("click", ".intro-close");
    }


    /**
     * 禁止滚动
     */
    function disableScroll() {
        document.documentElement.style.overflow = 'hidden';
    }

    /**
     * 允许滚动
     */
    function enableScroll() {
        document.documentElement.style.overflow = 'auto';
    }

    /**
     * 执行下一步引导操作
     */
    function next() {

        if (c_index > 0) {
            commandList[c_index - 1].undo(wrap);
        }

        if (c_index < commandList.length) {

            commandList[c_index].exec(wrap);
            c_index++;
        }
    }

    /**
     * 清除引导列表项目
     */
    function clear() {
        for (var i = 0; i < commandList.length; i++) {
            commandList[i].undo(wrap);
        }
    }

    /**
     * 结束引导
     */
    function close() {
        eventUnBind();
        clear();
        kit.getn("body")[0].removeChild(wrap);
        docCookies.setItem("isShow", "true",Infinity);
    }

    /**
     * 重新开始引导
     */
    function replay() {
        clear();
        c_index = 0;
        next();
    }

    /*\
    |*|
    |*|  :: cookies.js ::
    |*|
    |*|  A complete cookies reader/writer framework with full unicode support.
    |*|
    |*|  https://developer.mozilla.org/en-US/docs/DOM/document.cookie
    |*|
    |*|  This framework is released under the GNU Public License, version 3 or later.
    |*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
    |*|
    |*|  Syntaxes:
    |*|
    |*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
    |*|  * docCookies.getItem(name)
    |*|  * docCookies.removeItem(name[, path], domain)
    |*|  * docCookies.hasItem(name)
    |*|  * docCookies.keys()
    |*|
    \*/

    var docCookies = {
        getItem: function(sKey) {
            return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
        },
        setItem: function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
            if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
                return false;
            }
            var sExpires = "";
            if (vEnd) {
                switch (vEnd.constructor) {
                    case Number:
                        sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                        break;
                    case String:
                        sExpires = "; expires=" + vEnd;
                        break;
                    case Date:
                        sExpires = "; expires=" + vEnd.toUTCString();
                        break;
                }
            }
            document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
            return true;
        },
        removeItem: function(sKey, sPath, sDomain) {
            if (!sKey || !this.hasItem(sKey)) {
                return false;
            }
            document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
            return true;
        },
        hasItem: function(sKey) {
            return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
        },
        /* optional method: you can safely remove it! */
        keys: function() {
            var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
            for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
            return aKeys;
        }
    };

    return {
        start: start
    };
})();
