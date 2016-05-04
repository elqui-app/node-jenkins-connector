var http = require('http');
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

function download(url, dest, callback){
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close(callback);  // close() is async, call cb after close completes.
        });
    });
}

function ensurePresence(url, dest, callback){
    fs.access(dest, fs.R_OK, function(err){
        if(err){
            //download(jenkinsUrl+'/jnlpJars/slave.jar', slaveJar, callback);
            download(url, dest, callback);
        } else {
            callback && callback();
        }
    });
}

function enrichOptions(options, callback){

    if(!options.hasOwnProperty('name')){
        callback && callback({code:'OPT_MISSING', message: 'The option "name" is missing'});
        return;
    } else if(!options.hasOwnProperty('secret')){
        callback && callback({code:'OPT_MISSING', message: 'The option "secret" is missing'});
        return;
    } else if(!options.hasOwnProperty('jenkinsHost')){
        callback && callback({code:'OPT_MISSING', message: 'The option "jenkinsHost" is missing'});
        return;
    }

    if(!options.hasOwnProperty('jar')){
        options.jar = path.join(process.cwd(), 'slave.jar');
    }
    
    if(!options.hasOwnProperty('log')){
        options.log = path.join(process.cwd(), 'log');
    }
    
    if(!options.hasOwnProperty('pid')){
        options.pid = path.join(process.cwd(), 'pid');
    }

    callback && callback(null, options);
}

function connect(options, callback){
    enrichOptions(options, function(err, newOptions){
        if(err){
            callback && callback(err);
            return;
        }

        fs.open(newOptions.log, 'w', function(err, logFile){ // open the file for the log
            if(err){
                callback && callback(err);
                return;
            }

            ensurePresence(newOptions.jenkinsHost+'/jnlpJars/slave.jar', newOptions.jar, function(err){
                var child = child_process.spawn('java',
                ['-jar', newOptions.jar, '-jnlpUrl', newOptions.jenkinsHost+'/computer/'+newOptions.name+'/slave-agent.jnlp', '-secret', newOptions.secret], 
                { detached: true, stdio: ['ignore', logFile, logFile] });

                // we write the pid in a file to retrieve the process later to kill him
                fs.writeFile(newOptions.pid, child.pid, 'utf8', function(err){
                    child.unref();
                    callback && callback(err);
                });

            });
        });

    });
}

function disconnect(options, callback){
    enrichOptions(options, function(err, newOptions){
        if(err){
            callback && callback(err);
            return;
        }
        fs.access(newOptions.pid, fs.R_OK, function(err){
            if(err){
                callback && callback({code:'PID_MISSING', message:'pid file missing: impossible to kill the process'});
                return;
            }
            fs.readFile(newOptions.pid, 'utf8', function(err, data){
                if(err){
                    callback && callback({code:'PID_READ_IMPOSSIBLE', message:'Impossible to read pid file'});
                } else {
                    process.kill(data);
                    fs.unlink(newOptions.pid, callback);
                }
            });
        });

    });
}

module.exports.connect = connect;
module.exports.disconnect = disconnect;
