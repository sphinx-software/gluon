import {singleton} from "Fusion/MetaInjector";
import {DatabaseRepository, databaseRepository} from "Gluon/index";
import Credential from "./Credential";

@singleton()
@databaseRepository(Credential)
export default class CredentialRepository extends DatabaseRepository {

}
