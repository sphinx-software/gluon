import lodash from "lodash";
import NamingConvention from "./NamingConvention";
import {PrimaryKey, SoftDelete, Timestamps} from "../../DataType";
import EntityDataMapper from "./EntityDataMapper";
import EntitySchema from "../../Entity/EntitySchema";

/**
 * @implements RepositoryInterface
 */
export default class DatabaseRepository {

    connection   = null;

    Entity       = null;

    fields       = {};

    identifier   = '';

    softDelete   = '';

    timestamps   = '';

    columns      = [];

    tableName    = '';

    trash        = 'no';

    orders       = [];

    // --------------------------------------------------------------------------------------------------------------
    // Implementations
    // --------------------------------------------------------------------------------------------------------------

    /**
     * Find entities by a given condition
     *
     * @param {QueryableInterface} condition
     * @return {Promise<Entity[]>}
     */
    async find(condition) {
        let query   = this.makeQuery().select(this.columns);

        condition.decorate(query);

        let rawData = await query;

        return await Promise.all(rawData.map(async (row) => {
            let fields = await EntityDataMapper.toEntity(row, this.fields, this.container);
            let entity = await this.makeEntity();

            entity.schema.guardOff();
            entity.setFields(fields);
            entity.schema.guardOn();

            return entity;
        }));
    }

    /**
     * Find the first entities satisfied a given condition
     *
     * @param condition
     * @param defaultDataIfNotExisted
     * @return {Promise<*>}
     */
    async first(condition, defaultDataIfNotExisted = null) {
        let query   = this.makeQuery().select(this.columns);

        condition.decorate(query);

        let row     = await query;

        if (!row) {
            return defaultDataIfNotExisted;
        }

        let fields = EntityDataMapper.toEntity(row, this.fields, this.container);
        let entity = await this.makeEntity();

        entity.schema.guardOff();
        entity.setFields(fields);
        entity.schema.guardOn();

        return entity;
    }

    /**
     * Get a model by its identifier
     *
     * @param identifier
     * @param defaultDataIfNotExisted
     * @return {Promise<Entity>}
     */
    async get(identifier, defaultDataIfNotExisted = null) {
        let query   = this.makeQuery().select(this.columns).select(this.columns).first();
        let row     = await query;

        if (!row) {
            return defaultDataIfNotExisted;
        }

        let fields = await EntityDataMapper.toEntity(row, this.fields, this.container);
        let entity = await this.makeEntity();

        entity.schema.guardOff();
        entity.setFields(fields);
        entity.schema.guardOn();

        return entity;
    }

    /**
     * Get all models from this repository
     * @return {Promise<Entity[]>}
     */
    async all() {
        let query   = this.makeQuery().select(this.columns);
        let rawData = await query;

        return await Promise.all(rawData.map(async (row) => {
            let fields = await EntityDataMapper.toEntity(row, this.fields, this.container);
            let entity = await this.makeEntity();

            entity.schema.guardOff();
            entity.setFields(fields);
            entity.schema.guardOn();

            return entity;
        }));
    }

    /**
     * Create a new model in this repository and
     * returns its instance
     *
     * @param {*} entityFields
     * @return {Promise<Entity>}
     */
    async create(entityFields) {
        if (this.timestamps) {
            entityFields[this.timestamps] = new Timestamps(new Date(), null);
        }

        let rowData = await EntityDataMapper.toDatabaseStorage(entityFields, this.fields, this.container);

        let id      = (await this.makeQuery().insert(rowData))[0];
        let entity  = await this.makeEntity();

        entityFields[this.identifier] = id;

        let syncedEntityFields = await EntityDataMapper.toEntity(
            await EntityDataMapper.toDatabaseStorage(entityFields, this.fields, this.container),
            this.fields,
            this.container
        );

        entity.schema.guardOff();
        entity.setFields(syncedEntityFields);
        entity.schema.guardOn();

        return entity;
    }

    /**
     * Save a model into this repository (perform update)
     *
     * @param {Entity} model
     */
    async save(model) {
        // todo
    }

    /**
     * Remove a model by its identifier.
     * And return the removed model
     *
     * @param identifier
     * @return {Promise<Entity>}
     */
    async remove(identifier) {

    }


    // --------------------------------------------------------------------------------------------------------------
    // Extra methods
    // --------------------------------------------------------------------------------------------------------------

    /**
     * Make a conditional query
     *
     * @return {*}
     */
    makeQuery() {
        let query = this.connection.query().from(this.tableName);

        if (this.softDelete) {
            switch(this.trash) {
                case 'only':
                    query.whereNotNull(NamingConvention.columnName(this.softDelete));
                    break;
                case 'no':
                    query.whereNull(NamingConvention.columnName(this.softDelete));
                    break;
            }
        }

        if (this.timestamps) {
            let createdAtField = this.fields[this.timestamps]['name'][0];
            let updatedAtField = this.fields[this.timestamps]['name'][1];

            this.orders.forEach(order => {
                switch (order) {
                    case 'newest':
                        query.orderBy(createdAtField, 'DESC');
                        break;
                    case 'latest':
                        query.orderBy(updatedAtField, 'DESC');
                        break;
                    case 'oldest':
                        query.orderBy(createdAtField);
                        break;
                    case 'earliest':
                        query.orderBy(updatedAtField);
                        break
                }
            })
        }

        this.conditionalReset();

        return query;
    }

