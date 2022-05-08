import assert from "assert";
import { parseArgument } from "../index.mjs";

const tests = {
  "https://amirs@bitbucket.org/amirs/dev.git": {
    org: "bitbucket.org",
    user: "amirs",
    repo: "dev",
    remote: "https://amirs@bitbucket.org/amirs/dev.git",
  },
  "git@bitbucket.org:amirs/dev.git": {
    org: "bitbucket.org",
    user: "amirs",
    repo: "dev",
    remote: "git@bitbucket.org:amirs/dev.git",
  },
  "https://github.com/amir-s/dev.git": {
    org: "github.com",
    user: "amir-s",
    repo: "dev",
    remote: "https://github.com/amir-s/dev.git",
  },
  "git@github.com:amir-s/dev.git": {
    org: "github.com",
    user: "amir-s",
    repo: "dev",
    remote: "git@github.com:amir-s/dev.git",
  },
  "amir-s/dev": {
    org: "github.com",
    user: "amir-s",
    repo: "dev",
    remote: "git@github.com:amir-s/dev.git",
  },
  "amir-s/dev.git": {
    org: "github.com",
    user: "amir-s",
    repo: "dev",
    remote: "git@github.com:amir-s/dev.git",
  },
  "https://git.somewhere.co.uk/one-1/~two/Three/user/repo.git": {
    org: "git.somewhere.co.uk",
    user: "user",
    repo: "repo",
    remote: "https://git.somewhere.co.uk/one-1/~two/Three/user/repo.git",
  },
  "https://git.somewhere.co.uk/one-1/~two/Three/user/repo": {
    org: "git.somewhere.co.uk",
    user: "user",
    repo: "repo",
    remote: "https://git.somewhere.co.uk/one-1/~two/Three/user/repo",
  },
};
Object.keys(tests).forEach((url) => {
  const testcase = tests[url];
  test(`parseArgument ${url}`, () => {
    const { org, user, repo, remote } = parseArgument(url, { ssh: true });
    assert.deepEqual({ org, user, repo, remote }, testcase);
  });
});

test("parseArgument with ssh=false", () => {
  const { org, user, repo, remote } = parseArgument("amir-s/dev.git", {
    ssh: false,
  });
  assert.deepEqual(
    { org, user, repo, remote },
    {
      org: "github.com",
      user: "amir-s",
      repo: "dev",
      remote: "https://github.com/amir-s/dev.git",
    }
  );
});
