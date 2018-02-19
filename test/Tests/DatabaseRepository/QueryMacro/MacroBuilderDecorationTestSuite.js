import {TestSuite, testCase} from "WaveFunction";
import {MacroBuilder} from "Gluon";
import {assert} from "chai";
import sinon from "sinon";

export default class MacroBuilderDecorationTestSuite extends TestSuite {

    beforeEach() {
        this.builder = new MacroBuilder()
    }

    @testCase()
    'testTheMacroBuilderCanDecorateExtraMethodsOnARepositoryWithAVeryBeautifulName ^^! ' () {
        this.builder.when('foo');
        this.builder.when('foo bar');
        this.builder.when('FAR-boo');

        let stubRepository = {};
        let useMethodStub  = sinon.stub(this.builder, 'use');

        this.builder.decorateRepositoryMethods(stubRepository);

        assert.isFunction(stubRepository.withFoo);
        assert.equal(stubRepository, stubRepository.withFoo('parameter1', 'parameter2'));
        assert(useMethodStub.calledWith('foo', 'parameter1', 'parameter2'));

        assert.isFunction(stubRepository.withFooBar);
        assert.equal(stubRepository, stubRepository.withFooBar('parameter1', 'parameter2'));
        assert(useMethodStub.calledWith('foo bar', 'parameter1', 'parameter2'));

        assert.isFunction(stubRepository.withFarBoo);
        assert.equal(stubRepository, stubRepository.withFarBoo('parameter1', 'parameter2'));
        assert(useMethodStub.calledWith('FAR-boo', 'parameter1', 'parameter2'));

        useMethodStub.restore();
    }

    @testCase()
    testTheMacroBuilderShouldThrowErrorWhenTheMethodIsAlreadyExisted() {
        this.builder.when('foo');

        let stubRepository = {withFoo: () => {}};

        assert.throws(() => {
            this.builder.decorateRepositoryMethods(stubRepository);
        }, 'E_MACRO_METHOD_EXISTED');
    }

    @testCase()
    testTheMacroBuilderShouldNotThrowErrorWhenTheDecoratedMethodNamesCollidedEachOtherButUseTheLastOneInstead() {
        this.builder.when('foo');
        this.builder.when('Foo');

        let stubRepository = {};
        let useMethodStub  = sinon.stub(this.builder, 'use');

        this.builder.decorateRepositoryMethods(stubRepository);

        assert.isFunction(stubRepository.withFoo);
        assert.equal(stubRepository, stubRepository.withFoo());
        assert(useMethodStub.calledWith('Foo'));

        useMethodStub.restore();
    }
}
