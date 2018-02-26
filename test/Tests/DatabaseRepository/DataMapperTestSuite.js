import {TestSuite, testCase} from "WaveFunction";
import {assert} from "chai";
import {DataMapper, EntitySchemaReader, NamingConvention, aggregation, aggregations, eager} from "Gluon";
import {type, PrimaryKey, Json, Timestamps, String, Reference} from "Gluon";
import Container from "@sphinx-software/container";
import {EventEmitter} from "events";

class ModelStub {

    @type(Json)
    fooBar = {};
}

class ModelStubWithValueObject {
    @type(PrimaryKey)
    id = null;

    @type(Timestamps)
    timestamps = null;

    @type(Json)
    fooBar = {};

    @type(ModelStub)
    otherValue = null;
}

class AggregatedModelStub {

    @type(PrimaryKey)
    id = null;

    @type(String)
    value = null;
}

class ModelStubWithAggregation {

    @type(PrimaryKey)
    id = null;

    @eager()
    @aggregation(ModelStubWithValueObject)
    singleAggregation = null;

    @eager()
    @aggregations(AggregatedModelStub)
    multiAggregation = [];

    @type(Reference, 'ref_id')
    someReference = null;
}

export default class DataMapperTestSuite extends TestSuite {

    async before(context) {

        // Jeezzzzzz! Creating the real awesome container is
        // even easier than mocking it
        let container = new Container(new EventEmitter());
        this.reader   = new EntitySchemaReader(new NamingConvention());

        container
            .bind(ModelStub, () => new ModelStub())
            .bind(Timestamps, () => new Timestamps())
            .bind(ModelStubWithValueObject, async () => new ModelStubWithValueObject())
            .bind(ModelStubWithAggregation, async () => new ModelStubWithAggregation())
            .bind(AggregatedModelStub, async () => new AggregatedModelStub())
        ;

        this.mapper = new DataMapper(container);
    }

    @testCase()
    async testDataMapperMakesASimpleModel() {

        let model = await this.mapper.mapModel([{
            'model_stubs.foo_bar': JSON.stringify({foo: 'bar'})
        }], this.reader.read(ModelStub));

        assert.instanceOf(model, ModelStub);
        assert.deepEqual(model.fooBar, {foo: "bar"});
    }

    @testCase()
    async testDataMapperMakesAModelWithEmbeddedValueObject() {
        let createdAtTimestamp = new Date().getTime();
        let updatedAtTimestamp = new Date().getTime();

        let model = await this.mapper.mapModel([{
            'model_stub_with_value_objects.id': 1,
            'model_stub_with_value_objects.created_at': createdAtTimestamp,
            'model_stub_with_value_objects.updated_at': updatedAtTimestamp,
            'model_stub_with_value_objects.foo_bar': JSON.stringify({foo: 'bar'})
        }], this.reader.read(ModelStubWithValueObject));

        assert.instanceOf(model, ModelStubWithValueObject);

        // Assertions on timestamps field
        assert.instanceOf(model.timestamps, Timestamps);

        assert.instanceOf(model.timestamps.createdAt, Date);
        assert.equal(model.timestamps.createdAt.getTime(), createdAtTimestamp);

        assert.instanceOf(model.timestamps.updatedAt, Date);
        assert.equal(model.timestamps.updatedAt.getTime(), updatedAtTimestamp);

        // Assertions on otherValue field => ModelStub instance
        assert.instanceOf(model.otherValue, ModelStub);

        // If the embedded value object share the same field name with it's parent
        // then those 2 should share the same value
        assert.deepEqual(model.otherValue.fooBar, {foo: "bar"});
        assert.deepEqual(model.otherValue.fooBar, {foo: "bar"});
    }

