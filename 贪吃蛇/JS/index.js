var sw = 20,
    sh = 20,
    tr = 30,
    td = 30;
var snake = null;
var food = null;
var game = null;

function Square(x, y, classname) {
    this.x = x * sw;
    this.y = y * sh;
    this.class = classname;
    this.viewContent = document.createElement("div"); //创建div
    this.viewContent.className = this.class;
    this.parent = document.getElementById("snakeWrap"); //方块的父级
}
Square.prototype.create = function() { //创建方块的方法
    this.viewContent.style.width = sw + "px";
    this.viewContent.style.height = sh + "px";
    this.viewContent.style.left = this.x + "px";
    this.viewContent.style.top = this.y + "px";
    this.parent.appendChild(this.viewContent);
};
Square.prototype.remove = function() { //移除方块
    this.parent.removeChild(this.viewContent);
};

function Snake() {
    this.head = null; //蛇头的信息
    this.tail = null; //蛇尾的信息
    this.pos = []; //蛇的位置
    this.directionNum = { //蛇运动的方向
        left: {
            x: -1,
            y: 0,
            rotate: 180 //transform的旋转角度，使蛇头的方向始终位前进的方向
        },
        right: {
            x: 1,
            y: 0,
            rotate: 0
        },
        up: {
            x: 0,
            y: -1,
            rotate: -90
        },
        down: {
            x: 0,
            y: 1,
            rotate: 90
        }

    }
}
Snake.prototype.init = function() { //初始化一条蛇
    //蛇头
    var snakeHead = new Square(2, 0, "snakeHead");
    snakeHead.create();
    this.head = snakeHead;
    this.pos.push([2, 0]);
    //蛇身体
    var snakeBody1 = new Square(1, 0, "snakeBody");
    snakeBody1.create();
    this.pos.push([1, 0]);
    //蛇尾
    var snakeBody2 = new Square(0, 0, "snakeBody");
    snakeBody2.create();
    this.tail = snakeBody2;
    this.pos.push([0, 0]);
    //形成链表
    snakeHead.last = null;
    snakeHead.next = snakeBody1;
    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;
    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    //给蛇设置一个默认前进方向
    this.direction = this.directionNum.right;
};
Snake.prototype.getNextPos = function() {
    var nextPos = [ //下一个位置
            this.head.x / sw + this.direction.x,
            this.head.y / sh + this.direction.y
        ]
        //撞到自己
    var selfCollied = false;
    this.pos.forEach(function(item) {
        if (item[0] == nextPos[0] && item[1] == nextPos[1]) { //判断是否下一个位置是否是自己身体
            selfCollied = true;
        }
    })
    if (selfCollied) {
        this.strategies.die.call(this);
        return;
    }
    //撞到墙
    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > tr - 1 || nextPos[1] > td - 1) {

        this.strategies.die.call(this);
        return;
    }
    //遇到食物，吃
    if (food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) {
        this.strategies.eat.call(this); //调用吃方法，身体加一
        createFood(); //吃一次食物，食物重新出现一个位置
        game.score++; //每吃一次得分加一
        return;
    }

    //什么都没有，继续移动
    this.strategies.move.call(this);
};
Snake.prototype.strategies = {
    move: function(format) {
        //生成一个新身体在旧蛇头位置
        var newBody = new Square(this.head.x / sw, this.head.y / sh, "snakeBody");
        newBody.next = this.head.next;
        newBody.next.last = newBody;
        newBody.last = null;
        this.head.remove();
        newBody.create();
        //创建一个新蛇头
        var newHead = new Square(this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y, "snakeHead");
        newHead.viewContent.style.transform = "rotate(" + this.direction.rotate + "deg)"
        newHead.last = null;
        newHead.next = newBody;
        newBody.last = newHead;
        newHead.create();
        this.pos.splice(0, 0, [this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y]);
        this.head = newHead;
        if (!format) {
            this.tail.remove();
            this.tail = this.tail.last;
            this.pos.pop();
        }

    },
    eat: function() { //吃方法
        this.strategies.move.call(this, true);
    },
    die: function() {
        game.over();
    }


}
snake = new Snake();



function createFood() { //创建一个食物（苹果）
    var x = null;
    var y = null;
    var include = true;
    while (include) {
        x = Math.round(Math.random() * (tr - 1));
        y = Math.round(Math.random() * (td - 1));
        snake.pos.forEach(function(item) {
            if (x != item[0] && y != item[1]) {
                include = false;
            }
        })
    }
    food = new Square(x, y, "food");
    food.pos = [x, y];
    var foodDom = document.querySelector(".food");
    if (foodDom) { //判断苹果是否存在，如果在重新给left,top赋值，不存在随机创建一个苹果
        foodDom.style.left = x * sw + "px";
        foodDom.style.top = y * sh + "px";
    } else {
        food.create();
    }

}


function Game() {
    this.timer = null;
    this.score = 0;
}

Game.prototype.init = function() {
    snake.init();
    createFood();
    document.onkeydown = function(e) { //根据键盘的方向键控制蛇前进的方向
        if (e.which == 37 && snake.direction != snake.directionNum.right) {
            snake.direction = snake.directionNum.left;
        } else if (e.which == 38 & snake.direction != snake.directionNum.down) {
            snake.direction = snake.directionNum.up;
        } else if (e.which == 39 && snake.direction != snake.directionNum.left) {
            snake.direction = snake.directionNum.right;
        } else if (e.which == 40 && snake.direction != snake.directionNum.up) {
            snake.direction = snake.directionNum.down;
        }
    }
    this.start();
}
Game.prototype.start = function() { //开始游戏
    this.timer = setInterval(function() {
        snake.getNextPos();
    }, 200)


};
Game.prototype.over = function() { //游戏结束显示得分，并重置游戏
    clearInterval(this.timer);
    alert("得分位： " + this.score);
    var snakeWrap = document.getElementById("snakeWrap");
    snakeWrap.innerHTML = "";
    snake = new Snake();
    game = new Game();
    var startBtn = document.querySelector(".startBtn");
    startBtn.style.display = "block";
};
Game.prototype.pause = function() { //暂停游戏
    clearInterval(this.timer);
}
game = new Game();


var startBtn = document.querySelector(".startBtn button");
startBtn.onclick = function() {
    startBtn.parentNode.style.display = "none";
    game.init();
}
var snakeWrap = document.getElementById("snakeWrap");
var pauseBtn = document.querySelector(".pauseBtn button");
snakeWrap.onclick = function() {
    game.pause();
    pauseBtn.parentNode.style.display = "block";

}
pauseBtn.onclick = function() {
    pauseBtn.parentNode.style.display = "none";
    game.start();
}