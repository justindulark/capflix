const faker = require('faker');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}
const AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: process.env.aws_access_key_id, secretAccessKey: process.env.aws_secret_access_key, region: 'us-west-1'});
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

//generates fake users for the users database
async function fakeUserGenerator (number) {
	for (var i = 0; i < 10; i++) {
		let fileName = 'users' + i;
		let id = i * 1000000 + 1;
		const csvWriter = createCsvWriter({
	    path: path.join(__dirname, `/databases/data/users/${fileName}.csv`),
	    header: [
	    		// {id: 'id', title: 'id'},
	        {id: 'email', title: 'email'},
	        {id: 'password', title: 'password'},
	        {id: 'geolocation', title: 'geolocation'}
	    ]
		});

		let records = [];

		for (var j = 1; j <= number; j++) {
			const email = faker.internet.email() + id;
			const password = faker.internet.password();
			const lat = faker.address.latitude();
			const lng = faker.address.longitude();
			const geolocation = JSON.stringify({lat: lat, lng: lng});
			// const geolocation = `{lat: ${lat}, lng: ${lng}}`;
			const user = {email, password, geolocation};
			records[j] = user;
			id++;
		}

		csvWriter.writeRecords(records)
			.then(() => {
				console.log('users added');
			})
	}
}

const precisionRound =(number, precision) => {
	const factor = Math.pow(10, precision);
	return Math.round(number * factor) / factor;
}
//generates fake sessions for the usersSession database
const categories = ['Action & Adventure', 'Comedies', 'Thrillers', 'Violent TV Shows', 'Animation', 'Documentaries', 'Reality TV', 'Critically-acclaimed', 'Horror', 'TV Comedies', 'Sci-fi', 'Dramas'];
const trueContent = [false, true];
async function fakeSessionsGenerator (number) {

	for (var i = 8; i < 10; i++) {
		let fileName = 'user_sessions' + i;
		let id = i * 1000000 + 1;
		const csvWriter = createCsvWriter({
			path: path.join(__dirname, `/databases/data/user_sessions/${fileName}.csv`),
			header: [
					{id: 'id', title: 'id'},
					{id: 'userId', title: 'userId'},
					{id: 'contentId', title: 'contentId'},
					{id: 'category', title: 'category'},
					{id: 'originalContent', title: 'originalContent'},
					{id: 'viewedMinutes', title: 'viewedMinutes'},
					{id: 'geolocation', title: 'geolocation'},
					{id: 'date', title: 'date'}
			]
		});

		let records = [];

		for (var j = 1; j <= number; j++) {
			const userId = Math.floor(Math.random() * 10000000);
			const contentId = Math.floor(Math.random() * 10000000);
			const category = categories[Math.floor(Math.random() * categories.length)];
			const originalContent = trueContent[Math.floor(Math.random() * trueContent.length)];
			const viewedMinutes = precisionRound(Math.random() * 180, 2);
			const lat = faker.address.latitude();
			const lng = faker.address.longitude();
			const geolocation = `{lat:${lat}, lng:${lng}}`;
			let year = Math.ceil(Math.random() * 17) + 2000;
			let month = Math.ceil(Math.random() * 12);
			let day;
			if (month === 2) { 
				day = Math.ceil(Math.random() * 28);
			} else {
				day = Math.ceil(Math.random() * 31);
			}
			if (month < 10) {
				month = '0' + month;
			}
			if (day < 10) {
				day = '0' + day;
			}
			const date = `${year}-${month}-${day}`;
			const session = {id, userId, contentId, category, originalContent, viewedMinutes, geolocation, date};

			records[j] = session;
			id++;
		}

		csvWriter.writeRecords(records)
			.then(() => {
				console.log('sessions added');
			})
	}
}

let currentDate = new Date();
let userSessionParams = {
	DelaySeconds: 1,
	MessageBody: 'User Session',
	QueueUrl: 'https://sqs.us-west-1.amazonaws.com/567607828756/test_user_sessions_standard_queue',
	MessageAttributes: {
		session_id: {
			DataType: 'String',
			StringValue: `lkj${Math.floor(Math.random() * 100000)}asdfoi${Math.floor(Math.random() * 100000)}`
		},
		user_id: {
			DataType: 'Number',
			StringValue: Math.floor(Math.random() * 10000000).toString()
		},
		content_id: {
			DataType: 'Number',
			StringValue: Math.floor(Math.random() * 10000000).toString()
		},
		viewed_minutes:{
			DataType: 'Number',
			StringValue: precisionRound(Math.random() * 180, 2).toString()
		},
		date: {
			DataType: 'String',
			StringValue: `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`
		},
		category: {
			DataType: 'String',
			StringValue: `${categories[Math.floor(Math.random() * categories.length)]}`
		},
		original_content: {
			DataType: 'String',
			StringValue: `${trueContent[Math.floor(Math.random() * trueContent.length)]}`
		},
		geolocation: {
			DataType: 'String',
			StringValue: JSON.stringify({lat:faker.address.latitude(), lng:faker.address.longitude()})
		}
	}
}
sqs.sendMessage(userSessionParams, (err, data) => {
	if (err) {
		console.error('ERROR', err, err.stack);
	} else {
		console.log('data sent');
		console.log(data);
	}
});

//Commented out fake data generators until they need to be used again. IF they need to be.
try {
	// fakeUserGenerator(1000000)
	// 	.then(() => {
	// 		console.log('Users generated');
	// 	});

	// fakeSessionsGenerator(1000000)
	// 	.then(() => {
	// 		console.log('Sessions generated');
	// 	});
} catch(err) {
	console.error('ERROR:', err);
}


