npx cypress-tags run --env TAGS=$TAGS --env HOST=$HOST;
export RSTATE=$?;
node /test/scripts/reportGenerator.js;
tar -zcf /test/results.tar.gz r/;
# node /test/scripts/mailer.js;
# node scripts/tfsStatusReporter.js
# mkdir /test/r/c/merged
# npx junit-merge -d r/c/ -o r/c/merged/merged.xml