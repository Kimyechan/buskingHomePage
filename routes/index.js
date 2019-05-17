var express = require('express');
var router = express.Router();
var fs = require('fs');
var template = require('../lib/template');
var db = require('../lib/db');

router.get('/', function (request, response) {
    var login_form = ``;
    login_form = template.loginForm(request.session.is_logined, request.session.name);

    template.Main(1, request, response, db, login_form, 'SELECT * FROM busking_info ORDER BY board_num ASC limit ?,?');

    // db.query(`SELECT * FROM busking_info`, function (error, busking_info) {
    //     var queryString = 'select * from products order by id desc limit ?,?';
    //     db.query(queryString, [no, page_size], function (error, result) {
    //         response.render('main', {
    //             login_form: `${login_form}`,
    //             busking_info: busking_info ? busking_info : {},
    //             data: result,
    //             pasing: result2
    //         });
    //     })
    // })
    // var paging = template.Paging(1, db);
    // console.log(paging);

    // var queryString = 'SELECT * FROM busking_info ORDER BY board_num ASC limit ?,?';
    // db.query(queryString, [no, page_size], function (error, busking_info) {
    //     response.render('main', {
    //         login_form: `${login_form}`,
    //         busking_info: busking_info ? busking_info : {},
    //         pasing: result2,
    //         detail_board_num: `${request.params.board_num}`
    //     });
    // })
});

router.get('/pasing/:cur', function (request, response) {
    var login_form = ``;
    login_form = template.loginForm(request.session.is_logined, request.session.name);

    template.Main(request.params.cur, request, response, db, login_form, 'SELECT * FROM busking_info ORDER BY board_num ASC limit ?,?');
})

router.get('/signUp', function (request, response) {
    response.render('signUp.html')
})

router.post('/signUp_process', function (request, response) {
    var post = request.body;

    db.query('INSERT INTO signUp VALUES (?, ?, ?, ?, ?, ?)',
        [post.id, post.password, post.name, post.birthday, post.sex, post.email], function (error, result) {
            if (error) {
                throw (error);
            } else {
                response.redirect('/');
            }
        });
});

router.post('/login_process', function (request, response) {
    var post = request.body;
    db.query(`SELECT * FROM signUp`, function (error, login) {
        var count = 0;

        while (count < login.length) {
            if (login[count].id === post.id && login[count].password === post.password) {
                request.session.is_logined = true;
                request.session.name = login[count].name;
                break;
            }
            count++;
        }
        request.session.save(function () {
            response.redirect('/');
        })
    });
})

router.get('/logout', function (request, response) {
    request.session.destroy(function (err) {
        response.redirect('/');
    });
});

router.get('/my_info', function (request, response) {
    db.query(`SELECT * FROM signUp WHERE name=?`, [request.session.name], function (err, info) {
        response.render('my_info', {
            id: `${info[0].id}`,
            password: `${info[0].password}`,
            name: `${info[0].name}`,
            date: `${info[0].date}`,
            sex: `${info[0].sex}`,
            email: `${info[0].email}`
        });
    });
});

router.get('/write_live_create', function (request, response) {
    if (!request.session.is_logined) {
        response.redirect('/');
    }
    response.render('write_live_create.html');
});

//image upload 모듈및 방법들
var multer = require('multer'); // multer모듈 적용 (for 파일업로드)
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
    }//,
    //   filename: function (req, file, cb) {
    //     cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
    //   }
})
var upload = multer({ storage: storage })

