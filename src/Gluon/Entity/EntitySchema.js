import lodash from "lodash";

/**
 * EntitySchema, built with Proxy traps.
 */
export default class EntitySchema {

    /**
     * The guarding flag
     *
     * @type {boolean}
     */
    guardMode = true;

    /**
     * The map of the fields with its type
     *
     * @type {{}}
     */
    fields = {};

    /**
     * List of hidden fields
     *
     * @type {Array}
     */
    hiddenFields = [];

    /**
     * List of readonly fields
     *
     * @type {Array}
     */
    readonlyFields = [];

    /**
     *
     * @param {{}} fields
     * @param {Array} hiddenFields
     * @param {Array} readonlyFields
     */
    constructor(fields, hiddenFields, readonlyFields) {
        this.fields             = fields;
        this.hiddenFields       = hiddenFields;
        this.readonlyFields     = readonlyFields;
    }

    /**
     * Turn off the guard flag
     *
     */
    unguard() {
        this.guardMode = false;
    }

    /**
     * Turn on the guard flag
     *
     */
    guard() {
        this.guardMode = true;
    }

    /**
     * Jsonify the entity
     *
     * @param {Entity} entity
     */
    toJson(entity) {
        return lodash.mapValues(
            lodash.omit(this.fields, this.hiddenFields),
            (metadata, fieldName) => {
                if (entity[fieldName] !== null && entity[fieldName]['toJson']) {
                    return entity[fieldName].toJson()
                }

                return entity[fieldName];
            }
        );
    }

    /**
     * Mass assign fields to the entity
     *
     * @param entity
     * @param fieldValues
     */
    setFields(entity, fieldValues) {

        if (this.guardMode) {
            throw new Error(`E_SCHEMA_GUARD_MODE: Could not mass assign entity fields in guard mode`);
        }

        lodash.forIn(fieldValues, (value, field) => {
            this.set(entity, field, value);
        });
    }

    /**
     * Set trap
     *
     * @param {Entity} entity
     * @param {string} field
     * @return {boolean}
     */
    set(entity, field) {
        if (this.guardMode && this.readonlyFields.includes(field)) {
            throw new Error(`E_SCHEMA_GUARD_MODE: Field [${field}] is readonly`);
        }

        return Reflect.set(...arguments);
    }

    /**
     * Get trap
     *
     * @param {Entity} entity
     * @param {string} field
     * @return {*}
     */
    get(entity, field) {
        // Allows the lower layer can access this schema
        if ('schema' === field) {
            return this;
        }

        if (this.guardMode && this.hiddenFields.includes(field)) {
            throw new Error(`E_SCHEMA_GUARD_MODE: Field [${field}] is hidden`);
        }

        if ('toJson' === field) {
            return () => this.toJson(entity);
        }

        if ('setFields' === field) {
            return (fieldValues) => this.setFields(entity, fieldValues);
        }

        return entity[field];
    }

    /**
     * Inspect an Entity constructor
     *
     * @param {constructor|Symbol|Function} Entity
     * @return {*[]}
     */
    static inspect(Entity) {
        return [
            Reflect.getMetadata('gluon.entity.fields', Entity)   || {},
            Reflect.getMetadata('gluon.entity.hidden', Entity)   || [],
            Reflect.getMetadata('gluon.entity.readonly', Entity) || []
        ];
    }

    /**
     * Apply this proxy to the entity instance
     *
     * @param {Entity} entity
     * @return {Entity}
     */
    static applyFor(entity) {
        return new Proxy(entity, new EntitySchema(...EntitySchema.inspect(entity.constructor)));
    }
}
