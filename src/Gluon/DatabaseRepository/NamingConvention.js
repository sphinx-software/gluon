import lodash from 'lodash';
import pluralize from 'pluralize';

/**
 * Utility for convert the model metadata to the database
 * Using naming convention
 */
export default class NamingConvention {

    static tableName(modelName) {
        return lodash.snakeCase(pluralize(modelName)).toLowerCase();
    }

    static columnName(modelField) {
        return lodash.snakeCase(modelField);
    }

    static fieldName(columnName) {
        return lodash.camelCase(columnName);
    }

    static identifierField() {
        return 'id';
    }
}
