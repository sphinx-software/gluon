import {TestSuite, testCase} from "WaveFunction";
import {MacroBuilder} from "Gluon";
import sinon from "sinon";
import {assert} from "chai";

export default class MacroBuilderTestSuite extends TestSuite {

    beforeEach(context) {
        this.builder = new MacroBuilder();
    }

    @testCase()
    testBuilderWithPositiveMacro() {
        let modifySpy     = sinon.spy();
        let morphOneStub  = sinon.stub().returns('rikky');
        let morphListStub = sinon.stub().returns('awesome');
        let query         = {};
        let sillyData     = {};

        this.builder.when('foo')
            .modifyQuery(modifySpy)
            .morphOne(morphOneStub)
            .morphList(morphListStub)
        ;

        let context = this.builder.use('foo', 'bar')
            .context();

        context.modifyQuery(query);
        assert(modifySpy.calledWith(query, 'bar'));

        assert.equal(context.morphOne(sillyData), 'rikky');
        assert(morphOneStub.calledWith(sillyData, 'bar'));

        assert.equal(context.morphList(sillyData), 'awesome');
        assert(morphListStub.calledWith(sillyData, 'bar'));
    }

    @testCase()
    testBuilderWithNegativeMacro() {
        let modifySpy     = sinon.spy();
        let morphOneStub  = sinon.stub().returns('rikky');
        let morphListStub = sinon.stub().returns('awesome');
        let query         = {};
        let sillyData     = {};


        this.builder.unless('foo')
            .modifyQuery(modifySpy)
            .morphOne(morphOneStub)
            .morphList(morphListStub)
        ;

        // Silly macros
        this.builder.when('foo');
        this.builder.when('something else');

        let shouldBeAvoidedContext = this.builder.use('foo', 'bar').context();

        shouldBeAvoidedContext.modifyQuery(query);
        shouldBeAvoidedContext.morphOne(sillyData);
        shouldBeAvoidedContext.morphList(sillyData);

        assert(modifySpy.notCalled);
        assert(morphOneStub.notCalled);
        assert(morphListStub.notCalled);



        let shouldBeHitContext = this.builder.use('something else').context();

        shouldBeHitContext.modifyQuery(query);
        assert(modifySpy.calledWith(query));

        assert.equal(shouldBeHitContext.morphOne(sillyData), 'rikky');
        assert(morphOneStub.calledWith(sillyData));

        assert.equal(shouldBeHitContext.morphList(sillyData), 'awesome');
        assert(morphListStub.calledWith(sillyData));
    }

    @testCase()
    testBuilderWithDefaultMacro() {
        let modifySpy     = sinon.spy();
        let morphOneStub  = sinon.stub().returns('rikky');
        let morphListStub = sinon.stub().returns('awesome');

        let query         = {};
        let sillyData     = {};

        this.builder.always()
            .modifyQuery(modifySpy)
            .morphOne(morphOneStub)
            .morphList(morphListStub)
        ;

        let context = this.builder.context();

        context.modifyQuery(query);
        assert(modifySpy.calledWith(query));

        assert.equal(context.morphOne(sillyData), 'rikky');
        assert(morphOneStub.calledWith(sillyData));

        assert.equal(context.morphList(sillyData), 'awesome');
        assert(morphListStub.calledWith(sillyData));
    }
}