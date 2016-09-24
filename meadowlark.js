var express = require('express');
// 引入关于页面的模块
var fortune = require('./lib/fortune.js');
var app = express();
// 设置handlebars视图引擎
var handlebars = require('express3-handlebars').create({defaultLayout:'main'});//默认布局
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');


app.set('port',process.env.PORT || 3000);

// 在所有路由之前添加中间件
app.use(express.static(__dirname + '/public'));
// 添加首页和关于页面的路由
app.get('/',function(req,res){
	res.render('home');
})
app.get('/about',function(req,res){
	// 随机发送幸运月饼
	res.render('about',{fortune:fortune.getFortune()});
})

// 404 catch-all处理器(中间件)
app.use(function(req,res,next){
	res.status(404);
	res.render('404');
})
// 500错误处理器(中间件)
app.use(function(err,req,res,next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
})

app.listen(app.get('port'),function(){
	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-c to terminate.');
});