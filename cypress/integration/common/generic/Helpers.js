const axios = require('axios')
exports.apiCall = (type, obj) => {
    var url;

    switch (type) {
        case "entry":
            url = 'http://localhost:5000/entries/create'
            break;
        case "run":
            url = 'http://localhost:5000/runs/create'
            break;
    }
    axios({
        method: 'post',
        url: url,
        headers: {
            'Content-Type': 'application/json'
        },
        data: obj
    })
}