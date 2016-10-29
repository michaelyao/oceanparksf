#!/bin/bash       

git checkout gh-pages
echo "  --- > go to the gh-pages branch"
git rebase master 
echo "  --- > bring gh-pages up to date with master"
git push origin gh-pages 
echo "  --- > commit the changes"
git checkout master 
echo "  --- > return to the master branch" 