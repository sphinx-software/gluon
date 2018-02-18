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
     * The map of virtual fields (schema access level only)
     *
     * @type {{}}
     */
    virtualFields = {};

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
     * Set a virtual field to the schema.
     * Virtual fields just helps on .toJson() method.
     * It has no special ability.
     *
     * @param field
     * @param value
     * @return {EntitySchema}
     */
    setVirtual(field, value) {
        this.virtualFields[field] = value;
        return this;
    }

    /**
     * Get a virtual field from the schema
     *
     * @param field
     * @return {*}
     */
    virtual(field) {
        return this.virtualFields[field];
    }

    /**
     * Jsonify the entity
     *
     * @param {*} entity
     */
    toJson(entity) {
        return lodash.mapValues(
            {...lodash.omit(this.fields, this.hiddenFields), ...this.virtualFields},
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
     * @param {*} entity
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
     * @param {*} entity
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

        if (!Reflect.has(entity, 'toJson') && 'toJson' === field) {
            return () => this.toJson(entity);
        }

        if (!Reflect.has(entity, 'setFields') &&'setFields' === field) {
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
     * @param {*} entity
     * @return {*}
     */
    static applyFor(entity) {
        return new Proxy(entity, new EntitySchema(...EntitySchema.inspect(entity.constructor)));
    }
}
