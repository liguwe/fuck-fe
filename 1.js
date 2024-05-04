/**
 * 模拟异步请求
 * @param {*} id 标识符
 * @param {*} delay 延迟时间
 */
const mockRequest = (id, delay) => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(`完成请求 ${id}`);
            resolve(`响应 ${id}`);
        }, delay);
    });
};

/**
 * 批量执行请求，控制最大并发数
 * @param {Array} tasks 任务数组
 * @param {number} maxConcurrency 最大并发数
 */
async function runBatchRequests(tasks, maxConcurrency) {
    let i = 0; // 当前处理的任务索引
    const total = tasks.length;
    const executing = new Set(); // 正在执行的任务集合

    // 下一个任务 , 递归调用
    const next = () => {
        // 所有任务已经启动
        if (i === total) {
            return Promise.resolve();
        }
        const task = tasks[i++](); // 获取任务并执行
        executing.add(task);

        const clean = () => executing.delete(task);
        task.then(clean).catch(clean);

        let p = Promise.resolve();

        if (executing.size >= maxConcurrency) {
            // 达到最大并发数，等待任意任务完成
            p = Promise.race(executing).then(() => next());
        } else {
            // 未达到最大并发数，直接启动下一个任务
            p = next();
        }
        return p;
    };

    await next().then(() => Promise.all(executing)); // 确保所有任务都完成了
}

// 示例使用
const awaitList = [1000, 500, 1000, 300, 800, 700, 900];
const tasks = awaitList.map((item, index) => () => mockRequest(index + 1, item));

runBatchRequests(tasks, 10).then(() => console.log('所有请求完成'));
