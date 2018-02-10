import QueryScope from "./QueryScope";

export default class QueryScopeSyntax {

    positiveScopes = {};

    negativeScopes = {};

    constructor(repository) {
        this.repository = repository;
    }

    whenCall(methodName) {
        let scope = new QueryScope();

        this.positiveScopes[methodName] = scope;

        return scope;
    }

    unlessCall(methodName) {
        let scope = new QueryScope();

        this.negativeScopes[methodName] = scope;

        return scope;
    }
}
