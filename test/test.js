var jenkinsSlave = require('../jenkins-slave');
var opts = {
    name: 'Thor-octopus',
    secret: 'cf81b25ea2d7b61c9ad88d5ba41c68a17992fe4ae1fa6e855908bfb2548965b6',
    jenkinsHost: 'http://192.168.0.184:8080'
};

/*
jenkinsSlave.connect(opts, function(err){
    if(err){
        console.log(err);
        return;
    }
    console.log('connection established');
});*/

jenkinsSlave.disconnect(opts, function(err){
    if(err){
        console.log(err);
        return;
    }
    console.log('connection closed');
});
