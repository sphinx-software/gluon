import {type, String, PrimaryKey, Json, Hashed, Timestamps, SoftDelete, aggregations, aggregation} from "Gluon";

export class BarModel {
    @type(Json)
    jsonField = '{"foo": "bar"}';

    @type(Hashed)
    hashedField = 'hashed';
}

export class FooModel {

    @type(PrimaryKey)
    idField = 1;

    @type(BarModel)
    modelField = new BarModel();

    @type(String)
    stringField = 'String';

    @type(Timestamps)
    timestampField = new Timestamps();
}

export class HelloWorldModel {
    @type(PrimaryKey)
    idField = 1;
}

export class BooModel {
    @type(PrimaryKey)
    id = 1;

    @aggregation(HelloWorldModel)
    helloWorldModel = new HelloWorldModel();


    @type(SoftDelete)
    deletedAt = 0;
}

export class FarModel {

    @type(PrimaryKey)
    idField = 1;

    @aggregations(FooModel)
    fooModel = new FooModel();

    @aggregation(BooModel, 'some_fk_field')
    booModel = new BooModel();

    @type(Timestamps)
    timestampField = new Timestamps();

    @type(String)
    otherField = '';
}