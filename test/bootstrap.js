import {Runner, Formatter} from "WaveFunction";
import * as testSuites from "Tests/DatabaseRepository/index";


let runner = new Runner();

runner.useFormatter(new Formatter());
runner.loadSuites(testSuites);

runner.run();
