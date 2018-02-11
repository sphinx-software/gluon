import {type, String, PrimaryKey, Json, Hashed, Timestamps, SoftDelete, aggregations, aggregation} from "Gluon";

export class BarModel {
    @type(Json)
    jsonField;

    @type(Hashed)
    hashedField;
}

export class FooModel {

    @type(PrimaryKey)
    idField;

    @type(BarModel)
    modelField;

    @type(String)
    stringField;

    @type(Timestamps)
    timestampField;
}

export class HelloWorldModel {
    @type(PrimaryKey)
    idField = 1;
}

export class BooModel {
    @type(PrimaryKey)
    id;

    @aggregation(HelloWorldModel)
    helloWorldModel;


    @type(SoftDelete)
    deletedAt;
}

export class FarModel {

    @type(PrimaryKey)
    idField;

    @aggregations(FooModel)
    fooModel;

    @aggregation(BooModel, 'some_fk_field')
    booModel;

    @type(Timestamps)
    timestampField;

    @type(String)
    otherField;
}


export class NoPKModel {

    @aggregation(FarModel)
    aggregationField;
}