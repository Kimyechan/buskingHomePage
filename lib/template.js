module.exports = {
    loginForm: function (is_logined, name) {
        var login_form = ``;
        if (!is_logined) {
            login_form = `
            <form action="/login_process" method="POST" id="login">
                <div>
                    <div class="loginform"><label for="id">ID: </label><input type="text" 
                        name="id" required>
                    </div>
                    <div class="loginform"><label for="password">PW: </label><input type="password"
                        name="password" required>
                    </div>
                </div>
                <input type="submit" value="login">
            </form>
            `;
        } else {
            login_form = `
            <div>
                <div>
                    <span>${name}님</span><span><a href="/my_info">내 정보</a></span>
                </div>
                <div>
                    <span><a href="">MyPage</span><span><a href="/logout">logout</a></span>
                </div>
            </div>           
            `;
        }
        return login_form;
    },
    Main: function (cur, request, response, db, login_form, queryString) {
        //페이지당 게시물 수 : 한 페이지 당 10개 게시물
        var page_size = 2;
        //페이지의 갯수 : 1 ~ 10개 페이지
        var page_list_size = 2;
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
            var curPage = cur;

            console.log("현재 페이지 : " + curPage, "전체 페이지 : " + totalPageCount);


            //전체 페이지 갯수
            if (totalPageCount < 0) {
                totalPageCount = 0
            }

            var totalPage = Math.ceil(totalPageCount / page_size);// 전체 페이지수
            var totalSet = Math.ceil(totalPage / page_list_size); //전체 세트수
            var curSet = Math.ceil(curPage / page_list_size) // 현재 셋트 번호
            var startPage = ((curSet - 1) * 2) + 1 //현재 세트내 출력될 시작 페이지, 5=> page size
            var endPage = (startPage + page_list_size) - 1; //현재 세트내 출력될 마지막 페이지


            //현재페이지가 0 보다 작으면
            if (curPage < 0) {
                no = 0
            } else {
                //0보다 크면 limit 함수에 들어갈 첫번째 인자 값 구하기
                no = (curPage - 1) * 2 //5 => page size
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

            //var queryString = 'SELECT * FROM busking_info ORDER BY board_num ASC limit ?,?';
            db.query(queryString, [no, page_size], function (error, busking_info) {
                response.render('main', {
                    login_form: `${login_form}`,
                    busking_info: busking_info ? busking_info : {},
                    pasing: result2,
                    detail_board_num: `${request.params.board_num}`
                });
            })
        });
    },
    // Paging: function (cur, db) {
    //     //페이지당 게시물 수 : 한 페이지 당 10개 게시물
    //     var page_size = 2;
    //     //페이지의 갯수 : 1 ~ 10개 페이지
    //     var page_list_size = 2;
    //     //limit 변수
    //     var no = "";
    //     //전체 게시물의 숫자
    //     var totalPageCount = 0;
    //     var result2 = {};
    //     var queryString = 'select count(*) as cnt from busking_info'
    //     db.query(queryString, function (error2, data) {
    //         if (error2) {
    //             console.log(error2 + "메인 화면 mysql 조회 실패");
    //             return
    //         }
    //         //전체 게시물의 숫자
    //         totalPageCount = data[0].cnt

    //         //현제 페이지
    //         var curPage = cur;

    //         console.log("현재 페이지 : " + curPage, "전체 페이지 : " + totalPageCount);


    //         //전체 페이지 갯수
    //         if (totalPageCount < 0) {
    //             totalPageCount = 0
    //         }

    //         var totalPage = Math.ceil(totalPageCount / page_size);// 전체 페이지수
    //         var totalSet = Math.ceil(totalPage / page_list_size); //전체 세트수
    //         var curSet = Math.ceil(curPage / page_list_size) // 현재 셋트 번호
    //         var startPage = ((curSet - 1) * 2) + 1 //현재 세트내 출력될 시작 페이지, 5=> page size
    //         var endPage = (startPage + page_list_size) - 1; //현재 세트내 출력될 마지막 페이지


    //         //현재페이지가 0 보다 작으면
    //         if (curPage < 0) {
    //             no = 0
    //         } else {
    //             //0보다 크면 limit 함수에 들어갈 첫번째 인자 값 구하기
    //             no = (curPage - 1) * 2 //5 => page size
    //         }

    //         console.log('[0] curPage : ' + curPage + ' | [1] page_list_size : ' + page_list_size + ' | [2] page_size : ' + page_size + ' | [3] totalPage : ' + totalPage + ' | [4] totalSet : ' + totalSet + ' | [5] curSet : ' + curSet + ' | [6] startPage : ' + startPage + ' | [7] endPage : ' + endPage)

    //         result2 = {
    //             "curPage": curPage,
    //             "page_list_size": page_list_size,
    //             "page_size": page_size,
    //             "totalPage": totalPage,
    //             "totalSet": totalSet,
    //             "curSet": curSet,
    //             "startPage": startPage,
    //             "endPage": endPage
    //         };
    //     })
    //     var paging = {
    //         no : no,
    //         result2 : result2
    //     };
    //     console.log(paging);
    //     return paging;
    // },
    list: function (filelist) {
                var list = '<ul>';
                var i = 0;
                while (i < filelist.length) {
                    list = list + `<li><a href="/topic/${filelist[i]}">${filelist[i]}</a></li>`;
                    i = i + 1;
                }
                list = list + '</ul>';
                return list;
            }

}