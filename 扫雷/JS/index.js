function Mine(tr, td, mineNum) {
    this.tr = tr; //行数
    this.td = td; //列数
    this.mineNum = mineNum; //雷的数量

    this.squares = []; //存储所有方块的信息，是一个二维数组，按行与列的顺序排放
    this.tds = []; //存储所有的单元格的DOM
    this.surplusMine = mineNum; //剩余雷的对象
    this.allRight = false; //右击标的小红旗是否全是雷
    this.parent = document.querySelector('.gameBox');
}

Mine.prototype.randoNum = function() { //得到随机数用于分配雷的位置
    var square = new Array(this.tr * this.td);
    for (var i = 0; i < square.length; i++) {
        square[i] = i;
    }
    square.sort(function() { return 0.5 - Math.random() });
    return square.slice(0, this.mineNum)
}
Mine.prototype.init = function() { //初始化游戏
    var rn = this.randoNum();
    var n = 0;
    for (var i = 0; i < this.tr; i++) {
        this.squares[i] = [];
        for (var j = 0; j < this.td; j++) {
            if (rn.indexOf(n++) != -1) {
                this.squares[i][j] = { type: "mine", x: j, y: i }
            } else {
                this.squares[i][j] = { type: "number", x: j, y: i, value: 0 }
            }

        }
    }
    this.parent.oncontextmenu = function() { //取消右键点击事件
        return false;

    }

    this.mineNumDom = document.querySelector(".mineNum");
    mine.surplusMine = mine.mineNum;
    this.mineNumDom.innerHTML = this.surplusMine;

    this.updataNum();
    this.createDom();



}

Mine.prototype.createDom = function() {
    var This = this;
    var table = document.createElement('table');
    for (var i = 0; i < this.tr; i++) {
        var domTr = document.createElement('tr');
        this.tds[i] = [];
        for (var j = 0; j < this.td; j++) {
            var domTd = document.createElement('td');
            domTd.pos = [i, j]; //存格子的行列到格子上
            domTd.onmousedown = function() {
                This.play(event, this);
            }
            this.tds[i][j] = domTd;
            // if (this.squares[i][j].type == "mine") {
            //     domTd.className = "mine";
            // }
            // if (this.squares[i][j].type == "number") {
            //     domTd.innerHTML = this.squares[i][j].value;
            // }

            domTr.appendChild(domTd);
        }
        table.appendChild(domTr);
    }
    this.parent.innerHTML = "";
    this.parent.appendChild(table);
}
Mine.prototype.getAround = function(square) { //得到一个格子四周格子的坐标
    var x = square.x;
    var y = square.y;
    var result = [];
    for (var i = x - 1; i <= x + 1; i++) {
        for (var j = y - 1; j <= y + 1; j++) {
            if (i < 0 || //超出左边范围
                j < 0 || //超出上边范围
                i > this.tr - 1 || //超出右边范围
                j > this.td - 1 || //超出下边范围
                (i == x && j == y) || //自己
                this.squares[j][i].type == "mine" //周围的格子是个类
            ) {
                continue; //跳出循环
            }
            result.push([j, i]);
        }
    }

    return result;
}
Mine.prototype.updataNum = function() { //更新value值（把雷四周格子的value值加一）
    for (var i = 0; i < this.tr; i++) {

        for (var j = 0; j < this.td; j++) {
            if (this.squares[i][j].type == "mine") {
                var num = this.getAround(this.squares[i][j]);
                for (var k = 0; k < num.length; k++) {
                    this.squares[num[k][0]][num[k][1]].value += 1;
                }
            }
        }

    }
}
Mine.prototype.play = function(ev, obj) {
    var This = this;
    if (ev.which == 1 && obj.className != "flag") { //标完红旗左键就不能点
        //点击的左键
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        var cl = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"]
        if (curSquare.type == "number") { //判断点击格子的type类型
            obj.innerHTML = curSquare.value;
            obj.className = cl[curSquare.value]
            if (curSquare.value == 0) {

                obj.innerHTML = "";

                function getAllZero(square) { //利用递归实现周围全是0的格子显现
                    var around = This.getAround(square);
                    for (var i = 0; i < around.length; i++) {
                        var x = around[i][0];
                        var y = around[i][1];
                        This.tds[x][y].className = cl[This.squares[x][y].value];
                        if (This.squares[x][y].value == 0) { //把中心点周围value值为0的格子，重新作为中心继续寻找value值为0的
                            if (!This.tds[x][y].check) { //给每一个找过的格子设置一个check属性，防止循环查找
                                This.tds[x][y].check = true;
                                getAllZero(This.squares[x][y]); //递归调用

                            }

                        } else {
                            This.tds[x][y].innerHTML = This.squares[x][y].value;
                        }
                    }
                }
                getAllZero(curSquare);
            }
        } else {
            this.gameOver(obj);

        }
    }
    if (ev.which == 3) { //鼠标右键标红旗
        if (obj.className && obj.className != "flag") {
            return;
        }
        obj.className = obj.className == "flag" ? "" : "flag"; //利用三目运算实现右键标红旗和取消红旗
        if (this.squares[obj.pos[0]][obj.pos[1]].type == "mine") {
            this.allRight = true; //判断红旗是否标在雷上
        } else {
            this.allRight = false;
        }
        if (obj.className == "flag") {
            this.mineNumDom.innerHTML = --this.surplusMine;
        } else {
            this.mineNumDom.innerHTML = ++this.surplusMine;
        }
        if (this.surplusMine == 0) {
            if (this.allRight) {
                alert("恭喜你，游戏通过");
            } else {
                alert("游戏失败");
                this.init();
            }
        }
    }
}
Mine.prototype.gameOver = function(clickTd) { //点击到雷了，游戏结束（失败），显示所有的雷
        for (var i = 0; i < this.tr; i++) {
            for (var j = 0; j < this.td; j++) {
                if (this.squares[i][j].type == "mine") {
                    this.tds[i][j].className = "mine";
                }
                this.tds[i][j].onmousedown = null;
            }
        }
        if (clickTd) {
            clickTd.style.backgroundColor = "#f00"; //把点到的那个雷格子背景色变红
        }
    }
    // var mine = new Mine(28, 28, 99);
    // mine.init();
var btns = document.querySelectorAll(".level button");
var mine = null;
var ln = 0;
var arr = [
    [9, 9, 10],
    [16, 16, 40],
    [28, 28, 99]
];
for (let i = 0; i < btns.length - 1; i++) {
    btns[i].onclick = function() {
        btns[ln].className = "";
        this.className = "active";
        mine = new Mine(...arr[i]);
        mine.init();
        ln = i;
    }
}
btns[0].onclick(); //初始化为9x9的格子，10个雷
btns[3].onclick = function() { //重新开始
    mine.init();

}