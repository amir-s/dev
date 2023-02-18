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

  test("prefers repo and query to have continues matches", () => {
    const { repo } = findMatch(
      [
        {
          user: "star",
          repo: "aba",
        },
        {
          user: "amir-s",
          repo: "saba",
        },
      ],
      "saba"
    );
    assert.deepEqual({ user: "amir-s", repo: "saba" }, repo);
  });

  test("prefers repo and query to match both repo and user somehow", () => {
    const { repo } = findMatch(
      [
        {
          user: "str-blah",
          repo: "blah-blah",
        },
        {
          user: "str-blah",
          repo: "blah-str-blah",
        },
      ],
      "str"
    );
    assert.deepEqual({ user: "str-blah", repo: "blah-str-blah" }, repo);
  });
});
