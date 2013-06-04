var getJSON = require('../getJSON').getJSON;

var subData = {red:null};

function millisecondsToStr(milliseconds) {
    var oneHour = 3600000;
    var oneMinute = 60000;
    var oneSecond = 1000;
    var seconds = 0;
    var minutes = 0;
    var hours = 0;
    var result;

    if (milliseconds >= oneHour) {
        hours = Math.floor(milliseconds / oneHour);
    }

    milliseconds = hours > 0 ? (milliseconds - hours * oneHour) : milliseconds;

    if (milliseconds >= oneMinute) {
        minutes = Math.floor(milliseconds / oneMinute);
    }

    milliseconds = minutes > 0 ? (milliseconds - minutes * oneMinute) : milliseconds;

    if (milliseconds >= oneSecond) {
        seconds = Math.floor(milliseconds / oneSecond);
    }

    milliseconds = seconds > 0 ? (milliseconds - seconds * oneSecond) : milliseconds;

    if (hours > 0) {
        result = (hours > 9 ? hours : "0" + hours) + ":";
    } else {
        result = "00:";
    }

    if (minutes > 0) {
        result += (minutes > 9 ? minutes : "0" + minutes) + ":";
    } else {
        result += "00:";
    }

    if (seconds > 0) {
        result += (seconds > 9 ? seconds : "0" + seconds);
    } else {
        result += "00";
    }

    return result;
}


exports.update = function(){
    var rex = /^RSOU/;
    getJSON({
        host:'developer.mbta.com',
        path:'/Data/Red.json',
        port:80,
        method:'GET'
    },function(code,data){
        var i, stn, now=new Date();
        subData.red = data;
        subData.ssn = [];
        subData.nextRed = {TimeRemainingMillis:1e20};
        for(i in data){
            stn = subData.red[i];
            switch(stn['PlatformKey']){
                case 'RSOUN':
                    stn.Time = new Date(stn.Time);
                    stn.TimeRemainingMillis = stn.Time-now;
                    subData.ssn.push(stn);
                    if(stn.InformationType === 'Predicted'
                        && stn.TimeRemainingMillis > 0
                        && stn.TimeRemainingMillis < subData.nextRed.TimeRemainingMillis){
                        stn.TimeRemaining = millisecondsToStr(stn.TimeRemainingMillis);
                        subData.nextRed = stn;
                    }
                    break;
            }
        }
        var time = subData.nextRed.Time;
        var h = ((time.getHours()-1)%12+1);
        var m = time.getMinutes();
        m = m<10?'0'+m:m;
        var s = time.getSeconds();        
        s = s<10?'0'+s:s;
        var ap = time.getHours()<13?'AM':'PM';

        console.log(h+':'+m+':'+s+' '+ap);
    });
};