    @testCase()
    async testDataMapperMakesAListOfComplexModelsWithAggregations() {

        let createdAtTimestamp = new Date().getTime();
        let updatedAtTimestamp = new Date().getTime();

        // Here we'll simulate the result of a join SQL query
        let rowSet = [
            {
                // The Main model row set
                "model_stub_with_aggregations.id": 1,
                "model_stub_with_aggregations.ref_id": 1,

                // The aggregated models
                'model_stub_with_value_objects.id': 1,
                'model_stub_with_value_objects.created_at': createdAtTimestamp,
                'model_stub_with_value_objects.updated_at': updatedAtTimestamp,
                'model_stub_with_value_objects.foo_bar': JSON.stringify({foo: 'bar'}),


                'aggregated_model_stubs.id': 1,
                'aggregated_model_stubs.value': 'any'
            },
            {
                // The Main model row set
                "model_stub_with_aggregations.id": 1,
                "model_stub_with_aggregations.ref_id": 1,

                // The aggregated models
                'model_stub_with_value_objects.id': 1,
                'model_stub_with_value_objects.created_at': createdAtTimestamp,
                'model_stub_with_value_objects.updated_at': updatedAtTimestamp,
                'model_stub_with_value_objects.foo_bar': JSON.stringify({foo: 'bar'}),

                'aggregated_model_stubs.id': 2,
                'aggregated_model_stubs.value': 'thing'
            },

            {
                // The Main model row set
                "model_stub_with_aggregations.id": 2,
                "model_stub_with_aggregations.ref_id": 2,

                // The aggregated models
                'model_stub_with_value_objects.id': 3,
                'model_stub_with_value_objects.created_at': createdAtTimestamp,
                'model_stub_with_value_objects.updated_at': updatedAtTimestamp,
                'model_stub_with_value_objects.foo_bar': JSON.stringify({foo: 'bar'}),

                'aggregated_model_stubs.id': 5,
                'aggregated_model_stubs.value': 'thing'
            }
        ];

        let models = await this.mapper.mapModels(rowSet, this.reader.read(ModelStubWithAggregation));

        let model = models[0];

        assert.instanceOf(model, ModelStubWithAggregation);

        // Even on eager loading, we still return the aggregated model as an async function.
        // Which will help the api become unified, predictable.
        // This also avoid unnecessary conditional check on the consumer code.

        // However, if the developer wants to get actual value synchronously,
        // he can get it via the virtual field @code: model.schema.virtual(fieldName)
        assert.equal(model.schema.virtual('singleAggregation'), await model.singleAggregation());
        assert.equal(model.schema.virtual('multiAggregation'), await model.multiAggregation());

        let shouldBeModelStubWithValueObject = await model.singleAggregation();
        assert.instanceOf(shouldBeModelStubWithValueObject, ModelStubWithValueObject);
        assert.equal(shouldBeModelStubWithValueObject.id, 1);

        let shouldBeListOfAggregatedModelStub = await model.multiAggregation();
        assert.lengthOf(shouldBeListOfAggregatedModelStub, 2);

        assert.instanceOf(shouldBeListOfAggregatedModelStub[0], AggregatedModelStub);
        assert.equal(shouldBeListOfAggregatedModelStub[0].id, 1);

        assert.instanceOf(shouldBeListOfAggregatedModelStub[1], AggregatedModelStub);
        assert.equal(shouldBeListOfAggregatedModelStub[1].id, 2);

        assert.instanceOf(model.someReference, Reference);
    }

    @testCase()
    async testMapperMapsModelsOnNullValues() {
        let rowSet = [];

        let shouldBeNull = await this.mapper
            .mapModel(rowSet, this.reader.read(ModelStubWithValueObject))
        ;

        assert.isNull(shouldBeNull);

        let shouldBeEmpty = await this.mapper
            .mapModels(rowSet, this.reader.read(ModelStubWithValueObject))
        ;

        assert.isEmpty(shouldBeEmpty);
    }

    @testCase()
    async testMapperMapsModelsOnNullAggregations() {
        let rowSet = [
            {
                // The Main model row set
                "model_stub_with_aggregations.id": 1,
                "model_stub_with_aggregations.ref_id": 1,

                // The aggregated models
                'model_stub_with_value_objects.id': null,
                'model_stub_with_value_objects.created_at': null,
                'model_stub_with_value_objects.updated_at': null,
                'model_stub_with_value_objects.foo_bar': null,


                'aggregated_model_stubs.id': null,
                'aggregated_model_stubs.value': null
            },
            {
                // The Main model row set
                "model_stub_with_aggregations.id": 2,
                "model_stub_with_aggregations.ref_id": 2,

                // The aggregated models
                'model_stub_with_value_objects.id': null,
                'model_stub_with_value_objects.created_at': null,
                'model_stub_with_value_objects.updated_at': null,
                'model_stub_with_value_objects.foo_bar': null,


                'aggregated_model_stubs.id': null,
                'aggregated_model_stubs.value': null
            }
        ];

        let results = await this.mapper
            .mapModels(rowSet, this.reader.read(ModelStubWithAggregation));

        assert.lengthOf(results, 2);

        assert.isNull(await results[0].singleAggregation());
        assert.isNull(await results[1].singleAggregation());

        assert.isEmpty(await results[0].multiAggregation());
        assert.isEmpty(await results[1].multiAggregation());
    }
}
