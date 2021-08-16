import { login } from "../../pageObjects/login"

var pageObjects = {

}

pageObjects.login = login

exports.pageObjectController = (string) => {
    var page = string.split(".")[0]
    var object = string.split(".")[1]

    var result

    Object.keys(pageObjects).forEach((key) => {
        if (key.toString() == page) {
            var thisObject = pageObjects[key]
            Object.keys(thisObject).forEach((key2) => {
                if (key2.toString() == object) {
                    result = thisObject[key2]
                }
            })
        }
    })

    return result
}