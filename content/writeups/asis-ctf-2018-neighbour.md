---
title: "ASIS CTF 2018 - Neighbour Writeup"
description: "효율적인 수학 계산으로 x^y 형태의 숫자 중 n에 가장 가까운 값 찾기"
date: 2018-05-01
tags: ["asis-ctf", "ppc", "math", "algorithm"]
ctf: "ASIS CTF 2018"
published: true
---

**[Preview]**


CTF 문제를 풀기 시작한 최근, 여러 분야의 문제들을 보고 있습니다. 이번에 도전해 본 분야는 PPC(Professional Programming Challenges)입니다. 문과출신의 저에게 약한 분야인 수학에 대한 내용이기에 지레 겁먹고 손대지 않았었지만 이번엔 왠지 할만하다는 느낌적인 느낌(?) 덕택에 도전하게 되었습니다. 포기하고 자려고 마음먹고 침대에 누운 순간 솔루션이 생각나서 그대로 밤을 샜던 좋은 경험(?)을 할 수 있었습니다 ㅋㅋ..


**[Summary]**


이번 문제는 엄청 큰 수 n보다 작으며 x**y를 만족하는 n에 가장 가까운 수 'r'을 찾아내는 문제였습니다. 문제풀이의 핵심은 시간 내에 효율적으로 계산이 되게끔 코드를 구성할 수 있는가 입니다. 저는 3가지 방법을 써서 코드의 효율성을 높일 수 있었습니다.


**1. n에 가장 가까운 2**y 에서 y를 구함**


**2. [1]번에서 구한 y값을 줄여나가며 'n - (x**y) < 0' 을 처음으로 만족하는 x값을 구함**


**3. [2]번에서 구한 'n - ((x-1)**y)' 값이 이전에 구한 최소값보다 작은지 비교**


**4. [2]번의 조건을 만족하기 위한 x의 증가폭을 처음에 크게 설정 후 증가폭을 조절**


**5. 수의 크기에 따라서 y가 2가 되는 순간까지 x값을 구하지 않고 중간에 포기하도록 함**


어찌보면 난잡할 수도 있지만 로그와 극한도 잘 모르는 저는 여러가지 시행착오 끝에 위와 같은 솔루션을 구할 수 있었습니다.


**[Code]**


```py
import socket
import hashlib

#read data - get hash_num
def read_hash():
 data=""
 data2=""
 while "[-6:] = " not in data:
 data += s.recv(1)
 data2=s.recv(6) #hash_num
 print data+data2
 return data2

#PoW
def do_PoW(hash_num):
 pow_result=""
 print ("[*] I'm doing PoW...")
 for i in xrange(1000000000):
 if hash_num in str(hashlib.sha256(str(i)).hexdigest())[-6:]:
 pow_result=str(i)
 break

 print "[!] pow result = %s" % pow_result

 s.send(pow_result+"\n")

 #read data - get big number
 data1=recvuntil("n = ")
 data2=recvuntil("To")
 data3=recvuntil(":)")
 s.recv(1)
 print data1+data2+data3

 return data2

#get y on 2**y
def get_num_x_2(a):
 for i in range(100, 1000000):
 if (a-(2**i)<0):
 print ("[*] start y - %s" % str(i-1))
 return i-1

#get x by decreasing y(get_num_x_2(a))
def get_num_y_2(num, num_cnt):
 x=3
 y=num
 yt=0
 tmp=a
 cnt=num_cnt
 tmp2=0
 while(1):
 if(a-(x**y)<0):
 #give-up point
 if(num>3000):
 if(y<17): 
 print ("[*] Gotya! %s" % str(tmp))
 return str(tmp)
 elif(num>2000):
 if(y<15):
 print ("[*] Gotya! %s" % str(tmp))
 return str(tmp)
 elif(num>1000):
 if(y<11):
 print ("[*] Gotya! %s" % str(tmp))
 return str(tmp)
 elif(num>700):
 if(y<8):
 print ("[*] Gotya! %s" % str(tmp))
 return str(tmp)
 else:
 if(y==2):
 print ("[*] Gotya! %s" % str(tmp))
 return str(tmp)

 #is smaller r?
 if(a-((x-1)**y)<tmp):
 #set increasing range of x
 if(y<=190 and cnt!=1):
 x-=cnt
 cnt = cnt/2
 continue
 tmp=a-((x-1)**y)
 y-=1
 yt=y
 cnt=num_cnt
 else:
 y-=1
 yt=y
 cnt=num_cnt
 else:
 #set increasing range of x
 if(y>190):
 x+=1
 elif(y<=190):
 x+=cnt

#check clear
def isNext():
 dt=""
 dt+=recvuntil("\x0a")
 if "next stage" in dt:
 data1=recvuntil("n = ")
 data2=recvuntil("To")
 data3=recvuntil(":)")
 s.recv(1)
 print data1+data2+data3
 return data2
 else:
 print dt
 while 1:
 print recvuntil("\x0a")

#custom recvuntil
def recvuntil(str):
 data=""
 while str not in data:
 data += s.recv(1)
 return data

######main######
num_y=0
num_cnt=2**250

s = socket.socket()
ip = '37.139.22.174'
port = 11740
s.connect((ip,port))

#pow
a=do_PoW(read_hash())
a=a[0:len(a)-3]
a=long(a)

#get r
while(1):
 num_y = get_num_x_2(a)
 result = get_num_y_2(num_y, num_cnt)

 print ("[!] r=\'%s\'" % str(result))

 s.send(result+"\n")

 a=isNext()
 a=a[0:len(a)-3]
 a=long(a)
```


**[그림 1] 문제 풀이 코드(Python)**


![image](/images/writeups/asis-ctf-2018-neighbour_e8093a42.png)


**[그림 2] 솔루션 실행 화면**