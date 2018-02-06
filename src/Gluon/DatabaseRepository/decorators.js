export function databaseRepository(Model) {
    return Reflect.metadata('gluon.repository.database', Model);
}

export function connection(connection) {
    return Reflect.metadata('gluon.repository.database.connection', connection);
}

export function table(table) {
    return Reflect.metadata('gluon.repository.database.table', table);
}
