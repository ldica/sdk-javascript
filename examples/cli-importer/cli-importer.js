global.XMLHttpRequest = require('xhr2');

const fs = require('fs');
const program = require('commander');
const { prompt } = require('inquirer');
const AmbrosusSDK = require('./../../lib/ambrosus');

program
  .version('0.0.1')
  .description(
    'A command-line tool to import and create assets and events on the Ambrosus Network'
  );

const jsonSettings = [
  {
    type: 'input',
    name: 'fileName',
    message: 'Path to json file ... (Example: ./../demo-assets/chocolate.json)'
  }
];

program
  .command('initialize')
  .alias('init')
  .description('Initialize SDK')
  .action(() => {
    prompt(jsonSettings).then(jsonSettings => initializeSdk(jsonSettings));
  });


initializeSdk = jsonSettings => {

  global.ambrosus = new AmbrosusSDK({
    apiEndpoint: 'https://gateway-test.ambrosus.com',
    secret: '0x690a959507369 ... 17ea89b82c4d378e1215b66d0f5a',
    address: '0x9687a7051304 ... bD0C07FFb1102098'
  });

  if (readExtension(jsonSettings.fileName)) {
    fs.readFile(process.cwd() + '/' + jsonSettings.fileName, {encoding: 'utf8'}, function(
      err,
      data
    ) {
      if (err) console.log('Incorrect File');
      var assetInfo = JSON.parse(data);
      createAsset(assetInfo);
    });
  }
};

createAsset = (assetInfo) => {
  const data = [];
  ambrosus.createAsset(data)
  .then((response) => {
    if (response.reason) {
      console.log('Asset Creation Failed');
      console.log(response.reason);
    } else {
      console.log('Asset ID Created: ' + response.assetId);
      initEventCreation(assetInfo, response.assetId);
    }
  })
  .catch((error) => { console.log(error) });
};

initEventCreation = (assetInfo, assetId) => {
  for (let i = 0; i < assetInfo.length; i++) {
    createEvent(assetInfo[i], assetId);
  }
};

createEvent = (data, assetId) => {
  ambrosus.createEvent(assetId, data)
  .then((response) => {
    if (response.reason) {
      console.log('Event Creation Failed');
      console.log(response.reason);
    } else {
      console.log('Event Created Successfully: ' + response.eventId);
    }
  })
  .catch((error) => { console.log(error); });
};

readExtension = fileName => {
  if (fileName.split('.').pop() === 'json') {
    return true;
  } else {
    console.log('Please upload a json file');
    return false;
  }
};

program.parse(process.argv);
