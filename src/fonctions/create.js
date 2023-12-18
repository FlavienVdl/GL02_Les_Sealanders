const fs = require('fs');

let createQuiz = (args, logger) => {
    if(!args.file.endsWith(".gift")){
        return logger.warn("The file extension is not .gift".red);
    }
    else {
        fs.writeFile(args.file, "", function(err){
            if(err){
                return logger.warn(err);
            }
            logger.info("The file %s has been created".green, args.file);
        });
    }
};

module.exports = createQuiz;