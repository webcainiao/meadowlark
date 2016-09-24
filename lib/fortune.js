// 在关于页面发送‘虚拟幸运月饼’
var fortunes = [
		"Conquer your fears or they will conquer you.",
		"Rivers need springs.",
		"Do not fear what you don't know.",
		"You will have a pleasant surprise.",
		"Whenever possible, keep it simple.",
];
// 将此文件在模块外可见
exports.getFortune = function(){
	var idx = Math.floor(Math.random()*fortunes.length);
	return fortunes[idx];
}