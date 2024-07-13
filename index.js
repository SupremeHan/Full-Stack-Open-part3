require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Phonebook = require('./models/phonebook');

const app = express();

app.use(cors());

// Middleware to parse JSON body
app.use(express.json());

// Custom token to log request body
morgan.token('req-body', (req, res) => JSON.stringify(req.body));

// Middleware to log request time
const logRequestTime = (req, res, next) => {
	req.requestTime = new Date();
	// console.log(`Request recived at: ${req.requestTime}`);
	next();
};

// Middleware to log POST request with req body
const logPOSTRequest = (req, res, next) => {
	if (req.method === 'POST') {
		const customFormat = ':method :url :status :res[content-length] - :response-time ms :req-body';
		morgan(customFormat)(req, res, next);
	} else {
		next();
	}
};

app.use(morgan('tiny'));

app.use(logRequestTime);
app.use(logPOSTRequest);

app.use(express.static('dist'));

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

let phoneBook = [
	{
		id: '1',
		name: 'Arto Hellas',
		number: '040-123456'
	},
	{
		id: '2',
		name: 'Ada Lovelace',
		number: '39-44-5323523'
	},
	{
		id: '3',
		name: 'Dan Abramov',
		number: '12-43-234345'
	},
	{
		id: '4',
		name: 'Mary Poppendieck',
		number: '39-23-6423122'
	}
];

app.get('/info', (req, res) => {
	const reqRecivedTime = req.requestTime;
	const numOfPeople = phoneBook.length;
	res.send(`
        <p>Phonebook has info for ${numOfPeople} people</p>
        <br/>
        <p>${reqRecivedTime}</p>
    `);
});

app.get('/api/persons', (req, res) => {
	Phonebook.find({}).then((result) => {
		res.json(result);
	});
});

app.get('/api/persons/:id', (req, res) => {
	Phonebook.findById(req.params.id)
		.then((result) => {
			res.json(result);
		})
		.catch((error) => {
			res.status(404).end();
		});
});

app.delete('/api/persons/:id', (req, res) => {
	const id = req.params.id;
	phoneBook = phoneBook.filter((person) => person.id !== id);

	res.status(204).end();
});

app.post('/api/persons', (req, res) => {
	const body = req.body;

	if (!body.name || !body.number) {
		return res.status(400).json({
			error: 'one of the fields is missing'
		});
	}

	const phoneBook = new Phonebook({
		name: body.name,
		number: body.number
	});

	phoneBook.save().then((savedPhonebook) => {
		res.json(savedPhonebook);
	});
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
