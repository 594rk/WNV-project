/*
<!--
*		AUTHORS: Martin Pozniak, Calvin Bina
*		Updated: 7/7/16
*		Decription: This file is where all functions and features are programmed for the website. 
-->
*/

//key for our data set = 1W83OZ_bhXcDKLuA9PmZPXAW-MB-TrTX8i3vQIDK_ //This is from the merged table
//API authentication key = AIzaSyAaDz7T5vCbVA_8JD2jA-GzGUCSrlD5ZI0
//google.load('visualization', '1', { packages: ['corechart'] });

//UPDATE 7/10/16: NEED NUMERIC DATA FILLED IN INTO EVERY SLOT OTHERWISE I AM UNABLE TO STYLE THE POLYGONS
function initialize() 
{
	//INITIALIZE VARIABLES
	var year='2015'
	var species= 'Culex_Tarsalis'
	var virus = 'WNV';
	var county = 'allCounties'
	var weekOfSummer= '1';
	var trapLocation= '';
	var humanCase=0;
	var numComparisons= 0;

	populateCountyOptions();

	//CREATE THE MAP
	google.maps.visualRefresh=true;
	var mapProp = 
	{
		center:new google.maps.LatLng(47.6,-100.4),
		zoom:6,
		mapTypeId:google.maps.MapTypeId.ROADMAP,
		scrollwheel: true
	};
	var map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
	var layer = new google.maps.FusionTablesLayer();
	layer.setMap(map);
	updateLayerQuery(layer,map, year,county, weekOfSummer,species) 
	createLegend(map,year,species);//CREATE THE LEGEND


	//----------------------------------------------Listeners-------------------------------------------------------------------------------
	google.maps.event.addDomListener(document.getElementById('year'),'change', function()  //LISTENS FOR THE CHANGE OF YEAR!
	{
		year = this.value;
		updateLayerQuery(layer,map, year,county, weekOfSummer,species); 
		updateLegendContent(year,species);
	});
	google.maps.event.addDomListener(document.getElementById('weekOfSummer'),'change', function()  //LISTENS FOR THE CHANGE OF YEAR!
	{
		weekOfSummer = this.value;
		updateLayerQuery(layer,map, year,county, weekOfSummer,species);
		updateLegendContent(year,species);
	});
	google.maps.event.addDomListener(document.getElementById('species'),'change',function()//ONCE THIS EVENT FIRES, WE WANT THE MAP TO DISPLAY THE DENSITY OF THE SELECTED SPECIES BY COUNTY!
	{
		species=this.value; 
		updateLayerQuery(layer,map, year,county, weekOfSummer,species); 
		updateLegendContent(year,species);	
	});
	google.maps.event.addDomListener(document.getElementById('countyOptions'),'change',function()//This will update the map to display only the selected county.
	{
		county = this.value;
		showCounty(county,trapLocation,weekOfSummer);	
	});
	google.maps.event.addDomListener(document.getElementById('trapLocation'),'change',function()//This will update the map to display only the selected county.
	{
		trapLocation = this.value;
		showCounty(county,trapLocation,weekOfSummer);	
	});
	//-----------------------------------------CREATE THE INFO WINDOW-----------------------------------------------------------------------
	google.maps.event.addListener(layer, 'click', function(e) //pulls data from the below specified columns in our table
	{ //listener for clicking on the map
		var totalMosquitos = e.row['Total_Mosquitoes'].value;
        var maxTemp = e.row['MaxTemp'].value;
		var minTemp =e.row['MinTemp'].value;
		var totRain=e.row['Rainfall'].value;
		var WNVcases=e.row['WNVcases'].value;
		//I need to add other parameters(wind etc.) here. but there is no data in the table so theres no point as of now.
	    var county = e.row['Counties'].value;
	    var week = e.row['Week_of_Summer'].value;
	    var trapLoc= e.row['Trap.Location'].value;
	    var speciesName=species;   //Need to make a new variable in order to hold species name since we dont want to manipulate the actual species.
	    var speciesDensity = e.row[species].value;
	    var currentYear = e.row['Year'].value;
	    var risk= '';
	    var humanCase='';
	    if(WNVcases==1)
	    {
	    	humanCase ="<br><p class='high'>There has been a positvely tested WNV case!</p>"
	    }
	    //alert(humanCase);
	   // alert("The Species is: "+ species +" The Value of SpeciesDensity is: "+speciesDensity)
		 if(species == 'tmale')
		 {
			speciesName = "male mosquito"; //changes the species from tmale to male mosquito so it looks good in the info window
		 }
		 else if(species == 'tfemale')
		 {
		 	speciesName =='female mosquito'; //changes the species from tfemale to female mosquito so it looks good in the info window
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
		var infoWin='<strong>' + county + ' County, ' + trapLoc +' Location, Data For Summer Week ' + week + ' Year ' + currentYear + '</strong>'+
								'<br><br> Total recorded ' + speciesName +' traps: ' + e.row[species].value + 
								 '<br>Total Human Cases: Coming Soon' + 
								 humanCase +
								 risk; //PUTS TOGETHER THE DATA TO BE SHOWN IN THE INFO WINDOW!
	    e.infoWindowHtml =  infoWin;
	    updateGeneralData(year, county,totalMosquitos, maxTemp,minTemp,totRain,numComparisons);		  
	});
	//---------------------------------------------end listeners----------------------------------------------------------------------------
} //END INITIALIZE FUNCTION

//-------------------------------------------------ALL FUNCTIONS | Source code adapted from: https://developers.google.com/fusiontables/docs/samples/adv_fusiontables-------------------------------------------------------------------------------------------------
	function updateLayerQuery(layer,map, year,county, weekOfSummer,species) 
	{
		if(county=='allCounties')
		{	
			var where = generateWhere(year,weekOfSummer);
		}
		else if(county!='allCounties')
		{	
			var where=generateWhereYC(year,county,weekOfSummer);
		}
		layer.setOptions({query:{select:'geometry',from:'1W83OZ_bhXcDKLuA9PmZPXAW-MB-TrTX8i3vQIDK_', where: where}});
		google.maps.visualRefresh=true;

		//-------------------UPDATE THE LAYER STYLE---------------------------------
		var colors=testCol; //testCol contains only three colors, green yellow and red, it reduces accuracy but looks clean
		var minNum= 0;
		var maxNum=30;//Whats the upper bound for trap count by week, also how would we want to differently display the data when there is a positively tested WNV case

		var step= (maxNum-minNum) / colors.length; //10/3 = 0, 6, 13
		var styles = new Array();
		for(var i=0;i<colors.length;i++) //Originally: Generates the conditions to color each polygon slightly more red with growing population iterates 22 times //Now it only does G.Y.R. based on density 
		{	
			var newMin = minNum + step *i;
			//alert(generateWhereYS(newMin,year,species,weekOfSummer)+ " Is filled with " + colors[i]);
			styles.push({where:generateWhereYS(newMin,year,species,weekOfSummer), polygonOptions: {fillColor:colors[i],fillOpacity: 1,strokeColor: '#000000', strokeWeight: 3}}); //gives just enough transparency so you can really get a feel for the map
		//UPDATE 7.16.16 I THINK THAT THIS IS QUERYING AND DISPAYING DIFFERENT DATA THAN THAT WHICH IS BEING SHOWN IN INFO WINDOWS
		}
		layer.set('styles',styles);
		layer.setMap(map);
		google.maps.visualRefresh=true;
		google.maps.event.trigger(map, 'resize');
    }
	function generateWhere(year,weekOfSummer) //Generates a simple where clause for selecting the year from the fusion table
	{
		var whereClause = new Array();
        whereClause.push("Year = '");
        whereClause.push(year);
		whereClause.push("'")
		whereClause.push(" AND Week_of_Summer = '");
		whereClause.push(weekOfSummer);
		whereClause.push("'");
        return whereClause.join('');
	}
	function generateWhereYC(year, county,trapLocation,weekOfSummer) //YC stands for year and county. This creates the conditions for year and county, is used to display only one county and the specific trap location
	{
		var whereClause = new Array();
        whereClause.push("Year = '");
        whereClause.push(year);
		whereClause.push("'");
		whereClause.push(" AND Counties = '");
		whereClause.push(county);
		whereClause.push("'");
		whereClause.push(" AND Week_of_Summer = '");
		whereClause.push(weekOfSummer);
		whereClause.push("'' AND Trap.Location = '");
		whereClause.push(trapLocation);
		whereClause.push("'");
        return whereClause.join('');
	}
	function generateWhereYS(minNum, year,species,weekOfSummer)//YS stands for year and species
	{ //adapeted from Calvins work
		var whereClause = new Array();
		whereClause.push("Year = '");
	    whereClause.push(year);
	    whereClause.push("' AND ");
	    whereClause.push(species);
	    whereClause.push(" >= '");
	    whereClause.push(minNum);
	    whereClause.push("' AND Week_of_Summer = '");
		whereClause.push(weekOfSummer);
		whereClause.push("'");
	    return whereClause.join('');
	}
	function createLegend(map,year,species)
	{
		var legend=document.getElementById('legend');
		updateLegendContent(year,species);
		map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(document.getElementById('legend'));
	}
	function updateLegendContent(year,species)
	{
		var legend = document.getElementById('legend');
		var title = year + " " +species + ' Trap Count Density';
		legend.innerHTML = '<strong><center>' + title + '</strong></center>';
		var colors = ['green','yellow','red'] //GREEN, YELLOW, RED
		var range=[0,6,13];
		var riskLevel=['low','moderate','high'];
		for(var i=0; i < colors.length; i++)
		{
			var colorBox = document.createElement('div');
			colorBox.id=colors[i];
			colorBox.innerHTML='<strong><center> >' + range[i] + "  " + riskLevel[i];

			legend.appendChild(colorBox);
		}
	}
	function updateGeneralData(year, county,totalMosquitos, maxTemp,minTemp,totRain,numComparisons)
	{
		//alert("NumComparisons: "+numComparisons);
		if(numComparisons==0)
		{
		
		}
		if(numComparisons<3)
		{
			var genData = document.createElement('div');
			genData.id = "generalData";
			var title= "General Data for " + county +" county for the Year: " + year;
			var info =        '<strong><center>' + title + '</strong></center>'
							  + "<br>Total Mosquitoes: " + totalMosquitos
							  +	"<br>Max Temperature: " + maxTemp
							  + "<br>Min Temperature: "	+ minTemp
							  + "<br>Total Rainfall: "	+totRain;
			genData.innerHTML=info;//sets the inside of the div to our info variable
			document.body.appendChild(genData);
			numComparisons= numComparisons+1;//Used to increment the number of boxes on the screen
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

	function showCounty(county, trapLocation,weekOfSummer)
	{
		if(county!='allCounties')
		{
			var where = generateWhereYC(year, county, trapLocation,weekOfSummer);
			layer.setOptions({query:{select:'geometry',from:'1W83OZ_bhXcDKLuA9PmZPXAW-MB-TrTX8i3vQIDK_', where: where}});
			alert(where);
		}
		else if(county='allCounties')
		{
			var where = generateWhere(year,weekOfSummer);
			layer.setOptions({query:{select:'geometry',from:'1W83OZ_bhXcDKLuA9PmZPXAW-MB-TrTX8i3vQIDK_', where: where}});
			alert(where);
		}
	}

