const input = document.querySelector("#inputfield");
const button = document.querySelector("#searchbtn");
const ApiKey = '87cac5df01b4cc0252e410c2b544608c';
const cityname = document.querySelector(".cityName");
const date = document.querySelector("#presentDate");
const temp = document.querySelector("#temp");
const wind = document.querySelector("#wind");
const humidity = document.querySelector("#humidity");
const icon = document.querySelector("#weathericon");
const summary = document.querySelector(".weathersummary");
const weatherdiv = document.querySelector(".weatherdiv");
const forecastcontainer = document.querySelector(".forecastcontainer");
const recentToggle = document.querySelector("#recentToggle")
const recentList = document.querySelector("#recentList")
const currentbtn = document.querySelector("#currentbtn")

let historyitems = localStorage.getItem("historyitems") ? JSON.parse(localStorage.getItem("historyitems")) : []
//empty array initially, if there is no data in local storage, it will be empty
//if there is data, it will be parsed and stored in historyitems


function updateRecentCities(city) {
  if (!historyitems.includes(city)) {
    historyitems.unshift(city);
    localStorage.setItem("historyitems", JSON.stringify(historyitems));
    renderRecentDropdown();//function to show the list of searched cities
  }
}


currentbtn.addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(pos => {//location api
    //get the current position of the user
    const { latitude, longitude } = pos.coords;
    getcurrentweather(latitude,longitude)
  });
});


function renderRecentDropdown() {
  recentList.innerHTML = '';
  if(historyitems.length==0){
    recentToggle.style.display="none";
  }else{
    recentToggle.style.display="block"
  }
  historyitems.forEach((city) => {//dropdown items
    const li = document.createElement('li');
    li.innerHTML = city;
    li.className = 'py-2 hover:bg-gray-300 text-center cursor-pointer';
    li.onclick = () => weatherrender(city)
    recentList.appendChild(li);
  });
}


recentToggle.addEventListener('click', () => {
  recentList.classList.toggle('hidden');//historyitems list toggle
});


button.addEventListener("click",()=>{//weather display with mouse click
  const city=input.value;
  if(city=="")return;
  weatherrender(city)
  input.value=""
})

input.addEventListener("keydown",(event)=>{
  if(event.key=="Enter" && input.value.trim()!=""){//weather display with enter key
    weatherrender(input.value)
    input.value=""
  }
})
async function getcurrentweather(lat,lon){
  const Url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${ApiKey}&units=metric`//openweathermap api for coordinates
  const currentReponse = await fetch(Url)
  const currentData = await currentReponse.json()
  weatherrender(currentData.name)
}
  
async  function getWeatherData(endPoint,city){
try{
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${ApiKey}&units=metric`//fetching with city name
  const response = await fetch(apiUrl)
  return response.json()
}catch{
  alert("error")
}
}

async function weatherrender(city){
  const weatherData = await getWeatherData('weather',city)//fectching current date weather data
  const forecastData = await getWeatherData('forecast',city)//fetching forecast data
 if(weatherData.cod!=200){
  alert("Enter a valid city name")
  return  
 }
  displaytemp(weatherData)
  displayForecast(forecastData)
  updateRecentCities(city)
}

function displaytemp(weatherData){//function to display present weather
weatherdiv.style.display="inline"
let getdate = new Date()
getdate = getdate.toString().split(" ")
getdate = getdate[1] + " " + getdate[2] + " " + getdate[3] 
cityname.innerHTML=weatherData.name+" - "+getdate;
temp.innerHTML="Temperature-"+Math.round(weatherData.main.temp)+"°C";
wind.innerHTML="Wind-"+weatherData.wind.speed+"m/s";
humidity.innerHTML="Humidity-"+weatherData.main.humidity+"%";
summary.innerHTML=weatherData.weather[0].main;
icon.src=`${geticon(weatherData.weather[0].id)}`
}


function geticon(id){//function to get the icon of the weather
  if(id<=232){
    return "thunderstorm.png"
  }else if(id<=321){
  return "drizzle.png"
  }else if(id<=531){
  return "rain.png"
  }else if(id<=622){
  return "snow.png"
  }else if(id<=781){
  return "mist.png"
  }else if(id==800){
  return "sunny.webp"
  }else{
    return "clouds.png"
  }
}

function displayForecast(forecastData){//forecast filter down, for only one time period from the forecastData
  forecastcontainer.innerHTML=""
  const timeTaken = '12:00:00'
  const todayDate =  new Date().toISOString().split('T')[0]
  forecastData.list.forEach(forecast=>{
    if(forecast.dt_txt.includes(timeTaken)){
      forecastitems(forecast)
    }
  })
}
function forecastitems(fore){//below is rendering of the forecast for 5 days
  const date = new Date(fore.dt * 1000).toLocaleDateString();
  const {
    weather:[{id}],
    main:{temp,humidity},
    wind:{speed}
  }=fore
  forecastcontainer.innerHTML+=`
          <div class="flex flex-col w-[208px] h-[200px] bg-gray-200 justify-center items-center">
            <h2 id="day1date">${date}</h2>
            <img class="day1icon w-[60px]" src="${geticon(id)}" alt="">
            <p id="day1temp">Temperature-${Math.round(temp)}°C</p>
            <p id="day1wind">Wind-${speed}m/s</p>
            <p id="day1humidity">Humidity-${humidity}%</p>
          </div>
  `
}
renderRecentDropdown()