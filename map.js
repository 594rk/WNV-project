/*
<!--
*		AUTHORS: Martin Pozniak, Calvin Bina
*		Updated: 7/7/16
*		Decription: This file is where all functions and features are programmed for the website. 
-->
*/
//Layer Render issue: https://productforums.google.com/forum/#!topic/google-fusion-tables/yHi0c6C-A0w;context-place=topicsearchin/google-fusion-tables/tiles

//Our table: TrapGISData = 1zWT_7x8ZJdX4tujkR7w2fRTWthrNLeV0ob1Rz3uo 
//trap.location table = '1BjxaJx8453OtR669hb7yOWtqunNrJyGcUGQq8ffe'
//newest and active dataSet = 
//API authentication key = AIzaSyAaDz7T5vCbVA_8JD2jA-GzGUCSrlD5ZI0
//google.load('visualization', '1', { packages: ['corechart'] });
//client Id: 712679148236-qjcih29201jjquksqsmpuf95i12q9f8e.apps.googleusercontent.com From this website https://console.developers.google.com/apis/credentials?project=hazel-core-135123

//initialize global variables that can be accessed by all functions
var numComparisons= 0; //global variable
var year='2015'
var species= 'Culex_Tarsalis'
var virus = 'WNV';
var county = 'allCounties';
var geometryTableId= '1zWT_7x8ZJdX4tujkR7w2fRTWthrNLeV0ob1Rz3uo';
var locationTableId ='1BjxaJx8453OtR669hb7yOWtqunNrJyGcUGQq8ffe';
var week='1';
var totAnopheles;
var totAedes;
var totAedesVexans;
var totCulex;
var totCulexTarsalis;
var totCulexSalinarius;
var totCuliseta;
var totOther;



function initialize() 
{
	google.charts.load("current", {packages:["corechart"]});
	google.charts.setOnLoadCallback(drawPieChart);
	google.charts.setOnLoadCallback(drawLineChart);
	//INITIALIZE variables
	//alert("about to call drawChart");
	populateCountyOptions();

	//CREATE THE MAP
	var mapProp = 
	{
		center:new google.maps.LatLng(47.6,-100.4),
		zoom:7,
		mapTypeId:google.maps.MapTypeId.ROADMAP,
		scrollwheel: false,
		zoomControl: false,
		draggable: true,
		disableDoubleClickZoom: true
	};
	var map = new google.maps.Map(document.getElementById("googleMap"),mapProp);

	var layer = new google.maps.FusionTablesLayer();
	var locationLayer = new google.maps.FusionTablesLayer({
		query: {
			select: 'Lat', //the Lat column, which is configured to reference also the Longiude Column
			from: locationTableId,//our fusion table's encrypted ID
			where: '' //empty constraints, I just want to see all the points, technically doesn't need to be here.
		},
		options: {suppressInfoWindows:false}
	});

	//updateLayerQuery(map,layer,locationLayer);
	differentUpdateQuery(map,layer,locationLayer);//Both layers are set within this function after the query is set.
	
	//CREATE THE LEGEND
	createLegend(map);
	google.maps.event.addDomListener(document.getElementById('year'),'change', function()  //LISTENS FOR THE CHANGE OF YEAR!
	{
		year = this.value;
		//updateLayerQuery(map,layer,locationLayer);
		differentUpdateQuery(map,layer,locationLayer);
		updateLegendContent();
		drawPieChart(year);
	});
	google.maps.event.addDomListener(document.getElementById('species'),'change',function()//ONCE THIS EVENT FIRES, WE WANT THE MAP TO DISPLAY THE DENSITY OF THE SELECTED SPECIES BY COUNTY!
	{
		species=this.value; 
		updateLayerBySpecies(map,layer,locationLayer);
		updateLegendContent();	
	});
	google.maps.event.addDomListener(document.getElementById('countyOptions'),'change',function()//This will update the map to display only the selected county.
	{
		county = this.value;
		showCounty(county,layer);	
	});
	google.maps.event.addDomListener(document.getElementById('showLoc'), 'change', function() //Tracks if the location laer is to be displayed or not, enabled by default
	{
		if(document.getElementById('showLoc').checked==false)
        	locationLayer.setMap(null);
        else
        {
        	//alert("should be setting the layer next");
        	locationLayer.setMap(map);
        }
    });
    google.maps.event.addDomListener(document.getElementById('clearButton'),'click',function()
	{
		for(var i=0;i<numComparisons;i++)//iterate enough times to remove all of the items
		{
			var element = document.getElementById('generalData');
			if(element!=null)
				element.parentNode.removeChild(element);
			else
				break;
		}
		numComparisons=0;
	});
    google.maps.event.addListener(map, 'bounds_changed', function() {

	});
	//-----------------------------------------CREATE THE INFO WINDOW-----------------------------------------------------------------------
	google.maps.event.addListener(layer, 'click', function(e) 
	{ //listener for clicking on the map
		var totalMosquitos = e.row['Total_Mosquitoes'].value;
        var maxTemp = e.row['Max Temp (Abs)'].value;
		var minTemp =e.row['Min Temp (Abs)'].value;
		var bSoilTemp=e.row['Bare Soil Temp (Avg)'].value;
		var tSoilTemp=e.row['Turf Soil Temp (Avg)'].value;
		var totRain=e.row['Total Rainfall (Avg)'].value;
		var dewpoint=e.row['Dewpoint (Avg)'].value;
	    var county = e.row['Counties'].value;
	    var speciesDensity = e.row[species].value;
	    var currentYear = e.row['Year'].value;
	    var risk= '';
	    //alert("The Species is: "+ species +" The Value of SpeciesDensity is: "+speciesDensity)
		 if(species == 'tmale' || species == 'tfemale')
		 {
		
		 }
		 else
		 {
			 if(species == 'Culex_Tarsalis')
			 {
				  if (speciesDensity > 332) {
					risk = '<p class="high">High Risk for WNV!</p>'; //WHAT DEFINES HIGH RISK LOW RISK BY YEAR?
				  } else if (speciesDensity > 166) {
					risk = '<p class="medium">Medium Risk for WNV</p>';
				  } else {
					risk = '<p class="low">Low Risk for WNV</p>';
				  }
			 }
			 else
			 {
			 	risk='<br><br><strong> Non-Virus Carrying Species</strong>'
			 }
		}
		var infoWin='<strong>' + county + ' County Data For The Year: ' + currentYear + '</strong>'+
								'<br><br> Total recorded ' + species +' traps: ' + e.row[species].value + 
								 '<br>Total Human Cases: Coming Soon' +
								 risk; //PUTS TOGETHER THE DATA TO BE SHOWN IN THE INFO WINDOW!
	    e.infoWindowHtml =  infoWin;
	    updateGeneralData(year, county,totalMosquitos, maxTemp,minTemp,bSoilTemp,tSoilTemp,totRain,dewpoint);	  
	});
//---------------------------------------END CREATE INFO WINDOW--------------------------------------------------------------------------
	google.maps.event.addListener(locationLayer,'click',function(e)
	{
		var location = e.row['Trap.Location'].value;
		var infoWin = '<strong> Trap Location: ' + location +'</strong>';
		e.infoWindowHtml= infoWin;
	});
	google.maps.event.trigger(map, 'resize'); 
}//end of initialize function


