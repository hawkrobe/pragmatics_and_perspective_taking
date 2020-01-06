library(tidyverse)
library(jsonlite)
filenames <- list.files("./images/stimuli", pattern="*.png", full.names=TRUE)
output = data.frame(url = filenames) %>% 
  mutate(id = row_number()) %>%
  separate(url, into = c('tmp', 'garbage'), remove = F, sep = '.png') %>%
  separate(tmp, into = c('garbage2', 'name'), sep = './images/stimuli/') %>%
  separate(name, into = c('texture', 'color', 'shape'), remove = F) %>%
  select(-garbage, -garbage2)

write_json(output, path = './images/objects.json')
