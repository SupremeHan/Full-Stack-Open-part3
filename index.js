require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Phonebook = require('./models/phonebook');

const app = express();

app.use(cors());
app.use(express.static('dist'));

// Middleware to parse JSON body
app.use(express.json());

// Middleware to log request time
const logRequestTime = (req, res, next) => {
	req.requestTime = new Date();
	// console.log(`Request recived at: ${req.requestTime}`);
	next();
};
app.use(logRequestTime);

// Custom token to log request body
morgan.token('req-body', (req, res) => JSON.stringify(req.body));

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
app.use(logPOSTRequest);

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: 'unknown endpoint' });
};

// let phoneBook = [
// 	{
// 		id: '1',
// 		name: 'Arto Hellas',
// 		number: '040-123456'
// 	},
// 	{
// 		id: '2',
// 		name: 'Ada Lovelace',
// 		number: '39-44-5323523'
// 	},
// 	{
// 		id: '3',
// 		name: 'Dan Abramov',
// 		number: '12-43-234345'
// 	},
// 	{
// 		id: '4',
// 		name: 'Mary Poppendieck',
// 		number: '39-23-6423122'
// 	}
// ];

app.get('/info', (req, res, next) => {
	const reqRecivedTime = req.requestTime;
	Phonebook.find({})
		.then((phoneBooks) => {
			res.send(`
	    <p>Phonebook has info for ${phoneBooks.length} people</p>
	    <br/>
	    <p>${reqRecivedTime}</p>`);
		})
		.catch((error) => next(error));
});

app.get('/api/persons', (req, res, next) => {
	Phonebook.find({})
		.then((result) => {
			res.json(result);
		})
		.catch((error) => next(error));
});

app.get('/api/persons/:id', (req, res, next) => {
	Phonebook.findById(req.params.id)
		.then((phoneBook) => {
			if (phoneBook) {
				res.json(phoneBook);
			} else {
				res.status(404).end();
			}
		})
		.catch((error) => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
	Phonebook.findByIdAndDelete(req.params.id)
		.then((result) => {
			res.status(204).end();
		})
		.catch((error) => next(error));
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

app.put('/api/persons/:id', (req, res, next) => {
	const body = req.body;

	const phoneBook = {
		name: body.name,
		number: body.number
	};
	Phonebook.findByIdAndUpdate(req.params.id, phoneBook, { new: true })
		.then((updatedPhonebook) => {
			res.json(updatedPhonebook);
		})
		.catch((error) => next(error));
});

// handler of requests with unknown endpoint
app.use(unknownEndpoint);

// Error handling middleware
const errorHandler = (error, request, response, next) => {
	console.error(error.message);

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' });
	}

	next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
