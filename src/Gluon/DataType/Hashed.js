import Value from "./Value";
import {HasherInterface} from "Fusion";

/**
 * @implements DataTypeInterface
 */
export default class Hashed extends Value {
    static async fromStorage(storageValue) {
        return storageValue;
    }

    static async toStorage(modelValue, container) {
        let hasher = await container.make(HasherInterface);
        return await hasher.generate(modelValue);
    }
}
