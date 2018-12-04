//引入模块
var cheerio = require('cheerio');
var request = require('sync-request');
var fs = require('fs');

//获取网页内容
url = "https://movie.douban.com/subject/26425063/?from=showing";  //豆瓣电影-无双
var html = '';
html = request('GET', url).getBody().toString();

//console.log(html);

handleDB(html);
//这里是同步获取，能够直接将获取的内容输出给变脸，简单方便
//但是缺点是，如果内容太多，速度将会很慢，而且也没有错误判断机制--异步在这方面就ok
function handleDB(html) {
    var $ = cheerio.load(html);

    //引入cheerio的方法。这样的引入方法可以很好的结合jQuery的用法(ps.jQuery我还刚学=^=)
    var info = $('#info');

    //获取电影名
    var movieName = $('#content>h1>span').filter(function (i, el) {
        return $(this).attr('property') === 'v:itemreviewed';
    }).text();
    //获取影片导演名
    var directories = '- 导演：' + $('#info span a').filter(function (i, el) {
        return $(this).attr('rel') === 'v:directedBy';
    }).text();
    //获取影片演员
    var starsName = '- 主演：';
    $('.actor .attrs a').each(function (i, elem) {
        starsName += $(this).text() + '/';
    });
    //获取片长
    var runTime = '- 片长：' + $('#info span').filter(function (i, el) {
        return $(this).attr('property') === 'v:runtime';
    }).text();
    //获取影片类型
    //同样是多个信息处理方式和演员不同
    var kind = $('#info span').filter(function (i, el) {
        return $(this).attr('property') === 'v:genre';
    }).text();
    //处理影片类型数据
    var kLength = kind.length;
    var kinds = '- 影片类型：';
    for (i = 0; i < kLength; i += 2) {
        kinds += kind.slice(i, i + 2) + '/';
    }
    //获取电影评分和电影评分人数
    //豆瓣
    var DBScore = $('.ll.rating_num').text();
    var DBVotes = $('a.rating_people>span').text().replace(/\B(?=(\d{3})+$)/g, ',');
    var DB = '- 豆瓣评分：' + DBScore + '/10' + '(' + 'form' + DBVotes + 'users' + ')';
    //IMDBLink
    IMDBLink = $('#info').children().last().prev().attr('href');

    var data = movieName + '\r\n' + directories + '\r\n' + starsName + '\r\n' + runTime + '\r\n' + kinds + '\r\n' + DB + '\r\n';
    //输出文件
    fs.appendFile('dbmovie.txt', data, 'utf-8', function (err) {
        if (err) throw err;
        else console.log('大体信息写入成功' + '\r\n' + data);
    });

    //用类似的方法再从IMDB获取评分和人数
    Link = request('GET', IMDBLink).getBody().toString();
    handleIMDB(Link);
}

function handleIMDB(Link) {
    var $ = cheerio.load(Link);
    // 获取IMDB评分
    var IMDBScore = $('.ratingValue strong span').filter(function (i, el) {
        return $(this).attr('itemprop') === 'ratingValue';
    }).text();
    // 获取IMDB评分人数
    var IMDBVotes = $('.small').filter(function (i, el) {
        return $(this).attr('itemprop') === 'ratingCount';
    }).text();
    // 字符串拼接
    var IMDB = '- IMDB评分：' + IMDBScore + '/10' + '(' + 'from' + IMDBVotes + 'users' + ')' + '\r\n';
    // 输出文件
    fs.appendFile('dbmovie.txt', IMDB, 'utf-8', function (err) {
        if (err) throw err;
        else console.log('IMDB信息写入成功' + '\r\n' + IMDB)
    });
}

//成功！！！