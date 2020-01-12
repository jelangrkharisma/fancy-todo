const Todo = require('../models/Todo')
const User = require('../models/User')

const ObjectId = require('mongoose').Types.ObjectId
class TodoController {
	static createTodo(req, res, next) {

		let tags = req.body.tags

		let values = {
			userId: req.body.userId,
			title: req.body.title,
			description: req.body.description,
			priority: req.body.priority,
			category: req.body.category,
			isShoppingList: req.body.isShoppingList,
			isDone: false
		}

		if (tags !== undefined) {
			let tagsArr = tags.split(',')
			tagsArr = tagsArr.map(row => row.trim())
			values.tags = tagsArr
		}

		let createdTodos
		Todo
			.create(values)
			.then(result => {
				if (result) {
					createdTodos = result
					return User.findOneAndUpdate(
						{ _id: req.body.userId },
						{
							$push: {
								todos: ObjectId(result._id)
							}
						},
						{ upsert: true }
					)
				}

			})
			.then(updateResult => {
				res.status(201).json({ createdTodos })
			})
			.catch(err => {
				console.log(err);

				next({
					code: 400,
					err
				})
			})
	}

	static getAllTodos(req, res, next) {
		Todo
			.find()
			.populate('userId', [ 'fullname', 'email' ])
			.then(result => {
				res.send(result)
			})
			.catch(err => {
				next({
					code: 500,
					err
				})
			})
	}

	static updateTodo(req, res, next) {


		let values = {
			title: req.body.title,
			description: req.body.description,
			priority: req.body.priority,
			category: req.body.category,
		}
		let tags = req.body.tags
		if (tags !== undefined) {
			let tagsArr = tags.split(',')
			tagsArr = tagsArr.map(row => row.trim())
			values.tags = tagsArr
		}

		Todo
			.findOneAndUpdate({ _id: req.body.id }, values)
			.then(result => {
				res.status(204).json({ msg: 'Updated' })
			})
			.catch(err => {
				next({
					code: 500,
					msg: 'Update Failed',
					details: err
				})
			})
	}

	static toggleDone(req, res, next) {
		let done
		Todo.findOne({ _id: req.body.id })
			.then(result => {
				done = result.isDone
				return Todo.updateOne({ _id: req.body.id }, { isDone: !done })
			})
			.then(updated => {
				if (!done == false) {
					res.status(200).json({ msg: 'Todo UnCheck-ed' })
				} else {
					res.status(200).json({ msg: 'Todo Check-ed' })
				}
			})
			.catch(err => {
				console.log(err);

				next({
					code: 500,
					msg: err
				})
			})
	}
}

module.exports = TodoController