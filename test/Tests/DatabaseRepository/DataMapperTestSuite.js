import {TestSuite, testCase} from "WaveFunction";
import {assert} from "chai";
import {DataMapper, NamingConvention} from "Gluon";
import {type, PrimaryKey, Json, Timestamps} from "Gluon";
import Container from "@sphinx-software/container";
import {EventEmitter} from "events";

class ModelStub {

    @type(PrimaryKey)
    id = -1;

    @type(Json)
    fooBar = "";
}

class ModelStubWithValueObject {
    @type(Timestamps)
    timestamps = null;

    @type(ModelStub)
    otherValue = null
}

export default class DataMapperTestSuite extends TestSuite {

    async before(context) {
        let container = new Container(new EventEmitter());

        container
            .bind(ModelStub, () => new ModelStub())
            .bind(Timestamps, () => new Timestamps())
            .bind(ModelStubWithValueObject, async () => new ModelStubWithValueObject())
        ;

        this.mapper = new DataMapper(new NamingConvention(), container);
    }

    @testCase()
    async testDataMapperMakesASimpleModel() {
        let model = await this.mapper.mapModel({
            id: 1,
            foo_bar: JSON.stringify({foo: 'bar'})
        }, ModelStub);

        assert.instanceOf(model, ModelStub);

        assert.equal(model.id, 1);
        assert.deepEqual(model.fooBar, {foo: "bar"});
    }

    @testCase()
    async testDataMapperMakesAModelWithEmbeddedValueObject() {
        let createdAtTimestamp = new Date().getTime();
        let updatedAtTimestamp = new Date().getTime();

        let model = await this.mapper.mapModel({
            id: 1,
            created_at: createdAtTimestamp,
            updated_at: updatedAtTimestamp,
            foo_bar: JSON.stringify({foo: 'bar'})
        }, ModelStubWithValueObject);


        assert.instanceOf(model, ModelStubWithValueObject);

        // Assertions on timestamps field
        assert.instanceOf(model.timestamps, Timestamps);

        assert.instanceOf(model.timestamps.createdAt, Date);
        assert.equal(model.timestamps.createdAt.getTime(), createdAtTimestamp);

        assert.instanceOf(model.timestamps.updatedAt, Date);
        assert.equal(model.timestamps.updatedAt.getTime(), createdAtTimestamp);

        // Assertions on otherValue field => ModelStub instance
        assert.instanceOf(model.otherValue, ModelStub);
        assert.equal(model.otherValue.id, 1);
        assert.deepEqual(model.otherValue.fooBar, {foo: "bar"});
    }
}
