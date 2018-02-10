export default class QueryContext {
    constructor(queryScopes) {
        this.scopes = queryScopes;
    }

    dispatch(query) {
        this.scopes.forEach(scopeDefinition => {
            scopeDefinition.scope(query, ...scopeDefinition.parameters);
        })
    }
}
