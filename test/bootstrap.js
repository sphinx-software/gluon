import {Runner, Formatter} from "WaveFunction";
import * as testSuites from "Tests";


let runner = new Runner();

runner.useFormatter(new Formatter());
runner.loadSuites(testSuites);

runner.run();
