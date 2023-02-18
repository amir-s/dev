import assert from "assert";
import { findMatch } from "../index.mjs";

describe("findMatch", () => {
  test("prefers repo and query to share the first letter", () => {
    const { repo } = findMatch(
      [
        {
          user: "0amir-s",
          repo: "123abc123",
        },
        {
          user: "amir-s",
          repo: "123abc123",
        },
      ],
      "a1abc"
    );
    assert.deepEqual({ user: "amir-s", repo: "123abc123" }, repo);
  });

  test("prefers repo and query to share the last letter", () => {
    const { repo } = findMatch(
      [
        {
          user: "amir-s",
          repo: "123abc1203",
        },
        {
          user: "amir-s",
          repo: "123abc1230",
        },
      ],
      "abc0"
    );
    assert.deepEqual({ user: "amir-s", repo: "123abc1230" }, repo);
  });
});
