
[Koa2文档](https://koa.bootcss.com/#introduction)
```
安装koa2生成器
1. 准备工作
一定要全局安装(koa1.2和koa2都己经支持)
npm install koa-generator -g 
koa1.2 生成一个test项目,切到test目录并下载依赖 
koa test && cd test && npm install
koa2 生成一个test项目,切到test目录并下载依赖 
koa2 test && cd test && npm install

运行
npm start
访问 http://localhost:3000 就可以看到项目效果
```
const Koa = require('koa');
const app = new Koa();

app.use(async ctx => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```
//获取koa2,post请求的json数据
ctx.request.body
//获取get请求数据
ctx.url
ctx.request
request.query  //获取格式化好的数据
request.querystring  //获取原始请求字符串
//获取当前时间戳
date = Date.now()
```

```

```
