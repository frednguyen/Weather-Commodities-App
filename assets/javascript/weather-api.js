// Initialize Firebase
var config = {
apiKey: "AIzaSyD5onGD-yX2IvrbzyEiNJ2Y7DfsjNQz0EA",
authDomain: "weather-commodities-app.firebaseapp.com",
databaseURL: "https://weather-commodities-app.firebaseio.com",
storageBucket: "weather-commodities-app.appspot.com",
messagingSenderId: "917117502463"
};
firebase.initializeApp(config);

//===============API Variables====================
//token for accessing API
    //hard-coded---needs to be dynamically created from user input. Use moment.js
var token = "sUtCbQRELKcKTvcahYjUDGMtwcoeqrmz";
//data set is specific type of data called from NOAA api
    //hard-coded---needs to be dynamically created from user input. Use moment.js
var dataSet = "GSOM";
//category id's: TEMP, PRCP(precipitation), WATER, SUTEMP(summer temperature), SUPRCP(summer preciptation)
    //hard-coded---needs to be dynamically created from user input. Use moment.js
var dataCategory = "TEMP";
//data types
    //hard-coded---needs to be dynamically created from user input. Use moment.js
var dataType1 = "TMAX";
var dataType2 = "TAVG";
var dataType3 = "PRCP";
//location
//hard-coded---needs to be dynamically created from user input. Use moment.js
var loc = "CITY:US170002";
//station
//hard-coded---needs to be dynamically created from user input. Use moment.js
var stn;
//start date
//hard-coded---needs to be dynamically created from user input. Use moment.js
var startDate = "2010-01-01";
//end date
//hard-coded---needs to be dynamically created from user input. Use moment.js
var endDate = "2016-12-31";
//name of commodity being searched
//hard-coded---needs to be dynamically created from user input.
var commodityName;
//name of location queried for data
var locName;
//API return limit (max=1000)
var limit = "1000";

//============click events=============
/* 
1. need to set commodityName, location, start date, end date
2. only call API once all variables have been set (use submit button?)
*/
var locEnetered = false;
var commodityEntered = false;
//click event for corn commodity
    //sets commodity name
$("#commodity-corn-btn").on('click',function(){
    commodityEntered = true
    //add data attribute, data-name = corn
    $(this).attr('data-name', 'corn');
})
//click event for location
    //sets name of station from map location
$("#locationIllinois").on('click',function(){
    //gets data attribute from button clicked
    locEntered = true;
    stn = $(this).data('id');
    console.log("station id (stn)")
    console.log(stn)
    locationApiQuery();
})

//click event for submit button (all data collected)
    //here coded for input-type
$("#submit-button").on('click',function(){
    //checks if location and commodity entered
    if (!commodityEntered) {
        alert("choose commodity!")
    } else if (!locEntered) {
        alert("choose location!")
    } else {
        //commodityName set from data attribute of button element
        commodityName = $("#commodity-corn-btn").data('name');
        //gets input text from start date input field with id = #startDate-submit
        startDate = moment($("#startDate-submit").val().trim(), "MM-DD-YYYY").format("YYYY-MM-DD");
        //gets input text from start date input field with id = #startDate-submit
        endDate = moment($("#endDate-submit").val().trim(), "MM-DD-YYYY").format("YYYY-MM-DD");

        // run weather data API functions - get data and store into firebase
        temperatureApiQuery();
        precipitationApiQuery();
        console.log("commodity Name variable: " + commodityName);
        console.log("start date: " + startDate);
        console.log("end date: " + endDate);  
    }
    return false; 

})
//===============API AJAX Calls===================
function locationApiQuery() {
    //AJAX url only for determining name of location
    var nameQueryURL = "https://www.ncdc.noaa.gov/cdo-web/api/v2/stations/"+stn;
    $.ajax({ url:nameQueryURL, headers:{ token:token } }).done(function(response){
         locName = response.name;
        console.log(locName);
    });  
}
//AJAX query url for TEMPERATURE weather data
function temperatureApiQuery() {
    var tempQueryURL = "https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid="+dataSet+"&datatypeid=TAVG&stationid="+stn+"&units=metric&startdate="+startDate+"&enddate="+endDate+"&limit="+limit;
    $.ajax({ url:tempQueryURL, headers:{ token:token } }).done(function(response){
        var tempData = response.results;
        console.log(response);

        //API location id
        var locationId = loc;
        //variable for array of dates
        var dateArray = [];

        //collects temp and date data from API JSON and assigns to array index(i)
        function collectDateInfo(){
          for (var i = 0; i < tempData.length; i++){
            dateArray[i] = {
                date: tempData[i].date,
                temperature: {
                    temp: tempData[i].value
                }
            }
          }
        }
        //looping through ajax JSON to store relevant data (date, temp) in array
        for(var i in tempData){
            //checks if property index has value
            if(tempData.hasOwnProperty(i)) {
                //call for function that populates weatherObject
                collectDateInfo(i);
            }
        }
            //dynamically created object of cleaned data for location, date, temp
        var temperature = {
          commodity: {
            name: commodityName,
            location: {
                Name: locName,
                date: {
                    dateArray
                },
            }
          }
        }
        // =======FIREBASE data push===========
        var database = firebase.database();
        var weatherData = database.ref("weather/temperatureData");
        weatherData.push({
            temperature: temperature
        });
        console.log("====Constructed TEMP Object====");
        console.log(temperature);
    });
}
//AJAX query url for PRECIPITATION weather data
function precipitationApiQuery() {
    var prcpQueryURL = "https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid="+dataSet+"&datatypeid=PRCP&stationid=GHCND:USC00110764&units=metric&startdate="+startDate+"&enddate="+endDate+"&limit="+limit;
    $.ajax({ url:prcpQueryURL, headers:{ token:token } }).done(function(response){
        var prcpData = response.results;
        console.log(response);
        //API location id
        var locationId = loc;
        //variable for array of dates
        var dateArray = [];
        //dynamically created object of cleaned data for location, date, temp
        precipitation = {
          commodity: {
            name: commodityName,
            location: {
                Name: locName,
                date: {
                    dateArray
                },
            }
          }
        }
        //collects temp and date data from API JSON and assigns to array index(i)
        function collectDateInfo(){
          for (var i = 0; i < prcpData.length; i++){
            dateArray[i] = {
                dates: prcpData[i].date,
                precipitation: {
                    prcp: prcpData[i].value
                }
            }
          }
        }
        //looping through ajax JSON to store relevant data (date, temp) in array
        for(var i in prcpData){
            //checks if property index has value
            if(prcpData.hasOwnProperty(i)) {
                //call for function that populates weatherObject
                collectDateInfo(i);
            }
        }
        //=======FIREBASE data push===========
        var database = firebase.database();
        var weatherData = database.ref("weather/precipitationData");
        weatherData.push({
            precipitation:precipitation
        });
        console.log("====Constructed PRECIPITATION Object====");
        console.log(precipitation);
    });
}



