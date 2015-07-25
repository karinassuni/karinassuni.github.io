import re
import collections
import json

def parse(courses_html):

    print "\nOpening %r..." % str(courses_html)
    r = open('C:/Users/Karlo Antonio/Documents/GitHub/karinassuni.github.io/__resources__/courses.html') #gotta live with it
    print r
    result_read = r.read()

    p1 = re.compile(ur'.*<small>(.*)(?:<\/small>)?<\/t.>', re.MULTILINE | re.IGNORECASE)
    subst1 = ur"\1"
    result2 = re.sub(p1, subst1, result_read)

    p2 = re.compile(ur'(<TD CLASS="dddefault">&nbsp;</TD>)', re.MULTILINE | re.IGNORECASE)
    result3 = re.sub(p2, '&nbsp;', result2)

    p3 = re.compile(ur'<a href="xhwschedule.*>(\d{5})<\/a>', re.MULTILINE | re.IGNORECASE)
    subst3 = ur"\1"
    result4 = re.sub(p3, subst3, result3)

    result5 = result4.partition('<H2>Class Schedule for Fall Semester 2015</H2>\nNOTE: Schedule Subject to Change')[2].partition('<TABLE  CLASS="plaintable" SUMMARY="This is table displays line separator at end of the page."')[0]

    fileout = open('C:/Users/Karlo Antonio/Documents/GitHub/karinassuni.github.io/__resources__/parseout.txt', 'w')
    fileout.write(result5)
    fileout.close()
    r.close()

    listholder = []
    subject = ''
    try:
        with open('parseout.txt','r') as f:
            while True:
                line = f.next()
                if '<H3>' in line:
                    subject = line[4:line.find('</H3>')]
                if '<TR' in line:
                    list_ = [subject,]
                    for i in range(0,13):
                        line = f.next()
                        line = line.rstrip()
                        list_.append(line)
                    if 'CRN' in list_[1]:
                        del list_[:]
                        continue
                    listholder.append(list_)
    except(StopIteration):
        pass
            
    print '\n' + str(listholder[0]) + '\n' + str(listholder[1]) + '\n'

    #####
    from itertools import tee, islice, chain, izip

    def previous_and_next(some_iterable):
        prevs, items, nexts = tee(some_iterable, 3)
        prevs = chain([None], prevs)
        nexts = chain(islice(nexts, 1, None), [None])
        return izip(prevs, items, nexts)
        
    for previous, item, nxt in previous_and_next(listholder):
        if '&nbsp;' in item[1]:
            item.insert(1,previous[1]);
            item[2] = previous[2];
            item[3] = previous[3];
            item[4] = previous[4];
            item[8] = previous[8];
            item[10] = previous[10];
            item[11] = previous[11];
            item[12] = previous[12];
            item[13] = previous[13];
            
    #####
    jslist = collections.OrderedDict()
    jslistholder = []
    cases = ['department','CRN','cnum','ctitle','units','actv','days','time','loc','term','instructor','max_enrl','act_enrl','seats_avail']

    ilistholder = iter(listholder)
    try:
        while True: 
            list_ = ilistholder.next()
            jslist = collections.OrderedDict(zip(cases, list_))
            jslistholder.append(jslist)
    except(StopIteration):
        pass    
        
    jsonarray = json.dumps(jslistholder)

    listout = open('C:/Users/Karlo Antonio/Documents/GitHub/karinassuni.github.io/__resources__/courses.JSON', 'w')
    listfinal = {"courses":jsonarray}
    listout.write(str(listfinal).replace("'[{","[{").replace("}]'","}]").replace("'",'"').replace('<br />','--').replace('</SMALL>',''))
    listout.close()
    print '\n\n>>>DONE PARSING AND CONVERTING TO JSON!'
    print '\n>>>Final file: courses.JSON    ;    Intermediate file: parseout.txt    ;    Extracted HTML: courses.html'