import PrimitiveType from "./PrimitiveType";
import {HasherInterface} from "Fusion";

/**
 * @implements PrimitiveDataTypeInterface
 */
export default class Hashed extends PrimitiveType {
    static async fromStorage(storageValue) {
        return storageValue;
    }

    static async toStorage(modelValue, container) {
        let hasher = await container.make(HasherInterface);
        return await hasher.generate(modelValue);
    }
}
