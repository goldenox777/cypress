import os
import re

path = 'cypress/integration/tests/'

fileNamesList = []
# r=root, d=directories, f = files
for r, d, f in os.walk(path):
    for file in f:
        if '.feature' in file:
            fileNamesList.append(os.path.join(r, file))

# for f in files:
#     print(f)
fileToArray = []
for file in fileNamesList:
    with open(file, 'r') as content:
        print(content.readlines()[0])
