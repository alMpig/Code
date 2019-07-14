function Compile(el, vm) {
    //保存 vm 到 Compil 对象
      this.$vm = vm;
    //将 el 对应的元素对象保存到 Compil 对象中
      this.$el = this.isElementNode(el) ? el : document.querySelector(el);
    //如果有 el 元素
      if (this.$el) {
        //1. 取出 el 元素中所有的子节点保存到一个 fragment 对象中
          this.$fragment = this.node2Fragment(this.$el);
        //2. 编译 fragment 中所有层次子节点
          this.init();
        //3. 将编译好的 fragment 添加到页面的 el 元素中
          this.$el.appendChild(this.$fragment);
      }
  }

Compile.prototype = {
    node2Fragment: function(el) {
    //1.1 创建空的 fragment
        var fragment = document.createDocumentFragment(),
            child;
    //1.2 将el中所有的子节点转移到 fragment
        while (child = el.firstChild) {
            fragment.appendChild(child);
        }
            //1.3 返回 fragment
        return fragment;
    },
    init: function() {
    //2.1 编译指定元素（所有层次的子节点）
        this.compileElement(this.$fragment);
    },
  
    compileElement: function(el) {
    //2.2 取出最外层所有子节点
        var childNodes = el.childNodes,
            //保存 Compil 对象
            me = this;
            //2.3 遍历所有的子节点（text/element）
        [].slice.call(childNodes).forEach(function(node) {
        //2.4 得到子节点文本内容
            var text = node.textContent;
        //2.5 创建正则对象（匹配打括号表达式）
            var reg = /\{\{(.*)\}\}/;
            //2.6 判断节点是否是一个元素
            if (me.isElementNode(node)) {
            //2.6.2 编译它（解析指令）
                me.compile(node);
            //2.9 判断节点是否是打括号格式的文本节点
            } else if (me.isTextNode(node) && reg.test(text)) {
                //2.9.1 编译大括号表达式文本节点
                me.compileText(node, RegExp.$1.trim());
            }
            //2.11 如果当前节点还有子节点，通过递归调用实现所有层次节点编译
            if (node.childNodes && node.childNodes.length) {
                // 2.12 再次调用函数
                me.compileElement(node);
            }
        });
    },

    compile: function(node) {
        //2.6.2.1 得到标签的所有属性
        var nodeAttrs = node.attributes,
            me = this;
        //2.6.2.2 遍历所有属性
        [].slice.call(nodeAttrs).forEach(function(attr) {
            //2.6.2.3 得到属性名 例：v-on:click
            var attrName = attr.name;
            //2.6.2.4 判断是否是指令属性
            if (me.isDirective(attrName)) {
                //2.6.2.6 得到属性值 v-on:click="show" 中的 show
                var exp = attr.value;
                //2.6.2.7 从属性名中得到指令名 on:click
                var dir = attrName.substring(2);
                //2.6.2.8  判断是否是事件指令
                if (me.isEventDirective(dir)) {
                    //2.6.2.10 如果是就去解析事件指令
                    compileUtil.eventHandler(node, me.$vm, exp, dir);
                    // 普通指令 v-on
                } else {
                    //一般指令 v-text/html/class
                    //2.6.3 编译指令属性
                    compileUtil[dir] && compileUtil[dir](node, me.$vm, exp);
                }
                //绑定监听过后，移除指令属性
                node.removeAttribute(attrName);
            }
        });
    },
    //2.9.2.2
    compileText: function(node, exp) {
        compileUtil.text(node, this.$vm, exp);
    },
    //2.6.2.5 判断是不是以 v- 开头
    isDirective: function(attr) {
        return attr.indexOf('v-') == 0;
    },
    //2.6.2.9 判断是不是以 on 开头
    isEventDirective: function(dir) {
        return dir.indexOf('on') === 0;
    },
    // 2.6.1 判断是不是元素节点
    isElementNode: function(node) {
        return node.nodeType == 1;
    },
    // 2.9.1 判断是不是文本节点
    isTextNode: function(node) {
        return node.nodeType == 3;
    }
};

// 包含多个解析指令的方法工具对象
var compileUtil = {
    //2.9.2.2.1
    //解析 v-text/{{}}
    text: function(node, vm, exp) {
        this.bind(node, vm, exp, 'text');
    },
    //解析 v-html
    html: function(node, vm, exp) {
        this.bind(node, vm, exp, 'html');
    },
    //解析 v-model
    model: function(node, vm, exp) {
        //实现数据的初始化显示和创建对应的watcher
        this.bind(node, vm, exp, 'model');

        var me = this,
        //得到表达式的值
            val = this._getVMVal(vm, exp);
        //给节点绑定input事件监听，输入改变时触发
        node.addEventListener('input', function(e) {
            //得到输入的最新值，如果没变化直接结束
            var newValue = e.target.value;
            if (val === newValue) {
                return;
            }
            //将最新的value保存给表达式对应的属性
            me._setVMVal(vm, exp, newValue);
            //保存最新的值
            val = newValue;
        });
    },
    //解析 v-class
    class: function(node, vm, exp) {
        this.bind(node, vm, exp, 'class');
    },

    bind: function(node, vm, exp, dir) {
        //得到更新节点的函数（方法名）
        var updaterFn = updater[dir + 'Updater'];
        //调用函数更新节点
        updaterFn && updaterFn(node, this._getVMVal(vm, exp));
        //为表达式创建一个对应的watcher，实现节点的更新显示
        new Watcher(vm, exp, function(value, oldValue) {//当表达式对应的一个属性值变化时调用回调
            //更新界面中对应的指定节点
            updaterFn && updaterFn(node, value, oldValue);
        });
    },

    //2.6.2.11 事件处理
    eventHandler: function(node, vm, exp, dir) {
        //2.6.2.12 得到事件类型/名 click
        var eventType = dir.split(':')[1],
        //2.6.2.13 从methods中得到对应的函数（事件回调函数）
            fn = vm.$options.methods && vm.$options.methods[exp];
        //2.6.2.14 如果都存在
        if (eventType && fn) {
            //2.6.2.15 给节点绑定指定的事件名和回调函数（强制绑定thi为vm）的dom事件监听
            node.addEventListener(eventType, fn.bind(vm), false);
        }
    },
    //从vm得到表达式对应的值
    _getVMVal: function(vm, exp) {
        var val = vm;
        exp = exp.split('.');
        exp.forEach(function(k) {
            val = val[k];
        });
        return val;
    },

    _setVMVal: function(vm, exp, value) {
        var val = vm;
        exp = exp.split('.');
        exp.forEach(function(k, i) {
            // 非最后一个key，更新val的值
            if (i < exp.length - 1) {
                val = val[k];
            } else {
                val[k] = value;
            }
        });
    }
};

// 包含多个更新节的方法的工具对象
var updater = {
    //更新节点的 textContent 属性
    textUpdater: function(node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    },
    //更新节点的 innerHTML 属性
    htmlUpdater: function(node, value) {
        node.innerHTML = typeof value == 'undefined' ? '' : value;
    },
    //更新节点的 className 属性
    classUpdater: function(node, value, oldValue) {
        //静态class的值
        var className = node.className;
        // className = className.replace(oldValue, '').replace(/\s$/, '');

        // var space = className && String(value) ? ' ' : '';
        //将静态class属性的值与动态的class值进行结合后并设置为新的classname属性值
        node.className = className + (className? ' ' : '') + value;
    },
    //更新节点的 value 属性
    modelUpdater: function(node, value, oldValue) {
        node.value = typeof value == 'undefined' ? '' : value;
    }
};