#!/bin/bash

#  From each line that begins with #s, generate an indented hyperlink
# Strip all punctuation, replace spaces with dashes, make all lowercase.

grep '^#' | perl -pe 's|^(#+) +(.*)$|$hashes=$1; $indent=$hashes; $text=$2; $link=$text; $indent =~ s/^#//; $indent =~ s/#/....../g; if ($hashes =~ /^#$/) { $text="**$text**"; }; $link =~ s/ /-/g;  $link =~ s/,//g; $link =~ s,[./+!?:;]+,,g; $link =~ y/A-Z/a-z/; sprintf("%s [%s](#%s)<br/>",$indent,$text,$link)|e'
