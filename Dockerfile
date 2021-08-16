#   npm run add:included -- 8.2.0 cypress/browsers:node14.16.0-chrome90-ff88
#
# build this image with command
#   docker build -t cypress/included:8.2.0 .
#
FROM cypress/browsers:node14.16.0-chrome90-ff88

# Update the dependencies to get the latest and greatest (and safest!) packages.
RUN apt update && apt upgrade -y

# avoid too many progress messages
# https://github.com/cypress-io/cypress/issues/1243
ENV CI=1

# disable shared memory X11 affecting Cypress v4 and Chrome
# https://github.com/cypress-io/cypress-docker-images/issues/270
ENV QT_X11_NO_MITSHM=1
ENV _X11_NO_MITSHM=1
ENV _MITSHM=0

# should be root user
RUN echo "whoami: $(whoami)"
RUN npm config -g set user $(whoami)

# command "id" should print:
# uid=0(root) gid=0(root) groups=0(root)
# which means the current user is root
RUN id

# point Cypress at the /root/cache no matter what user account is used
# see https://on.cypress.io/caching
ENV CYPRESS_CACHE_FOLDER=/root/.cache/Cypress
RUN npm install -g "cypress@8.2.0"
RUN cypress verify

# Cypress cache and installed version
# should be in the root user's home folder
RUN cypress cache path
RUN cypress cache list
RUN cypress info
RUN cypress version

# give every user read access to the "/root" folder where the binary is cached
# we really only need to worry about the top folder, fortunately
RUN ls -la /root
RUN chmod 755 /root

# always grab the latest Yarn
# otherwise the base image might have old versions
# NPM does not need to be installed as it is already included with Node.
RUN npm i -g yarn@latest

# Show where Node loads required modules from
RUN node -p 'module.paths'

# should print Cypress version
# plus Electron and bundled Node versions
RUN cypress version
RUN echo  " node version:    $(node -v) \n" \
    "npm version:     $(npm -v) \n" \
    "yarn version:    $(yarn -v) \n" \
    "debian version:  $(cat /etc/debian_version) \n" \
    "user:            $(whoami) \n" \
    "chrome:          $(google-chrome --version || true) \n" \
    "firefox:         $(firefox --version || true) \n"

# ENTRYPOINT ["cypress", "run"]

##########
WORKDIR /test
COPY ./package*.json /test/
RUN npm install

COPY ./cypress/ /test/cypress
COPY ./cypress.json /test/cypress.json
COPY ./reporter-config.json /test/reporter-config.json
COPY ./scripts/reportGenerator.js /test/scripts/reportGenerator.js
COPY ./scripts/magic.sh /test/scripts/magic.sh
# COPY ./scripts/mailer.js /test/scripts/mailer.js
# COPY ./tfsStatusReporter.js /test/tfsStatusReporter.js
RUN chmod a+rwx ./scripts/magic.sh
# RUN npx cypress-tags run