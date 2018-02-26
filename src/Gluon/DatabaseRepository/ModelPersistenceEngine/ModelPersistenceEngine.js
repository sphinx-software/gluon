import lodash from "lodash";
import {PrimaryKey} from "../../DataType/index";
import PrimitiveType from "../../DataType/PrimitiveType";

export default class ModelPersistenceEngine {

    connection   = null;

    container    = null;

    constructor(connection, mapper) {
        this.connection   = connection;
        this.mapper       = mapper;
    }

    async insert(json, schema) {
        console.log(await this.mapper.mapRow(json, schema.fields));
    }
}
