var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');


// 기본 페이지 형식을 반환
// update는 기호에 따라 선택
function templateHTML(title, list, body, control) {
	return `
	<!doctype html>
	<html>
	<head>
		<title>WEB1 - ${title}</title>
		<meta charset="utf-8">
	</head>
	<body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    ${control}
    ${body}
  </body>
  </html>
  `;
}
function templateList(filelist) {
	var list = '<ul>';
	var i = 0;
	// 리스트 전부 넣기 (for 문으로 수정)
	for (i = 0; i < filelist.length; i++) {
		list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
	}
	list = list + '</ul>';
	return list;
}

var app = http.createServer(function (request, response) {
	var _url = request.url;
	// 세트 자료형으로 되있는 거 ex). {id="asdasd", asd="adasds"}
	var queryData = url.parse(_url, true).query;
	// 주소
	var pathname = url.parse(_url, true).pathname;
	if (pathname === '/') {
		// 메인화면이라면
		if (queryData.id === undefined) {
			// 폴더 읽기
			fs.readdir('./data', function (error, filelist) {
				// 받을게 없으니 여기서 지정
				var title = 'Welcome';
				var description = 'Hello, Node.js';
				// list 생성
				var list = templateList(filelist);
				// 내용 넣기
				var template = templateHTML(title, list,
					`<h2>${title}</h2>${description}`,
					`<a href="/create">create</a>`
				);
				response.writeHead(200);
				response.end(template);
			});
		} else {
			fs.readdir('./data', function (error, filelist) {
				fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
					// 받은 내용 집어넣기
					var title = queryData.id;
					var list = templateList(filelist);
					var template = templateHTML(title, list,
						`<h2>${title}</h2>${description}`,
						`<a href="/create">create</a> 
						<a href="/update?id=${title}">update</a> 
						<a href="/delete">delete</a>`
					);
					response.writeHead(200);
					response.end(template);
				});
			});
		}
		// 만들기 버튼이 눌려졌다면
	} else if (pathname === '/create') {
		// 파일 읽기
		fs.readdir('./data', function (error, filelist) {
			var title = 'WEB - create';
			var list = templateList(filelist);
			// 생성할 수 있는 템플릿 (post형식으로 id 넘김)
			var template = templateHTML(title, list, `
			<form action="/create_process" method="post">
				<p><input type="text" name="title" placeholder="title"></p>
				<p>
				<textarea name="description" placeholder="description"></textarea>
				</p>
				<p>
				<input type="submit">
				</p>
			</form>
        `, '');
			response.writeHead(200);
			response.end(template);
		});
	// 입력 받았다면
	} else if (pathname === '/create_process') {
		var body = '';
		// 콜백함수 인자를 통해 data를 받음
		// 한번에 받으면 프로그램이 꺼질 수 있어서 하나씩 받음
		// 그러기 위해 대입이 아닌 +를 씀
		request.on('data', function (data) {
			body = body + data;
		});
		request.on('end', function () {
			// body의 set 형식을 불러옴
			var post = qs.parse(body);
			var title = post.title;
			var description = post.description;
			fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
				response.writeHead(302, { Location: `/?id=${title}` });
				response.end();
			})
		});
		// 업데이트를 누르면
	} else if (pathname === '/update') {
		fs.readdir('./data', function (error, filelist) {
			fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
				// 파일에 각 데이터를 불러옴
				var title = queryData.id;
				var list = templateList(filelist);
				// 이미 있는 값을 집어넣음
				// 업데이트 전과 후의 파일을 구분하기 위해 in를 받음
				var template = templateHTML(title, list,
					`
					<form action="/update_process" method="post">
					<input type="hidden" name="id" value="${title}">
					<p><input type="text" name="title" placeholder="title" value="${title}"></p>
					<p>
						<textarea name="description" placeholder="description">${description}</textarea>
					</p>
					<p>
						<input type="submit">
					</p>
					</form>
					`,
					`<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
				);
				response.writeHead(200);
				response.end(template);
			});
		});
	} else if (pathname === '/update_process') {
		var body = '';
		// 콜백함수 인자를 통해 data를 받음
		// 한번에 받으면 프로그램이 꺼질 수 있어서 하나씩 받음
		// 그러기 위해 대입이 아닌 +를 씀


		request.on('data', function (data) {
			body = body + data;
		});
		request.on('end', function () {
			// body의 set 형식을 불러옴
			var post = qs.parse(body);
			var id = post.id
			var title = post.title;
			var description = post.description;
			fs.rename(`data/${id}`, `data/${title}`, function name(error) {
				fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
					response.writeHead(302, { Location: `/?id=${title}` });
					response.end();
				})
			})
		});
	} // 할일 : delete 구현
	else if(pathname === '/delete'){

	}else {
		response.writeHead(404);
		response.end('Not found');
	}
});
app.listen(3000);