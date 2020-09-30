const express = require('express');
const xss = require('xss');
const NotesService = require('./notes-service');
const { v4: uuid } = require('uuid');

const notesRouter = express.Router()
const bodyParser = express.json()

const serializeNote = note => ({
    id: Number(note.id),
    title: xss(note.title),
    folder: Number(note.folder),
    date_created: xss(note.date_created),
    content: xss(note.content),
})

notesRouter
    .route('/notes')
    .get((req, res, next) => {
        NotesService.getAllNotes(req.app.get('db'))
        .then(notes => {
            res.json(notes.map(serializeNote))
        })
        .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        for (const field of ['title', 'content'])
            if(!req.body[field]){
                return res.status(400).send(`'${field}' is required`)
            }

            const { title, content, folder } = req.body

            const newNote = { 
                title: title,
                content: content, 
                folder: folder, 
            }

            NotesService.insertNote(req.app.get('db'), newNote)
                .then(note => {
                    res
                        .status(201)
                        .location(`/notes/${note.id}`)
                        .json(serializeNote(note))
                })
                .catch(next)
    })

    notesRouter
        .route(`/notes/:id`)
        .all((req, res, next) => {
            const { id } = req.params
            NotesService.getNoteById(req.app.get('db'), id)
                .then(note => {
                    if (!note) {
                        return res.status(404).json({
                            error: { message: `note not found` }
                        })
                    }
                    res.note = note
                    next()
                })
                .catch(next)
        })
        .get((req, res) => {
            res.json(serializeNote(res.note))
        })
        .delete((req, res, next) => {
            const { id } = req.params
            NotesService.deleteNote(req.app.get('db'), id)
                .then(x => {
                    res.status(204).end()
                })
                .catch(next)
        })

    notesRouter
        .route(`/folderNotes/:folder`)
        .all((req, res, next) => {
            const { folder } = req.params
            NotesService.getNotesByFolder(req.app.get('db'), folder)
                .then(notes => {
                    if (!notes) {
                        return res.status(404).json({
                            error: { message: `notes not found` }
                        })
                    }
                    res.notes = notes
                    next()
                })
                .catch(next)
        })
        .get((req, res) => {
                res.json(res.notes.map(serializeNote))
        })

module.exports = notesRouter