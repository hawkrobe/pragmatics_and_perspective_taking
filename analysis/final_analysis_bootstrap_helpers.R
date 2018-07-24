## In the inner loop, we want to sample a 'mean' rating for each utterance
## using same sample of *raters* for all utterances... 
sampleRatings = function(df, indices) {
  grouped_df <- df %>%
    group_by(label, objectSet) %>%
    do(data.frame(diff = mean(.$diff[indices]),
                  target = mean(.$target[indices]),
                  distractor = mean(.$distractor[indices])))
  return(grouped_df)
}

## In outer loop, we want to sample 'pairs' as a unit (with their 8 utterances)
samplePairs = function(df) {
  uniq_ids <- unique(df$gameid)
  new_ids <- sample(uniq_ids, length(uniq_ids), replace = TRUE)
  resampled_ids = data.frame(gameid = new_ids,
                             sampleid = 1:length(new_ids), 
                             stringsAsFactors = FALSE)
  return(left_join(resampled_ids, df, by = c('gameid')))
}

## Finally, want to sample object sets per pair
sampleObjects = function(df, indices) {
  new_objects <- data.frame(objectSet = indices)
  return(left_join(new_objects, df, by = c('objectSet')))
}
# sampleObjects(data.frame(objectSet = c(1,2,3,4,5,6,7,8), utt = c('a', 'b', 'c', 'a', 'b', 'c', 'd', 'e')),
#               obj_sets)