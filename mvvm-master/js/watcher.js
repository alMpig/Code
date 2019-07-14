function Watcher(vm, expOrFn, cb) {
    this.cb = cb;//更新界面的回调
    this.vm = vm;
    this.expOrFn = expOrFn;//表达式
    this.depIds = {};//包含所有相关dep的容器对象

    if (typeof expOrFn === 'function') {
        this.getter = expOrFn;
    } else {
        this.getter = this.parseGetter(expOrFn.trim());
    }

    this.value = this.get();//得到表达式的初始值保存
}

Watcher.prototype = {
    update: function() {
        this.run();
    },
    run: function() {
        var value = this.get();
        var oldVal = this.value;
        if (value !== oldVal) {
            this.value = value;
            //调用回调函数更新界面
            this.cb.call(this.vm, value, oldVal);
        }
    },
    addDep: function(dep) {
        //判断dep与watcher的关系是否已经建立
        if (!this.depIds.hasOwnProperty(dep.id)) {
            //将watcher添加到de中  用于更新
            dep.addSub(this);
            //将dep添加到watcher中  用于防止重复建立关系
            this.depIds[dep.id] = dep;
        }
    },
    //得到表达式的值，建立dep与watcher的关系
    get: function() {
        //给dep指定当前的watcher
        Dep.target = this;
        //获取表达式的值，内部调用get建立dep与watcher的关系
        var value = this.getter.call(this.vm, this.vm);
        //去除dep中指定的当前watcher
        Dep.target = null;
        return value;
    },
    //得到表达式对应的值
    parseGetter: function(exp) {
        if (/[^\w.$]/.test(exp)) return; 

        var exps = exp.split('.');

        return function(obj) {
            for (var i = 0, len = exps.length; i < len; i++) {
                if (!obj) return;
                obj = obj[exps[i]];
            }
            return obj;
        }
    }
};