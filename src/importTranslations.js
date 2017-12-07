const { fromEvent } = require('graphcool-lib');
const { flatten } = require('flat');

const CREATE_TRANSLATION_MUTATION = `
  mutation createTranslation($applicationId: ID!, $languageId: ID!, $key: String!, $value: String!) {
    createTranslation(key: $key, applicationId: $applicaationId, values: [{ languageId: $languageId, value: $value }]) {
      id
      key
      values {
        id
        language {
          id
        }
        value
      }
    }
  }
`;

const createTranslation = (api, applicationId, languageId, key, value) => {
  return api
    .request(CREATE_TRANSLATION_MUTATION, {
      applicationId,
      languageId,
      key,
      value
    })
    .then(userMutationResult => {
      return userMutationResult.createTranslation;
    });
};

module.exports = event => {
  // Retrieve payload from event
  const { fileContents, applicationId, languageId } = event.data;
  const graphcool = fromEvent(event);
  const api = graphcool.api('simple/v1');

  const translations = JSON.parse(fileContents);
  const flattenedTranslations = flatten(translations);

  const promises = [];
  Object.keys(translations).forEach(key => {
    const mutation = createTranslation(
      api,
      applicationId,
      languageId,
      key,
      translations[key]
    );
    promises.push(mutation);
  });

  return Promise.all(promises).then(mutationResults => ({
    data: mutationResults
  }));
};
