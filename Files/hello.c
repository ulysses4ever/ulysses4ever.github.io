#include <stdlib.h>
#include <stdio.h>

void main(argc,argv,env) {
    char *s=getenv("QUERY_STRING");
    printf("Hello, %s\n ", s);
    return 0;
}