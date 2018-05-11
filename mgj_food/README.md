# 马管家版微信小程序

- AppID：wx38e6075b7760daa1
- AppSecret：5c8c212b7169608201515a0e04cf1368

## 项目结构

├── README.md
├── app.js  （小程序逻辑）
├── app.json  （小程序公共设置）
├── app.wxss  （小程序公共样式表）
├── components  （自定义组件，包括样式）
├── images  （图片资源）
├── jsconfig.json
├── pages  （业务页面）
└── utils  （工具类）

## 注意事项

- 微信小程序不是基于浏览器环境，服务端无法使用 session，因为没有 cookie，也没有传统的 window 和 document 等对象
- 兼容大部分 css 样式，页面布局推荐使用 *flex* 布局，公共样式中有提供一些基本类，了解更详细的用法，可参考 [Flex 布局教程](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)
- 微信提供了一系列基础组件，传统的 p，h1，h2，span 等标签统统不能用，用 view 和 text 替代
- 小程序对服务器配置有硬性要求，必须支持 HTTPS，且请求地址必须是事先在微信平台设置的域名，所以在开发时需要用 nginx 反向代理，并且修改本地 hosts 文件


