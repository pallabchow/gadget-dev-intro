#!/bin/bash

#  From each line that begins with #s, generate an indented hyperlink
# Strip all punctuation, replace spaces with dashes, make all lowercase.

grep '^#' | perl -pe 's|^(#+) +(.*)$|$x=$1; $text=$2; $link=$text; $x =~ s/#/&nbsp;/g; $link =~ s/ /-/g;  $link =~ s/,//g; $link =~ s,[./+!?:;]+,,g; $link =~ y/A-Z/a-z/; sprintf("%s [%s](#%s)",$x,$text,$link)|e'
