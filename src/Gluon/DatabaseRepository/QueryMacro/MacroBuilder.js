import Macro from "./Macro";
import lodash from "lodash";

/**
 * Utility for building a query Macro
 */
export default class MacroBuilder {
    positiveScopes = {};
    negativeScopes = {};
    defaultScopes  = [];

    context(contextDefinition) {

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
