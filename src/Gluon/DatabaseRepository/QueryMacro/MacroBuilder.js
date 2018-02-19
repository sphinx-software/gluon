import Macro from "./Macro";
import lodash from "lodash";
import MacroContext from "./MacroContext";

/**
 * Utility for building a query Macro
 */
export default class MacroBuilder {

    /**
     * Map of positive macros
     *
     * @type {{Macro}}
     */
    positiveMacros = {};

    /**
     * Map of negative macros
     *
     * @type {{Macro}}
     */
    negativeMacros = {};

    /**
     * Map of default macros
     *
     * @type {Macro[]}
     */
    defaultMacros  = [];

    /**
     * Picked macro for a specific context
     *
     * @type {Array}
     */
    specifiedMacros = [];

    /**
     * Get a macro context with given specified macros
     *
     * @return {MacroContext}
     */
    context() {

        let usingMacros = this.specifiedMacros.map(macroDefinition => {
            if (!lodash.has(this.positiveMacros, macroDefinition.name)) {
                throw new Error(`ERROR_MACRO: Macro [${macroDefinition.name}] is not supported`);
            }

            macroDefinition.macro = this.positiveMacros[macroDefinition.name];

            return {
                macro: this.positiveMacros[macroDefinition.name],
                parameters: macroDefinition.parameters
            }
        });

        let specifiedMacrosName = this.specifiedMacros.map(macroDefinition => macroDefinition.name);

        let usingNegativeMacros = lodash.values(lodash.pickBy(
            this.negativeMacros,
            (macro, macroName) => !specifiedMacrosName.includes(macroName))
        ).map(macro => {
            return {
                macro: macro,
                parameters: []
            }
        });

        let defaultMacros = this.defaultMacros.map(macro => { return { macro: macro, parameters: [] } });

        // reset for other contexts;
        this.specifiedMacros = [];

        return new MacroContext(
            usingMacros
                .concat(usingNegativeMacros)
                .concat(defaultMacros)
        );
    }

    /**
     * Specify a macro for current context
     *
     * @param macroName
     * @param parameters
     * @return {MacroBuilder}
     */
    use(macroName, ...parameters) {
        this.specifiedMacros.push({name: macroName, parameters: parameters});
        return this;
    }

    /**
     * Register a positive macro
     *
     * @param macroName
     * @return {Macro}
     */
    when(macroName) {
        let macro = new Macro();

        this.positiveMacros[macroName] = macro;

        return macro;
    }

    /**
     * Register a negative macro
     *
     * @param macroName
     * @return {Macro}
     */
    unless(macroName) {
        let macro = new Macro();

        this.negativeMacros[macroName] = macro;

        return macro;
    }

    /**
     * Register a default macro
     *
     * @return {Macro}
     */
    always() {
        let macro = new Macro();

        this.defaultMacros.push(macro);

        return macro;
    }

    decorateRepositoryMethods() {
        // todo
    }
}
