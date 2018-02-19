/**
 * Represents an SQL macro.
 * Which can modify the SQL & modify the returning result of that SQL.
 */
export default class Macro {

    /**
     * List of modifiers & morpher
     *
     * @type {{modify: function(), morphOne: function(*): *, morphList: function(*): *}}
     */
    callbacks = {
        modify    : () => {},
        morphOne  :  i =>  i,
        morphList :  i =>  i,
    };

    /**
     * Define how this macro modifies the SQL
     *
     * @param {Function} callback
     * @return {Macro}
     */
    modifyQuery(callback) {
        this.callbacks.modify = callback;
        return this;
    }

    /**
     * Define how this macro morph a single entity
     *
     * @param {Function} callback
     * @return {Macro}
     */
    morphOne(callback) {
        this.callbacks.morphOne = callback;
        return this;
    }

    /**
     * Define how this macro morph list of entities
     *
     * @param {Function} callback
     * @return {Macro}
     */
    morphList(callback) {
        this.callbacks.morphList = callback;
        return this;
    }

    /**
     * Run the modifier
     *
     * @param query
     * @param args
     * @return {*}
     */
    doModify(query, ...args) {
        this.callbacks.modify(query, ...args);
        return query;
    }

    /**
     * Run the single morpher
     *
     * @param data
     * @param args
     * @return {*}
     */
    doMorphOne(data, ...args) {
        return this.callbacks.morphOne(data, ...args);
    }

    /**
     * Run the multi morpher
     *
     * @param data
     * @param args
     * @return {*}
     */
    doMorphList(data, ...args) {
        return this.callbacks.morphList(data, ...args);
    }
}
