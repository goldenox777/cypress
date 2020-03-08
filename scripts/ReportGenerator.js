'use strict';
//const args = process.argv;
//first argument looks for the source of the jsons
//var reportsFolder = args[2].split('=')[1]
// var reportsFolder = "/test/results/consumables/"

//debug reportsFolders
var reportsFolder = "./results/consumables/"

//second argument is where we copy the end html
// var endReportFolder = args[3].split('=')[1]
var endReportFolder = "/test/results/reports/"

const testFolder = reportsFolder
const fs = require('fs');
const path = require('path');

var string
var line = 0

//set up empty arrays which will later be loaded with info
var failedArray = []
var passedArray = []
var stats = []
//read the source folder and go through all the JSONs
fs.readdir(testFolder, (err, files) => {
  files.forEach(file => {
    if (file.includes('.json')) {
      let rawdata = fs.readFileSync(path.join(testFolder, file));
      let myJson = JSON.parse(rawdata);
      var myStats = {
        tests: myJson.stats.tests,
        passed: myJson.stats.passes,
        failures: myJson.stats.failures,
        duration: myJson.stats.duration
      }

      stats.push(myStats)
      if (myJson.stats.suites != 0) {
        for (var i = 0; i < myJson.results[0].suites[0].tests.length; i++) {
          var title = myJson.results[0].suites[0].tests[i].title
          var id
          if (title.includes('-')) {
            id = title.split('-')[0]
          } else {
            id = 'NOT IN TFS'
          }
          //since I couldn't find a way to make mochawesome to output the filepath into the JSON
          //I had to write the file path into each .feature file
          //and it resides after the double "__"
          //console.log(myJson.results[0].suites[0].title)
          var filePath = (myJson.results[0].suites[0].title).split('__ ')[1]
          //each folder is separated with a " _ "
          var builtFilePath = filePath.split(" _ ")
          builtFilePath[builtFilePath.length - 1] = builtFilePath[builtFilePath.length - 1] + '.feature'
          var errorFilePathSuffix = ""
          var screenshotsErrorFileName = myJson.results[0].suites[0].title + ' -- ' + title + ' (failed).png'

          // screenshotsErrorFileName = screenshotsErrorFileName.replace(' __ ', '  ')
          // screenshotsErrorFileName = screenshotsErrorFileName.replace(/ _ /g, '  ')

          screenshotsErrorFileName = encodeURI(screenshotsErrorFileName)
          for (var ii = 0; ii < builtFilePath.length; ii++) {
            errorFilePathSuffix += '/' + builtFilePath[ii]
          }
          var screenshotsFilePath = 'visuals/screenshots' + errorFilePathSuffix + '/' + screenshotsErrorFileName

          var videosFilePath = 'visuals/videos' + errorFilePathSuffix + '.mp4'

          //we extract the TFS id of a file by splitting after the first ocurrence of "- "
          var titleSplit
          if (title.includes('- ')) {
            titleSplit = title.split(/- (.+)/)[1]
          } else {
            titleSplit = title
          }
          var testStatus = myJson.results[0].suites[0].tests[i].state
          var error

          filePath = filePath.replace(/_/g, ">")
          if (myJson.results[0].suites[0].tests[i].state == 'failed') {
            error = myJson.results[0].suites[0].tests[i].err.message
            error = error.replace("<", "&lt;")
            error = error.replace(">", "&gt;")
            var myObj = {
              title: titleSplit,
              id: id,
              filePath: filePath,
              status: testStatus,
              screenshots: screenshotsFilePath,
              videos: videosFilePath,
              error: error
            }
            failedArray.push(myObj)
          } else {
            var myObj = {
              title: titleSplit,
              id: id,
              filePath: filePath,
              status: testStatus,
              screenshots: screenshotsFilePath,
              videos: videosFilePath
            }
            passedArray.push(myObj)
          }

        }
      }


    }

  });

  var tests = 0
  var passed = 0
  var failed = 0
  var duration = 0

  for (var k = 0; k < stats.length; k++) {
    tests = tests + stats[k].tests
    passed = passed + stats[k].passed
    failed = failed + stats[k].failures
    duration = duration + stats[k].duration
  }

  var durationInMinutes = (duration / 60000).toFixed(2)

  var baseHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
<style>
@charset "UTF-8";
@import url(https://fonts.googleapis.com/css?family=Open+Sans:300,400,700);

body {
  font-family: "Helvetica Neue", Helvetica, Arial;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  color: #3b3b3b;
  -webkit-font-smoothing: antialiased;
  font-smoothing: antialiased;
  background: #2b2b2b;
}
@media screen and (max-width: 580px) {
  body {
    font-size: 16px;
    line-height: 22px;
  }
}

.wrapper {
  margin: 0 auto;
  padding: 0px;
  max-width: 90%;
}

.table {
  margin: 0 0 40px 0;
  width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  display: table;
}
@media screen and (max-width: 580px) {
  .table {
    display: block;
  }
}

.row {
  display: table-row;
  background: #f6f6f6;
}
.row:nth-of-type(odd) {
  background: #e9e9e9;
}
.row.header {
  font-weight: 900;
  color: #ffffff;
  background: #ea6153;
}
.row.green {
  background: #27ae60;
}
.row.blue {
  background: #2980b9;
}
@media screen and (max-width: 580px) {
  .row {
    padding: 14px 0 7px;
    display: block;
  }
  .row.header {
    padding: 0;
    height: 6px;
  }
  .row.header .cell {
    display: none;
  }
  .row .cell {
    margin-bottom: 10px;
  }
  .row .cell:before {
    margin-bottom: 3px;
    content: attr(data-title);
    min-width: 98px;
    font-size: 10px;
    line-height: 10px;
    font-weight: bold;
    text-transform: uppercase;
    color: #969696;
    display: block;
  }
}

.cell {
  padding: 6px 12px;
  display: table-cell;
}
@media screen and (max-width: 580px) {
  .cell {
    padding: 2px 16px;
    display: block;
  }
}
</style>
</head>
<body>`

  var divStats = '<div id="stats" style="padding: 40px 40px 0px 40px;max-width:90%;margin: 0 auto;"><div><div id="tests" style="width:24%;height:100px;border:1px solid #000;background-color: white; display: inline-block; cursor: pointer;"><p style="color:black; font-weight: bold; text-align: center; vertical-align: middle;">Tests<br>' + tests + '</p></div><div id="passed" style="width:24%;height:100px;border:1px solid #000;background-color: rgb(92, 188, 183);display: inline-block; cursor: pointer;"><p style="color:white; font-weight: bold; text-align: center; vertical-align: middle;">Passed<br>' + passed + '</p></div></div><div><div id="duration" style="width:24%;height:100px;border:1px solid #000;background-color: rgb(20, 116, 164);display: inline-block;"><p style="color:white; font-weight: bold; text-align: center; vertical-align: middle;">Total duration<br>' + durationInMinutes + ' minutes</p></div><div id="failed" style="width:24%;height:100px;border:1px solid #000;background-color: #E04A71; display: inline-block; cursor: pointer"><p style="color:white; font-weight: bold; text-align: center; vertical-align: middle;">Failed<br>' + failed + '</p></div></div></div><div id="piechart" style="width: 400px; height: 320px; position: absolute;padding:40px 40px 40px 0px"></div>'
  var divCharts = `<script type="text/javascript">

	document.addEventListener('DOMContentLoaded', function() {
		var leftPosChart = document.getElementById("tests").offsetWidth + document.getElementById("passed").offsetWidth + 8
		document.getElementById("piechart").style.left = leftPosChart + "px"
		document.getElementById("piechart").style.top = (- 50) + "px"
	 }, false);
	
		  google.charts.load('current', {'packages':['corechart']});
		  google.charts.setOnLoadCallback(drawChart);
	
		  function drawChart() {

			var data = google.visualization.arrayToDataTable([`
  divCharts += "['A', 'B'],"
  divCharts += "['Passed', " + passed + "],"
  divCharts += "['Failed', " + failed + "]"
  divCharts += "]);"
  divCharts += `var options = {
			  backgroundColor: 'transparent',
			  colors:['rgb(92, 188, 183)','#E04A71'],
			  legend: {
				  position: 'none'
			  }
			};
	
			var chart = new google.visualization.PieChart(document.getElementById('piechart'));
	
      chart.draw(data, options);

      var rows = document.getElementById("myTable").getElementsByClassName("row").length - 1
      $("#passed").click(function() {
        $(".hideFailed").hide();
        $(".hidePassed").show()
      })

      $("#failed").click(function() {
        $(".hideFailed").show();
        $(".hidePassed").hide()
      })

      $("#tests").click(function() {
        $(".hideFailed").show();
        $(".hidePassed").show()
      })
      $("#grayContainer").click(function() {
        document.getElementById("mainContainer").style.display = "none"
      })
      for (var i = 0; i < rows; i++) {        
        
        $("#clicky" + i).click(          
          function() {         
            var vidsource = ($(this).attr("vidsource"))
            var scrsource = ($(this).attr("scrsource"))
            var filepath = ($(this).attr("filepath"))
            document.getElementById("mainContainer").style.display = "block"
            var wHeight = window.innerHeight
            var wWidth = window.innerWidth
            var percent = (50 * wWidth) / 100
            $("#scrcontainer").html('<img style="width:'+ percent +'px" src="'+ scrsource +'">')
            $("#vidcontainer").html('<video width="100%" controls=""><source src="'+ vidsource +'"></video>')
            $("#vidcontainer").offset({left:percent})
            $("#filepathcontainer").html(filepath)

          }          
        )

        $("#clickyPassed" + i).click(          
          function() {         
            var vidsource = ($(this).attr("vidsource"))
            var filepath = ($(this).attr("filepath"))
            document.getElementById("mainContainer").style.display = "block"
            var wHeight = window.innerHeight
            var wWidth = window.innerWidth
            var percent = (50 * wWidth) / 100
            $("#scrcontainer").html('<video width="100%" controls=""><source src="'+ vidsource +'"></video>')
            $("#vidcontainer").html('')
            $("#filepathcontainer").html(filepath)
          }          
        )

        
        $("#passedFilePath" + i).hover(
          function() {
            $("#pathbox").css("display", "inline-block")
            $("#pathbox").offset({top: $(this).offset().top, left: $(this).offset().left})
            var filepath = $(this).attr("filepath")
            $("#pathbox").html(filepath)
          }
        )
      }
      $("#pathbox").click(
        function() {
          $("#pathbox").css("display", "none")
        }
      )
		  }
	</script>
	`
  baseHtml += divStats
  baseHtml += divCharts
  baseHtml += `<div class="wrapper">
                <div class="table" id="myTable">
                  <div class="row header">
                    <div class="cell">
                      #
                    </div>
                    <div class="cell">
                      STATUS
                    </div>
                    <div class="cell">
                      ID
                    </div>
                    <div class="cell">
                      TITLE
                    </div>
                    <div class="cell">
                      ERROR
                    </div>
                  </div>`

  function returnLinkElement(id) {
    try {
      if (parseInt(id)) {
        return '<a style="color:inherit" href="https://tfs.vitalhealthsoftware.com/tfs/DefaultCollection/PH3/_workitems/edit/' + id + '" target="_blank">' + id + '</a>'
      } else {
        return id
      }
    }
    catch (err) {

    }
  }
  function capitalizeFirstLetter(string) {
    var upper = string.charAt(0).toUpperCase() + string.substring(1)
    return upper
  }
  function returnRedStyle(string) {
    if (!parseInt(string)) {
      return 'style="background-color:#ea6153"'
    }
  }
  var trCounter = 0
  for (var j = 0; j < failedArray.length; j++) {
    line++
    baseHtml += '<div class="row hideFailed" id=tr' + trCounter + '><div class="cell" data-title="#">' + line + '</div><div id="clicky' + j + '" class="cell" data-title="STATUS" filepath="' + failedArray[j].filePath + '" scrsource="' + failedArray[j].screenshots + '" vidsource="' + failedArray[j].videos + '">' + capitalizeFirstLetter(failedArray[j].status) + '</div><div class="cell" ' + returnRedStyle(failedArray[j].id) + ' data-title="ID" id=' + failedArray[j].id + '>' + returnLinkElement(failedArray[j].id) + '</div><div class="cell" data-title="TITLE">' + failedArray[j].title + '</div><div class="cell" data-title="ERROR">' + failedArray[j].error + '</div></div>'
    trCounter++
  }
  for (var j = 0; j < passedArray.length; j++) {
    line++
    baseHtml += '<div class="row hidePassed" id=tr' + trCounter + '><div class="cell" data-title="#" >' + line + '</div><div id="clickyPassed' + j + '" class="cell" data-title="STATUS" filepath="' + passedArray[j].filePath + '" vidsource="' + passedArray[j].videos + '">' + capitalizeFirstLetter(passedArray[j].status) + '</div><div class="cell" data-title="ID" ' + returnRedStyle(passedArray[j].id) + ' id=' + passedArray[j].id + '>' + returnLinkElement(passedArray[j].id) + '</div><div class="cell" data-title="TITLE">' + passedArray[j].title + '</div><div class="cell" data-title="ERROR"></div></div>'
    trCounter++
  }

  baseHtml += `</div></div>
  <div id="mainContainer" style="position:fixed;z-index:2;top:0px;width:100%;height:100%;display:none"><div style="width:100%;height:100%;background-color:black;opacity:0.5" id="grayContainer"></div><div id="scrcontainer" style="width:50%;position:absolute;top:50px;"></div><div id="vidcontainer" style="width:50%;position:absolute;top:50px;"></div><div id="filepathcontainer" style="position:absolute;top:30px;background-color:white"></div></div>
		</body>	
    </html>`
  var maxBarSize = 200
  var barSizeFailed = (failed * 100) / tests
  barSizeFailed = maxBarSize * barSizeFailed / 100
  var barSizePassed = (passed * 100) / tests
  barSizePassed = maxBarSize * barSizePassed / 100
  var emailHtml = `<!DOCTYPE html>
  <html>
  
  <head>
    <style>
      .bar {
        padding-left: 10px;
        padding-right: 10px;
      }
  
      .total {
        background-color: rgb(122, 120, 119);
        width: `+ maxBarSize + `px;
      }
  
      .failed {
        background-color: rgb(240, 206, 209);
        width: `+ barSizeFailed + `px;
      }
  
      .passed {
        background-color: rgb(152, 235, 210);
        width: `+ barSizePassed + `px;
      }
  
      .fright {
        float: right;
      }
  
      .fleft {
        float: left;
      }
    </style>
  </head>
  
  <body>
    <div class="bar total fleft">Total</div>
    <div class="fleft">`+ tests + ` tests</div>
    <br>`
  if (failed != 0) {
    emailHtml += `<div class="bar failed fleft"> </div>
      <div class="fleft">`+ failed + ` Failed</div>
      <br>`
  }
  if (passed != 0) {
    emailHtml += `<div class="bar passed fleft"> </div>
      <div class="fleft">`+ passed + ` Passed</div>
      <br>
      `
  }
  emailHtml += `<div class="fleft">Execution time: ` + durationInMinutes + `</div>
    <br>
    <br>
    <div>¯\\_(ツ)_/¯</div>
    <div>For additional details, please see the attached archive.</div>
    <div>Please find below a quick link to all of the failing test cases OR view the full run in <a
        href="https://google.com" target="_blank">TFS</a></div>
    <a href="http://www.google.com" target="_blank">19658</a>
  </body>
  
  </html>
  `


  var calculatedDate = Date.now()
  writeToFile(__dirname + '/results/Report' + '.html', baseHtml)
  writeToFile(__dirname + '/results/' + calculatedDate + '.html', baseHtml)
  writeToFile(__dirname + '/EmailBody.html', emailHtml)
  function writeToFile(pathWithFileName, htmlVar) {
    fs.writeFile(pathWithFileName, htmlVar, function (err) {
      if (err) {
        return console.log(err)
      }
    });
  }
})