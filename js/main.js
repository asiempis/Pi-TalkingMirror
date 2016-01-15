jQuery.fn.updateWithText = function(text, speed)
{
	var dummy = $('<div/>').html(text);

	if ($(this).html() != dummy.html())
	{
		$(this).fadeOut(speed/2, function() {
			$(this).html(text);
			$(this).fadeIn(speed/2, function() {
				//done
			});		
		});
	}
} 

$.urlParam = function(name, url) {
    if (!url) {
     url = window.location.href;
    }
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
    if (!results) { 
        return undefined;
    }
    return results[1] || undefined;
}


jQuery.fn.outerHTML = function(s) {
    return s
        ? this.before(s).remove()
        : jQuery("<p>").append(this.eq(0).clone()).html();
};

function roundVal(temp)
{
	return Math.round(temp * 10) / 10;
}

function kmh2beaufort(kmh)
{
	var speeds = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, 1000];
	for (var beaufort in speeds) {
		var speed = speeds[beaufort];
		if (speed > kmh) {
			return beaufort;
		}
	}
	return 12;
}
	

jQuery(document).ready(function($) {

	var news = [];
	var newshead = [];
	var newsIndex = 0;
	var eventList = [];
	var lastCompliment;
	var compliment;
	var lang = "en";
	
	
	var feed				= 'http://feeds.mashable.com/Mashable?format=xml';
	var lang 				= 'en';
	var weatherParams 		= {'q':'Athens,GR','units':'metric','lang':lang,'APPID':'b338b6aac100a60cd2953a20d28486ab'};
	var locale = {'q':' - Athens'};
	
	var datelabel 	= 'Day';
	var morning 	= ['Good Morning!','Have a nice day!'];
	var afternoon 	= ['Are you hungry?','Looking good today!'];
	var early_evening 	= ['Good evening!','I hope you had a nice day at work'];
	var evening 	= ['Good Night!','Is it time for sleep?'];
	moment.locale(lang);
   
	
	(function updateTime()	{
		var now = new Date();
		var day = now.getDay();
		var date = now.getDate();
		var month = now.getMonth();
		var year = now.getFullYear();
		var date = moment.weekdays(day) + ', ' + date+' ' + moment.months(month) + ' ' + year;
		$('.date').html(date);
		$('.time').html(now.toTimeString().substring(0,5) + '<span class="sec">'+now.toTimeString().substring(6,8)+'</span>');
		
		setTimeout(function() {
			updateTime();
		}, 1000);//1 second
	})();
	
	
	(function updateCompliment() {
	  while (compliment == lastCompliment) {
      //Check for current time  
      var compliments;
      var date = new Date();
      var hour = date.getHours();
      //set compliments to use
      if (hour >= 3 && hour < 13) compliments = morning;
      if (hour >= 13 && hour < 17) compliments = afternoon;
	  if (hour >= 17 && hour < 21) compliments = early_evening;
      if (hour >= 21 || hour < 3) compliments = evening;

		compliment = Math.floor(Math.random()*compliments.length);
		}

		$('.compliment').updateWithText(compliments[compliment], 4000);

		lastCompliment = compliment;

		setTimeout(function() {
			updateCompliment(true);
		}, 30000); // 30 seconds

	})();

	(function updateCurrentWeather() {
		var iconTable = {
			'01d':'wi-day-sunny',
			'02d':'wi-day-cloudy',
			'03d':'wi-cloudy',
			'04d':'wi-cloudy-windy',
			'09d':'wi-showers',
			'10d':'wi-rain',
			'11d':'wi-thunderstorm',
			'13d':'wi-snow',
			'50d':'wi-fog',
			'01n':'wi-night-clear',
			'02n':'wi-night-cloudy',
			'03n':'wi-night-cloudy',
			'04n':'wi-night-cloudy',
			'09n':'wi-night-showers',
			'10n':'wi-night-rain',
			'11n':'wi-night-thunderstorm',
			'13n':'wi-night-snow',
			'50n':'wi-night-alt-cloudy-windy'		
		}
		

		$.getJSON('http://api.openweathermap.org/data/2.5/weather', weatherParams, function(json, textStatus) {

			var temp = roundVal(json.main.temp);
			var temp_min = roundVal(json.main.temp_min);
			var temp_max = roundVal(json.main.temp_max);

			var wind = roundVal(json.wind.speed);

			var iconClass = iconTable[json.weather[0].icon];
			var icon = $('<span/>').addClass('icon').addClass('dimmed').addClass('wi').addClass(iconClass);
			$('.temp').updateWithText(icon.outerHTML()+temp+'&deg;', 1000);

			var now = new Date();
			var sunrise = new Date(json.sys.sunrise*1000).toTimeString().substring(0,5);
			var sunset = new Date(json.sys.sunset*1000).toTimeString().substring(0,5);

			var windString = '<span class="wi wi-strong-wind xdimmed"></span> ' + kmh2beaufort(wind) ;
			var sunString = '<span class="wi wi-sunrise xdimmed"></span> ' + sunrise;
			if (json.sys.sunrise*1000 < now && json.sys.sunset*1000 > now) {
				sunString = '<span class="wi wi-sunset xdimmed"></span> ' + sunset;
			}

			$('.windsun').updateWithText(windString+' '+sunString+'  '+locale.q, 1000);
			
			
		});
			
		setTimeout(function() {
			updateCurrentWeather();
		}, 14400000); //  4 hours
	})();

	(function updateWeatherForecast() {
			$.getJSON('http://api.openweathermap.org/data/2.5/forecast', weatherParams, function(json, textStatus) {

			var forecastData = {};

			for (var i in json.list) {
				var forecast = json.list[i];
				var dateKey  = forecast.dt_txt.substring(0, 10);

				if (forecastData[dateKey] == undefined) {
					forecastData[dateKey] = {
						'timestamp':forecast.dt * 1000,
						'temp_min':forecast.main.temp,
						'temp_max':forecast.main.temp
					};
				} else {
					forecastData[dateKey]['temp_min'] = (forecast.main.temp < forecastData[dateKey]['temp_min']) ? forecast.main.temp : forecastData[dateKey]['temp_min'];
					forecastData[dateKey]['temp_max'] = (forecast.main.temp > forecastData[dateKey]['temp_max']) ? forecast.main.temp : forecastData[dateKey]['temp_max']; 
				}

			}

			var forecastTable = $('<table />').addClass('forecast-table');
			var opacity = 1;
			var rowhead = $('<tr />').css('opacity', opacity);
			
			rowhead.append($('<td/>').addClass('day').html(datelabel));
			rowhead.append($('<td/>').addClass('temp-min').html('Min'));
			rowhead.append($('<td/>').addClass('temp-max').html('Max'));
			forecastTable.append(rowhead);
			for (var i in forecastData) {
				var forecast = forecastData[i];
				var dt = new Date(forecast.timestamp);
				var row = $('<tr />').css('opacity', opacity);

				row.append($('<td/>').addClass('day').html(moment.weekdaysMin(dt.getDay())));
				row.append($('<td/>').addClass('temp-min').html(roundVal(forecast.temp_min).toFixed(1))); 
				row.append($('<td/>').addClass('temp-max').html(roundVal(forecast.temp_max).toFixed(1)));
			
				forecastTable.append(row);
				opacity -= 0.155;
			}


			$('.forecast').updateWithText(forecastTable, 1000); // 1 second
		});

		setTimeout(function() {
			updateWeatherForecast();
		}, 14400000 );//  4 hours
	})();

	(function fetchNews() {
		$.feedToJson({
			feed: feed,
			success: function(data){
				newshead = [];
				news 	 = [];
				for (var i in data.item) {
					var item = data.item[i];
					var desc = item.description;
					news.push(desc);
					newshead.push('Latest News: '+item.title);
					
				}
				
			}
		});
		
		setTimeout(function() {
			fetchNews();
		}, 3600000); // 1 hours
	})();

	(function showNews() {
		var newsHead = newshead[newsIndex];
		var newsItem = news[newsIndex];
		
		$('.newshead').updateWithText(newsHead,3000); // 3 seconds
		$('.news').updateWithText(newsItem,3000);// 3 seconds

		newsIndex--;
		if (newsIndex < 0) newsIndex = news.length - 1;
			setTimeout(function() {
				showNews();
			}, 7000);// 7 seconds
	})();
	
	(function iCanHereYou() {
		if (annyang) {
				
		  var weather = function() {
		     	var temp = $( "#temp" ).text();
		    	console.log(temp);
		    	speak("Current Temperature is "+temp+" Celsius");
		  };
		   
		  var time = function() {
		     	var now = new Date();
		    	var time = now.toTimeString().substring(0,5)
		    	console.log(time);
		    	speak("The time is "+time);
		  };
		  
	  	var sports = function() {
	  		$('#display-area ul').empty();
		 	$('#display-area div').empty();
     		$.feedToJson({
				feed: "http://sports.yahoo.com/soccer//rss.xml",
				success: function(data){
					if(data.item.length > 1) data = data.item;
					data = data.slice(0, 5);
					$.each(data, function(){
						$('#sports').append('<li>' + this.title + '</li>');
					});
				}
			});
		  };
			  
		 var hungry = function() {
		 	$('#display-area ul').empty();
		 	$('#display-area div').empty();
     	    $.getJSON( "meal.json", function( data ) {
				$.each( data, function( key, val ) {
					$('#lunch').append("Today's lunch: "+val.meal);
					speak("Today's lunch: "+val.meal);
				});
			});
		 } 
		  			  
		 var close = function(id) {
		   	$('#'+id).empty();
		 }
		  
		  // Let's define a command.
		  var commands = {
		    'weather': weather,
		    '(what) time (is it)': time,
		    'sports':sports,
		    '(feeling) hungry': hungry,
		    'close :tag':close,
		  };
		  
		  annyang.debug();
		  // Add our commands to annyang
		  annyang.addCommands(commands);
		
		  // Start listening.
		  annyang.start();
		}
	})();
			
});

