# node-jenkins-slave
Facilitate the connection to a jenkin server and the disconnection

Java must be installed



    var jenkinsSlave = require('node-jenkins-slave');
    var options = {
       name: <string>,          // name of the node in jenkins 
       secret: <string>,        // secret key in jenkins
       jenkinsHost: <string>,   // url of jenkins server
       jar: <path>, (optionnal)// path where the file slave.jar must be downloaded
       log: <path>, (optionnal) // filename of the log file
       pid: <path>, (optionnal) // filename of the file storing the pid of the current jenkins slave engine
    };
    
    jenkinsSlave.connect(options, function(err){
        // connection to jenkins established
    });
    jenkinsSlave.connect(options, function(err){
        // disconnected fromjenkins
    });
