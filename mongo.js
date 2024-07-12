const mongoose = require('mongoose');

if (process.argv.length < 3) {
	console.log('give password as argument');
	process.exit();
}

const password = process.argv[2];

const url = `mongodb+srv://fullstack:${password}@phonebook.abquhmg.mongodb.net/?retryWrites=true&w=majority&appName=Phonebook`;

mongoose.set('strictQuery', false);

mongoose.connect(url);

const phoneBookSchema = new mongoose.Schema({
	name: String,
	number: String
});

const Phonebook = mongoose.model('Phonebook', phoneBookSchema);

const phoneBook = new Phonebook({
	name: process.argv[3],
	number: process.argv[4]
});

if (process.argv.length === 3) {
	Phonebook.find({}).then((result) => {
		result.forEach((phoneBook) => {
			console.log(`added ${phoneBook.name} number ${phoneBook.number} to phonebook`);
		});
		mongoose.connection.close();
	});
}

if (process.argv[3] && process.argv[4]) {
	phoneBook.save().then((result) => {
		console.log('phonebook saved');
		mongoose.connection.close();
	});
}
