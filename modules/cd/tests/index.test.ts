import assert from "assert";
import { findMatch } from "../index.ts";
import { describe, test } from "../../../test.ts";

describe("findMatch", () => {
  test("prefers repo and query to share the first letter", () => {
    const { repo } = findMatch(
      [
        {
          user: "0amir-s",
          repo: "123abc123",
          path: "1",
        },
        {
          user: "amir-s",
          repo: "123abc123",
          path: "2",
        },
      ],
      "a1abc"
    );
    assert.deepEqual({ user: "amir-s", repo: "123abc123", path: "2" }, repo);
  });

  test("prefers repo and query to share the last letter", () => {
    const { repo } = findMatch(
      [
        {
          user: "amir-s",
          repo: "123abc1203",
          path: "1",
        },
        {
          user: "amir-s",
          repo: "123abc1230",
          path: "2",
        },
      ],
      "abc0"
    );
    assert.deepEqual({ user: "amir-s", repo: "123abc1230", path: "2" }, repo);
  });

  test("prefers repo and query to have continues matches", () => {
    const { repo } = findMatch(
      [
        {
          user: "star",
          repo: "aba",
          path: "1",
        },
        {
          user: "amir-s",
          repo: "saba",
          path: "2",
        },
      ],
      "saba"
    );
    assert.deepEqual({ user: "amir-s", repo: "saba", path: "2" }, repo);
  });

  test("prefers repo and query to match both repo and user somehow", () => {
    const { repo } = findMatch(
      [
        {
          user: "str-blah",
          repo: "blah-blah",
          path: "1",
        },
        {
          user: "str-blah",
          repo: "blah-str-blah",
          path: "2",
        },
      ],
      "str"
    );
    assert.deepEqual(
      { user: "str-blah", repo: "blah-str-blah", path: "2" },
      repo
    );
  });
});
