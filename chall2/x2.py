import requests


HOST = "https://act-chall2.herokuapp.com"
#HOST = "http://10.0.2.2:8080"
flag_url = "%s/flag" % HOST


secret_cookie = "70337336763979244226452948404D635166546A576E5A7234743777217A25432A462D4A614E645267556B58703273357638782F413F4428472B4B6250655368566D597133743677397A244226452948404D635166546A576E5A7234753778214125442A462D4A614E645267556B58703273357638792F423F4528482B4B62501579978411999"

	
def getFlag(cookie):
	cookie = 'access_cookie=%s' % (cookie)
	headers = {'Cookie': cookie}
	r= requests.get(flag_url,headers = headers)
	print(r.text)
	
getFlag(secret_cookie)