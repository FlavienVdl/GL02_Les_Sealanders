const fs = require('fs');

let setCategory = (args, logger) => {
    fs.readFile(args.file, 'utf8', function (err,data) {
        if (err) {
            return logger.warn(err);
        }

        // Parcourir ligne par ligne et voir si la ligne commence par $CATEGORY:
        var lines = data.split("\n");
        var newLines = [];
        var categoryFound = false;
        lines.forEach(function(line){
            if(line.startsWith("$CATEGORY:")){
                newLines.push("$CATEGORY: "+args.category);
                categoryFound = true;
            }else{
                newLines.push(line);
            }
        });
        if (!categoryFound){
            newLines.unshift("$CATEGORY: "+args.category);
        }
        var newData = newLines.join("\n");
        fs.writeFile(args.file, newData, function(err){
            if(err){
                return logger.warn(err);
            }
            logger.info("The category of %s has been set to %s".green, args.file, args.category);
        });
    });
};

module.exports = setCategory;