export default class QueryScope {
    thenDo(scopeHandler) {
        this.scopeHandler = scopeHandler;
        return this;
    }

    thenDoNothing() {
        this.scopeHandler = () => {};
        return this;
    }

    andReturns(scopeHandler) {

    }

    run(queryContext) {
        // todo
    }
}
