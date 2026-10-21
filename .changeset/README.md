# Changesets

Every pull request that changes a published package (`@plop-ui/tokens`, `@plop-ui/fonts`, `@plop-ui/react`) adds a changeset:

```sh
pnpm changeset
```

Merging to `main` opens a release PR. Before 1.0, breaking changes go in **minor** versions and always carry a migration note.
