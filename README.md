# github-repos-scoring

This is an application that generates a popularity score for repositories on GitHub.

## Running the application

In order to query the GitHub API used by the application, the user needs to pass a valid GitHub API [USER_TOKEN](https://docs.github.com/en/rest/authentication/authenticating-to-the-rest-api?apiVersion=2022-11-28#authenticating-with-a-personal-access-token).

The application takes the following parameters as environment variables:

* `LANGUAGE`: The programming language of the repository. Eg. 'javascript'
* `DATE`: The earliest created date of the repository. Eg. '2022-09-19'

Run the application with:

`USER_TOKEN=<token> LANGUAGE=<language> DATE=<created_date> npm start`

## Output

The application outputs the name of the repository along with its calculated popularity score.

Here is an example of the sample output:

```
{ name: 'LifeList', popularityScore: '0.322' }
{ name: 'flauncher', popularityScore: '0.334' }
```

## Running the tests

The app has unit tests that can be run with:

`npm test`
