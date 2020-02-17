#!/bin/bash#
# parallel --bar --colsep ',' "sh ./run_grid_search.sh {1} {2}" :::: input/grid.csv
webppl RR_simulations.wppl --require ./refModule/ --require webppl-csv -- --perspectiveCost $1 --chainNum $2
