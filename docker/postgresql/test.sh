#!/bin/bash

trap 'echo 1' SIGINT
echo "$1"
sleep 15
