#!/bin/sh

#based on this one
#https://gist.github.com/domenic/ec8b0fc8ab45f39403dd
#and that
#http://www.steveklabnik.com/automatically_update_github_pages_with_travis_example/

# This sets two options for the shell to make the script more reliable:
set -o errexit -o nounset


if [ $TRAVIS_BRANCH != "master" ]; then
    echo "this is ${TRAVIS_BRANCH} branch"
    echo "build works only for master branch"
fi

NEW_TAG="$(git describe --tags --abbrev=0)"

echo "start"

# go to the out directory and create a *new* Git repo
cd build
git init

# inside this git repo we'll pretend to be a new user
git config user.name "Travis CI"
git config user.email "ievgenii.krevenets@gmail.com"

git remote add upstream "https://${GH_TOKEN}@${GH_REF}"
git fetch upstream
git reset upstream/master

OLD_TAG="$(git describe --tags --abbrev=0)"

echo "new tag: ${NEW_TAG}"
echo "old tag: ${OLD_TAG}"

if [ $NEW_TAG = $OLD_TAG ]; then
    echo "still have same tag. To update bower repo should change tag"
    echo "current tag is ${NEW_TAG}"
    exit 0
fi

# The first and only commit to this new Git repo contains all the
# files present with the commit message "Deploy to GitHub Pages".
git add . --verbose --all
git commit --verbose -m "${NEW_TAG}"

if [ ${NEW_TAG} ]; then
    echo "update tag to ${NEW_TAG}"
    git tag ${NEW_TAG}
fi

# Force push from the current repo's master branch to the remote
# repo's gh-pages branch. (All previous history on the gh-pages branch
# will be lost, since we are overwriting it.) We redirect any output to
# /dev/null to hide any sensitive credential data that might otherwise be exposed.
git push --force --quiet --tags "https://${GH_TOKEN}@${GH_REF}" master:master > /dev/null 2>&1
