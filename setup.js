const prompt = require('prompt');
const fs = require('fs');
const {
    promisify
} = require('util');
// Make prompt.get return a promise
prompt.get = promisify(prompt.get);
prompt.start();
prompt.on("error", e => {
    console.log('an error was found', e)
});
async function setup() {
    const dbSetupItems = [{
            name: 'uri',
            description: 'MongoDB connection uri',
            message: 'Enter connection uri',
            required: true,
            conform(value) {
                return !!value;
            }
        },
        {
            name: 'dbName',
            description: 'Mongo db name',
            message: 'Enter mongo db name'
        },
        {
            name: 'jwtSecret',
            description: 'JWT signing secret',
            message: 'Enter jwt secret',
            required: true,
        }
    ];
    const gmailCredentials = [{
        name: 'user',
        description: 'Gmail username(email)',
        message: 'Enter your email',
        required: true
    }, {
        name: 'pass',
        description: 'Gmail password',
        message: 'Enter your password',
        required: true
    }];
    const files = [];
    try {

        const results = await prompt.get(dbSetupItems);
        const {
            setupEmail
        } = await prompt.get({
            name: 'setupEmail',
            description: 'Nodemailer setup',
            message: "Do you want to setup your GMAIL account with nodemailer?"
        });
        if (setupEmail && setupEmail.toLowerCase().trim() == "yes") {
            const {
                user,
                pass
            } = await prompt.get(gmailCredentials);
            const credentialsFileName = './configs/gmail.json';
            const configObject = {
                service: 'gmail',
                auth: {
                    user,
                    pass
                }
            };
            files.push(fs.promises
                .writeFile(credentialsFileName, JSON.stringify(configObject, null, 4)));
        }
        const fileName = './configs/settings.json';
        files.push(fs.promises.writeFile(fileName, JSON.stringify(results, null, 4)));
        await Promise.all(files);
        console.log('Created configurations');
    } catch (e) {
        if (e.message.toLowerCase() != 'canceled') {
            console.log('There was an error while creating the configuration for the api.Try again later');
        }
    } finally {
        prompt.stop();
    }
}
setup()
// setup().finally(prompt.stop());