var request = require("request");
var cheerio = require("cheerio");

request('https://www.bing.com',function(err,result){
    if(err){
        console.log("请求错误："+err);
        return;
    }
    //console.log(result.body)
    var page=cheerio.load(result.body);
    console.log(page('title').text());
});