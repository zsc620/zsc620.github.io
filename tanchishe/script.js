// 游戏配置常量
const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREASE = 5;

// 获取DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const finalScoreElement = document.getElementById('finalScore');
const startButton = document.getElementById('startBtn');
const pauseButton = document.getElementById('pauseBtn');
const resetButton = document.getElementById('resetBtn');
const restartButton = document.getElementById('restartBtn');
const gameOverElement = document.getElementById('gameOver');
const upButton = document.getElementById('upBtn');
const downButton = document.getElementById('downBtn');
const leftButton = document.getElementById('leftBtn');
const rightButton = document.getElementById('rightBtn');

// 游戏状态变量
let snake = [];
let food = {};
let direction = '';
let nextDirection = '';
let score = 0;
let highScore = 0;
let gameInterval = null;
let gameSpeed = INITIAL_SPEED;
let isPaused = false;
let isGameOver = false;
let isGameStarted = false;

// 初始化游戏
function initGame() {
    // 重置游戏状态
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    gameSpeed = INITIAL_SPEED;
    isPaused = false;
    isGameOver = false;
    isGameStarted = false;
    
    // 更新UI
    updateScore();
    generateFood();
    drawGame();
    
    // 隐藏游戏结束界面
    gameOverElement.style.display = 'none';
}

// 生成食物
function generateFood() {
    // 确保食物不会生成在蛇身上
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / GRID_SIZE)),
            y: Math.floor(Math.random() * (canvas.height / GRID_SIZE))
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    food = newFood;
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#3498db' : '#2980b9';
        ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        
        // 添加蛇的边框
        ctx.strokeStyle = '#1f6dad';
        ctx.lineWidth = 1;
        ctx.strokeRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        
        // 绘制蛇头的眼睛
        if (index === 0) {
            ctx.fillStyle = 'white';
            if (direction === 'right' || nextDirection === 'right') {
                ctx.fillRect(segment.x * GRID_SIZE + 12, segment.y * GRID_SIZE + 5, 3, 3);
                ctx.fillRect(segment.x * GRID_SIZE + 12, segment.y * GRID_SIZE + 12, 3, 3);
            } else if (direction === 'left' || nextDirection === 'left') {
                ctx.fillRect(segment.x * GRID_SIZE + 5, segment.y * GRID_SIZE + 5, 3, 3);
                ctx.fillRect(segment.x * GRID_SIZE + 5, segment.y * GRID_SIZE + 12, 3, 3);
            } else if (direction === 'up' || nextDirection === 'up') {
                ctx.fillRect(segment.x * GRID_SIZE + 5, segment.y * GRID_SIZE + 5, 3, 3);
                ctx.fillRect(segment.x * GRID_SIZE + 12, segment.y * GRID_SIZE + 5, 3, 3);
            } else if (direction === 'down' || nextDirection === 'down') {
                ctx.fillRect(segment.x * GRID_SIZE + 5, segment.y * GRID_SIZE + 12, 3, 3);
                ctx.fillRect(segment.x * GRID_SIZE + 12, segment.y * GRID_SIZE + 12, 3, 3);
            }
        }
    });
    
    // 绘制食物
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 绘制网格（可选）
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvas.width; i += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    
    // 如果游戏未开始，显示提示信息
    if (!isGameStarted && !isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('按开始按钮开始游戏', canvas.width / 2, canvas.height / 2 - 5);
        ctx.font = '14px Arial';
        ctx.fillText('使用方向键或屏幕按钮控制', canvas.width / 2, canvas.height / 2 + 15);
    }
    
    // 如果游戏暂停，显示暂停信息
    if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏暂停', canvas.width / 2, canvas.height / 2 + 10);
    }
}

// 移动蛇
function moveSnake() {
    if (isPaused || !isGameStarted || isGameOver) return;
    
    // 更新方向
    direction = nextDirection;
    
    // 获取蛇头位置
    const head = { ...snake[0] };
    
    // 根据方向移动蛇头
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // 检查碰撞
    if (checkCollision(head)) {
        gameOver();
        return;
    }
    
    // 添加新的头部
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        updateScore();
        
        // 生成新食物
        generateFood();
        
        // 增加游戏速度
        if (gameSpeed > 50) {
            gameSpeed -= SPEED_INCREASE;
            restartGameLoop();
        }
    } else {
        // 如果没有吃到食物，移除尾部
        snake.pop();
    }
    
    // 绘制游戏
    drawGame();
}

// 检查碰撞
function checkCollision(head) {
    // 检查边界碰撞
    if (head.x < 0 || head.x >= canvas.width / GRID_SIZE || 
        head.y < 0 || head.y >= canvas.height / GRID_SIZE) {
        return true;
    }
    
    // 检查自身碰撞
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }
    
    return false;
}

