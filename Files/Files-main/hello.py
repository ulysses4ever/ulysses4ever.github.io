#!/usr/bin/python import os,sys 
print "Content-Type: text/html" 
print 
print "<html><head><title>Environment test</title></head><body><pre>" 
for k,v in os.environ.items(): 
    print k, "::", 
    if len(v)<=40: print v 
    else:          print v[:37]+"..." 
print "&lt;STDIN&gt; ::", sys.stdin.read() 
print "</pre></body></html>" 
