var app = angular.module('courser', []);
app.controller('courseListCtrl', function($scope, courseListing, timeCalc) {
    $scope.loading = true;
    courseListing.getAllCourses().success(function(response) {
        $scope.courses = response.courses;
    }).finally(function() {
        $scope.loading = false;
        $scope.allLimitMax = $scope.courses.length;
    })

    $scope.departments = ["All","Anthropology", "Art", "Bio Engin Small Scale Tech", "Biological Sciences", "Bioengineering", "Chicano Chicana Studies", "Chemistry", "Chinese", "Cognitive Science", "Core", "Community Research and Service", "Computer Science & Engineering", "Economics", "Elect. Engr. & Comp. Sci.", "English", "Engineering", "Environmental Engineering", "Environmental Systems (GR)", "Earth Systems Science", "French", "Global Arts Studies Program", "History", "Interdisciplinary Humanities", "Japanese", "Mathematics", "Mechanical Engineering", "Management", "Materials Science & Engr", "Natural Sciences Education", "Nat Sciences Undergrad Studies", "Public Health", "Philosophy", "Physics", "Political Science", "Psychology", "Quantitative & Systems Biology", "Social Sciences", "Sociology", "Spanish", "Undergraduate Studies", "World Heritage", "Writing"];
    $scope.colorScheme = {
        eng: ["Bio Engin Small Scale Tech","Bioengineering","Computer Science & Engineering","Elect. Engr. & Comp. Sci.","Engineering","Environmental Engineering","Mechanical Engineering","Materials Science and Engr","Physics"], //red
        natsci: ["Biological Sciences","Chemistry","Environmental Systems (GR)","Earth Systems Science","Nat Sciences Undergrad Studies","Quantitative & Systems Biology", "Mathematics"], //yelow
        ssha: ["Anthropology","Art","Chicano Chicana Studies","Chinese","Cognitive Science","Core","Community Research and Service","Economics","English","French","Global Arts Studies Program","History","Interdisciplinary Humanities","Japanese","Management","Natural Sciences Education","Public Health"," Philosophy","Political Science","Psychology","Social Sciences","Sociology","Spanish","Undergraduate Studies","World Heritage","Writing"], //blue
    };
    
    if(localStorage.crns === undefined)
        localStorage.crns = ''
    $('#coursedump').val(localStorage.getItem("crns").trim());

    $scope.clearing = false;
    $scope.clear = function() {
        var beforestate = angular.copy($scope.scheduledCourses); //***
        $scope.actions.push({
            type: 'clear',
            sc: beforestate
        });

        $scope.clearing = true;
        while($scope.scheduledCourses.length > 0) {
            $scope.scheduledCourses.forEach(function(course) {
                $scope.unschedule(course.CRN);
            });
        }
        $scope.clearing = false;
    }

    $scope.undoing = false;
    $scope.undo = function(opts) {
        if($scope.actions[$scope.actions.length-1]['type'] == 'add') {
            $scope.undoing = true;
            $scope.unschedule($scope.actions[$scope.actions.length-1]['sc'].CRN);
            $scope.actions.splice(-1,1);
            $scope.undoing = false;
        }

        else if($scope.actions[$scope.actions.length-1]['type'] == 'remove') {
            $scope.undoing = true;
            $scope.schedule($scope.actions[$scope.actions.length-1]['sc']);
            $scope.actions.splice(-1,1);
            $scope.undoing = false;
        }

        else if($scope.actions[$scope.actions.length-1]['type'] == 'Add all') {
            $scope.undoing = true;
            for(crn in $scope.actions[$scope.actions.length-1]['sc']) {
                $scope.unschedule($scope.actions[$scope.actions.length-1]['sc'][crn]);
            }
            $scope.actions = [];
            $scope.undoing = false;
        }

        else if($scope.actions[$scope.actions.length-1]['type'] == 'clear'){
            $scope.undoing = true;
            for(course in $scope.actions[$scope.actions.length-1]['sc']) {
                //$scope.schedule($scope.actions[$scope.actions.length-1]['sc'][course]); BAD BECAUSE CAUSES SOME COURSES TO OVERLAP; DO THIS INSTEAD:
                $scope.schedule($scope.findCourse($scope.actions[$scope.actions.length-1]['sc'][course].CRN, $scope.courses)[0])
            }
            $scope.actions.splice(-1,1);
            $scope.undoing = false;
        }
        //remove duplicate actions, which tend to show up with 'remove' for some reason
        var count = 0;
        var i = 0;
        for(action in $scope.actions) {
            if(JSON.stringify($scope.actions[action]) === JSON.stringify($scope.actions[action])) {
                count++;
                i = action;
            }
        }
        if(count>1)
            $scope.actions.splice(i, 1);
            
    }

    $scope.undoHover = function(opts) {
        if($scope.actions[$scope.actions.length-1]['type'] == 'add') {
            $scope.actions[$scope.actions.length-1]['sc'];
        }

        else if($scope.actions[$scope.actions.length-1]['type'] == 'remove') {
            $scope.schedule($scope.actions[$scope.actions.length-1]['sc']);
        }

        else if($scope.actions[$scope.actions.length-1]['type'] == 'Add all') {
            for(crn in $scope.actions[$scope.actions.length-1]['sc']) {
                $scope.unschedule($scope.actions[$scope.actions.length-1]['sc'][crn]);
            }
        }

        else if($scope.actions[$scope.actions.length-1]['type'] == 'clear'){
            for(course in $scope.actions[$scope.actions.length-1]['sc']) {
                $scope.schedule($scope.actions[$scope.actions.length-1]['sc'][course]);
            }
        }
    }
    
    $scope.actions = [];
    $scope.scheduledCourses = [];
    $scope.overlaps = [];
    $scope.dupes = 0;
    $scope.parsing = false;
    $scope.parsedPrev = [];
     
    $scope.dupeWorker = function(CRN) {
        for(var i=1; i<$scope.dupes; i++) {
            var course = $scope.findCourse(CRN, $scope.courses)[i]
            if(course.actv != "EXAM")
                $scope.schedule(course);
        }
        $scope.dupes = 0;
    }
    
    $scope.parseDump = function() {
        
            $scope.$watch(function() { return $scope.loading; },
            function() {
                if(!$scope.loading)
                    parse();
            });
        
        
        function parse() {
            var parsed = [];

            $scope.parsing = true;

            var str = $("#coursedump").val();
            var re = /(\d{5})/g;
            var m; //= an array
            
            while((m = re.exec(str)) !== null) {
                if(m.index === re.lastIndex) {
                    re.lastIndex++;
                }
                $scope.schedule($scope.findCourse(m[1], $scope.courses)[0]);
                parsed.push(m[1]);
            }
            $scope.parsing = false;

            for(i in parsed) {
                if(parsed[i] == $scope.parsedPrev[i])
                    parsed.splice(i,1);
            }

            $scope.actions.push({
                type: 'Add all',
                sc: parsed
            });
            $scope.parsedPrev = parsed;

            
            if($scope.scheduledCourses.length > 0)
                $("#coursedump").val(localStorage.crns.trim());
        }
    }
    
    $scope.findCourse = function(CRN, arr) {
        arrs = [];
        for(i in arr) {
            if(CRN == arr[i].CRN)
                arrs.push(arr[i]);
        }
        return arrs;
    };
    
    $scope.checkOverlap = function(co1, co2) {
        if(co1.time == co2.time && co1.days == co2.days)
            return co1.days.split('');
        
        arr1 = timeCalc.main(co1, 2);
        arr2 = timeCalc.main(co2, 2);
        
        //Convert to military time:
        t1s = arr1[0]*100 + arr1[1];
        if(arr1[2] == 'p' && arr1[0] != 12) t1s+= 1200;
        t1e = arr1[3]*100 + arr1[4];
        if(arr1[5] == 'p' && arr1[3] != 12) t1e+= 1200;

        t2s = arr2[0]*100 + arr2[1];
        if(arr2[2] == 'p' && arr2[0] != 12) t2s+= 1200;
        t2e = arr2[3]*100 + arr2[4];
        if(arr2[5] == 'p' && arr2[3] != 12) t2e+= 1200;
        
        var daysSmaller;
        var daysBigger;
        if(co1.days.length > co2.days.length) {
            daysSmaller = co2.days;
            daysBigger = co1.days;
        }
        else {
            daysSmaller = co1.days;
            daysBigger = co2.days;
        }
        
        var overlappingDays = [];
        for(var i=0; i<daysSmaller.length; i++) {
            if(daysBigger.indexOf(daysSmaller.charAt(i)) > -1) {
                if(t1s <= t2e && t2s <= t1e){
                    overlappingDays.push(daysSmaller.charAt(i).toLowerCase());
                }
            }
        }
        return overlappingDays;
        
    }

    
    $scope.schedule = function(courseobj) {

        if($scope.undoing == false && $scope.parsing == false) {
            $scope.actions.push({
                type: 'add',
                sc: courseobj
            });
        }

        var eventSize = 150; //Size of event elements
        if(courseobj.days == " " || courseobj.time.indexOf('TBD') != -1) {
            console.log("Error: Course days/times TBD");
            return;
        }
        var numOverlaps = 1; //Can't divide by zero now can we
        var numOverlapsLive = 1;
        var margins = [];
        margins[0] = 10;
        var justAdded = [];
        var overlappingDays = [];
        var overlapShiftCSS = 'calc(' + eventSize/numOverlaps + 'px' + ' ' + ')';
        
        var title = "";

        if(courseobj.ctitle.indexOf('-') != -1) {
            title = courseobj.ctitle.substring(0,courseobj.ctitle.indexOf('-'));
            cinfo = courseobj.ctitle.substring(courseobj.ctitle.indexOf('-')+2);
            master = true;
        }
        else title = courseobj.ctitle;
        
        //Calculate total overlaps
        if($scope.scheduledCourses !== undefined || $scope.scheduledCourses !== null) {
            for(var i=0; i<$scope.findCourse(courseobj.CRN, $scope.scheduledCourses).length; i++) {
                if($scope.findCourse(courseobj.CRN, $scope.scheduledCourses)[i] == courseobj) {
                    return;
                }
            }
            //using the same for loop as the one below it; just need numOverlaps finalized before CSS startShiftCSS
            for(course in $scope.scheduledCourses) {
                //Check overlap between courseobj and every single scheduledCourses[0], [1], [2], [n]
                overlappingDays = $scope.checkOverlap(courseobj, $scope.scheduledCourses[course]);
                //Return a list of all of the courses that overlap with the course trying to be scheduled
                if(overlappingDays[0] !== undefined) {
                    numOverlaps++;
                    //OverlapTester:
                    //alert("numOverlaps: " + numOverlaps);
                    alert("WARNING: " + courseobj.cnum + " and " + $scope.scheduledCourses[course].cnum + " overlap!");
                    //console.log($scope.scheduledCourses[course].cnum + " matches added; **** overlappingDays = " + overlappingDays + "     *****")
                }
                
            }
        }

        //Inject html
        var daysstr = courseobj.days;
        var i = daysstr.length;
        var coursetag = timeCalc.main(courseobj, 0);
        
        //LIST
        var ctime = courseobj.time;
        var time = ctime.substring(0,ctime.length-1-1) + ' ' + ctime.substring(ctime.length-1-1,ctime.length-1) + '.m.';
        var liststr = '<div data-crn="' + courseobj.CRN + '" class="list"><span data-crn="' + courseobj.CRN + '" class="glyphicon glyphicon-remove-circle removebtn"></span><b>' + title + ': <br>' + courseobj.cnum + ' ' + courseobj.actv + ' </b>- ' + courseobj.CRN + '<br><small>' + time + ', ' + courseobj.days + '</small></div>';
        var $jQOL = $($.parseHTML(liststr));
        $("#clist").append($jQOL);
        $scope.cssColor(courseobj, $jQOL);
        
        //Click remove button--UNSCHEDULE
        $('.removebtn').click(function(e) {
            var crn = $(this).data("crn");
            //$(this).remove(); //remove the remove button itself
            $scope.unschedule(crn);
            e.stopPropagation();
        });
        
        //Loop for every course day i
        while(i--) {
            var coursestr = '<div ' + 'data-crn="' + courseobj.CRN + '" ' + 'data-added="true" ' + 'class="event">';
            coursestr = (coursestr+'<b>'+courseobj.cnum+' '+courseobj.actv+'</b> <small>'+time+' <sup>['+courseobj.CRN+']</sup></small>'+'</div>').replace("event",daysstr.charAt(i).toLowerCase());
            //console.log("Before CSS: " + coursestr)
            var $jQO = $($.parseHTML(coursestr));
            $(coursetag).append($jQO);
            
            var durationCSS = timeCalc.main(courseobj, 1) + 'px';
            var startShiftCSS = 'calc( -20px ' + '- 60px + ' + timeCalc.main(courseobj, 2)[1] + 'px' + ')';
            
            //Starting CSS for all courseobjs:
            $jQO.css({
                'width': '150px',
                'margin-top': startShiftCSS,
                'height': durationCSS,
                'margin-left': '10px',
                'color': 'white',
                'border-radius': '5px'
            });
            $scope.cssColor(courseobj, $jQO);

            justAdded.push($jQO);
            //OverlapTester:
            console.log("**ADDED.CSS: " + $jQO.prop('outerHTML'))
        }
        
        $scope.scheduledCourses.push(courseobj);
        
        //Check and modify around overlap
        if($scope.scheduledCourses[0] !== undefined) {
           for(course in $scope.scheduledCourses) {
               overlappingDays = $scope.checkOverlap(courseobj, $scope.scheduledCourses[course])
                //Check overlap between courseobj and every single scheduledCourses[0], [1], [2], [n]
                if(overlappingDays[0] !== undefined) {
                    numOverlapsLive++;
                    //don't have redundant $scope.overlaps members:
                    var unique = true;
                    for(var i=0; i<$scope.overlaps.length; i++) {
                        if($scope.overlaps[i]['obj'].CRN == courseobj.CRN){
                            unique = false;
                        }
                    }
                    if(unique)
                        $scope.overlaps.push({obj: courseobj, days: overlappingDays, num: numOverlaps, live: numOverlapsLive});
                    //For each overlapping element; iterates using the number of overlapping days in the overlapping scheduledCourses[course]:
                    for(var i=1; i<numOverlaps; i++) {
                        //i iterates through each individual day
                        //DAY SELECTOR TAKES CARE OF CASE WHEN ONLY A SUBSET OF DAYS OVERLAP BETWEEN DIFFERENT COURSES
                        //Modifying the MOST RECENT overlapping courseobj, THE LATEST ONE; the courseobj to be scheduled will go at the front margin 10px as always
                        margins[i] = (eventSize/(numOverlaps))*(numOverlapsLive-1) + 10; //godly line
                        for(var j=0; j<overlappingDays.length; j++) {
                            var str = '.' + overlappingDays[j].toLowerCase() + '[data-crn="' + $scope.scheduledCourses[course].CRN + '"]';
                            console.log(str)
                            console.log("$str: " + $(str).prop('outerHTML'))
                            var attr = $(str).attr("data-added");
                            if(attr && typeof attr !== typeof undefined && attr !== false) {
                                $(str).css({
                                    'width': eventSize/(numOverlaps) + 'px',
                                    'margin-left': '10px'
                                });
                            }
                            else {
                                $(str).css({
                                    'width': eventSize/(numOverlaps) + 'px',
                                    'margin-left': margins[i]
                                });
                            }
                            
                            //OverlapTester:
                            console.log("After CSS: " + $(str).prop('outerHTML'))
                        }
                    }
                    
                }
                //OverlapTester:
                console.log("numOverlapsLive: " + numOverlapsLive)
                //OverlapTester:
                console.log("margins[]: " + margins)
            }
        }
        $.each(justAdded, function(index, value){
            $(this).removeAttr("data-added");
        })
        if($scope.dupes == 0 && $scope.findCourse(courseobj.CRN, $scope.courses).length > 1) {
            $scope.dupes = $scope.findCourse(courseobj.CRN, $scope.courses).length;
            $scope.dupeWorker(courseobj.CRN);
        }
        $('.courserow[data-crn="' + courseobj.CRN + '"]').css({
            'background-color' : '#A29061',
            'color': 'white'
        });
        if(localStorage.crns.indexOf(courseobj.CRN) == -1) {
            localStorage.crns = (localStorage.crns + " " + courseobj.CRN).trim();
            if(localStorage.crns.indexOf('  ') > -1)
                localStorage.crns.replace('  ', ' ');
            $('#coursedump').val(localStorage.getItem("crns"));
        }
        //alert(JSON.stringify($scope.overlaps))
        //alert(localStorage.crns)
    }
    
    $scope.unschedule = function(crn) {
        if($scope.undoing == false && $scope.clearing == false) {
            $scope.$apply(function() {
                $scope.actions.push({
                    type: 'remove',
                    sc: $scope.findCourse(crn, $scope.courses)[0]
                });
            });
        }

        var courseobj = {};
        $('div[data-crn="' + crn + '"]').remove();
        $('.courserow[data-crn="' + crn + '"]').css({
            'background-color' : '',
            'color': ''
        });
        for(var i=0; i<$scope.scheduledCourses.length; i++) {
            if($scope.scheduledCourses[i].CRN == crn){
                courseobj = $scope.scheduledCourses[i];
                $scope.scheduledCourses.splice(i,1);
            }
        }
        localStorage.crns = localStorage.crns.replace(crn, '');
        var str = localStorage.crns;
        var re = /(\s{2,})/g;
        var result = str.replace(re, ' ');
        localStorage.crns = result;
        $('#coursedump').val(localStorage.getItem("crns").trim());
        
        //Readjust overlapping CSS
        var margins = [];
        var numOverlaps = 1;
        var numOverlapsLive = 1;
        margins[0] = 10;
        var eventSize = 150;
        var overlappingDays = [];
        
        for(course in $scope.scheduledCourses) {
            //Check overlap between courseobj and every single scheduledCourses[0], [1], [2], [n]
            overlappingDays = $scope.checkOverlap(courseobj, $scope.scheduledCourses[course]);
            //Return a list of all of the courses that overlap with the course trying to be scheduled
            if(overlappingDays[0] !== undefined) 
                numOverlaps++;
        }
        for(course in $scope.scheduledCourses) {
            //Return a list of all of the courses that overlap with the course trying to be scheduled
            if(overlappingDays[0] !== undefined) {
                numOverlapsLive++;
                for(var i=1; i<numOverlaps; i++) {
                    margins[i] = (eventSize*(numOverlaps))/(numOverlapsLive+1) - 90; //godly line
                    for(var j=0; j<overlappingDays.length; j++) {
                        //i iterates through each individual day
                        //DAY SELECTOR TAKES CARE OF CASE WHEN ONLY A SUBSET OF DAYS OVERLAP BETWEEN DIFFERENT COURSES
                        var str = '.' + overlappingDays[j].toLowerCase() + '[data-crn="' + $scope.scheduledCourses[course].CRN + '"]';
                        $(str).css({
                            'width': eventSize*(numOverlaps/(numOverlapsLive)) + 'px',
                            'margin-left': margins[i]
                        });
                        if(numOverlaps>=3) {
                            //alert(margins)
                            //alert(j)
                            $(str).css({
                                'width': eventSize/(numOverlaps-1) + 'px',
                                'margin-left': margins[i] + -14
                            });
                        }
                        
                    }
                }
            }
        }
        for(var i=0; i<$scope.overlaps.length; i++) {
            if($scope.overlaps[i]['obj'].CRN == crn){
                $scope.overlaps.splice(i,1);
            }
        }
        //alert(JSON.stringify($scope.overlaps))
        //$scope.verifyCorresp(courseobj);
    }            
    
    $scope.toggleSchedule = function(courseobj) {
        if($scope.findCourse(courseobj.CRN, $scope.scheduledCourses).length >= 1) {
            $scope.unschedule(courseobj.CRN)
        }
        else $scope.schedule(courseobj)
    }

    $scope.listColor = function(crn) {
        if($scope.findCourse(crn, $scope.scheduledCourses).length >= 1)
            return {
            'background-color' : '#A29061',
            'color': 'white'
            };
    }
    
    ////////////////////Filters:
    $scope.allLimit = 30;
    $scope.reachedEnd = false;
    $scope.filter = {
        litAll: false,
        closed: false,
        department: "All",
        incTBD: false
    }
    
    //Comparator:
    $scope.filterByDepartment = function(ac, ex) { //passed "expected" value from filter expression (in this case {department: filter['department']}),  actual value from the object in the array
    //in this case ac = filter['department'], a string
        if(ac === undefined || ex === undefined) {
            console.log("undefined")
            return false;
        }
        if(ex == ac.department || ex == "All")
            return true;
        return false;
    }
    //Expression:
    $scope.filterInClosed = function(course) { //passed value, index, and array
        if($scope.filter['closed'] == true && (course.seats_avail == "Closed" || Number(course.seats_avail) <= 0)) //True, include closed
            return course;
        else if($scope.filter['closed'] == false && (course.seats_avail == "Closed" || Number(course.seats_avail) <= 0)) //False, don't
            return;
        else return course;
    }
    //pseudo-limitTo filter expression:
    $scope.limitAll = function(course, index) {
        if(index == $scope.allLimitMax-1)
            $scope.reachedEnd = true;
        if($scope.filter['department'] == "All" && index < $scope.allLimit && !$scope.filter['litAll'])
            return course;
        else if($scope.filter['department'] != "All")
            return course;
        else if($scope.filter['litAll'])
            return course;
        else return;
    }
    //incTBD expression:
    $scope.filterInTBD = function(course) { //passed value, index, and array
        if($scope.filter['incTBD'] == true && (course.days == " " || course.time == "TBD-TBD")) 
            return course;
        else if($scope.filter['incTBD'] == true && (course.days != " " && course.time != "TBD-TBD"))
            return course;
        else if (!$scope.filter['incTBD'] && (course.days != " " && course.time != "TBD-TBD"))
            return course;
        else return;
    }
    
    $scope.cssColor = function(courseobj, $jQO) {
        if($scope.colorScheme['eng'].indexOf(courseobj.department) > -1) {
            var color = new KolorWheel([0, 67, 35]);
            color.l+= ($scope.colorScheme['eng'].indexOf(courseobj.department)*2.7);
            color.s+= ($scope.colorScheme['eng'].indexOf(courseobj.department)*3)
            color.h+= ($scope.colorScheme['eng'].indexOf(courseobj.department)*1.2)
            $jQO.css({
                'background-color': color.getHex(),
                'border-color': color.getHex(),
                'text-shadow': '0px 0px 3px ' + color.getHex()
            });
        }
        if($scope.colorScheme['natsci'].indexOf(courseobj.department) > -1) {
            var color = new KolorWheel([45, 67, 35]);
            color.l+= ($scope.colorScheme['natsci'].indexOf(courseobj.department)*2.7);
            color.s+= ($scope.colorScheme['natsci'].indexOf(courseobj.department)*3)
            color.h+= ($scope.colorScheme['natsci'].indexOf(courseobj.department)*1.2)
            $jQO.css({
                'background-color': color.getHex(),
                'border-color': color.getHex(),
                'text-shadow': '0px 0px 3px ' + color.getHex()
            });
        }
        if($scope.colorScheme['ssha'].indexOf(courseobj.department) > -1) {
            var color = new KolorWheel([220, 67, 35]);
            color.l+= ($scope.colorScheme['ssha'].indexOf(courseobj.department)*2.7);
            color.s+= ($scope.colorScheme['ssha'].indexOf(courseobj.department)*3)
            color.h+= ($scope.colorScheme['ssha'].indexOf(courseobj.department)*1.2)
            $jQO.css({
                'background-color': color.getHex(),
                'border-color': color.getHex(),
                'text-shadow': '0px 0px 3px ' + color.getHex()
            });
        }
    }

});
    
