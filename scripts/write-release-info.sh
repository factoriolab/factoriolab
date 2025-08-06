version=$1
branch=$2
date=$3

echo Version: $version
echo Branch: $branch
echo Date: $date

file=./dist/factoriolab/browser/release.json
sed -i -e "s/\"version\": \".*\"/\"version\": \"$version\"/g" $file
sed -i -e "s/\"branch\": \".*\"/\"branch\": \"$branch\"/g" $file
sed -i -e "s/\"date\": \".*\"/\"date\": \"$date\"/g" $file

echo "DEPLOY=true" >> "$GITHUB_ENV"

npm run ngsw-config
