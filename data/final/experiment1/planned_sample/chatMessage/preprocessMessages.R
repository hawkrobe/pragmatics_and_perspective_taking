library(tidyverse)
library(stringi)
library(quanteda)

rawD <- read_tsv('./raw_message.csv')

mentionedOutlineColor <- function(m) {
  colors <- c("blue","green", "black", "red")
  words <- tolower(stri_extract_all_words(m, simplify = TRUE))
  return(length(intersect(colors, words)) > 0)
}

mentionedShape <- function(m) {
  shapes <- c("star","square", "circle", "triangle")
  words <- tolower(stri_extract_all_words(m, simplify = TRUE))
  return(length(intersect(shapes, words)) > 0)
}


d <- rawD %>%
  filter(role == 'speaker') %>%
  group_by(gameid, trialNum, context, occlusions) %>%
  summarize(text = paste0(text, collapse = ' ')) %>%   # Concatenate multiple utterance on same trial
  mutate(numRawWords = str_count(text, "\\S+")) %>%
  mutate(hidden = ifelse(occlusions == 'none', 'no', 'yes')) %>%
  rowwise() %>%
  mutate(colorMention = mentionedOutlineColor(text),
         shapeMention = mentionedShape(text),
         textureMention = '')

write_csv(d, 'messages_no_annotations.csv')