app.factory('courseListing', function($http) {
    return {
        getAllCourses: function() {
            var url = "http://ucm.karinaantonio.com" + "/courses.JSON";
            return $http.get(url);
        }
    };
});

app.factory('timeCalc', function() {

    return {
        main: function(courseobj, opt){
            var str = courseobj.time;
            
            var re_endMerid = /\d+:\d+-\d+:\d+([ap])m/;
            var endMerid = (function() {var m = re_endMerid.exec(str); re_endMerid.lastIndex++; return m[1];})();
            var startMerid = endMerid;
            
            var re_startTime = /(\d+:\d+)-\d+:\d+[ap]m/;
            var startTime = (function() {var m = re_startTime.exec(str); re_startTime.lastIndex++; return m[1];})();
            var startHour = Number(startTime.substring(0,startTime.indexOf(':')));
            var startMin = Number(startTime.substring(1+startTime.indexOf(':')));
            
            var re_endTime = /\d+:\d+-(\d+:\d+)[ap]m/;
            var endTime = (function() {var m = re_endTime.exec(str); re_endTime.lastIndex++; return m[1];})();
            var endHour = Number(endTime.substring(0,endTime.indexOf(':')));
            var endMin = Number(endTime.substring(1+endTime.indexOf(':')));

            var duration_min = 0;
            if(endMerid == 'p' && startHour > endHour && startHour < 12) {
                duration_min = ((12 - startHour) + endHour)*60 + (startMin - 60) + endMin;
                startMerid = 'a';
            }
            else if(startHour == 12) {
                temp = endHour + 12;
                duration_min = (temp - startHour)*60 + (endMin - startMin);
            }
            else {
                duration_min = (endHour - startHour)*60 + (endMin - startMin);
            }
            
            if(opt==0) {
                if(startHour < 11)
                    return "#" + String(startHour+1) + startMerid;
                else if(startHour == 11)
                    return "#12p";
                else if(startHour == 12)
                    return "#1p";
                else return "#" + String(startHour+1) + startMerid;
            }
            if(opt==1) {
                return duration_min;
            }
            else {
                return [startHour, startMin, startMerid, endHour, endMin, endMerid];
            }
        }
    };
}); 

app.filter('timeCorrect', function() {
   return function(time) {
       return time.substring(0,time.length-1-1) + ' ' + time.substring(time.length-1-1,time.length-1) + '.m.';
   } 
});

