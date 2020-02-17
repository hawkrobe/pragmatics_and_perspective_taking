#!/bin/bash#
# parallel --bar --colsep ',' "sh ./run_dynamics_grid.sh {1} {2}" :::: input/dynamics_grid.csv
webppl dynamics_simulations.wppl --require ./refModule/ --require webppl-csv -- --numDatapoints $1 --chainNum $2