// 更新分数
function updateScore() {
    scoreElement.textContent = score;
    
    // 更新最高分
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    isGameStarted = false;
    clearInterval(gameInterval);
    
    // 更新最终分数
    finalScoreElement.textContent = score;
    
    // 显示游戏结束界面
    gameOverElement.style.display = 'flex';
}

// 开始游戏
function startGame() {
    if (isGameStarted) return;
    
    isGameStarted = true;
    isPaused = false;
    
    // 启动游戏循环
    restartGameLoop();
}

// 暂停/继续游戏
function pauseGame() {
    if (!isGameStarted || isGameOver) return;
    
    isPaused = !isPaused;
    
    if (isPaused) {
        clearInterval(gameInterval);
        pauseButton.textContent = '继续';
        drawGame(); // 重新绘制以显示暂停信息
    } else {
        restartGameLoop();
        pauseButton.textContent = '暂停';
    }
}

// 重置游戏
function resetGame() {
    clearInterval(gameInterval);
    initGame();
    pauseButton.textContent = '暂停';
}

// 重新启动游戏循环
function restartGameLoop() {
    clearInterval(gameInterval);
    gameInterval = setInterval(moveSnake, gameSpeed);
}

// 设置游戏控制
function setupControls() {
    // 键盘控制
    document.addEventListener('keydown', (event) => {
        // 防止方向键滚动页面
        if ([37, 38, 39, 40].includes(event.keyCode)) {
            event.preventDefault();
        }
        
        switch (event.keyCode) {
            case 38: // 上
                if (direction !== 'down') {
                    nextDirection = 'up';
                }
                if (!isGameStarted) {
                    startGame();
                }
                break;
            case 40: // 下
                if (direction !== 'up') {
                    nextDirection = 'down';
                }
                if (!isGameStarted) {
                    startGame();
                }
                break;
            case 37: // 左
                if (direction !== 'right') {
                    nextDirection = 'left';
                }
                if (!isGameStarted) {
                    startGame();
                }
                break;
            case 39: // 右
                if (direction !== 'left') {
                    nextDirection = 'right';
                }
                if (!isGameStarted) {
                    startGame();
                }
                break;
            case 32: // 空格（暂停/继续）
                event.preventDefault();
                if (isGameStarted && !isGameOver) {
                    pauseGame();
                }
                break;
            case 13: // 回车（开始/重新开始）
                if (!isGameStarted && !isGameOver) {
                    startGame();
                } else if (isGameOver) {
                    resetGame();
                    startGame();
                }
                break;
        }
    });
    
    // 按钮控制
    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', pauseGame);
    resetButton.addEventListener('click', resetGame);
    restartButton.addEventListener('click', () => {
        resetGame();
        startGame();
    });
    
    // 移动设备控制按钮
    upButton.addEventListener('click', () => {
        if (direction !== 'down') {
            nextDirection = 'up';
        }
        if (!isGameStarted) {
            startGame();
        }
    });
    
    downButton.addEventListener('click', () => {
        if (direction !== 'up') {
            nextDirection = 'down';
        }
        if (!isGameStarted) {
            startGame();
        }
    });
    
    leftButton.addEventListener('click', () => {
        if (direction !== 'right') {
            nextDirection = 'left';
        }
        if (!isGameStarted) {
            startGame();
        }
    });
    
    rightButton.addEventListener('click', () => {
        if (direction !== 'left') {
            nextDirection = 'right';
        }
        if (!isGameStarted) {
            startGame();
        }
    });
    
    // 触摸滑动控制（移动设备）
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault(); // 防止页面滚动
    });
    
    canvas.addEventListener('touchend', (e) => {
        if (!isGameStarted) {
            startGame();
            return;
        }
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        
        // 判断滑动方向
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // 水平滑动
            if (diffX > 0 && direction !== 'left') {
                nextDirection = 'right';
            } else if (diffX < 0 && direction !== 'right') {
                nextDirection = 'left';
            }
        } else {
            // 垂直滑动
            if (diffY > 0 && direction !== 'up') {
                nextDirection = 'down';
            } else if (diffY < 0 && direction !== 'down') {
                nextDirection = 'up';
            }
        }
        
        e.preventDefault();
    });
}

// 加载最高分
function loadHighScore() {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
        highScore = parseInt(savedHighScore);
        highScoreElement.textContent = highScore;
    }
}

// 主函数
function main() {
    // 确保画布尺寸正确
    canvas.width = 400;
    canvas.height = 400;
    
    // 加载最高分
    loadHighScore();
    
    // 初始化游戏
    initGame();
    
    // 设置控制
    setupControls();
}

// 当页面加载完成后启动游戏
window.addEventListener('DOMContentLoaded', main);