    /**
     * Restore a model by its identifier.
     * And return the restored model
     *
     * @param identifier
     * @return {Promise<Entity>}
     */
    async restore(identifier) {

    }

    /**
     * Destroy a model by its identifier
     * And return the destroyed model
     *
     * @param identifier
     * @return {Promise<Entity>}
     */
    async destroy(identifier) {

    }

    /**
     * Perform include trash
     *
     * @return {DatabaseRepository}
     */
    includeTrash() {
        if (!this.softDelete) {
            throw new Error(`E_DATABASE_REPOSITORY: The entity [${this.Entity.name}] does not have [SoftDelete] field type`);
        }
        this.trash = 'include';
        return this;
    }

    /**
     * Only perform in trash
     *
     * @return {DatabaseRepository}
     */
    onlyTrash() {
        if (!this.softDelete) {
            throw new Error(`E_DATABASE_REPOSITORY: The entity [${this.Entity.name}] does not have [SoftDelete] field type`);
        }
        this.trash = 'only';
        return this;
    }

    /**
     * Order with newest model
     *
     * @return {DatabaseRepository}
     */
    newest() {
        if (!this.timestamps) {
            throw new Error(`E_DATABASE_REPOSITORY: The entity [${this.Entity.name}] does not have [Timestamps] field type`);
        }
        this.orders.push('newest');
        return this;
    }

    /**
     * Order with latest model
     *
     * @return {DatabaseRepository}
     */
    latest() {
        if (!this.timestamps) {
            throw new Error(`E_DATABASE_REPOSITORY: The entity [${this.Entity.name}] does not have [Timestamps] field type`);
        }
        this.orders.push('latest');
        return this;
    }

    /**
     * Order with oldest model
     *
     * @return {DatabaseRepository}
     */
    oldest() {
        if (!this.timestamps) {
            throw new Error(`E_DATABASE_REPOSITORY: The entity [${this.Entity.name}] does not have [Timestamps] field type`);
        }
        this.orders.push('oldest');
        return this;
    }

    /**
     * Order with earliest model
     *
     * @return {DatabaseRepository}
     */
    earliest() {
        if (!this.timestamps) {
            throw new Error(`E_DATABASE_REPOSITORY: The entity [${this.Entity.name}] does not have [Timestamps] field type`);
        }
        this.orders.push('earliest');
        return this;
    }

    /**
     * Reset the conditional search strategies
     */
    conditionalReset() {
        this.trash  = 'no';
        this.orders = [];
    }


    // --------------------------------------------------------------------------------------------------------------
    // Initial methods
    // --------------------------------------------------------------------------------------------------------------

    /**
     * Set the entity symbol to this repository.
     * Inspect the Entity schema
     *
     * @param Entity
     * @return {DatabaseRepository}
     */
    setEntity(Entity) {
        this.Entity = Entity;

        this.inspectEntity(Entity);

        return this;
    }

    /**
     *
     * @param container
     * @return {DatabaseRepository}
     */
    setContainer(container) {
        this.container = container;
        return this;
    }

    /**
     *
     * @param {DatabaseConnectionInterface} connection
     * @return {DatabaseRepository}
     */
    setConnection(connection) {
        this.connection = connection;
        return this;
    }

    // --------------------------------------------------------------------------------------------------------------
    // Data mapping
    // --------------------------------------------------------------------------------------------------------------

    /**
     * Create an entity instance
     *
     * @return {Promise<Entity>}
     */
    async makeEntity() {
        return EntitySchema.applyFor(await this.container.make(this.Entity));
    }

    /**
     * Load the entity metadata
     *
     * @param Entity
     */
    inspectEntity(Entity) {
        let inspection  = EntitySchema.inspect(Entity);

        this.fields     = inspection[0];
        this.identifier = lodash.findKey(this.fields, (fieldMetadata) => fieldMetadata.type === PrimaryKey);
        this.softDelete = lodash.findKey(this.fields, (fieldMetadata) => fieldMetadata.type === SoftDelete);
        this.timestamps = lodash.findKey(this.fields, (fieldMetadata) => fieldMetadata.type === Timestamps);

        this.tableName  = Reflect.getMetadata('gluon.repository.database.table', Entity) ||
            NamingConvention.tableName(Entity.name);

        this.columns    = lodash.flatMap(lodash.values(lodash.mapValues(
            this.fields,
            (fieldMetadata, fieldName) =>
                fieldMetadata.name.length ?
                    fieldMetadata.name :
                    NamingConvention.columnName(fieldName)

        )));
    }
}
