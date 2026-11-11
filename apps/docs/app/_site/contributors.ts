/** Everyone who has shipped code to PlopUI, by GitHub login. Component pages credit them through `contributors` in registry.ts. */
export const CONTRIBUTORS: Array<{ login: string; work: string }> = [
  { login: "glaucusec", work: "Breadcrumb and Slider" },
  { login: "luxmoncoeur", work: "NumberStepper" },
  { login: "aneqlique", work: "The playground's radius control" },
  { login: "matheussilvano", work: "Form values for Select and MultiSelect" },
  { login: "bfs2021", work: "JSX escaping in the playground's copy button" },
];

export const githubProfile = (login: string) => `https://github.com/${login}`;
