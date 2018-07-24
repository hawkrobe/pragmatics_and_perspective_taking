library(tidyverse)
library(jsonlite)

path <- "./"
files = dir(path, pattern = "*.json")

subjInfo = data.frame()

for (f in files) {
  jf = paste0(path, f)
  jd = read_json(jf)
  
  newRow = data.frame()
  if(!is.null(jd$answers$subject_information)) {
    newRow = data.frame(gameid = jd$answers$subject_information$gameID,
                        role = jd$answers$subject_information$role,
                        gameLength = jd$answers$subject_information$totalLength,
                        thinksHuman = ifelse(!is.null(jd$answers$subject_information$thinksHuman), jd$answers$subject_information$thinksHuman, NA),
                        understandsInstructions = jd$answers$subject_information$confused,
                        nativeEnglish = jd$answers$subject_information$nativeEnglish,
                        ratePartner = jd$answers$subject_information$ratePartner,
                        comments = jd$answers$subject_information$comments,
                        strategy = jd$answers$subject_information$strategy)
    subjInfo = bind_rows(subjInfo, newRow)
  }
}
write_csv(subjInfo, './subjInfo.csv')
