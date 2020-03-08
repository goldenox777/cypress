var nodemailer = require('nodemailer')

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'arthur.bazso.work.automation@gmail.com',
        pass: 'ThisisAutomated!'
    }
})
var subjectBody
var recipients = process.env.RECIPIENTS
function constructString(string) {
    if (string == 'subject') {
        if (process.env.RSTATE == 0) {
            subjectBody = "Automation run PASSED " + new Date()
        } else {
            subjectBody = "Automation run FAILED " + new Date()
        }
    }
}
constructString('subject')
var mailOptions = {
    from: 'arthur.bazso.work.automation@gmail.com',
    to: recipients,
    subject: subjectBody,
    html: {
        path: '/test/EmailBody.html'
    },
    attachments: [
        {
            filename: 'results.tar.gz',
            path: '/test/results.tar.gz'
        }
    ]
}

transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
        console.log(err)
    } else {
        console.log(info)
    }
})
