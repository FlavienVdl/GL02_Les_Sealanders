const fs = require('fs');

let addComment = (args, logger) => {
    fs.appendFile(args.file, "\n// "+args.comment, function(err){
        if(err){
            return logger.warn(err);
        }
        logger.info("The comment has been added to %s".green, args.file);
    });
};

module.exports = addComment;