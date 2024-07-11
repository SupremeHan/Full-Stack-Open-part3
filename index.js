const express = require('express');
const morgan = require('morgan');

const app = express();

// Middleware to parse JSON body
app.use(express.json());

// Custom token to log request body
morgan.token('req-body', (req, res) => JSON.stringify(req.body));

// Middleware to log request time
const logRequestTime = (req, res, next) => {
	req.requestTime = new Date();
	console.log(`Request recived at: ${req.requestTime}`);
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
	res.json(phoneBook);
});

app.get('/api/persons/:id', (req, res) => {
	const id = req.params.id;
	const person = phoneBook.find((person) => person.id === id);

	if (person) {
		res.json(person);
	} else {
		res.status(404).end();
	}
});

app.delete('/api/persons/:id', (req, res) => {
	const id = req.params.id;
	phoneBook = phoneBook.filter((person) => person.id !== id);

	res.status(204).end();
});

const generateId = () => {
	const maxId = phoneBook.length > 0 ? Math.max(...phoneBook.map((n) => Number(n.id))) : 0;
	return String(maxId + 1);
};

app.post('/api/persons', (req, res) => {
	const body = req.body;

	if (!body.name || !body.number) {
		return res.status(400).json({
			error: 'one of the fields is missing'
		});
	}

	const isNameExsits = phoneBook.some((person) => person.name === body.name);
	if (isNameExsits) {
		return res.status(400).json({
			error: 'name must be unique'
		});
	}

	const person = {
		id: generateId(),
		name: body.name,
		number: body.number
	};

	phoneBook = [...phoneBook, person];

	res.json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
