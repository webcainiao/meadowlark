var express = require('express');
// 引入关于页面的模块
var fortune = require('./lib/fortune.js');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var credentials = require('./credentials.js');
var app = express();
// 设置handlebars视图引擎
var handlebars = require('express3-handlebars').create({
					defaultLayout:'main',
					helpers:{
						section:function(name,options){
							if (!this._sections) {
								this._sections = {};
							}
							this._sections[name] = options.fn(this);
							return null;
						}
					}
				});//默认布局
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');


app.set('port',process.env.PORT || 3000);

// 在所有路由之前添加中间件
app.use(express.static(__dirname + '/public'));
// 用一些中间件来检测查询字符串中的test=1
app.use(function(req,res,next){
	res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
	next();
});
// 创建中间件给res.locals.partials对象添加数据
app.use(function(req,res,next){
	if (!res.locals.partials) {
		res.locals.partials = {};
	}
	res.locals.partials.weather = getWeatherData();
	next();
})
// body-parser,解析URL编码体
// app.use(require('body-parser')());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// 添加首页和关于页面的路由
app.get('/',function(req,res){
	res.render('home');
})
app.get('/about',function(req,res){
	// 随机发送幸运月饼
	res.render('about',{
		fortune:fortune.getFortune()
	});
});
// 添加获取请求头信息的路由
app.get('/headers',function(req,res){
	res.set('Content-Type','text/plain');
	var s = '';
	for(var name in req.headers){
		s += name + ':' + req.headers[name] + '\n';
	}
	res.send(s);
})
// 将上下文传递给视图，包括查询字符串，cookie,session值
app.get('/greeting',function(req,res){
	res.render('about',{
		message:'welcome',
		style:req.query.style,
		userid:req.cookie,
		username:req.session
	});
})
// 下面的layout没有布局文件，即views/no-layout.handlebars必须包含必要的html
app.get('/no-layout',function(req,res){
	res.render('no-layout',{layout:null});
})
// 使用布局文件views/layouts/custom.handlebars
app.get('/custom-layout',function(req,res){
	// 1./views/custom-layout.handlebars 2./views/layouts/custom.handlebars
	// 下边代码，在访问localhost:3000/custom-layout时，会渲染成/views/layouts/custom.handlebars
	res.render('custom-layout',{layout:'custom'});
})
// jquery-test
app.get('/jquery-test', function(req, res){
	res.render('jquery-test');
});
// 针对nursery rhyme 和 Ajax调用的路由处理程序
app.get('/nursery-rhyme',function(req,res){
	res.render('nursery-rhyme');
});
app.get('/data/nursery-rhyme',function(req,res){
	res.json({
		animal:'squirrel',
		bodyPart:'tail',
		adjective:'bushy',
		noun:'heck'
	});
});
// newsletter
app.get('/newsletter',function(req,res){
	res.render('newsletter',{csrf:'CSRF token goes here'});
});
// thank-you
app.get('/thank-you',function(req,res){
	res.render('thank-you');
});
app.post('/process',function(req,res){
	// console.log('Form (from querystring): ' + req.query.form);
	// console.log('CSRF token (from hidden form field): ' + req.body._csrf);
	// console.log('Name (from visible form field): ' + req.body.name);
	// console.log('Email (from visible form field): ' + req.body.email);
	if (req.xhr || req.accepts('json,html') === 'json') {
		// 如果发生错误，应该发送{error:'error description'}
		res.send({success:true});
	} else {
		// 如果发生错误，应该重定向到错误页面
		res.redirect(303,'/thank-you');
	}
})
// vacation-photo
app.get('/contest/vacation-photo',function(req,res){
	var now = new Date();
	res.render('contest/vacation-photo',{
		year:now.getFullYear(),
		month:now.getMonth()
	})
});
app.post('/contest/vacation-photo/:year/:month',function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){
		if (err) {
			return res.redirect(303,'/error');
		}
		console.log('received fields:');
		console.log(fields);
		console.log('received files:');
		console.log(files);
		res.redirect(303,'/thank-you');
	})
})
// 404 catch-all处理器(中间件),路由后面
app.use(function(req,res,next){
	res.status(404);
	res.render('404');
})
// 500错误处理器(中间件)，路由后面
app.use(function(err,req,res,next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
})

app.listen(app.get('port'),function(){
	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-c to terminate.');
});

// 在应用程序文件中，创建一个方法获取当前天气数据
function getWeatherData(){
	return {
		locations:[
			{
				name: 'Portland',
				forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
				weather: 'Overcast',
				temp: '54.1 F (12.3 C)'
			},
			{
				name: 'Bend',
				forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
				weather: 'Partly Cloudy',
				temp: '55.0 F (12.8 C)'
			},
			{
				name: 'Manzanita',
				forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
				weather: 'Light Rain',
				temp: '55.0 F (12.8 C)'
			}
		]
	};
}