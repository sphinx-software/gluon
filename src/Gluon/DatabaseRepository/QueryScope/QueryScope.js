import QueryContext from "./QueryContext";
import lodash from "lodash";

export default class QueryScope {
    positiveScopes = {};
    negativeScopes = {};
    defaultScopes  = [];


    context(contextDefinition) {
        let foundNegativeScopes = contextDefinition
            .filter(scopeDefinition => !!this.negativeScopes[scopeDefinition.scope])
            .map(contextDefinition => contextDefinition.scope)
        ;

        let shouldBeAddedNegativeScopes = lodash.values(lodash
            .pickBy(this.negativeScopes, (scopeExecutor, name) => !foundNegativeScopes.includes(name)))
            .map(scopeExecutor => {
                return {scope: scopeExecutor, parameters: []}
            })
        ;

        // remove negative scopes
        contextDefinition = contextDefinition
            .filter(scopeDefinition => !foundNegativeScopes.includes(scopeDefinition.scope))
        ;


        let contextDescriber = contextDefinition.map(scopeDefinition => {
            return {
                scope: this.positiveScopes[scopeDefinition.scope],
                parameters: scopeDefinition.parameters || []
            }
        });

        contextDescriber = contextDescriber
            // merge with default scopes
            .concat(this.defaultScopes.map(defaultScope => {
                return { scope: defaultScope, parameters: [] }
            }))
            // merge with negative scopes
            .concat(shouldBeAddedNegativeScopes)
        ;

        return new QueryContext(contextDescriber);
    }

    unless(scopeName, scopeExecutor) {
        this.negativeScopes[scopeName] = scopeExecutor;
        return this;
    }

    always(scopeExecutor) {
        this.defaultScopes.push(scopeExecutor);
        return this;

    }

    when(scopeName, scopeExecutor) {
        this.positiveScopes[scopeName] = scopeExecutor;
        return this;
    }
}
