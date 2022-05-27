# `api` #

## Usage ##

```bash
npm install && ts-node "$(dirname $(npm root))"
```

## Dependencies ##

> *Where are the 500+ dependencies coming from?*

Dependency management can be hard; especially when it comes to tooling
for development teams to standardize certain practices -- including:

- Commit Messages
- Versioning
- Release Lifecycles
- CI-CD Process
- Unit Testing
- Security Scanning

Therefore, to understand more accurately the requirement(s) for a given package,
always ensure to check if a lock-file exists. In the specific case of the following
repository, being an `npm` package, that lock file is `package.json` + `package-lock.json`.

The **Production** dependencies, or just `dependencies`, is the section to take note of.

In order to prepare a package, generally speaking, for use in a production environment or
downstream package (as of `node` 18.x, `npm` +8):

```bash
npm install --omit dev --omit optional --omit peer
```

running the command above yields:

```log
up to date, audited 10 packages in 798ms
```