//-------------------------------------------------ALL FUNCTIONS | Source code adapted from: https://developers.google.com/fusiontables/docs/samples/adv_fusiontables-------------------------------------------------------------------------------------------------
function updateLayerQuery(map,layer,locationLayer) 
{
	alert("in orig");
	if(county=='allCounties')
	{	
		var where = generateWhere(year);
	}
	else if(county!='allCounties')
	{	
		var where=generateWhereYC(year,county);
	}
	layer.setOptions({query:{select:'geometry',from:geometryTableId, where: where}});
	updateLayerBySpecies(map,layer,locationLayer);
}
function differentUpdateQuery(map,layer,locationLayer)
{
	//alert("In dif");
	if(county=='allCounties')
	{	
		var where = generateWhere(year);
	}
	else if(county!='allCounties')
	{	
		var where=generateWhereYC(year,county);
	}
	query={
		select: 'geometry',
		from: geometryTableId,
		where: where
	}
	layer.setQuery(query);
	updateLayerBySpecies(map,layer,locationLayer);
}
function updateLayerBySpecies(map,layer,locationLayer) //6/26/16 This function properly maps the density of each individual species of mosquito
{
	var colors=COLORS; //COLORS is an array of 5 colors in vars.js
	var minNum= 0;
	var maxNum=500;
	var step= (maxNum-minNum) / colors.length;//Should be 500/5 = 100~
	//alert(step);
	var styles = new Array();
	for(var i=0;i<colors.length;i++) //Originally: Generates the conditions to color each polygon slightly more red with growing population iterates 22 times //Now it only does G.Y.R. based on density 
	{	
		var newMin = minNum + step *i;
		//alert(generateWhereYS(newMin,year,species)+ " Is filled with " + colors[i]);
		styles.push({where:generateWhereYS(newMin,year,species), polygonOptions: {fillColor:colors[i],fillOpacity: 1,strokeColor: '#000000', strokeWeight: 3}}); //gives just enough transparency so you can really get a feel for the map
	}
	layer.set('styles',styles);
	//alert("should be setting the layer next");
	layer.setMap(map);
	if(document.getElementById('showLoc').checked==false)
    	locationLayer.setMap(null);
    else
    {
    	//alert("should be setting the layer next");
    	locationLayer.setMap(map);
    }
}
function generateWhere(year) //Generates a simple where clause for selecting the year from the fusion table
{
	var whereClause = new Array();
    whereClause.push("Year = '");
    whereClause.push(year);
	whereClause.push("'")
	//alert(whereClause.join(''));
    return whereClause.join('');
}
function generateWhereYC(year, county) //YC stands for year and county. This creates the conditions for year and county, is used to display only one county
{
	var whereClause = new Array();
    whereClause.push("Year = '");
    whereClause.push(year);
	whereClause.push("'");
	whereClause.push(" AND Counties = '");
	whereClause.push(county);
	whereClause.push("'");
	alert(whereClause.join(''));
    return whereClause.join('');
}
function generateWhereYS(minNum, year,species)//YS stands for year and species
{ //adapeted from Calvins work
	var whereClause = new Array();
	whereClause.push("Year = '");
    whereClause.push(year);
    whereClause.push("' AND '");
    whereClause.push(species);
    whereClause.push("' >= ");
    whereClause.push(minNum);
    //alert(whereClause.join(''));
    return whereClause.join('');
}
function createLegend(map)
{
	var legend=document.getElementById('legend');
	updateLegendContent();
	map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(
	document.getElementById('legend'));
}
function updateLegendContent()
{
	var legend = document.getElementById('legend');
	var title = year + " " +species + ' Trap Count Density';
	legend.innerHTML = '<strong><center>' + title + '</strong></center>';
	var colors = ['green','lightGreen','yellow','orange','red'] //GREEN, YELLOW, RED
	var range=[0,100,200,300,400];
	var riskLevel=['low risk','low risk','moderate risk','moderate risk','high risk'];
	for(var i=0; i < colors.length; i++)
	{
		var colorBox = document.createElement('div');
		colorBox.id=colors[i];
		colorBox.innerHTML='<strong><center> >' + range[i] + "  " + riskLevel[i];

		legend.appendChild(colorBox);
	}
}
function updateGeneralData(year, county,totalMosquitos, maxTemp,minTemp,bSoilTemp,tSoilTemp,totRain,dewpoint)
{
	if(numComparisons<3)
	{
		var genData = document.createElement('div');
		genData.id = "generalData";
		var title= "General Data for " + county +" county for the Year: " + year;
		var info =        '<strong><center>' + title + '</strong></center>'
						  + "<br>Total Mosquitoes: " + totalMosquitos
						  +	"<br>Max Temperature: " + maxTemp + "°C"
						  + "<br>Min Temperature: "	+ minTemp + "°C"
						  + "<br>Bare Soil Temperature: "	+bSoilTemp + "°C"
						  + "<br>Turf Soil Temperature: "	+tSoilTemp + "°C"
						  + "<br>Total Rainfall: "	+totRain
						  + "<br>Dewpoint Average: "	+dewpoint +"°C";
		genData.innerHTML=info;//sets the inside of the div to our info variable
		document.body.appendChild(genData);
		numComparisons++;//Used to increment the number of boxes on the screen
	}
	else //WILL ONLY ALLOW YOU TO HAVE 3 COUNTY COMPARISONS AT ANY TIME
	{
		//alert("You can only have 3 county comparisons at any time. Please press clear to make another selection.");//Alert the user that they can only have 3 general data boxes at once
	}	
}
//--------------------REFERENCE CODE: http://stackoverflow.com/questions/9895082/javascript-populate-drop-down-list-with-array----------------------------
function populateCountyOptions()
{
	var countyOption = document.getElementById('countyOptions')

	addOption(countyOption,'ALL COUNTIES','allCounties');
	for(var i=0;i<COUNTIES.length;i++)
	{
		addOption(countyOption,COUNTIES[i],COUNTIES[i]);
	}
}
function addOption(selectBox,text,value)
{
	var option = document.createElement("OPTION");
	option.text = text;
	option.value = value;
	selectBox.options.add(option);
}
//-------------------------------------------------------------

