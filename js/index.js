$(function () {

  // 逐日预报
  $('.ri').on('click', function () {
    $('.weather-content').css("display","block");
    $('.weather-content1').css("display","none");

  })
  
  // 逐时预报
  $('.shi').on('click', function () {
    $('.weather-content1').css("display","block");
    $('.weather-content').css("display","none");
  })
  let currentIndex = 0;

  //切换标签
  $('.title-item').on('click', function () {

    //获取下标
    let index = $(this).index();
    // console.log('index ==> ', index);

    //如果当前已经选中，则不做任何事情
    if (currentIndex == index) {
      console.log('当前已选中');
      return;
    }

    //获取html的font-size
    let fontSize = parseFloat($('html').css('font-size'));
    // console.log('fontSize ==> ', fontSize);

    //获取当前元素的宽度
    let currentWidth = $(this).width();
    // console.log('currentWidth ==> ', currentWidth);

    //如何将currentWidth转成rem值
    var distance = currentWidth / fontSize + 0.4;
    // console.log('distance ==> ', distance);

    //移动下划线
    $('.move-line').animate({
      left: index * distance + 'rem'
    }, 200);

    currentIndex = index;

  })
  //搜索
  $('.search-icon').on('click', function () {
    //获取输入的城市
    let city = $('.search-ipt').val();
    getWeatherByCity(city);
  })

  //腾讯地图API定位, 获取城市天气
  function locationIP() {
    $.ajax({
      type: 'GET',
      url: 'https://apis.map.qq.com/ws/location/v1/ip',
      data: {
        key: 'QT2BZ-WNFCF-JUFJ5-NTECT-GCONQ-IVBUF',
        output: 'jsonp'
      },
      //响应数据类型
      dataType: 'jsonp',
      success: function (result) {
        console.log('result ==> ', result);
        $('.location-text').text(result.result.ad_info.city);
        //获取城市天气数据
        getWeatherByCity(result.result.ad_info.city);
      },
      error: function (err) {
        console.log('err ==> ', err);
      }
    })
  }

  //获取城市天气数据
  function getWeatherByCity(city) {

    if (city == '') {
      console.log('暂无天气数据');
      return;
    }

    //city: 城市
    $.ajax({
      type: 'GET',
      url: 'https://api.heweather.net/s6/weather/',
      data: {
        location: city,
        key: '194d2c376d2645b29967be8c62b60a14'
      },
      success: function (result) {
        console.log('实况天气 result ==> ', result);

        if(result.HeWeather6[0].status == 'unknown location'){
          console.log('不存在该城市天气');
          return;
        }

        $('.location-text').text(city);
        $('.search-ipt').val(' ');

        weatherData = result;

        let weather = result.HeWeather6[0];

        $('.w').each(function () {
          //获取当前元素的id
          let id = $(this).attr('id');
          $(this).text(weather.now[id]);
        })

        //设置最低温和最高温
        let minTmp = weather.daily_forecast[0].tmp_min;
        let maxTmp = weather.daily_forecast[0].tmp_max;
        let tmpRange = `${minTmp}℃~${maxTmp}℃`
        $('#tmp-range').text(tmpRange);

        // 逐日预报
        function render1(){
          let html = "";
          for (let i = 0; i < weather.daily_forecast.length; i++) {
            let date = weather.daily_forecast[i].date.slice(5);
            html += `
            <div class="weather-item fl">
              <div class="nav">
                <div>${date}</div>
                <div>${weather.daily_forecast[i].cond_txt_d}</div>
              </div>
              <div class="weather-icon">
                <img src = "./images/icons/${weather.daily_forecast[i].cond_code_d}.png">
              </div>
              <div class="nav">${weather.daily_forecast[i].tmp_min}℃~${weather.daily_forecast[i].tmp_max}℃</div>
            </div>
            `
        }
        $('.weather-list').html(html);

        $('.weather-list').css({
          width: 0.8 * weather.daily_forecast.length + 'rem'
        })
      }
      render1();

        // 逐日预报
        function render2(){
          let html = "";
          for (let i = 0; i < weather.hourly.length; i++) {
          let date = weather.hourly[i].time.split(' ')[1];
            html += `
            <div class="weather-item fl">
              <div class="nav">
                <div>${date}</div>
                <div>${weather.hourly[i].cond_txt}</div>
              </div>
              <div class="weather-icon">
                <img src = "./images/icons/${weather.hourly[i].cond_code}.png">
              </div>
              <div class="nav">${weather.hourly[i].tmp}℃</div>
            </div>
            `
        }
        $('.weather-list1').html(html);

        $('.weather-list1').css({
          width: 0.8 * weather.hourly.length + 'rem'
        })
      }
      render2();

        //获取分钟级降水
        getWeatherByMinute(weather.basic.lon, weather.basic.lat);
      },
      error: function (err) {
        console.log('err ==> ', err);
      }
    })
  }

  //获取分钟级降水
  function getWeatherByMinute(lon, lat) {
    console.log('lon ==> ', lon);
    console.log('lat ==> ', lat);
    //lon: 经度
    //lat: 纬度
    $.ajax({
      type: 'GET',
      url: 'https://api.heweather.net/s6/weather/grid-minute',
      data: {
        location: lon + ',' + lat,
        key: '194d2c376d2645b29967be8c62b60a14'
      },
      success: res => {
        console.log('分钟级降水 res ==> ', res);
        $('.preview').text(res.HeWeather6[0].grid_minute_forecast.txt);
      },
      error: err => {
        console.log('err ==> ', err);
      }
    })
  }

  setBackground();
  function setBackground(){
    let time = new Date().getHours();
    let weatherBox = $('.weather-box');

    let t = '';

    if(time >=6 && time < 12){
      t = 'morning';
    }else if (time >= 12 && time < 19){
      t = 'day';
    }else{
      t = 'night';
    }

    weatherBox.addClass(t);
  }
  locationIP();

})