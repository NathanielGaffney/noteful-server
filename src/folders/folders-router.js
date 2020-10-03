const express = require('express');
const xss = require('xss');
const FoldersService = require('./folders-service');
const { v4: uuid } = require('uuid');

const foldersRouter = express.Router()
const bodyParser = express.json()

const serializeFolder = folder => ({
    id: Number(folder.id),
    folder_name: xss(folder.folder_name)
})

foldersRouter
    .route('/folders')
    .get((req, res, next) => {
        console.log(1)
        console.log(req.app.get('db'))
        FoldersService.getFolders(req.app.get('db'))
            .then(folders => {
                console.log(2)
                res.json(folders.map(serializeFolder))
            })
            .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        for (const field of ['folder_name']){
            if(!req.body[field]){
                return res.status(400).send(`'${field}' is required`)
            }
        }
        const { folder_name } = req.body;
        const newFolder = {   
            folder_name: folder_name 
        }
        FoldersService.insertFolder(
            req.app.get('db'),
            newFolder
        )
            .then(folder => {
                res
                    .status(201)
                    .location(`/folders/${folder.id}`)
                    .json(serializeFolder(folder))
            })
            .catch(next)
    })

foldersRouter
    .route('/folders/:id')
    .all((req, res, next) => {
        const { id } = req.params
        FoldersService.getFolderById(req.app.get('db'), id)
            .then(folder => {
                if(!folder){
                    return res.status(404).json({
                        error: { message: `Folder not found`}
                    })
                }
                res.folder = folder
                next()
            })
            .catch(next)
    })
    .get((req, res) => {
        res.json(serializeFolder(res.folder))
    })
    .delete((req, res, next) => {
        const { id } = req.params
        FoldersService.deleteFolder(req.app.get('db'), id)
            .then(x => {
                res.status(204).end()
            })
            .catch(next)
    })

    module.exports = foldersRouter