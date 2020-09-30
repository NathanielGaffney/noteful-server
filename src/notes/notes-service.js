const notesService = {
    getAllNotes(knex) {
        return knex.select('*').from('notes')
    },
    getNoteById(knex, id) {
        return knex.from('notes').select('*').where('id', id).first()
    },
    getNotesByFolder(knex, folderId) {
        return knex.from('notes')
            .select('*')
            .where('folder', folderId)
    },
    insertNote(knex, newNote) {
        return knex
            .insert(newNote)
            .into('notes')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteNote(knex, id){
        return knex('notes')
            .where('id', id)
            .delete()
    },
    updateNote(knex, id, newNoteFields) {
        return knex('notes')
            .where('id', id)
            .update(newNoteFields)
    },
}

module.exports = notesService