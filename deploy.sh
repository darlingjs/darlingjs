#!/bin/sh

#based on this one
#https://gist.github.com/domenic/ec8b0fc8ab45f39403dd
#and that
#http://www.steveklabnik.com/automatically_update_github_pages_with_travis_example/

# This sets two options for the shell to make the script more reliable:
set -o errexit -o nounset

COMMIT_MESAGE="$(git log -1 --pretty=%B)"

# go to the out directory and create a *new* Git repo
cd build
git init

# inside this git repo we'll pretend to be a new user
git config user.name "Travis CI"
git config user.email "ievgenii.krevenets@gmail.com"

git remote add upstream "https://${GH_TOKEN}@${GH_REF}"
git fetch upstream
git reset upstream/master

# The first and only commit to this new Git repo contains all the
# files present with the commit message "Deploy to GitHub Pages".
git add .
git commit -m "${COMMIT_MESAGE}"

if [ ${TRAVIS_TAG} ]; then
    git tag ${TRAVIS_TAG}
fi

# Force push from the current repo's master branch to the remote
# repo's gh-pages branch. (All previous history on the gh-pages branch
# will be lost, since we are overwriting it.) We redirect any output to
# /dev/null to hide any sensitive credential data that might otherwise be exposed.
git push --force --quiet --tags "https://${GH_TOKEN}@${GH_REF}" master:master > /dev/null 2>&1
