/**
 * A macro running context,
 * which can modify an SQL query & apply the data morphing on the returned data.
 */
export default class MacroContext {

    /**
     * The list of macro that will be used and its related parameters
     *
     * @type {Array}
     */
    receipts = [];

    /**
     *
     * @param {Array} receipts
     */
    constructor(receipts) {
        this.receipts = receipts;
    }

    /**
     * Do modify an SQL query by calling the .doModify() method on each macro
     *
     * @param query
     * @return {*}
     */
    modifyQuery(query) {
        this.receipts
            .forEach(
                macroDefinition => macroDefinition
                    .macro.doModify(query, ...macroDefinition.parameters))
        ;

        return query;
    }

    /**
     * @note: Caution!! This method is sensitive with the order macros. Use it at your own risk!
     *
     * Morph a single chunk of data by tunneling the .doMorphOne() of each macro
     *
     * @param willBeMorphedData
     * @return {*|any}
     */
    morphOne(willBeMorphedData) {
        return this.receipts.reduce(
            (morphed, macroDefinition) =>
                macroDefinition.macro.doMorphOne(morphed, ...macroDefinition.parameters),
            willBeMorphedData
        );
    }

    /**
     * @note: Caution!! This method is sensitive with the order macros. Use it at your own risk!
     *
     * Morph a single chunk of data by tunneling the .doMorphList() of each macro
     *
     * @param willBeMorphedData
     * @return {*|any}
     */
    morphList(willBeMorphedData) {
        return this.receipts.reduce(
            (morphed, macroDefinition) =>
                macroDefinition.macro.doMorphList(morphed, ...macroDefinition.parameters),
            willBeMorphedData
        );
    }
}
