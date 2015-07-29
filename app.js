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
    //object assigning all departments to school, for color determination
    $scope.colorScheme = {
        eng: ["Bio Engin Small Scale Tech","Bioengineering","Computer Science & Engineering","Elect. Engr. & Comp. Sci.","Engineering","Environmental Engineering","Mechanical Engineering","Materials Science and Engr","Physics"], //red
        natsci: ["Biological Sciences","Chemistry","Environmental Systems (GR)","Earth Systems Science","Nat Sciences Undergrad Studies","Quantitative & Systems Biology", "Mathematics"], //yelow
        ssha: ["Anthropology","Art","Chicano Chicana Studies","Chinese","Cognitive Science","Core","Community Research and Service","Economics","English","French","Global Arts Studies Program","History","Interdisciplinary Humanities","Japanese","Management","Natural Sciences Education","Public Health"," Philosophy","Political Science","Psychology","Social Sciences","Sociology","Spanish","Undergraduate Studies","World Heritage","Writing"], //blue
    };

    var lessinfo = false;
    $('#moreinfobutton').click(function() {
            $('#moreinfo').toggle();
            lessinfo = !lessinfo;
            if(lessinfo)
                $('#moreinfobutton').contents().last()[0].textContent='Less info'
            else
                $('#moreinfobutton').contents().last()[0].textContent='More info'
        });

    //Responsive CSS, according to screen size
    function adjustStyle(width) {
        width = parseInt(width);
        if(width < 1365 && width > 900) {
            $('#mon').contents().last()[0].textContent='M';
            $('#tues').contents().last()[0].textContent='T';
            $('#wed').contents().last()[0].textContent='W';
            $('#thur').contents().last()[0].textContent='R';
            $('#fri').contents().last()[0].textContent='F';
            $('#moreinfo').toggle(false); //hide #moreinfo
            $('#moreinfobutton').toggle(true); //show #moreinfobutton
            lessinfo = false; //reset more/less info state
            $('#moreinfobutton').contents().last()[0].textContent='More info' //reset more/less info state
            $('#coursedumpholder').removeClass('container');
        }
        else if(width < 900) {
            $("#phone-stylesheet").attr("href", "phone.css");
            $('#coursedumpholder').addClass('container');
        }   
        else {
            $('#mon').contents().last()[0].textContent='Monday';
            $('#tues').contents().last()[0].textContent='Tuesday';
            $('#wed').contents().last()[0].textContent='Wednesday';
            $('#thur').contents().last()[0].textContent='Thursday';
            $('#fri').contents().last()[0].textContent='Friday';
            $('#moreinfo').toggle(true); //show #moreinfo
            $('#moreinfobutton').toggle(false) //hide #moreinfobutton
            $('#coursedumpholder').removeClass('container');
            $("#wide-stylesheet").attr("href", "wide.css"); 
        }
    }

    $(function() {
      adjustStyle($(this).width());
      $(window).resize(function() {
        adjustStyle($(this).width());
      });
    });
    
    //Manage localStorage and textarea, so the former is never null so it can be concatenated to
    if(localStorage.crns === undefined)
        localStorage.crns = ''
    $('#coursedump').val(localStorage.getItem("crns").trim());

    //for undoing
    $scope.clearing = false;

    //clear entire schedule -- **add CSS red border over all courses**
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

    //undo action: clear, add, delete (and parse???)
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
            $scope.actions.splice(-1,1);
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

    //hover preview of what elements will be removed
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
    
    //core global variables
    $scope.actions = [];
    $scope.scheduledCourses = [];
    $scope.overlaps = [];
    $scope.dupes = 0;
    $scope.parsing = false;
     
    //manage cases where one CRN has two different day/time slots, see schedule()
    $scope.dupeWorker = function(CRN) {
        for(var i=1; i<$scope.dupes; i++) {
            var course = $scope.findCourse(CRN, $scope.courses)[i]
            if(course.actv != "EXAM")
                $scope.schedule(course);
        }
        $scope.dupes = 0;
    }
    
    //schedule all CRNS in textarea
    $scope.parseDump = function() {
        
            $scope.$watch(function() { return $scope.loading; },
            function() {
                if(!$scope.loading)
                    parse();
            });
        
        
        function parse() {

            $scope.parsing = true;

            var str = $("#coursedump").val();
            var re = /(\d{5})/g;
            var m; //= an array
            
            while((m = re.exec(str)) !== null) {
                if(m.index === re.lastIndex) {
                    re.lastIndex++;
                }
                $scope.schedule($scope.findCourse(m[1], $scope.courses)[0]);
            }
            $scope.parsing = false;

            $scope.actions.push({
                type: ' ',
                sc: {}
            });

            
            if($scope.scheduledCourses.length > 0)
                $("#coursedump").val(localStorage.crns.trim());
        }
    }
    
    //find course in, mostly, scheduledCourses
    $scope.findCourse = function(CRN, arr) {
        arrs = [];
        for(i in arr) {
            if(CRN == arr[i].CRN)
                arrs.push(arr[i]);
        }
        return arrs;
    };
    
    //manage overlapping classes
        $scope.masterOverlap = [[],[],[],[],[]];
        // = [[[{}]],[[{}]],[[{}]],[[{}]],[[{}]]]; 
        // $scope.masterOverlap[0] == classesToday [{obj: courseobj, startTime: ts, endTime: te}]
          //each obj corresponds to one day of the week 's class_
          //has to store every scheduled course JIC it gets an overlap
    
    //Check for and modify around overlap
    function adjustOverlapCSS() {
        //$scope.masterOverlap[day] == [[{class_ object}],[{}],...] == classesToday
        //$scope.masterOverlap[day][classGroup] == [{class_ object}] == classGroup
        //$scope.masterOverlap[day][classGroup][class_] == {class_ object}
        var eventSize = 12.4; //Size of event elements, in %
        //interate through classes per each day of the week
        for(var day=0; day<5; day++) {
            for(var classGroup=0; classGroup<$scope.masterOverlap[day].length; /*iterate over array classGroup*/ classGroup++) {
                var numOverlaps = $scope.masterOverlap[day][classGroup].length;

                for(var class_=0; class_<$scope.masterOverlap[day][classGroup].length; class_++) {

                    var Class = $scope.masterOverlap[day][classGroup][class_];

                    //prevent class from matching overllap with itself

                    var dayClass;

                    switch(day) {
                        case 0: dayClass = '.m'; break;
                        case 1: dayClass = '.t'; break;
                        case 2: dayClass = '.w'; break;
                        case 3: dayClass = '.r'; break;
                        case 4: dayClass = '.f'; break;
                    }

                    var classStr = dayClass + '[data-crn="' + Class.CRN + '"]';

                    $(classStr).css({
                        'width': eventSize/(numOverlaps) + '%',
                        'margin-left': 'calc(' + eventSize/(numOverlaps)*(class_) + '% + 10px)'
                        // class_ represents the index of the class within the classGroup
                    });
                    
                }   
                
            }
        }
    }

    //manage the overlappingCourses data model
    $scope.scheduleMaster = function(courseobj) {


        function convertTimes(courseobj) {
            arr = timeCalc.main(courseobj, 2);
            
            //Convert to military time:
            ts = arr[0]*100 + arr[1];
            if(arr[2] == 'p' && arr[0] != 12) ts+= 1200;
            te = arr[3]*100 + arr[4];
            if(arr[5] == 'p' && arr[3] != 12) te+= 1200;

            return [ts, te];
        }

        //if there are no classGroups on any of the days that courseobj is scheduled for, make one of your own classGroups; masterOverlap will contain nothing otherwise
        for(var day=0; day<courseobj.days.length; day++) {
            var dayIndex;
            switch(courseobj.days.charAt(day)) {
                case 'M': dayIndex = 0; break;
                case 'T': dayIndex = 1; break;
                case 'W': dayIndex = 2; break;
                case 'R': dayIndex = 3; break;
                case 'F': dayIndex = 4; break;
            }
            if($scope.masterOverlap[dayIndex].length == 0)
                $scope.masterOverlap[dayIndex].splice(0, 0, [courseobj]);
        }

        //if a course otherCourse in scheduledCourses also falls on the same day, and their times overlap:
            //1) create a new classGroup for BOTH courseobj and otherCourse and put the classGroup inside the appropriate day in masterOverlap OR 2) if otherCourse is already inside of a classGroup, add courseobj into THAT classGroup rather than create a new one
            // AND 3) if courseobj overlaps with more than one otherCourse, do either of the above FOR EACH other overlapping course

        //check every scheduledCourse for overlap
        var otherCourses = $scope.scheduledCourses;
        
        //finding other overlappingCourses:
        for(var day=0; day<courseobj.days.length; day++) {
            var overlappingCourses = []; //== overlappingCourses TODAY ***
            for(var course=0; course<otherCourses.length; course++) {
                var dayIndex;
                switch(courseobj.days.charAt(day)) {
                    case 'M': dayIndex = 0; break;
                    case 'T': dayIndex = 1; break;
                    case 'W': dayIndex = 2; break;
                    case 'R': dayIndex = 3; break;
                    case 'F': dayIndex = 4; break;
                }

                //FOR EACH DAY THAT COURSEOBJ FALLS ON, check if otherCourse also falls on that same day
                //iterate through each day that otherCourse falls on
                for(var otherDay=0; otherDay<otherCourses[course].days.length; otherDay++) {

                    //prevent class from matching overlap with itself
                    if(otherCourses[course] == courseobj)
                        break;

                    var otherDayIndex;
                    switch(otherCourses[course].days.charAt(otherDay)) {
                        case 'M': otherDayIndex = 0; break;
                        case 'T': otherDayIndex = 1; break;
                        case 'W': otherDayIndex = 2; break;
                        case 'R': otherDayIndex = 3; break;
                        case 'F': otherDayIndex = 4; break;
                    }

                    //if courseobj and otherCourse fall on the same $day (dayIndex == otherDayIndex)
                    if(dayIndex == otherDayIndex) {
                        //check if their TIMES overlap
                        var t1s = convertTimes(courseobj)[0];
                        var t1e = convertTimes(courseobj)[1];
                        var t2s = convertTimes(otherCourses[course])[0];
                        var t2e = convertTimes(otherCourses[course])[1];

                        //if courseobj and otherCourse OVERLAP on their times TODAY
                        if(t1s <= t2e && t2s <= t1e) {
                            //otherCourse overlaps with courseobj; using the loop, overlappingCourses ends up holding all of the otherCourses that overlap with courseobj, so that...
                            overlappingCourses.push(otherCourses[course]);
                            alert("WARNING: " + courseobj.cnum + " and " + otherCourses[course].cnum + " overlap!")
                            break;
                        }
                    }
                }
            }
            //...so that we can synthesize a new classGroup combining them ALL
            if(overlappingCourses.length > 0) {
                overlappingCourses.push(courseobj);
                $scope.masterOverlap[dayIndex].splice(0, overlappingCourses.length, overlappingCourses);
                adjustOverlapCSS();
            }
        }
    }
    $scope.unscheduleMaster = function(courseobj) {
        //just need to find all instances of courseobj and remove them
        for(var day=0; day<5; day++) {
            for(var classGroup=0; classGroup<$scope.masterOverlap[day].length; classGroup ++) {
                //if found courseobj in a classGroup... remove it.
                var courseobjIndex = $scope.masterOverlap[day][classGroup].indexOf(courseobj);
                if(courseobjIndex > -1) {
                    $scope.masterOverlap[day][classGroup].splice(courseobjIndex, 1);
                    adjustOverlapCSS();
                }
            } 
        }
    }
    
    //schedule course
    $scope.schedule = function(courseobj) {

        ///////Undo, error-management///////
            //make undoable by adding to actions list if appropriate
            if($scope.undoing == false && $scope.parsing == false) {
                $scope.actions.push({
                    type: 'add',
                    sc: courseobj
                });
            }

            //prevent adding courses with null time info
            if(courseobj.days == " " || courseobj.time.indexOf('TBD') != -1) {
                alert("Error: Course days/times TBD");
                return;
            }
            
            //don't schedule duplicates
            if($scope.scheduledCourses) { //!== undefined
                for(var i=0; i<$scope.findCourse(courseobj.CRN, $scope.scheduledCourses).length; i++) {
                    if($scope.findCourse(courseobj.CRN, $scope.scheduledCourses)[i] == courseobj) {
                        return;
                    }
                }
            }

        ///////Inject HTML///////
            var title = "";
            var time = "";
            var daysstr = courseobj.days;
            var coursetag = timeCalc.main(courseobj, 0);

            var justAdded = [];
            function modifyTitleTime(courseobj) {
                if(courseobj.ctitle.indexOf('-') != -1) {
                    title = courseobj.ctitle.substring(0,courseobj.ctitle.indexOf('-'));
                    cinfo = courseobj.ctitle.substring(courseobj.ctitle.indexOf('-')+2);
                    master = true;
                }
                else title = courseobj.ctitle;

                var ctime = courseobj.time;
                time = ctime.substring(0,ctime.length-1-1) + ' ' + ctime.substring(ctime.length-1-1,ctime.length-1) + '.m.';
            }
            modifyTitleTime(courseobj);
            function injectListHTML(courseobj) {
                var liststr = '<div data-crn="' + courseobj.CRN + '" class="list"><span data-crn="' + courseobj.CRN + '" class="glyphicon glyphicon-remove-circle removebtn"></span><b>' + title + ': <br>' + courseobj.cnum + ' ' + courseobj.actv + ' </b>- ' + courseobj.CRN + '<br><small>' + time + ', ' + courseobj.days + '</small></div>';
                var $jQOL = $($.parseHTML(liststr));
                $("#clist").append($jQOL);
                $scope.cssColor(courseobj, $jQOL);
            }
            injectListHTML(courseobj);
            function injectCalendarHTML(courseobj) {
                var $jQO;
                var i = daysstr.length;
                //Loop for every course day i
                while(i--) {
                    var coursestr = '<div ' + 'data-crn="' + courseobj.CRN + '" ' + 'data-added="true" ' + 'class="event"><span data-crn="' + courseobj.CRN + '" class="glyphicon glyphicon-remove-circle removebtn onschedbox"></span>';
                    coursestr = (coursestr+'<b>'+courseobj.cnum+' '+courseobj.actv+'</b> <small>'+time+' <sup>['+courseobj.CRN+']</sup></small>'+'</div>').replace("event","event "+daysstr.charAt(i).toLowerCase());
                    //console.log("Before CSS: " + coursestr)
                    $jQO = $($.parseHTML(coursestr));
                    $(coursetag).append($jQO);
                    
                    var durationCSS = timeCalc.main(courseobj, 1) + 'px';
                    var startShiftCSS = 'calc( -20px ' + '- 60px + ' + timeCalc.main(courseobj, 2)[1] + 'px' + ')';
                    
                    //Starting CSS for all courseobjs:
                    $jQO.css({
                        'margin-top': startShiftCSS,
                        'height': durationCSS,
                        'color': 'white',
                        'border-radius': '5px'
                    });
                    $scope.cssColor(courseobj, $jQO);

                    justAdded.push($jQO);
                    //OverlapTester:
                    console.log("**ADDED.CSS: " + $jQO.prop('outerHTML'))
                }
            }
            injectCalendarHTML(courseobj);
        

        $scope.scheduledCourses.push(courseobj);
        //console.log("running scheduleMaster()")
        $scope.scheduleMaster(courseobj);
        //console.log("FINISHED running scheduleMaster()")
        console.log(JSON.stringify($scope.masterOverlap));


        ///////JQUERY, CSS, LOCAL STORAGE///////
            //courseobj hover - need here.
            $('div[data-crn="' + courseobj.CRN + '"]').hover(function() {
                $('div[data-crn="' + courseobj.CRN + '"]').addClass('active');
            },function(){
                $('div[data-crn="' + courseobj.CRN + '"]').removeClass('active');
            });
            //Click remove button--UNSCHEDULE - need here.
            $('.removebtn').click(function(e) {
                var crn = $(this).data("crn");
                //$(this).remove(); //remove the remove button itself
                $scope.unschedule(crn);
                e.stopPropagation();
            });

            //work with same CRN on different day at different time
            if($scope.dupes == 0 && $scope.findCourse(courseobj.CRN, $scope.courses).length > 1) {
                $scope.dupes = $scope.findCourse(courseobj.CRN, $scope.courses).length;
                $scope.dupeWorker(courseobj.CRN);
            }

            //update table CRN css
            $('.courserow[data-crn="' + courseobj.CRN + '"]').css({
                'background-color' : '#A29061',
                'color': 'white'
            });

            //update localStorage and textarea
            if(localStorage.crns.indexOf(courseobj.CRN) == -1) {
                localStorage.crns = (localStorage.crns + " " + courseobj.CRN).trim();
                if(localStorage.crns.indexOf('  ') > -1)
                    localStorage.crns.replace('  ', ' ');
                $('#coursedump').val(localStorage.getItem("crns"));
            }
    }
    
    //unschedule course
    $scope.unschedule = function(crn) {

        //Undo support
            if($scope.undoing == false && $scope.clearing == false) {
                $scope.$apply(function() {
                    $scope.actions.push({
                        type: 'remove',
                        sc: $scope.findCourse(crn, $scope.courses)[0]
                    });
                });
            }

        //Remove HTML and CSS
            $('div[data-crn="' + crn + '"]').remove();
            $('.courserow[data-crn="' + crn + '"]').css({
                'background-color' : '',
                'color': ''
            });

        //Remove from models
            var courseobj = {};
            for(var i=0; i<$scope.scheduledCourses.length; i++) {
                if($scope.scheduledCourses[i].CRN == crn){
                    courseobj = $scope.scheduledCourses[i];
                    $scope.scheduledCourses.splice(i,1);
                }
            }
            localStorage.crns = localStorage.crns.replace(crn, '');
            $scope.unscheduleMaster(courseobj);

        //Trim textarea
            var str = localStorage.crns;
            var re = /(\s{2,})/g;
            var result = str.replace(re, ' ');
            localStorage.crns = result;
            $('#coursedump').val(localStorage.getItem("crns").trim());

        //$scope.verifyCorresp(courseobj);
    }            
    
    //toggle for adding/removing courses from the table
    $scope.toggleSchedule = function(courseobj) {
        if($scope.findCourse(courseobj.CRN, $scope.scheduledCourses).length >= 1) {
            $scope.unschedule(courseobj.CRN)
        }
        else $scope.schedule(courseobj)
    }
    
    ////////////////////   Filters:   ////////////////////
    //Global filter variables
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
            //console.log("undefined")
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
    
    //determine and return unique visually accessible color of course
    $scope.cssColor = function(courseobj, $jQO) {
        if($scope.colorScheme['eng'].indexOf(courseobj.department) > -1) {
            var color = new KolorWheel([0, 67, 35]);
            color.l+= ($scope.colorScheme['eng'].indexOf(courseobj.department)*2.7);
            color.s+= ($scope.colorScheme['eng'].indexOf(courseobj.department)*3)
            color.h+= ($scope.colorScheme['eng'].indexOf(courseobj.department)*1.2)
            $jQO.css({
                'background-color': color.getHex(),
                'border-color': color.getHex(),
                'text-shadow': '0px 0px 3px ' + color.getHex(),
                'border': '2px solid ' + color.getHex()
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
                'text-shadow': '0px 0px 3px ' + color.getHex(),
                'border': '2px solid ' + color.getHex()
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
                'text-shadow': '0px 0px 3px ' + color.getHex(),
                'border': '2px solid ' + color.getHex()
            });
        }
    }

});
    
//retrieve courseListing, all courses and their data
app.factory('courseListing', function($http) {
    return {
        getAllCourses: function() {
            var url = "http://ucm.karinaantonio.com" + "/courses.JSON";
            return $http.get(url);
        }
    };
});

//calculate course time properties
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

//filter to correctly format times in table
app.filter('timeCorrect', function() {
   return function(time) {
       return time.substring(0,time.length-1-1) + ' ' + time.substring(time.length-1-1,time.length-1) + '.m.';
   } 
});

