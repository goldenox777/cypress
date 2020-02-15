FROM cypress/included:3.8.1
ADD . /
VOLUME [ "/cypress/results" ]