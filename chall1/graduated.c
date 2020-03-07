//gcc graduated.c -o graduated -s -lseccomp

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <seccomp.h>

void filterSyscall(){
	scmp_filter_ctx ctx;
	ctx = seccomp_init(SCMP_ACT_KILL);

	seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(rt_sigreturn), 0);
  	seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(exit), 0);
  	seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(open), 0);
  	seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(openat), 0);
  	seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(read), 0);
  	seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(write), 0);
  	seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(close), 0);
  	seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(fstat), 0);
  	seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(exit_group), 0);

  	seccomp_load(ctx);
  	return;
}

int main (int argc, char** argv){
	char buffer[264];
	char *substr;
	int totCfu;
	int neededCfu;

	filterSyscall();
	printf("Hello, insert your code:\n");
	fgets(buffer,0x100,stdin);

	printf("Oh hello ");
	printf("%s", buffer);
	
	printf("Are you a bachelor (0) or a master (1) degree student?\n");
	scanf("%d", &totCfu);
	fgets(buffer,0x100,stdin);

	if (totCfu == 1)
		neededCfu = 120;
	else if(totCfu == 0)	
		neededCfu = 180;
	else
		neededCfu = 999;

	totCfu = 0xdeadbeaf;

	printf("Please insert your exams:\n");
	
	do {
		printf("exam name:");
		fgets(buffer,0x100,stdin);
		printf("Oh dear old... ");
		printf(buffer);
		printf("Really you passed it?!\n");
		substr = strstr(buffer, "end");
	} while ( !substr); 

	if(neededCfu == totCfu){
		printf("Congratulations you are graduated!!!\n");
		return 0;
	}
	
	printf("Oh really bad you have to study a little bit more!\n");
	exit(0);
	
}