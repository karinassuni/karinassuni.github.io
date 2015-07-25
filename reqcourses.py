return "hi"
import requests

URL = 'https://pbanssb.ucmerced.edu/pls/PROD/xhwschedule.P_ViewSchedule'

#Values for valid form submission to get to current schedule:
values = {}
values['validterm'] = 201530 #values[name] = value, e.g. <input name="validterm" value = "201530">
values['subjcode'] = 'ALL'
values['openclasses'] = 'N'

print '\nRequesting access to live schedule...'
r = requests.post(URL, data=values)

print '\nCopying html...'
html_f = open('C:/Users/Karlo Antonio/Documents/GitHub/karinassuni.github.io/__resources__/courses.html', 'w')
rtx = str(r.text)
html_f.write(rtx)
html_f.close()

import regexparser
print '\nStarting parse...'
regexparser.parse(html_f)