router.post('/write_live_create_process', upload.single('image'), function (request, response) {
    var post = request.body;
    var imageFile = request.file;
    var board_num = 1;

    console.log(imageFile);
    db.query(`SELECT * FROM busking_info ORDER BY board_num DESC`, function (error, info) {

        if (info[0] !== undefined) {
            board_num = info[0].board_num + 1;
        }

        db.query(`INSERT INTO busking_info VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [request.session.name, board_num, imageFile.filename, post.singer, post.main_song, post.song_list, post.genre, post.start, post.end,
            post.location, post.location_detail, post.youtube_link], function (error, info) {
                if (error) {
                    throw (error);
                } else {
                    response.redirect('/');
                }
            }
        )
    })
})

//img src="" => 경로설정
router.get('/images/:image_name', function (request, response) {
    fs.readFile(`/images/${request.params.image_name}`, function (error, data) {
        response.send(data);
    })
});

router.get('/show_detail/:board_num', function (request, response) {
    var login_form = ``;
    login_form = template.loginForm(request.session.is_logined, request.session.name);
    // console.log(Math.ceil(request.params.board_num / 10));
    var cur = Math.ceil(request.params.board_num / 2);
    template.Main(cur, request, response, db, login_form, 'SELECT * FROM busking_info ORDER BY board_num ASC limit ?,?');
    // db.query(`SELECT * FROM busking_info`, function (error, busking_info) {
    //     response.render('main', {
    //         login_form: `${login_form}`,
    //         busking_info: busking_info ? busking_info : {},
    //         detail_board_num: `${request.params.board_num}`
    //     });
    // })
})

router.get('/my_write_live', function (request, response) {
    var login_form = ``;
    login_form = template.loginForm(request.session.is_logined, request.session.name);
    
    db.query(`SELECT * FROM busking_info WHERE user_name=?`, [request.session.name], function (error, busking_info) {
        response.render('main', {
            login_form: `${login_form}`,
            busking_info: busking_info ? busking_info : {},
            detail_singer: `${request.params.singer}`,
            my_board_view: true
        });
    })
})

router.get('/update_board/:board_num', function (request, response) {
    db.query(`SELECT * FROM busking_info WHERE board_num=?`, [request.params.board_num], function (error, busking_info) {
        response.render('write_live_update.html', {
            image: busking_info[0].image,
            singer: busking_info[0].singer,
            song: busking_info[0].song,
            song_list: busking_info[0].song_list,
            genre: busking_info[0].genre,
            start_time: busking_info[0].date_start,
            end_time: busking_info[0].date_end,
            location: busking_info[0].location,
            location_detail: busking_info[0].location_detail,
            youtube_link: busking_info[0].youtube_link,
            busking_info: busking_info ? busking_info : {}
        })
    })
})

router.post('/write_live_update_process', upload.single('image'), function (request, response) {
    var post = request.body;
    var imageFile = request.file;
    console.log(post.singer);
    console.log(imageFile);
    db.query(`UPDATE busking_info SET image=?, singer=?, song=?, song_list=?, genre=?, date_start=?,
        date_end=?, location=?, location_detail=?, youtube_link=? WHERE board_num=?`
        , [imageFile.filename, post.singer, post.song, post.song_list, post.genre, post.start,
        post.end, post.location, post.location_detail, post.youtube_link, post.board_num],
        function (error, result) {
            if (error)
                throw (error);
        }
    );
    request.session.save(function () {
        response.redirect('/');
    })
})

router.get('/delete_board_process/:board_num', function (request, response) {
    db.query(`DELETE FROM busking_info WHERE board_num=?`, [request.params.board_num], function (error, result) {
        response.redirect('/');
    })
})

router.post('/find_live_process', function (request, response) {
    var post = request.body;
    console.log(post.location);
    console.log(post.genre);
    if (post.location === '장소' && post.genre === '장르') {
        response.redirect('/');
    } else if (post.location === '장소' && post.genre !== '장르') {
        var login_form = ``;
        login_form = template.loginForm(request.session.is_logined, request.session.name);

        db.query('SELECT * FROM busking_info WHERE genre=?', [post.genre], function (error, busking_info) {
            response.render('main', {
                login_form: `${login_form}`,
                busking_info: busking_info ? busking_info : {}
            });
        })
    } else if (post.location !== '장소' && post.genre === '장르') {
        var login_form = ``;
        login_form = template.loginForm(request.session.is_logined, request.session.name);

        db.query('SELECT * FROM busking_info WHERE location=?', [post.location], function (error, busking_info) {
            response.render('main', {
                login_form: `${login_form}`,
                busking_info: busking_info ? busking_info : {}
            });
        })
    } else if (post.location !== '장소' && post.genre !== '장르') {
        var login_form = ``;
        login_form = template.loginForm(request.session.is_logined, request.session.name);

        db.query('SELECT * FROM busking_info WHERE location=? AND genre=?', [post.location, post.genre], function (error, busking_info) {
            response.render('main', {
                login_form: `${login_form}`,
                busking_info: busking_info ? busking_info : {}
            });
        })
    }
})

router.get("/pasing/:cur", function (req, res) {

    //페이지당 게시물 수 : 한 페이지 당 10개 게시물
    var page_size = 10;
    //페이지의 갯수 : 1 ~ 10개 페이지
    var page_list_size = 10;
    //limit 변수
    var no = "";
    //전체 게시물의 숫자
    var totalPageCount = 0;

    var queryString = 'select count(*) as cnt from busking_info'
    db.query(queryString, function (error2, data) {
        if (error2) {
            console.log(error2 + "메인 화면 mysql 조회 실패");
            return
        }
        //전체 게시물의 숫자
        totalPageCount = data[0].cnt

        //현제 페이지
        var curPage = req.params.cur;

        console.log("현재 페이지 : " + curPage, "전체 페이지 : " + totalPageCount);


        //전체 페이지 갯수
        if (totalPageCount < 0) {
            totalPageCount = 0
        }

        var totalPage = Math.ceil(totalPageCount / page_size);// 전체 페이지수
        var totalSet = Math.ceil(totalPage / page_list_size); //전체 세트수
        var curSet = Math.ceil(curPage / page_list_size) // 현재 셋트 번호
        var startPage = ((curSet - 1) * 10) + 1 //현재 세트내 출력될 시작 페이지
        var endPage = (startPage + page_list_size) - 1; //현재 세트내 출력될 마지막 페이지


        //현재페이지가 0 보다 작으면
        if (curPage < 0) {
            no = 0
        } else {
            //0보다 크면 limit 함수에 들어갈 첫번째 인자 값 구하기
            no = (curPage - 1) * 10
        }

        console.log('[0] curPage : ' + curPage + ' | [1] page_list_size : ' + page_list_size + ' | [2] page_size : ' + page_size + ' | [3] totalPage : ' + totalPage + ' | [4] totalSet : ' + totalSet + ' | [5] curSet : ' + curSet + ' | [6] startPage : ' + startPage + ' | [7] endPage : ' + endPage)

        var result2 = {
            "curPage": curPage,
            "page_list_size": page_list_size,
            "page_size": page_size,
            "totalPage": totalPage,
            "totalSet": totalSet,
            "curSet": curSet,
            "startPage": startPage,
            "endPage": endPage
        };

        var queryString = 'select * from busking_info order by id desc limit ?,?';
        db.query(queryString, [no, page_size], function (error, result) {
            if (error) {
                console.log("페이징 에러" + error);
                return
            }
            res.render('main', {
                data: result,
                pasing: result2
            })
        });
    })
})



module.exports = router;