function showCounty(county,layer)
{
	if(county!='allCounties')
	{
		var where = generateWhereYC(year, county);
		//alert(where);
		//layer.setOptions({query:{select:'geometry',from:'1zWT_7x8ZJdX4tujkR7w2fRTWthrNLeV0ob1Rz3uo', where: where}});
		query={
			select: 'geometry',
			from: geometryTableId,
			where: where
		}
		layer.setQuery(query);
	}
	else if(county='allCounties')
	{
		var where = generateWhere(year);
		//alert(where);
		//layer.setOptions({query:{select:'geometry',from:'1zWT_7x8ZJdX4tujkR7w2fRTWthrNLeV0ob1Rz3uo', where: where}});
		query={
			select: 'geometry',
			from: geometryTableId,
			where: where
		}
		layer.setQuery(query);
	}
}
function getPercentage(totSpecies, totMosquitos)
{
	alert("inside getPercentage");
	totMosquitos=1;
	return totSpecies/totMosquitos;
}
function updateSpeciesSum(year, species) //queries the fusion table and gets the sum of nay species for any year.
{
	alert("year: "+year);
	//callBack references the function we wantto call back once the query goes through.
	var query = "SELECT SUM("+species+") FROM "+geometryTableId+" WHERE Year = '"+ year+"'";
	query=encodeURI(query);
	var URL = "https://www.googleapis.com/fusiontables/v2/query?sql="+query+"&key=AIzaSyAaDz7T5vCbVA_8JD2jA-GzGUCSrlD5ZI0";
	//alert(URL);
	$.ajax({ 								//understanding the asynchronous nature of javaScript.
		type: 'GET', //get is the default
		url: URL, //what we just created
		success: function(data)
		{
			alert("Success");
		},  //Here we call back drawChart where the result is needed.
		error: function(e)
		{
			alert("If this Fires, There was an error!");
		}
	});
} 
function drawPieChart(year) 
{
	updateSpeciesSum(year, species);
	alert("In pie chart with year " + year);
	var data = google.visualization.arrayToDataTable(
	[
		['Species', 'Count'],
		['Anopheles',10],
		['Culex',11],
		['Culex Tarsalis',2],
		['Aedes',  2],
		['Aedes_vexans', 2],
		['Culiseta',    7],
		['Culex_salinarius',1],
		['Other', 4]
	]);

	var options = 
	{
		title: 'Species Percentage',
		is3D: true,
	};

	var chart = new google.visualization.PieChart(document.getElementById('pieChart'));
	chart.draw(data, options);
}
function drawLineChart(species) 
{
	var data = new google.visualization.DataTable();
	data.addColumn('number', 'X');
	data.addColumn('number', 'Species');

	data.addRows([
	[0, 0],   [1, 10],  [2, 23],  [3, 17],  [4, 18],  [5, 9],
	[6, 11],  [7, 27],  [8, 33],  [9, 40],  [10, 32], [11, 35],
	[12, 30], [13, 40], [14, 42], [15, 47], [16, 44], [17, 48],
	[18, 52], [19, 54], [20, 42], [21, 55], [22, 56], [23, 57],
	[24, 60], [25, 50], [26, 52], [27, 51], [28, 49], [29, 53],
	[30, 55], [31, 60], [32, 61], [33, 59], [34, 62], [35, 65],
	[36, 62], [37, 58], [38, 55], [39, 61], [40, 64], [41, 65],
	[42, 63], [43, 66], [44, 67], [45, 69], [46, 69], [47, 70],
	[48, 72], [49, 68], [50, 66], [51, 65], [52, 67], [53, 70],
	[54, 71], [55, 72], [56, 73], [57, 75], [58, 70], [59, 68],
	[60, 64], [61, 60], [62, 65], [63, 67], [64, 68], [65, 69],
	[66, 70], [67, 72], [68, 75], [69, 80]
	]);

	var options = 
	{
		hAxis: {
	  		title: 'Year'
	},
		vAxis: {
	  		title: 'Total Species Count'
	},
		backgroundColor: '#f1f8e9'
	};

	var chart = new google.visualization.LineChart(document.getElementById('lineChart'));
	chart.draw(data, options);
}

/*
ADD MULTIPLE LINE CHART SHOWING THE TREND OF MANY YEARS TOGETHER.
CHART OF HUMAN CASES
MORE VISUALLY APPEALING WAY OF SHOWING THE TEMPERATURE AND OTHER PARAMETERS

HOW DOES THE AVERAGE LOOK LIKE, HOW DOES THE LAST THREE YEARS

HUMAN CASES, AND CULEX TARSALIS NUMBERS FOR PAST N NUMBER OF YEARS.

SO 35 AND ABOVE IS HIGH RISKFOR ONE WEEK

HOW MANY PEOPLE DIED IN THAT WEEK FOR YEAR

IF YOU SELECT CULEX YOU GET ONE MAP, IF YOU SELECT HUMAN CASES, YOU GET A DIFFERENT MAP

SHEET CONTAINS THE BOUNDARIES
*/


