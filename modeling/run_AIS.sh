#!/bin/bash#
# parallel --bar --colsep ',' "sh ./run_AIS.sh {1}" :::: input/BF_grid.csv > "output/AIS2.txt"
~/.webppl/webppl BDA.wppl --require ./refModule/ --require webppl-csv -- --model $1 --AIS true
