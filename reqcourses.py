#!/usr/bin/python

import sys, json

result = {'success':'true','message':'The Command Completed Successfully'};

myjson = json.load(sys.stdin)
# Do something with 'myjson' object

print 'Content-Type: application/json\n\n'
print json.dumps(result)    # or "json.dump(result, sys.stdout)"
